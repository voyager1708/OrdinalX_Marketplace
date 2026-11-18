"""
Django settings for yp_marketplace (OrdinalX Marketplace / market-web).

契約は documents/Specification.md。設定値の一覧は §12、守る不変条件は §14。
env の読み方は FE・BE と同じ作法（リポジトリ直下の .env → env.local の順で上書き）。

market は BE の DB に触らない。BE への結線は `BE_API_BASE_URL` 1 本だけで、
docker のネットワーク名・コンテナ名・IP はコードに書かない（§13.4-5）。
"""

import os
from pathlib import Path

from dotenv import load_dotenv

# BASE_DIR = app/（manage.py の場所）、ENV_DIR = リポジトリ直下
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_DIR = BASE_DIR.parent

# FE・BE と同じ: .env を読み、env.local があれば後から上書きする
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


# =============================================================================
# コア
# =============================================================================

SECRET_KEY = os.environ.get("SECRET_KEY") or "dev-only-insecure-key-do-not-use-in-production"

DEBUG = _env_bool("DEBUG", False)

_allowed = os.environ.get("DJANGO_ALLOWED_HOSTS", "").strip().split()
ALLOWED_HOSTS = _allowed if _allowed else ["127.0.0.1", "localhost"]

# admin の露出先（§7「Django admin だけ例外」/ §12）。nginx 側でも遮断する。
ADMIN_URL = (os.environ.get("ADMIN_URL") or "market/admin/").strip().lstrip('/')


# =============================================================================
# アプリ
# =============================================================================

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # 金額の桁区切り（intcomma）。価格は**金額扱い**で出す（S012 §8.1 の最後）
    'django.contrib.humanize',

    'rest_framework',
    'drf_spectacular',

    # §4 の構成。`vault` は入れない（別プロセス・別 DB・別鍵。
    # yp_marketplace_vault.settings の INSTALLED_APPS にだけ入る）
    'accounts',
    'vendor',
    'product',
    'chain',
    'listing',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'yp_marketplace.urls'

# UI キット（ウォレットの版付きシェル・骨格・スキン）。submodule で版を固定して
# 取り込む（§15 の依存表、キットの CONTRACT.md）。参照するのはこのパスだけで、
# ウォレットのビルド成果物を実行時に読まない。
WALLET_KIT_DIR = Path(
    os.environ.get("WALLET_KIT_DIR")
    or (BASE_DIR.parent / 'vendor/wallet-ui/app/packages/wallet-kit')
)

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        # 市場固有のテンプレートを**先**に置く。同名のファイルを置けばキットの
        # ものを上書きできる（市場は Service Worker を登録しないので pwa-head など）。
        'DIRS': [BASE_DIR / 'templates', WALLET_KIT_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                # キットのシェルが要求する kit_urls / kit_active と識別子 6 つ
                'yp_marketplace.kit.kit_context',
            ],
        },
    },
]

WSGI_APPLICATION = 'yp_marketplace.wsgi.application'

AUTH_USER_MODEL = 'accounts.User'


# =============================================================================
# DB（§2・§12）
# =============================================================================
# 既定は sqlite のまま（§12 の表）。実際の開発・運用は .env で
# yp_market_dev / yp_market に差し替える。yp_dev_db は共有しない。

DATABASES = {
    "default": {
        "ENGINE": os.environ.get("SQL_ENGINE", "django.db.backends.sqlite3"),
        "NAME": os.environ.get("SQL_DATABASE", BASE_DIR / "db.sqlite3"),
        "USER": os.environ.get("SQL_USER", ""),
        "PASSWORD": os.environ.get("SQL_PASSWORD", ""),
        "HOST": os.environ.get("SQL_HOST", ""),
        "PORT": os.environ.get("SQL_PORT", ""),
    }
}


# =============================================================================
# DRF（§6・§15 の契約: エンベロープは BE の NC と同形）
# =============================================================================

REST_FRAMEWORK = {
    # 失敗も必ず {"status":"error","error":{"code","message"}} で返す。
    # FE の unwrap() がそのまま通ることが契約（§15 の「契約」テスト）。
    'EXCEPTION_HANDLER': 'yp_marketplace.api.exception_handler.exception_handler',

    # セッションレス（§2）。認証は BE へのイントロスペクション（§7）だけで、
    # Cookie 認証は入れない（同一オリジンなのでウォレットの Cookie に乗ってしまう）。
    # 公開 EP は authentication_classes = [] で明示的に外す。
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'yp_marketplace.auth.BearerIntrospectionAuthentication',
    ),

    # 既定は fail-closed。公開 EP（§6 の「認証不要」4 本）だけが
    # permission_classes = [AllowAny] で明示的に開ける。
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],

    # JSON のみ。BrowsableAPI はセッション認証とテンプレートを引き込むので入れない。
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],

    # draft は緩め・submit は厳しめ（§6）。BE の nc_template(30/min) /
    # nc_broadcast(10/min) に合わせる。
    'DEFAULT_THROTTLE_RATES': {
        'market_public': '60/min',
        'market_thumb': '120/min',
        'market_draft': '30/min',
        'market_submit': '10/min',
        'market_mint': '30/min',
        'market_content': '30/min',
        'market_takedown': '20/hour',
    },

    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'OrdinalX Marketplace API',
    'DESCRIPTION': 'OrdinalX Marketplace — 板・作品・チャンク放送の API。'
                   'エンベロープは BE の Non-Custodial API と同形。',
    'VERSION': 'v1',
    'SERVE_INCLUDE_SCHEMA': False,
    # nginx が /market/ 配下に丸ごとマウントするので実パスは /market/api/v1/...（§6）
    'SCHEMA_PATH_PREFIX': '/market/api/v1/',
    'SWAGGER_UI_SETTINGS': {
        "persistAuthorization": True,
    },
    'SECURITY': [{"bearerAuth": []}],
    'COMPONENT_SPLIT_REQUEST': True,
    'COMPONENTS': {
        "securitySchemes": {
            # BE の access token をそのまま中継する（§7）。market は JWT を自前検証しない。
            "bearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
            },
        }
    },
}


