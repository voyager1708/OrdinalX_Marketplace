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

# ---- bsv-sdk の C 拡張 -----------------------------------------------------
# ⚠ この手の拡張は **エラーを出さずに pure-Python へ落ちる**（BE で踏んだ罠：
#   「正しく動くが遅い」だけなので気づけない）。起動のたびに実測してログに出す。
#
# なお BE の restore-native-ext.sh のような埋め直しは market では要らない。
# あれは **アプリのツリーの中**でビルドした .so（Kusabi）が `./app` の
# bind mount で覆われるための対処で、bsv-sdk の .so は site-packages にあり
# mount の外にいる。将来ツリー内に拡張を足したら、そのときに仕掛けを入れる。
if [ "${SKIP_NATIVE_CHECK:-0}" != "1" ]; then
    python - <<'PYCHECK' || true
import importlib.util
spec = importlib.util.find_spec("_bsv_native")
if spec is None:
    print("[entrypoint] WARNING: bsv-sdk の C 拡張が無い → pure-Python で動く"
          "（正しく動くが遅い）。イメージのビルドを確認すること")
else:
    print(f"[entrypoint] bsv native extension: {spec.origin}")
PYCHECK
fi

exec "$@"
