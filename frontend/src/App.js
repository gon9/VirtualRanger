import React, { useState } from 'react';
import './App.css';

function App() {
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isListening, setIsListening] = useState(false);

  // BGM用のファイルリスト（ランダムに選択）
  const bgmList = [
    '/bgm/bgm_01.mp3',
    '/bgm/bgm_02.mp3',
    // '/bgm/bgm_03.mp3',
    // '/bgm/bgm_04.mp3',
    // '/bgm/bgm_05.mp3'
  ];

  // ランダムなBGMを返す関数
  const getRandomBgm = () => {
    if (bgmList.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * bgmList.length);
    return new Audio(bgmList[randomIndex]);
  };

  // 音声認識の初期化
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  const startRecognition = () => {
    if (!recognition) {
      alert("お使いのブラウザは音声認識に対応していません。");
      return;
    }
    recognition.lang = 'ja-JP';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      // 音声認識に反応して生成開始
      callGenerateAPI(result);
    };

    recognition.onerror = (err) => {
      console.error("音声認識エラー:", err);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    setIsListening(true);
  };

  const stopRecognition = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  // フロントエンドからバックエンドへのアクセスURLを生成
  const useSslBackend = process.env.REACT_APP_USE_SSL_BACKEND === 'true';
  const backendProtocol = useSslBackend ? 'https:' : 'http:';
  const hostname = window.location.hostname;
  const backendUrl = process.env.REACT_APP_API_URL || `${backendProtocol}//${hostname}:8000`;

  // 生成処理：音声認識の結果を受けてバックエンドAPIに送信
  const callGenerateAPI = async (prompt) => {
    try {
      const res = await fetch(`${backendUrl}/api/llm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      setAiResponse(data.answer);
      // 生成完了：BGM再生 → 2秒後にセリフ発声
      playBGMAndSpeech(data.answer);
    } catch (error) {
      console.error("API呼び出しエラー:", error);
      alert("エラーが発生しました");
    }
  };

  const playBGMAndSpeech = (text) => {
    const bgm = getRandomBgm();
    if (bgm) {
      bgm.volume = 0.3;
      bgm.loop = true;
      // 初回はミュート状態で自動再生（Chromeの自動再生制限対応）
      bgm.muted = true;
      const playPromise = bgm.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // 再生開始後、2秒後にミュート解除しセリフ発声開始
            setTimeout(() => {
              bgm.muted = false;
              // 発話終了時に BGM を停止する
              speak(text, () => {
                bgm.pause();
                bgm.currentTime = 0;
              });
            }, 2000);
          })
          .catch((err) => console.error("BGM再生エラー:", err));
      }
    }
  };

  // 発話処理。第二引数に発話完了時のコールバックを指定可能
  const speak = (text, onEndCallback = () => {}) => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel(); // 既存の発話をキャンセル
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.onend = onEndCallback;
    synth.speak(utterance);
  };

  return (
    <div className="App">
      <h1>バーチャルレンジャー</h1>
      <p>あなたの発言: {transcript || '（ここに音声認識結果が表示されます）'}</p>
      <p>AIの返答: {aiResponse || '（ここにAIの返答が表示されます）'}</p>
      <button onClick={() => { isListening ? stopRecognition() : startRecognition(); }}>
        {isListening ? '停止' : '音声認識開始'}
      </button>
    </div>
  );
}

export default App;
