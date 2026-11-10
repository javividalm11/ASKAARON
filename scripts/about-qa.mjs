import{spawn}from'node:child_process';
import{writeFile}from'node:fs/promises';
import assert from'node:assert/strict';
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless','--disable-gpu','--no-first-run','--remote-debugging-port=9238','--user-data-dir='+process.cwd()+'/.qa/about-profile'],{windowsHide:true,stdio:'ignore'});
let ws;
try{
 let tabs;for(let i=0;i<40;i++){try{tabs=await(await fetch('http://localhost:9238/json')).json();if(tabs.some(t=>t.type==='page'))break}catch{}await wait(200)}
 assert.ok(tabs,'Chrome connection');ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
 let id=0;const pending=new Map,errors=[];
 ws.addEventListener('message',event=>{const data=JSON.parse(event.data);if(data.method==='Runtime.exceptionThrown')errors.push(data.params.exceptionDetails.exception?.description||data.params.exceptionDetails.text);if(data.id){pending.get(data.id)?.(data);pending.delete(data.id)}});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id,timer=setTimeout(()=>reject(Error(method+' timed out')),20000);pending.set(n,data=>{clearTimeout(timer);data.error?reject(Error(JSON.stringify(data.error))):resolve(data.result)});ws.send(JSON.stringify({id:n,method,params}))});
 const run=async expression=>{const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description);return result.result.value};
 const load=async()=>{await send('Page.navigate',{url:'http://localhost:4173/about'});await wait(400);await run(`new Promise(resolve=>{if(document.readyState==='complete')return resolve();addEventListener('load',resolve,{once:true});setTimeout(resolve,5000)})`);await run(`document.fonts.ready.then(()=>true)`);await run(`new Promise(resolve=>{const start=performance.now();const check=()=>{if(document.querySelector('[data-ab-count]')?.textContent==='25'||performance.now()-start>5000)return resolve();setTimeout(check,100)};check()})`)};
 const photos={construction:'service-before.png',facilities:'interior.jpg',operations:'twilight-house.jpg',projects:'service-change.png'};
 const expectPhoto=async key=>assert.ok(await run(`new Promise(resolve=>{const start=performance.now();const check=()=>{const image=document.querySelector('.ab-expertise-panel>img');if(image.src.endsWith(${JSON.stringify(photos[key])})&&image.complete&&image.naturalWidth>0)return resolve(true);if(performance.now()-start>5000)return resolve(false);setTimeout(check,50)};check()})`),'Correct photograph for '+key);
 await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
 for(const width of[1920,1440,1024,390,320]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<761});await load();
  assert.ok(await run('document.documentElement.scrollWidth<=innerWidth'),'Overflow at '+width);
  assert.ok(await run(`document.querySelector('.ab-portrait img').naturalWidth>0`));assert.equal(await run(`document.querySelector('[data-ab-count]').textContent`),'25');
  for(const key of['facilities','operations','projects','construction']){await run(`document.querySelector('[data-ab-view="${key}"]').click()`);assert.equal(await run(`document.querySelector('[data-ab-view="${key}"]').getAttribute('aria-pressed')`),'true');assert.equal(await run(`document.querySelectorAll('[data-ab-view][aria-pressed=true]').length`),1);assert.equal(await run(`document.querySelectorAll('[data-ab-panel-tags]>span').length`),3);await expectPhoto(key)}
  await run(`document.querySelector('.ab-role summary').click()`);assert.ok(await run(`document.querySelector('.ab-role details').open`));await run(`document.querySelector('.ab-role summary').click()`);
  if(width===1440){await run(`scrollTo({top:0,behavior:'instant'})`);const point=await run(`(()=>{const r=document.querySelector('[data-ab-tilt]').getBoundingClientRect();return{x:r.left+r.width*.75,y:r.top+70}})()`);await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:point.x,y:point.y});await wait(200);assert.notEqual(await run(`document.querySelector('[data-ab-tilt]').style.getPropertyValue('--ab-ry')`),'');await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:3,y:3})}
  if([1440,390].includes(width)){
   const total=await run('document.documentElement.scrollHeight');for(let y=0;y<total;y+=700){await run('scrollTo({top:'+y+',behavior:"instant"})');await wait(70)}await run('scrollTo({top:0,behavior:"instant"})');await wait(950);
   await run(`Promise.all([...document.images].map(img=>img.decode())).then(()=>true)`);const metrics=await send('Page.getLayoutMetrics');const shot=await send('Page.captureScreenshot',{captureBeyondViewport:true,clip:{x:0,y:0,width,height:metrics.cssContentSize.height,scale:1}});await writeFile('.qa/about-'+width+'.png',Buffer.from(shot.data,'base64'));
  }
  console.log(width+'px: portrait, layout, counter, four matching expertise photos and FAQ OK');
 }
 for(const href of await run(`[...document.querySelectorAll('.ab-service-card,.ab-actions .button,.ab-cta .button')].map(a=>a.getAttribute('href'))`))assert.equal((await fetch('http://localhost:4173'+href)).status,200);
 await run(`['facilities','operations','projects'].forEach(key=>document.querySelector('[data-ab-view="'+key+'"]').click())`);await expectPhoto('projects');
 const schema=await run(`[...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>JSON.parse(s.textContent)).find(s=>s['@type']==='AboutPage')`);assert.equal(schema.mainEntity.name,'Aaron Barcellona');
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await load();assert.ok(await run(`!document.querySelector('.about-premium').classList.contains('ab-motion-ready')`));assert.equal(await run(`getComputedStyle(document.querySelector('[data-ab-tilt]')).transform`),'none');assert.equal(await run(`document.querySelector('[data-ab-count]').textContent`),'25');
 await run(`document.querySelector('[data-ab-view="facilities"]').click()`);await expectPhoto('facilities');assert.equal(await run(`document.querySelector('.ab-expertise-panel>img').getAnimations().length`),0);
 assert.deepEqual(errors,[]);console.log('Rapid image changes, service links, consultation links, schema, reduced motion and browser errors OK');
}finally{ws?.close();browser.kill()}
