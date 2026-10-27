const consultation = { href: '/#intake', label: 'Start your free consultation' };
const links = {
  sign: { href: '/services/before-i-sign', label: 'Explore Before I Sign' },
  bids: { href: '/services/compare-my-bids', label: 'Explore Compare My Bids' },
  change: { href: '/services/change-order-check', label: 'Explore Change Order Check' },
  about: { href: '/about', label: 'Meet Aaron Barcellona' },
  privacy: { href: '/privacy', label: 'Document handling notice' },
};

// Answers are intentionally grounded in the site's published service details.
// This is a local FAQ guide, with no external AI request or chat persistence.
export function getGuideAnswer(question) {
  const query = String(question).slice(0, 500).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const spanish = /\b(hola|precio|precios|cuanto|cuesta|costo|gratis|gratuita|documentos|archivos|subir|enviar|necesito|servicio|servicios|propuestas|presupuestos|cotizaciones|firmar|cambio|llamada|consulta|cita|como|funciona|puedo|espanol|donde|quien|agendar)\b/.test(query);
  const reply = (english, es, items = [consultation]) => ({ text: spanish ? es : english, links: items.map(item => ({ ...item, label: spanish ? ({ [consultation.label]: 'Solicitar una consulta gratis', [links.sign.label]: 'Ver Before I Sign', [links.bids.label]: 'Ver Compare My Bids', [links.change.label]: 'Ver Change Order Check', [links.about.label]: 'Conocer a Aaron', [links.privacy.label]: 'Aviso sobre documentos' }[item.label] || item.label) : item.label })) });
  if (/\b(cost|costs|pricing|price|prices|fee|fees|charge|charges|pay|precio|precios|cuanto|cuesta|costo|tarifa|cobran)\b|how much/.test(query))
    return reply('The first 15-minute consultation is free. A document review is a separate paid service. Aaron will confirm the review scope and fee before you decide to proceed; review prices are not published on the website.', 'La primera consulta de 15 minutos es gratis. La revision de documentos es un servicio de pago por separado. Aaron confirmara el alcance y el precio antes de que decidas continuar; la web no publica tarifas de revision.');
  if (/\b(compare|comparison|bids|quotes|comparar|comparacion|cotizaciones|presupuestos)\b|two proposals|three proposals|dos propuestas|tres propuestas/.test(query))
    return reply('Compare My Bids is designed for two or three proposals for the same project. Aaron looks at the work, allowances, exclusions, and differences behind the prices so you know which questions to clarify.', 'Compare My Bids sirve para comparar dos o tres propuestas del mismo proyecto. Aaron revisa el alcance, las partidas previstas, las exclusiones y las diferencias detras de los precios para ayudarte a aclarar las preguntas importantes.', [links.bids, consultation]);
  if (/change order|change orders|original scope|orden de cambio|ordenes de cambio|\bcambio\b/.test(query))
    return reply('For a Change Order Check, send the original proposal and written scope together with the proposed change order. Include earlier approved changes or relevant photos if they help explain the situation. Aaron helps you understand what appears to have changed and what to clarify.', 'Para un Change Order Check, envia la propuesta y el alcance originales junto con la orden de cambio propuesta. Puedes incluir cambios ya aprobados o fotos relevantes. Aaron ayuda a entender que parece haber cambiado y que necesitas aclarar.', [links.change, consultation]);
  if (/\b(upload|uploads|file|files|documents|document|photos|plans|archivo|archivos|documentos|subir|enviar)\b/.test(query))
    return reply('The intake form accepts PDF, Word (DOC/DOCX), JPG, PNG, and WebP. You can attach up to 5 files with a combined maximum of 20 MB. Proposals, estimates, written scopes, plans, and photos are welcome. Uploading is optional, and files belong in the intake form rather than this chat.', 'El formulario admite PDF, Word (DOC/DOCX), JPG, PNG y WebP. Puedes adjuntar hasta 5 archivos, con un maximo total de 20 MB: propuestas, presupuestos, alcances, planos o fotos. La carga es opcional. Envia los archivos mediante el formulario, no por este chat.', [consultation, links.privacy]);
  if (/before i sign|before sign|before signing|one proposal|una propuesta|antes de firmar|\bfirmar\b/.test(query))
    return reply('Before I Sign is for a second look at one proposal. Aaron helps you understand the written scope, exclusions, allowances, and unclear language before you commit.', 'Before I Sign es una segunda opinion sobre una propuesta. Aaron ayuda a entender el alcance escrito, las exclusiones, las partidas previstas y el lenguaje ambiguo antes de firmar.', [links.sign, consultation]);
  if (/\b(privacy|private|confidential|security|secure|delete|privacidad|privados|seguro|borrar|eliminar)\b/.test(query))
    return reply('Submitted files are stored privately without public download links. Please remove unrelated sensitive information before uploading and share only documents you are authorized to send. This guide does not upload or save your chat messages. For an access or deletion request, use the intake form and include your submission reference.', 'Los archivos se guardan de forma privada, sin enlaces publicos de descarga. Antes de enviarlos, elimina informacion sensible que no sea necesaria y comparte solo documentos que puedas enviar. Este asistente no carga ni guarda los mensajes del chat. Para solicitar acceso o eliminacion, usa el formulario e indica tu referencia.', [links.privacy, consultation]);
  if (/\b(legal|lawyer|engineer|engineering|inspection|inspector|guarantee|guaranteed|abogado|ingeniero|inspeccion|garantia|licencia)\b/.test(query))
    return reply('Ask Aaron provides a construction second opinion based on the information you submit. It does not replace legal advice, an engineering assessment, or a site inspection, and it does not guarantee contractor performance. For a question specific to your project, request a consultation.', 'Ask Aaron ofrece una segunda opinion sobre construccion basada en la informacion enviada. No sustituye asesoria legal, evaluacion de ingenieria ni inspeccion de obra, y no garantiza el desempeno del contratista. Para una pregunta sobre tu proyecto, solicita una consulta.');
  if (/\b(book|booking|schedule|scheduling|call|consultation|consult|appointment|free|reservar|agendar|llamada|consulta|cita|gratis|gratuita)\b/.test(query))
    return reply('Use the intake form to request your free 15-minute consultation. Share your name, email, service interest, and a short project description. Aaron will follow up by email to confirm a time. Submitting the form requests a call; it does not confirm an appointment.', 'Solicita tu consulta gratuita de 15 minutos mediante el formulario. Comparte tu nombre, correo, servicio de interes y una breve descripcion del proyecto. Aaron dara seguimiento por correo para confirmar un horario. Enviar el formulario solicita la llamada; no confirma una cita.');
  if (/\b(service|services|need|choose|help|servicio|servicios|necesito|elegir|ayuda)\b/.test(query))
    return reply('There are three options: Before I Sign for one proposal, Compare My Bids for two or three proposals, and Change Order Check for an original scope plus a proposed change. If you are unsure, choose “Not sure yet” on the intake form and start with the free call.', 'Hay tres opciones: Before I Sign para una propuesta; Compare My Bids para dos o tres propuestas; y Change Order Check para un alcance original y un cambio propuesto. Si no sabes cual elegir, marca “Not sure yet” en el formulario y empieza con la llamada gratuita.', [links.sign, links.bids, links.change]);
  if (/how (does it|it) work|\b(process|steps|start|funciona|pasos|empezar|comenzar)\b/.test(query))
    return reply('First, tell Aaron about your project using the intake form. Second, upload supporting documents if you are ready. Third, arrange your free 15-minute call. If a paid review is appropriate, Aaron will confirm its scope and fee with you before proceeding.', 'Primero, cuenta a Aaron sobre tu proyecto en el formulario. Segundo, adjunta documentos si los tienes listos. Tercero, acuerda tu llamada gratuita de 15 minutos. Si necesitas una revision de pago, Aaron confirmara el alcance y la tarifa antes de continuar.');
  if (/\b(aaron|experience|background|experiencia|quien)\b|who is/.test(query))
    return reply('Aaron Barcellona has 25+ years of construction experience, along with experience in facilities management, property operations, and project management. Ask Aaron brings that perspective to homeowners before expensive construction decisions.', 'Aaron Barcellona cuenta con mas de 25 anos de experiencia en construccion, ademas de gestion de instalaciones, operaciones de inmuebles y gestion de proyectos. Ask Aaron pone esa perspectiva al servicio de propietarios antes de decisiones costosas.', [links.about, consultation]);
  if (/\b(where|location|area|state|country|countries|email|phone|contact|donde|ciudad|estado|pais|correo|telefono|contacto)\b/.test(query))
    return reply('The intake form is the current way to contact Aaron. Include your project location and your question so he can confirm whether the service is a fit. A phone number and direct booking calendar have not been published yet.', 'El formulario es la forma actual de contactar a Aaron. Incluye la ubicacion de tu proyecto y tu pregunta para que confirme si el servicio es adecuado. Todavia no se ha publicado un telefono ni un calendario de reservas directo.');
  return reply('I can help with service options, document uploads, the free consultation, and how a review works. I’m an automated website guide, not Aaron, and I can’t assess your specific proposal here. For project-specific advice, tell Aaron about your project through the intake form.', 'Puedo explicar los servicios, los archivos admitidos, la consulta gratuita y el proceso de revision. Soy un asistente automatico de la web, no Aaron, y no puedo evaluar tu propuesta aqui. Para orientacion sobre tu proyecto, envia los detalles a Aaron mediante el formulario.');
}

