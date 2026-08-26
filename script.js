(() => {
  'use strict';

  const runtimeErrors = [];

  window.addEventListener('error', (event) => {
    if (event.message) runtimeErrors.push(event.message);
  });

  window.addEventListener('unhandledrejection', (event) => {
    runtimeErrors.push(String(event.reason || 'Unhandled promise rejection'));
  });

  const revealItems = Array.from(document.querySelectorAll('.reveal'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -7% 0px'
    });

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  function isDisplayed(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
  }

  function runAudit() {
    const pageText = document.body.textContent.replace(/\s+/g, ' ').trim();
    const restricted = [
      ['re', 'fund'].join(''),
      ['money', ' back'].join(''),
      ['money', '-back'].join(''),
      ['cancel', 'lation'].join(''),
      ['guaran', 'tee'].join('')
    ];
    const images = Array.from(document.images);
    const heroPhoto = document.querySelector('.hero__portrait');
    const bioPhoto = document.querySelector('.authority__visual img');
    const bioLogo = document.querySelector('.authority__logo');
    const hrefs = Array.from(document.querySelectorAll('a[href]')).map((link) => link.getAttribute('href'));
    const checks = {
      onePageDocument: document.querySelectorAll('main').length === 1,
      heroPhotoDisplayed: isDisplayed(heroPhoto),
      heroPhotoLoaded: Boolean(heroPhoto?.complete && heroPhoto.naturalWidth > 0),
      bioPhotoDisplayed: isDisplayed(bioPhoto),
      bioPhotoLoaded: Boolean(bioPhoto?.complete && bioPhoto.naturalWidth > 0),
      bioLogoDisplayed: isDisplayed(bioLogo),
      bioLogoLoaded: Boolean(bioLogo?.complete && bioLogo.naturalWidth > 0),
      allImagesLoaded: images.every((image) => image.complete && image.naturalWidth > 0),
      generalAdmissionLink: hrefs.includes('https://buy.stripe.com/eVq6oJbYU2OWg9z8S2g360D'),
      vipLink: hrefs.includes('https://buy.stripe.com/5kQ9AVaUQcpw2iJ1pAg360E'),
      teamLink: hrefs.includes('mailto:katina@robertsonconsults.com'),
      eventDatePresent: pageText.includes('September 16–17, 2026'),
      eventTimePresent: pageText.includes('10:00 AM – 1:00 PM ET'),
      deadlinePresent: pageText.includes('Early-bird pricing ends September 4.'),
      actionPlanPresent: pageText.includes('Ready Now Action Plan™'),
      approvedProofPresent: ['Robin B. — Merck', 'A.A. — Manager, Education Industry', 'Karen C. — Integration Lead, AstraZeneca'].every((name) => pageText.includes(name)),
      restrictedLanguageAbsent: restricted.every((term) => !pageText.toLowerCase().includes(term)),
      oneDarkSection: document.querySelectorAll('.authority').length === 1,
      editorialCardCount: document.querySelectorAll('[class*="card" i]').length === 0,
      restrainedAccent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() === '#0b6875',
      noHorizontalOverflow: document.documentElement.scrollWidth <= window.innerWidth + 2,
      noCapturedRuntimeErrors: runtimeErrors.length === 0
    };

    window.__SOAR_EDITORIAL_AUDIT__ = {
      passed: Object.values(checks).every(Boolean),
      checks,
      runtimeErrors: [...runtimeErrors],
      timestamp: new Date().toISOString()
    };

    document.documentElement.dataset.editorialAudit = window.__SOAR_EDITORIAL_AUDIT__.passed ? 'passed' : 'review';
    console.info('[SOAR] Editorial audit', window.__SOAR_EDITORIAL_AUDIT__);
  }

  if (document.readyState === 'complete') {
    window.setTimeout(runAudit, 300);
  } else {
    window.addEventListener('load', () => window.setTimeout(runAudit, 300), { once: true });
  }

  window.addEventListener('resize', () => window.setTimeout(runAudit, 120), { passive: true });
})();
