# OrdinalX Marketplace

OrdinalX の NFT マーケットプレイス。空の Django プロジェクトから新規に立ち上げた土台。

- リモート: `origin` = `voyager1708/OrdinalX_Marketplace`（開発はこちらに統一）
- 関連: [OrdinalX_Frontend_WalletUI](../OrdinalX_Frontend_WalletUI)（FE）, [OrdinalX_Backend](../OrdinalX_Backend)（BE / SPV）

## 仕様

実装仕様は [documents/Specification.md](documents/Specification.md)。設計の根拠と経緯は
`/mnt/extra/documents` の S009（機能設計）/ S010（BE 変更 1 件）/ S011（土台と環境）/
S012（UI の提供形態）/ S013（BE 変更 2 件目）が正で、Specification.md はそれをこの
リポジトリの実装契約に落としたもの。食い違いを見つけたら**上位文書が正**。

## 構成

FE/BE と同じく Django プロジェクトは `app/` 以下に置く。

```
app/
├── yp_marketplace/        market の settings / urls / API 共通層（api/）
├── yp_marketplace_vault/  vault 専用 settings（別プロセス・別 DB・別鍵）
├── accounts/              BE ユーザーの投影（認証主体は持たない）
├── vendor/                サークル／作家
├── product/               Category / Work / WorkFeeLedger
├── chain/                 Edition / ContentPart / MintJob / Manifest / NftCache
├── listing/               Listing / TxTemplate / Purchase / SettlementJob /
│                          ListingEvent / TakedownRequest / BlockedContent
└── vault/                 SealedKey / KeyRelease / KeyRevocation / AgeVerification
```

- `order` / `cart` は作らない（S011 §12 #4）
- `vault` は market の `INSTALLED_APPS` に**入れない**。鍵のテーブルを帳簿 DB に作らないため
- API の実パスは `/market/api/v1/...`（nginx が `/market/` をパスごと渡す）

## セットアップ

専用の venv を使う（FE の `/mnt/extra/venv`、BE の `/mnt/extra/venv_nc_pwa` とは別）。

```bash
python3 -m venv /mnt/extra/venv_marketplace          # 新しい環境のときだけ
/mnt/extra/venv_marketplace/bin/pip install -r requirements.txt
cp .env.example .env                                 # 値を埋める（.env は git 管理外）
git submodule update --init                          # UI キット（下記）
```

## UI キット（ウォレットのシェルを版で固定して使う）

市場の画面はウォレットと**同じシェル・骨格・スキン**の上に描く。デザインは
ウォレットが正で、市場はキットの利用側（S012 §8.1）。実行時にウォレットの
ビルド成果物は読まない — submodule で**版を固定して**取り込む。

```
vendor/wallet-ui/                       FE リポジトリの submodule（タグで固定）
  └── app/packages/wallet-kit/          ← 参照するのはここだけ
        templates/components/           wallet-base / bottom-tabs / gaudi-defs / …
        css/                            s006.css（骨格）/ gaudi.css（スキン）
        js/                             署名コア（Phase 2 で使う）
        CONTRACT.md                     契約の全文（**先に読む**）
```

- 現在固定している版: **kit-v1.3**
- 版を上げるときは `cd vendor/wallet-ui && git fetch --tags && git checkout kit-vN`
  してからコミットする（submodule の指し先がそのまま版の記録になる）
- 契約（鍵の置き場・暗号パラメータ・MAP の並び・シェルの context）は
  [`vendor/wallet-ui/app/packages/wallet-kit/CONTRACT.md`](vendor/wallet-ui/app/packages/wallet-kit/CONTRACT.md)
- market 側の供給は [`app/yp_marketplace/kit.py`](app/yp_marketplace/kit.py)。
  `kit_urls` を渡さないと `NoReverseMatch` で画面全体が 500 になる

> ⚠ Tailwind は preset の `content` をマージしない。市場の画面を作るとき
> （P0-6）は `...kit.content` を**展開して**足す。忘れるとキットのクラスだけが
> purge され、HTML は正しいのに CSS だけが静かに壊れる。

