# バーチャルレンジャー

このプロジェクトは、React（フロントエンド）と FastAPI（バックエンド）を利用して、音声認識による生成処理、ランダムなBGM再生、そして自動的なセリフ発声を実現するアプリケーションです。

## 特徴

- **音声認識から生成へ**  
  ユーザーが音声認識を開始すると、その認識結果をもとにバックエンドAPIでテキスト生成が行われます。

- **BGM再生とセリフ発声**  
  生成完了後、ランダムに選ばれたBGMが自動再生され、2秒後に生成テキストが読み上げられます。  
  発話が完了すると、BGMは停止します。

## 動作環境

- Docker / Docker Compose
- Node.js（開発用：フロントエンド）
- Python 3.x（バックエンド）

## 起動方法

1. プロジェクトルートディレクトリで以下のコマンドを実行して、Dockerコンテナをビルド・起動します。

   ```bash
   docker-compose up --build
   ```

2. 起動後、次のURLでアクセスしてください:
   - **フロントエンド:** `http://localhost:3000` または、HTTPS利用の場合は `https://localhost:3000`
   - **バックエンド:**  
     - HTTPSモードの場合: デフォルト設定で `https://localhost:8000`  
     - HTTPモードの場合: `http://localhost:8000`

## HTTPS と HTTP の切り替え

- **HTTPSモード（デフォルト）**  
  バックエンドは以下のコマンドで起動しています。  
  ```bash
  uvicorn src.main:app --host 0.0.0.0 --port 8000 --ssl-keyfile /app/ssl/key.pem --ssl-certfile /app/ssl/cert.pem
  ```
  HTTPSで動作させるには、`backend/ssl`ディレクトリに自己署名証明書（`cert.pem`）と秘密鍵（`key.pem`）を配置してください。  
  Macの場合は、Keychain Accessで証明書を信頼済みに登録すると、ブラウザの警告を回避できます。

- **HTTPモードに切り替える場合**  
  HTTPSが不要な場合は、`docker-compose.yml`のバックエンドサービスの`command`部分から`--ssl-keyfile`と`--ssl-certfile`のオプションを削除してください。  
  また、フロントエンド側は環境変数 `REACT_APP_API_URL` を設定することで、バックエンドのURLを明示的に指定できます。  
  例えば、HTTPモードでは `frontend/.env` に以下を記述してください。

  ```dotenv
  REACT_APP_API_URL=http://localhost:8000
  ```

## プロジェクト構成

```
project-root/
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── public/
│   │   └── bgm/         # BGM音声ファイル群
│ └── src/
│ └── App.js # Reactアプリケーション
├── backend/
│ ├── Dockerfile
│ ├── src/
│ │ └── main.py # FastAPIアプリケーション
│ └── ssl/ # 自己署名証明書を配置 (cert.pem, key.pem)
└── docker-compose.yml
```

## 利用方法

1. ブラウザで `http://localhost:3000`（または、HTTPSモードの場合は `https://localhost:3000`）にアクセスします。
2. 「音声認識開始」ボタンをクリックして、マイクに話しかけます。
3. 音声認識結果が取得されると、バックエンドで生成処理が始まり、生成が完了するとランダムなBGMが自動再生されます。
4. BGM再生開始から2秒後に生成テキストが読み上げられ、発話が終了するとBGMが自動で停止します。

## 注意事項

- **ブラウザの自動再生ポリシー**  
  Chromeなどのブラウザでは、ユーザー操作なしに音声の自動再生がブロックされる場合があります。  
  本プロジェクトでは、初回はミュート状態でBGMの自動再生を試み、一定時間後にミュート解除することで対策していますが、環境により手動操作が必要な場合もあります。

- **証明書の取り扱い**  
  開発環境では自己署名証明書を使用しますが、本番環境では信頼できる証明書を利用してください。

---

以上でセットアップと利用方法の説明は終了です。  
何か問題があれば、各コンテナのログや環境変数の設定を再確認してください。
