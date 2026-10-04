# OrdinalX Marketplace — 実装仕様

作成: 2026-10-04 / 状態: 実装着手前（Phase 0 未着手）
対象リポジトリ: `voyager1708/OrdinalX_Marketplace`（チェックアウト `/mnt/extra/OrdinalX_Marketplace`）

## 0. この文書の位置づけ

マーケットプレースの**設計はすでに決着している**。機能設計・UI の提供形態・土台と環境は
`/mnt/extra/documents` の S009〜S012 が正であり、本書はそれを**この リポジトリで実装するための
契約**に落としたものである。根拠・却下した案・検討の経緯は上位文書にあり、ここでは繰り返さない。

| 層 | 正（source of truth） |
|---|---|
| 機能設計（決済方式・オンチェーン本体・認証の考え方・作品フォーマット） | [`S009`](../../documents/S009_marketplace_spec.md) |
| BE への変更 ①（出品の `recipient_locking_script`） | [`S010`](../../documents/S010_be_locking_script_param_decision.md) |
| BE への変更 ②（作成の暗号化オプション） | [`S013`](../../documents/S013_be_encryption_option_decision.md) |
| 実装土台・スタック・環境構成・デプロイ | [`S011`](../../documents/S011_marketplace_base_and_environments.md) |
| UI の提供形態（オリジンと PWA）・デザインの一元化 | [`S012`](../../documents/S012_marketplace_ui_delivery_decision.md) |
| **このリポジトリの構成・設定・着手順序** | **本書** |

本書と上位文書の対応は §17 に表でまとめた。**食い違いは無い**前提で、もし見つかったら
**上位文書が正**で本書のバグである。

## 1. 現状（2026-10-04 実測）

着手順序を決めるために、前提になるものが「ある／無い」を実際に確認した。

| 項目 | 状態 |
|---|---|
| 本リポジトリ | Django 5.2.12 の**空プロジェクト**。`app/yp_marketplace/`（settings/urls/wsgi/asgi）と `app/manage.py` のみ。`manage.py check` / `migrate` 通過 |
| DB | **sqlite 既定のまま**（`SQL_*` env で差し替え可能な形だけ入れた）。Postgres 未接続 |
| DRF / drf-spectacular / bsv-sdk | **未導入**（`requirements.txt` は `Django==5.2.12` 1 行） |
| 開発 venv | `/mnt/extra/venv_marketplace`（Python 3.12.3 / Django 5.2.12）。FE・BE の venv とは分離 |
| docker / nginx / cron | **未作成** |
| 署名コアと UI キットの版付きパッケージ（S012 §6・§8.1） | **未着手**。FE に `.gitmodules` は無く、`package.json` は template 由来の `ynex` のまま |
| `components/nav-extra.html`（S009 §3.3） | **未作成** |
| fe-nginx の `location /market/` | **未設定**。`OrdinalX_Frontend_WalletUI/nginx/nginx.http.conf` に market の記述は無く、`location /` が最後にある構造は S012 §8 の前提どおり |
| `tools/restart.sh` の market ターゲット | **未追加**（現在のターゲットは `fe｜be｜all｜fe-nginx｜be-nginx`） |
| BE の `recipient_locking_script`（S010） | **未実装**（`OrdinalX_Backend/app` に該当文字列なし）。S010 は決定案のままで、Phase 2 の前提 |
| 使用予定の BE 読み取り EP | 実在を確認: `api/v1/nc/nft/template/` / `api/v1/nc/nft/create/prepare/` / `api/v1/nc/transaction/broadcast/` / `api/v1/user/nfts/info` / `api/v1/nft/legacy-address` / `api/v1/nft/legacy-address/send`（`OrdinalX_Backend/app/hd_wallet/urls.py`） |
| FE の `/auth/bff/token` | 実在（`wallet_web_ui/urls.py:58` `BffAccessTokenView`） |
| s006 骨格 / gaudi スキン | 実在（`app/src/css/s006.css` 14 KB / `app/src/css/gaudi.css` 61 KB） |

つまり **Phase 0 の成果物はまだ 1 つも無い**。やることは **Postgres・DRF・アプリ骨格と migration・
bsv-sdk・キットの切り出し・compose・nginx・nav** で、内訳は §16、上位は S011 §10。

## 2. 確定した構成

| 項目 | 値 | 根拠 |
|---|---|---|
| リポジトリ | `voyager1708/OrdinalX_Marketplace`（`origin`） | S011 §12 #14 |
| 作業ブランチ | `main`（単一チェックアウト＝作業ツリーが稼働コード） | S011 §12 #8 |
| 将来の本番用ブランチ名 | `deploy/market`（名前だけ予約。ローカルでは使わない） | S011 §12 #8 |
| チェックアウト | `/mnt/extra/OrdinalX_Marketplace`（1 本のみ。`-dev` は作らない） | S011 §4 |
| Django | 5.2.12（BE と同一マイナー） | S011 §3 |
| Python | コンテナ **3.11**（BE の Dockerfile と同じ）／ホストの開発 venv **3.12.3** | S011 §3 |
| DB | PostgreSQL 専用 DB `yp_market` / `yp_market_dev`。`yp_dev_db` は共有しない | S011 §3 |
| API | DRF + drf-spectacular。エンベロープは BE の NC と同形 | S009 §7.3 |
| BSV | python bsv-sdk（BE と同じ git 版・C 拡張ビルド手順も同じ） | S011 §3 |
| ポート | 開発 `runserver :8100` ／ コンテナ内 `:8000`（`market-web`）／ vault `:8101` | S011 §4.4 |
| 静的資産 | `STATIC_URL=/market-static/` | S012 §8 |
| 到達経路 | `spv.buxbit.net/market/*` を fe-nginx がパスマウント。**vhost と証明書は増やさない** | S012 §1 |
| デザイン | ウォレットの **s006 骨格 + gaudi スキン**。市場は版付き UI キットの利用側 | S012 §8.1 |
| セッション | **セッションレス**（認証は BFF トークン。Cookie を使わない） | S012 §11 #3 |

## 3. アーキテクチャ

```
ブラウザ (PWA)                spv.buxbit.net — オリジンは 1 つ（鍵と PWA スコープの制約）
┌────────────────┐   ┌──────────────────────────────────────────────┐
│ ウォレットの画面 │◀─▶│ /               → fe-web    （既存・無変更）   │
│ マーケットの画面 │◀─▶│ /auth/bff/token → fe-web    トークン払い出し   │
└───────┬────────┘   │ /api/v1/nc/*    → fe-web ─proxy─▶ BE（既存）  │
        │ 署名と復号は  │ /market/*       → market-web ★ UI も API も   │
        │ ここだけ      │ /market-static/ → market の静的資産           │
        │ (IndexedDB   │ /vault/*        → vault-web  鍵の解放         │
        │  + WebAuthn) └──┬──────────────┬───────────────┬───────────┘
        │                 ▼              ▼               ▼
        │          ┌───────────┐ ┌──────────────┐ ┌──────────────┐
        │          │ BE（無変更 │ │ market       │ │ vault        │
        │          │ ＋S010 の │ │ 板・作品・    │ │ CK 保管と     │
        │          │ 1 param）  │ │ チャンク放送  │ │ 所有権判定    │
        │          └─────┬─────┘ └──────┬───────┘ └──────┬───────┘
        └────────────────┴──────────────┴────────────────┘
                                 ▼
                      ARC / WhatsOnChain（BSV）
```

