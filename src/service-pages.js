const root=document.querySelector('.premium-service');
if(root){
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const doc=root.querySelector('.sp-document-content');
 root.querySelectorAll('[data-sp-lens]').forEach(button=>button.addEventListener('click',()=>{
  root.querySelectorAll('[data-sp-lens]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  doc.querySelector('[data-sp-quote]').textContent=button.dataset.quote;
  doc.querySelector('[data-sp-gap]').textContent=button.dataset.gap;
  doc.querySelector('[data-sp-question]').textContent=button.dataset.question;
  if(!motion.matches)doc.animate([{opacity:.3,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,easing:'ease-out'});
 }));
 const art=root.querySelector('[data-sp-tilt]');let frame;
 art.addEventListener('pointermove',event=>{
  if(motion.matches||event.pointerType!=='mouse')return;
  const rect=art.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;
  cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{art.style.setProperty('--sp-rx',(-y*7).toFixed(2)+'deg');art.style.setProperty('--sp-ry',(x*9).toFixed(2)+'deg')});
 });
 const reset=()=>{cancelAnimationFrame(frame);art.style.removeProperty('--sp-rx');art.style.removeProperty('--sp-ry')};
 art.addEventListener('pointerleave',reset);motion.addEventListener('change',reset);
 if(!motion.matches){
  root.classList.add('sp-motion-ready');
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('sp-awaiting');observer.unobserve(entry.target)}}),{threshold:.1});
  root.querySelectorAll('[data-sp-reveal]').forEach((element,i)=>{if(element.getBoundingClientRect().top>=innerHeight){element.classList.add('sp-awaiting');element.style.transitionDelay=(i%4)*65+'ms';observer.observe(element)}});
  root.querySelector('.sp-hero-copy')?.animate([{opacity:0,transform:'translateY(22px)'},{opacity:1,transform:'translateY(0)'}],{duration:850,easing:'cubic-bezier(.2,.7,.2,1)'});
  art.animate([{opacity:0,translate:'0 24px'},{opacity:1,translate:'0 0'}],{duration:1050,easing:'ease-out'});
 }
}
