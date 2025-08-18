// ===============================
// script.js (modular + robust)
// ===============================

// -------- Config (edit these) --------
const APP_CONFIG = {
  SKILLS: {
    CLOSE_OTHERS: false,                 
    OPEN_TEXT: 'Hide skills',
    CLOSE_TEXT: 'Show skills'
  },
  CONTACT: {
    OPEN_TEXT: 'Hide Contact Form',
    CLOSE_TEXT: 'Contact Me',
    SCROLL_ON_OPEN: true
  },
  EMAILJS: {
    PUBLIC_KEY: '8qUKN_I-yUcD7gnqX',
    SERVICE_ID: 'service_q6rmq0p',
    TEMPLATE_ID: 'template_edb3vlm'
  }
};

// -------- Utilities --------
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const exists = (...els) => els.every(Boolean);

function setAriaExpanded(btn, expanded) {
  if (btn) btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
}

function safeInit(fn, label) {
  try { fn(); } catch (e) { console.warn(`[Init] ${label} failed:`, e); }
}

// -------- Skills (click-to-reveal clouds) --------
function initSkillsAccordion() {
  const cards = $$('.skill-card');
  if (!cards.length) return;

  cards.forEach(card => {
    const button = $('.skill-toggle', card);
    const panel  = $('.clouds', card);
    const label  = $('.toggle-text', button);

    if (!exists(card, button, panel)) return;

    // initial ARIA state
    setAriaExpanded(button, false);
    panel.style.display = 'none'; // hide initially

    button.addEventListener('click', () => {
      const willOpen = !card.classList.contains('open');

      if (APP_CONFIG.SKILLS.CLOSE_OTHERS) {
        cards.forEach(c => {
          if (c === card) return;
          c.classList.remove('open');
          const b = $('.skill-toggle', c);
          const t = b ? $('.toggle-text', b) : null;
          const p = $('.clouds', c);
          if (p) p.style.display = 'none';
          setAriaExpanded(b, false);
          if (t) t.textContent = APP_CONFIG.SKILLS.CLOSE_TEXT;
        });
      }

      // toggle
      card.classList.toggle('open', willOpen);
      panel.style.display = willOpen ? 'flex' : 'none';
      setAriaExpanded(button, willOpen);
      if (label) {
        label.textContent = willOpen
          ? APP_CONFIG.SKILLS.OPEN_TEXT
          : APP_CONFIG.SKILLS.CLOSE_TEXT;
      }
    });
  });
}

// -------- Contact (inline panel + EmailJS) --------
function initContactInlineForm() {
  const btn    = $('#openForm');
  const panel  = $('#contactPanel');
  const form   = $('#contactForm');
  const status = $('#formStatus');

  if (!exists(btn, panel, form, status)) return;

  // EmailJS init
  if (typeof emailjs !== 'undefined' && APP_CONFIG.EMAILJS.PUBLIC_KEY) {
    emailjs.init(APP_CONFIG.EMAILJS.PUBLIC_KEY);
  }

  // Button toggle
  setAriaExpanded(btn, false);
  btn.addEventListener('click', () => {
    const willOpen = panel.hasAttribute('hidden');

    if (willOpen) {
      panel.removeAttribute('hidden');
      panel.classList.add('open');
      if (APP_CONFIG.CONTACT.SCROLL_ON_OPEN) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      panel.classList.remove('open');
      setTimeout(() => panel.setAttribute('hidden', ''), 350);
    }

    setAriaExpanded(btn, willOpen);
    btn.textContent = willOpen
      ? APP_CONFIG.CONTACT.OPEN_TEXT
      : APP_CONFIG.CONTACT.CLOSE_TEXT;
  });

  // Handle submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    setStatus(status, 'Sending…');

    const payload = {
      name: form.name?.value || '',
      email: form.email?.value || '',
      message: form.message?.value || ''
    };

    if (typeof emailjs === 'undefined') {
      setStatus(status, '❌ Email service not available.', 'err');
      return;
    }

    emailjs
      .send(APP_CONFIG.EMAILJS.SERVICE_ID, APP_CONFIG.EMAILJS.TEMPLATE_ID, payload)
      .then(() => {
        setStatus(status, '✅ Message sent successfully!', 'ok');
        form.reset();
      })
      .catch((err) => {
        console.error('EmailJS error:', err);
        setStatus(status, '❌ Failed to send. Please try again.', 'err');
      });
  });
}

// -------- Download CV Button --------
function initDownloadCvButton() {
  const btn = document.getElementById('downloadCvBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const label = btn.querySelector('.label');
    if (!label) return;

    const originalText = label.textContent;
    label.textContent = 'Downloading…';

    setTimeout(() => {
      label.textContent = originalText;
    }, 2000);
  });
}

// -------- Status Helper --------
function setStatus(el, message, type) {
  if (!el) return;
  el.className = 'form-status' + (type ? ` ${type}` : '');
  el.textContent = message;
}

// -------- Footer year helper --------
function initFooterYear() {
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
}

// -------- Boot --------
document.addEventListener('DOMContentLoaded', () => {
  safeInit(initFooterYear, 'Footer year');
  safeInit(initSkillsAccordion, 'Skills accordion');
  safeInit(initDownloadCvButton, 'Download CV button');
  safeInit(initContactInlineForm, 'Contact inline form');
});
