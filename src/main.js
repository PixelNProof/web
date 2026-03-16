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

  revealElements.forEach(el => observer.observe(el));

  // 2. Mobile Menu Toggle
  const mobileToggles = document.querySelectorAll('.mobile-menu-toggle');
  const mobileNav = document.getElementById('mobileNav');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  const hamburgerIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" /></svg>`;
  const closeIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`;

  let isMenuOpen = false;

  const toggleMenu = () => {
    isMenuOpen = !isMenuOpen;
    
    if (mobileNav) {
      if (isMenuOpen) {
        // Open Sequence
        mobileNav.classList.remove('hidden');
        // Small delay to allow display flex to apply before opacity transition
        setTimeout(() => {
          mobileNav.classList.remove('opacity-0');
          mobileNav.classList.add('opacity-100');
        }, 10);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
      } else {
        // Close Sequence
        mobileNav.classList.remove('opacity-100');
        mobileNav.classList.add('opacity-0');
        setTimeout(() => {
          mobileNav.classList.add('hidden');
        }, 500); // match the duration-500 tailwind class
        document.body.style.overflow = '';
      }
    }

    // Update Icon on all toggles
    mobileToggles.forEach(toggle => {
      toggle.innerHTML = isMenuOpen ? closeIcon : hamburgerIcon;
    });
  };

  mobileToggles.forEach(toggle => {
    toggle.addEventListener('click', toggleMenu);
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (isMenuOpen) toggleMenu();
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