# =============================================================================
# 認証の結線（§7）
# =============================================================================
# market は JWT をローカル検証しない（BE の SIMPLE_JWT は HS256 = 鍵が SECRET_KEY）。
# 問い合わせ先は固定 URL のみ（SSRF 対策。リクエスト由来の値を URL に混ぜない）。

BE_API_BASE_URL = (os.environ.get("BE_API_BASE_URL") or "").strip().rstrip('/')
# (jti, exp) 単位のイントロスペクション結果キャッシュ TTL
BE_INTROSPECTION_CACHE_SECONDS = _env_int("BE_INTROSPECTION_CACHE_SECONDS", 60)


# =============================================================================
# 環境分離（§13.3）
# =============================================================================
# BE の暫定本番と開発 :8002 は同じ yp_dev_db を見ている。market 側の緩和は
# 「1 つの設定値と 1 つのクエリ絞り込み」に閉じ込め、ロジックに散らさない。

MARKET_ENV = (os.environ.get("MARKET_ENV") or "dev").strip().lower()
# dev の作成・出品を許す principal の allowlist（空なら誰にも許さない）
MARKET_DEV_PRINCIPALS = [
    p for p in (os.environ.get("MARKET_DEV_PRINCIPALS") or "").replace(',', ' ').split() if p
]


# =============================================================================
# チェーン・手数料・審査（§10・§9.1・§12）
# =============================================================================
# 値は env だけから読む。fee wallet の鍵はコードにも DB にも埋めない。

ARC_URL = (os.environ.get("ARC_URL") or "").strip() or None
ARC_TOKEN = (os.environ.get("ARC_TOKEN") or "").strip() or None
# 未設定だと同期ポーリング 20 回で 504 になる（BE で踏んだ罠）。本番では必ず設定する。
ARC_CALLBACK_URL = (os.environ.get("ARC_CALLBACK_URL") or "").strip() or None
ARC_CALLBACK_TOKEN = (os.environ.get("ARC_CALLBACK_TOKEN") or "").strip() or None

WOC_API_BASE_URL = (os.environ.get("WOC_API_BASE_URL") or "").strip().rstrip('/') or None
WOC_API_KEY = (os.environ.get("WOC_API_KEY") or "").strip() or None
WOC_NETWORK = (os.environ.get("WOC_NETWORK") or "main").strip()

MARKET_FEE_BPS = _env_int("MARKET_FEE_BPS", 250)
MARKET_FEE_SCRIPT = (os.environ.get("MARKET_FEE_SCRIPT") or "").strip() or None
MARKET_FEE_POLICY_DEFAULT = (os.environ.get("MARKET_FEE_POLICY_DEFAULT")
                             or "creator/prepaid_bsv").strip()

# 市場の fee wallet（§12）。**鍵は env だけから**読み、コードにも DB にも埋めない。
# キャンセルの手数料と本体チャンクの放送はここから出る（§10）。
MARKET_FEE_WALLET_WIF = (os.environ.get("MARKET_FEE_WALLET_WIF") or "").strip()
MARKET_FEE_WALLET_ADDRESS = (os.environ.get("MARKET_FEE_WALLET_ADDRESS") or "").strip()

# 運営コストのガード（§10）
MAX_FEE_SATOSHIS_PER_WORK = _env_int("MAX_FEE_SATOSHIS_PER_WORK", 5_000_000)
MAX_SUBSIDY_SATOSHIS_PER_DAY = _env_int("MAX_SUBSIDY_SATOSHIS_PER_DAY", 5_000_000)
MAX_OUTSTANDING_PER_VENDOR = _env_int("MAX_OUTSTANDING_PER_VENDOR", 1_000_000)

# オンチェーン本体の形（§9）。チャンクは 4 MB/tx、1 作品 500 MB（= 125 本）。
WORK_CHUNK_BYTES = _env_int("WORK_CHUNK_BYTES", 4 * 1024 * 1024)
WORK_MAX_BYTES = _env_int("WORK_MAX_BYTES", 500 * 1024 * 1024)

