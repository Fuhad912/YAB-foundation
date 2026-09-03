// ============================
// NAV: iOS Glassmorphic Pill (Scroll State, Active Indicator, Smooth Scroll)
// ============================
const nav = document.getElementById('nav');
const navLinksContainer = document.getElementById('navLinks');
const navLinks = document.querySelectorAll('.nav-links a[data-nav]');
const sections = document.querySelectorAll('main > section[id]');

function updateNavScrollState() {
  if (window.scrollY > 40) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}
updateNavScrollState();
window.addEventListener('scroll', updateNavScrollState, { passive: true });

// ScrollSpy: highlight active section in iOS pill bar
function updateActiveNavLink() {
  const scrollPos = window.scrollY + 120;
  let currentId = '';

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    if (scrollPos >= top && scrollPos < top + height) {
      currentId = section.getAttribute('id');
    }
  });

  // If scrolled to bottom of page, highlight the last section
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50 && sections.length > 0) {
    currentId = sections[sections.length - 1].getAttribute('id');
  }

  navLinks.forEach(link => {
    const href = link.getAttribute('href').replace('#', '');
    if (href === currentId) {
      if (!link.classList.contains('is-active')) {
        link.classList.add('is-active');
        // On small screens, keep the active pill visible in the horizontal strip
        if (navLinksContainer && navLinksContainer.scrollWidth > navLinksContainer.clientWidth) {
          link.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    } else {
      link.classList.remove('is-active');
    }
  });
}
window.addEventListener('scroll', updateActiveNavLink, { passive: true });
updateActiveNavLink();

// Smooth scrolling with offset for iOS floating pill
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#' || targetId === '') return;
    const targetElement = document.querySelector(targetId);
    if (!targetElement) return;

    e.preventDefault();
    const navOffset = 92;
    const elementPosition = targetElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - navOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  });
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

// ============================
// BANK CARD: "I Have Sent The Money" 3-Second Loader & Appreciation Flow
// ============================
const sentMoneyBtn = document.getElementById('sentMoneyBtn');
const bankContent = document.getElementById('bankContent');
const bankLoader = document.getElementById('bankLoader');
const bankAppreciation = document.getElementById('bankAppreciation');
const bankActionWrap = document.getElementById('bankActionWrap');
const resetBankCardBtn = document.getElementById('resetBankCardBtn');

if (sentMoneyBtn) {
  sentMoneyBtn.addEventListener('click', () => {
    // Hide details content and the action button
    if (bankContent) bankContent.style.display = 'none';
    if (bankActionWrap) bankActionWrap.style.display = 'none';
    
    // Turn card into the loader state
    if (bankLoader) bankLoader.style.display = 'flex';

    // Wait exactly 3 seconds (3000ms), then reveal appreciation message
    setTimeout(() => {
      if (bankLoader) bankLoader.style.display = 'none';
      if (bankAppreciation) {
        bankAppreciation.style.display = 'flex';
      }
    }, 3000);
  });
}

// Option to return back to transfer details if needed
if (resetBankCardBtn) {
  resetBankCardBtn.addEventListener('click', () => {
    if (bankAppreciation) bankAppreciation.style.display = 'none';
    if (bankLoader) bankLoader.style.display = 'none';
    if (bankContent) bankContent.style.display = 'block';
    if (bankActionWrap) bankActionWrap.style.display = 'block';
  });
}