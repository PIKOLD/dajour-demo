"""ИИ-администратор «Дом D'ajour» в Telegram.

Запуск:  python bot.py      (нужен TELEGRAM_BOT_TOKEN в .env)
Проверка без Telegram:  python bot.py --console
"""
import html, json, re, sys, time, datetime as dt, urllib.parse
from common import env, http, SALON, price_text
from yclients import YClients
from brain import Brain, find_services

TG = f'https://api.telegram.org/bot{env("TELEGRAM_BOT_TOKEN")}'
ADMIN = env('ADMIN_CHAT_ID')
MINIAPP = env('MINIAPP_URL', 'https://pikold.github.io/dajour-demo/demo/tg/')
BOT_LINK = ''                         # ссылка на бота для открытки-сертификата (заполняется при запуске)
APP_KB = {'keyboard': [[{'text': '✨ Записаться онлайн', 'web_app': {'url': MINIAPP}}]], 'resize_keyboard': True, 'is_persistent': True}          # куда слать заявки на перманент и уведомления о записях
yc = YClients()
SERVICES = yc.services()
brain = Brain(SERVICES)
CATS = list(dict.fromkeys(s['cat'] for s in SERVICES))
WD = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
MON = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
S = {}                                # состояние по чатам


def kb(rows):
    return {'inline_keyboard': [[{'text': t[:60], 'callback_data': d} for t, d in r] for r in rows]}


EMO = {'Ногтевой сервис': '💅 Ногти', 'Парикмахерские услуги': '💇‍♀️ Волосы', 'Макияж и причёски': '💄 Макияж и причёски',
       'Ресницы и брови': '👁 Ресницы и брови', 'Массаж': '💆‍♀️ Массаж', 'Косметология': '✨ Косметология',
       'Перманентный макияж': '🖋 Перманент', 'Удаление тату и татуажа': '🫧 Удаление тату'}
PAGE = 8
esc = html.escape


def cat_kb(prefix='c'):
    items = [(EMO.get(c, c), f'{prefix}:{i}') for i, c in enumerate(CATS)]
    return kb([items[j:j + 2] for j in range(0, len(items), 2)])


def dur(m):
    return '' if not m else (f'{m // 60} ч' + (f' {m % 60} мин' if m % 60 else '') if m >= 60 else f'{m} мин')


def edit(chat, mid, text, markup=None):
    if CONSOLE or not mid:
        return send(chat, text, markup)
    data = {'chat_id': chat, 'message_id': mid, 'text': text, 'parse_mode': 'HTML', 'disable_web_page_preview': True}
    if markup:
        data['reply_markup'] = markup
    http('POST', f'{TG}/editMessageText', data=data)


MENU = kb([[('📅 Записаться', 'm:book'), ('💳 Цены', 'm:price')], [('✨ Перманент', 'm:pm'), ('📍 Адрес и связь', 'm:addr')]])


# ---------- отправка (Telegram или консоль) ----------
CONSOLE = '--console' in sys.argv


def send(chat, text, markup=None):
    if CONSOLE:
        print('\n🤖', text)
        if markup and 'inline_keyboard' in markup:
            for r in markup['inline_keyboard']:
                print('   ', ' | '.join(f'[{b["callback_data"]}] {b["text"]}' for b in r))
        return
    data = {'chat_id': chat, 'text': text, 'disable_web_page_preview': True, 'parse_mode': 'HTML'}
    if markup:
        data['reply_markup'] = markup
    code, _ = http('POST', f'{TG}/sendMessage', data=data)
    if code == 400:                    # не разобрался HTML — шлём простым текстом
        data.pop('parse_mode'); http('POST', f'{TG}/sendMessage', data=data)


def day_label(iso):
    d = dt.date.fromisoformat(iso)
    return f'{WD[d.weekday()]} {d.day} {MON[d.month - 1]}'


# ---------- сценарии ----------
def start(chat):
    S[chat] = {'h': [], 'step': None}
    demo = '\n\n(Демо-режим: запись тестовая, в салон не уходит.)' if yc.demo else ''
    send(chat, f"Здравствуйте! Я ИИ-администратор «{SALON['name']}» 🌿\nЗапишу на услугу, подскажу цены и адрес. Можно просто написать, что хотите — например «маникюр в субботу».{demo}", MENU)
    if not CONSOLE:
        send(chat, 'А ещё можно записаться в красивом окне — кнопка внизу 👇', APP_KB)


