"""
テスト用 settings。

FE・BE で「sqlite 上書きを渡さないとテストが全件落ちる」のを繰り返しているので、
market では最初からこのモジュールを用意して README に書く:

    manage.py test --settings=yp_marketplace.settings_test

本番 DB（Postgres）を向いたまま test を走らせると、テスト用 DB の作成権限が
無くて全件 ERROR になる。ここで in-memory sqlite に差し替える。
"""

from yp_marketplace.settings import *  # noqa: F401,F403

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# テストの前提を env に左右させない
ALLOWED_HOSTS = ['testserver', '127.0.0.1', 'localhost']
MARKET_ENV = 'dev'
DEBUG = False
SECRET_KEY = 'test-only-key'

PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']

# throttle はテストごとにカウンタを持ち越さないようダミーキャッシュで
CACHES = {
    'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'},
}