守る不変条件は 4 つ。これを崩す変更は設計の変更であって実装の裁量ではない。

1. **market は秘密鍵を持たない**。例外は fee wallet のみ（別鍵・上限つき・残高監視つき）。
2. **market は BE の DB に触らない**。読み取り API ＋ BE 自身の自己再同期 EP だけを叩く（S009 §6.1）。
3. **端末は market を信頼しない**。未署名 tx は必ず端末側で意図検証する（§8.4）。
4. **BE への変更は 2 件だけ** — ① 出品の `recipient_locking_script`（[`S010`](../../documents/S010_be_locking_script_param_decision.md)）
   ② 作成の暗号化オプション `access` / `cipher`（[`S013`](../../documents/S013_be_encryption_option_decision.md)）。
   どちらも加算のみ・既定動作不変。3 件目の提案は各決定記録の比較表に戻って判断する。

## 4. リポジトリ構成

house の慣習（FE・BE が `app/yp_wallet/settings.py`）に合わせ、Django プロジェクトは `app/` 配下に置く。
これは S011 §6 と同じ構成（同書も `app/` 配下で書かれている）。

```
OrdinalX_Marketplace/
├── documents/Specification.md        本書
├── requirements.txt                  Django / DRF / psycopg / bsv-sdk / Pillow
├── docker-compose.market.yml         market-web / market-db / market-cron
├── tools/                            entrypoint・restore-native-ext 相当
└── app/
    ├── manage.py
    ├── yp_marketplace/               settings（env 化済み）/ urls / wsgi / asgi
    ├── yp_marketplace_vault/         ★ vault 専用 settings（INSTALLED_APPS は vault だけ）
    ├── accounts/                     BE ユーザーの投影（§7）
    ├── vendor/                       サークル／作家（+ paymail, payout_script）
    ├── product/                      Category（ジャンル）/ Work（作品）
    ├── chain/                        Edition / ContentPart / MintJob / Manifest
    ├── listing/                      Listing / TxTemplate / Purchase / SettlementJob / ListingEvent
    │                                 TakedownRequest / BlockedContent（§9.1）
    ├── vault/                        CK の保管と所有権判定（**別プロセス・別 DB・別鍵**）
    └── templates/ static/            市場固有のみ。シェルとテーマは UI キットから
```

- `order` / `cart` は**作らない**（S011 §12 #4）。
  カートは MVP 外（S009 §19「まとめ買い」）。
- `vault` は**同リポジトリ・別プロセス**。market のコンテナに鍵を渡さない。分ける理由は
  信頼境界ではなく**依存の同居を断つこと**（S009 §17.2.1）。
- base から持ち越すのは `product` / `vendor` の**モデルの形**だけ。コードは参照しない。

## 5. ドメインモデル

真実の在り処を 3 層に分ける。**混ぜると必ず壊れる**（S009 §15.6）。

| 層 | 真実の在り処 | 中身 |
|---|---|---|
| `Work`（作品） | market DB | タイトル・サークル・format・rating・マニフェスト・限定数・`parts[]` |
| `Edition`（各点） | **オンチェーン**（1 sat ordinal 1 個 = 1 点） | `nft_origin` / `serial` / `comment` / 所有者 |
| `Listing` / `Purchase` | market DB（**最終判定はオンチェーン**） | 価格・出品状態・成約 |

主なモデル（フィールドの詳細は S009 §7.2 / §15.4.4 / §6.4.3）:

| アプリ | モデル | 要点 |
|---|---|---|
| `accounts` | `User` | **BE ユーザーの投影**。`be_user_id` が主キー相当、password は使わない（§7） |
| `vendor` | `Vendor` | サークル／作家。`paymail`・`payout_script`・`fee_policy` |
| `product` | `Category` / `Work` | `price_satoshis`（決済の正）・`price_currency`・`rating`・`format`・`access` |
| `chain` | `Edition` / `ContentPart` / `MintJob` / `Manifest` | `ContentPart(txid, vout, bytes, sha256)` がオンチェーン本体の所在 |
| `listing` | `Listing` | `kind(ordlock｜platform)` / `ordlock_script_hex` / `payout_script` / `cancel_pubkey` / `price_satoshis` / `fee_bps` / `status` |
| `listing` | `TxTemplate` | `template_id` / `unsigned_tx_hex` / `inputs` / `outputs` / `tx_fingerprint` / `expires_at`（TTL 300 秒・BE と揃える） |
| `listing` | `Purchase` | `paid_satoshis` + **成約時の JPY 換算とレート**（領収書・会計用。S009 §7.2.1） |
| `listing` | `SettlementJob` | 非原子的経路（プラットフォーム板・代理購入）の状態機械。冪等・`txid` 一意 |
| `listing` | `ListingEvent` | 監査証跡。NC と同じ 4 段 + `SETTLE-*` |
| `product` | `WorkFeeLedger` | 作成手数料のポリシースナップショットと実費（YP 分 / market 分を**分けて**） |
| `listing` | `TakedownRequest` | `claimant` / `target` / `kind` / `state` / `received_at` / `decided_at` / `decision`（申し立ての受付と判断。§9.1） |
| `listing` | `BlockedContent` | `kind(nft_origin\|txid\|sha256)` / `value` / `reason` / `actor`（運営 blocklist。§9.1） |
| `vault` | `KeyRevocation` | `work_id` / `reason` / `actor` / `created_at`（CK の恒久失効。解除は二人承認。§9.1） |
| — | `NftCache` | `thumb` は長辺 512px WebP・1 件 50 KB 上限・**総量上限と LRU を最初から**（ディスクが残り僅か） |

`Listing.status`: `draft → pending → active → (sold｜cancelled｜invalid)`

**競合制御**（S009 §7.2）
- 二重出品: `UniqueConstraint(nft_origin)` を `status in (pending, active)` の部分インデックスで。
- 二重購入: draft 発行を `select_for_update` で直列化。`Purchase(pending)` 中は他をブロック（TTL 3 分）。
- 最終的な決着は ARC に任せ、負けた側には**即リトライ可**を返す。

## 6. API

エンベロープは BE の NC と同形。成功 `{"status":"success","data":{…}}` /
失敗 `{"status":"error","error":{"code","message"}}`。FE の `unwrap()` がそのまま使える。

