from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import src.call_openai as call_openai
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# グローバル変数としてクライアントを定義
openai_client = None

# キャラクター設定のプロンプトをグローバル変数として定義
CHARACTER_PROMPT = """
あなたはブンブンジャーのキャラクターになりきるbotです。以下の特徴的なセリフや態度を参考に、ブンブンジャーらしく振る舞ってください。

## ブンブンジャーの特徴的セリフ集

**共通の決め台詞**
- 「気分ブンブン、ブン回せ!爆上戦隊!」
- 「ブンブンジャー!!!」
- 「爆上げだぜ！」
- 「バット ブンブン ブン回せ！」

**キャラクター別の名セリフ**
- 大也のセリフ  
  *「惚れた」  
  *「私は私自身を、私の思うところに届ける」
  
- 錠のセリフ  
  *「街の人もブンブンジャーも… 俺が守る！」  
  *「フッ・・・最高のバクアゲだな！」

- 射士郎のセリフ  
  *「ずるいんだよ。お前の「惚れた」は・・・」  
  *「余裕がないと聞こえるものも聞こえない。今の俺には聞こえるんだ。」

**チームとしての信念**
- 「自分のハンドルは自分で握る」
- 「何があってもみんなを守り 勝利をつかむのがブンブンジャーだ！」
- 「そうだ、ブンブン！ 俺達に、行けない場所なんてない」

**バトル中の名言**
- 「初めての空をみんなと飛ぶ。最っ高の爆上げじゃないか」
- 「今 すっごく面白いよ！」
- 「俺たちの夢を・・・笑うな！」

これらのセリフや特徴を活かし、熱血で仲間思いなブンブンジャーのキャラクターとして応答してください。状況に応じて適切なセリフを選び、ブンブンジャーらしい熱意と勇気を持って会話を展開してください。

**注意**
- 短いフレーズで回答してください
- ブンブンジャーのキャラクターとして応答してください
- 6歳前後の子どもに向けて発話してください
- 上記の設定で以下の質問に答えてください：
{user_input}"""

@asynccontextmanager
async def lifespan(app: FastAPI):
    # アプリケーション起動時の処理
    global openai_client

    load_dotenv()
    openai_client = OpenAI(
        api_key = os.getenv("OPENAI_API_KEY")
    )
    yield
    # アプリケーション終了時の処理
    openai_client = None

app = FastAPI(lifespan=lifespan)

# CORSの設定 reactのポート番号を設定
origins = [
    "http://localhost:3000",      # React開発サーバー
    "http://localhost:5000",      # 本番ビルド用（必要に応じて）
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # 許可するオリジンのリスト
    allow_credentials=True,       # Cookie等の認証情報を許可
    allow_methods=["GET", "POST", "PUT", "DELETE"],  # 許可するHTTPメソッド
    allow_headers=["*"],         # 許可するHTTPヘッダー
)

# リクエストボディのモデル（必要に応じて項目を追加）
class LLMRequest(BaseModel):
    prompt: str

# レスポンスのモデル
class LLMResponse(BaseModel):
    answer: str

@app.post("/api/llm", response_model=LLMResponse)
async def get_llm_response(request: LLMRequest):
    if not request.prompt:
        raise HTTPException(status_code=400, detail="プロンプトが空です")
    
    try:
        formatted_prompt = CHARACTER_PROMPT.format(user_input=request.prompt)
        response = call_openai.call_openai_api(
            openai_client, 
            formatted_prompt, 
            model="gpt-4o-mini")
        return LLMResponse(answer=response)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM APIエラー: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
