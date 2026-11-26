/* Дом D'ajour — демо-сайт. Данные салона — из действующей визитки и онлайн-записи (Arnica, 10.11.2026). */
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
const PAGE = document.body.dataset.page || '';
if (/[?&]shot/.test(location.search)) document.documentElement.classList.add('noanim');
const ROOT = document.body.dataset.root || '';
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
const NAV = [['index.html', 'Прихожая', 'home'], ['uslugi.html', 'Комнаты и цены', 'uslugi'], ['sertifikaty.html', 'Ключ в подарок', 'cert'], ['o-salone.html', 'О доме', 'about'], ['kontakty.html', 'Адрес', 'contacts']];
const navLinks = NAV.slice(1).map(([h, t, p]) => `<a href="${h}"${p === PAGE ? ' aria-current="page"' : ''}>${t}</a>`).join('');
const tel = 'tel:' + SALON.phone.replace(/[^+\d]/g, '');

/* открыто ли сейчас — по пермскому времени (UTC+5) */
function openNow() {
  const p = new Date(Date.now() + (new Date().getTimezoneOffset() + 300) * 60000), h = p.getHours() + p.getMinutes() / 60;
  return h >= 10 && h < 20 ? { open: true, text: 'Открыто · до 20:00' } : { open: false, text: 'Откроемся в 10:00' };
}

document.body.insertAdjacentHTML('afterbegin', `
<div class="demo"><b>Демо-версия</b> · образец сайта от студии «Кирилл и Даня»</div>
<header class="hd${document.body.dataset.dark ? ' dark' : ''}"><div class="wrap">
  <a class="lg" href="index.html" aria-label="Дом D'ajour — на главную"><img class="dk" src="img/logo-dark.png" alt="Дом D'ajour"><img class="lt" src="img/logo.png" alt=""></a>
  <nav>${navLinks}</nav>
  <a class="btn" href="${SALON.book}" ${ext}>Записаться</a>
  <button class="burger" aria-label="Меню"><i></i><i></i></button>
</div></header>
<div class="mnav wallpaper">${NAV.map(([h, t], i) => `<a href="${h}"><small>0${i + 1}</small>${t}</a>`).join('')}<p>${SALON.address} · ${openNow().text}</p></div>`);

const msgRows = (list = SALON.messengers) => list.map(m => `<a href="${m.url}" ${ext}><i>${IC[m.k]}</i><span><b>${m.name}</b><small>${m.sub}</small></span><span class="ar">${IC.arrow}</span></a>`).join('');

document.body.insertAdjacentHTML('beforeend', `
<section class="sec" style="padding-bottom:0"><div class="wrap"><div class="mat rv">
  <div class="w">Добро пожаловать</div>
  <p>Вытирать ноги не нужно — просто выберите время</p>
  <a class="btn" href="${SALON.book}" ${ext}>Записаться онлайн ${IC.arrow}</a>
</div></div></section>
<footer class="ft"><div class="wrap">
  <div class="cols">
    <div><img src="img/logo.png" alt="Дом D'ajour"><br>${SALON.address}<br>${SALON.hours}<br><a href="${tel}">${SALON.phone}</a></div>
    <div><b>Разделы</b>${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}</div>
    <div><b>Мы на связи</b>${SALON.messengers.map(m => `<a href="${m.url}" ${ext}>${m.name}</a>`).join('')}</div>
    <div><b>Ещё</b><a href="${SALON.book}" ${ext}>Онлайн-запись</a><a href="${SALON.school}" ${ext}>Школа красоты D'ajour</a><a href="${SALON.map}" ${ext}>Яндекс Карты</a></div>
  </div>
  <div class="by"><span>© 2026 Дом D'ajour · салон и школа красоты</span><span>Демо-сайт: студия «Кирилл и Даня» · сайты и ИИ-ассистенты для салонов</span></div>
</div></footer>
<button class="fab" aria-label="Открыть чат с консьержем"><i></i><span>Консьерж</span></button>
<nav class="dock" aria-label="Быстрые действия"><a class="bk" href="${SALON.book}" ${ext}>Записаться</a><button class="cc" data-chat="">Консьерж</button><a class="ph" href="${tel}" aria-label="Позвонить"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 2.8 9 2.3c.5-.1 1 .2 1.2.7l1.1 2.9c.2.4 0 .9-.3 1.2L9.4 8.5a11.5 11.5 0 0 0 6.1 6.1l1.4-1.6c.3-.4.8-.5 1.2-.3l2.9 1.1c.5.2.8.7.7 1.2l-.5 2.4c-.1.5-.6.9-1.1.9C11 18.3 5.7 13 5.7 3.9c0-.5.4-1 .9-1.1Z"/></svg></a></nav>
<div class="chat" role="dialog" aria-label="ИИ-консьерж">
  <div class="top"><img src="img/logo.png" alt=""><span><b>Консьерж Дома D'ajour</b><small>ИИ-администратор · отвечает сразу</small></span><button class="x" aria-label="Закрыть">${IC.close}</button></div>
  <div class="note">Демо: так ИИ-администратор отвечает клиентам в Telegram и на сайте</div>
  <div class="msgs"></div>
  <form><input placeholder="Напишите вопрос…" aria-label="Сообщение"><button aria-label="Отправить">${IC.send}</button></form>
</div>`);