**公開（認証不要）** — 集客のため一覧はログイン前でも見せる
```
GET  /market/api/v1/listings?status=active&sort=price|new&cursor=
GET  /market/api/v1/listings/{id}
GET  /market/api/v1/nft/{origin}/thumb
GET  /market/api/v1/stats
```
**認証必須（Bearer）**
```
POST /market/api/v1/listings/draft          {nft_origin, price_satoshis, payout_script, cancel_pubkey}
POST /market/api/v1/listings/submit         {template_id, signed_transaction_hex}
POST /market/api/v1/listings/{id}/cancel/draft
POST /market/api/v1/listings/{id}/cancel/submit
POST /market/api/v1/purchases/draft         {listing_id}
POST /market/api/v1/purchases/submit        {template_id, signed_transaction_hex}
GET  /market/api/v1/me/listings
GET  /market/api/v1/me/purchases
POST /market/api/v1/works/draft             {manifest, total, price…}
POST /market/api/v1/works/{id}/mint/next
POST /market/api/v1/works/{id}/mint/ack     {serial, txid, nft_origin}
GET  /market/api/v1/works/{id}/content      暗号文のままストリーム
POST /market/api/v1/arc/callback            ARC の非同期コールバック（必須。§13）
```

- throttle は BE の `NCTemplateRateThrottle` / `NCBroadcastRateThrottle` 相当（draft は緩め・submit は厳しめ）。
- S009 §7.3 は `/api/v1/market/...` と書いているが、market は `/market/` 配下に丸ごとマウントされるので
  実パスは `/market/api/v1/...` になる（S009 §7.3 も同じ表記に揃えてある）。

## 7. 認証

**方式: トークン委譲 + BE へのイントロスペクション**（S009 §8）。BE は無改造。

```
ブラウザ: GET /auth/bff/token          （既存 BFF。refresh は FE セッション内に留まる）
   │ access token（JWT・15 分）をメモリに保持（localStorage 禁止・既存方針）
   ▼
ブラウザ: /market/api/v1/... に Authorization: Bearer <BE の access token>
   ▼
market:  GET {BE_API_BASE_URL}/api/v1/user/info に同じ Bearer を中継
   │ 200 → principal = data.id（+ paymail/username/account_type を投影に upsert）
   │ 401 → そのまま 401
   └ 結果は (jti, exp) 単位で 60 秒キャッシュ
```

- **JWT をローカル検証しない**。BE の `SIMPLE_JWT` は HS256 ＝署名鍵が `SECRET_KEY` なので、
  market に配ると market が任意ユーザーのトークンを偽造できる（BE の信頼境界を壊す）。
- 将来 BE が RS256 + JWKS を出せるようになったら切り替えられるよう、`TokenVerifier`
  インタフェースで抽象化しておく。
- 問い合わせ先は**固定 URL のみ**（SSRF 対策。リクエスト由来の値を URL に混ぜない）。
- トークンはログに書かない（`jti` の先頭 8 文字だけ）。
- `accounts` の**ログイン・登録・パスワード再設定の URL と view は作らない**。BE と二重の
  認証主体を作らない（S011 §5）。Django admin だけ例外で、`ADMIN_URL` を env 化して nginx で遮断する。

## 8. 取引フロー

### 8.1 決済方式 — OrdLock 型のオンチェーン・ロック

売り手は ordinal を「**売り手へ指定額を払う出力を含む tx でしか解けない**」スクリプトへ移す。
購入は 1 本の tx で NFT と代金が同時に動く（原子的）。参照実装は `js-1sat-ord` の `ordLock` で、
これに合わせると**外部の 1Sat マーケットからも購入可能**になる。

```
List   : [in] ordinal 1sat (売り手 P2PKH)      → [out0] ordinal 1sat (OrdLock{payout, price})
         [in] 手数料入力                        → [out1] 手数料おつり

Buy    : [in0] ordinal 1sat (OrdLock・署名不要) → [out0] ordinal 1sat (買い手の ordinal アドレス)
         [in1..] 買い手 P2PKH                   → [out1] price → 売り手の payout script
                                                → [out2] 市場手数料 → 市場の受取 script
                                                → [out3] 買い手おつり

Cancel : [in0] ordinal 1sat (OrdLock・売り手署名) → [out0] ordinal 1sat (売り手へ戻す)
         [in1..] 手数料入力                       → [out1] 手数料おつり
```

実装とテストで固定する不変条件:

- ordinal は常に **出力 index 0**、**1 sat ちょうど**
- `out1` の locking script と satoshis は OrdLock が強制する（＝**価格は改竄不能**）
- 市場手数料は OrdLock が強制しない → **端末が告知額と突き合わせる**（§8.4）
- 二次流通ロイヤリティは OrdLock では**強制できない**（必要なら sCrypt 版ロック契約を別設計）
- キャンセル鍵は端末が自分で導出した `cancel_pubkey` と `payout_script` を出品時に market へ渡す。
  **market は鍵を持たない**。導出パスは端末が決めた固定規則なので別端末復元後も同じ鍵に到達できる

### 8.2 出品（List）— BE のテンプレート経路を使う

ordinal UTXO の locking script と**導出パスを知っているのは BE だけ**（`GET /api/v1/nc/utxos/` は
P2PKH のみ返す）。かつ手数料が YP 補助に乗るので**売り手が残高 0 でも出品できる**。監査証跡も既存のまま残る。

```
端末 → market  POST /market/api/v1/listings/draft {nft_origin, price_satoshis, payout_script, cancel_pubkey}
market         所有確認 GET {BE}/api/v1/user/nfts/info → OrdLock script を組む
market → BE    POST /api/v1/nc/nft/template/  ★ recipient_locking_script = OrdLock（S010）
端末           意図検証（§8.4）→ 自分の入力だけ署名
端末 → market  POST /market/api/v1/listings/submit {template_id, signed_transaction_hex}
market → BE    POST /api/v1/nc/transaction/broadcast/ → ARC
```

**前提**: S010 の `recipient_locking_script` が BE に入っていること（§1 のとおり未実装）。
入るまで出品は実装できない。完全無改造の代替（S009 §6.3）は手数料が売り手の自己負担になり、
残高 0 の NC ユーザーが**出品できなくなる**ので採らない。

### 8.3 購入（Buy）・キャンセル（Cancel）— market が自分で組む

入力が OrdLock で BE の UTXO 表に存在しないため、BE には組めない。market が組み ARC へ直接送る。

```
端末 → market  POST /market/api/v1/purchases/draft {listing_id}
market         listing を select_for_update（二重購入防止）
market → BE    GET /api/v1/nc/utxos/（買い手の支払い入力）
market → BE    GET /api/v1/nft/legacy-address（買い手の ordinal 受取先）★ 必ずこれを使う
market         OrdLock 解錠 tx を組む（out0 = ordinal）
端末           意図検証 → 自分の P2PKH 入力だけ署名
端末 → market  POST /market/api/v1/purchases/submit
market         検証 → ARC へ broadcast → 買い手・売り手の両方に BE 再同期（§8.5）
```

- 買い手の受取先に**勝手なアドレスを使わない**。BE に登録済みの導出アドレスでないと
  BE の `check_legacy_nft_addresses()` が後から再紐付けできず、**BE から NFT が見えなくなる**。
- マイナー手数料は買い手負担（購入 tx に自分のおつりがある）。キャンセルは売り手負担で、
  残高 0 で詰むため market 側に**小額の fee wallet**（別鍵・上限つき）を置く。
