/* Блоки, которые доводят до записи. Общие для всех версий сайта (нужны SALON и $ / $$ из app.js или core.js).
   Вставляются в элементы с data-conv="rating | reviews | steps | final".
   Внешний вид настраивается CSS-переменными страницы: --cv-bg, --cv-card, --cv-ink, --cv-mut, --cv-acc, --cv-acc-ink, --cv-line, --cv-r, --cv-disp, --cv-sans.
   Липкая кнопка записи на телефоне — если у body есть data-cta. */
(function () {
  const ORG = '77986565087';
  /* Реальные данные с Яндекс Карт (проверено 26.11.2026). Сами отзывы — из официального виджета Яндекса, обновляются сами. */
  const RATING = { v: '4,9', reviews: 200, marks: 317, url: 'https://yandex.ru/maps/org/d_ajour/' + ORG + '/reviews/' };
  const nn = (n, a, b, c) => { const m = n % 100, k = n % 10; return m > 10 && m < 20 ? c : k === 1 ? a : k > 1 && k < 5 ? b : c; };
  const star = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8L12 2.8Z" fill="currentColor"/></svg>';
  const stars = '<span class="cv-st">' + star.repeat(5) + '</span>';
  const ext = 'target="_blank" rel="noopener"';
  const wa = SALON.messengers.find(m => m.k === 'wa'), tg = SALON.messengers.find(m => m.k === 'tg');
  const telHref = 'tel:' + SALON.phone.replace(/[^+\d]/g, '');
  const ic = k => (typeof IC !== 'undefined' && IC[k]) || '';

  const R = {
    rating: () => `<a class="cv-badge" href="${RATING.url}" ${ext} data-goal="reviews">${stars}<b>${RATING.v}</b><span>${RATING.reviews} ${nn(RATING.reviews, 'отзыв', 'отзыва', 'отзывов')} на Яндекс Картах</span></a>`,
    reviews: () => `<div class="cv-rev">
      <div class="cv-score"><b>${RATING.v}</b>${stars}<p>${RATING.marks} ${nn(RATING.marks, 'оценка', 'оценки', 'оценок')} и ${RATING.reviews} ${nn(RATING.reviews, 'отзыв', 'отзыва', 'отзывов')} гостей на Яндекс Картах</p>
        <div class="cv-acts"><a class="cv-btn" href="${SALON.book}" ${ext} data-goal="book">Записаться онлайн</a><a class="cv-btn cv-gh" href="${RATING.url}" ${ext} data-goal="reviews">Все отзывы</a></div>
        <small>Отзывы подгружаются напрямую с Яндекс Карт — их нельзя отредактировать на сайте.</small></div>
      <div class="cv-frame"><iframe title="Отзывы о Доме D'ajour на Яндекс Картах" loading="lazy" data-src="https://yandex.ru/maps-reviews-widget/${ORG}?comments"></iframe></div></div>`,
    steps: () => `<ol class="cv-steps">
      <li><i>1</i><b>Выберите услугу</b><span>Все цены и время — открыто, без звонков</span></li>
      <li><i>2</i><b>Выберите время</b><span>Онлайн-запись работает круглосуточно</span></li>
      <li><i>3</i><b>Приходите</b><span>${SALON.address}, ${SALON.hours.toLowerCase()}</span></li></ol>`,
    final: () => { const o = openNow(); return `<div class="cv-final">
      <span class="cv-live${o.open ? '' : ' off'}">${o.open ? 'Сейчас открыто · до 20:00' : 'Сейчас закрыто · онлайн-запись работает'}</span>
      <h2>Запишитесь за минуту</h2>
      <p>Выберите услугу и удобное время онлайн. Если сомневаетесь, что выбрать, — напишите администратору, подскажем.</p>
      <div class="cv-acts"><a class="cv-btn" href="${SALON.book}" ${ext} data-goal="book">Записаться онлайн</a>${wa ? `<a class="cv-btn cv-gh" href="${wa.url}" ${ext} data-goal="wa">${ic('wa')}WhatsApp</a>` : ''}${tg ? `<a class="cv-btn cv-gh" href="${tg.url}" ${ext} data-goal="tg">${ic('tg')}Telegram</a>` : ''}<a class="cv-btn cv-gh" href="${telHref}" data-goal="call">${SALON.phone}</a></div></div>`; }
  };
  $$('[data-conv]').forEach(el => { const f = R[el.dataset.conv]; if (f) el.innerHTML = f(); });

  /* виджет отзывов грузится, только когда до него доскроллили */
  $$('.cv-frame iframe').forEach(f => new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { f.src = f.dataset.src; o.disconnect(); } }, { rootMargin: '600px' }).observe(f));

  /* липкая кнопка записи на телефоне (появляется после первого экрана) */
  if (document.body.dataset.cta !== undefined) {
    document.body.insertAdjacentHTML('beforeend', `<div class="cv-bar"><a class="cv-b1" href="${SALON.book}" ${ext} data-goal="book">Записаться онлайн</a>${wa ? `<a class="cv-b2" href="${wa.url}" ${ext} aria-label="WhatsApp" data-goal="wa">${ic('wa')}</a>` : ''}${tg ? `<a class="cv-b2" href="${tg.url}" ${ext} aria-label="Telegram" data-goal="tg">${ic('tg')}</a>` : ''}<a class="cv-b2" href="${telHref}" aria-label="Позвонить" data-goal="call"><svg viewBox="0 0 24 24"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z" fill="currentColor"/></svg></a></div>`);
    const bar = $('.cv-bar');
    addEventListener('scroll', () => bar.classList.toggle('on', scrollY > innerHeight * .7), { passive: true });
  }

  /* цели для Яндекс Метрики: клики по записи, мессенджерам, звонку, отзывам (сработают, когда на сайт поставят счётчик с window.YM_ID) */
  document.addEventListener('click', e => {
    const a = e.target.closest('a'); if (!a) return;
    const g = a.dataset.goal || (/arnica|yclients|dikidi/.test(a.href) ? 'book' : /wa\.me/.test(a.href) ? 'wa' : /t\.me/.test(a.href) ? 'tg' : /^tel:/.test(a.href) ? 'call' : '');
    if (g && window.ym && window.YM_ID) ym(window.YM_ID, 'reachGoal', g);
  });

  const css = document.createElement('style');
  css.textContent = `
.cv-badge{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:99px;background:var(--cv-card,#fff);color:var(--cv-ink,#111);border:1px solid var(--cv-line,rgba(0,0,0,.12));font:600 13px/1.2 var(--cv-sans,system-ui);text-decoration:none;transition:transform .25s}
.cv-badge:hover{transform:translateY(-2px)}
.cv-badge b{font-size:15px}.cv-badge span:last-child{opacity:.75;font-weight:500}
.cv-st{display:inline-flex;gap:1px;color:#f5b301}.cv-st svg{width:14px;height:14px}
.cv-rev{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:clamp(20px,4vw,60px);align-items:start}
.cv-score>b{display:block;font:400 clamp(80px,9vw,140px)/.9 var(--cv-disp,serif);color:var(--cv-ink,#111)}
.cv-score .cv-st svg{width:22px;height:22px}
.cv-score p{margin:14px 0 22px;font:500 17px/1.45 var(--cv-sans,system-ui);color:var(--cv-mut,#666);max-width:360px}
.cv-score small{display:block;margin-top:16px;font:400 12px/1.4 var(--cv-sans,system-ui);color:var(--cv-mut,#666);max-width:340px}
.cv-frame{height:560px;border-radius:var(--cv-r,16px);overflow:hidden;background:#fff;border:1px solid var(--cv-line,rgba(0,0,0,.12))}
.cv-frame iframe{width:100%;height:100%;border:0;display:block}
.cv-acts{display:flex;flex-wrap:wrap;gap:10px}
.cv-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:50px;padding:0 22px;border-radius:var(--cv-br,99px);background:var(--cv-acc,#111);color:var(--cv-acc-ink,#fff);font:700 14px var(--cv-sans,system-ui);text-decoration:none;transition:transform .25s,opacity .25s;border:1px solid transparent}
.cv-btn:hover{transform:translateY(-2px)}
.cv-btn svg{width:18px;height:18px;fill:currentColor}
.cv-gh{background:transparent;color:var(--cv-ink,#111);border-color:var(--cv-line,rgba(0,0,0,.2))}
.cv-steps{list-style:none;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;padding:0;margin:0}
.cv-steps li{padding:22px;border-radius:var(--cv-r,16px);background:var(--cv-card,#fff);border:1px solid var(--cv-line,rgba(0,0,0,.12));display:flex;flex-direction:column;gap:6px;color:var(--cv-ink,#111)}
.cv-steps i{font:400 40px/1 var(--cv-disp,serif);font-style:normal;color:var(--cv-acc2,var(--cv-acc,#111));margin-bottom:6px}
.cv-steps b{font:700 18px var(--cv-sans,system-ui)}
.cv-steps span{font:400 14px/1.45 var(--cv-sans,system-ui);color:var(--cv-mut,#666)}
.cv-final{text-align:center;max-width:760px;margin:0 auto;color:var(--cv-ink,#111)}
.cv-final h2{font:400 clamp(40px,5.4vw,80px)/1 var(--cv-disp,serif);margin:16px 0 14px}
.cv-final p{font:400 17px/1.5 var(--cv-sans,system-ui);color:var(--cv-mut,#666);margin:0 auto 26px;max-width:520px}
.cv-final .cv-acts{justify-content:center}
.cv-live{display:inline-flex;align-items:center;gap:8px;font:700 13px var(--cv-sans,system-ui);color:var(--cv-ink,#111)}
.cv-live::before{content:"";width:9px;height:9px;border-radius:50%;background:#2fae5f;box-shadow:0 0 0 4px rgba(47,174,95,.2)}
.cv-live.off::before{background:#d0574b;box-shadow:0 0 0 4px rgba(208,87,75,.2)}
.cv-bar{display:none}
@media(max-width:820px){
  .cv-rev,.cv-steps{grid-template-columns:1fr}
  .cv-frame{height:480px}
  .cv-final .cv-acts .cv-btn{flex:1 1 100%}
  .cv-final h2{font-size:clamp(30px,9vw,56px);overflow-wrap:anywhere}
  .cv-score>b{font-size:clamp(64px,20vw,110px)}
  .cv-bar{display:flex;gap:6px;position:fixed;left:8px;right:8px;bottom:8px;z-index:998;padding:6px;border-radius:20px;background:rgba(20,18,16,.9);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);box-shadow:0 10px 30px rgba(0,0,0,.3);transform:translateY(130%);transition:transform .4s cubic-bezier(.2,.7,.2,1)}
  .cv-bar.on{transform:none}
  .cv-b1{flex:1;display:flex;align-items:center;justify-content:center;height:48px;border-radius:15px;background:var(--cv-bar,var(--cv-acc,#fff));color:var(--cv-bar-ink,var(--cv-acc-ink,#111));font:800 14px var(--cv-sans,system-ui);text-decoration:none}
  .cv-b2{width:48px;height:48px;border-radius:15px;display:grid;place-items:center;background:rgba(255,255,255,.12);color:#fff}
  .cv-b2 svg{width:20px;height:20px;fill:currentColor}
  body[data-cta] .vsw{bottom:78px}
}`;
  document.head.append(css);
})();
