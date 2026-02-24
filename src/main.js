import './style.css'

/**
 * Metric Counter Logic
 */
class MetricCounter {
  constructor(element) {
    this.element = element;
    this.target = parseFloat(element.getAttribute('data-target'));
    this.prefix = element.getAttribute('data-prefix') || '';
    this.suffix = element.getAttribute('data-suffix') || '';
    this.duration = 2000;
    this.hasAnimated = false;
  }

  animate() {
    if (this.hasAnimated) return;
    this.hasAnimated = true;

    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / this.duration, 1);
      const current = progress * this.target;

      // Format for decimals if target is float
      const displayValue = this.target % 1 !== 0
        ? current.toFixed(1)
        : Math.floor(current);

      this.element.textContent = `${this.prefix}${displayValue}${this.suffix}`;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }
}

/**
 * Interaction Controller
 */
const initInteractions = () => {
  // 1. Reveal Animations & Counters
  const observerOptions = { threshold: 0.1 };
  const revealElements = document.querySelectorAll('.reveal-up');
  const metricElements = document.querySelectorAll('.metric-card .value');
  const counters = Array.from(metricElements).map(el => new MetricCounter(el));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');

        // If it's a metric card, start the counter
        if (entry.target.classList.contains('metric-card')) {
          const valueEl = entry.target.querySelector('.value');
          const counter = counters.find(c => c.element === valueEl);
          if (counter) counter.animate();
        }
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

  // 3. Calculator removed
  // 4. Contact Form Handling
  const contactForm = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    statusEl.textContent = 'Engineering your growth audit...';
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
