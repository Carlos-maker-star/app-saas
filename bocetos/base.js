/* Pestañas, entradas al scroll, repetir animación, vista móvil */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  function arm(root) {
    $$('[data-stagger]', root).forEach((p) => [...p.children].forEach((c, i) => {
      c.classList.add('rv');
      if (p.dataset.stagger) c.classList.add(...p.dataset.stagger.split(' '));
      c.style.setProperty('--i', i);
    }));
    $$('.rv, .rv-clip', root).forEach((el) => {
      el.classList.add('nt');
      el.classList.remove('in');
      void el.offsetWidth;
      el.classList.remove('nt');
      io.unobserve(el);
      io.observe(el);
    });
    root.dispatchEvent(new CustomEvent('armed'));
  }

  const tabs = $('.tabs');
  if (!tabs) { arm(document.body); return; } /* página sin pestañas (índice) */
  const ind = $('.ind', tabs);
  const btns = $$('.tab', tabs);

  function moverInd(b) {
    ind.style.width = b.offsetWidth + 'px';
    ind.style.transform = `translateX(${b.offsetLeft - 3}px)`;
  }

  function show(id, scroll = true) {
    const b = btns.find((x) => x.dataset.d === id) || btns[0];
    btns.forEach((x) => x.setAttribute('aria-selected', x === b));
    $$('.dsg').forEach((d) => { d.hidden = d.id !== b.dataset.d; });
    moverInd(b);
    history.replaceState(null, '', '#' + b.dataset.d);
    if (scroll) window.scrollTo({ top: 0, behavior: 'instant' });
    arm($('#' + b.dataset.d));
  }

  btns.forEach((b) => b.addEventListener('click', () => show(b.dataset.d)));
  $('#replay')?.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'instant' }); arm($('.dsg:not([hidden])')); });
  $('#vista')?.addEventListener('click', (e) => {
    const m = $('.stage').classList.toggle('m');
    e.currentTarget.textContent = m ? 'Vista: móvil' : 'Vista: escritorio';
    arm($('.dsg:not([hidden])'));
  });
  addEventListener('resize', () => moverInd($('.tab[aria-selected=true]')));
  /* el #a/#b/#c de la URL coincide con el id de cada diseño: evitar que el navegador salte hasta allí */
  addEventListener('load', () => { if (location.hash) window.scrollTo({ top: 0, behavior: 'instant' }); });

  document.fonts?.ready.then(() => show(location.hash.slice(1) || btns[0].dataset.d, false));
  show(location.hash.slice(1) || btns[0].dataset.d, false);

  /* utilidades para los bocetos */
  window.V = {
    $, $$,
    /** interpolación tipo resorte hacia un objetivo (decorativo) */
    resorte(fn, k = 0.12) {
      let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
      const paso = () => {
        x += (tx - x) * k; y += (ty - y) * k;
        fn(x, y);
        raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.1 ? requestAnimationFrame(paso) : 0;
      };
      return (nx, ny) => { tx = nx; ty = ny; if (!raf) raf = requestAnimationFrame(paso); };
    },
    fino: matchMedia('(hover:hover) and (pointer:fine)').matches,
    reducido: matchMedia('(prefers-reduced-motion:reduce)').matches,
  };
})();
