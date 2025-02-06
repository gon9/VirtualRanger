#!/bin/sh
if [ "$USE_SSL" = "true" ]; then
  uvicorn src.main:app --host 0.0.0.0 --port 8000 --ssl-keyfile /app/ssl/key.pem --ssl-certfile /app/ssl/cert.pem
else
  uvicorn src.main:app --host 0.0.0.0 --port 8000
fi 