const menuButton = document.querySelector('.menu');
const navigation = document.querySelector('#navigation');

function closeNavigation() {
  navigation?.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Open navigation');
  if (menuButton) menuButton.textContent = '☰';
}

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  menuButton.textContent = open ? '×' : '☰';
  navigation?.classList.toggle('open', open);
});

navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNavigation));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeNavigation();
});

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const form = document.querySelector('#intake');
if (form) {
  const fileInput = form.querySelector('[name=documents]');
  const fileList = document.querySelector('#files');

  fileInput.addEventListener('change', () => {
    fileList.textContent = Array.from(fileInput.files)
      .map(file => `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB`)
      .join(' | ');
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const status = form.querySelector('.form-status');
    const button = form.querySelector('[type=submit]');
    const submitLabel = button.innerHTML;
    const files = Array.from(fileInput.files);
    status.className = 'form-status';

    if (files.length > 5 || files.reduce((total, file) => total + file.size, 0) > 20 * 1024 * 1024) {
      status.textContent = 'Please choose up to 5 files, totaling no more than 20 MB.';
      status.classList.add('error');
      return;
    }

    button.disabled = true;
    button.textContent = 'Sending your request…';
    status.textContent = '';

    try {
      const response = await fetch('/api/intake', { method: 'POST', body: new FormData(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Your request could not be sent. Please try again.');

      form.reset();
      fileList.textContent = '';
      status.classList.add('success');
      status.textContent = `Your request and documents have been received. Your reference is ${result.reference}. Aaron will follow up using the email you provided. Your consultation time will be confirmed with you.`;
      if (result.bookingUrl) {
        const link = document.createElement('a');
        link.href = result.bookingUrl;
        link.textContent = ' Choose your consultation time ↗';
        link.className = 'text-link';
        status.appendChild(link);
      }
    } catch (error) {
      status.textContent = error.message || 'Unable to connect. Please try again.';
      status.classList.add('error');
    } finally {
      button.disabled = false;
      button.innerHTML = submitLabel;
    }
  });
}

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(filter => {
      filter.setAttribute('aria-pressed', String(filter === button));
    });

    let visibleCount = 0;
    document.querySelectorAll('[data-category]').forEach(card => {
      const visible = button.dataset.filter === 'All' || card.dataset.category === button.dataset.filter;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    document.querySelector('#no-content')?.classList.toggle('hidden', visibleCount > 0);
  });
});
