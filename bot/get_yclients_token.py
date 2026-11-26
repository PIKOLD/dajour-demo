"""Получить пользовательский токен YCLIENTS и записать его в bot/.env.

Запускаете сами:  python get_yclients_token.py
Логин и пароль вводятся у вас в терминале и никуда, кроме API YCLIENTS, не отправляются и не сохраняются.
Сначала впишите в .env YCLIENTS_PARTNER_TOKEN.
"""
import getpass, os, re
from common import env, http, HERE

partner = env('YCLIENTS_PARTNER_TOKEN')
if not partner:
    raise SystemExit('Сначала впишите YCLIENTS_PARTNER_TOKEN в bot/.env')
login = input('Логин YCLIENTS (телефон или e-mail): ').strip()
password = getpass.getpass('Пароль (не отображается): ')
code, r = http('POST', 'https://api.yclients.com/api/v1/auth', data={'login': login, 'password': password},
               headers={'Authorization': f'Bearer {partner}', 'Accept': 'application/vnd.yclients.v2+json'})
token = (r.get('data') or {}).get('user_token')
if not token:
    raise SystemExit(f'Не получилось: {code} {r.get("meta") or r}')
path = os.path.join(HERE, '.env')
txt = open(path, encoding='utf-8').read() if os.path.exists(path) else ''
txt = re.sub(r'^YCLIENTS_USER_TOKEN=.*$', '', txt, flags=re.M).rstrip() + f'\nYCLIENTS_USER_TOKEN={token}\n'
open(path, 'w', encoding='utf-8').write(txt)
print('Готово: токен записан в bot/.env')
