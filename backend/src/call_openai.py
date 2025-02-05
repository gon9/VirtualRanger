import os
from openai import OpenAI # type: ignore

# OpenAI APIキー
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")


def call_openai_api(client: OpenAI, prompt: str, model="gpt-4o-mini"):
    """ OpenAI APIを呼び出して、生成結果を返す """
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "system", "content": "You are a helpful assistant."},
                     {"role": "user", "content": prompt}],
            temperature=0.7
        )
        text = response.choices[0].message.content
        return text
    except Exception as e:
        print(f"Error while calling OpenAI API: {e}")
        return "生成に失敗しました。"