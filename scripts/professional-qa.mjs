import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const directory=new URL('../.qa/professional/',import.meta.url);await mkdir(directory,{recursive:true});
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless','--disable-gpu','--no-first-run','--disable-extensions','--remote-debugging-port=9226','--user-data-dir='+fileURLToPath(new URL('profile/',directory))],{windowsHide:true,stdio:'ignore'});
let ws;
try{
 let tabs;for(let i=0;i<50;i++){try{tabs=await(await fetch('http://localhost:9226/json')).json();if(tabs.some(t=>t.type==='page'))break}catch{}await new Promise(r=>setTimeout(r,200))}
 assert.ok(tabs,'Chrome debugging connection');
 ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));let id=0;const pending=new Map,errors=[];
 ws.addEventListener('message',e=>{const d=JSON.parse(e.data);if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails.exception?.description||d.params.exceptionDetails.text);if(d.id){pending.get(d.id)?.(d);pending.delete(d.id)}});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id,timer=setTimeout(()=>reject(Error(method+' timed out')),15000);pending.set(n,d=>{clearTimeout(timer);d.error?reject(Error(JSON.stringify(d.error))):resolve(d.result)});ws.send(JSON.stringify({id:n,method,params}))});
 const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description);return result.result.value};
 const load=async path=>{await send('Page.navigate',{url:'http://localhost:4173'+path});await new Promise(r=>setTimeout(r,300));await evaluate(`new Promise(r=>{if(document.readyState==='complete')return r();addEventListener('load',r,{once:true});setTimeout(r,5000)})`);await evaluate(`Promise.all([document.fonts.ready,...[...document.images].filter(i=>i.loading!=='lazy').map(i=>i.decode().catch(()=>null))]).then(()=>true)`)};
 await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
 for(const width of [320,390,768,1024,1440,1920]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<761});await load('/');await new Promise(r=>setTimeout(r,1300));
  assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'No overflow at '+width);
  assert.equal(await evaluate(`document.querySelectorAll('main>section').length`),4);
  if(width>760)assert.ok(await evaluate(`(()=>{const line=document.querySelector('#home-title>span:last-child'),range=document.createRange();range.selectNodeContents(line);return range.getBoundingClientRect().right<=document.querySelector('.hero-portrait').getBoundingClientRect().left+2})()`),'Hero headline clears portrait at '+width);
  assert.equal(await evaluate(`[...document.images].filter(i=>i.loading!=='lazy'&&(!i.complete||!i.naturalWidth)).length`),0,'Images loaded');
  await evaluate(`document.querySelector('[data-detail]').click()`);assert.equal(await evaluate(`document.querySelector('[data-detail]').getAttribute('aria-expanded')`),'true');assert.ok(await evaluate(`!document.querySelector('.scope-answer').hidden`));await evaluate(`document.querySelector('[data-detail]').click()`);
  if(width<761){await evaluate(`document.querySelector('.menu').click()`);assert.equal(await evaluate(`document.querySelector('.menu').getAttribute('aria-expanded')`),'true');await evaluate(`document.querySelector('.nav-service-toggle').click()`);assert.equal(await evaluate(`document.querySelector('.nav-service-toggle').getAttribute('aria-expanded')`),'true');await evaluate(`document.querySelector('.menu').click()`);assert.equal(await evaluate(`document.querySelector('.menu').getAttribute('aria-expanded')`),'false');assert.ok(await evaluate(`document.querySelector('.nav-service-panel').hidden`))}
  const total=await evaluate('document.documentElement.scrollHeight');for(let y=0;y<total;y+=700){await evaluate('scrollTo(0,'+y+')');await new Promise(r=>setTimeout(r,35))}
  await evaluate('scrollTo(0,0)');await new Promise(r=>setTimeout(r,300));
  if([390,1440].includes(width)){const metrics=await send('Page.getLayoutMetrics');const screenshot=await send('Page.captureScreenshot',{captureBeyondViewport:true,clip:{x:0,y:0,width,height:metrics.cssContentSize.height,scale:1}});await writeFile(new URL('home-'+width+'.png',directory),Buffer.from(screenshot.data,'base64'))}
  console.log(width+'px: no overflow, images, proposal interaction and navigation OK');
 }
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 for(const path of ['/services/before-i-sign','/services/compare-my-bids','/services/change-order-check','/about','/insights','/start']){await load(path);assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'Subpage overflow: '+path)}
 await load('/insights');await evaluate(`document.querySelector('[data-filter="Videos"]').click()`);assert.equal(await evaluate(`document.querySelectorAll('[data-category]:not([hidden])').length`),0);assert.ok(await evaluate(`!document.querySelector('#no-content').classList.contains('hidden')`));
 await load('/');
 const submission=await evaluate(`(async()=>{const f=document.querySelector('#intake');f.elements.name.value='Local design QA';f.elements.email.value='qa@example.com';f.elements.service.value='Before I Sign';f.elements.message.value='Local QA submission with a proposal attachment.';f.elements.consent.checked=true;const dt=new DataTransfer;dt.items.add(new File(['%PDF-1.4 Local QA'],'qa-proposal.pdf',{type:'application/pdf'}));f.elements.documents.files=dt.files;f.elements.documents.dispatchEvent(new Event('change'));f.requestSubmit();for(let i=0;i<50;i++){await new Promise(r=>setTimeout(r,100));if(f.querySelector('.form-status.success'))return f.querySelector('.form-status').textContent;if(f.querySelector('.form-status.error'))throw Error(f.querySelector('.form-status').textContent)}throw Error('Submission timed out')})()`);
 assert.match(submission,/reference/);console.log('UI intake and PDF upload saved locally; service pages and insights filter OK');
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await load('/');assert.ok(await evaluate(`[...document.querySelectorAll('.word-reveal')].every(s=>s.classList.contains('filled'))`));console.log('Reduced motion OK');
 assert.deepEqual(errors,[]);console.log('No browser JavaScript errors. Screenshots: .qa/professional/');
}finally{ws?.close();browser.kill()}
