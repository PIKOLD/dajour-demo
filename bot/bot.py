"""ИИ-администратор «Дом D'ajour» в Telegram.

Запуск:  python bot.py      (нужен TELEGRAM_BOT_TOKEN в .env)
Проверка без Telegram:  python bot.py --console
"""
import json, re, sys, time, datetime as dt, urllib.parse
from common import env, http, SALON, price_text
from yclients import YClients
from brain import Brain, find_services

TG = f'https://api.telegram.org/bot{env("TELEGRAM_BOT_TOKEN")}'
ADMIN = env('ADMIN_CHAT_ID')          # куда слать заявки на перманент и уведомления о записях
yc = YClients()
SERVICES = yc.services()
brain = Brain(SERVICES)
CATS = list(dict.fromkeys(s['cat'] for s in SERVICES))
WD = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
MON = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
S = {}                                # состояние по чатам


def kb(rows):
    return {'inline_keyboard': [[{'text': t[:60], 'callback_data': d} for t, d in r] for r in rows]}


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
    data = {'chat_id': chat, 'text': text, 'disable_web_page_preview': True}
    if markup:
        data['reply_markup'] = markup
    http('POST', f'{TG}/sendMessage', data=data)


def day_label(iso):
    d = dt.date.fromisoformat(iso)
    return f'{WD[d.weekday()]} {d.day} {MON[d.month - 1]}'


# ---------- сценарии ----------
def start(chat):
    S[chat] = {'h': [], 'step': None}
    demo = '\n\n(Демо-режим: запись тестовая, в салон не уходит.)' if yc.demo else ''
    send(chat, f"Здравствуйте! Я ИИ-администратор «{SALON['name']}» 🌿\nЗапишу на услугу, подскажу цены и адрес. Можно просто написать, что хотите — например «маникюр в субботу».{demo}", MENU)


def show_services(chat, lst, title='Выберите услугу:'):
    st = S[chat]; st['cands'] = lst; st['step'] = 'svc'
    send(chat, title, kb([[(f'{s["name"]} · {price_text(s["price"])}', f's:{i}')] for i, s in enumerate(lst[:20])]
                         + [[('🔎 Другая услуга', 'm:book')]]))


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
        http('POST', f'{TG}/sendMessage', data={'chat_id': chat, 'text': 'Проверьте, пожалуйста 👇', 'reply_markup': {'remove_keyboard': True}})
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


# ---------- входящие ----------
def on_text(chat, text, contact=None):
    st = S.setdefault(chat, {'h': [], 'step': None})
    if text in ('/start', '/menu'):
        return start(chat)
    step = st.get('step')
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
        return send(chat, (r.get('reply') or '') + '\n\nВыберите направление:', kb([[(c, f'c:{i}')] for i, c in enumerate(CATS)]))
    if intent == 'human':
        return send(chat, f'{r.get("reply", "")}\n📞 {SALON["phone"]}\n{SALON["messengers"]}')
    send(chat, r.get('reply') or 'Подскажу! Что вас интересует?', MENU if not st['h'][:-2] else None)


def on_button(chat, d):
    st = S.setdefault(chat, {'h': [], 'step': None})
    if d == 'm:book':
        return send(chat, 'Напишите услугу (например «маникюр с покрытием») или выберите направление:', kb([[(c, f'c:{i}')] for i, c in enumerate(CATS)]))
    if d == 'm:price':
        return send(chat, 'Цены по направлениям:', kb([[(c, f'p:{i}')] for i, c in enumerate(CATS)]))
    if d == 'm:pm':
        st['step'] = None; return pm_next(chat)
    if d == 'm:addr':
        return send(chat, f'📍 {SALON["address"]}, {SALON["hours"]}\nМаршрут: {SALON["map_url"]}\n📞 {SALON["phone"]}\n{SALON["messengers"]}', MENU)
    kind, _, v = d.partition(':')
    if kind == 'c':
        return show_services(chat, [s for s in SERVICES if s['cat'] == CATS[int(v)]], f'{CATS[int(v)]}:')
    if kind == 'p':
        lst = [s for s in SERVICES if s['cat'] == CATS[int(v)]]
        return send(chat, f'{CATS[int(v)]}\n' + '\n'.join(f'• {s["name"]} — {price_text(s["price"])}' for s in lst), kb([[('📅 Записаться', f'c:{v}')], [('← Меню', 'menu')]]))
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
                    on_button(cq['message']['chat']['id'], cq['data'])
                elif 'message' in u:
                    m = u['message']
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
