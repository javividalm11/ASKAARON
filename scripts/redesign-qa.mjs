import {spawn} from 'node:child_process';
import {writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const qaDirectory=new URL('../.qa/',import.meta.url);
await mkdir(qaDirectory,{recursive:true});
const browserProfile=fileURLToPath(new URL('browser-profile/',qaDirectory));
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless','--disable-gpu','--no-first-run','--disable-extensions','--remote-debugging-port=9225','--user-data-dir='+browserProfile],{windowsHide:true,stdio:'ignore'});
let ws;const browserErrors=[];
try{
 let tabs;for(let i=0;i<40;i++){try{tabs=await(await fetch('http://localhost:9225/json')).json();if(tabs.some(t=>t.type==='page'))break}catch{}await new Promise(r=>setTimeout(r,200))}
 ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));let id=0;const pending=new Map;
 ws.addEventListener('message',e=>{const d=JSON.parse(e.data);if(d.method==='Runtime.exceptionThrown')browserErrors.push(d.params.exceptionDetails.text);if(d.id){pending.get(d.id)?.(d);pending.delete(d.id)}});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;const timer=setTimeout(()=>reject(Error(method+' timed out')),20000);pending.set(n,d=>{clearTimeout(timer);d.error?reject(Error(JSON.stringify(d.error))):resolve(d.result)});ws.send(JSON.stringify({id:n,method,params}))});
 const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.text+': '+(result.exceptionDetails.exception?.description||''));return result.result.value;};
 await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
 await mkdir(new URL('../.qa/',import.meta.url),{recursive:true});
 for(const[width,height]of[[1920,1080],[1440,1000],[1024,900],[768,900],[390,844],[320,740]]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<761});await send('Page.navigate',{url:'http://localhost:4173/'});await evaluate(`new Promise(resolve=>{if(document.readyState==='complete')return resolve(true);addEventListener('load',()=>resolve(true),{once:true});setTimeout(()=>resolve(false),10000)})`);await evaluate('document.fonts.ready.then(()=>true)');await new Promise(r=>setTimeout(r,200));
  const layout=JSON.parse(await evaluate(`JSON.stringify({width:innerWidth,scroll:document.documentElement.scrollWidth,hero:document.querySelector('.editorial-hero').getBoundingClientRect().toJSON(),copy:document.querySelector('.editorial-hero-copy').getBoundingClientRect().toJSON(),credentials:document.querySelector('.hero-credentials').getBoundingClientRect().toJSON(),stage:document.querySelector('.hero-stage').getBoundingClientRect().toJSON(),form:document.querySelector('#intake').getBoundingClientRect().toJSON(),images:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)})`));
  if(layout.scroll>width)throw Error('Horizontal overflow at '+width+': '+layout.scroll);
  if(width>760&&layout.copy.bottom>layout.credentials.top-8)throw Error('Hero copy overlaps credentials at '+width);
  if(layout.credentials.bottom>layout.hero.bottom)throw Error('Credentials clipped at '+width);
  console.log(width+'px: layout OK; hero '+Math.round(layout.hero.height)+'px');
  if(width===1440){await evaluate(`document.querySelector('[data-open-explainer]').click()`);if(!await evaluate(`document.querySelector('#explainer-dialog').open`))throw Error('Explainer does not open');await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});if(await evaluate(`document.querySelector('#explainer-dialog').open`))throw Error('Explainer does not close');console.log('Explainer opens and closes with Escape');}
  if(width===390){await evaluate(`document.querySelector('.menu').click()`);if(await evaluate(`document.querySelector('.menu').getAttribute('aria-expanded')`)!=='true')throw Error('Mobile menu failed');await evaluate(`document.querySelector('.menu').click()`);console.log('Mobile menu OK');}
  if([1440,390,320].includes(width)){
   if(!await evaluate(`document.querySelector('.site-header .official-logo')?.naturalWidth>0`))throw Error('Official logo missing');
   await evaluate(`document.querySelector('#chat-launcher').click()`);
   if(!await evaluate(`!document.querySelector('#aaron-chat').hidden&&document.activeElement.id==='chat-question'`))throw Error('Chat failed to open or focus');
   const chatRect=JSON.parse(await evaluate(`JSON.stringify(document.querySelector('#aaron-chat').getBoundingClientRect().toJSON())`));
   if(chatRect.top<0||chatRect.right>width||chatRect.bottom>height)throw Error('Chat outside viewport at '+width);
   await evaluate(`document.querySelector('[data-chat-question="What can I upload?"]').click()`);
   if(!await evaluate(`document.querySelector('#chat-log').textContent.includes('20 MB')`))throw Error('Upload quick answer missing');
   await evaluate(`document.querySelector('#chat-question').value='Que archivos puedo subir?';document.querySelector('#chat-compose').requestSubmit()`);
   if(!await evaluate(`document.querySelector('#chat-log').lastElementChild.textContent.includes('5 archivos')`))throw Error('Spanish chat answer missing');
   await evaluate(`document.querySelector('#chat-question').value='<img src=x onerror="window.__chatXss=true">';document.querySelector('#chat-compose').requestSubmit()`);
   if(await evaluate(`!!window.__chatXss||!!document.querySelector('#chat-log img')`))throw Error('Chat did not treat user input as text');
   await evaluate(`while(document.querySelector('#chat-log').children.length>1)document.querySelector('#chat-log').lastElementChild.remove();document.querySelector('[data-chat-question="What can I upload?"]').click()`);await new Promise(r=>setTimeout(r,450));
   const chatShot=await send('Page.captureScreenshot',{captureBeyondViewport:false});await writeFile(new URL('../.qa/chat-'+width+'.png',import.meta.url),Buffer.from(chatShot.data,'base64'));
   await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
   if(!await evaluate(`document.querySelector('#aaron-chat').hidden&&document.activeElement.id==='chat-launcher'`))throw Error('Chat Escape or return focus failed');
   await evaluate(`document.querySelector('#promo-launcher').click()`);
   if(!await evaluate(`!document.querySelector('#consult-promo').hidden`))throw Error('Promo did not open');
   const promoRect=JSON.parse(await evaluate(`JSON.stringify(document.querySelector('#consult-promo').getBoundingClientRect().toJSON())`));if(promoRect.left<0||promoRect.right>width||promoRect.top<0||promoRect.bottom>height)throw Error('Promo outside viewport');
   await new Promise(r=>setTimeout(r,400));
   const promoShot=await send('Page.captureScreenshot',{captureBeyondViewport:false});await writeFile(new URL('../.qa/promo-'+width+'.png',import.meta.url),Buffer.from(promoShot.data,'base64'));
   await evaluate(`document.querySelector('[data-close-promo]').click()`);
   if(!await evaluate(`document.querySelector('#consult-promo').hidden&&sessionStorage.getItem('ask-aaron:promo-dismissed')==='1'`))throw Error('Promo dismissal was not remembered');
   console.log(width+'px: logo, chatbot, Spanish answers, safe message rendering, Escape, promo and dismissal OK');
  }
  if([1440,1024,390].includes(width)){
   const total=await evaluate('document.documentElement.scrollHeight');for(let y=0;y<total;y+=Math.round(height*.7)){await evaluate('window.scrollTo(0,'+y+')');await new Promise(r=>setTimeout(r,90))}await evaluate('window.scrollTo(0,0)');await new Promise(r=>setTimeout(r,700));
   const metrics=await send('Page.getLayoutMetrics');const shot=await send('Page.captureScreenshot',{captureBeyondViewport:true,clip:{x:0,y:0,width:width,height:metrics.cssContentSize.height,scale:1}});await writeFile(new URL('../.qa/editorial-'+width+'.png',import.meta.url),Buffer.from(shot.data,'base64'));
  }
 }
 await evaluate(`sessionStorage.removeItem('ask-aaron:promo-dismissed')`);
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:'http://localhost:4173/services/before-i-sign'});
 await evaluate(`new Promise(resolve=>{if(document.readyState==='complete')return resolve(true);addEventListener('load',()=>resolve(true),{once:true});setTimeout(()=>resolve(false),10000)})`);
 if(!await evaluate(`!!document.querySelector('#chat-launcher')&&!!document.querySelector('#promo-launcher')`))throw Error('Widgets missing on service page');
 await evaluate('window.scrollTo(0,400);document.activeElement?.blur()');await evaluate('new Promise(resolve=>setTimeout(resolve,14500))');
 if(!await evaluate(`!document.querySelector('#consult-promo').hidden`))throw Error('Consultation invitation did not appear after engaged reading');
 await evaluate(`document.querySelector('[data-close-promo]').click()`);
 console.log('Service page widgets and delayed consultation invitation OK');
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await send('Page.navigate',{url:'http://localhost:4173/'});
 await evaluate(`new Promise(resolve=>{if(document.readyState==='complete')return resolve(true);addEventListener('load',()=>resolve(true),{once:true});setTimeout(()=>resolve(false),10000)})`);
 if(!await evaluate(`getComputedStyle(document.querySelector('.marquee-track')).animationName==='none'&&getComputedStyle(document.querySelector('.hero-atmosphere')).display==='none'`))throw Error('Reduced motion preference not respected');
 console.log('Reduced motion preference OK');
 if(browserErrors.length)throw Error(browserErrors.join('; '));console.log('No browser JavaScript exceptions');await send('Browser.close');
}finally{ws?.close();browser.kill()}
