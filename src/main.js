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

  // 2. Mobile Menu Toggle
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

  // 3. Contact Form Handling (guard: only runs if form is present)
  const contactForm = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      statusEl.textContent = 'Processing your application...';
      statusEl.style.color = '#6B7280';

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          statusEl.textContent = 'Application received. Data is being processed.';
          statusEl.style.color = '#10B981';
          contactForm.reset();
        } else {
          throw new Error('Verification failed');
        }
      } catch (error) {
        statusEl.textContent = 'Transmission error. Please check inputs.';
        statusEl.style.color = '#EF4444';
      }
    });
  }
};

initInteractions();