- **paymail 送金は使わない**。同一ホスト内の転送で txid が衝突し受信側の NFT 紐付けが飛ぶ
  既知の不具合があるため、宛先は必ず `legacy-address` で採る。

### 8.4 端末側の意図検証（market を信頼しない）

既存 `nc-send.js` / `nc-nft-send.js` の `verifyTemplate()` + `verifyIntent()` と同じ思想を適用する。
**market が返す未署名 tx をそのまま署名する実装はマージしない。**

| 操作 | 端末が検証すること |
|---|---|
| List | `in0` が自分が選んだ NFT の現在の outpoint / `out0` が 1 sat かつ locking script が**自分で組み直した OrdLock と完全一致** / 署名対象が `in0` だけ |
| Buy | `out0` が 1 sat かつ自分の ordinal アドレス宛 / `out1` が表示価格と一致 / `out2`（市場手数料）が告知額以下 / 入力合計 − 出力合計が手数料上限以内 / 署名対象が自分の P2PKH 入力だけ |
| Cancel | `out0` が 1 sat かつ自分宛 |

このため market のテンプレート契約は BE の NC と**同形**にする
（`{template_id, unsigned_transaction_hex, inputs[], outputs[], client_signs_input_indices,
tx_fingerprint, expires_at}`）。FE の検証・署名コードをほぼそのまま再利用でき、レビューする目も 1 種類で済む。

### 8.5 成約後の BE 追随

market は BE のテーブルを触らず、**BE 自身に取り込ませる**。

| 用途 | EP |
|---|---|
| 成約後の状態追随 | `POST /api/v1/user/legacy-tx/update` / `GET /api/v1/user/nfts/nft-legacy-tx/update` |

成約直後に買い手・売り手それぞれのトークンで叩く。トークンが無い側（オフラインの売り手）は
次回ログイン時に FE の既存 `/api/v1/refresh` が回収する。

> ⚠ **Spike 0（Phase 3 の着手前に必ず実測）**: OrdLock 経由で移動した ordinal を BE の
> `RecoveryService.check_legacy_nft_addresses()` が買い手のアドレスで拾い、`NFT.current_utxo` を
> 正しく張り替えられるか。**同一ホスト内転送で紐付けが飛んだ実績がある**ので楽観視できない。
> NG なら方式（market 側で所有権ビューを持つ／BE の recovery を拡張）を再判断する。

### 8.6 custodial ユーザー — 板を 2 本に分ける

custodial は鍵が BE 側にあり端末署名ができない。OrdLock に載せるには BE に実質「任意 tx 署名」が
必要になるので載せない。代わりに板を 2 本にし、一覧では混ぜて出してバッジで区別する（S009 §6.4）。

| 板 | 対象 | 決済 | キャンセル | 外部マーケット |
|---|---|---|---|---|
| **非預託板**（OrdLock） | NC ユーザー | 1 tx で原子的 | 売り手の鍵で解除 | **購入可**（1Sat 互換） |
| **プラットフォーム板**（予約） | custodial ユーザー | 成約時に 2 tx | 予約の取消だけ（無料・即時） | 不可 |

custodial の出品では NFT の鍵を**すでに BE が保管している**ため、履行者は取引相手ではなく
プラットフォーム自身であり、原子性を要求しても守る相手がいない。利用者は鍵の保管で既に
プラットフォームを信頼しているので**新しい信頼を増やしていない** — これが §8.1 の原子性要件を
custodial だけ緩める根拠。残るのは実装の整合性の問題なので `SettlementJob` と補償で扱う。

custodial が非預託板から買う場合は **market が代金を立て替えて 1 tx で解錠**し、ordinal 出力を
買い手のアドレスへ**直送**する（market は NFT を一度も預からない）。

```
SettlementJob: created → paid → (delivering) → delivered → settled
                          └→ refund_pending → refunded     （引き渡し不能）
                          └→ payment_failed                （代金が確定しない）
```

各遷移は冪等（`txid` を一意キー）。`delivering` が既定 10 分を越えたらアラート＋自動リトライ、
3 回失敗で `refund_pending`。返金先は**買い手の登録アドレス**（送金元アドレスではない）。

## 9. 作品（オンチェーン本体）

**この製品の特徴は「作品本体がブロックチェーン上にある」こと**に置く。設計の全体は S009 Part II。
実装契約として外せない点だけ:

| 項目 | 契約 |
|---|---|
| 構造 | 作品 NFT 1 件（プレビュー + マニフェスト）＋ 本体チャンク tx K 本（`OP_FALSE OP_RETURN`） |
| チャンク | **4 MB/tx**。入力は **market の fee wallet**（データ出力は誰の署名も要らない） |
| 1 inscription | **1 MB 以内**（プレビュー + メタデータ）。4 層の上限すべてに収まる既定値 |
| 費用 | **100 sat/kB**（`nc_fee_rate()`。spec の 1000 sat/kB は運用で採らない）。1 MB ≒ 100,000 sat |
| 限定 N 点 | 親が本体を 1 回だけ載せ、子は `subTypeData` のマニフェスト抜粋のみ。**点数は費用にほぼ影響しない**（30 点で約 3,000 sat） |
| 作成経路 | 既存 NC の `prepare` → 端末で組立/署名 → `broadcast` の片道方式。**`access` / `cipher` / `approval` の 3 引数だけ追加**（[`S013`](../../documents/S013_be_encryption_option_decision.md)。既定値では挙動不変） |
| `subTypeData` | BE は無検証なので、エディション／シリアル／コメント／マニフェストはここに載せる |
| シリアル | オンチェーンで不変にする。`comment` は上限 200 文字。`name` にも `#10/30`（`name` は BE が検証＝改竄不可） |
| 正規性 | プロトコルでは強制されない。market が「コレクション親と同じ作成者の鍵から出ているか」を検証して**バッジ**を出す |
| 暗号化 | AES-256-GCM（4 MB チャンクごと・AAD にチャンク番号）。**平文が存在するのはブラウザだけ**。**既定は暗号化**（`access=owner_only`）で、平文公開は人手審査の通過後のみ |
| 鍵解放 | `vault` が**現在の所有者**を BE の `/user/nfts/info` で確認し、CK を購入者の公開鍵へ ECIES で再封。market の `Purchase` と突き合わせない（転売で権利が自動的に移る） |
| 完全性 | `sha256_plain` とチャンクごとの `sha256` を**オンチェーンの `subTypeData`** に置く。market が差し替えても検知できる |
| プレビュー | 長辺 512px WebP・30 KB 以内を**作品 NFT の inscription 本体**に置く（**承認後**）。承認前は market のサムネキャッシュにだけ置く。プレビューは平文なので**唯一の恒久的な漏洩経路**になる |
| 審査 | **inscribe の前に審査**。R-18・二次創作・平文公開・プレビューは人手審査必須。チャンク放送も承認後。審査者は CK を自分の鍵で開く（§9.1） |
| マニフェスト | `ordinalx.work/1`（S009 §20.1）。`parts[]` を**公開仕様**にすることが「本体がチェーン上にある」ことの担保 |
| サイズ上限 | 1 作品 **500 MB**（4 MB × 125 本）。1 日あたり総量上限も設ける |

