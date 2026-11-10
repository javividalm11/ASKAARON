const about=document.querySelector('.about-premium');
if(about){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const expertise={
  construction:{image:'/assets/service-before.png',alt:'A contractor proposal and material samples in a thoughtfully designed home',label:'01 / CONSTRUCTION',heading:'Understand the work.\nNot just the number.',copy:'25+ years in construction. A practical eye for scope, allowances and exclusions.',tags:['Scope','Allowances','Exclusions']},
  facilities:{image:'/assets/interior.jpg',alt:'A furnished living space illustrating the day-to-day use and care of a property',label:'02 / FACILITIES MANAGEMENT',heading:'Think beyond\nthe build.',copy:'Practical questions about maintenance, access and ongoing responsibilities.',tags:['Maintenance','Access','Responsibilities']},
  operations:{image:'/assets/twilight-house.jpg',alt:'A contemporary home and its exterior spaces illuminated at dusk',label:'03 / PROPERTY OPERATIONS',heading:'Your property.\nIn everyday use.',copy:'A day-to-day view of access, coordination and owner responsibilities.',tags:['Daily use','Coordination','Owner responsibilities']},
  projects:{image:'/assets/service-change.png',alt:'Architectural floorplans, a proposed change and project material samples',label:'04 / PROJECT MANAGEMENT',heading:'Scope. Timing.\nNext steps.',copy:'A connected view of scope, timing and responsibilities.',tags:['Scope','Timing','Dependencies']}
 };
 const panel=about.querySelector('.ab-expertise-content');
 const photo=about.querySelector('.ab-expertise-panel>img'),photoCache=new Map();let imageRequest=0,photoAnimation;
 const preparePhoto=src=>{
  if(!photoCache.has(src))photoCache.set(src,new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>img.decode().catch(()=>{}).then(resolve);img.onerror=()=>{photoCache.delete(src);reject(new Error('Image unavailable'))};img.src=src}));
  return photoCache.get(src);
 };
 const preload=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){Object.values(expertise).forEach(item=>preparePhoto(item.image).catch(()=>{}));preload.disconnect()}},{rootMargin:'400px'});preload.observe(photo);
 about.querySelectorAll('[data-ab-view]').forEach(button=>button.addEventListener('click',async()=>{
  const data=expertise[button.dataset.abView];
  const request=++imageRequest;
  about.querySelectorAll('[data-ab-view]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  panel.querySelector('[data-ab-panel-label]').textContent=data.label;
  const heading=panel.querySelector('[data-ab-panel-heading]');heading.textContent='';data.heading.split('\n').forEach((text,index)=>{if(index)heading.append(document.createElement('br'));heading.append(text)});
  panel.querySelector('[data-ab-panel-copy]').textContent=data.copy;
  const tags=panel.querySelector('[data-ab-panel-tags]');tags.textContent='';data.tags.forEach(text=>{const tag=document.createElement('span');tag.textContent=text;tags.append(tag)});
  if(!reduced.matches)panel.animate([{opacity:.3,translate:'0 9px'},{opacity:1,translate:'0 0'}],{duration:350,easing:'ease-out'});
  try{
   await preparePhoto(data.image);
   if(request!==imageRequest)return;
   photoAnimation?.cancel();photo.src=data.image;photo.alt=data.alt;
   if(!reduced.matches)photoAnimation=photo.animate([{opacity:.15},{opacity:1}],{duration:420,easing:'ease-out'});
  }catch{/* Retain the current photograph if the replacement cannot load. */}
 }));
 const portrait=about.querySelector('[data-ab-tilt]');let frame;
 const reset=()=>{cancelAnimationFrame(frame);portrait.style.removeProperty('--ab-rx');portrait.style.removeProperty('--ab-ry')};
 portrait.addEventListener('pointermove',event=>{if(reduced.matches||event.pointerType!=='mouse')return;const rect=portrait.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{portrait.style.setProperty('--ab-rx',(-y*5).toFixed(2)+'deg');portrait.style.setProperty('--ab-ry',(x*7).toFixed(2)+'deg')})});
 portrait.addEventListener('pointerleave',reset);reduced.addEventListener('change',reset);
 if(!reduced.matches){
  about.classList.add('ab-motion-ready');
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('ab-awaiting');observer.unobserve(entry.target)}}),{threshold:.12});
  about.querySelectorAll('[data-ab-reveal]').forEach((element,index)=>{if(element.getBoundingClientRect().top>=innerHeight){element.classList.add('ab-awaiting');element.style.transitionDelay=(index%3)*75+'ms';observer.observe(element)}});
  about.querySelectorAll('.ab-title-line>span').forEach((line,index)=>line.animate([{translate:'0 105%',opacity:0},{translate:'0 0',opacity:1}],{duration:950,delay:index*120,easing:'cubic-bezier(.2,.7,.2,1)',fill:'both'}));
  portrait.animate([{opacity:0,translate:'0 28px'},{opacity:1,translate:'0 0'}],{duration:1100,easing:'ease-out'});
  const number=about.querySelector('[data-ab-count]');const start=performance.now();const tick=now=>{const p=Math.min(1,(now-start)/1400);number.textContent=Math.round(25*(1-(1-p)**3));if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick);
 }
}