## 静的資産のビルド

市場の CSS と JS は、版を固定したキットのソースから**市場が自分で**作る
（実行時にウォレットのビルド成果物は読まない）。

```bash
cd app && npm install        # 初回のみ
cd app && npm run build      # static/css/app.css と static/js/*.js を作る
```

- `build:css` … キットの s006（骨格）+ gaudi（スキン）+ Tailwind utilities
- `build:js` … キットの backend-status / nc-auth / gaudi / gaudi-nav / localtime を
  esbuild でバンドル（署名コアは Phase 2 で足す）、`css/pwa.css` をコピー

ビルド結果（`app/static/css/app.css` と `app/static/js/*.js`）は**リポジトリに
追跡する**。本番の反映は bind mount + restart で build を挟まない運用（FE・BE と
同じ）なので、成果物が無いと見た目が出ない。**キットの版を上げたら必ず
`npm run build` して一緒にコミットする。**

## コンテナで動かす（暫定本番）

```bash
cp .env.market.example .env.market           # 値を埋める（git 管理外）
cp .env.market.db.example .env.market.db     # SQL_PASSWORD と一致させる
export HOST_UID=$(id -u) HOST_GID=$(id -g)   # bind mount の所有者に合わせる

docker compose -f docker-compose.market.yml up -d --build
```

| コンテナ | 中身 |
| --- | --- |
| `market-web` | gunicorn（コンテナ内 :8000）。fe-nginx が `market-web:8000` へ proxy する（P0-8） |
| `market-db` | **専用 Postgres**（`yp_market`）。`yp_dev_db` は共有しない |
| `market-cron` | §11 のワーカー。ジョブは Phase 1 以降で `app/crontab` を開ける |

- アプリコードは **bind mount**。反映は build 不要で
  `docker compose -f docker-compose.market.yml restart market-web` だけ
- UI キット（submodule）も読み取り専用で mount する。無いと起動時に
  entrypoint が止める（シェルが描けず全ページ 500 になるため）
- 静的資産は**ホスト側で `npm run build` した成果物**を mount して
  collectstatic する（コンテナに Node を入れない）

### 到達経路（fe-nginx のパスマウント）

ブラウザからは `spv.buxbit.net/market/` で届く。vhost も証明書も増やさず、
FE の nginx に location を 2 本足すだけ（S012 §1）:

| location | 行き先 |
| --- | --- |
| `/market/` | `market-web:8000` へ proxy（UI も API も） |
| `/market-static/` | 市場の collectstatic 出力（named volume `ordinalx_market_static`）を alias |

この 2 本と `components/nav-extra.html`（P0-9）が**入切のスイッチ**で、外せば
`/market/` は 404 に戻り、ウォレットは何も変わらない。定義は FE リポジトリの
[nginx/nginx.http.conf](../OrdinalX_Frontend_WalletUI/nginx/nginx.http.conf) にある。

反映は FE 側の `tools/restart.sh` から:

```bash
cd /mnt/extra/OrdinalX_Marketplace/app && npm run build   # CSS/JS を変えたとき
/mnt/extra/OrdinalX_Frontend_WalletUI/tools/restart.sh market
```

> `/market/` の upstream は **変数 + resolver** で要求時に名前解決している。
> `upstream` ブロックに書くと market-web が居ないときに nginx 自体が起動できず、
> 市場の都合でウォレットの入口が落ちる。この形なら市場が止まっても
> `/market/` が 503 になるだけで済む（市場の restart で reload も要らない）。

> ⚠ betawallet / fe のスタックには触らないこと。`docker compose down` は禁止で、
> `up -d` はサービスを明示して `--no-build` を付ける（172.18.0.0/16 に FE 本番が
> ぶら下がっており、subnet を振り直すと `spv.buxbit.net` が落ちる）。

## 見た目の確認（シェルが一致しているか）

