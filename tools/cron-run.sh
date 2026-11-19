#!/bin/sh
# market-cron のジョブはこれ経由で走らせる（Specification.md §11）。
#
# **cron はコンテナの env を継承しない。** DB のパスワードのような秘密は git 管理の
# app/crontab には書けないので、コンテナ起動時に /etc/market-cron.env へ落としておき
# （docker-compose.market.yml の market-cron の command）、ジョブ側でそれを読む。
# これを忘れると cron はジョブを起動するのに毎回
# `OperationalError: no password supplied` で落ち、**worker が黙って止まる**。
set -e

if [ -f /etc/market-cron.env ]; then
    . /etc/market-cron.env
fi

cd /home/app/web
mkdir -p logs
exec python manage.py "$@"
