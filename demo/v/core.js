/* Общие данные и помощники для вариантов дизайна (данные — те же, что на основном демо) */
const SALON = {
  address: 'Пермь, ул. Осинская, 8', addressShort: 'Осинская, 8',
  hours: 'Ежедневно 10:00–20:00',
  phone: '+7 952 656-44-84',
  book: 'https://app.arnica.pro/booking/booking?orgid=44585#/main',
  map: 'https://yandex.ru/maps/org/d_ajour/77986565087/',
  mapWidget: 'https://yandex.ru/map-widget/v1/?z=16&ol=biz&oid=77986565087',
  school: 'https://dajour.org',
  messengers: [
    { k: 'wa', name: 'WhatsApp', sub: 'Чат с администратором', url: 'https://wa.me/message/ZLAVOFXOAT5RB1' },
    { k: 'tg', name: 'Telegram', sub: 'Чат с администратором', url: 'https://t.me/dom_dajour' },
    { k: 'max', name: 'MAX', sub: 'Канал салона', url: 'https://max.ru/id590848968086_biz' },
    { k: 'vk', name: 'ВКонтакте', sub: 'Сообщество салона', url: 'https://vk.com/djr_salon' },
    { k: 'ig', name: 'Instagram', sub: 'Работы и новости', url: 'https://www.instagram.com/dom_dajour_/' }
  ],
  // направления: id, название, описание, фото, где искать цены в прайсе (категория и, если нужно, группы)
  services: [
    { id: 'hair', k: 'Волосы', n: 'Парикмахерские услуги', d: 'Стрижки, окрашивание любой сложности, уходы и укладки', i: 'hair', c: 'Парикмахерские услуги' },
    { id: 'nails', k: 'Ногти', n: 'Ногтевой сервис', d: 'Маникюр, педикюр, покрытие и здоровье стоп', i: 'nails', c: 'Ногтевой сервис' },
    { id: 'makeup', k: 'Образ', n: 'Макияж и причёски', d: 'Образ для любого события — от фотосессии до свадьбы', i: 'makeup', c: 'Макияж и причёски' },
    { id: 'brows', k: 'Взгляд', n: 'Ресницы и брови', d: 'Наращивание, ламинирование, коррекция и окрашивание', i: 'brows', c: 'Ресницы и брови' },
    { id: 'pm', k: 'Перманент', n: 'Перманентный макияж', d: 'Брови, губы, веки. Удаление тату и татуажа', i: 'lips', c: 'Перманентный макияж' },
    { id: 'massage', k: 'Релакс', n: 'Массаж', d: 'Расслабление и восстановление сил для тела и души', i: 'massage', c: 'Массаж', g: [''] },
    { id: 'cosm', k: 'Кожа', n: 'Косметология', d: 'Чистки, пилинги и уходы для чистой сияющей кожи', i: 'cosm', c: 'Косметология', g: ['Чистка и уходы за кожей', 'Пилинг'] },
    { id: 'laser', k: 'Лазер', n: 'Лазерная и аппаратная косметология', d: 'Современное оборудование и видимый результат', i: 'laser', c: 'Косметология', g: ['Аппаратная косметология', 'Лазерная косметология · Карбоновый пилинг'] },
    { id: 'app', k: 'Силуэт', n: 'Аппаратный массаж', d: 'Коррекция фигуры и упругость кожи', i: 'app', c: 'Массаж', g: ['Аппаратный массаж сфера'] }
  ]
};

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rub = n => n.toLocaleString('ru-RU').replace(/,/g, ' ') + ' ₽';
const price = p => p === 0 ? 'бесплатно' : Array.isArray(p) ? (p[1] ? rub(p[0]).replace(' ₽', '') + '–' + rub(p[1]) : 'от ' + rub(p[0])) : rub(p);
const minOf = p => Array.isArray(p) ? p[0] : p;
const items = s => (PRICES.find(c => c.c === s.c) || { g: [] }).g.filter(g => !s.g || s.g.includes(g.n)).flatMap(g => g.s);
const fromPrice = s => { const v = items(s).map(x => minOf(x[1])).filter(Boolean); return v.length ? 'от ' + rub(Math.min(...v)) : ''; };
const dur = m => m >= 60 ? Math.floor(m / 60) + ' ч' + (m % 60 ? ' ' + (m % 60) + ' мин' : '') : m + ' мин';