ウォレットと市場でシェルが食い違ったら**それはバグ**（S012 §8.1）。常駐サーバを
立てずに撮り比べられる:

```bash
# 市場側の HTML（静的参照を file:// に書き換える）
/mnt/extra/venv_marketplace/bin/python tools/render_market.py /tmp/market.html

# ウォレット側の /view/dashboard も同じ作法で /tmp/wallet.html に出してから
/mnt/extra/venv/bin/python tools/shell_diff.py /tmp/wallet.html /tmp/market.html
```

ヘッダは 1 ピクセルも違わないこと、ボトムタブは**現在地の点灯以外**は
一致することを見る。

## 動かす

```bash
# market（API と画面）
/mnt/extra/venv_marketplace/bin/python app/manage.py migrate
/mnt/extra/venv_marketplace/bin/python app/manage.py runserver 127.0.0.1:8100

# vault（鍵。別 settings・別 DB）
/mnt/extra/venv_marketplace/bin/python app/manage.py migrate --settings=yp_marketplace_vault.settings
/mnt/extra/venv_marketplace/bin/python app/manage.py runserver 127.0.0.1:8101 --settings=yp_marketplace_vault.settings
```

確認できる経路（Phase 0 の時点）:

| URL | 中身 |
| --- | --- |
| `/market/` | 市場の画面（板の入口。ログイン前でも見せる） |
| `/market/admin/` | admin（`ADMIN_URL` で変えられる。nginx 側でも遮断する） |
| `/market/api/v1/schema/` | OpenAPI スキーマ |
| `/market/api/v1/schema/swagger-ui/` | Swagger UI |

admin に入るには運用アカウントを 1 つ作る（BE のユーザーとは無関係）:

```bash
/mnt/extra/venv_marketplace/bin/python app/manage.py createsuperuser
```

## テスト

**sqlite 上書きの settings を必ず渡す。** Postgres を向いたまま走らせるとテスト用 DB を
作れずに全件 ERROR になる（FE・BE で何度も踏んでいる）。

```bash
# market
/mnt/extra/venv_marketplace/bin/python app/manage.py test --settings=yp_marketplace.settings_test

# vault（market の settings では境界を保つためスキップされる）
/mnt/extra/venv_marketplace/bin/python app/manage.py test vault --settings=yp_marketplace_vault.settings
```

## 設定の環境変数

一覧と既定値は [documents/Specification.md](documents/Specification.md) §12、テンプレートは
[.env.example](.env.example)。`settings.py` は FE/BE と同じ作法で `.env` → `env.local` の順に読む。

要点だけ:

| 変数 | 役割 |
| --- | --- |
| `SQL_*` | market の DB。`yp_market_dev` / `yp_market`。`yp_dev_db` は共有しない |
| `VAULT_SQL_*` | vault の DB。**market と変数名を共有しない**（取り違えると鍵が帳簿 DB に入る） |
| `BE_API_BASE_URL` | BE への唯一の結線。docker のネットワーク名・コンテナ名・IP はコードに書かない |
| `MARKET_ENV` | `dev｜prod`。板の問い合わせを常にこれで絞る（BE の dev と暫定本番が同じ DB を見ているため） |
| `ARC_CALLBACK_URL` | 未設定だと放送が同期ポーリング 20 回で 504 になる。本番では必ず設定する |
| `ADMIN_URL` | admin の露出先 |

## 開発 DB について（過渡期）

開発用の `yp_market_dev` は betawallet の Postgres 17.5 コンテナ（`127.0.0.1:5432`）の中に
**専用 database** として置いている。同じサーバに `ticket_system` 等が同居しているのと同じ形で、
`yp_dev_db` とテーブルは一切共有しない。P0-7 で `market-db` コンテナを立てたら
`SQL_HOST` を差し替えるだけで移る。

> ⚠ betawallet のスタックには FE 本番がぶら下がっている。`docker compose down` は禁止で、
> `up -d` はサービスを明示して `--no-build` を付ける。
