# ビルドステージ
FROM python:3.13-slim-bookworm as builder

WORKDIR /app

ENV POETRY_HOME="/opt/poetry"

# Poetryのインストール
# RUN pip install --no-cache-dir poetry
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && curl -sSL https://install.python-poetry.org | python3 - --version 2.1.0

ENV PYTHONUNBUFFERED=1 \
    # poetry home
    PATH="$POETRY_HOME/bin:$PATH"

# 依存関係のコピーとインストール
COPY pyproject.toml poetry.lock ./
RUN poetry config virtualenvs.create false \
    && poetry install --only main --no-root --no-interaction --no-ansi

# アプリケーションコードのコピー
COPY src /app/src

# 実行ステージ
FROM python:3.13-slim-bookworm as runner

WORKDIR /app

# 必要なPythonパッケージとバイナリをコピー
COPY --from=builder /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# アプリケーションコードをコピー
COPY --from=builder /app/src /app/src

EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]


