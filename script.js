(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.primary-nav');

  const closeMenu = () => {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };

  if (menuButton && navigation) {
    menuButton.addEventListener('click', () => {
      const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(willOpen));
      navigation.classList.toggle('is-open', willOpen);
      document.body.classList.toggle('menu-open', willOpen);
    });

    navigation.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }
})();
