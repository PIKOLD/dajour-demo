const IR = window.IMG_ROOT || ''; /* путь к картинкам: '' на основном демо, '../' в вариантах дизайна */
/* Мастер «Ключ от Дома»: 30 открыток, 3D-карусель, 6 шагов, финал с конвертом */

/* ================= ОРНАМЕНТЫ (рисуются кодом) ================= */
let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
const flake = (x, y, r) => `<g transform="translate(${x} ${y})" stroke-width="1.2"><path d="M0 -${r}V${r}M-${r * .87} -${r / 2}L${r * .87} ${r / 2}M-${r * .87} ${r / 2}L${r * .87} -${r / 2}"/><path d="M0 -${r * .6}l-${r * .2} -${r * .2}M0 -${r * .6}l${r * .2} -${r * .2}M0 ${r * .6}l-${r * .2} ${r * .2}M0 ${r * .6}l${r * .2} ${r * .2}"/></g>`;
const star = (x, y, r, f, cls = '', st = '') => `<path class="${cls}" style="${st}" d="M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z" fill="${f}"/>`;
const heart = (x, y, s, f, cls = '', st = '') => `<path class="${cls}" style="${st}" transform="translate(${x} ${y}) scale(${s})" d="M0 6C-6 1-9-2-9-5a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 3-3 6-9 11Z" fill="${f}"/>`;
const tulip = (x, c) => `<path d="M${x} 210V120" stroke="#4f7a52" stroke-width="2.4"/><path d="M${x} 168c-14-8-20-22-18-36 10 6 16 20 18 36Z" fill="#5b8a5d"/><path d="M${x - 15} 118c0-18 6-30 15-36 9 6 15 18 15 36-5 8-10 10-15 10s-10-2-15-10Z" fill="${c}"/><path d="M${x} 128c-4-14-2-28 0-34 2 6 4 20 0 34Z" fill="rgba(255,255,255,.25)"/>`;
const ORN = {
  snow: c => `<g fill="none" stroke="${c}">${flake(250, 52, 34)}${flake(196, 120, 16)}${flake(292, 150, 20)}${flake(150, 36, 10)}${flake(110, 170, 12)}</g>`,
  snowfall: c => { seed = 21; let s = `<g fill="none" stroke="${c}" opacity=".8">${flake(262, 70, 30)}</g>`; for (let i = 0; i < 40; i++) s += `<circle class="fall" cx="${rnd() * 320}" cy="${-10 - rnd() * 40}" r="${1 + rnd() * 2.4}" fill="#fff" opacity="${.5 + rnd() * .5}" style="animation-duration:${4 + rnd() * 6}s;animation-delay:-${rnd() * 8}s"/>`; return s; },
  bubbles: c => { seed = 3; let s = ''; for (let i = 0; i < 26; i++) s += `<circle cx="${170 + rnd() * 150}" cy="${rnd() * 200}" r="${2 + rnd() * 10}" fill="none" stroke="${c}" stroke-width="1.2"/>`; return s; },
  fir: c => `<g fill="none" stroke="${c}" stroke-width="1.4" stroke-linecap="round"><path d="M330 -10 210 210"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => { const x = 324 - i * 14, y = 2 + i * 26; return `<path d="M${x} ${y}c-20 4-40 2-62-8M${x - 4} ${y + 8}c14 10 30 16 52 16"/>`; }).join('')}</g>`,
  stars: c => { seed = 11; let s = ''; for (let i = 0; i < 22; i++) s += star(rnd() * 320, rnd() * 200, 1.5 + rnd() * 5, c, 'tw', `animation-delay:-${rnd() * 2}s`); return s + `<circle cx="262" cy="58" r="26" fill="none" stroke="${c}" opacity=".6"/>`; },
  ball: () => `<g class="sway"><path d="M262 0V34" stroke="#b08442" stroke-width="1.5"/><rect x="254" y="32" width="16" height="10" rx="2" fill="#b08442"/><circle cx="262" cy="86" r="46" fill="#8b2e3c"/><circle cx="262" cy="86" r="46" fill="url(#bh)"/><path d="M218 80q44 18 88 0M220 98q42 16 84 0" stroke="#e6c98e" stroke-width="2" fill="none"/></g><defs><radialGradient id="bh" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>`,
  lights: () => { seed = 9; const C = ['#ffd27a', '#ff8f7a', '#9fe0b0', '#8fc0ff']; let s = `<path d="M-10 30 Q80 80 160 40 T330 50" fill="none" stroke="#5a4a3a" stroke-width="1.4"/>`; for (let i = 0; i < 12; i++) { const t = i / 11, x = -10 + t * 340, y = 30 + Math.sin(t * 6.3) * 16 + 14; s += `<circle class="tw" cx="${x}" cy="${y}" r="5" fill="${C[i % 4]}" style="animation-delay:-${rnd() * 2}s"/>`; } return s; },
  confetti: () => { seed = 5; const C = ['#c9a668', '#8b2e3c', '#3e6a52', '#d98f7e', '#1c2340']; let s = ''; for (let i = 0; i < 44; i++) { const x = rnd() * 320, w = 3 + rnd() * 6; s += `<rect class="fall" x="${x}" y="${-10 - rnd() * 30}" width="${w}" height="${w * .45}" rx="1" fill="${C[i % 5]}" style="animation-duration:${3 + rnd() * 5}s;animation-delay:-${rnd() * 8}s"/>`; } return s; },
  balloons: c => `<g fill="none" stroke="${c}" stroke-width="1.4"><ellipse cx="250" cy="58" rx="26" ry="32"/><ellipse cx="292" cy="84" rx="20" ry="25"/><ellipse cx="214" cy="96" rx="17" ry="21"/><path d="M250 90q-6 40 4 110M292 109q8 40-6 91M214 117q10 30 0 83"/></g>`,
  candles: c => `<g>${[210, 240, 270, 300].map((x, i) => `<rect x="${x - 5}" y="${90 + i % 2 * 14}" width="10" height="${110 - i % 2 * 14}" rx="2" fill="${['#f2d7c9', '#c9a668', '#f2d7c9', '#c9a668'][i]}"/><path class="tw" style="animation-delay:-${i * .4}s" d="M${x} ${76 + i % 2 * 14}c-6 6-6 12 0 14 6-2 6-8 0-14Z" fill="#ffcf6e"/>`).join('')}<path d="M190 200h130" stroke="${c}" stroke-width="2"/></g>`,
  streamers: () => `<g fill="none" stroke-width="3" stroke-linecap="round"><path d="M180 -10c30 30-20 50 10 80s-20 50 10 80 10 40 0 60" stroke="#c9a668"/><path d="M240 -10c-30 30 20 50-10 80s20 50-10 80" stroke="#e9a3a0"/><path d="M300 -10c30 30-20 50 10 80s-20 50 10 80" stroke="#9cc3a4"/></g>`,
  tulips: () => tulip(220, '#e46b7c') + tulip(254, '#f39aa5') + tulip(288, '#d64d63'),
  mimosa: () => { seed = 13; let s = '<g stroke="#6f8a4f" stroke-width="1.6" fill="none"><path d="M330 210C280 140 250 90 200 40"/><path d="M270 120l-30-12M250 90l-26-6M290 150l-34-6M230 64l-22 0"/></g>'; for (let i = 0; i < 46; i++) { const t = rnd(), x = 200 + t * 120 + (rnd() - .5) * 40, y = 40 + t * 170 + (rnd() - .5) * 40; s += `<circle cx="${x}" cy="${y}" r="${3 + rnd() * 3}" fill="${rnd() > .5 ? '#f6d23c' : '#f0c020'}"/>`; } return s; },
  spring: c => `<g fill="none" stroke="${c}" stroke-width="1.4"><path d="M240 210C200 150 210 70 270 20c30 50 30 130-30 190Z"/><path d="M300 200c20-40 40-50 40-50-4 30-20 50-40 50Z"/></g><circle cx="200" cy="50" r="22" fill="rgba(255,255,255,.35)"/>`,
  heart: c => `<path d="M262 170C210 130 196 104 196 82c0-22 16-38 36-38 14 0 24 8 30 20 6-12 16-20 30-20 20 0 36 16 36 38 0 22-14 48-66 88Z" fill="none" stroke="${c}" stroke-width="1.6"/>`,
  hearts: c => { seed = 17; let s = ''; for (let i = 0; i < 16; i++) s += heart(150 + rnd() * 170, 200 + rnd() * 30, .8 + rnd() * 1.6, c, 'rise', `animation-duration:${5 + rnd() * 5}s;animation-delay:-${rnd() * 9}s`); return s; },
  bouquet: () => { const f = (x, y, c) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map(a => `<ellipse rx="7" ry="12" transform="rotate(${a}) translate(0 -10)" fill="${c}"/>`).join('')}<circle r="5" fill="#f3d27a"/></g>`; return `<g stroke="#5f7d55" stroke-width="2"><path d="M262 210 250 110M262 210 276 112M262 210 230 130M262 210 296 136"/></g>` + f(250, 100, '#f2b6c0') + f(278, 104, '#e88e9e') + f(228, 124, '#f6d0d6') + f(298, 128, '#f2b6c0') + f(262, 78, '#d9708a'); },
  glitter: c => { seed = 31; let s = ''; for (let i = 0; i < 40; i++) s += star(rnd() * 320, rnd() * 200, 1 + rnd() * 4, c, 'tw', `animation-delay:-${rnd() * 2}s;animation-duration:${1.2 + rnd() * 1.6}s`); return s; },
  glasses: c => `<g fill="none" stroke="${c}" stroke-width="2"><path d="M228 60l20 6-6 44c-2 10-14 12-20 4Z"/><path d="M224 112l-10 50M204 166l20 4"/><path d="M296 60l-20 6 6 44c2 10 14 12 20 4Z"/><path d="M300 112l10 50M300 170l20-4"/></g>` + star(262, 46, 8, c, 'tw') + star(244, 34, 4, c, 'tw', 'animation-delay:-.6s'),
  leaves: c => `<g fill="none" stroke="${c}" stroke-width="1.4"><path d="M240 210C200 150 210 70 270 20c30 50 30 130-30 190Z"/><path d="M240 210 270 20M252 160l-26-14M260 120l-30-20M266 80l-22-22M256 176l26-24M262 136l28-30"/><path d="M300 200c20-40 40-50 40-50-4 30-20 50-40 50Z"/><path d="M150 230c-10-40 10-80 50-100-6 40-20 80-50 100Z"/></g>`,
  marble: c => `<g fill="none" stroke="${c}"><path d="M-10 40C60 60 90 20 160 50s110 40 180 10" stroke-width="1.2"/><path d="M40 210c30-60 90-60 120-110s70-60 170-70" stroke-width=".8"/><path d="M120 -10c10 40 60 60 70 110" stroke-width=".6"/></g>`,
  key: c => `<g fill="none" stroke="${c}" stroke-width="2"><circle cx="262" cy="64" r="34"/><circle cx="262" cy="64" r="20"/><path d="M262 98v110M262 168h26M262 186h18"/></g>`,
  ring: c => `<circle cx="258" cy="100" r="74" fill="none" stroke="${c}" stroke-width="6" opacity=".9"/><circle cx="258" cy="100" r="66" fill="none" stroke="${c}" stroke-width="1" opacity=".5"/>`,
  arch: c => `<g fill="none" stroke="${c}" stroke-width="1.4"><path d="M210 210V90a52 52 0 0 1 104 0v120"/><path d="M222 210V92a40 40 0 0 1 80 0v118"/><path d="M150 210v-70a26 26 0 0 1 52 0v70"/></g>`
};

/* ================= КАТАЛОГ: 30 открыток ================= */
const CATS = [['ny', 'Новый год'], ['bd', 'День рождения'], ['m8', '8 Марта'], ['lv', 'Любимой'], ['mom', 'Маме'], ['fr', 'Подруге'], ['th', 'Спасибо'], ['any', 'Просто так'], ['anim', 'Живые ✦'], ['all', 'Все']];
const D = [
  ['ny1', 'ny', 'Бордо-бархат', 'radial-gradient(120% 140% at 15% 0%,#a23a4c,#5b1622 55%,#2e0910)', 'snow', 'rgba(240,210,160,.6)', 'С Новым годом'],
  ['ny7', 'ny', 'Снегопад', 'linear-gradient(170deg,#3b5a7a,#1d3149 60%,#101d2e)', 'snowfall', 'rgba(255,255,255,.7)', 'Пусть идёт снег', 1],
  ['ny8', 'ny', 'Гирлянда', 'radial-gradient(120% 140% at 50% 0%,#2a1a14,#120a07)', 'lights', '', 'Огни Нового года', 1],
  ['ny2', 'ny', 'Шампань', 'radial-gradient(120% 140% at 20% 0%,#fbf1df,#e8d0a4 55%,#c79d5d)', 'bubbles', 'rgba(150,105,40,.5)', 'С Новым годом', 0, 1],
  ['ny3', 'ny', 'Изумрудная ель', 'radial-gradient(120% 140% at 20% 0%,#3e6a52,#1e3a2c 60%,#0f1f17)', 'fir', 'rgba(201,166,104,.6)', 'Чудес в Новом году'],
  ['ny4', 'ny', 'Полночь', 'linear-gradient(160deg,#1c2340,#0d1226 60%,#080a16)', 'stars', '#e7c98b', 'Ровно в полночь', 1],
  ['ny5', 'ny', 'Ёлочный шар', 'linear-gradient(160deg,#f6efe3,#eadcc4)', 'ball', '', 'С Новым годом', 1, 1],
  ['ny6', 'ny', 'Праздник в Доме', 'linear-gradient(180deg,rgba(20,8,6,.05),rgba(20,8,6,.78)),url(' + IR + 'img/dark.jpg) center/cover', '', '', 'С Новым годом'],
  ['bd1', 'bd', 'Конфетти', '#f7efe2', 'confetti', '', 'С днём рождения', 1, 1],
  ['bd2', 'bd', 'Шары', 'radial-gradient(120% 140% at 20% 0%,#f0c4bf,#d98f89 60%,#b5615f)', 'balloons', 'rgba(255,240,220,.85)', 'С днём рождения'],
  ['bd4', 'bd', 'Свечи', 'radial-gradient(120% 140% at 20% 0%,#3a2418,#1d110b)', 'candles', 'rgba(201,166,104,.6)', 'Загадай желание', 1],
  ['bd5', 'bd', 'Серпантин', 'linear-gradient(160deg,#fbf6ee,#efe3cf)', 'streamers', '', 'Праздник!', 0, 1],
  ['bd3', 'bd', 'Шампанское', 'linear-gradient(180deg,rgba(20,8,6,0),rgba(20,8,6,.72)),url(' + IR + 'img/gallery.jpg) center/cover', '', '', 'Праздновать красиво'],
  ['m1', 'm8', 'Тюльпаны', 'linear-gradient(160deg,#fdf1ee,#f6dcd5)', 'tulips', '', 'С 8 Марта', 0, 1],
  ['m2', 'm8', 'Мимоза', 'linear-gradient(160deg,#fbf6e6,#efe6c4)', 'mimosa', '', 'Весеннего настроения', 0, 1],
  ['m3', 'm8', 'Весна', 'radial-gradient(120% 140% at 20% 0%,#cfe3d2,#9fc2a7 60%,#6f9a7b)', 'spring', 'rgba(255,255,255,.6)', 'Весна в Доме'],
  ['lv1', 'lv', 'Сердце', 'radial-gradient(120% 140% at 20% 0%,#c0475a,#7d1d31 60%,#4a0c1a)', 'heart', 'rgba(255,220,200,.6)', 'Для тебя'],
  ['lv3', 'lv', 'Сердца', 'radial-gradient(120% 140% at 20% 0%,#a83347,#5e1426 60%,#33070f)', 'hearts', 'rgba(255,190,190,.75)', 'Люблю', 1],
  ['lv2', 'lv', 'Пудра', 'radial-gradient(120% 140% at 20% 0%,#fbeee9,#f1d2c8 60%,#ddb0a2)', 'heart', 'rgba(160,70,70,.4)', 'Самой любимой', 0, 1],
  ['mm1', 'mom', 'Букет', 'linear-gradient(160deg,#fbf3ee,#f1e0d6)', 'bouquet', '', 'Любимой маме', 0, 1],
  ['mm2', 'mom', 'Жемчуг', 'radial-gradient(120% 140% at 20% 0%,#fffdf9,#eee6dc 60%,#d8cbbb)', 'glitter', 'rgba(176,132,66,.7)', 'Маме с любовью', 1, 1],
  ['fr1', 'fr', 'Бокалы', 'radial-gradient(120% 140% at 20% 0%,#3d2a22,#1b100b)', 'glasses', '#e2c486', 'За нас!'],
  ['fr2', 'fr', 'Блёстки', 'linear-gradient(160deg,#141414,#2a2420)', 'glitter', '#e7c98b', 'Сияй', 1],
  ['th1', 'th', 'Листья Дома', 'radial-gradient(120% 140% at 20% 0%,#2d4a3b,#20362b 60%,#13221a)', 'leaves', 'rgba(140,190,150,.5)', 'Спасибо'],
  ['th2', 'th', 'Мрамор', 'linear-gradient(135deg,#f7f4f0,#e4ded6)', 'marble', 'rgba(90,80,70,.4)', 'С благодарностью', 0, 1],
  ['an1', 'any', 'Ключ от Дома', 'radial-gradient(120% 140% at 20% 0%,#5a2c1d,#2a120b 65%,#170905)', 'key', 'rgba(201,166,104,.65)', 'Ключ от Дома'],
  ['an2', 'any', 'Зеркало', 'linear-gradient(160deg,#241410,#120806)', 'ring', '#c9a668', 'Время для себя', 1],
  ['an3', 'any', 'Арки', 'linear-gradient(160deg,#efe4d2,#e1d0b6)', 'arch', 'rgba(120,80,40,.45)', 'Добро пожаловать', 0, 1],
  ['an4', 'any', 'Холл', 'linear-gradient(180deg,rgba(20,8,6,.1),rgba(20,8,6,.75)),url(' + IR + 'img/in5.jpg) center/cover', '', '', 'Ждём в гости'],
  ['an5', 'any', 'Витрина', 'linear-gradient(180deg,rgba(20,8,6,.1),rgba(20,8,6,.75)),url(' + IR + 'img/in2.jpg) center/cover', '', '', 'Просто так']
].map(([id, c, n, bg, orn, oc, o, anim, dark]) => ({ id, c, n, bg, orn, oc, o, anim: !!anim, dark: !!dark }));
const catName = k => (CATS.find(x => x[0] === k) || ['', ''])[1];
const card = (d, val, svc, to) => `<div class="gcard${d.dark ? ' dark' : ''}${d.id === 'an2' || d.id === 'ny2' ? ' shim' : ''}" style="background:${d.bg}">${d.orn ? `<svg class="orn" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${ORN[d.orn](d.oc || '#fff')}</svg>` : ''}<div class="shine"></div><div class="in"><div class="top"><img src="${IR}img/logo.png" alt=""><span>Подарочный<br>сертификат</span></div><div class="occ">${d.o}</div><div class="bot"><div class="val${svc ? ' svc' : ''}">${val}</div><div class="to">${to || ''}</div></div></div></div>`;

/* ================= СОСТОЯНИЕ ================= */
const STEPS = ['Дизайн', 'Номинал', 'Кому', 'Поздравление', 'Доставка', 'Проверка'];
const st = { step: 0, max: 0, cat: 'all', idx: 0, d: 'ny1', mode: 'sum', sum: 5000, svc: new Map(), rel: '', ch: 'tg', when: 'now', qty: 1, back: false };
const esc = s => s.replace(/[<&]/g, c => c === '<' ? '&lt;' : '&amp;');
const design = () => D.find(x => x.id === st.d);
const list = () => st.cat === 'all' ? D : st.cat === 'anim' ? D.filter(d => d.anim) : D.filter(d => d.c === st.cat);
function value() {
  if (st.mode === 'svc') { const a = [...st.svc.values()]; return { n: a.reduce((s, x) => s + x.p, 0), text: a.length ? (a.length === 1 ? a[0].n : a.length + ' услуги: ' + a.slice(0, 2).map(x => x.n.split(' (')[0]).join(', ') + (a.length > 2 ? '…' : '')) : 'Выберите услуги', svc: 1, list: a }; }
  return { n: st.sum, text: st.sum ? rub(st.sum) : '— ₽', svc: 0, list: [] };
}

/* ================= ШАГИ И ПРОГРЕСС ================= */
$('#prog').innerHTML = STEPS.map((t, i) => `<button data-i="${i}">${i + 1}. ${t}</button>`).join('');
$$('#prog button').forEach(b => b.onclick = () => { const i = +b.dataset.i; if (i <= st.max) go(i); });
function go(n) {
  st.step = n; st.max = Math.max(st.max, n);
  $$('.pstep').forEach(p => p.classList.toggle('on', +p.dataset.s === n));
  $$('#prog button').forEach((b, i) => { b.classList.toggle('cur', i === n); b.classList.toggle('done', i <= st.max && i !== n); });
  const cfm = n === 0;
  $('#cf').style.display = $('#cfnav').style.display = cfm ? '' : 'none';
  $('#one').classList.toggle('on', !cfm);
  st.back = n === 3; $('#one').classList.toggle('back', st.back);
  $('#prev').disabled = n === 0;
  $('#next').textContent = n === 5 ? 'Оплатить ' + rub(value().n * st.qty) : 'Дальше';
  render();
  if (innerWidth < 980 && n > 0) $('#stage').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function check() {
  const s = st.step, v = value();
  if (s === 1 && !v.n) { (st.mode === 'svc' ? $('#svq') : $('#amt')).focus(); return false; }
  if (s === 2 && !st.rel) { shake($('#rels')); return false; }
  if (s === 2 && st.rel !== 'Себе' && !$('#to').value.trim()) { $('#to').focus(); shake($('#to')); return false; }
  if (s === 4 && CH[st.ch][3] && !$('#contact').value.trim()) { $('#contact').focus(); shake($('#contact')); return false; }
  return true;
}
const shake = el => el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }], { duration: 300 });
$('#next').onclick = () => { if (!check()) return; st.step < 5 ? go(st.step + 1) : finish(); };
$('#prev').onclick = () => st.step && go(st.step - 1);

/* ================= ШАГ 1: 3D-карусель ================= */
$('#cats').innerHTML = CATS.map(([k, t]) => `<button data-v="${k}"${k === st.cat ? ' class="on"' : ''}>${t}<b>${k === 'all' ? D.length : k === 'anim' ? D.filter(d => d.anim).length : D.filter(d => d.c === k).length}</b></button>`).join('');
$$('#cats button').forEach(b => b.onclick = () => { st.cat = b.dataset.v; $$('#cats button').forEach(x => x.classList.toggle('on', x === b)); st.idx = Math.max(0, list().findIndex(d => d.id === st.d)); drawCF(); });
function drawCF() {
  const L = list(); st.idx = Math.min(st.idx, L.length - 1); st.d = L[st.idx].id;
  const v = value();
  $('#cf').innerHTML = L.map((d, i) => `<div class="it" data-i="${i}">${card(d, v.svc ? '' : v.text, 0, '')}<div class="nm">${d.n}</div></div>`).join('');
  $$('#cf .it').forEach(el => el.onclick = () => { const i = +el.dataset.i; if (i === st.idx) go(1); else { st.idx = i; layoutCF(); } });
  layoutCF();
}
function layoutCF() {
  const L = list(); st.d = L[st.idx].id; const w = innerWidth < 980 ? .5 : .56;
  $$('#cf .it').forEach((el, i) => {
    const o = i - st.idx, a = Math.abs(o), s = Math.sign(o);
    el.classList.toggle('c', o === 0);
    el.style.transform = `translate(-50%,-50%) translateX(${o * w * 100 * .62 + s * 14}%) translateZ(${-a * 160}px) rotateY(${-s * Math.min(a, 3) * 26}deg)`;
    el.style.opacity = a > 3 ? 0 : 1; el.style.zIndex = 50 - a; el.style.pointerEvents = a > 3 ? 'none' : '';
  });
  const d = design();
  $('#dName').textContent = d.n; $('#dCat').textContent = catName(d.c) + (d.anim ? ' · живая открытка' : '');
  $('#dPos').textContent = (st.idx + 1) + ' / ' + L.length;
  drawSugg();
}
const stepCF = k => { const L = list(); st.idx = (st.idx + k + L.length) % L.length; layoutCF(); };
$('#cfl').innerHTML = IC.back; $('#cfr').innerHTML = IC.arrow;
$('#cfl').onclick = () => stepCF(-1); $('#cfr').onclick = () => stepCF(1);
addEventListener('keydown', e => { if (st.step !== 0 || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return; if (e.key === 'ArrowLeft') stepCF(-1); if (e.key === 'ArrowRight') stepCF(1); });
let sx = null; $('#stage').addEventListener('pointerdown', e => sx = e.clientX);
$('#stage').addEventListener('pointerup', e => { if (sx !== null && st.step === 0 && Math.abs(e.clientX - sx) > 40) stepCF(e.clientX < sx ? 1 : -1); sx = null; });

/* ================= ШАГ 2: сумма или услуги ================= */
const AMTS = [3000, 5000, 7000, 10000, 15000, 20000, 25000, 30000];
$('#amts').innerHTML = AMTS.map(v => `<button data-v="${v}">${rub(v)}</button>`).join('');
let shown = 5000;
function countTo(to) {
  const from = shown, t0 = performance.now();
  (function f(t) { const k = Math.min(1, (t - t0) / 500), v = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))); $('#big').innerHTML = rub(v).replace(' ₽', '') + ' <small>₽</small>'; shown = v; if (k < 1) requestAnimationFrame(f); })(t0);
}
const setSum = (v, src) => { st.sum = Math.max(0, Math.round(+v || 0)); if (src !== 'rng') $('#rng').value = Math.min(50000, Math.max(1000, st.sum)); if (src !== 'amt') $('#amt').value = st.sum || ''; $$('#amts button').forEach(b => b.classList.toggle('on', +b.dataset.v === st.sum)); countTo(st.sum); render(); };
$$('#amts button').forEach(b => b.onclick = () => setSum(b.dataset.v));
$('#rng').oninput = e => setSum(e.target.value, 'rng');
$('#amt').oninput = e => setSum(e.target.value, 'amt');
$$('#mode button').forEach(b => b.onclick = () => { st.mode = b.dataset.v; $$('#mode button').forEach(x => x.classList.toggle('on', x === b)); $('#sumBox').hidden = st.mode !== 'sum'; $('#svcBox').hidden = st.mode !== 'svc'; render(); });
const ALL = PRICES.flatMap(c => c.g.flatMap(g => g.s.filter(s => minOf(s[1]) > 0).map(s => ({ c: c.c, n: s[0], p: minOf(s[1]), from: Array.isArray(s[1]) }))));
function drawSvc() {
  const q = $('#svq').value.toLowerCase().replace(/ё/g, 'е').trim();
  const f = ALL.filter(x => !q || (x.n + ' ' + x.c).toLowerCase().replace(/ё/g, 'е').includes(q));
  $('#svlist').innerHTML = [...new Set(f.map(x => x.c))].map(c => `<h6>${c}</h6>` + f.filter(x => x.c === c).map(x => { const k = x.c + '|' + x.n; return `<label><input type="checkbox" data-k="${k}"${st.svc.has(k) ? ' checked' : ''}><span>${x.n}</span><b>${x.from ? 'от ' : ''}${rub(x.p)}</b></label>`; }).join('')).join('') || '<p class="hintline" style="padding:14px">Ничего не нашли</p>';
  $$('#svlist input').forEach(i => i.onchange = () => { const x = ALL.find(a => a.c + '|' + a.n === i.dataset.k); i.checked ? st.svc.set(i.dataset.k, x) : st.svc.delete(i.dataset.k); render(); });
}
$('#svq').oninput = drawSvc; drawSvc();

/* ================= ШАГ 3: кому ================= */
const RELS = [['Любимой', '♥'], ['Маме', '✿'], ['Подруге', '✦'], ['Коллеге', '✓'], ['Себе', '✧'], ['Другое', '◆']];
$('#rels').innerHTML = RELS.map(([t, i]) => `<button data-v="${t}"><i>${i}</i>${t}</button>`).join('');
$$('#rels button').forEach(b => b.onclick = () => { st.rel = b.dataset.v; $$('#rels button').forEach(x => x.classList.toggle('on', x === b)); $('#to').placeholder = st.rel === 'Себе' ? 'Ваше имя (необязательно)' : 'Имя получателя'; drawSugg(); render(); });

/* ================= ШАГ 4: пожелание ================= */
const WISH = {
  'Любимой': ['Ты заслуживаешь самого лучшего', 'Просто потому что люблю', 'Отдыхай, моя хорошая'],
  'Маме': ['Мама, спасибо за всё. Время для себя!', 'Самой красивой маме', 'Пусть этот день будет только твоим'],
  'Подруге': ['Сияй, подруга!', 'Время для красоты и отдыха', 'Ты лучшая — порадуй себя'],
  'Коллеге': ['Спасибо за отличную работу!', 'Небольшой подарок от команды', 'Отдохните и наберитесь сил'],
  'Себе': ['Потому что я этого достойна', 'Время для себя', 'Маленький праздник для себя'],
  ny: ['Пусть новый год начнётся с заботы о себе', 'Чудес, красоты и отдыха!'], bd: ['С днём рождения! Пусть этот год будет красивым'], m8: ['С праздником весны и красоты!']
};
function drawSugg() { const w = [...(WISH[st.rel] || []), ...(WISH[design().c] || [])].slice(0, 5); const s = w.length ? w : ['Время для себя', 'Отдыхай и сияй!', 'С любовью']; $('#sugg').innerHTML = s.map(x => `<button type="button">${x}</button>`).join(''); $$('#sugg button').forEach(b => b.onclick = () => { $('#wish').value = b.textContent; render(); }); }
['to', 'from', 'wish', 'contact', 'dDate', 'dTime'].forEach(id => $('#' + id).addEventListener('input', render));

/* ================= ШАГ 5: доставка ================= */
const SMS = '<svg viewBox="0 0 24 24"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/></svg>';
const MAIL = '<svg viewBox="0 0 24 24"><path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 2.3V17h16V7.3l-8 5.4-8-5.4ZM5.6 7 12 11.3 18.4 7H5.6Z"/></svg>';
const GIFT = '<svg viewBox="0 0 24 24"><path d="M20 7h-2.2A3 3 0 0 0 12 4.4 3 3 0 0 0 6.2 7H4a1 1 0 0 0-1 1v3h18V8a1 1 0 0 0-1-1ZM9 7a1 1 0 1 1 2-.1V7H9Zm4 0v-.1A1 1 0 1 1 15 7h-2ZM4 13v6a1 1 0 0 0 1 1h6v-7H4Zm9 7h6a1 1 0 0 0 1-1v-6h-7v7Z"/></svg>';
const CH = {
  tg: ['Telegram', 'получателю', IC.tg, '@username или телефон', ''], wa: ['WhatsApp', 'получателю', IC.wa, '+7 900 000-00-00', ''],
  sms: ['SMS', 'получателю', SMS, '+7 900 000-00-00', ''], mail: ['E-mail', 'получателю', MAIL, 'name@mail.ru', ''],
  self: ['Себе', 'подарю лично', GIFT, '', 'PDF с сертификатом придёт вам — распечатайте или перешлите сами.'],
  box: ['Конверт', 'в салоне', GIFT, '', 'Сертификат в фирменном конверте будет ждать на ресепшен: Осинская, 8, ежедневно 10:00–20:00.']
};
$('#chans').innerHTML = Object.entries(CH).map(([k, c]) => `<button data-v="${k}"${k === st.ch ? ' class="on"' : ''}>${c[2]}<span>${c[0]}<small>${c[1]}</small></span></button>`).join('');
$$('#chans button').forEach(b => b.onclick = () => { st.ch = b.dataset.v; $$('#chans button').forEach(x => x.classList.toggle('on', x === b)); chanUI(); render(); });
function chanUI() { const c = CH[st.ch]; $('#contactBox').style.display = c[3] ? '' : 'none'; $('#contact').placeholder = 'Куда отправить: ' + c[3]; $('#chNote').textContent = c[4]; $('#chNote').style.display = c[4] ? '' : 'none'; $('#when').style.display = c[3] ? '' : 'none'; $('#dt').style.display = c[3] ? '' : 'none'; }
$('#when').innerHTML = [['now', 'Сразу после оплаты'], ['ny', 'В новогоднюю ночь · 00:00'], ['date', 'Выбрать дату и время']].map(([k, t]) => `<button data-v="${k}"${k === st.when ? ' class="on"' : ''}>${t}</button>`).join('');
$$('#when button').forEach(b => b.onclick = () => { st.when = b.dataset.v; $$('#when button').forEach(x => x.classList.toggle('on', x === b)); $('#dt').classList.toggle('on', st.when === 'date'); render(); });
$('#dDate').min = new Date().toISOString().slice(0, 10); $('#dDate').value = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
chanUI();
function whenText() {
  if (st.ch === 'self') return 'вам, сразу после оплаты';
  if (st.ch === 'box') return 'на ресепшен, сразу после оплаты';
  if (st.when === 'ny') return '1 января в 00:00';
  if (st.when === 'date') { const d = $('#dDate').value; return d ? new Date(d + 'T00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) + ' в ' + $('#dTime').value : 'выберите дату'; }
  return 'сразу после оплаты';
}

/* ================= ШАГ 6: проверка ================= */
$('#qm').onclick = () => { st.qty = Math.max(1, st.qty - 1); render(); };
$('#qp').onclick = () => { st.qty = Math.min(20, st.qty + 1); render(); };

/* ================= ПРЕВЬЮ ================= */
const num = 'DJ-27-' + String(Math.floor(1000 + Math.random() * 9000));
const QR = (() => { seed = +num.slice(-4); return Array.from({ length: 81 }, (_, i) => { const r = Math.floor(i / 9), c = i % 9, eye = (r < 3 && c < 3) || (r < 3 && c > 5) || (r > 5 && c < 3); const on = eye ? !((r % 8 === 1) && (c % 8 === 1)) : rnd() > .5; return `<i${on ? '' : ' class="o"'}></i>`; }).join(''); })();
function render() {
  const d = design(), v = value(), to = $('#to').value.trim(), from = $('#from').value.trim(), w = $('#wish').value.trim();
  $('#wcn').textContent = w.length;
  $('#front').innerHTML = card(d, v.text, v.svc, esc(to));
  $('#back').innerHTML = `<div class="in"><div class="l"><h5>Ключ от Дома D'ajour</h5><div class="no">№ ${num}</div><div class="msgt">${w ? '«' + esc(w) + '»' : 'Здесь появится ваше пожелание'}</div>${from ? `<div class="sig">— ${esc(from)}</div>` : ''}<div class="ft2">${v.list.length ? esc(v.list.map(x => x.n).join(' · ')) + '<br>' : ''}Запишитесь и назовите номер · Пермь, Осинская, 8</div></div><div class="r"><div class="qr">${QR}</div><small>Покажите на ресепшен</small></div></div>`;
  $('#svSum').textContent = v.svc ? (v.list.length ? `Выбрано: ${v.list.length} · ${rub(v.n)}` : 'Отметьте одну или несколько услуг') : '';
  const c = CH[st.ch];
  $('#rev').innerHTML = [[0, 'Открытка', d.n], [1, v.svc ? 'Услуги' : 'Номинал', v.svc ? v.list.map(x => x.n).join(', ') || '—' : rub(v.n)], [2, 'Кому', (st.rel ? st.rel + (to ? ' · ' + to : '') : '—')], [3, 'Пожелание', w || '—'], [4, 'Доставка', (c[3] ? c[0] + ' · ' + ($('#contact').value || '—') : c[0] + ' · ' + c[1]) + ', ' + whenText()]].map(([i, a, b]) => `<div><dt>${a}</dt><dd>${esc(String(b))}</dd><button data-i="${i}">Изменить</button></div>`).join('');
  $$('#rev button').forEach(b => b.onclick = () => go(+b.dataset.i));
  $('#qn').textContent = st.qty; $('#tot').textContent = v.n ? rub(v.n * st.qty) : '—';
  if (st.step === 5) $('#next').textContent = 'Оплатить ' + rub(v.n * st.qty);
  if (st.step === 0) $$('#cf .it .val').forEach(x => x.textContent = v.svc ? '' : v.text);
}

