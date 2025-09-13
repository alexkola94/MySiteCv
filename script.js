// ===============================
// Enhanced script.js with all improvements
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
  },
  THEME: {
    STORAGE_KEY: 'preferred-theme',
    DEFAULT: 'light' // 'light' or 'dark'
  },
  LOADING: {
    MIN_DURATION: 1000, // Minimum loading time in ms
    FADE_DURATION: 500
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

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// -------- Theme Management --------
function initThemeToggle() {
  const themeToggle = $('#theme-toggle');
  const themeIcon = $('#theme-icon');
  const body = document.body;

  if (!exists(themeToggle, themeIcon)) return;

  // Load saved theme or use default
  const savedTheme = localStorage.getItem(APP_CONFIG.THEME.STORAGE_KEY) || APP_CONFIG.THEME.DEFAULT;
  applyTheme(savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem(APP_CONFIG.THEME.STORAGE_KEY, newTheme);
  });

  function applyTheme(theme) {
    if (theme === 'dark') {
      body.classList.add('dark-theme');
      themeIcon.className = 'fas fa-sun';
    } else {
      body.classList.remove('dark-theme');
      themeIcon.className = 'fas fa-moon';
    }
  }
}

// -------- Navigation --------
function initNavigation() {
  const navbar = $('#navbar');
  const navToggle = $('#nav-toggle');
  const navMenu = $('#nav-menu');
  const navLinks = $$('.nav-link');

  if (!exists(navbar)) return;

  // Mobile menu toggle
  if (exists(navToggle, navMenu)) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      navToggle.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
      });
    });
  }

  // Scroll effects and active link highlighting
  const handleScroll = debounce(() => {
    // Add scrolled class to navbar
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Highlight active navigation link
    const sections = $$('section[id]');
    const scrollPosition = window.scrollY + 100; // Offset for navbar height

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      const navLink = $(`.nav-link[href="#${sectionId}"]`);

      if (navLink && scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navLinks.forEach(link => link.classList.remove('active'));
        navLink.classList.add('active');
      }
    });
  }, 10);

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Initial call
}

// -------- Loading Screen --------
function initLoadingScreen() {
  const loadingScreen = $('#loading-screen');
  if (!loadingScreen) return;

  const startTime = Date.now();
  
  window.addEventListener('load', () => {
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, APP_CONFIG.LOADING.MIN_DURATION - elapsedTime);
    
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      
      // Remove from DOM after transition
      setTimeout(() => {
        if (loadingScreen.parentNode) {
          loadingScreen.parentNode.removeChild(loadingScreen);
        }
      }, APP_CONFIG.LOADING.FADE_DURATION);
    }, remainingTime);
  });
}