# 審査待ち暗号文（§9.1）。/mnt/extra は残り僅かなので上限と TTL を最初から入れる。
MAX_STAGING_BYTES_TOTAL = _env_int("MAX_STAGING_BYTES_TOTAL", 2 * 1024 * 1024 * 1024)
STAGING_TTL_HOURS = _env_int("STAGING_TTL_HOURS", 72)
MAX_WORKS_IN_REVIEW = _env_int("MAX_WORKS_IN_REVIEW", 10)
TAKEDOWN_PROVISIONAL_SLA_HOURS = _env_int("TAKEDOWN_PROVISIONAL_SLA_HOURS", 24)

# テンプレートの TTL は BE と揃えて 300 秒（§5）
TX_TEMPLATE_TTL_SECONDS = _env_int("TX_TEMPLATE_TTL_SECONDS", 300)
# 二重購入の予約 TTL（§5「Purchase(pending) は TTL 3 分」）
PURCHASE_RESERVATION_TTL_SECONDS = _env_int("PURCHASE_RESERVATION_TTL_SECONDS", 180)

# サムネイル（§14-6・§5 NftCache）。総量上限と LRU を最初から。
THUMB_MAX_BYTES = _env_int("THUMB_MAX_BYTES", 50 * 1024)
THUMB_MAX_EDGE_PX = _env_int("THUMB_MAX_EDGE_PX", 512)
THUMB_CACHE_MAX_BYTES_TOTAL = _env_int("THUMB_CACHE_MAX_BYTES_TOTAL", 256 * 1024 * 1024)


# =============================================================================
# パスワード検証
# =============================================================================
# 投影ユーザーはパスワードを持たない（§7）。ここが効くのは
# createsuperuser で作る運用アカウントだけ。

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# =============================================================================
# i18n（FE・BE と同じ）
# =============================================================================

LANGUAGE_CODE = "en-us"
TIME_ZONE = 'Asia/Tokyo'
USE_I18N = True
USE_TZ = True


# =============================================================================
# 静的ファイル（§2・S012 §8）
# =============================================================================
# ウォレットの /static/ と分ける。nginx は /market-static/ を alias で出す。

STATIC_URL = os.environ.get("STATIC_URL") or '/market-static/'
STATIC_ROOT = os.environ.get("STATIC_ROOT") or (BASE_DIR / 'market-static')

# 静的ファイルの出どころは 3 つ（キットの CONTRACT.md §7）。
#
# 1. 市場が自分でビルドしたもの（app/static）— css/app.css と js/*.js。
#    入力は版を固定したキットのソースで、`npm run build` で作る。
#    **実行時にウォレットのビルド成果物は読まない**（S009 §15 の禁止事項 2）
# 2. ウォレットと共有する vendored 資産（テーマ・アイコンフォント・ロゴ・
#    htmx / preline / swiper / popper）。submodule の中の static から
#    prefix を限って拾う。版は submodule の指し先で固定される
# 3. それ以外は拾わない（ウォレットのアプリ用バンドルを市場から配らない）
_WALLET_STATIC = WALLET_KIT_DIR.parent.parent / 'static'

STATICFILES_DIRS = [BASE_DIR / 'static']
if _WALLET_STATIC.is_dir():
    STATICFILES_DIRS += [
        ('assets', _WALLET_STATIC / 'assets'),
        ('js/libs', _WALLET_STATIC / 'js/libs'),
    ]


# =============================================================================
# Cookie（§14-9）
# =============================================================================
# 同一オリジン（spv.buxbit.net）にウォレットと同居する。既定の名前のままだと
# admin のセッション Cookie がウォレットの sessionid を上書きするので、
# 名前と path を /market/ に閉じる。SESSION_COOKIE_DOMAIN は未設定のまま維持する。

SESSION_COOKIE_NAME = 'market_sessionid'
SESSION_COOKIE_PATH = '/market/'
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SECURE = not DEBUG

CSRF_COOKIE_NAME = 'market_csrftoken'
CSRF_COOKIE_PATH = '/market/'
CSRF_COOKIE_SECURE = not DEBUG

_csrf_trusted = os.environ.get("CSRF_TRUSTED_ORIGINS", "").strip().split()
if _csrf_trusted:
    CSRF_TRUSTED_ORIGINS = _csrf_trusted

# TLS 終端は fe-nginx。HSTS の出し元は TLS 終端層に一本化してあるので
# アプリ側では出さない（BE で整理した方針に合わせる）。
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')


# =============================================================================
# ログ
# =============================================================================
# コンテナの標準出力に出す（ファイルへの切り出しと logrotate は P0-7）。
# トークンはログに書かない（§14-5。書くのは jti の先頭 8 文字だけ）。

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format': '[{asctime}] {levelname} {name}: {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'standard',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': os.environ.get("LOG_LEVEL", "INFO"),
    },
    'loggers': {
        # 監査証跡（§14-7）。発行 / 署名受領 / 検証 / 送信結果の 4 段を残す。
        'market.audit': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
