# OrdinalX Marketplace

OrdinalX の NFT マーケットプレイス。空の Django プロジェクトから新規に立ち上げた土台。

- リモート: `origin` = `voyager1708/OrdialX_Marketplace`（開発はこちらに統一）
- 関連: [OrdinalX_Frontend_WalletUI](../OrdinalX_Frontend_WalletUI)（FE）, [OrdinalX_Backend](../OrdinalX_Backend)（BE / SPV）

## 構成

FE/BE と同じく Django プロジェクトは `app/` 以下に置く。設定パッケージは `app/yp_marketplace/`。

## セットアップ

専用の venv を使う（FE の `/mnt/extra/venv`、BE の `/mnt/extra/venv_nc_pwa` とは別）。

```bash
/mnt/extra/venv_marketplace/bin/python app/manage.py migrate
/mnt/extra/venv_marketplace/bin/python app/manage.py runserver 8003
```

新しい環境では:

```bash
python3 -m venv /mnt/extra/venv_marketplace
/mnt/extra/venv_marketplace/bin/pip install -r requirements.txt
```

## 設定の環境変数

`settings.py` は FE/BE と同じ作法で環境変数から読む。未設定なら開発用の既定値になる。

| 変数 | 既定 | 備考 |
| --- | --- | --- |
| `SECRET_KEY` | 開発用の固定値 | 本番では必ず設定する |
| `DEBUG` | 無効（0） | |
| `DJANGO_ALLOWED_HOSTS` | `127.0.0.1 localhost` | 空白区切り |
| `SQL_ENGINE` / `SQL_DATABASE` / `SQL_USER` / `SQL_PASSWORD` / `SQL_HOST` / `SQL_PORT` | sqlite3 / `app/db.sqlite3` | postgres に差し替え可 |