/* наклон карты за курсором */
const one = $('#one'), tilt = $('#tilt');
$('#stage').addEventListener('pointermove', e => { if (!one.classList.contains('on')) return; const r = $('#stage').getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; tilt.style.transform = `rotateY(${x * 18}deg) rotateX(${-y * 12}deg)`; const g = $('#front .gcard'); if (g) { g.style.setProperty('--mx', (x + .5) * 100 + '%'); g.style.setProperty('--my', (y + .5) * 100 + '%'); } });
$('#stage').addEventListener('pointerleave', () => tilt.style.transform = '');
$('#flipb').onclick = () => { st.back = !st.back; one.classList.toggle('back', st.back); };

/* ================= ФИНАЛ ================= */
function finish() {
  const v = value(), to = $('#to').value.trim(), c = CH[st.ch];
  $('#envCard').innerHTML = card(design(), v.text, v.svc, esc(to));
  $('#codes').innerHTML = Array.from({ length: st.qty }, (_, i) => `<span>${num.slice(0, -4)}${String(+num.slice(-4) + i).padStart(4, '0')}</span>`).join('');
  $('#doneTxt').innerHTML = (to ? 'Получатель: ' + esc(to) + '. ' : '') + (c[3] ? `${st.qty > 1 ? 'Сертификаты придут' : 'Сертификат придёт'} в ${c[0]} — ${whenText()}.` : c[4]) + ` К оплате ${rub(v.n * st.qty)}.`;
  const dn = $('#done'); dn.classList.toggle('on', false); void dn.offsetWidth; dn.classList.add('on');
  $('#wiz').scrollIntoView({ behavior: 'smooth' });
}
$('#again').onclick = () => { $('#done').classList.toggle('on', false); st.max = 0; go(0); };

drawCF(); setSum(5000); go(0);
snow($('.wiz .snow'), 60);
watch();
