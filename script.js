(() => {
  'use strict';

  const MAILCHIMP_URL = 'https://chimpstatic.com/mcjs-connected/js/users/34174a1bd11cad56c974a1920/847bde1919ae7937546a3d4d7.js';
  const menuToggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.primary-nav');
  const status = document.getElementById('registration-status');
  const registrationSection = document.getElementById('register');
  let statusTimer = null;
  let popupObserver = null;

  const setStatus = (message, { error = false, timeout = 6500 } = {}) => {
    if (!status) return;
    window.clearTimeout(statusTimer);
    status.textContent = message;
    status.classList.toggle('is-error', error);
    status.classList.add('is-visible');
    if (timeout > 0) {
      statusTimer = window.setTimeout(() => status.classList.remove('is-visible', 'is-error'), timeout);
    }
  };

  const closeMenu = () => {
    if (!menuToggle || !navigation) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };

  if (menuToggle && navigation) {
    menuToggle.addEventListener('click', () => {
      const willOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
      menuToggle.setAttribute('aria-expanded', String(willOpen));
      navigation.classList.toggle('is-open', willOpen);
      document.body.classList.toggle('menu-open', willOpen);
    });
    navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
    document.addEventListener('click', (event) => {
      if (navigation.classList.contains('is-open') && !navigation.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
    });
  }

  const popupSelectors = [
    '[id^="PopupSignupForm_"]',
    '[id*="PopupSignupForm"]',
    '.mc-modal',
    '.mc-layout__modalContent',
    '[data-dojo-attach-point="modalContent"]',
    'iframe[src*="mailchimp"]',
    'iframe[src*="list-manage"]',
    'iframe[title*="Mailchimp" i]'
  ];

  const findMailchimpPopup = () => {
    for (const selector of popupSelectors) {
      const element = document.querySelector(selector);
      if (element) return element;
    }
    return null;
  };

  const focusPopup = (popup) => {
    if (!popup) return;
    const focusTarget = popup.matches('iframe') ? popup : popup.querySelector('input, button, select, textarea, a[href]') || popup;
    if (!focusTarget.hasAttribute('tabindex') && focusTarget === popup) focusTarget.setAttribute('tabindex', '-1');
    try { focusTarget.focus({ preventScroll: false }); } catch (_) { focusTarget.focus(); }
  };

  const clearCookie = (name) => {
    const expiry = 'Thu, 01 Jan 1970 00:00:00 GMT';
    const host = window.location.hostname;
    const domainParts = host.split('.');
    const domains = ['', host, `.${host}`];
    if (domainParts.length > 2) domains.push(`.${domainParts.slice(-2).join('.')}`);
    domains.forEach((domain) => {
      const domainPart = domain ? ` domain=${domain};` : '';
      try { document.cookie = `${name}=; expires=${expiry}; path=/;${domainPart} SameSite=Lax`; } catch (_) {}
    });
  };

  const injectMailchimpScript = ({ force = false } = {}) => {
    const currentScripts = [...document.querySelectorAll('script[src*="chimpstatic.com/mcjs-connected"]')];
    if (!force && currentScripts.length > 0) return currentScripts[0];
    if (force) currentScripts.forEach((script) => script.remove());

    const script = document.createElement('script');
    script.async = true;
    script.dataset.mailchimpRegistration = 'true';
    script.src = `${MAILCHIMP_URL}${force ? `?registration=${Date.now()}` : ''}`;
    script.addEventListener('error', () => {
      setStatus('The registration form could not load. Please refresh the page and try again.', { error: true, timeout: 9000 });
    }, { once: true });
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(script, firstScript);
    return script;
  };

  const watchForPopup = () => {
    if (popupObserver) popupObserver.disconnect();
    const existingPopup = findMailchimpPopup();
    if (existingPopup) {
      setStatus('The free registration form is open. Complete it to reserve your seat.', { timeout: 4200 });
      focusPopup(existingPopup);
      return;
    }

    popupObserver = new MutationObserver(() => {
      const popup = findMailchimpPopup();
      if (!popup) return;
      popupObserver.disconnect();
      popupObserver = null;
      setStatus('The free registration form is open. Complete it to reserve your seat.', { timeout: 4200 });
      focusPopup(popup);
    });
    popupObserver.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'aria-hidden'] });

    window.setTimeout(() => {
      if (!popupObserver) return;
      popupObserver.disconnect();
      popupObserver = null;
      if (!findMailchimpPopup()) {
        setStatus('The Mailchimp form did not appear. Please refresh this page and select “Register Now” again.', { error: true, timeout: 9000 });
      }
    }, 8500);
  };

  const requestRegistrationPopup = (event) => {
    if (event) event.preventDefault();
    closeMenu();
    const existingPopup = findMailchimpPopup();
    if (existingPopup) {
      setStatus('The free registration form is open. Complete it to reserve your seat.', { timeout: 4200 });
      focusPopup(existingPopup);
      return;
    }

    clearCookie('MCPopupClosed');
    clearCookie('MCEvilPopupClosed');
    setStatus('Opening the free registration form…', { timeout: 9000 });
    watchForPopup();
    injectMailchimpScript({ force: true });
    window.dispatchEvent(new Event('scroll'));
    document.dispatchEvent(new Event('mousemove'));
    if (registrationSection) registrationSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  document.querySelectorAll('.js-register').forEach((button) => button.addEventListener('click', requestRegistrationPopup));

  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }

  window.openEnoughAlreadyRegistration = requestRegistrationPopup;
})();
