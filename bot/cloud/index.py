"""ИИ-администратор для сайта «Дом D'ajour» — функция Yandex Cloud Functions (Python 3.12).

Сайт шлёт сюда переписку, функция спрашивает Alice AI (AI Studio) и возвращает ответ.
Ключ лежит только в переменных окружения функции — на сайте его нет.

Переменные окружения функции:
  YANDEX_API_KEY   — секрет API-ключа AI Studio
  YANDEX_FOLDER_ID — ID каталога
  YANDEX_MODEL     — aliceai-llm (по умолчанию)
  ALLOWED_ORIGINS  — через запятую, по умолчанию https://pikold.github.io,http://localhost:8765
Точка входа: index.handler
"""
import json, os, re, time, urllib.request

PRICES_URL = 'https://pikold.github.io/dajour-demo/demo/assets/prices.js'
SALON = ("Салон и школа красоты «Дом D'ajour», Пермь, ул. Осинская, 8 (самый центр). Ежедневно 10:00–20:00. "
         "Телефон +7 952 656-44-84. Онлайн-запись: https://app.arnica.pro/booking/booking?orgid=44585#/main . "
         "Telegram-бот для записи: https://t.me/D_ajour_bot . WhatsApp: https://wa.me/message/ZLAVOFXOAT5RB1 . "
         "Школа красоты: https://dajour.org . Подарочные сертификаты собираются на странице sertifikaty.html сайта. "
         "Рейтинг на Яндекс Картах 4,9 (200 отзывов).")
_cache = {'t': 0, 'prompt': ''}
_hits = {}


def prompt():
    if time.time() - _cache['t'] < 3600 and _cache['prompt']:
        return _cache['prompt']
    lines = []
    try:
        txt = urllib.request.urlopen(PRICES_URL, timeout=8).read().decode('utf-8')
        txt = txt[txt.index('PRICES'):]
        data = json.loads(txt[txt.index('['):txt.rindex(']') + 1])
        for c in data:
            lines.append(f'\n## {c["c"]}')
            for g in c['g']:
                for n, p, m in g['s']:
                    pr = 'бесплатно' if p == 0 else (f'от {p[0]} ₽' if isinstance(p, list) and not p[1] else f'{p[0]}–{p[1]} ₽' if isinstance(p, list) else f'{p} ₽')
                    lines.append(f'- {n} — {pr}' + (f', {m} мин' if m else ''))
    except Exception:
        lines.append('(прайс временно недоступен — предложи посмотреть цены на сайте)')
    _cache['prompt'] = f"""Ты — администратор салона на сайте. {SALON}
Пиши по-русски, тепло, коротко (1–4 предложения), без канцелярита. Используй ТОЛЬКО факты ниже. Не придумывай скидки, акции, имена мастеров, свободное время и отзывы.
Свободное время ты не видишь. НЕ вставляй ссылки и адреса сайтов в ответ — кнопки онлайн-записи, Telegram, сертификатов и звонка сайт покажет сам по intent. Для записи просто скажи, что можно выбрать время онлайн или в Telegram.
Перманентный макияж, татуаж, удаление тату — мастер согласует лично: ответь коротко и поставь intent "pm".
Ответь строго одним JSON без пояснений: {{"reply": "текст", "intent": "info|book|pm|gift|human"}}
book — человек хочет записаться; gift — про сертификаты; human — жалоба или сложный вопрос.
Прайс салона:{''.join(chr(10) + l for l in lines)}"""
    _cache['t'] = time.time()
    return _cache['prompt']


def ask(messages):
    key, folder = os.environ['YANDEX_API_KEY'], os.environ['YANDEX_FOLDER_ID']
    model = os.environ.get('YANDEX_MODEL', 'aliceai-llm')
    body = json.dumps({'model': f'gpt://{folder}/{model}', 'instructions': prompt(), 'temperature': 0.2, 'max_output_tokens': 500,
                       'input': [{'role': m['role'], 'content': m['text'][:600]} for m in messages[-10:]]}).encode()
    req = urllib.request.Request('https://ai.api.cloud.yandex.net/v1/responses', data=body, method='POST',
                                 headers={'Authorization': f'Api-Key {key}', 'x-folder-id': folder, 'Content-Type': 'application/json'})
    r = json.loads(urllib.request.urlopen(req, timeout=25).read().decode())
    raw = r.get('output_text') or ''.join(c.get('text', '') for o in r.get('output', []) if isinstance(o, dict) for c in (o.get('content') or []) if isinstance(c, dict))
    m = re.search(r'\{.*\}', raw, re.S)
    try:
        out = json.loads(m.group(0)) if m else {'reply': raw}
    except ValueError:
        out = {'reply': raw}
    return {'reply': str(out.get('reply') or 'Подскажу! Уточните, пожалуйста, вопрос 🙂')[:1200], 'intent': out.get('intent', 'info')}


def handler(event, context):
    origin = (event.get('headers') or {}).get('Origin') or (event.get('headers') or {}).get('origin') or ''
    allowed = [o.strip() for o in os.environ.get('ALLOWED_ORIGINS', 'https://pikold.github.io,http://localhost:8765').split(',')]
    cors = {'Access-Control-Allow-Origin': origin if origin in allowed else allowed[0], 'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json; charset=utf-8'}
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 204, 'headers': cors, 'body': ''}
    if origin not in allowed:
        return {'statusCode': 403, 'headers': cors, 'body': json.dumps({'error': 'origin'})}
    ip = ((event.get('requestContext') or {}).get('identity') or {}).get('sourceIp', '?')
    now = time.time()
    _hits[ip] = [t for t in _hits.get(ip, []) if now - t < 600] + [now]
    if len(_hits[ip]) > 40:   # не больше 40 сообщений за 10 минут с одного адреса
        return {'statusCode': 429, 'headers': cors, 'body': json.dumps({'reply': 'Слишком много сообщений — попробуйте чуть позже 🙏', 'intent': 'info'}, ensure_ascii=False)}
    try:
        body = event.get('body') or '{}'
        if event.get('isBase64Encoded'):
            import base64
            body = base64.b64decode(body).decode()
        msgs = [m for m in json.loads(body).get('messages', []) if m.get('role') in ('user', 'assistant') and isinstance(m.get('text'), str)]
        if not msgs or msgs[-1]['role'] != 'user':
            raise ValueError('нет вопроса')
        out = ask(msgs)
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps(out, ensure_ascii=False)}
    except Exception as e:
        print('error', e)
        return {'statusCode': 502, 'headers': cors, 'body': json.dumps({'error': 'ai'})}
