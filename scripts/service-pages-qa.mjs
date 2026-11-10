import{spawn}from'node:child_process';
import{mkdir,writeFile}from'node:fs/promises';
import{fileURLToPath}from'node:url';
import assert from'node:assert/strict';
const folder=new URL('../.qa/service-pages/',import.meta.url);await mkdir(folder,{recursive:true});
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless','--disable-gpu','--no-first-run','--disable-extensions','--remote-debugging-port=9237','--user-data-dir='+fileURLToPath(new URL('profile/',folder))],{windowsHide:true,stdio:'ignore'});
let ws;
try{
 let tabs;for(let i=0;i<40;i++){try{tabs=await(await fetch('http://localhost:9237/json')).json();if(tabs.some(tab=>tab.type==='page'))break}catch{}await wait(200)}
 assert.ok(tabs,'Local Chrome connection');
 ws=new WebSocket(tabs.find(tab=>tab.type==='page').webSocketDebuggerUrl);await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
 let id=0;const pending=new Map,errors=[];
 ws.addEventListener('message',event=>{const data=JSON.parse(event.data);if(data.method==='Runtime.exceptionThrown')errors.push(data.params.exceptionDetails.exception?.description||data.params.exceptionDetails.text);if(data.id){pending.get(data.id)?.(data);pending.delete(data.id)}});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id,timer=setTimeout(()=>reject(Error(method+' timed out')),20000);pending.set(n,data=>{clearTimeout(timer);data.error?reject(Error(JSON.stringify(data.error))):resolve(data.result)});ws.send(JSON.stringify({id:n,method,params}))});
 const run=async expression=>{const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description);return result.result.value};
 const load=async path=>{await send('Page.navigate',{url:'http://localhost:4173'+path});await wait(400);await run(`new Promise(resolve=>{if(document.readyState==='complete')return resolve();addEventListener('load',resolve,{once:true});setTimeout(resolve,5000)})`);await run(`Promise.all([document.fonts.ready,...[...document.images].filter(img=>!img.closest('#floating-consultation')).map(img=>img.decode().catch(()=>null))]).then(()=>true)`);await wait(1100)};
 const screenshot=async name=>{const height=await run('document.documentElement.scrollHeight');for(let top=0;top<height;top+=750){await run('scrollTo(0,'+top+')');await wait(50)}await run('scrollTo(0,0)');await wait(850);const metrics=await send('Page.getLayoutMetrics');const width=await run('innerWidth');const shot=await send('Page.captureScreenshot',{captureBeyondViewport:true,clip:{x:0,y:0,width,height:metrics.cssContentSize.height,scale:1}});await writeFile(new URL(name,folder),Buffer.from(shot.data,'base64'))};
 await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
 const services=[['before-i-sign','Before I Sign'],['compare-my-bids','Compare My Bids'],['change-order-check','Change Order Check']];
 for(const [slug,name]of services){
  for(const width of[1920,1440,1024,390,320]){
   await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<761});await load('/services/'+slug);
   assert.ok(await run('document.documentElement.scrollWidth<=innerWidth'),'Horizontal overflow: '+slug+' '+width);
   assert.equal(await run(`document.querySelectorAll('h1').length`),1);
   assert.equal(await run(`document.querySelectorAll('.sp-coverage-grid article').length`),4);
   assert.ok(await run(`[...document.images].filter(img=>!img.closest('#floating-consultation')).every(img=>img.complete&&img.naturalWidth>0)`),'All service images loaded');
   assert.equal(await run(`document.querySelector('.sp-switcher [aria-current=page]').textContent.includes(${JSON.stringify(name)})`),true);
   const first=await run(`document.querySelector('[data-sp-quote]').textContent`);await run(`document.querySelectorAll('[data-sp-lens]')[1].click()`);assert.notEqual(await run(`document.querySelector('[data-sp-quote]').textContent`),first);assert.equal(await run(`document.querySelectorAll('[data-sp-lens][aria-pressed=true]').length`),1);await run(`document.querySelector('[data-sp-lens]').click()`);
   await run(`document.querySelector('.sp-faq summary').click()`);assert.ok(await run(`document.querySelector('.sp-faq details').open`));await run(`document.querySelector('.sp-faq summary').click()`);
   if(width===1440){await run(`if(document.querySelector('#floating-consultation')?.open)document.querySelector('.floating-consultation-close').click();scrollTo({top:0,behavior:'instant'})`);await wait(100);const point=await run(`(()=>{const r=document.querySelector('[data-sp-tilt]').getBoundingClientRect();return{x:r.left+r.width*.75,y:r.top+60}})()`);await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:point.x,y:point.y});await wait(200);assert.notEqual(await run(`document.querySelector('[data-sp-tilt]').style.getPropertyValue('--sp-ry')`),'');await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:3,y:3})}
   if([1440,390].includes(width))await screenshot(slug+'-'+width+'.png');
   console.log(slug+' '+width+'px: layout, images, example controls, FAQ and navigation OK');
  }
  const schema=await run(`[...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>JSON.parse(s.textContent)).find(s=>s['@type']==='Service')`);assert.equal(schema.name,name);
  const href=await run(`document.querySelector('.sp-actions .button').getAttribute('href')`);await load(href);assert.equal(await run(`document.querySelector('select[name=service]').value`),name);console.log(name+': intake preselection and schema OK');
 }
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await load('/services/before-i-sign');assert.ok(await run(`!document.querySelector('.premium-service').classList.contains('sp-motion-ready')`));assert.equal(await run(`getComputedStyle(document.querySelector('[data-sp-tilt]')).transform`),'none');await run(`document.querySelectorAll('[data-sp-lens]')[2].click()`);assert.equal(await run(`document.querySelectorAll('[data-sp-lens]')[2].getAttribute('aria-pressed')`),'true');
 assert.deepEqual(errors,[]);console.log('Reduced motion, interactive fallback and browser errors OK. Screenshots: .qa/service-pages/');
}finally{ws?.close();browser.kill()}
