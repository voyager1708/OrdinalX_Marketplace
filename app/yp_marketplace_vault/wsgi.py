"""
vault の WSGI エントリ（market とは別プロセス）。
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yp_marketplace_vault.settings')

application = get_wsgi_application()
