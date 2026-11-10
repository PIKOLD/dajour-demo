/* D'ajour — общие ссылки, иконки мессенджеров и анимация появления для всех вариантов */
const LINKS = {
  wa: 'https://wa.me/message/ZLAVOFXOAT5RB1',
  tg: 'https://t.me/dajours',
  max: 'https://max.ru/id590848968086_biz',
  vk: 'https://vk.com/djr_salon',
  ig: 'https://www.instagram.com/d.ajour_/',
  tel: 'tel:+79526564484',
  book: 'https://app.arnica.pro/booking/booking?orgid=44585#/main',
  map: 'https://yandex.ru/maps/org/d_ajour/77986565087/',
  school: 'https://dajour.ru/kursy-2/'
};
const NAMES = { wa: 'WhatsApp', tg: 'Telegram', max: 'MAX', vk: 'ВКонтакте', ig: 'Instagram', tel: 'Позвонить' };
const SERVICES = [
  { k: 'Волосы', n: 'Парикмахерские услуги', d: 'Стрижки, окрашивание любой сложности, уходы и укладки', i: 'hair' },
  { k: 'Ногти', n: 'Ногтевой сервис', d: 'Маникюр, педикюр, покрытие и здоровье стоп', i: 'nails' },
  { k: 'Образ', n: 'Макияж и причёски', d: 'Образ для любого события — от фотосессии до свадьбы', i: 'makeup' },
  { k: 'Взгляд', n: 'Ресницы и брови', d: 'Наращивание, ламинирование, коррекция и окрашивание', i: 'brows' },
  { k: 'Перманент', n: 'Перманентный макияж', d: 'Брови, губы, веки. Удаление тату и татуажа', i: 'lips' },
  { k: 'Релакс', n: 'Массаж', d: 'Расслабление и восстановление сил для тела и души', i: 'massage' },
  { k: 'Кожа', n: 'Косметология', d: 'Чистки, пилинги и уходы для чистой сияющей кожи', i: 'cosm' },
  { k: 'Лазер', n: 'Лазерная и аппаратная косметология', d: 'Современное оборудование и видимый результат', i: 'laser' },
  { k: 'Силуэт', n: 'Аппаратный массаж', d: 'Коррекция фигуры и упругость кожи', i: 'app' }
];
const PILLARS = [
  { n: 'Сервис', d: 'Полноценный уход в одном месте. Каждый мастер проведёт консультацию и воплотит ваши желания.' },
  { n: 'Забота', d: 'Чистота, уют, приветливый персонал и ароматный кофе во время процедур.' },
  { n: 'Безопасность', d: 'Только качественная сертифицированная продукция и дезинфекция после каждого гостя.' },
  { n: 'Работа на результат', d: 'Отвечаем за качество: если результат вас не устроит — исправим недочёты бесплатно.' },
  { n: 'Индивидуальный подход', d: 'Мастера слышат ваши пожелания, а после процедур дают советы по уходу.' },
  { n: 'Прозрачные цены', d: 'Цена, которую назвали при записи, уже не увеличится.' }
];
const STATS = [['2007', 'год основания'], ['3000+', 'гостей рекомендуют нас'], ['200+', 'выпускников школы'], ['8–22', 'часы работы, каждый день']];
const fill = (sel, arr, fn) => { const el = document.querySelector(sel); if (el) el.innerHTML = arr.map(fn).join(''); };
const S = (b) => `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">${b}</svg>`;
const ICONS = {
  wa: S('<path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 1.8a8.2 8.2 0 1 1-4.2 15.2l-.4-.2-2.8.7.8-2.7-.3-.4A8.2 8.2 0 0 1 12 3.8Z"/><path d="M9 7.2c-.2-.4-.4-.4-.6-.4h-.6c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.300 0 1.400 1 2.700 1.100 2.900.2.2 2 3.100 4.900 4.300 2.400 1 2.900.8 3.400.7.5 0 1.700-.7 1.900-1.300.3-.700.3-1.200.2-1.400-.1-.1-.3-.2-.6-.3l-1.900-1c-.300-.1-.5-.1-.700.2l-.9 1.100c-.1.2-.3.2-.6.1-.3-.2-1.200-.5-2.300-1.400-.9-.8-1.400-1.700-1.600-2-.2-.3 0-.5.1-.6l.5-.5.3-.5c.1-.2 0-.400 0-.5L9 7.200Z"/>'),
  tg: S('<path d="M21.9 4.300 18.700 19.400c-.2 1-.9 1.300-1.700.8l-4.800-3.600-2.300 2.200c-.300.3-.5.5-1 .5l.3-4.900 8.900-8c.4-.3-.1-.5-.6-.2l-11 6.900-4.700-1.500c-1-.3-1-1 .2-1.500L20.500 3c.9-.300 1.600.2 1.400 1.300Z"/>'),
  vk: S('<path d="M12.800 17.500C7 17.500 3.700 13.600 3.600 7h2.900c.1 4.800 2.200 6.900 3.900 7.300V7h2.700v4.200c1.700-.2 3.400-2.100 4-4.200h2.700c-.4 2.600-2.300 4.500-3.700 5.200 1.400.6 3.500 2.300 4.300 5.300h-3c-.6-2-2.200-3.500-4.300-3.700v3.700h-.3Z"/>'),
  max: S('<path d="M12 2.500C6.500 2.500 2.500 6.600 2.500 12c0 1.900.5 3.600 1.400 5.100L3 21.500l4.600-1.100c1.300.7 2.800 1.100 4.400 1.100 5.500 0 9.500-4.100 9.500-9.500S17.500 2.500 12 2.500Zm0 4.300a5.200 5.200 0 1 1 0 10.400 5.200 5.200 0 0 1 0-10.400Zm0 2.400a2.800 2.800 0 1 0 0 5.600 2.800 2.800 0 0 0 0-5.600Z"/>'),
  ig: S('<path fill-rule="evenodd" d="M7.500 2.500h9a5 5 0 0 1 5 5v9a5 5 0 0 1-5 5h-9a5 5 0 0 1-5-5v-9a5 5 0 0 1 5-5Zm0 1.900a3.100 3.100 0 0 0-3.100 3.100v9a3.100 3.100 0 0 0 3.100 3.100h9a3.100 3.100 0 0 0 3.100-3.100v-9a3.100 3.100 0 0 0-3.100-3.100h-9ZM12 7.400a4.600 4.600 0 1 1 0 9.200 4.600 4.600 0 0 1 0-9.200Zm0 1.900a2.700 2.700 0 1 0 0 5.400 2.700 2.700 0 0 0 0-5.400Zm4.900-3.300a1.100 1.100 0 1 1 0 2.200 1.100 1.100 0 0 1 0-2.200Z"/>'),
  tel: S('<path d="M6.600 2.800 9 2.300c.5-.1 1 .2 1.200.7l1.100 2.900c.2.4 0 .9-.3 1.200L9.400 8.500a11.500 11.500 0 0 0 6.100 6.100l1.400-1.600c.3-.4.8-.5 1.200-.3l2.900 1.100c.5.2.8.7.7 1.200l-.5 2.400c-.1.500-.6.900-1.100.9C11 18.300 5.700 13 5.700 3.900c0-.5.4-1 .9-1.100Z"/>'),
  arrow: S('<path d="M13.300 5.300 20 12l-6.700 6.700-1.400-1.400 4.300-4.300H4v-2h12.200l-4.300-4.300 1.400-1.400Z"/>'),
  pin: S('<path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 4.500a2.500 2.500 0 1 1 0 5 2.500 2.500 0 0 1 0-5Z"/>'),
  clock: S('<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm-1 3v5.400l4 2.400 1-1.700-3-1.800V7h-2Z"/>')
};
document.addEventListener('DOMContentLoaded', () => {
  // <a data-go="wa"> → ссылка; <i data-ic="wa"> → иконка; <span data-nm="wa"> → название
  document.querySelectorAll('[data-go]').forEach((a) => {
    const k = a.dataset.go;
    a.href = LINKS[k];
    if (k !== 'tel') { a.target = '_blank'; a.rel = 'noopener'; }
    if (!a.getAttribute('aria-label') && !a.textContent.trim()) a.setAttribute('aria-label', NAMES[k] || k);
  });
  // <div data-msgr="wa tg max vk ig tel" data-label> → готовый набор кнопок мессенджеров
  document.querySelectorAll('[data-msgr]').forEach((box) => {
    const lbl = box.hasAttribute('data-label');
    box.innerHTML = box.dataset.msgr.split(' ').map((k) =>
      `<a class="m m-${k}" data-k="${k}" href="${LINKS[k]}" ${k !== 'tel' ? 'target="_blank" rel="noopener"' : ''} aria-label="${NAMES[k]}">${ICONS[k]}${lbl ? `<span>${NAMES[k]}</span>` : ''}</a>`).join('');
  });
  document.querySelectorAll('[data-ic]').forEach((i) => { i.innerHTML = ICONS[i.dataset.ic] || ''; });
  // плавное появление блоков
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
  // заголовки, выезжающие по словам: <h2 data-split>
  const split = (node, st) => [...node.childNodes].forEach((n) => {
    if (n.nodeType === 3) {
      const f = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((t) => {
        if (!t.trim()) { if (t) f.append(' '); return; }
        const w = document.createElement('span'), i = document.createElement('span');
        w.className = 'w'; i.textContent = t; i.style.setProperty('--i', st.i++); w.append(i); f.append(w);
      });
      n.replaceWith(f);
    } else if (n.nodeType === 1 && n.tagName !== 'BR') split(n, st);
  });
  document.querySelectorAll('[data-split]').forEach((el) => split(el, { i: 0 }));
  document.querySelectorAll('.rv,[data-split]').forEach((el) => io.observe(el));
  // прогресс прокрутки: [data-p] получает --p от 0 до 1 ("pin" — пока секция закреплена)
  const ps = [...document.querySelectorAll('[data-p]')];
  const tick = () => {
    const vh = innerHeight;
    ps.forEach((el) => {
      const r = el.getBoundingClientRect();
      const p = el.dataset.p === 'pin' ? -r.top / Math.max(1, r.height - vh) : (vh - r.top) / (vh + r.height);
      el.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(4));
    });
    document.dispatchEvent(new Event('fx'));
  };
  let raf = 0;
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; tick(); }); }, { passive: true });
  addEventListener('resize', tick); tick();
  // счётчики: <b data-count>3000+</b>
  const cio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, m = el.textContent.match(/^(\D*)(\d+)(.*)$/); if (!m) return;
    const end = +m[2], t0 = performance.now(), from = end > 1900 && end < 2100 ? end - 19 : 0;
    const step = (t) => { const k = Math.min(1, (t - t0) / 1500); el.textContent = m[1] + Math.round(from + (end - from) * (1 - Math.pow(1 - k, 3))) + m[3]; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach((el) => cio.observe(el));
  // промокод: копирование по клику
  document.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', () => {
    navigator.clipboard?.writeText(b.dataset.copy);
    const t = b.innerHTML; b.textContent = 'Скопировано ✓'; setTimeout(() => { b.innerHTML = t; }, 1500);
  }));
});
