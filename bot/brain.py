"""Мозг ИИ-администратора: YandexGPT, а без ключа — запасной режим на правилах.

Модель отвечает строго JSON: {"reply": текст клиенту, "intent": info|book|pm|human, "query": что ищем в прайсе}.
Запись, слоты и перманент ведёт код, а не модель: так бот не выдумает время и цены.
"""
import json, re
from common import env, http, SALON, price_text, norm

URL = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion'      # старый API YandexGPT
URL_RESPONSES = 'https://ai.api.cloud.yandex.net/v1/responses'                # AI Studio, OpenAI-совместимый

SYN = {'маник': 'маникюр', 'ногт': 'маникюр', 'педик': 'педикюр', 'стриж': 'стрижка', 'подстри': 'стрижка', 'окраш': 'окрашивание',
       'покрас': 'окрашивание', 'ресниц': 'ресниц', 'бров': 'бров', 'массаж': 'массаж', 'чистк': 'чистка', 'пилинг': 'пилинг',
       'лазер': 'лазер', 'макияж': 'макияж', 'прическ': 'причес', 'укладк': 'укладка', 'уход': 'уход', 'сфер': 'сфера'}


def find_services(services, query, limit=8):
    """Простой поиск по прайсу: совпадения слов и корней."""
    q = norm(query)
    keys = {v for k, v in SYN.items() if k in q} | {w for w in q.split() if len(w) > 3}
    scored = []
    for s in services:
        text = norm(s['name'] + ' ' + s.get('cat', ''))
        sc = sum(2 if k in norm(s['name']) else 1 for k in keys if k[:5] in text)
        if sc:
            scored.append((sc, len(s['name']), s))
    scored.sort(key=lambda x: (-x[0], x[1]))
    return [s for _, _, s in scored[:limit]]


def system_prompt(services):
    lines, cur = [], None
    for s in services:
        if s.get('cat') != cur:
            cur = s.get('cat'); lines.append(f'\n## {cur}')
        lines.append(f'- {s["name"]} — {price_text(s["price"])}' + (f', {s["minutes"]} мин' if s.get('minutes') else ''))
    return f"""Ты — администратор салона красоты «{SALON['name']}» ({SALON['address']}, {SALON['hours']}, тел. {SALON['phone']}).
Пиши по-русски, тепло и коротко: 1–3 предложения, без канцелярита, можно 1 эмодзи.
Используй ТОЛЬКО факты ниже. Не придумывай скидки, акции, имена мастеров, отзывы и свободное время. Если не знаешь — предложи связаться с администратором.
Отвечай строго одним JSON-объектом без пояснений:
{{"reply": "текст клиенту", "intent": "info|book|pm|human", "query": "услуга для поиска в прайсе или пусто"}}
- intent "book": клиент хочет записаться или выбрать время. В query — услуга своими словами (например «маникюр с покрытием»). Время и мастеров покажет система — не называй их сам.
- intent "pm": всё про перманентный макияж, татуаж, удаление тату. Такие записи согласует мастер лично.
- intent "human": просит живого человека, жалоба, сложный вопрос.
- intent "info": остальное (цены, адрес, как добраться, что входит). Цены называй из прайса.
Онлайн-запись: {SALON['book_url']}. Карта: {SALON['map_url']}. Мессенджеры: {SALON['messengers']}. Школа красоты: {SALON['school']}.
Прайс салона:{''.join(chr(10) + l for l in lines)}"""


class Brain:
    def __init__(self, services):
        self.key, self.folder = env('YANDEX_API_KEY'), env('YANDEX_FOLDER_ID')
        self.model = env('YANDEX_MODEL', 'aliceai-llm')
        self.services = services
        self.sys = system_prompt(services)
        self.ai = bool(self.key and self.folder)

    def ask(self, text, history):
        if self.ai:
            try:
                return self._yandex(text, history)
            except Exception as e:
                print('YandexGPT недоступен, отвечаю по правилам:', e)
        return self._rules(text)

    def _yandex(self, text, history):
        """Новый OpenAI-совместимый API AI Studio (модель Alice AI LLM); если не ответил — старый API YandexGPT."""
        hdr = {'Authorization': f'Api-Key {self.key}', 'x-folder-id': self.folder}
        code, r = http('POST', URL_RESPONSES, headers=hdr, data={
            'model': f'gpt://{self.folder}/{self.model}', 'instructions': self.sys, 'temperature': 0.2, 'max_output_tokens': 600,
            'input': [{'role': h['role'], 'content': h['text']} for h in history[-8:]] + [{'role': 'user', 'content': text}]})
        raw = ''
        if code == 200:
            raw = r.get('output_text') or ''.join(c.get('text', '') for o in r.get('output', []) if isinstance(o, dict)
                                                 for c in (o.get('content') or []) if isinstance(c, dict))
        if not raw:
            print('Responses API:', code, str(r)[:200], '— пробую старый API')
            msgs = [{'role': 'system', 'text': self.sys}] + history[-8:] + [{'role': 'user', 'text': text}]
            code, r = http('POST', URL, headers=hdr, data={
                'modelUri': f'gpt://{self.folder}/{env("YANDEX_MODEL_OLD", "yandexgpt/latest")}',
                'completionOptions': {'stream': False, 'temperature': 0.2, 'maxTokens': '600'}, 'messages': msgs})
            if code != 200:
                raise RuntimeError(f'{code} {r}')
            raw = r['result']['alternatives'][0]['message']['text']
        m = re.search(r'\{.*\}', raw, re.S)
        try:
            out = json.loads(m.group(0)) if m else {}
        except json.JSONDecodeError:
            out = {}
        out.setdefault('reply', raw if not m else 'Подскажу! Уточните, пожалуйста, вопрос 🙂')
        out.setdefault('intent', 'info'); out.setdefault('query', '')
        return out

    def _rules(self, text):
        t = norm(text)
        if re.search(r'перман|татуаж|тату|пудров|межресн', t):
            return {'intent': 'pm', 'query': '', 'reply': 'Перманентный макияж мастер согласует лично — задам пару вопросов и передам ей.'}
        if re.search(r'адрес|где вы|как добрат|находит', t):
            return {'intent': 'info', 'query': '', 'reply': f'Наш адрес: {SALON["address"]}, работаем {SALON["hours"]}. Маршрут: {SALON["map_url"]}'}
        if re.search(r'человек|администратор|позвон|жалоб', t):
            return {'intent': 'human', 'query': '', 'reply': 'Соединю с администратором.'}
        found = find_services(self.services, text, 5)
        if re.search(r'запис|хочу|можно|свобод|окошк|время', t) and found:
            return {'intent': 'book', 'query': text, 'reply': 'С радостью запишу! Выберите услугу:'}
        if found:
            lst = '\n'.join(f'• {s["name"]} — {price_text(s["price"])}' for s in found)
            return {'intent': 'info', 'query': text, 'reply': f'Нашла в прайсе:\n{lst}\n\nЗаписать вас?'}
        return {'intent': 'info', 'query': '', 'reply': 'Я помогу записаться, подскажу цены и адрес. Напишите, какая услуга интересует — например «маникюр» или «окрашивание».'}
