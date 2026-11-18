#!/bin/sh
# market-web / market-cron の起動前処理（Specification.md §13.1・§13.4-1）。
#
# ここでやるのは **DB 待ち・migrate 判定・collectstatic** だけに留める。
# ホストのツリーを前提にする仕掛けを増やすと、真の本番サーバへ移すときに
# そのぶん引っ越し作業が増える。

set -e

echo "[entrypoint] OrdinalX Marketplace"

# ---- DB を待つ -------------------------------------------------------------
# 専用 DB（market-db）。yp_dev_db は共有しない（§2）。
if [ -n "$SQL_HOST" ] && [ "$SQL_ENGINE" != "django.db.backends.sqlite3" ]; then
    echo "[entrypoint] waiting for postgres ${SQL_HOST}:${SQL_PORT:-5432}"
    while ! nc -z "$SQL_HOST" "${SQL_PORT:-5432}"; do
        sleep 0.2
    done
    echo "[entrypoint] postgres is up"
fi

# ---- UI キットが見えているか ----------------------------------------------
# キットは submodule を bind mount で渡す（イメージには焼かない）。
# 無いとシェルが描けず、全ページが TemplateDoesNotExist になる。
if [ "${SKIP_KIT_CHECK:-0}" != "1" ]; then
    kit="${WALLET_KIT_DIR:-/home/app/vendor/wallet-ui/app/packages/wallet-kit}"
    if [ ! -f "$kit/templates/components/wallet-base.html" ]; then
        echo "[entrypoint] FATAL: UI キットが無い: $kit"
        echo "[entrypoint]   docker-compose.market.yml の vendor マウントと"
        echo "[entrypoint]   git submodule update --init を確認してください"
        exit 1
    fi
fi

# ---- migrate ---------------------------------------------------------------
# 未適用があるときだけ流す（毎回の migrate は本番で無駄に DB を触る）。
if [ "${RUN_MIGRATIONS:-1}" = "1" ]; then
    if python manage.py migrate --check >/dev/null 2>&1; then
        echo "[entrypoint] migrations are up to date"
    else
        echo "[entrypoint] applying migrations"
        python manage.py migrate --no-input
    fi
fi

# ---- collectstatic ---------------------------------------------------------
# 市場の CSS/JS は **ホスト側で npm run build 済み**のものを bind mount で受け取り、
# ここでは集めるだけ（コンテナに Node を入れない）。
if [ "${RUN_COLLECTSTATIC:-1}" = "1" ]; then
    echo "[entrypoint] collectstatic"
    python manage.py collectstatic --no-input --clear >/dev/null
fi

# ---- bsv-sdk の C 拡張（P0-10 で入れる）------------------------------------
# ⚠ bind mount はイメージ層を隠す。イメージ内でビルドした .so が見えなくなり、
#   **エラーは出ず「正しく動くが遅い」だけ**になる（BE で踏んだ罠）。
#   bsv-sdk を入れたら BE の restore-native-ext.sh と同じ仕掛けをここに足す。

exec "$@"