const S = (b, v = '0 0 24 24') => `<svg viewBox="${v}" aria-hidden="true">${b}</svg>`;
const IC = {
  arrow: S('<path d="M13.3 5.3 20 12l-6.7 6.7-1.4-1.4 4.3-4.3H4v-2h12.2l-4.3-4.3 1.4-1.4Z" fill="currentColor"/>'),
  back: S('<path d="M10.7 5.3 4 12l6.7 6.7 1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4Z" fill="currentColor"/>'),
  close: S('<path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
  send: S('<path d="M3 11.5 21 3l-8.5 18-2.2-7.3L3 11.5Z" fill="currentColor"/>'),
  search: S('<circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="m20 20-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'),
  wa: S('<path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 1.8a8.2 8.2 0 1 1-4.2 15.2l-.4-.2-2.8.7.8-2.7-.3-.4A8.2 8.2 0 0 1 12 3.8Zm-3 3.4c-.2-.4-.4-.4-.6-.4h-.6c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.3s1 2.7 1.2 2.9c.1.2 2 3.2 5 4.4 2.5 1 3 .8 3.5.7.5 0 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.4l-2-1c-.3-.1-.5-.1-.7.2l-.9 1.1c-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.4.1-.6l.4-.5.3-.5c.1-.2 0-.4 0-.5L9 7.2Z"/>'),
  tg: S('<path d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.7.8l-4.8-3.6-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2l-11 6.9-4.7-1.5c-1-.3-1-1 .2-1.5L20.5 3c.9-.3 1.6.2 1.4 1.3Z"/>'),
  max: S('<path d="M12 2.5C6.5 2.5 2.5 6.6 2.5 12c0 1.9.5 3.6 1.4 5.1L3 21.5l4.6-1.1c1.3.7 2.8 1.1 4.4 1.1 5.5 0 9.5-4.1 9.5-9.5S17.5 2.5 12 2.5Zm0 4.3a5.2 5.2 0 1 1 0 10.4 5.2 5.2 0 0 1 0-10.4Z"/>'),
  vk: S('<path d="M12.8 17.5C7 17.5 3.7 13.6 3.6 7h2.9c.1 4.8 2.2 6.9 3.9 7.3V7h2.7v4.2c1.7-.2 3.4-2.1 4-4.2h2.7c-.4 2.6-2.3 4.5-3.7 5.2 1.4.6 3.5 2.3 4.3 5.3h-3c-.6-2-2.2-3.5-4.3-3.7v3.7h-.3Z"/>'),
  ig: S('<path fill-rule="evenodd" d="M7.5 2.5h9a5 5 0 0 1 5 5v9a5 5 0 0 1-5 5h-9a5 5 0 0 1-5-5v-9a5 5 0 0 1 5-5Zm0 1.9a3.1 3.1 0 0 0-3.1 3.1v9a3.1 3.1 0 0 0 3.1 3.1h9a3.1 3.1 0 0 0 3.1-3.1v-9a3.1 3.1 0 0 0-3.1-3.1h-9ZM12 7.2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6Zm0 1.9a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8Zm5.1-3.2a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z"/>')
};
const ext = 'target="_blank" rel="noopener"';

/* ---------- шапка, меню, подвал, демо-плашка ---------- */
/* открыто ли сейчас — по пермскому времени (UTC+5) */
function openNow() {
  const p = new Date(Date.now() + (new Date().getTimezoneOffset() + 300) * 60000), h = p.getHours() + p.getMinutes() / 60;
  return h >= 10 && h < 20 ? { open: true, text: 'Открыто · до 20:00' } : { open: false, text: 'Откроемся в 10:00' };
}

const tel = 'tel:' + SALON.phone.replace(/[^+\d]/g, '');
const svcCount = PRICES.reduce((a, c) => a + c.g.reduce((b, g) => b + g.s.length, 0), 0);
const WORKS = ['w1', 'w6', 'hair2', 'w2', 'w15', 'w7', 'w14', 'w3', 'pure', 'w5', 'w8', 'w16', 'w4', 'olive', 'w12', 'w9', 'w13', 'w10', 'cover2'];
const msgLinks = cls => SALON.messengers.map(m => `<a class="${cls}" href="${m.url}" ${ext} aria-label="${m.name}" title="${m.name} — ${m.sub}">${IC[m.k]}</a>`).join('');
if (/[?&]shot/.test(location.search)) document.documentElement.classList.add('noanim');

/* появление при прокрутке: [data-r] получает .in */
function reveal() {
  if (!('IntersectionObserver' in window)) return $$('[data-r]').forEach(e => e.classList.add('in'));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('[data-r]').forEach(el => io.observe(el));
}

/* совместимость с мастером сертификатов (../assets/cert.js): watch и snow как в app.js */
const watch = () => { $$('.rv,.ln').forEach(e => e.classList.add('in')); reveal(); };
function snow(canvas, n = 70, col = 'rgba(255,245,230,.8)') {
  if (!canvas) return;
  const c = canvas.getContext('2d'); let w, h, P = [];
  const size = () => { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; };
  size(); addEventListener('resize', size);
  for (let i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.8 + .4, s: Math.random() * .5 + .2, o: Math.random() * Math.PI * 2 });
  let vis = true; new IntersectionObserver(e => vis = e[0].isIntersecting).observe(canvas);
  (function f() {
    if (vis) { c.clearRect(0, 0, w, h); c.fillStyle = canvas.dataset.col || col;
      for (const p of P) { p.y += p.s; p.o += .01; p.x += Math.sin(p.o) * .3; if (p.y > h) { p.y = -4; p.x = Math.random() * w; } c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill(); } }
    requestAnimationFrame(f);
  })();
}