オンチェーンで**原理的にできないこと**を UI と規約で明示する: 購入者ごとの透かし（暗号文は 1 つ）、
削除、鍵のローテーション。**DRM ではない**（復号後の平文のコピーは防げない）。

> ⚠ 恒久性が効く唯一の防御線は**順序**である。§9.1 の順序を実装で固定する。

### 9.1 公開してはいけないデータが載った場合のガード

他人の著作物・個人データ・流出情報が載る事故を前提に、入口と事後の両方を実装する。
設計の全体と「できないことの表明」は S009 §20.3。

**順序（唯一の本物の防御線）**

```
作成申請 → ブラウザで暗号化 → 暗号文を market の staging へ（チェーンには書かない）
        → 審査（R-18 / 二次創作 / 平文公開 / プレビューは人手）
        → 承認 → チャンク放送 → 親（プレビュー + マニフェスト）→ 子
        ↑ 取り消せる（staging を捨てるだけ）              ↑ ここから不可逆
```

**審査者の閲覧経路**: vault が CK を**審査者の公開鍵**（作成者と同じ paymail identity 鍵 =
xpub の `m/0/1`）へ ECIES で再封し、審査者のブラウザで復号する。平文は market にも vault にも
渡らない。所有権判定の例外になるので `reviewer` ロールを明示し、**誰がいつどの作品を開いたかを
vault の監査ログに残す**。

**入口（事前）**

| 層 | 実装 |
|---|---|
| 蛇口 | 本体チャンクは market の fee wallet が払う（§10）。作成者は 125 本の data tx を自力で出せないので**大型コンテンツは必ず市場を通る** |
| 自動 | ブラウザ内で EXIF/GPS 除去、既知ハッシュ照合（perceptual hash を market に問い合わせ）、形式とサイズの検査 |
| 禁止カテゴリ | 個人データ（本人確認書類・顔写真・連絡先・医療／金融情報）を規約と作成前ダイアログで禁止し、自動チェックでも弾く。**消去請求に原理的に応じられない**ので持たないことしか手が無い |
| 抑止 | 平文公開と大型作成に身元確認を条件化。`principal` + txid の監査証跡、1 日総量上限 |

**事後**

| 手 | 実装 | 効き方 |
|---|---|---|
| 鍵の恒久失効 | `vault.KeyRevocation` — 以後 CK の再封を拒否。解除は二人承認 | 暗号化作品の kill switch。暗号文は残るが**誰も新たに読めない** |
| 運営 blocklist | `listing.BlockedContent`（`nft_origin` / `txid` / `sha256`）。一覧・検索・詳細・サムネ・`parts[]` の返却を止める。FE 側にも同じキーで運営スコープを足す（利用者ごとの `HiddenNFT` とは別） | 自分の面では完全に見せない |
| delist | `Listing.status = invalid` + 再出品禁止 | 売買を止める |
| キャッシュ削除 | `NftCache.thumb` / staging / 本体キャッシュ | 自分が持つ複製を消す |
| 受付と記録 | `listing.TakedownRequest`。**暫定 delist まで既定 24 時間**の SLA | 判断を残す |

**実装上の制約**

- staging はディスクを食う（1 作品最大 500 MB・`/mnt/extra` は残り約 3.4 GB）。
  `MAX_STAGING_BYTES_TOTAL`・TTL（既定 72 時間）・**同時に審査待ちにできる作品数**の上限を
  最初から入れる。却下と TTL 切れは即削除し、削除も監査ログに残す
- 失効は**遡及しない**。既に購入して復号した人の手元の平文は止められない（DRM ではない）
- **ウォレット直の inscribe は BE 側で塞ぐ**（[`S013`](../../documents/S013_be_encryption_option_decision.md)）。
  作成経路に `access`（`public` / `owner_only`）と `cipher` を足し、`owner_only` は表示されない
  `content_type`（既定 `application/octet-stream`）に限定、`public` はポリシーが有効なとき
  **承認トークン**を要求する。**BE は「暗号化されていること」自体は検証できない** — 効くのは
  「見られる形で載るには宣言された media type が要る」性質で、表示経路が塞がる。
  既定値では挙動不変で、抜け道が実際に閉じるのは `NC_NFT_PUBLIC_REQUIRES_APPROVAL=True` の時点

## 10. 手数料

| 種類 | 設計 |
|---|---|
| 市場手数料 | `MARKET_FEE_BPS`（既定 **250 = 2.5%**）。購入 tx の出力として載せ、端末が告知額と照合。一次／二次で分けられるよう `fee_bps` を Listing に持つ |
| 作成手数料 | **販売価格とは別建て**（価格に埋めると赤字出品が起きる）。サイズ連動 |
| 一次支払い | **切り替え不能**。inscription = YP fee wallet（BE の Option A 固定）／本体チャンク = market fee wallet |
| 負担ポリシー | `payer(creator｜platform)` × `collection(prepaid_bsv｜prepaid_fiat｜deduct_from_sale｜none)` × `absorbed_by(yp｜market)`。既定は **`creator` / `prepaid_bsv`** |
| スコープ | グローバル（env）→ サークル／作家（`Vendor.fee_policy`）→ 作品（`Work.fee_policy`）。**狭いものが勝つ** |
| 固定 | 適用したポリシーと実費を作成時に `WorkFeeLedger` へ記録。**後からポリシーを変えても遡及しない** |
| UI の契約 | 作成を始める**前に**見積り額・JPY 換算・誰が負担するかを必ず出す。黙って運営が被る／黙って請求する、のどちらも作らない |

> ⚠ **YP fee wallet の予約可能残高は直近 49,131 sat ＝ 約 490 kB 分**で、2.7 MB の画像 1 枚すら通らない。
> 負担ポリシーに関わらず inscription の一次支払いはここから出るので、**作成前に残高を確認して
> 足りなければ 503 で止める**。入金は前提条件。

ガード: `MAX_FEE_SATOSHIS_PER_WORK`（既定 ≒ 5,000,000 sat）/ `MAX_SUBSIDY_SATOSHIS_PER_DAY` /
`MAX_OUTSTANDING_PER_VENDOR`。

## 11. ワーカー

| 名前 | 間隔 | 役割 |
|---|---|---|
| `reconcile_listings` | 5 分 | `active` な listing の OrdLock UTXO の未使用性を確認。**外部マーケットでの成約・直接 spend・バーン**を拾って上書き（1Sat 互換にする以上必須） |
| `confirm_broadcasts` | 1 分 | `pending` の tx を ARC/WoC で追跡 |
| `expire_templates` | 1 分 | TTL 切れテンプレートの破棄（300 秒・BE と揃える） |
| `advance_settlements` | 1 分 | `SettlementJob` の遷移。冪等・`txid` 一意 |
| `verify_reservations` | 10 分 | プラットフォーム板の予約が**まだ売り手の所有下にあるか**を確認し、失効させる |
| `broadcast_parts` | 随時 | 本体チャンクの放送（失敗したチャンクだけ再送） |
| `sync_nft_cache` / `rebuild_cache` | 随時 | サムネイル補充と、チェーンからの本体再構成 |
| `market_fee_wallet` | — | fee wallet の残高監視・上限アラート |