// -------- Scroll Animations --------
function initScrollAnimations() {
  const animatedElements = $$('.animate-on-scroll, .skill-card, .experience-item');
  
  if (!animatedElements.length) return;

  // Add animate-on-scroll class to elements that should animate
  $$('.skill-card, .experience-item').forEach(el => {
    if (!el.classList.contains('animate-on-scroll')) {
      el.classList.add('animate-on-scroll');
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  animatedElements.forEach(el => observer.observe(el));
}

// -------- Back to Top Button --------
function initBackToTop() {
  const backToTopBtn = $('#back-to-top');
  if (!backToTopBtn) return;

  const handleScroll = debounce(() => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }, 100);

  window.addEventListener('scroll', handleScroll);

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
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

    // Initial ARIA state
    setAriaExpanded(button, false);
    panel.style.display = 'none'; // Hide initially

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

      // Toggle with smooth animation
      card.classList.toggle('open', willOpen);
      panel.style.display = willOpen ? 'flex' : 'none';
      setAriaExpanded(button, willOpen);
      if (label) {
        label.textContent = willOpen
          ? APP_CONFIG.SKILLS.OPEN_TEXT
          : APP_CONFIG.SKILLS.CLOSE_TEXT;
      }

      // Smooth scroll to card if opening
      if (willOpen) {
        setTimeout(() => {
          card.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          });
        }, 100);
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
        setTimeout(() => {
          panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
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

  // Enhanced form validation
  const validateForm = () => {
    const name = form.name?.value?.trim();
    const email = form.email?.value?.trim();
    const message = form.message?.value?.trim();
    
    if (!name || name.length < 2) {
      setStatus(status, '❌ Please enter a valid name (at least 2 characters).', 'err');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setStatus(status, '❌ Please enter a valid email address.', 'err');
      return false;
    }
    
    if (!message || message.length < 10) {
      setStatus(status, '❌ Please enter a message (at least 10 characters).', 'err');
      return false;
    }
    
    return true;
  };

  // Handle submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setStatus(status, 'Sending…');
    
    // Disable form during submission
    const submitBtn = form.querySelector('.send-btn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    const payload = {
      name: form.name?.value || '',
      email: form.email?.value || '',
      message: form.message?.value || ''
    };

    if (typeof emailjs === 'undefined') {
      setStatus(status, '❌ Email service not available.', 'err');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      return;
    }

    emailjs
      .send(APP_CONFIG.EMAILJS.SERVICE_ID, APP_CONFIG.EMAILJS.TEMPLATE_ID, payload)
      .then(() => {
        setStatus(status, '✅ Message sent successfully! I\'ll get back to you soon.', 'ok');
        form.reset();
      })
      .catch((err) => {
        console.error('EmailJS error:', err);
        setStatus(status, '❌ Failed to send. Please try again or contact me directly.', 'err');
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      });
  });
}

// -------- Download CV Button --------
function initDownloadCvButton() {
  const btn = $('.download-cv-btn');
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

// -------- Performance Optimization --------
function initPerformanceOptimizations() {
  // Preload critical resources
  const criticalImages = ['1674450168751.jpeg'];
  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = src;
    link.as = 'image';
    document.head.appendChild(link);
  });

  // Lazy load non-critical images
  if ('IntersectionObserver' in window) {
    const lazyImages = $$('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
  }
}

// -------- Accessibility Enhancements --------
function initAccessibilityFeatures() {
  // Skip to main content link
  const skipLink = document.createElement('a');
  skipLink.href = '#home';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'skip-link';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    background: var(--accent-secondary);
    color: white;
    padding: 8px;
    text-decoration: none;
    border-radius: 4px;
    z-index: 10000;
    transition: top 0.3s;
  `;
  
  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '6px';
  });
  
  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });
  
  document.body.insertBefore(skipLink, document.body.firstChild);

  // Enhanced keyboard navigation
  document.addEventListener('keydown', (e) => {
    // ESC key closes mobile menu and contact form
    if (e.key === 'Escape') {
      const navMenu = $('#nav-menu');
      const navToggle = $('#nav-toggle');
      const contactPanel = $('#contactPanel');
      
      if (navMenu?.classList.contains('active')) {
        navMenu.classList.remove('active');
        navToggle?.classList.remove('active');
      }
      
      if (contactPanel && !contactPanel.hasAttribute('hidden')) {
        const btn = $('#openForm');
        btn?.click();
      }
    }
  });
}

// -------- Status Helper --------
function setStatus(el, message, type) {
  if (!el) return;
  el.className = 'form-status' + (type ? ` ${type}` : '');
  el.textContent = message;
  
  // Auto-clear success/error messages after 5 seconds
  if (type === 'ok' || type === 'err') {
    setTimeout(() => {
      el.textContent = '';
      el.className = 'form-status';
    }, 5000);
  }
}

// -------- Footer year helper --------
function initFooterYear() {
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
}

// -------- Error Handling --------
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
  // Could implement error reporting here
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  e.preventDefault();
});

// -------- Animated Code Particles Background --------
function initCodeParticles() {
  const container = $('#code-particles');
  if (!container) return;

  // Your actual tech stack - primary skills appear more often
  const techStack = [
    // Primary skills (appear more frequently)
    { text: 'C#', primary: true },
    { text: 'JavaScript', primary: true },
    { text: '.NET', primary: true },
    { text: 'SQL', primary: true },
    { text: 'HTML5', primary: true },
    { text: 'CSS3', primary: true },
    
    // Secondary skills
    { text: 'Knockout.js', primary: false },
    { text: 'Bootstrap', primary: false },
    { text: 'jQuery', primary: false },
    { text: 'REST API', primary: false },
    { text: 'Git', primary: false },
    { text: 'Visual Studio', primary: false },
    { text: 'Agile', primary: false },
    { text: 'Azure', primary: false },
    { text: 'Node.js', primary: false },
    
    // Code snippets for variety
    { text: 'async/await', primary: false },
    { text: 'LINQ', primary: false },
    { text: '{ }', primary: false },
    { text: '[ ]', primary: false },
    { text: '=>', primary: false },
    { text: 'var', primary: false },
    { text: 'const', primary: false },
    { text: 'function', primary: false }
  ];

  const animations = ['floatUp', 'floatDiagonal', 'floatWave'];
  
  function createParticle() {
    const skill = techStack[Math.floor(Math.random() * techStack.length)];
    const particle = document.createElement('div');
    
    particle.className = `code-particle ${skill.primary ? 'primary-skill' : ''}`;
    particle.textContent = skill.text;
    
    // Random positioning
    particle.style.left = Math.random() * 100 + '%';
    particle.style.fontSize = skill.primary ? '1.4rem' : (1.0 + Math.random() * 0.4) + 'rem';
    
    // Random animation
    const animation = animations[Math.floor(Math.random() * animations.length)];
    const duration = 8 + Math.random() * 12; // 8-20 seconds (faster for testing)
    const delay = Math.random() * 2; // 0-2 seconds delay (shorter for testing)
    
    // Random drift for more natural movement
    const driftX = (Math.random() - 0.5) * 200; // -100px to +100px drift
    particle.style.setProperty('--drift-x', driftX + 'px');
    
    particle.style.animation = `${animation} ${duration}s ${delay}s linear infinite`;
    
    container.appendChild(particle);
    
    // Remove particle after animation completes
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, (duration + delay) * 1000);
  }
  
  function startParticleSystem() {
    // Create initial burst - more particles for immediate visibility
    for (let i = 0; i < 8; i++) {
      setTimeout(() => createParticle(), i * 500);
    }
    
    // Continue creating particles at intervals
    setInterval(() => {
      // Limit number of particles to prevent performance issues
      const currentParticles = container.children.length;
      if (currentParticles < 20) { // Max 20 particles at once
        createParticle();
      }
    }, 1500); // New particle every 1.5 seconds
  }
  
  // Start immediately for testing
  setTimeout(startParticleSystem, 500);
  
  // Pause particles when page is not visible (performance optimization)
  document.addEventListener('visibilitychange', () => {
    const particles = $$('.code-particle');
    particles.forEach(particle => {
      if (document.hidden) {
        particle.style.animationPlayState = 'paused';
      } else {
        particle.style.animationPlayState = 'running';
      }
    });
  });
}

// -------- Boot --------
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initializing enhanced CV website...');
  
  // Core functionality
  safeInit(initFooterYear, 'Footer year');
  safeInit(initThemeToggle, 'Theme toggle');
  safeInit(initLoadingScreen, 'Loading screen');
  safeInit(initNavigation, 'Navigation');
  safeInit(initBackToTop, 'Back to top');
  
  // Content functionality
  safeInit(initSkillsAccordion, 'Skills accordion');
  safeInit(initDownloadCvButton, 'Download CV button');
  safeInit(initContactInlineForm, 'Contact inline form');
  
  // Enhancements
  safeInit(initScrollAnimations, 'Scroll animations');
  safeInit(initPerformanceOptimizations, 'Performance optimizations');
  safeInit(initAccessibilityFeatures, 'Accessibility features');
  safeInit(initCodeParticles, 'Animated code particles');
  
  console.log('✅ Website initialization complete!');
});

// -------- Service Worker Registration (Progressive Web App) --------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Uncomment when you have a service worker file
    // navigator.serviceWorker.register('/sw.js')
    //   .then(registration => console.log('SW registered:', registration))
    //   .catch(error => console.log('SW registration failed:', error));
  });
}