// ============================
// NAV: scroll state + mobile toggle
// ============================
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const navBackdrop = document.getElementById('navBackdrop');

function updateNavScrollState() {
  if (window.scrollY > 40) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}
updateNavScrollState();
window.addEventListener('scroll', updateNavScrollState, { passive: true });

function openMobileNav() {
  navLinks.classList.add('open');
  navToggle.classList.add('is-open');
  navBackdrop.classList.add('open');
  navToggle.setAttribute('aria-expanded', 'true');
  document.body.classList.add('nav-open');
}

function closeMobileNav() {
  navLinks.classList.remove('open');
  navToggle.classList.remove('is-open');
  navBackdrop.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('nav-open');
}

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.contains('open');
  if (isOpen) {
    closeMobileNav();
  } else {
    openMobileNav();
  }
});

// Close on backdrop tap (tapping outside the menu)
navBackdrop.addEventListener('click', closeMobileNav);

// Close mobile menu after tapping a link
document.querySelectorAll('[data-nav]').forEach(link => {
  link.addEventListener('click', closeMobileNav);
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) {
    closeMobileNav();
  }
});

// Close if the viewport is resized back to desktop while menu is open
window.addEventListener('resize', () => {
  if (window.innerWidth > 860 && navLinks.classList.contains('open')) {
    closeMobileNav();
  }
});

// ============================
// SCROLL REVEAL
// ============================
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// ============================
// COPY TO CLIPBOARD (bank details)
// ============================
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const targetId = btn.getAttribute('data-copy');
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    const text = targetEl.textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // Fallback for older browsers
      const temp = document.createElement('textarea');
      temp.value = text;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
    }

    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove('copied');
    }, 1800);
  });
});

// ============================
// FORMSPREE: Volunteer / Partner form
// ============================
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mrpgbrno';

const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = contactForm.querySelector('.form-submit');
  const btnText = submitBtn.querySelector('.btn-text');
  const originalBtnText = btnText.textContent;

  const data = new FormData(contactForm);

  submitBtn.disabled = true;
  btnText.textContent = 'Sending...';
  formStatus.textContent = '';
  formStatus.className = 'form-status';

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      body: data,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      formStatus.textContent = "Thank you! We've received your message and will be in touch soon.";
      formStatus.className = 'form-status success';
      contactForm.reset();
    } else {
      const result = await response.json();
      if (result && result.errors && result.errors.length > 0) {
        formStatus.textContent = result.errors.map(error => error.message).join(', ');
      } else {
        formStatus.textContent = 'Something went wrong sending your message. Please try WhatsApp or email instead.';
      }
      formStatus.className = 'form-status error';
    }
  } catch (err) {
    console.error('Form submission error:', err);
    formStatus.textContent = 'Network error. Please check your connection or reach us directly via WhatsApp/email.';
    formStatus.className = 'form-status error';
  } finally {
    submitBtn.disabled = false;
    btnText.textContent = originalBtnText;
  }
});