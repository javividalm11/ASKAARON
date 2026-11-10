const invitation=document.querySelector('#floating-consultation');
if(invitation&&location.pathname!=='/start'){
 const deadline=Date.now()+20000;
 const closeButton=invitation.querySelector('.floating-consultation-close'),link=invitation.querySelector('[data-floating-consultation-link]');
 const status=document.querySelector('.floating-consultation-status');
 const contextual=document.querySelector('.sp-actions .button')?.getAttribute('href');
 if(contextual?.startsWith('/start?service='))link.href=contextual;
 let timer,previousFocus,shown=false;
 const completed=()=>shown;
 const showWhenReady=()=>{
  clearTimeout(timer);if(completed())return;
  const remaining=deadline-Date.now();if(remaining>0){timer=setTimeout(showWhenReady,remaining);return}
  if(document.hidden||document.activeElement?.matches('input,textarea,select,[role="combobox"],[contenteditable="true"]')||document.querySelector('dialog[open],.menu[aria-expanded="true"]')){timer=setTimeout(showWhenReady,1000);return}
  previousFocus=document.activeElement;shown=true;invitation.hidden=false;invitation.showModal();closeButton.focus({preventScroll:true});
  if(status)status.textContent='You can request a free 15-minute consultation with Aaron using the floating invitation.';
 };
 const dismiss=()=>{const returnFocus=invitation.contains(document.activeElement);if(invitation.open)invitation.close();invitation.hidden=true;if(status)status.textContent='';if(returnFocus&&previousFocus?.isConnected)previousFocus.focus({preventScroll:true})};
 closeButton.addEventListener('click',dismiss);link.addEventListener('click',dismiss);
 invitation.addEventListener('cancel',event=>{event.preventDefault();dismiss()});
 invitation.addEventListener('click',event=>{if(event.target!==invitation)return;const r=invitation.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dismiss()});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!invitation.hidden)dismiss()});
 document.addEventListener('visibilitychange',showWhenReady);
 document.addEventListener('focusout',()=>{if(!completed())setTimeout(showWhenReady,0)});
 document.addEventListener('click',()=>{if(!completed())showWhenReady()});
 addEventListener('scroll',()=>{if(!completed()&&Date.now()>=deadline){clearTimeout(timer);timer=setTimeout(showWhenReady,150)}},{passive:true});
 showWhenReady();
}
