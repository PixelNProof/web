import './style.css'

/**
 * Interaction Controller
 */
const initInteractions = () => {
  // 0. Prevent Scroll to Middle on Load
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  // 1. Reveal Animations
  const observerOptions = { threshold: 0.1 };
  const revealElements = document.querySelectorAll('.reveal-up');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));

  // 2. Sticky Nav Scroll Effect
  const nav = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // 3. Mobile Menu Toggle
  const mobileToggles = document.querySelectorAll('.mobile-menu-toggle');
  const mobileNav = document.getElementById('mobileNav');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  mobileToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      if (mobileNav) {
        mobileNav.classList.toggle('active');
        document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
      }
    });
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileToggles.forEach(t => t.classList.remove('active'));
      if (mobileNav) {
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // 4. Contact Form Handling
  const contactForm = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    statusEl.textContent = 'Processing your application...';
    statusEl.style.color = 'var(--text-muted)';

    try {
      // Mock API call to /api/contact
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        statusEl.textContent = 'Application received. Data is being processed.';
        statusEl.style.color = '#10B981'; // Success Green
        contactForm.reset();
        trackEvent('form_submit', { category: 'contact' });
      } else {
        throw new Error('Verification failed');
      }
    } catch (error) {
      statusEl.textContent = 'Transmission error. Please check inputs.';
      statusEl.style.color = '#EF4444'; // Error Red
    }
  });
};

/**
 * Analytics Placeholders
 */
const trackEvent = (name, props) => {
  console.log(`[Analytics] Event: ${name}`, props);
  // window.gtag?.('event', name, props);
  // window.fbq?.('track', name, props);
};

// Global scroll helper
window.scrollToContact = () => {
  document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
};

document.querySelectorAll('button, a').forEach(el => {
  el.addEventListener('click', () => {
    trackEvent('click', { text: el.textContent.trim(), id: el.id });
  });
});

initInteractions();
