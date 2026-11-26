"""Запись через YCLIENTS. Без ключей работает в демо-режиме на прайсе салона.

Боевой режим включается, когда в .env заполнены YCLIENTS_PARTNER_TOKEN и YCLIENTS_COMPANY_ID.
Используются публичные методы онлайн-записи: book_services, book_staff, book_dates, book_times, book_record.
"""
import datetime as dt, hashlib, urllib.parse
from common import env, http, load_prices

API = 'https://api.yclients.com/api/v1'
PERM = dt.timezone(dt.timedelta(hours=5))


def h31(s):
    h = 0
    for ch in s:
        h = (h * 31 + ord(ch)) % 1000003
    return h


class YClients:
    def __init__(self):
        self.partner = env('YCLIENTS_PARTNER_TOKEN')
        self.user = env('YCLIENTS_USER_TOKEN')
        self.company = env('YCLIENTS_COMPANY_ID')
        self.demo = not (self.partner and self.company)
        self._services = None

    # ---------- низкий уровень ----------
    def _h(self):
        a = f'Bearer {self.partner}' + (f', User {self.user}' if self.user else '')
        return {'Authorization': a, 'Accept': 'application/vnd.yclients.v2+json'}

    def _get(self, path, **q):
        qs = urllib.parse.urlencode([(k, x) for k, v in q.items() for x in (v if isinstance(v, list) else [v])])
        code, r = http('GET', f'{API}{path}' + (f'?{qs}' if qs else ''), headers=self._h())
        if code != 200 or not r.get('success', True):
            raise RuntimeError(f'YCLIENTS {path}: {code} {r.get("meta") or r}')
        return r.get('data', r)

    # ---------- услуги ----------
    def services(self):
        """[{id, name, price, minutes, cat}]"""
        if self._services is None:
            if self.demo:
                self._services = load_prices()
            else:
                d = self._get(f'/book_services/{self.company}')
                cats = {c['id']: c['title'] for c in d.get('category', [])}
                self._services = [{'id': s['id'], 'name': s['title'], 'cat': cats.get(s.get('category_id'), ''),
                                   'price': [s.get('price_min', 0), s.get('price_max', 0)] if s.get('price_max') != s.get('price_min') else s.get('price_min', 0),
                                   'minutes': (s.get('seance_length') or 0) // 60} for s in d.get('services', [])]
        return self._services

    # ---------- мастера, даты, время ----------
    def staff(self, service_id):
        if self.demo:
            return [{'id': 1, 'name': 'Мастер 1'}, {'id': 2, 'name': 'Мастер 2'}]
        d = self._get(f'/book_staff/{self.company}', **{'service_ids[]': [service_id]})
        return [{'id': s['id'], 'name': s['name']} for s in d if s.get('bookable', True)]

    def dates(self, service_id, days=10):
        today = dt.datetime.now(PERM).date()
        if self.demo:
            return [(today + dt.timedelta(days=i)).isoformat() for i in range(days)]
        d = self._get(f'/book_dates/{self.company}', **{'service_ids[]': [service_id]})
        return (d.get('booking_dates') or [])[:days]

    def times(self, service_id, date):
        """[{time:'14:00', staff_id, staff, datetime}] — по всем мастерам, кто делает услугу."""
        out = {}
        if self.demo:
            now = dt.datetime.now(PERM)
            for st in self.staff(service_id):
                for h in range(10, 20):
                    busy = h31(f'{date}{h}{st["id"]}') % 3 == 0          # та же формула в demo/tg/index.html
                    slot = dt.datetime.fromisoformat(f'{date}T{h:02d}:00:00+05:00')
                    if not busy and not (date == now.date().isoformat() and h <= now.hour):
                        out.setdefault(f'{h:02d}:00', {'time': f'{h:02d}:00', 'staff_id': st['id'], 'staff': st['name'], 'datetime': slot.isoformat()})
        else:
            for st in self.staff(service_id)[:6]:
                for t in self._get(f'/book_times/{self.company}/{st["id"]}/{date}', **{'service_ids[]': [service_id]}):
                    out.setdefault(t['time'], {'time': t['time'], 'staff_id': st['id'], 'staff': st['name'], 'datetime': t['datetime']})
        return [out[k] for k in sorted(out)]

    # ---------- запись ----------
    def book(self, service_id, slot, name, phone, comment=''):
        if self.demo:
            return {'demo': True, 'record_id': 'DEMO-' + hashlib.md5(f'{slot}{phone}'.encode()).hexdigest()[:6].upper()}
        code, r = http('POST', f'{API}/book_record/{self.company}', headers=self._h(), data={
            'phone': phone, 'fullname': name, 'email': '', 'comment': comment or 'Запись через ИИ-администратора в Telegram',
            'appointments': [{'id': 1, 'services': [service_id], 'staff_id': slot['staff_id'], 'datetime': slot['datetime']}]})
        if code not in (200, 201) or not r.get('success', True):
            raise RuntimeError(f'Запись не создана: {code} {r.get("meta") or r}')
        rec = (r.get('data') or [{}])[0]
        return {'demo': False, 'record_id': rec.get('record_id') or rec.get('id')}