/* переключатель вариантов дизайна (на страницах сертификатов — между версиями мастера) */
(function () {
  const cur = document.body.dataset.v, sert = document.body.dataset.page === 'sert';
  const V = sert
    ? [['../sertifikaty.html', 'Дом', 'dom'], ['sert-journal.html', 'Журнал', 'journal'], ['sert-noch.html', 'Ночь', 'noch'], ['sert-svezh.html', 'Свежий', 'svezh']]
    : [['../index.html', 'Дом', 'dom'], ['journal.html', 'Журнал', 'journal'], ['noch.html', 'Ночь', 'noch'], ['svezh.html', 'Свежий', 'svezh']];
  document.body.insertAdjacentHTML('beforeend', `<div class="vsw" role="navigation" aria-label="Варианты дизайна"><span>Стиль</span>${V.map(([h, t, k]) => `<a href="${h}"${k === cur ? ' aria-current="true"' : ''}>${t}</a>`).join('')}</div>`);
  const st = document.createElement('style');
  st.textContent = `.vsw{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:999;display:flex;align-items:center;gap:2px;padding:5px;border-radius:99px;background:rgba(20,18,16,.82);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);box-shadow:0 10px 30px rgba(0,0,0,.25);font:600 12px/1 Manrope,system-ui,sans-serif;color:#fff;white-space:nowrap}
.vsw span{padding:0 10px 0 12px;opacity:.55;letter-spacing:.12em;text-transform:uppercase;font-size:10px}
.vsw a{padding:9px 13px;border-radius:99px;color:#fff;text-decoration:none;transition:background .2s}
.vsw a:hover{background:rgba(255,255,255,.12)}.vsw a[aria-current]{background:#fff;color:#111}
@media(max-width:640px){.vsw{position:relative;left:auto;bottom:auto!important;transform:none;margin:18px auto 96px;width:max-content}.vsw span{display:none}.vsw a{padding:9px 10px}}`;
  document.head.append(st);
})();