def show_services(chat, lst, title='Выберите услугу', page=0, mid=None):
    st = S[chat]; st.update(cands=lst, title=title, step='svc')
    pages = max(1, -(-len(lst) // PAGE)); page = max(0, min(page, pages - 1))
    part = lst[page * PAGE:(page + 1) * PAGE]
    lines = [f'<b>{page * PAGE + k + 1}.</b> {esc(s["name"])} — <b>{price_text(s["price"])}</b>' + (f' · {dur(s.get("minutes"))}' if s.get('minutes') else '')
             for k, s in enumerate(part)]
    head = f'<b>{esc(title)}</b>' + (f'  ·  стр. {page + 1}/{pages}' if pages > 1 else '')
    text = head + '\n\n' + '\n'.join(lines) + '\n\nНажмите номер услуги 👇'
    nums = [(str(page * PAGE + k + 1), f's:{page * PAGE + k}') for k in range(len(part))]
    rows = [nums[j:j + 4] for j in range(0, len(nums), 4)]
    nav = ([('← Назад', f'pg:{page - 1}')] if page else []) + ([('Ещё →', f'pg:{page + 1}')] if page < pages - 1 else [])
    rows += ([nav] if nav else []) + [[('🔎 Другая услуга', 'm:book')]]
    (edit(chat, mid, text, kb(rows)) if mid else send(chat, text, kb(rows)))


def show_category(chat, ci, mid=None):
    lst = [s for s in SERVICES if s['cat'] == CATS[ci]]
    groups = list(dict.fromkeys(s.get('group', '') for s in lst))
    if len(groups) > 1 and len(lst) > PAGE:
        btn = [(f'{g or "Основные услуги"} · {sum(1 for s in lst if s.get("group", "") == g)}', f'g:{ci}:{gi}') for gi, g in enumerate(groups)]
        text = f'<b>{EMO.get(CATS[ci], CATS[ci])}</b>\n\nВыберите раздел:'
        rows = [btn[j:j + 2] for j in range(0, len(btn), 2)] + [[('← Все направления', 'm:book')]]
        return edit(chat, mid, text, kb(rows)) if mid else send(chat, text, kb(rows))
    show_services(chat, lst, EMO.get(CATS[ci], CATS[ci]), 0, mid)


def ask_dates(chat):
    st = S[chat]
    try:
        st['dates'] = yc.dates(st['svc']['id'])
    except Exception as e:
        return fail(chat, e)
    rows = [[(day_label(d), f'd:{i}') for i, d in enumerate(st['dates'][j:j + 2], j)] for j in range(0, len(st['dates']), 2)]
    st['step'] = 'date'
    send(chat, f'«{st["svc"]["name"]}» — {price_text(st["svc"]["price"])}. Какой день удобен?', kb(rows))


def ask_times(chat, i):
    st = S[chat]; st['date'] = st['dates'][i]
    try:
        st['slots'] = yc.times(st['svc']['id'], st['date'])
    except Exception as e:
        return fail(chat, e)
    if not st['slots']:
        return send(chat, f'На {day_label(st["date"])} свободных окон нет. Выберите другой день:', kb([[(day_label(d), f'd:{k}')] for k, d in enumerate(st['dates']) if k != i][:6]))
    rows = [[(s['time'], f't:{k}') for k, s in enumerate(st['slots'][j:j + 4], j)] for j in range(0, len(st['slots']), 4)]
    st['step'] = 'time'
    send(chat, f'{day_label(st["date"])}, свободное время:', kb(rows + [[('← Другой день', 'back:date')]]))


def ask_name(chat, k):
    st = S[chat]; st['slot'] = st['slots'][k]; st['step'] = 'name'
    send(chat, f'Отлично, {day_label(st["date"])} в {st["slot"]["time"]}. Как вас зовут?')


def ask_phone(chat):
    S[chat]['step'] = 'phone'
    m = None if CONSOLE else {'keyboard': [[{'text': '📱 Отправить номер', 'request_contact': True}]], 'resize_keyboard': True, 'one_time_keyboard': True}
    send(chat, 'И номер телефона для подтверждения записи:', m)


def confirm(chat):
    st = S[chat]; st['step'] = 'confirm'
    if not CONSOLE:
        http('POST', f'{TG}/sendMessage', data={'chat_id': chat, 'text': 'Проверьте, пожалуйста 👇', 'reply_markup': APP_KB})
    send(chat, f'📋 {st["svc"]["name"]}\n🗓 {day_label(st["date"])}, {st["slot"]["time"]}\n💳 {price_text(st["svc"]["price"])}\n👤 {st["name"]}, {st["phone"]}',
         kb([[('✅ Записаться', 'ok'), ('✖️ Отмена', 'no')]]))


def do_book(chat):
    st = S[chat]
    try:
        r = yc.book(st['svc']['id'], st['slot'], st['name'], st['phone'])
    except Exception as e:
        return fail(chat, e)
    tail = '\n\n(Демо-режим: это тестовая запись.)' if r['demo'] else ''
    send(chat, f'Готово, вы записаны! ✨\n{st["svc"]["name"]}, {day_label(st["date"])} в {st["slot"]["time"]}.\nЖдём вас: {SALON["address"]}. Номер записи: {r["record_id"]}{tail}', MENU)
    notify(f'🆕 Запись через бота: {st["svc"]["name"]}, {day_label(st["date"])} {st["slot"]["time"]} — {st["name"]}, {st["phone"]}' + (' [демо]' if r['demo'] else ''))
    S[chat] = {'h': st['h'], 'step': None}


PM_Q = [('Какая зона интересует?', [('Брови', 'pm:Брови'), ('Губы', 'pm:Губы')], [('Межресничка', 'pm:Межресничка'), ('Удаление тату/татуажа', 'pm:Удаление')]),
        ('Делали раньше перманент в этой зоне?', [('Впервые', 'pm:Впервые'), ('Коррекция у нас', 'pm:Коррекция')], [('Перекрыть чужую работу', 'pm:Перекрытие')]),
        ('Есть ли то, что мастеру важно знать заранее (беременность или кормление, аллергии, приём лекарств)? Напишите в ответ или нажмите «Нет».', [('Нет', 'pm:Нет')])]


def pm_next(chat, answer=None):
    st = S[chat]
    if st.get('step') != 'pm':
        st.update(step='pm', pm=[])
    elif answer is not None:
        st['pm'].append(answer)
    n = len(st['pm'])
    if n < len(PM_Q):
        q, *rows = PM_Q[n]
        return send(chat, q, kb(rows))
    st['after'] = 'pm'; st['step'] = 'name'
    send(chat, 'Спасибо! Как к вам обращаться?')


def pm_done(chat):
    st = S[chat]
    notify(f'✨ Заявка на перманент: {st["name"]}, {st["phone"]}\nЗона: {st["pm"][0]}; опыт: {st["pm"][1]}; важно: {st["pm"][2]}')
    send(chat, 'Передала мастеру перманента — она свяжется с вами, подберёт форму, цвет и удобное время 🤍', MENU)
    S[chat] = {'h': st['h'], 'step': None}


def notify(text):
    if ADMIN and not CONSOLE:
        http('POST', f'{TG}/sendMessage', data={'chat_id': ADMIN, 'text': text})
    elif CONSOLE:
        print('   📨 владельцу:', text)


def fail(chat, e):
    print('Ошибка:', e)
    send(chat, f'Не получилось получить расписание 😔 Запишитесь онлайн: {SALON["book_url"]} или позвоните {SALON["phone"]}.', MENU)


# ---------- запись из Mini App ----------
def on_webapp(chat, raw, first_name=''):
    st = S.setdefault(chat, {'h': [], 'step': None})
    try:
        d = json.loads(raw)
    except ValueError:
        return
    if d.get('type') == 'pm':
        st['step'] = None
        send(chat, 'Перманент мастер согласует лично — задам 3 коротких вопроса 🤍')
        return pm_next(chat)
    if d.get('type') == 'cert':
        return on_cert(chat, d)
    svc = next((s for s in SERVICES if s['id'] == d.get('svc')), None)
    if not svc:
        return send(chat, 'Не нашла услугу — выберите, пожалуйста, ещё раз.', MENU)
    st.update(svc=svc, date=d['date'])
    try:
        slots = yc.times(svc['id'], d['date'])
    except Exception as e:
        return fail(chat, e)
    slot = next((s for s in slots if s['time'] == d.get('time')), None)
    if not slot:
        st['slots'], st['dates'] = slots, [d['date']]
        return send(chat, f'Время {d.get("time")} только что заняли 😔 Свободно {day_label(d["date"])}:',
                    kb([[(s['time'], f't:{k}') for k, s in enumerate(slots[j:j + 4], j)] for j in range(0, len(slots), 4)]) if slots else MENU)
    st.update(slot=slot, name=(d.get('name') or first_name or 'Гость')[:40])
    phone = re.sub(r'[^\d+]', '', d.get('phone') or '') or st.get('last_phone', '')
    if len(re.sub(r'\D', '', phone)) < 10:
        return ask_phone(chat)
    st['phone'] = phone
    do_book(chat)


def on_cert(chat, d):
    """Подарочный сертификат из Mini App: подтверждение, открытка для пересылки, уведомление владельцу."""
    import random
    st = S.setdefault(chat, {'h': [], 'step': None})
    num = f'DJ-27-{random.randint(1000, 9999)}'
    sum_ = f'{int(d.get("sum") or 0):,} ₽'.replace(',', ' ')
    to = esc(d.get('to') or ('себе' if d.get('rel') == 'Себе' else 'получателю'))
    wish, frm = esc(d.get('wish') or ''), esc(d.get('from') or '')
    phone = re.sub(r'[^\d+]', '', d.get('phone') or '') or st.get('last_phone', '')
    how = 'пришлю сюда — перешлите получателю' if d.get('dlv') == 'chat' else 'заберёте в салоне в конверте'
    demo = '\n\n<i>Демо: оплата не подключена — администратор свяжется и пришлёт ссылку на оплату.</i>'
    send(chat, f'🎁 <b>Сертификат оформлен!</b>\n\nОткрытка «{esc(d.get("design", ""))}» · <b>{sum_}</b>\nДля: {to}' + (f'\n«{wish}»' if wish else '')
         + (f'\nОт: {frm}' if frm else '') + f'\n\nНомер: <code>{num}</code>\nВручение: {how}.{demo}', MENU)
    if d.get('dlv') == 'chat':
        send(chat, f'🎁 <b>Тебе подарок — сертификат в «{SALON["name"]}»</b>\n\nНоминал: <b>{sum_}</b> на любые услуги салона' + (f'\n\n«{wish}»' if wish else '')
             + (f'\n— {frm}' if frm else '') + f'\n\nНомер сертификата: <code>{num}</code>\n📍 {SALON["address"]}, {SALON["hours"]}\nЗаписаться: {BOT_LINK or SALON["book_url"]}')
    notify(f'🎁 Сертификат через бота: {sum_}, открытка «{d.get("design")}», получатель: {d.get("to") or d.get("rel")}. Покупатель: {d.get("name")}, {phone or "телефон не указан"}. Номер {num}. Вручение: {how}.')


# ---------- входящие ----------
def on_text(chat, text, contact=None):
    st = S.setdefault(chat, {'h': [], 'step': None})
    if text in ('/start', '/menu'):
        return start(chat)
    step = st.get('step')
    if contact and step != 'phone':
        st['last_phone'] = re.sub(r'[^\d+]', '', contact)
        return
    if step == 'name' and text:
        st['name'] = text.strip()[:40]
        return ask_phone(chat)
    if step == 'phone':
        ph = re.sub(r'[^\d+]', '', contact or text or '')
        if len(re.sub(r'\D', '', ph)) < 10:
            return send(chat, 'Похоже, в номере ошибка. Напишите в формате +7 900 000-00-00')
        st['phone'] = ph
        return pm_done(chat) if st.get('after') == 'pm' else confirm(chat)
    if step == 'pm' and len(st['pm']) == 2:            # свободный ответ на 3-й вопрос
        return pm_next(chat, text)
    # всё остальное — к ИИ
    r = brain.ask(text, st['h'])
    st['h'] += [{'role': 'user', 'text': text}, {'role': 'assistant', 'text': r.get('reply', '')}]
    intent = r.get('intent')
    if intent == 'pm':
        send(chat, r['reply']); return pm_next(chat)
    if intent == 'book':
        found = find_services(SERVICES, r.get('query') or text)
        if found:
            return show_services(chat, found, r.get('reply') or 'Выберите услугу:')
        return send(chat, (r.get('reply') or '') + '\n\nВыберите направление:', cat_kb())
    if intent == 'human':
        return send(chat, f'{r.get("reply", "")}\n📞 {SALON["phone"]}\n{SALON["messengers"]}')
    send(chat, r.get('reply') or 'Подскажу! Что вас интересует?', MENU if not st['h'][:-2] else None)


def on_button(chat, d, mid=None):
    st = S.setdefault(chat, {'h': [], 'step': None})
    if d == 'm:book':
        return send(chat, 'Напишите услугу (например «маникюр с покрытием») или выберите направление:', cat_kb())
    if d == 'm:price':
        return send(chat, 'Цены по направлениям:', cat_kb('p'))
    if d == 'm:pm':
        st['step'] = None; return pm_next(chat)
    if d == 'm:addr':
        return send(chat, f'📍 {SALON["address"]}, {SALON["hours"]}\nМаршрут: {SALON["map_url"]}\n📞 {SALON["phone"]}\n{SALON["messengers"]}', MENU)
    kind, _, v = d.partition(':')
    if kind == 'c':
        return show_category(chat, int(v), mid)
    if kind == 'g':
        ci, gi = map(int, v.split(':'))
        lst = [s for s in SERVICES if s['cat'] == CATS[ci]]
        g = list(dict.fromkeys(s.get('group', '') for s in lst))[gi]
        return show_services(chat, [s for s in lst if s.get('group', '') == g], f'{EMO.get(CATS[ci], CATS[ci])} · {g or "Основные услуги"}', 0, mid)
    if kind == 'pg' and st.get('cands'):
        return show_services(chat, st['cands'], st.get('title', 'Выберите услугу'), int(v), mid)
    if kind == 'p':
        lst = [s for s in SERVICES if s['cat'] == CATS[int(v)]]
        return send(chat, f'<b>{EMO.get(CATS[int(v)], CATS[int(v)])}</b>\n\n' + '\n'.join(f'• {esc(s["name"])} — <b>{price_text(s["price"])}</b>' for s in lst), kb([[('📅 Записаться', f'c:{v}'), ('← Меню', 'menu')]]))
    if kind == 'menu':
        return send(chat, 'Чем помочь?', MENU)
    if kind == 's' and st.get('cands'):
        st['svc'] = st['cands'][int(v)]; return ask_dates(chat)
    if kind == 'd' and st.get('dates'):
        return ask_times(chat, int(v))
    if kind == 'back':
        return ask_dates(chat)
    if kind == 't' and st.get('slots'):
        return ask_name(chat, int(v))
    if kind == 'ok' and st.get('step') == 'confirm':
        return do_book(chat)
    if kind == 'no':
        S[chat] = {'h': st['h'], 'step': None}; return send(chat, 'Отменила. Чем ещё помочь?', MENU)
    if kind == 'pm':
        return pm_next(chat, v)


# ---------- запуск ----------
def run_telegram():
    if not env('TELEGRAM_BOT_TOKEN'):
        sys.exit('Нет TELEGRAM_BOT_TOKEN в bot/.env — создайте бота у @BotFather и впишите токен.')
    global BOT_LINK
    c, me = http('GET', f'{TG}/getMe')
    if c == 200:
        BOT_LINK = 'https://t.me/' + me['result']['username']
    print(f'Бот запущен. YCLIENTS: {"демо" if yc.demo else "боевой"}, ИИ: {"YandexGPT" if brain.ai else "правила (нет ключа)"}')
    off = 0
    while True:
        code, r = http('GET', f'{TG}/getUpdates?timeout=25&offset={off}', timeout=35)
        if code != 200:
            print('Telegram:', code, r); time.sleep(3); continue
        for u in r.get('result', []):
            off = u['update_id'] + 1
            try:
                if 'callback_query' in u:
                    cq = u['callback_query']
                    http('POST', f'{TG}/answerCallbackQuery', data={'callback_query_id': cq['id']})
                    on_button(cq['message']['chat']['id'], cq['data'], cq['message']['message_id'])
                elif 'message' in u:
                    m = u['message']
                    if 'web_app_data' in m:
                        on_webapp(m['chat']['id'], m['web_app_data']['data'], m.get('from', {}).get('first_name', ''))
                    else:
                        on_text(m['chat']['id'], m.get('text', ''), (m.get('contact') or {}).get('phone_number'))
            except Exception as e:
                print('Ошибка обработки:', e)


def run_console():
    print(f'Консольная проверка. YCLIENTS: {"демо" if yc.demo else "боевой"}, ИИ: {"YandexGPT" if brain.ai else "правила"}.\nПишите как клиент; кнопка — так: [s:0]. Выход — пустая строка.')
    start(1)
    while (line := input('\n👤 ').strip()):
        m = re.fullmatch(r'\[(.+)\]', line)
        on_button(1, m.group(1)) if m else on_text(1, line)


if __name__ == '__main__':
    run_console() if CONSOLE else run_telegram()
