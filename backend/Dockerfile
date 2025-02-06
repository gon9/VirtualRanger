# ビルドステージ
FROM python:3.13-slim-bookworm as builder

WORKDIR /app

# Poetryのインストール
RUN pip install --no-cache-dir poetry

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


