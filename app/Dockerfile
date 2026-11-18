###########
# BUILDER #
###########
# FE（app/Dockerfile.prod）を型にする。build context はリポジトリ直下で、
# requirements.txt がそこにあるため（FE は app/ 配下に置いている）。

FROM python:3.11-slim-bookworm AS builder

WORKDIR /usr/src/app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# psycopg / pillow のビルドに要る
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip wheel --no-cache-dir --no-deps --wheel-dir /usr/src/app/wheels -r requirements.txt


#########
# FINAL #
#########

FROM python:3.11-slim-bookworm

# ホスト側のソースを bind mount するので、コンテナのユーザをホストの所有者と
# 同じ UID/GID で作る（FE・BE と同じ方式）。揃っていないと logs/ に書けず、
# Django の LOGGING が handler を作れずに起動で落ちる。
ARG UID=1000
ARG GID=1000
RUN addgroup --gid $GID app \
    && adduser --uid $UID --gid $GID --disabled-password --gecos "" app

ENV HOME=/home/app
ENV APP_HOME=/home/app/web
RUN mkdir -p $APP_HOME
WORKDIR $APP_HOME

# nc は entrypoint の DB 待ち、curl は healthcheck、cron は market-cron 用
RUN apt-get update && apt-get install -y --no-install-recommends \
        netcat-openbsd curl cron \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/src/app/wheels /wheels
COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache /wheels/*

# アプリ本体。実行時は bind mount が上に被さるので、ここで焼くのは
# 「mount を外しても動く」ことを保つための控え（FE と同じ考え方）。
COPY app $APP_HOME
COPY tools /home/app/tools

RUN sed -i 's/\r$//g' /home/app/tools/entrypoint.sh \
    && chmod +x /home/app/tools/entrypoint.sh

# collectstatic の出力先（named volume のマウント先）。先に app 所有で作っておくと
# 空ボリュームが app 所有で初期化され、非 root でも書ける。
RUN mkdir -p $APP_HOME/market-static $APP_HOME/logs

RUN chown -R app:app $APP_HOME /home/app/tools

USER app

ENTRYPOINT ["/home/app/tools/entrypoint.sh"]
