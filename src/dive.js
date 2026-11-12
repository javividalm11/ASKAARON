const dive=document.querySelector('.dive-stage');
if(dive){
 const $=s=>dive.querySelector(s),frame=$('.dive-frame'),laptop=$('.dive-laptop'),library=document.querySelector('#dive-library'),contactSection=document.querySelector('#next-step');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const cases=[
  {title:'BEFORE I SIGN',name:'Before I Sign',key:'// before I sign',heading:'Know what<br>you’re buying.',eyebrow:'01 / BEFORE I SIGN',image:'/assets/service-before.png',alt:'A proposal and material samples in a beautifully planned kitchen',note:'Scope. Exclusions. Allowances.',description:'One proposal. A clearer understanding of what’s included, what’s missing, and what to ask.',rows:['ONE PROPOSAL','SCOPE / EXCLUSIONS / ALLOWANCES','ASK AARON / 01'],slug:'before-i-sign'},
  {title:'COMPARE MY BIDS',name:'Compare My Bids',key:'// compare my bids',heading:'Same project.<br>Different prices?',eyebrow:'02 / COMPARE MY BIDS',image:'/assets/service-compare.png',alt:'Construction proposals arranged side by side for comparison',note:'Compare the scope. Then the price.',description:'Two or three bids. See what each contractor is actually offering, side by side.',rows:['TWO OR THREE PROPOSALS','SCOPE / MATERIALS / THE REAL DIFFERENCES','ASK AARON / 02'],slug:'compare-my-bids'},
  {title:'CHANGE ORDER CHECK',name:'Change Order Check',key:'// change order check',heading:'An extra cost.<br>A clear explanation.',eyebrow:'03 / CHANGE ORDER CHECK',image:'/assets/service-change.png',alt:'An original floor plan and a change order on an architectural worktable',note:'What changed? What does it cover?',description:'Original scope. Proposed change. Understand the extra cost before you approve it.',rows:['ORIGINAL SCOPE + PROPOSED CHANGE','ADDED WORK / COST / QUESTIONS TO ASK','ASK AARON / 03'],slug:'change-order-check'}
 ];
 let mode='hero',index=0,busy=false,wheelUntil=0,touch=null,previousFocus;laptop.inert=true;
 const animate=(element,frames,options={})=>{if(!element||motion.matches)return null;return element.animate(frames,{duration:600,easing:'cubic-bezier(.2,.8,.2,1)',...options})};
 const delay=ms=>new Promise(resolve=>setTimeout(resolve,motion.matches?0:ms));
 function fit(){
  const W=innerWidth,H=innerHeight,mobile=W<=820;
  if(mobile){
   const s=W/1440,heroHeight=H/s;frame.style.transform=`scale(${s})`;frame.style.left='0';frame.style.top='0';
   if(mode==='hero'){
    const person=$('.dive-person'),personHeight=H*.65/s;person.style.top=`${heroHeight-personHeight+40}px`;person.style.height=`${personHeight}px`;person.style.width=`${personHeight*.81}px`;person.style.left=`${720-personHeight*.405}px`;
    $('.dive-wordmark').style.top=`${110/s}px`;$('.dive-script').style.top=`${(110+W*.13)/s}px`;$('.dive-script').style.fontSize='202px';
    const badge=$('.dive-badge');badge.style.transform='scale(1.5)';badge.style.left=`${(W-W*.24-20)/s}px`;badge.style.top=`${(120+W*.18)/s-299*1.5}px`;
    const note=$('.dive-hero-note');note.style.top=`${(110+W*.29)/s}px`;note.style.fontSize=`${Math.max(8,W*.021)/s}px`;note.style.left=`${20/s}px`;note.style.maxWidth=`${W*.6/s}px`;
    laptop.style.left='600px';laptop.style.top=`${(H-W*.44-45)/s}px`;laptop.style.width='800px';laptop.style.height='500px';laptop.style.transform='perspective(1400px) rotateY(-10deg) rotateX(4deg) rotateZ(-8deg)';
   }else{
    const descBottom=H<=700?298:335,bottom=H<=700?145:165,available=Math.max(105,H-descBottom-bottom),width=Math.min(W-24,available*1.68),height=width/1.68;
    laptop.style.width=`${width/s}px`;laptop.style.height=`${height/s}px`;laptop.style.left=`${(W-width)/2/s}px`;laptop.style.top=`${(descBottom+(available-height)/2)/s}px`;laptop.style.transform='none';
   }
  }else{
   const s=Math.min(W/1440,H/810),x=(W-1440*s)/2,y=(H-810*s)/2;frame.style.transform=`translate(${x}px,${y}px) scale(${s})`;frame.style.left='0';frame.style.top='0';
   for(const selector of ['.dive-person','.dive-wordmark','.dive-script','.dive-badge','.dive-hero-note'])$(selector).removeAttribute('style');laptop.removeAttribute('style');
   if(mode==='hero'){
    const badge=$('.dive-badge'),card=$('.dive-id'),width=Math.min(W*.19,H*.34,320),scale=width/(230*s),right=30,left=W-right-width;
    const cardHeight=Math.max(card.offsetHeight,350)*s*scale,top=Math.min(H*.36,H-55-cardHeight);
    badge.style.transform=`scale(${scale})`;badge.style.left=`${(left-x)/s-115*(1-scale)}px`;badge.style.top=`${(top-y)/s-299*scale}px`;
    // Keep the whole laptop to the left of the ID sleeve, including its base.
    laptop.style.left=`${Math.min(800,(left-x-35)/s-390)}px`;
   }
  }
 }
 function setBusy(value){busy=value;dive.dataset.busy=String(value)}
 function fill(n){
  index=(n+cases.length)%cases.length;const c=cases[index],number=String(index+1).padStart(2,'0');dive.dataset.service=c.slug;$('[data-dive-screen]').setAttribute('aria-label','Next service');
  $('[data-ticket-title]').textContent=c.title;$('[data-ticket-rows]').replaceChildren(...c.rows.map(text=>{const span=document.createElement('span');span.textContent=text;return span}));
  $('[data-case-key]').textContent=c.key;$('[data-case-description]').textContent=c.description;$('[data-case-count]').textContent=number+' / 03';
  $('[data-case-link]').href='/services/'+c.slug;$('[data-case-cta]').href='/start?service='+encodeURIComponent(c.name);
  $('[data-dive-next]').setAttribute('aria-label',index===2?'Continue to proposal and contact form':'Next service');$('[data-dive-next]').lastElementChild.innerHTML=index===2?'your next<br>step':'next<br>service';
  $('[data-screen-title]').innerHTML=c.heading;$('[data-screen-eyebrow]').textContent=c.eyebrow;$('[data-screen-note]').textContent=c.note;
  const image=$('.dive-screen-image img');image.src=c.image;image.alt=c.alt;
  dive.querySelectorAll('[data-dive-index]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.diveIndex)===index)));
  $('[data-dive-prev]').classList.toggle('dim',index===0);$('[data-dive-status]').textContent=c.name+'. '+c.description;
  const nextImage=new Image();nextImage.src=cases[(index+1)%3].image;
 }
 function caseEntrance(){
  animate($('.dive-ticket'),[{opacity:0,translate:'0 -45px',rotate:'-6deg'},{opacity:1,translate:'0 5px',rotate:'1.5deg',offset:.72},{opacity:1,translate:'0 0',rotate:'0deg'}],{duration:800});
  [...$('.dive-case-description').children].forEach((element,i)=>animate(element,[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{delay:100+i*70}));
  animate($('.dive-flash'),[{opacity:.55},{opacity:0}],{duration:600});
 }
 async function enter(){
  if(busy||library.open)return;if(mode==='case'){await swap(index+1);return}setBusy(true);
  animate($('.dive-wordmark'),[{opacity:1,translate:'0 0'},{opacity:0,translate:'0 -40px'}],{duration:380});
  animate($('.dive-badge'),[{opacity:1,translate:'0 0'},{opacity:0,translate:'0 -90%',rotate:'-6deg'}],{duration:430});
  await delay(280);mode='case';dive.dataset.mode=mode;laptop.inert=false;document.body.classList.add('is-case');$('.dive-home-tag').textContent='Back to Aaron';dive.querySelectorAll('[data-dive-enter]').forEach(b=>b.setAttribute('aria-expanded','true'));fill(0);fit();
  await delay(1200);caseEntrance();await delay(600);setBusy(false);
 }
 async function home(){
  if(busy||library.open)return;if(mode==='hero'){openLibrary('home-title');return}if(mode==='contact')restoreStage();setBusy(true);mode='hero';dive.dataset.mode=mode;laptop.inert=true;document.body.classList.remove('is-case');$('.dive-home-tag').textContent='Meet Ask Aaron';$('[data-dive-screen]').setAttribute('aria-label','Explore the three services');dive.querySelectorAll('[data-dive-enter]').forEach(b=>b.setAttribute('aria-expanded','false'));fit();
  animate($('.dive-person'),[{opacity:0,filter:'blur(7px)'},{opacity:1,filter:'blur(0)'}],{duration:950});
  animate($('.dive-wordmark'),[{opacity:0,translate:'0 40px'},{opacity:1,translate:'0 0'}],{delay:200,duration:700});
  animate($('.dive-badge'),[{translate:'0 -100%',rotate:'6deg'},{translate:'0 0',rotate:'-2deg',offset:.75},{translate:'0 0',rotate:'0deg'}],{duration:1100});await delay(1200);setBusy(false);
 }
 async function swap(n){
  if(busy||library.open)return;if(n<0){await home();return}if(n>=cases.length){await openContact();return}setBusy(true);
  animate($('.dive-ticket'),[{opacity:1,translate:'0 0'},{opacity:0,translate:'0 -30px',rotate:'4deg'}],{duration:280});animate($('.dive-screen-image'),[{opacity:1},{opacity:.1}],{duration:250});await delay(260);fill(n);caseEntrance();animate($('.dive-screen-image img'),[{opacity:0,transform:'scale(1.04)'},{opacity:1,transform:'scale(1)'}],{duration:500});await delay(520);setBusy(false);
 }
 async function openContact(target='next-step'){
  if(busy)return;if(mode==='contact'){document.getElementById(target)?.scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'start'});return}if(library.open)library.close();const wasCase=mode==='case';setBusy(true);mode='contact';dive.dataset.mode=mode;dive.inert=true;laptop.inert=true;contactSection.hidden=false;document.body.classList.add('dive-flow');document.body.classList.remove('is-case');
  const select=document.querySelector('#intake select[name=service]');if(wasCase&&select&&!select.value){select.value=cases[index].name;select.dispatchEvent(new Event('change',{bubbles:true}))}
  scrollTo({top:0,behavior:'instant'});if(target!=='next-step')document.getElementById(target)?.scrollIntoView({behavior:'instant',block:'start'});
  document.querySelector('#next-step-title').focus({preventScroll:true});animate(contactSection,[{opacity:0,translate:'0 45px'},{opacity:1,translate:'0 0'}],{duration:850});await delay(850);setBusy(false);
 }
 function restoreStage(){document.body.classList.remove('dive-flow');contactSection.hidden=true;dive.inert=false;scrollTo({top:0,behavior:'instant'});if(['#intake','#contact','#next-step'].includes(location.hash))history.replaceState(null,'',location.pathname+location.search)}
 async function returnToServices(){if(busy)return;setBusy(true);restoreStage();mode='case';dive.dataset.mode=mode;laptop.inert=false;document.body.classList.add('is-case');$('.dive-home-tag').textContent='Back to Aaron';fill(index);fit();await delay(850);setBusy(false);$('[data-dive-prev]').focus({preventScroll:true})}
 function openLibrary(target){
  if(target&&contactSection.contains(document.getElementById(target))){openContact(target);return}
  const notes=!!document.getElementById(target)?.closest('[data-notes-root]');library.dataset.view=notes?'notes':'full';library.querySelector('#dive-library-title').textContent=notes?'ASK AARON / FIELD NOTES':'ASK AARON / THE FULL PICTURE';library.dispatchEvent(new CustomEvent('dive:library-open'));
  if(!library.open){previousFocus=document.activeElement;library.showModal();animate(library,[{opacity:0,transform:'translateY(18px) scale(.985)'},{opacity:1,transform:'none'}],{duration:450})}
  if(target)requestAnimationFrame(()=>target==='home-title'?library.scrollTo({top:0,behavior:'instant'}):document.getElementById(target)?.scrollIntoView({behavior:'instant',block:'start'}));
 }
 function closeLibrary(){library.close();if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});if(location.hash)history.replaceState(null,'',location.pathname+location.search)}
 dive.querySelectorAll('[data-dive-enter]').forEach(b=>b.addEventListener('click',enter));dive.querySelectorAll('[data-dive-home]').forEach(b=>b.addEventListener('click',event=>{event.preventDefault();home()}));
 $('[data-dive-screen]').addEventListener('click',()=>mode==='hero'?enter():swap(index+1));$('[data-dive-prev]').addEventListener('click',()=>swap(index-1));$('[data-dive-next]').addEventListener('click',()=>swap(index+1));
 dive.querySelectorAll('[data-dive-index]').forEach(b=>b.addEventListener('click',()=>{if(Number(b.dataset.diveIndex)!==index)swap(Number(b.dataset.diveIndex))}));
 $('[data-dive-library]').addEventListener('click',()=>openLibrary('the-problem'));library.querySelector('[data-dive-close]').addEventListener('click',closeLibrary);library.addEventListener('cancel',event=>{event.preventDefault();closeLibrary()});
 library.addEventListener('keydown',event=>{if(event.key==='Escape'&&!event.defaultPrevented){event.preventDefault();event.stopPropagation();closeLibrary()}});
 contactSection.querySelector('[data-dive-return-services]').addEventListener('click',returnToServices);
 $('[data-case-cta]').addEventListener('click',event=>{event.preventDefault();openContact('intake')});
 document.addEventListener('click',event=>{const link=event.target.closest('a[href="/insights"]');if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button>0)return;event.preventDefault();openLibrary('insights')});
 library.addEventListener('click',event=>{if(event.target===library){const r=library.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeLibrary()}});
 document.addEventListener('click',event=>{const link=event.target.closest('a[href^="#"]');if(!link||!document.getElementById(link.hash.slice(1)))return;event.preventDefault();if(link.hash==='#main'){if(library.open)closeLibrary();if(mode!=='hero')home();return}openLibrary(decodeURIComponent(link.hash.slice(1)))});
 const blocked=()=>library.open||document.querySelector('dialog[open]')||document.activeElement?.matches('input,textarea,select,[contenteditable=true]');
 addEventListener('wheel',event=>{if(blocked()||event.ctrlKey)return;if(mode==='contact'){if(scrollY<=1&&event.deltaY<-18&&!busy&&performance.now()>=wheelUntil){event.preventDefault();wheelUntil=performance.now()+1000;returnToServices()}return}event.preventDefault();if(Math.abs(event.deltaY)<18||busy||performance.now()<wheelUntil)return;wheelUntil=performance.now()+1000;if(mode==='hero'){if(event.deltaY>0)enter()}else swap(index+(event.deltaY>0?1:-1))},{passive:false});
 addEventListener('keydown',event=>{if(blocked()||event.ctrlKey||event.metaKey||event.altKey||document.activeElement?.matches('button,a,[role=combobox]'))return;if(mode==='contact'){if(scrollY<=1&&['ArrowUp','PageUp'].includes(event.key)){event.preventDefault();returnToServices()}return}if(['ArrowDown','ArrowRight','PageDown',' '].includes(event.key)){event.preventDefault();mode==='hero'?enter():swap(index+1)}else if(['ArrowUp','ArrowLeft','PageUp'].includes(event.key)&&mode==='case'){event.preventDefault();swap(index-1)}else if(event.key==='Escape'&&mode==='case'){home()}});
 let contactTouch;contactSection.addEventListener('touchstart',event=>{contactTouch=scrollY<=1&&!event.target.closest('input,textarea,select,button,a,[role=combobox]')?event.changedTouches[0].clientY:null},{passive:true});contactSection.addEventListener('touchend',event=>{if(contactTouch!==null&&scrollY<=1&&event.changedTouches[0].clientY-contactTouch>65)returnToServices();contactTouch=null},{passive:true});
 dive.addEventListener('touchstart',event=>{if(blocked())return;touch={x:event.changedTouches[0].clientX,y:event.changedTouches[0].clientY}},{passive:true});
 dive.addEventListener('touchend',event=>{if(!touch||blocked())return;const dx=event.changedTouches[0].clientX-touch.x,dy=event.changedTouches[0].clientY-touch.y;touch=null;if(Math.max(Math.abs(dx),Math.abs(dy))<40)return;const forward=Math.abs(dy)>Math.abs(dx)?dy<0:dx<0;if(mode==='hero'){if(forward)enter()}else swap(index+(forward?1:-1))},{passive:true});
 let pointerFrame;dive.addEventListener('pointermove',event=>{if(mode!=='hero'||busy||motion.matches||event.pointerType!=='mouse')return;cancelAnimationFrame(pointerFrame);pointerFrame=requestAnimationFrame(()=>{frame.style.setProperty('--fx',((event.clientX/innerWidth-.5)*7)+'px');frame.style.setProperty('--fy',((event.clientY/innerHeight-.5)*4)+'px')})});
 const badge=$('.dive-badge');let sway;function startSway(){if(motion.matches)return;sway=badge.animate([{rotate:'-1.1deg'},{rotate:'1.1deg'}],{duration:3200,iterations:Infinity,direction:'alternate',easing:'ease-in-out'})}
 badge.addEventListener('pointerenter',()=>{if(mode==='hero'&&!motion.matches)animate(badge,[{rotate:'0deg'},{rotate:'-6deg'},{rotate:'4deg'},{rotate:'-2deg'},{rotate:'0deg'}],{duration:1400,easing:'ease-out',composite:'add'})});
 let entered=false;function entrance(){if(entered)return;entered=true;dive.classList.add('dive-ready');dive.querySelectorAll('.dive-tag').forEach((element,i)=>animate(element,[{opacity:0,translate:'0 -40px',rotate:'-4deg'},{opacity:1,translate:'0 0',rotate:'0deg'}],{duration:700,delay:120+i*80,easing:'cubic-bezier(.3,1.5,.5,1)'}));animate($('.dive-wordmark'),[{opacity:0,translate:'0 60px',clipPath:'inset(100% 0 0 0)'},{opacity:1,translate:'0 0',clipPath:'inset(0)'}],{duration:1100,delay:260});animate($('.dive-script'),[{opacity:0,clipPath:'inset(0 100% 0 0)'},{opacity:1,clipPath:'inset(0)'}],{duration:900,delay:1050});const drop=animate(badge,[{opacity:0,translate:'0 -110%',rotate:'8deg'},{opacity:1,translate:'0 0',rotate:'-3deg',offset:.65},{rotate:'1.6deg',offset:.85},{rotate:'0deg'}],{duration:1500,delay:700});if(drop)drop.finished.then(startSway).catch(()=>{});animate($('.dive-hint'),[{opacity:0},{opacity:.85}],{duration:600,delay:1800})}
 fit();addEventListener('resize',fit);motion.addEventListener('change',()=>{if(motion.matches){sway?.cancel();dive.getAnimations({subtree:true}).forEach(a=>a.cancel())}fit()});
 Promise.race([Promise.all([document.fonts.ready,$('.dive-person img').decode().catch(()=>{})]),delay(2500)]).then(()=>requestAnimationFrame(()=>{fit();entrance()}));setTimeout(entrance,4000);
 if(location.hash&&document.getElementById(decodeURIComponent(location.hash.slice(1))))openLibrary(decodeURIComponent(location.hash.slice(1)));
 addEventListener('hashchange',()=>{if(location.hash)openLibrary(decodeURIComponent(location.hash.slice(1)))});
}