cron をコンテナで動かすときは **`SQL_HOST` 等を crontab 側に明示する**（cron はコンテナの env を
継承しないため、BE で承認追跡が止まった実績がある）。

## 12. 設定（環境変数）

秘密はリポジトリに置かない。`.env` + `os.environ`（FE・BE と同じ方式）。

| 変数 | 既定 | 用途 |
|---|---|---|
| `SECRET_KEY` | 開発用の固定値 | 本番では必ず設定 |
| `DEBUG` | 無効（0） | |
| `DJANGO_ALLOWED_HOSTS` | `127.0.0.1 localhost` | 空白区切り |
| `SQL_ENGINE` / `SQL_DATABASE` / `SQL_USER` / `SQL_PASSWORD` / `SQL_HOST` / `SQL_PORT` | sqlite / `app/db.sqlite3` | `yp_market` / `yp_market_dev` に差し替え |
| `BE_API_BASE_URL` | — | **BE への唯一の結線**。docker のネットワーク名・コンテナ名・IP をコードに書かない |
| `ARC_URL` / `ARC_TOKEN` / `ARC_CALLBACK_URL` | — | `ARC_CALLBACK_URL` 未設定だと同期ポーリング 20 回で 504 になる。**必ず設定しコールバック EP を用意する** |
| `WOC_*` | — | chaintracker（reconcile・本体再構成） |
| `MARKET_FEE_BPS` / `MARKET_FEE_SCRIPT` | 250 / — | 市場手数料と受取先 |
| `MARKET_FEE_POLICY_DEFAULT` | `creator/prepaid_bsv` | 作成手数料の既定ポリシー |
| `MAX_FEE_SATOSHIS_PER_WORK` / `MAX_SUBSIDY_SATOSHIS_PER_DAY` / `MAX_OUTSTANDING_PER_VENDOR` | §10 | 運営コストのガード |
| `MARKET_FEE_WALLET_*` | — | fee wallet の鍵は**env だけ**から。コードにも DB にも埋めない |
| `MARKET_ENV` | `dev` | `dev｜prod`。板の問い合わせを常にこれで絞る（§13） |
| `MARKET_DEV_PRINCIPALS` | 空 | dev の作成・出品を許す principal の allowlist |
| `MAX_STAGING_BYTES_TOTAL` / `STAGING_TTL_HOURS` / `MAX_WORKS_IN_REVIEW` | — / 72 / — | 審査待ち暗号文の総量・TTL・同時件数（§9.1） |
| `TAKEDOWN_PROVISIONAL_SLA_HOURS` | 24 | 申し立て受付から暫定 delist まで |
| `ADMIN_URL` | — | admin の露出先。nginx で遮断する |
| `STATIC_URL` | `/market-static/` | ウォレットの `/static/` と分ける |

## 13. デプロイと環境分離

### 13.1 稼働形態

FE の `docker-compose.linode.yml`（BE と同居しつつ専用 web + db + network で完全分離）を型にして
`docker-compose.market.yml` を書く。

- アプリコードは **bind mount**（build 不要・`restart` だけで反映）
- **専用 DB コンテナ `market-db`**（Postgres）。`yp_dev_db` は共有しない
- **専用ネットワーク**。`betawallet_default` には触らない（subnet を振り直すと `spv.buxbit.net` が落ちる。
  **`docker compose down` 禁止**、`up -d` はサービス明示 + `--no-build`）
- 起動時に `collectstatic`

```nginx
# fe-nginx（conf は bind mount なので reload だけで反映）
location /market/        { proxy_pass http://market-web:8000; }   # UI + API
location /market-static/ { alias /home/app/market-static/; }
# location / は最後。longest prefix match なので /market/ が勝つ
```

反映手順:
```
1. /mnt/extra/OrdinalX_Marketplace で作業・commit（runserver :8100 で確認）
2. git tag -a mp-YYYYMMDD-N -m "..."      # 暫定本番に出すときだけ
3. tools/restart.sh market                # ← FE リポジトリの restart.sh に market を足す
```

> ⚠ **restart でコンテナ IP が変わり nginx が 502 になる**罠がある。market は fe-nginx が直接
> proxy_pass するので、**restart 後は `tools/restart.sh fe-nginx` で reload** する運用にする。

> ⚠ **bind mount がイメージ層を隠す**。`./app` を mount すると、イメージ内でビルドした
> C 拡張（bsv-sdk の `.so`）が見えなくなる。**エラーは出ず「正しく動くが遅い」だけ**なので
> 気づきにくい。BE の `restore-native-ext.sh` と同じ仕掛けを market にも用意する。

> ⚠ ディスクは `/mnt/extra` が残り約 3.4 GB しかない。サムネイルは総量上限と LRU を最初から入れ、
> ログは `/etc/logrotate.d/ordinalx` に market を追記する（copytruncate）。

### 13.2 入切のスイッチ

| 入切するもの | 内容 |
|---|---|
| fe-nginx の `location /market/` / `location /market-static/` | 外すと `/market/` が 404 |
| `wallet_web_ui/templates/components/nav-extra.html` | 外すとナビからマーケットが消える |

市場のコードは FE のツリーに入らないので、**市場の変更が FE の restart を要求しない**。
市場は**当面 Service Worker を登録しない**（ウォレットのルートスコープ SW に乗る。経路非依存なので変更不要）。

### 13.3 環境分離の落とし穴（過渡期）

**BE の暫定本番と開発 `:8002` は同じ `yp_dev_db` を見ている。** したがって dev の検証で作った
NFT・取引が本番ユーザーの一覧に現れ、出品は**本物のチェーン**に出て、作成手数料は**本物の YP
fee wallet** から出る。market 側の緩和は 3 つで、**どれも捨てられる形で作る**:

1. `MARKET_ENV` を `Listing`・`Work`・`Purchase` に持たせ、板の問い合わせを常に env で絞る
   （**1 つの設定値と 1 つのクエリ絞り込みに閉じ込め、ロジックに散らさない**）
2. dev の作成・出品は `MARKET_DEV_PRINCIPALS` の allowlist に限定
3. dev 用の fee wallet は別鍵・小額（ただし**出品経路は YP の fee wallet を使うので分離できない**
   → dev の出品回数に上限とアラート）

本質的な解消は**真の本番サーバを立てて DB を分けること**で、market の設計では解けない。
真の本番サーバを立てる時期が早いほど、ここに積む仮設は少なくて済む。

### 13.4 真の本番サーバへの移行に備えて今から守ること

