"""Общее: настройки из .env, HTTP без сторонних библиотек, данные салона."""
import json, os, re, urllib.request, urllib.error, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))


def load_env(path=os.path.join(HERE, '.env')):
    if os.path.exists(path):
        for line in open(path, encoding='utf-8'):
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


load_env()
env = lambda k, d='': os.environ.get(k, d).strip()


def http(method, url, data=None, headers=None, timeout=40):
    """JSON-запрос. Возвращает (код, ответ-словарь)."""
    body = json.dumps(data).encode() if data is not None else None
    h = {'Content-Type': 'application/json', 'Accept': 'application/json'}
    h.update(headers or {})
    req = urllib.request.Request(url, data=body, headers=h, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, json.loads(r.read().decode() or '{}')
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode() or '{}')
        except Exception:
            return e.code, {}


# ---------- данные салона (те же, что на сайте) ----------
SALON = {
    'name': "Дом D'ajour", 'city': 'Пермь', 'address': 'Пермь, ул. Осинская, 8',
    'hours': 'ежедневно 10:00–20:00', 'phone': '+7 952 656-44-84',
    'book_url': 'https://app.arnica.pro/booking/booking?orgid=44585#/main',
    'map_url': 'https://yandex.ru/maps/org/d_ajour/77986565087/',
    'school': 'https://dajour.org',
    'messengers': 'WhatsApp https://wa.me/message/ZLAVOFXOAT5RB1 · Telegram https://t.me/dom_dajour',
}


def load_prices():
    """Прайс из demo/assets/prices.js (выгрузка из онлайн-записи салона)."""
    p = os.path.join(HERE, '..', 'demo', 'assets', 'prices.js')
    txt = open(p, encoding='utf-8').read()
    txt = txt[txt.index('PRICES'):]
    data = json.loads(txt[txt.index('['):txt.rindex(']') + 1])
    out = []
    for cat in data:
        for g in cat['g']:
            for name, price, mins in g['s']:
                out.append({'id': len(out) + 1, 'cat': cat['c'], 'group': g['n'], 'name': name, 'price': price, 'minutes': mins})
    return out


def price_text(p):
    if p == 0:
        return 'бесплатно'
    if isinstance(p, list):
        return f'от {p[0]:,} ₽'.replace(',', ' ') if not p[1] else f'{p[0]:,}–{p[1]:,} ₽'.replace(',', ' ')
    return f'{p:,} ₽'.replace(',', ' ')


def norm(s):
    return re.sub(r'[^а-яёa-z0-9 ]', ' ', s.lower()).replace('ё', 'е')
