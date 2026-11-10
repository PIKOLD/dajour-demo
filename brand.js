/* Фирменные элементы «Дом D'ajour»: ветки эвкалипта, строки мессенджеров, работы мастеров */
const MSUB = { wa: 'Чат с администратором', tg: 'Мы в Telegram', max: 'Чат с администратором', vk: 'Сообщество салона', ig: 'Работы и новости', tel: '+7 952 656-44-84' };
const WORKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => `img/w${n}.jpg`);
// строки «Напишите нам» — как в таплинке: иконка, название, подпись, стрелка
const mrows = keys => keys.map(k => `<a class="mr" href="${LINKS[k]}" ${k !== 'tel' ? 'target="_blank" rel="noopener"' : ''}><span class="mi">${ICONS[k]}</span><span class="mt"><b>${NAMES[k]}</b><small>${MSUB[k]}</small></span><i>→</i></a>`).join('');
// ветка эвкалипта: круглые листья вдоль изогнутого стебля
function branch(n = 9, len = 520, bend = -46) {
  const cols = ['#8fae9d', '#7b9b8a', '#a9c4b4', '#6a8a79'];
  let s = `<path d="M0 0 Q ${len * 0.5} ${bend} ${len} ${bend * 0.25}" fill="none" stroke="#8a6a52" stroke-width="2.4" stroke-linecap="round"/>`;
  for (let i = 0; i < n; i++) {
    const t = (i + 0.7) / n, x = 2 * (1 - t) * t * len * 0.5 + t * t * len, y = 2 * (1 - t) * t * bend + t * t * bend * 0.25;
    const sz = (1 - t * 0.5) * (54 + (i * 37) % 19), side = i % 2 ? 1 : -1, ang = side * (56 + (i * 53) % 26) - t * 12;
    s += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)})"><path d="M0 0C${sz * 0.22} ${-sz * 0.56} ${sz * 0.9} ${-sz * 0.5} ${sz} 0C${sz * 0.9} ${sz * 0.5} ${sz * 0.22} ${sz * 0.56} 0 0Z" fill="${cols[i % 4]}"/><path d="M0 0L${sz * 0.9} 0" stroke="rgba(255,255,255,.3)" stroke-width="1"/></g>`;
  }
  return s;
}
document.querySelectorAll('svg.euc').forEach(el => { el.setAttribute('viewBox', '-30 -130 620 250'); el.innerHTML = branch(+el.dataset.n || 9, 520, +el.dataset.bend || -46); });
document.querySelectorAll('[data-mrows]').forEach(el => { el.innerHTML = mrows(el.dataset.mrows.split(' ')); });