| # | 守ること |
|---|---|
| 1 | 起動時にホストのツリーを前提にする仕掛けを増やさない（`entrypoint` は collectstatic と migrate 判定だけ） |
| 2 | market の DB に**ホスト依存の値を入れない**（絶対 URL・ローカルパスを列に持たない。参照は `nft_origin` / `txid` / `principal` だけで閉じる） |
| 3 | paymail 解決を**自分でやらず BE の既存 EP に委ねる**（この性質を崩さない。移転時に market 側の変更が発生しない） |
| 4 | fee wallet の鍵は**最初から環境変数で切り替わる**設計にする |
| 5 | **docker のネットワーク名・コンテナ名・IP をコードに書かない**。ブラウザ→market は nginx の location 1 箇所、market→BE は `BE_API_BASE_URL` 1 本 |

**移転しなくてよいもの**: 作品の本体とプレビュー、出品（OrdLock）、成約履歴 — すべてオンチェーン。
移すのは **DB と鍵と設定だけ**。

## 14. セキュリティの不変条件

1. **market は秘密鍵を持たない**（fee wallet だけ・上限つき・残高監視つき）。
2. **端末は market を信頼しない**（§8.4）。テンプレート検証を省いた実装はマージしない。
3. 価格は OrdLock script に埋まるので改竄不能。端末は表示額と script の payout を照合する。
4. 市場手数料は script で強制されない → 端末が告知額と突き合わせる。
5. イントロスペクションの宛先は固定 URL のみ（SSRF）。トークンはログに残さない。
6. サムネイルはユーザー投稿由来 → content-type ホワイトリスト・再エンコード・サイズ上限。
7. 監査証跡は NC と同じ 4 段（発行 / 署名受領 / 検証 / 送信結果）＋ `SETTLE-*`。
8. 代金の一時保持は最小に。受取用の鍵は fee wallet と分け、返金経路はジョブで管理し**手作業にしない**。
9. **同一オリジンはセキュリティ境界ではない**。市場がそのオリジンに出すものにはウォレットと
   同じ審査基準を適用する。`SESSION_COOKIE_DOMAIN` は**未設定のまま維持**する。
10. パスワード変更経路に触らない（KEK の再ラップを伴わない `set_password` 経路を作らない）。
11. **チェーンに書く前に審査を通す**（§9.1）。承認前の暗号文は staging に留め、プレビューも
    オンチェーンに載せない。審査者の閲覧は vault の監査ログに残す。
12. **事後のガード（`KeyRevocation` / `BlockedContent` / `TakedownRequest`）を最初から実装する。**
    「あとで足す」と事故の当日に手が無い。個人データは入口で弾く。
13. `vault` は **market のコンテナに鍵を渡さない**。同一ホストでは (a)→(b) は壁ではなく段差で、
    上限を決めるのは**鍵の保管方式**（§18 #5）。**マスター鍵と CK ストアを失うと全ての暗号化作品が
    永久に復号不能**になる（暗号文はチェーン上にあって消せないのに誰も読めない）。vault の DB の
    バックアップは market の DB より優先度が高い。

## 15. テストと受け入れ基準

| 層 | 内容 |
|---|---|
| 単体 | OrdLock script の組立（1Sat 互換のバイト列一致）・意図検証・ポリシー適用・冪等性 |
| 契約 | テンプレートのエンベロープが BE の NC と同形であること（FE の `unwrap()` / `verifyTemplate()` がそのまま通る） |
| E2E | FE リポジトリの `app/e2e/` の作法に合わせ `test_market_list_buy.py` を追加（`--funded` 系・接続先は `app/e2e/settings.yaml`） |
| 見た目 | **screenshot 回帰**: `/view/dashboard` と `/market/` を撮り比べてシェルが一致すること。手順は FE の「test Client でレンダー → `file://` 書き換え → playwright」を踏襲 |
| 撤去テスト | fe-nginx の location 2 本と `nav-extra.html` を外した状態で、FE の既存 E2E 4 本（`app/e2e/tests/test_custodial_registration.py` / `test_nc_registration.py` / `test_nc_send.py` / `test_nc_restore.py`）が**1 件も落ちない**。その状態で `/market/` が 404、ナビにマーケットが出ない |

疎結合は感覚ではなく**検証できる規則**にする。禁止事項（レビューで落とす）:

1. ウォレットのリポジトリに市場のコードを置かない（`market_ui` のような Django アプリを作らない）
2. 市場は**実行時に**ウォレットのビルド成果物を参照しない（署名コアはビルド時に版を固定して取り込む）
3. market は BE の DB に直接つながない。BE のモデルを複製しない
4. market は BE のテーブルに **INSERT/UPDATE しない**

許容する依存はこれだけ:

| 依存 | 形 |
|---|---|
| 市場のページ → `/auth/bff/token` | URL 契約（同一オリジンなので Cookie が送られる） |
| 市場のビルド → UI キット + 署名コア | **版付きパッケージをビルド時に取り込む** |
| 市場のテンプレート → `components/wallet-base.html` | キット同梱のファイルを `TEMPLATES['DIRS']` 経由で extends |

キットの契約として、`wallet-base.html` が要求する context 変数 6 つを market 側が同じ名前で供給する:
`profile_picture_url`（**`reverse()` 済みの文字列**）/ `account_type` / `is_nc_account` /
`nc_username` / `nc_paymail` / `nc_user_id`。ボトムタブのアクティブ判定は Django 固有の
`request.resolver_match.url_name` なので、キット化の際に **`data-active="market"` の属性駆動**に変える。

市場固有の部品が必要になったら**キット側に「s006 骨格 + gaudi スキン」として足す**
（PR はウォレット側リポジトリ）。市場の private CSS は**レイアウトの都合だけ**に限る。
**見た目の食い違いは選択ではなくバグ**として扱う。価格表示は**金額扱い**なので、
ネオモルフィズムを掛けず高コントラストで出す。

## 16. 段階計画

Phase 0 は **土台の構築**で、内訳は S011 §10 と対応する。Phase 1 以降は S009 §11 のまま。

| # | Phase 0 の作業 | 備考 |
|---|---|---|
| P0-1 | Postgres 化（`yp_market_dev`）+ psycopg | 現在 sqlite 既定 |
| P0-2 | DRF + drf-spectacular 導入、エンベロープとエラーコードの共通化 | BE の NC と同形 |
| P0-3 | アプリの骨格: `accounts`（投影）/ `vendor` / `product` / `chain` / `listing` / `vault`（別 settings） | §4 |
| P0-4 | migration を**1 回で**作る | 運用前の今だけコストがゼロ |
| P0-5 | **署名コアと UI キットを版付き共有パッケージへ切り出す**（FE 側リポジトリの作業） | S012 §6 / §8.1。**市場 UI の実装より先**。後回しにすると鍵の実装とデザインが 2 箇所に分岐する |
| P0-6 | 市場の 1 画面を `wallet-base.html` extends + s006 骨格クラスだけで描く | 完了条件の判定対象 |
| P0-7 | `docker-compose.market.yml`（`market-web` / `market-db` / `market-cron`）+ entrypoint | §13.1 |
| P0-8 | fe-nginx に location 2 本 + `tools/restart.sh` に `market` ターゲット追加 | 現在どちらも無い |
| P0-9 | `components/nav-extra.html` を**空で**作り、既存ナビに include 1 行 | ウォレット側の追加はこれ 1 ファイルだけ |
| P0-10 | bsv-sdk（BE と同じ git 版）の導入と C 拡張ビルド手順の確認 | bind mount が `.so` を隠す罠（§13.1） |

