// VFSA – Main JS

// ---- Configuration ----
const VFSA_CONFIG = {
  // n8n webhook URLs — update these after creating n8n workflows
  webhooks: {
    contact: 'https://dannygentry.duckdns.org/n8n/webhook/vfsa-contact',
    newsletter: 'https://dannygentry.duckdns.org/n8n/webhook/vfsa-newsletter',
            report: 'https://dannygentry.duckdns.org/n8n/webhook/vfsa-report'
  },
  // Stripe payment links — update these after running stripe-full-setup.sh
  stripe: {
    individual: 'https://buy.stripe.com/test_aFa3cx2SS2Adcjw4XOcs801',
    advocate: 'https://buy.stripe.com/test_4gM9AVdxwa2Fabo61Scs802',
    chapter: 'https://buy.stripe.com/test_7sY7sN2SS6Qt1ESfCscs803',
    district: 'https://buy.stripe.com/test_bJe7sN7981w9fvI1lCcs804',
    organization: 'https://buy.stripe.com/test_6oU6oJbpo1w95V89e4cs805',
    donate: 'https://buy.stripe.com/test_3cI9AVcts8YBcjw8a0cs806'
  }
};

document.addEventListener('DOMContentLoaded', () => {

  // ---- Mobile nav toggle ----
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.nav');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      nav.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', nav.classList.contains('open'));
    });
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => nav.classList.remove('open'));
    });
  }

  // ---- Active nav link ----
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // ---- FAQ Accordion ----
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const answer = item.querySelector('.faq-answer');
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-answer').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // ---- Stat counter animation ----
  const counters = document.querySelectorAll('.stat__number');
  if (counters.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = el.getAttribute('data-count');
          if (!target) return;
          const suffix = el.getAttribute('data-suffix') || '';
          const prefix = el.getAttribute('data-prefix') || '';
          let current = 0;
          const end = parseInt(target, 10);
          const step = Math.ceil(end / 60);
          const timer = setInterval(() => {
            current += step;
            if (current >= end) {
              current = end;
              clearInterval(timer);
            }
            el.textContent = prefix + current.toLocaleString() + suffix;
          }, 20);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.3 });
    counters.forEach(c => observer.observe(c));
  }

  // ---- Smooth scroll for anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ---- Contact form handler ----
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;

      const formData = {
        name: contactForm.querySelector('#name').value,
        email: contactForm.querySelector('#email').value,
        role: contactForm.querySelector('#role').value,
        subject: contactForm.querySelector('#subject').value,
        state: contactForm.querySelector('#state').value,
        message: contactForm.querySelector('#message').value,
        timestamp: new Date().toISOString(),
        source: 'contact-form'
      };

      try {
        const response = await fetch(VFSA_CONFIG.webhooks.contact, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          btn.textContent = 'Message Sent!';
          btn.style.background = '#27ae60';
          contactForm.reset();
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.disabled = false;
          }, 3000);
        } else {
          throw new Error('Server error');
        }
      } catch (err) {
        btn.textContent = 'Error — Try Again';
        btn.style.background = '#C0392B';
        btn.disabled = false;
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
        }, 3000);
      }
    });
  }

  // ---- Newsletter signup handler ----
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      const btn = form.querySelector('button');
      const originalText = btn.textContent;
      btn.textContent = 'Subscribing...';
      btn.disabled = true;

      try {
        const response = await fetch(VFSA_CONFIG.webhooks.newsletter, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: emailInput.value,
            timestamp: new Date().toISOString(),
            source: 'newsletter-signup'
          })
        });

        if (response.ok) {
          btn.textContent = 'Subscribed!';
          btn.style.background = '#27ae60';
          emailInput.value = '';
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.disabled = false;
          }, 3000);
        } else {
          throw new Error('Server error');
        }
      } catch (err) {
        btn.textContent = 'Error — Try Again';
        btn.style.background = '#C0392B';
        btn.disabled = false;
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
        }, 3000);
      }
    });
  });

  // ---- Stripe checkout button handler ----
  document.querySelectorAll('.stripe-checkout').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tier = btn.getAttribute('data-stripe-tier');
      const url = VFSA_CONFIG.stripe[tier];
      if (url && url !== '#') {
        window.location.href = url;
      } else {
        alert('Payment links are being configured. Please check back soon or contact us at membership@violencefreeschools.org');
      }
    });
  });

  // ---- Payment success banner ----
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('payment') === 'success') {
    const tier = urlParams.get('tier') || urlParams.get('type') || 'member';
    const banner = document.createElement('div');
    banner.className = 'payment-success-banner';
    banner.innerHTML = `
      <div class="container" style="display:flex;align-items:center;justify-content:space-between;">
        <span><strong>Welcome to VFSA!</strong> Your ${tier} membership has been confirmed. Check your email for details.</span>
        <button onclick="this.parentElement.parentElement.remove()" style="background:none;border:none;color:white;font-size:1.2rem;cursor:pointer;">&times;</button>
      </div>
    `;
    banner.style.cssText = 'background:#27ae60;color:white;padding:16px 0;position:fixed;top:0;left:0;right:0;z-index:9999;';
    document.body.prepend(banner);
    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);
  }

});

// ---- Incident Report form handler ----
const reportForm = document.getElementById('reportForm');
if (reportForm) {
  reportForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = reportForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Submitting...';
    btn.disabled = true;
    const formData = {
      incidentType: reportForm.querySelector('#incidentType').value,
      schoolLevel: reportForm.querySelector('#schoolLevel').value,
      reporterRole: reportForm.querySelector('#reporterRole').value,
      state: reportForm.querySelector('#reportState').value,
      timeframe: reportForm.querySelector('#timeframe').value,
      outcome: reportForm.querySelector('#outcome').value,
      narrative: reportForm.querySelector('#narrative').value,
      impact: reportForm.querySelector('#impact').value,
      timestamp: new Date().toISOString(),
      source: 'incident-report'
    };
    try {
      const response = await fetch(VFSA_CONFIG.webhooks.report, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        btn.textContent = 'Report Submitted — Thank You';
        btn.style.background = '#27ae60';
        reportForm.reset();
        setTimeout(() => { btn.textContent = originalText; btn.style.background = ''; btn.disabled = false; }, 5000);
      } else { throw new Error('Server error'); }
    } catch (err) {
      btn.textContent = 'Error — Try Again';
      btn.style.background = '#C0392B';
      setTimeout(() => { btn.textContent = originalText; btn.style.background = ''; btn.disabled = false; }, 3000);
    }
  });
}
