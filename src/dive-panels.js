const notesMotion=matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('[data-notes-root]').forEach(root=>{
 const overview=root.querySelector('[data-notes-overview]'),reader=root.querySelector('[data-notes-reader]'),cards=[...root.querySelectorAll('[data-notes-category]')],filters=[...root.querySelectorAll('[data-notes-filter]')],empty=root.querySelector('[data-notes-empty]');
 function filter(category){filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.notesFilter===category)));let count=0;cards.forEach(card=>{card.hidden=category!=='All'&&card.dataset.notesCategory!==category;if(!card.hidden)count++});empty.hidden=count>0}
 filters.forEach(button=>button.addEventListener('click',()=>filter(button.dataset.notesFilter)));root.querySelector('[data-notes-show-all]')?.addEventListener('click',()=>{filter('All');filters[0]?.focus({preventScroll:true})});
 if(!reader)return;let returnLink;
 function reset(){overview.hidden=false;reader.hidden=true;reader.querySelectorAll('[data-note-panel]').forEach(panel=>panel.hidden=true)}
 function scrollToNotes(){root.scrollIntoView({block:'start',behavior:'instant'})}
 root.addEventListener('click',event=>{const link=event.target.closest('[data-note-slug]');if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button>0)return;const panel=[...reader.querySelectorAll('[data-note-panel]')].find(p=>p.dataset.notePanel===link.dataset.noteSlug);if(!panel)return;event.preventDefault();returnLink=link;overview.hidden=true;reader.hidden=false;reader.querySelectorAll('[data-note-panel]').forEach(p=>p.hidden=p!==panel);scrollToNotes();const heading=panel.querySelector('.dive-note-heading h2');heading.tabIndex=-1;heading.focus({preventScroll:true});if(!notesMotion.matches)panel.animate([{opacity:0,translate:'0 15px'},{opacity:1,translate:'0 0'}],{duration:450,easing:'cubic-bezier(.2,.8,.2,1)'})});
 root.querySelector('[data-notes-back]').addEventListener('click',()=>{reset();scrollToNotes();returnLink?.focus({preventScroll:true})});
 const dialog=root.closest('dialog');dialog?.addEventListener('close',reset);dialog?.addEventListener('dive:library-open',reset);
});
