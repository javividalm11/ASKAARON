const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const recorder=new URLSearchParams(location.search).get('rec')==='1';
// Keep the native select for form values, validation and the no-JavaScript fallback.
document.querySelectorAll('select[name="service"]').forEach((select,fieldIndex)=>{
 const wrapper=document.createElement('div');wrapper.className='service-select';
 const trigger=document.createElement('button');trigger.type='button';trigger.className='service-select-trigger';
 trigger.setAttribute('role','combobox');trigger.setAttribute('aria-label','Project type');trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-required',String(select.required));
 const value=document.createElement('span');value.className='service-select-value';
 const chevron=document.createElement('span');chevron.className='service-select-chevron';chevron.setAttribute('aria-hidden','true');chevron.textContent='⌄';trigger.append(value,chevron);
 const list=document.createElement('div');list.className='service-select-options';list.id=`service-options-${fieldIndex}`;list.setAttribute('role','listbox');list.setAttribute('aria-label','Project type');list.hidden=true;trigger.setAttribute('aria-controls',list.id);
 const choices=[...select.options].filter(option=>option.value);
 const options=choices.map((choice,index)=>{const option=document.createElement('div');option.className='service-select-option';option.id=`service-option-${fieldIndex}-${index}`;option.setAttribute('role','option');option.textContent=choice.textContent;list.append(option);return option});
 select.after(wrapper);wrapper.append(trigger,list);select.classList.add('enhanced-service-select');select.tabIndex=-1;select.setAttribute('aria-hidden','true');
 let active=0,search='',searchTimer;
 const sync=()=>{value.textContent=select.selectedOptions[0]?.textContent||'Select a service';trigger.classList.toggle('is-placeholder',!select.value);options.forEach((option,i)=>option.setAttribute('aria-selected',String(choices[i].value===select.value)));if(select.value)trigger.removeAttribute('aria-invalid')};
 const highlight=index=>{active=(index+options.length)%options.length;options.forEach((option,i)=>option.classList.toggle('is-highlighted',i===active));trigger.setAttribute('aria-activedescendant',options[active].id);options[active].scrollIntoView({block:'nearest',behavior:'instant'})};
 const close=()=>{list.hidden=true;trigger.setAttribute('aria-expanded','false');trigger.removeAttribute('aria-activedescendant');wrapper.classList.remove('is-open')};
 const open=()=>{list.hidden=false;trigger.setAttribute('aria-expanded','true');wrapper.classList.add('is-open');highlight(Math.max(0,choices.findIndex(choice=>choice.value===select.value)))};
 const choose=index=>{select.value=choices[index].value;select.dispatchEvent(new Event('change',{bubbles:true}));close();trigger.focus({preventScroll:true})};
 trigger.addEventListener('click',event=>{event.preventDefault();list.hidden?open():close()});
 options.forEach((option,index)=>{option.addEventListener('pointerdown',event=>event.preventDefault());option.addEventListener('pointermove',()=>{if(!list.hidden)highlight(index)});option.addEventListener('click',event=>{event.preventDefault();choose(index)})});
 trigger.addEventListener('keydown',event=>{
  if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();const wasOpen=!list.hidden;if(!wasOpen)open();if(event.key==='Home')highlight(0);else if(event.key==='End')highlight(options.length-1);else if(wasOpen)highlight(active+(event.key==='ArrowDown'?1:-1))}
  else if(['Enter',' '].includes(event.key)){event.preventDefault();list.hidden?open():choose(active)}
  else if(event.key==='Escape'){event.preventDefault();close()}
  else if(event.key==='Tab')close();
  else if(event.key.length===1&&!event.ctrlKey&&!event.metaKey&&!event.altKey){event.preventDefault();clearTimeout(searchTimer);search+=event.key.toLowerCase();if(list.hidden)open();const index=choices.findIndex(choice=>choice.textContent.toLowerCase().startsWith(search));if(index>=0)highlight(index);searchTimer=setTimeout(()=>search='',650)}
 });
 document.addEventListener('click',event=>{if(!wrapper.contains(event.target))close()});
 select.addEventListener('change',sync);select.addEventListener('invalid',event=>{event.preventDefault();trigger.setAttribute('aria-invalid','true');trigger.focus();open()});
 select.form?.addEventListener('reset',()=>setTimeout(()=>{sync();close();trigger.removeAttribute('aria-invalid')},0));
 sync();
});
document.querySelectorAll('#navigation a').forEach(a=>a.classList.toggle('is-active',new URL(a.href).pathname===location.pathname&&!a.hash));
const serviceNavigation=document.querySelector('.nav-service-dropdown');
if(serviceNavigation){
 const toggle=serviceNavigation.querySelector('.nav-service-toggle'),panel=serviceNavigation.querySelector('.nav-service-panel');
 const links=[...panel.querySelectorAll('a')];
 const open=()=>{panel.hidden=false;toggle.setAttribute('aria-expanded','true')};
 const close=()=>{panel.hidden=true;toggle.setAttribute('aria-expanded','false')};
 toggle.classList.toggle('is-active',location.pathname.startsWith('/services/'));
 links.forEach(link=>{if(new URL(link.href).pathname===location.pathname)link.setAttribute('aria-current','page');link.addEventListener('click',close)});
 toggle.addEventListener('click',()=>panel.hidden?open():close());
 toggle.addEventListener('keydown',event=>{if(!['ArrowDown','ArrowUp'].includes(event.key))return;event.preventDefault();open();links[event.key==='ArrowDown'?0:links.length-1].focus()});
 serviceNavigation.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden){event.preventDefault();event.stopPropagation();close();toggle.focus()}});
 serviceNavigation.addEventListener('focusout',()=>setTimeout(()=>{if(!serviceNavigation.contains(document.activeElement))close()},0));
 document.addEventListener('click',event=>{if(!serviceNavigation.contains(event.target))close()});
 document.querySelector('.menu')?.addEventListener('click',()=>{if(document.querySelector('.menu').getAttribute('aria-expanded')==='false')close()});
}
document.querySelectorAll('[data-detail]').forEach(button=>button.addEventListener('click',()=>{
 const open=button.getAttribute('aria-expanded')!=='true';
 button.setAttribute('aria-expanded',String(open));
 button.querySelector('span').textContent=open?'−':'+';
 const answer=button.nextElementSibling;answer.textContent=button.dataset.detail;answer.hidden=!open;
}));
const carousel=document.querySelector('.scope-carousel');
if(carousel){
 const track=carousel.querySelector('.scope-track'),viewport=carousel.querySelector('.scope-viewport');
 const slides=[...carousel.querySelectorAll('.scope-slide')];
 const status=carousel.querySelector('[data-carousel-status]');
 let current=0,timer,visible=false;
 const resize=()=>{viewport.style.height=slides[current].getBoundingClientRect().height+'px'};
 const schedule=()=>{
  clearTimeout(timer);
  if(!visible||document.hidden||slides[current].querySelector('[aria-expanded="true"]'))return;
  timer=setTimeout(()=>show(current+1,false),6000);
 };
 const show=(index,manual=true)=>{
  current=(index+slides.length)%slides.length;
  track.style.transform=`translateX(-${current*100}%)`;
  slides.forEach((slide,i)=>{slide.inert=i!==current;slide.setAttribute('aria-hidden',String(i!==current))});
  resize();if(manual)status.textContent=`Example ${current+1} of ${slides.length}: ${slides[current].querySelector('h3').innerText.replace(/\s+/g,' ')}`;
  schedule();
 };
 carousel.addEventListener('click',event=>{if(event.target.closest('[data-detail]')){resize();schedule()}});
 let touch;
 viewport.addEventListener('touchstart',event=>{const point=event.touches[0];touch=event.target.closest('button,a')?null:{x:point.clientX,y:point.clientY};clearTimeout(timer)},{passive:true});
 viewport.addEventListener('touchend',event=>{if(touch){const point=event.changedTouches[0],dx=point.clientX-touch.x,dy=point.clientY-touch.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.4)show(current+(dx<0?1:-1))}touch=null;schedule()},{passive:true});
 viewport.addEventListener('touchcancel',()=>{touch=null;schedule()},{passive:true});
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule()},{threshold:.1});observer.observe(carousel);
 const sizes=new ResizeObserver(resize);slides.forEach(slide=>sizes.observe(slide));
 document.addEventListener('visibilitychange',schedule);show(0,false);
}
const statement=document.querySelector('[data-word-reveal]');
if(statement){
 const words=statement.textContent.trim().split(/\s+/);statement.textContent='';
 words.forEach((word,i)=>{const span=document.createElement('span');span.className='word-reveal';span.textContent=word;statement.append(span);if(i<words.length-1)statement.append(' ')});
 const spans=[...statement.children];let pending=false;
 const fill=()=>{const rect=statement.getBoundingClientRect();const progress=Math.max(0,Math.min(1,(innerHeight*.9-rect.top)/(innerHeight*.55)));spans.forEach((span,i)=>span.classList.toggle('filled',reduced||i/spans.length<progress));pending=false};
 fill();if(!reduced&&!recorder){addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(fill)}},{passive:true});addEventListener('resize',fill)}
 if(recorder&&!reduced)spans.forEach((span,i)=>setTimeout(()=>span.classList.add('filled'),1300+i*110));
}
if(!reduced){
 document.querySelectorAll('.hero-copy h1>span').forEach((line,i)=>line.animate([{opacity:0,transform:'translateY(35px)'},{opacity:1,transform:'translateY(0)'}],{duration:900,delay:i*110,easing:'cubic-bezier(.2,.7,.2,1)',fill:'both'}));
 document.querySelector('.hero-portrait')?.animate([{opacity:0,transform:'translateY(25px)',filter:'blur(5px)'},{opacity:1,transform:'translateY(0)',filter:'blur(0)'}],{duration:1100,easing:'ease-out',fill:'both'});
 const counters=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;counters.unobserve(entry.target);const target=Number(entry.target.dataset.count),start=performance.now();const tick=now=>{const p=Math.min(1,(now-start)/1200);entry.target.textContent=Math.round(target*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)})},{threshold:.6});
 document.querySelectorAll('[data-count]').forEach(el=>counters.observe(el));
}
