# バーチャルレンジャー

このプロジェクトは、React（フロントエンド）と FastAPI（バックエンド）を利用して、音声認識による生成処理、ランダムなBGM再生、そして自動的なセリフ発声を実現するアプリケーションです。

## 特徴

- **音声認識から生成へ**  
  ユーザーが音声認識を開始すると、その認識結果を元にバックエンドAPIでテキスト生成が行われます。

- **BGM再生とセリフ発声**  
  生成完了後、ランダムに選ばれたBGMが自動再生され、2秒後に生成テキストが読み上げられます。  
  発話が終了すると、BGMは自動で停止します。

## 動作環境

- Docker / Docker Compose
- Node.js (フロントエンド)
- Python 3.13 (バックエンド)

## 起動方法

1. プロジェクトルートディレクトリで以下のコマンドを実行して、Dockerコンテナをビルド・起動します。

   ```bash
   docker-compose up --build
   ```

2. 起動後、次のURLでアクセスしてください:
   - **フロントエンド:**  
     - HTTPSモードの場合（`frontend/Dockerfile` で `HTTPS=true npm start` により起動）：  
       `https://localhost:3000`  
     - HTTPモードの場合でも、フロントエンドは起動時は HTTPS モードで動作します（詳細は下記参照）。
   - **バックエンド:**  
     起動時の設定に応じて以下のURLでアクセスできます。
     - **HTTPSモードの場合:** `https://localhost:8000`
     - **HTTPモードの場合:**  `http://localhost:8000`

## HTTP/HTTPS の切り替え

プロジェクトではバックエンドのプロトコル（HTTP または HTTPS）を環境変数で簡単に切り替えられるように設定しています。

### バックエンド側

- **エントリポイントスクリプト**  
  `backend/entrypoint.sh` にて、環境変数 `USE_SSL` の値を確認して、以下のように実行モードを切り替えます。

  ```sh:backend/entrypoint.sh
  #!/bin/sh
  if [ "$USE_SSL" = "true" ]; then
    uvicorn src.main:app --host 0.0.0.0 --port 8000 --ssl-keyfile /app/ssl/key.pem --ssl-certfile /app/ssl/cert.pem
  else
    uvicorn src.main:app --host 0.0.0.0 --port 8000
  fi
  ```

- **Dockerfile の修正**  
  `backend/Dockerfile` にエントリポイントスクリプトをコピーし実行権限を付与しています。

  ```dockerfile:backend/Dockerfile
  # 省略...
  COPY entrypoint.sh /app/entrypoint.sh
  RUN chmod +x /app/entrypoint.sh
  CMD ["/app/entrypoint.sh"]
  ```

- **環境変数設定**  
  `backend/.env` でプロトコルを切り替えます。  
  例: HTTPS モードの場合は `USE_SSL=true`、HTTP モードの場合は `USE_SSL=false` としてください。

  ```dotenv:backend/.env
  USE_SSL=true
  ```

### フロントエンド側

- **起動モード**  
  現在、`frontend/Dockerfile` の起動コマンドでは、常に HTTPS モードで起動するように `HTTPS=true npm start` と設定されており、この設定はそのままで問題ありません。

- **バックエンドへのアクセスURL**  
  また、`frontend/.env` 内で環境変数 `REACT_APP_USE_SSL_BACKEND` を利用して、バックエンドがSSL（HTTPS）で動作しているか否かを判定し、呼び出すURLを自動で切り替えています。

  ```dotenv:frontend/.env
  # バックエンドがHTTPSで動作している場合は true、HTTPの場合は false に設定
  REACT_APP_USE_SSL_BACKEND=true
  # 明示的にAPI URLを指定する場合（任意）:
  # REACT_APP_API_URL=https://localhost:8000
  ```

  そして、`frontend/src/App.js` 内では以下のコードにより、バックエンドの呼び出しURLを動的に生成しています:

  ```javascript:frontend/src/App.js
  const useSslBackend = process.env.REACT_APP_USE_SSL_BACKEND === 'true';
  const backendProtocol = useSslBackend ? 'https:' : 'http:';
  const hostname = window.location.hostname;
  const backendUrl = process.env.REACT_APP_API_URL || `${backendProtocol}//${hostname}:8000`;
  ```

### プロトコル設定の留意点

- **ローカル開発時**  
  ブラウザは混在コンテンツ（Mixed Content）を避けるため、フロントエンドとバックエンドは基本的に同じプロトコル (HTTPまたはHTTPS) で動作させることが望ましいです。  
  フロントエンドは常に HTTPS モード（`HTTPS=true`）で起動するため、バックエンドも HTTPS モードで起動するのが推奨されます。

- **必要に応じた切り替え**  
  バックエンドのみ HTTP で動作させたい場合は、`backend/.env` の `USE_SSL` を `false` に変更し、`
  frontend/.env` の `REACT_APP_USE_SSL_BACKEND` も `false` に設定してください。

## プロジェクト構成

```
project-root/
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── .env                   # REACT_APP_USE_SSL_BACKEND, REACT_APP_API_URL等を定義
│   ├── public/
│   │   └── bgm/               # BGM音声ファイル群
│   └── src/
│       └── App.js             # Reactアプリケーション
├── backend/
│   ├── Dockerfile
│   ├── entrypoint.sh          # HTTP/HTTPS 切り替え用スクリプト
│   ├── .env                   # USE_SSL 等を定義
│   ├── src/
│   │   └── main.py           # FastAPIアプリケーション
│   └── ssl/                  # 自己署名証明書 (cert.pem, key.pem) を配置
└── docker-compose.yml
```

## 利用方法

1. **環境変数の設定**  
  フロントエンド側では、`REACT_APP_USE_SSL_BACKEND` を `true` に設定してください。

2. ブラウザで `https://localhost:3000` にアクセスします。
3. 「音声認識開始」ボタンをクリックして、マイクに話しかけます。
4. 音声認識結果が取得されると、バックエンドで生成処理が始まり、生成が完了するとランダムなBGMが自動再生されます。
5. BGM再生開始から2秒後に生成テキストが読み上げられ、発話が終了するとBGMが自動で停止します。

## 注意事項

- **ブラウザの自動再生ポリシー**  
  Chromeなどのブラウザでは、ユーザー操作なしに音声の自動再生がブロックされる場合があります。  
  本プロジェクトでは、初回はミュート状態でBGMの自動再生を試み、一定時間後にミュート解除することで対策していますが、環境により手動操作が必要な場合もあります。

- **証明書の取り扱い**  
  開発環境では自己署名証明書を使用しますが、本番環境では信頼できる証明書を利用してください。

---

以上でセットアップと利用方法の説明は終了です。  
何か問題があれば、各コンテナのログや環境変数の設定を再確認してください。
