"""
vault 専用 settings（documents/Specification.md §4・§14-13）。

market とは**別プロセス・別 DB・別鍵**。INSTALLED_APPS は vault だけで、
admin・auth・sessions を**入れない**（鍵のそばに認証主体とセッションを置かない）。

    開発:   runserver :8101 --settings=yp_marketplace_vault.settings
    migrate: manage.py migrate --settings=yp_marketplace_vault.settings

market の DB 設定（SQL_*）とは別の env（VAULT_SQL_*）を読む。取り違えると
鍵のテーブルが帳簿 DB に出来てしまうので、変数名を共有しない。
"""

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_DIR = BASE_DIR.parent

load_dotenv(ENV_DIR / '.env')
load_dotenv(ENV_DIR / 'env.local', override=True)


def _env_bool(name: str, default: bool = False) -> bool:
    raw = (os.environ.get(name) or '').strip().lower()
    if raw == '':
        return default
    return raw in ('1', 'true', 'yes', 'on')


def _env_int(name: str, default: int) -> int:
    raw = (os.environ.get(name) or '').strip()
    try:
        return int(raw) if raw else default
    except ValueError:
        return default


SECRET_KEY = os.environ.get("VAULT_SECRET_KEY") or "dev-only-insecure-vault-key"
DEBUG = _env_bool("VAULT_DEBUG", False)

_allowed = os.environ.get("VAULT_ALLOWED_HOSTS", "").strip().split()
ALLOWED_HOSTS = _allowed if _allowed else ["127.0.0.1", "localhost"]

INSTALLED_APPS = [
    'rest_framework',
    'vault',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'yp_marketplace_vault.urls'
WSGI_APPLICATION = 'yp_marketplace_vault.wsgi.application'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': False,
        'OPTIONS': {'context_processors': []},
    },
]

# 鍵の DB（market の帳簿 DB とは別）。バックアップ優先度は market より高い（§14-13）
DATABASES = {
    "default": {
        "ENGINE": os.environ.get("VAULT_SQL_ENGINE", "django.db.backends.sqlite3"),
        "NAME": os.environ.get("VAULT_SQL_DATABASE", BASE_DIR / "vault.sqlite3"),
        "USER": os.environ.get("VAULT_SQL_USER", ""),
        "PASSWORD": os.environ.get("VAULT_SQL_PASSWORD", ""),
        "HOST": os.environ.get("VAULT_SQL_HOST", ""),
        "PORT": os.environ.get("VAULT_SQL_PORT", ""),
    }
}

REST_FRAMEWORK = {
    # market と同じエンベロープ（FE の unwrap() が両方で通る）
    'EXCEPTION_HANDLER': 'yp_marketplace.api.exception_handler.exception_handler',
    'DEFAULT_AUTHENTICATION_CLASSES': (),
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticated'],
    'DEFAULT_RENDERER_CLASSES': ['rest_framework.renderers.JSONRenderer'],
    'DEFAULT_THROTTLE_RATES': {
        'vault_key': '30/min',
    },
}

# 所有権判定は BE の既存 read EP だけで済む（S009 §17.1。BE 変更なし）
BE_API_BASE_URL = (os.environ.get("BE_API_BASE_URL") or "").strip().rstrip('/')
BE_INTROSPECTION_CACHE_SECONDS = _env_int("BE_INTROSPECTION_CACHE_SECONDS", 60)

# CK を封じるマスター鍵は **env だけ**から。コードにも DB にも埋めない（§18 #4 は未決）
VAULT_MASTER_KEY_ID = (os.environ.get("VAULT_MASTER_KEY_ID") or "").strip() or None
VAULT_MASTER_KEY = (os.environ.get("VAULT_MASTER_KEY") or "").strip() or None

LANGUAGE_CODE = "en-us"
TIME_ZONE = 'Asia/Tokyo'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/vault-static/'

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {'format': '[{asctime}] {levelname} {name}: {message}', 'style': '{'},
    },
    'handlers': {
        'console': {'class': 'logging.StreamHandler', 'formatter': 'standard'},
    },
    'root': {'handlers': ['console'], 'level': os.environ.get("LOG_LEVEL", "INFO")},
    'loggers': {
        # 誰がいつどの作品を開いたか（§9.1）。KeyRelease と二重に残す
        'vault.audit': {'handlers': ['console'], 'level': 'INFO', 'propagate': False},
    },
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