function initExperience() {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const chat = document.getElementById('aaron-chat');
  const launcher = document.getElementById('chat-launcher');
  const closeButton = document.getElementById('chat-close');
  const input = document.getElementById('chat-question');
  const log = document.getElementById('chat-log');
  const promo = document.getElementById('consult-promo');
  const promoLauncher = document.getElementById('promo-launcher');
  const dismissKey = 'ask-aaron:promo-dismissed';
  let dismissed = false, promoReady = false, offered = false, scrollFrame = 0;
  try { dismissed = sessionStorage.getItem(dismissKey) === '1'; } catch { /* Storage may be unavailable; the controls still work. */ }

  function closePromo(remember = false) {
    if (!promo || !promoLauncher) return;
    promo.hidden = true; promoLauncher.hidden = false;
    promoLauncher.setAttribute('aria-expanded', 'false');
    if (remember) { dismissed = true; try { sessionStorage.setItem(dismissKey, '1'); } catch {} }
  }
  function openPromo(moveFocus = false) {
    if (!promo || !promoLauncher || !chat?.hidden || document.querySelector('dialog[open]')) return;
    promo.hidden = false; promoLauncher.hidden = true; offered = true;
    promoLauncher.setAttribute('aria-expanded', 'true');
    if (moveFocus) promo.querySelector('a')?.focus({ preventScroll: true });
  }
  function setChat(open, returnFocus = true) {
    if (!chat || !launcher) return;
    chat.hidden = !open;
    launcher.setAttribute('aria-expanded', String(open));
    launcher.setAttribute('aria-label', open ? 'Close Ask Aaron Guide' : 'Open Ask Aaron Guide');
    document.body.classList.toggle('chat-is-open', open);
    if (open) { closePromo(); input?.focus({ preventScroll: true }); }
    else if (returnFocus) launcher.focus({ preventScroll: true });
  }
  launcher?.addEventListener('click', () => setChat(chat.hidden));
  closeButton?.addEventListener('click', () => setChat(false));
  promoLauncher?.addEventListener('click', () => openPromo(true));
  promo?.querySelector('[data-close-promo]')?.addEventListener('click', () => { closePromo(true); promoLauncher.focus({ preventScroll: true }); });
  promo?.querySelector('[data-promo-cta]')?.addEventListener('click', () => closePromo(true));
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (chat && !chat.hidden) { setChat(false); event.preventDefault(); }
    else if (promo && !promo.hidden) { closePromo(true); promoLauncher.focus({ preventScroll: true }); }
  });

  function addMessage(text, author, answerLinks = []) {
    if (!log) return;
    const bubble = document.createElement('div');
    bubble.className = 'chat-message ' + author;
    if (author === 'assistant') {
      const name = document.createElement('span'); name.className = 'message-author'; name.textContent = 'ASK AARON GUIDE'; bubble.append(name);
    }
    const paragraph = document.createElement('p'); paragraph.textContent = text; bubble.append(paragraph);
    for (const item of answerLinks) {
      const anchor = document.createElement('a'); anchor.className = 'chat-answer-link'; anchor.href = item.href; anchor.textContent = item.label + ' ↗';
      anchor.addEventListener('click', () => setChat(false, false)); bubble.append(anchor);
    }
    log.append(bubble);
    while (log.children.length > 32) log.children[1].remove();
    log.scrollTo({ top: log.scrollHeight, behavior: reduced.matches ? 'instant' : 'smooth' });
  }
  function ask(question) {
    const text = String(question).trim().slice(0, 500);
    if (!text) return;
    addMessage(text, 'visitor');
    const answer = getGuideAnswer(text); addMessage(answer.text, 'assistant', answer.links);
  }
  document.getElementById('chat-compose')?.addEventListener('submit', event => {
    event.preventDefault(); ask(input.value); input.value = ''; input.focus({ preventScroll: true });
  });
  chat?.querySelectorAll('[data-chat-question]').forEach(button => button.addEventListener('click', () => ask(button.dataset.chatQuestion)));
  chat?.querySelector('[data-chat-consultation]')?.addEventListener('click', () => setChat(false, false));
  document.querySelectorAll('[data-open-explainer]').forEach(button => button.addEventListener('click', () => {
    setChat(false, false);
    closePromo();
  }));

  function maybeOffer() {
    if (offered || dismissed || !promoReady || scrollY < 160 || document.hidden || !chat?.hidden || document.querySelector('dialog[open]')) return;
    if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(document.activeElement?.tagName)) return;
    openPromo();
  }
  function updateScroll() {
    scrollFrame = 0;
    const total = document.documentElement.scrollHeight - innerHeight;
    root.style.setProperty('--page-progress', String(total > 0 ? Math.min(1, Math.max(0, scrollY / total)) : 0));
    maybeOffer();
  }
  addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }, { passive: true });
  updateScroll();
  setTimeout(() => { promoReady = true; maybeOffer(); }, 14000);

  if (!reduced.matches) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        const element = entry.target; observer.unobserve(element);
        const goal = Number(element.dataset.count), pad = Number(element.dataset.pad || 0), start = performance.now();
        const tick = now => {
          const progress = Math.min((now - start) / 1100, 1);
          element.textContent = String(Math.round(goal * (1 - Math.pow(1 - progress, 3)))).padStart(pad, '0');
          if (progress < 1 && !reduced.matches) requestAnimationFrame(tick); else element.textContent = String(goal).padStart(pad, '0');
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: .5 });
    document.querySelectorAll('[data-count]').forEach(element => observer.observe(element));
  }
  if (matchMedia('(hover: hover)').matches && !reduced.matches) document.querySelectorAll('.editorial-service-card').forEach(card => {
    let frame = 0, x = 0, y = 0;
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect(); x = event.clientX - rect.left; y = event.clientY - rect.top;
      if (!frame) frame = requestAnimationFrame(() => { card.style.setProperty('--glow-x', x + 'px'); card.style.setProperty('--glow-y', y + 'px'); frame = 0; });
    }, { passive: true });
  });
}

if (typeof document !== 'undefined') initExperience();