const hd = $('.hd');
const onScroll = () => hd.classList.toggle('solid', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
$('.burger').onclick = () => document.body.classList.toggle('menu-open');
$$('.mnav a').forEach(a => a.onclick = () => document.body.classList.remove('menu-open'));

/* ---------- появление при скролле ---------- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
const watch = () => $$('.rv:not(.in),.ln:not(.in),[data-split]:not(.in)').forEach(el => io.observe(el));

/* ---------- лента с перетаскиванием ---------- */
function dragScroll(el) {
  let x0, s0, down = false, moved = false;
  el.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; s0 = el.scrollLeft; });
  addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - x0; if (Math.abs(dx) > 4) { moved = true; el.classList.add('drag'); } el.scrollLeft = s0 - dx; });
  addEventListener('pointerup', () => { down = false; el.classList.remove('drag'); });
  el.addEventListener('click', e => { if (moved) e.preventDefault(); }, true);
}

/* ---------- лайтбокс ---------- */
function lightbox(sel) {
  const lb = document.createElement('div'); lb.className = 'lb'; lb.innerHTML = '<img alt="">'; document.body.append(lb);
  lb.onclick = () => lb.classList.remove('open');
  $$(sel).forEach(f => f.onclick = () => { $('img', lb).src = $('img', f).src; lb.classList.add('open'); });
}

/* ---------- снег (лёгкий, на canvas) ---------- */
function snow(canvas, n = 70) {
  const c = canvas.getContext('2d'); let w, h, P = [];
  const size = () => { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; };
  size(); addEventListener('resize', size);
  for (let i = 0; i < n; i++) P.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.8 + .4, s: Math.random() * .5 + .2, o: Math.random() * Math.PI * 2 });
  let vis = true; new IntersectionObserver(e => vis = e[0].isIntersecting).observe(canvas);
  (function f() {
    if (vis) { c.clearRect(0, 0, w, h); c.fillStyle = 'rgba(255,245,230,.8)';
      for (const p of P) { p.y += p.s; p.o += .01; p.x += Math.sin(p.o) * .3; if (p.y > h) { p.y = -4; p.x = Math.random() * w; } c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill(); } }
    requestAnimationFrame(f);
  })();
}

