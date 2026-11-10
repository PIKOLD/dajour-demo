/* Окно услуг: раздел → процедуры с ценой и длительностью → «Записаться» (мессенджер или онлайн-запись).
   Нужны common.js (LINKS, ICONS, NAMES) и prices.js (PRICES). Вызов: openCat(номер раздела). */
const CAT_IMG = ['nails', 'hair', 'makeup', 'brows', 'massage', 'cosm', 'lips', 'laser'];
const CAT_NOTE = ['Маникюр, педикюр, покрытие и наращивание', 'Стрижки, укладки, окрашивание и уходы', 'Образ для любого события', 'Наращивание, ламинирование, коррекция', 'Классический и аппаратный', 'Чистки, пилинги, аппаратные и лазерные процедуры', 'Брови, губы, веки', 'Лазерное удаление'];
const rub = p => Array.isArray(p) ? `от ${rub(p[0]).replace(' ₽', '')} до ${rub(p[1])}` : p ? p.toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ₽' : 'бесплатно';
const dur = m => !m ? '' : m < 60 ? `${m} мин` : `${Math.floor(m / 60)} ч${m % 60 ? ' ' + m % 60 + ' мин' : ''}`;
const minPrice = c => Math.min(...c.g.flatMap(g => g.s.map(s => Array.isArray(s[1]) ? s[1][0] : s[1])).filter(Boolean));
const count = c => c.g.reduce((a, g) => a + g.s.length, 0);
const esc = s => s.replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
// строка процедуры
const pRow = (s, cat) => `<div class="pi"><button class="pr" aria-expanded="false" data-n="${esc(s[0])}" data-c="${esc(cat)}"><span class="pn">${esc(s[0])}</span><span class="pd">${dur(s[2])}</span><span class="pp">${rub(s[1])}</span></button></div>`;
const pActs = name => { const t = esc(`Здравствуйте! Хочу записаться: ${name}`);
  return `<div class="pa"><p>Куда отправить заявку? Текст «Хочу записаться: ${esc(name)}» скопируется — останется вставить его в чат.</p><div class="pb">` +
    ['wa', 'tg', 'max', 'vk'].map(k => `<a class="pm" href="${LINKS[k]}" target="_blank" rel="noopener" data-t="${t}">${ICONS[k]}${NAMES[k]}</a>`).join('') +
    `<a class="pm on" href="${LINKS.book}" target="_blank" rel="noopener">Онлайн-запись</a></div></div>`; };
// окно
const sh = document.createElement('div');
sh.className = 'sheet'; sh.setAttribute('aria-hidden', 'true');
sh.innerHTML = `<div class="sheet-bg" data-close></div><aside class="sheet-in" role="dialog" aria-modal="true" aria-label="Услуги и цены"><button class="sheet-x" data-close aria-label="Закрыть">×</button><div class="sheet-body"></div></aside><div class="toast" role="status"></div>`;
document.body.append(sh);
const shBody = sh.querySelector('.sheet-body'), toastEl = sh.querySelector('.toast');
let lastFocus = null;
const toast = t => { toastEl.textContent = t; toastEl.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => toastEl.classList.remove('on'), 2600); };
function openCat(i) {
  const c = PRICES[i]; if (!c) return;
  shBody.innerHTML = `<div class="sheet-h" style="background-image:linear-gradient(0deg,rgba(0,0,0,.72),rgba(0,0,0,.05)),url(img/${CAT_IMG[i]}.jpg)"><span>${count(c)} процедур · от ${rub(minPrice(c))}</span><h3>${esc(c.c)}</h3></div>` +
    c.g.map(g => (g.n ? `<h4>${esc(g.n)}</h4>` : '') + g.s.map(s => pRow(s, c.c)).join('')).join('') +
    `<p class="sheet-f">Цены и длительность — из онлайн-записи салона. Точную стоимость подтвердит администратор.</p>`;
  lastFocus = document.activeElement;
  sh.classList.add('on'); sh.setAttribute('aria-hidden', 'false'); document.documentElement.style.overflow = 'hidden';
  shBody.scrollTop = 0; sh.querySelector('.sheet-x').focus();
}
function closeSheet() { sh.classList.remove('on'); sh.setAttribute('aria-hidden', 'true'); document.documentElement.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
// клики: раскрыть процедуру, скопировать текст, закрыть
document.addEventListener('click', e => {
  const r = e.target.closest('.pr'), m = e.target.closest('.pm[data-t]'), o = e.target.closest('[data-cat]');
  if (o) { e.preventDefault(); openCat(+o.dataset.cat); }
  if (r) { const pi = r.parentElement, was = r.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.pr[aria-expanded="true"]').forEach(x => { x.setAttribute('aria-expanded', 'false'); x.nextElementSibling?.remove(); });
    if (!was) { r.setAttribute('aria-expanded', 'true'); pi.insertAdjacentHTML('beforeend', pActs(r.dataset.n)); } }
  if (m) { navigator.clipboard?.writeText(m.dataset.t); toast('Текст скопирован — вставьте его в чат'); }
  if (e.target.closest('[data-close]')) closeSheet();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && sh.classList.contains('on')) closeSheet(); });
// поиск по всем процедурам: bindSearch(поле, список)
function bindSearch(input, list) {
  const all = PRICES.flatMap(c => c.g.flatMap(g => g.s.map(s => ({ s, c: c.c, k: (s[0] + ' ' + g.n + ' ' + c.c).toLowerCase() }))));
  const run = () => { const q = input.value.trim().toLowerCase();
    if (q.length < 2) { list.innerHTML = ''; list.hidden = true; return; }
    const words = q.split(/\s+/), res = all.filter(x => words.every(w => x.k.includes(w))).slice(0, 14);
    list.hidden = false;
    list.innerHTML = res.length ? res.map(x => pRow(x.s, x.c).replace('<span class="pn">', `<span class="pn"><small>${esc(x.c)}</small>`)).join('') : '<p class="none">Ничего не нашлось. Напишите администратору — подскажем.</p>'; };
  input.addEventListener('input', run);
}
