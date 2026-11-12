import{spawn}from'node:child_process';import{writeFile}from'node:fs/promises';import assert from'node:assert/strict';
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless','--disable-gpu','--no-first-run','--remote-debugging-port=9240','--user-data-dir='+process.cwd()+'/.qa/floating-cta-profile'],{windowsHide:true,stdio:'ignore'});let ws;
try{
 let tabs;for(let i=0;i<40;i++){try{tabs=await(await fetch('http://localhost:9240/json')).json();if(tabs.some(tab=>tab.type==='page'))break}catch{}await wait(200)}
 assert.ok(tabs,'Chrome connection');ws=new WebSocket(tabs.find(tab=>tab.type==='page').webSocketDebuggerUrl);await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
 let id=0;const pending=new Map,errors=[];ws.addEventListener('message',event=>{const data=JSON.parse(event.data);if(data.method==='Runtime.exceptionThrown')errors.push(data.params.exceptionDetails.exception?.description||data.params.exceptionDetails.text);if(data.id){pending.get(data.id)?.(data);pending.delete(data.id)}});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id,timer=setTimeout(()=>reject(Error(method+' timed out')),20000);pending.set(n,data=>{clearTimeout(timer);data.error?reject(Error(JSON.stringify(data.error))):resolve(data.result)});ws.send(JSON.stringify({id:n,method,params}))});
 const run=async expression=>{const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description);return result.result.value};
 const load=async path=>{await send('Page.navigate',{url:'http://localhost:4173'+path});await wait(700);await run(`new Promise(resolve=>{if(document.readyState==='complete')return resolve();addEventListener('load',resolve,{once:true});setTimeout(resolve,5000)})`)};
 const visible=()=>run(`!document.querySelector('#floating-consultation').hidden`);
 await send('Page.enable');await send('Page.bringToFront');await send('Runtime.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 if(process.env.CTA_QA_FAST!=='1'){
 await load('/');await run(`['shown','dismissed'].forEach(key=>sessionStorage.setItem('ask-aaron:invitation:'+key,'1'))`);
 await load('/services/before-i-sign');let age=await run('performance.now()');await wait(Math.max(0,19000-age));assert.equal(await visible(),false,'Hidden before 20 seconds');
 age=await run('performance.now()');await wait(Math.max(0,21500-age));assert.equal(await visible(),true,'Visible after 20 seconds despite previous session flags');
 assert.equal(await run(`document.querySelector('[data-floating-consultation-link]').getAttribute('href')`),'/start?service=Before%20I%20Sign');assert.ok(await run(`document.querySelector('#floating-consultation').open&&document.activeElement.matches('.floating-consultation-close')`),'Modal opens with accessible close focus');console.log('Real 20-second delay, old session flags ignored, contextual CTA and modal focus OK');
 await run(`document.querySelector('.floating-consultation-close').click()`);assert.equal(await visible(),false);await wait(1200);assert.equal(await visible(),false,'Stays dismissed on current page');
 }
 // Speed up the 20-second timer only after verifying the real delay above.
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`(()=>{const originalNow=Date.now.bind(Date),originalTimeout=window.setTimeout.bind(window);let offset=0;Date.now=()=>originalNow()+offset;window.setTimeout=(fn,delay,...args)=>delay>=19000&&delay<=20000?originalTimeout(()=>{offset+=20001;fn(...args)},30):originalTimeout(fn,delay,...args)})()`});
 await load('/services/before-i-sign');assert.equal(await visible(),true,'Reload shows invitation again');console.log('Reload displays CTA again after dismissal');
 for(const width of[1440,390,320]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:width<761?740:1000,deviceScaleFactor:1,mobile:width<761});await load('/about');assert.equal(await visible(),true);await wait(650);
  assert.ok(await run(`(()=>{const r=document.querySelector('#floating-consultation').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight})()`),'Popup fits '+width);
  const center=await run(`(()=>{const r=document.querySelector('#floating-consultation').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,viewportWidth:document.documentElement.clientWidth,viewportHeight:innerHeight,transform:getComputedStyle(document.querySelector('#floating-consultation')).transform}})()`);
  assert.ok(Math.abs(center.x+center.width/2-center.viewportWidth/2)<2&&Math.abs(center.y+center.height/2-center.viewportHeight/2)<2,'Modal centered '+width+' '+JSON.stringify(center));
  if([1440,390].includes(width)){const shot=await send('Page.captureScreenshot',{captureBeyondViewport:false});await writeFile('.qa/floating-cta-'+width+'.png',Buffer.from(shot.data,'base64'))}
  await run(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))`);assert.equal(await visible(),false);console.log(width+'px: floating CTA fits, Escape closes');
 }
 await load('/about');assert.equal(await visible(),true);await send('Input.dispatchMouseEvent',{type:'mousePressed',x:5,y:5,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:5,y:5,button:'left',clickCount:1});assert.equal(await visible(),false,'Backdrop closes modal');
 await load('/start');assert.equal(await visible(),false,'No invitation on intake page');
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await load('/about');assert.equal(await visible(),true);assert.equal(await run(`document.querySelector('#floating-consultation').getAnimations().length`),0);assert.deepEqual(errors,[]);console.log('Intake exclusion, reduced motion and browser errors OK');
}finally{ws?.close();browser.kill()}