/* ---------- ИИ-администратор (демо-сценарии, ответы по настоящему прайсу) ---------- */
const BOT = (() => {
  const chat = $('.chat'), box = $('.msgs', chat), inp = $('input', chat);
  let started = false, flow = null;
  const scroll = () => box.scrollTop = box.scrollHeight;
  const add = (cls, html) => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; box.append(d); scroll(); return d; };
  const user = t => add('m u', t.replace(/</g, '&lt;'));
  const say = (html, chips, delay = 650) => new Promise(r => {
    const t = add('m b typing', '<i></i><i></i><i></i>');
    setTimeout(() => { t.className = 'm b'; t.innerHTML = html; if (chips) addChips(chips); scroll(); r(); }, delay);
  });
  const addChips = list => { const c = add('chips', list.map(x => `<button type="button">${x}</button>`).join('')); $$('button', c).forEach(b => b.onclick = () => { c.remove(); handle(b.textContent); }); };
  const MAIN = ['Записаться', 'Узнать цену', 'Перманентный макияж', 'Подарочный сертификат', 'Где вы находитесь?'];
  const find = q => {
    const w = q.toLowerCase().replace(/ё/g, 'е').split(/[^a-zа-я0-9]+/).filter(x => x.length > 2).map(x => x.slice(0, Math.max(4, x.length - 2)));
    if (!w.length) return [];
    const all = PRICES.flatMap(c => c.g.flatMap(g => g.s.map(s => ({ c: c.c, n: s[0], p: s[1], m: s[2], t: (c.c + ' ' + g.n + ' ' + s[0]).toLowerCase().replace(/ё/g, 'е') }))));
    return all.map(x => ({ ...x, sc: w.filter(k => x.t.includes(k)).length + (w.some(k => x.n.toLowerCase().startsWith(k)) ? .5 : 0) })).filter(x => x.sc >= 1).sort((a, b) => b.sc - a.sc || a.n.length - b.n.length).slice(0, 5);
  };
  const priceList = r => `<div class="pl">${r.map(x => `<div><span>${x.n}</span><b>${price(x.p)}</b></div>`).join('')}</div>`;

  async function handle(text) {
    user(text);
    const t = text.toLowerCase();
    if (flow) return flow(text);
    if (/запис/.test(t)) return say('С удовольствием запишу. На какую услугу?', SALON.services.slice(0, 7).map(s => s.n));
    if (/перманент|татуаж|пудров/.test(t) && !/цен/.test(t)) return perm();
    const svc = SALON.services.find(s => s.n === text);
    if (svc) return say(`${svc.n}: ${fromPrice(svc)}. Свободное время и мастера — в <a href="${SALON.book}" target="_blank" rel="noopener">онлайн-записи</a>.<br><br><small>В рабочей версии я сам предложу свободные окна из системы записи салона и запишу вас прямо в чате.</small>`, ['Узнать цену', 'Подарочный сертификат']);
    if (/сертиф|подар/.test(t)) return say('Новогодние сертификаты — на сумму или на услугу, три дизайна, электронный или в конверте. Соберите свой: <a href="sertifikaty.html">конструктор сертификата</a>', ['3 000 ₽', '5 000 ₽', '10 000 ₽']);
    if (/^\d[\d\s]*₽$/.test(text)) return say(`Сертификат на ${text} — отличный подарок. Оформить можно в <a href="sertifikaty.html">конструкторе</a>: выберите дизайн и впишите имя получателя.`);
    if (/где|адрес|наход|добрат|часы|работа|время|телефон/.test(t)) return say(`Мы в самом центре: ${SALON.address}.<br>${SALON.hours}.<br>Телефон: ${SALON.phone}<br><a href="${SALON.map}" target="_blank" rel="noopener">Открыть на карте</a>`, ['Записаться']);
    if (/цен|стоим|сколько|прайс/.test(t) && find(text).length === 0) return say('Напишите, какая услуга интересует — например, «маникюр», «окрашивание» или «чистка лица».');
    if (/друг/.test(t)) return say('Напишите название услуги — найду цену.');
    const r = find(text);
    if (r.length) return say(`Вот что нашла в прайсе:${priceList(r)}<small>Точную стоимость подтвердит мастер.</small>`, ['Записаться', 'Другая услуга']);
    return say('Этот вопрос передам администратору — он ответит в рабочее время (10:00–20:00). А пока могу подсказать цены или записать онлайн.', MAIN.slice(0, 3));
  }

  // перманент: часть вопросов задаёт бот, заявку изучает мастер
  async function perm() {
    const ans = [];
    const steps = [
      ['Перманентный макияж подбираем индивидуально, поэтому задам пару вопросов. Какая зона?', ['Брови', 'Губы', 'Веки']],
      ['Делали раньше перманент в этой зоне?', ['Нет, впервые', 'Да, нужно перекрыть', 'Да, нужна коррекция']],
      ['Есть ли сейчас что-то из этого: беременность или кормление, воспаления в зоне процедуры, приём антибиотиков?', ['Нет', 'Есть', 'Не знаю']]
    ];
    let i = 0;
    const next = () => say(steps[i][0], steps[i][1]);
    flow = async text => {
      ans.push(text); i++;
      if (i < steps.length) return next();
      flow = null;
      await say(`Спасибо! Собрала заявку:<div class="pl"><div><span>Зона</span><b>${ans[0]}</b></div><div><span>Ранее</span><b>${ans[1]}</b></div><div><span>Противопоказания</span><b>${ans[2]}</b></div></div>`, null, 800);
      return say('Передала её мастеру перманента. Он посмотрит ответы, напишет вам, уточнит детали и подберёт время.', ['Узнать цену на перманент']);
    };
    return next();
  }

  const open = () => { chat.classList.add('open'); $('.fab').style.opacity = 0; if (!started) { started = true; say('Добро пожаловать в Дом D\'ajour! Я консьерж — ИИ-администратор салона 🔔<br>Подскажу цены, запишу на процедуру или помогу выбрать подарочный сертификат.', MAIN, 400); } setTimeout(() => inp.focus({ preventScroll: true }), 400); };
  const close = () => { chat.classList.remove('open'); $('.fab').style.opacity = 1; };
  $('.fab').onclick = open; $('.x', chat).onclick = close;
  $('form', chat).onsubmit = e => { e.preventDefault(); const v = inp.value.trim(); if (!v) return; inp.value = ''; handle(v); };
  $$('[data-chat]').forEach(b => b.onclick = e => { e.preventDefault(); open(); if (b.dataset.chat) setTimeout(() => handle(b.dataset.chat), 900); });
  return { open, handle, find };
})();

addEventListener('load', watch); watch();