**Phase 0 の完了条件**: market が `/market/` で起動し、`migrate` が通り、admin に入れる。秘密が
リポジトリに無い。市場の 1 画面が `wallet-base.html` を extends し **s006 の骨格クラスだけで**描けて
**ガウディの見た目になっており**、`/view/dashboard` との screenshot 比較でシェルが一致する。
nginx の location 2 本と nav を外すと `/market/` が 404 になり、FE の既存 E2E 4 本が全 PASS。

| 段階 | 内容 | 完了条件 |
|---|---|---|
| **Spike 0** | ① OrdLock 経由で移動した ordinal を BE の既存 recovery が再紐付けできるか（§8.5）② OrdLock script の Python 実装と 1Sat 互換 ③ ARC の `maxtxsizepolicy` とデータ出力 tx の受理可否 ④ **OrdLock が payout 出力を「位置で」検証するか「含まれているか」で検証するか**（まとめ買いの可否が決まる） | testnet/本番少額で「出品→購入→BE の NFT 一覧に買い手側で出る」まで通る |
| **Phase 1** | market が UI と公開一覧を出す + nginx のパスマウント + イントロスペクション（**書き込みなし・ダミーデータ可**） | PWA の中で `/market/` が開き、撤去テストが通る |
| **Phase 2** | NC 出品・キャンセル（**S010 の 1 パラメータ追加を含む**） | 出品が `active` になり、キャンセルで NFT がウォレットに戻る |
| **Phase 2.5** | 作品の作成（オンチェーン本体・限定・暗号化と鍵解放・プレビュー・マニフェスト）＋ **審査フローと事後ガード**（§9.1）＋ **BE の暗号化オプション**（S013） | 50 MB の作品を限定 30 点で作成し、購入者だけが復号できる。**却下するとチェーンに 1 バイトも書かれていない**ことと、`KeyRevocation` を立てると新たな復号ができなくなることを実機で確認 |
| **Phase 3** | NC 購入（原子的スワップ）+ BE 再同期 + reconcile | 別ユーザー間で売買が成立し、両者の BE 残高/NFT 一覧が追随する |
| **Phase 3.5** | custodial 対応（予約・成約、代理購入、`SettlementJob` と補償） | 引き渡し失敗時に返金まで回る |
| **Phase 4** | 市場手数料、検索・並び替え、履歴、通知、板の統合表示 | — |
| **Phase 5** | 外部 1Sat マーケットとの相互運用、ロイヤリティ（要 sCrypt）、MNEE/Kusabi FT 建て | — |

**Phase 0 を飛ばして機能を書き始めない。** 特に P0-5（キットの切り出し）を後回しにすると、
鍵を扱う実装とデザインが 2 箇所に分岐し、あとで統合できなくなる。

## 17. 上位文書との対応

本書の構成・設定・着手順序は S009〜S012 に反映されており、**食い違いは無い**。
traceability のため対応を残す。

| 事項 | 本書 | 上位文書 |
|---|---|---|
| リポジトリ `voyager1708/OrdinalX_Marketplace`（空の Django から新規・base の履歴を継がない） | §2 | S011 §1・§12 #13・#14 / S009 §10 / S012 §1 |
| 作業ブランチ `main`（`deploy/market` は将来の本番サーバ用に予約） | §2 | S011 §1・§4.1・§12 #8 |
| Django プロジェクトは `app/` 配下（settings は `app/yp_marketplace/`） | §4 | S011 §6 |
| API の実パスは `/market/api/v1/...` | §6 | S009 §7.3・§8.2 |
| Phase 0 は土台の構築（P0-1〜P0-10） | §16 | S011 §10 / S009 §11 |
| Python はコンテナ 3.11 / 開発 venv 3.12.3 | §2 | S011 §3・§12 #1 |
| `order` / `cart` は作らない | §4 | S011 §12 #4 |

本書にしか無いのは**このリポジトリ固有の粒度**だけ — §1 の実測、§12 の env 一覧、
§15 の受け入れ基準の具体化、§16 の Phase 0 の内訳。

## 18. 未決事項

S009 §13 / §13-b、S011 §12、S012 §11 のうち**まだ生きているもの**だけを集約した。
決着済みのものは上位文書を参照（S012 §11 は全件決着、S011 §12 は #10 以外決着）。

| # | 事項 | 既定案 / 状態 | いつまでに |
|---|---|---|---|
| 1 | 本書を `/mnt/extra/documents` 側にも採番して置くか（`S013` 等） | 本書はリポジトリ内に置く。上位文書（S011 §10 / S009 §11）からは本書を参照済み | 着手前 |
| 2 | 真の本番サーバを立てる時期（S011 §12 #10） | **未決**。早いほど §13.3 に積む仮設が少ない | Phase 3 までに |
| 3 | BSV/JPY のレート源（S009 §13-b #14） | market 側に実装。複数ソースの中央値・5 分キャッシュ | Phase 2.5 |
| 4 | **鍵の保管方式**（S009 §13-b #19） | KMS で unwrap が既定案。**未決** | **本番で最初の暗号化作品が作られる前**（Phase 2.5） |
| 5 | S010 の決裁（`recipient_locking_script` を BE に入れるか） | **1 パラメータ追加を推奨**。実装はまだ無い | Phase 2 の前 |
| 6 | 市場手数料の料率と受取先（S009 §13 #2） | `MARKET_FEE_BPS=250`、専用アドレス | Phase 4 |
| 7 | 建値通貨（S009 §13 #1） | Phase 1〜3 は **BSV のみ**。FT 建ては Phase 5 | Phase 5 |
| 8 | 出品の有効期限・値下げ（S009 §13 #7） | 期限なし。値下げは cancel + list の 2 tx | Phase 4 |
| 9 | 代理購入の前払いの自動化範囲（S009 §13-b #17） | 都度送金。市場内残高は資金決済法の整理が必要 | Phase 3.5 |
| 10 | プラットフォーム板の引き渡し失敗時の補償（S009 §13-b #16） | 代金全額返金 + 市場手数料は徴収しない | Phase 3.5 |
| 12 | `NC_NFT_PUBLIC_REQUIRES_APPROVAL` をいつ `True` にするか（§9.1 / [`S013`](../../documents/S013_be_encryption_option_decision.md) §10 #4） | **決定: BE 側で止める**（2026-10-05）。切り替え時期は審査体制が回り始めてから。切り替え前に FE のエラー表示を用意する | Phase 2.5 の後半 |
| 11 | `vault` を別リポジトリに分けるか | **同リポジトリ・別プロセス**（S011 §12 #5）。リポジトリ分割は組織上の判断として先送り可 | Phase 2.5 |
