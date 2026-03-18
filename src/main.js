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

  // 4. Strategy Form Handling
  const strategyForm = document.getElementById('strategy-form');
  const successMessage = document.getElementById('success-message');
  
  if (strategyForm) {
    // 4a. Dropdown Shared Logic
    const initDropdown = (triggerId, dropdownId, displayId, inputId = null) => {
      const trigger = document.getElementById(triggerId);
      const dropdown = document.getElementById(dropdownId);
      const display = document.getElementById(displayId);
      const hiddenInput = inputId ? document.getElementById(inputId) : null;

      if (!trigger || !dropdown) return;

      const toggle = (forceClose = false) => {
        const isOpen = !dropdown.classList.contains('hidden');
        if (isOpen || forceClose) {
          dropdown.classList.add('opacity-0', 'translate-y-2');
          trigger.setAttribute('data-open', 'false');
          setTimeout(() => dropdown.classList.add('hidden'), 300);
        } else {
          // Close other dropdowns first
          document.querySelectorAll('[id$="-dropdown"]').forEach(d => {
            if (d.id !== dropdownId) d.classList.add('hidden', 'opacity-0', 'translate-y-2');
          });
          document.querySelectorAll('[id$="-trigger"]').forEach(t => {
            if (t.id !== triggerId) t.setAttribute('data-open', 'false');
          });

          dropdown.classList.remove('hidden');
          trigger.setAttribute('data-open', 'true');
          setTimeout(() => dropdown.classList.remove('opacity-0', 'translate-y-2'), 10);
        }
      };

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggle();
      });

      document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !trigger.contains(e.target)) {
          toggle(true);
        }
      });

      return { trigger, dropdown, display, hiddenInput, toggle };
    };

    // 4b. Services Multi-select
    const services = initDropdown('services-trigger', 'services-dropdown', 'services-display');
    const otherServiceToggle = document.getElementById('service-other-toggle');
    const otherServiceContainer = document.getElementById('other-service-container');
    const checkboxes = services.dropdown.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        const selected = Array.from(checkboxes)
          .filter(c => c.checked)
          .map(c => c.value === 'other' ? 'Other' : c.value);
        
        if (selected.length > 0) {
          services.display.textContent = selected.join(', ');
          services.display.classList.remove('text-white/30', 'italic');
          services.display.classList.add('text-white');
        } else {
          services.display.textContent = 'Primary Services Needed...';
          services.display.classList.add('text-white/30', 'italic');
          services.display.classList.remove('text-white');
        }

        if (otherServiceToggle) {
          if (otherServiceToggle.checked) {
              otherServiceContainer.classList.remove('hidden');
              setTimeout(() => otherServiceContainer.classList.add('opacity-100'), 10);
          } else {
              otherServiceContainer.classList.remove('opacity-100');
              setTimeout(() => otherServiceContainer.classList.add('hidden'), 300);
          }
        }
      });
    });

    // 4c. Budget Single-select
    const budget = initDropdown('budget-trigger', 'budget-dropdown', 'budget-display', 'budget-input');
    const budgetOptions = budget.dropdown.querySelectorAll('.budget-option');

    budgetOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        const val = opt.getAttribute('data-value');
        budget.hiddenInput.value = val;
        budget.display.textContent = val;
        budget.display.classList.remove('text-white/30', 'italic');
        budget.display.classList.add('text-white');
        budget.toggle(true); // Close dropdown
      });
    });
  }

  if (strategyForm) {
    strategyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const statusEl = strategyForm.querySelector('#form-status');
      const submitBtn = strategyForm.querySelector('button[type="submit"]');

      const formData = new FormData(strategyForm);
      const data = {};
      
      formData.forEach((value, key) => {
        if (key === 'services') {
          if (!data[key]) data[key] = [];
          data[key].push(value);
        } else {
          data[key] = value;
        }
      });

      if (statusEl) {
        statusEl.textContent = 'SYNCHRONIZING ROADMAP...';
        statusEl.classList.remove('opacity-0');
        statusEl.style.color = 'var(--accent)';
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
      }

      try {
        const response = await fetch('/api/strategy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const contentType = response.headers.get("content-type");
        let result = {};
        if (contentType && contentType.includes("application/json")) {
            result = await response.json();
        }

        if (response.ok) {
          // Success State
          const formContainer = document.getElementById('form-container');
          const strategyForm = document.getElementById('strategy-form');
          const successMessage = document.getElementById('success-message');
          
          strategyForm.style.opacity = '0';
          setTimeout(() => {
            strategyForm.classList.add('hidden');
            successMessage.classList.remove('hidden');
            setTimeout(() => {
              successMessage.classList.remove('opacity-0', 'translate-y-8');
            }, 50);
            
            // Layout Shift for success
            const roadmapSection = document.getElementById('apply');
            roadmapSection.scrollIntoView({ behavior: 'smooth' });
          }, 500);

        } else {
          // Precise error reporting
          if (result.error === 'DATABASE_FAULT') {
            throw new Error('Database Error. Please run the SQL in Supabase (Check Implementation Plan).');
          }
          throw new Error(result.error || result.details || 'Sync Fault');
        }
      } catch (error) {
        if (statusEl) {
          statusEl.textContent = `CRITICAL: ${error.message.toUpperCase()}`;
          statusEl.style.color = '#EF4444';
          statusEl.classList.remove('opacity-0');
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
        }
      }
    });
  }
};

initInteractions();

