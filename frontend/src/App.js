import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isListening, setIsListening] = useState(false);

  // ブラウザの SpeechRecognition（webkitSpeechRecognition 対応）
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  // 利用可能なBGMのリスト
  const bgmList = [
    '/bgm/bgm_01.m4a',
    '/bgm/bgm_02.m4a',
    '/bgm/bgm_03.m4a',
    '/bgm/bgm_04.m4a',
    '/bgm/bgm_05.m4a'
  ];

  // ランダムなBGMを選択して再生する関数
  const getRandomBgm = () => {
    if (bgmList.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * bgmList.length);
    const audio = new Audio(bgmList[randomIndex]);
    audio.type = 'audio/m4a';
    return audio;
  };

  const startRecognition = () => {
    if (!recognition) {
      alert("お使いのブラウザは音声認識に対応していません。Chromeなど最新のブラウザをご利用ください。");
      return;
    }
    recognition.lang = 'ja-JP';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      // 音声認識完了後、バックエンド API を呼び出す
      callLLMAPI(result);
    };

    recognition.onerror = (event) => {
      console.error("Recognition error:", event.error);
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

  const handleButtonClick = () => {
    if (isListening) {
      stopRecognition();
    } else {
      // 開始前に表示をリセット
      setTranscript('');
      setAiResponse('');
      startRecognition();
    }
  };

  // FastAPI バックエンドへのリクエスト（fetch を利用）
  const callLLMAPI = async (input) => {
    try {
      const response = await fetch('http://localhost:8000/api/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: input })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAiResponse(data.answer);
      speak(data.answer);
    } catch (error) {
      console.error("API呼び出しエラー:", error);
      setAiResponse("エラーが発生しました");
    }
  };

  // テキスト読み上げ（音声合成）
  const speak = (text) => {
    const synth = window.speechSynthesis;
    if (synth) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      
      // BGMの設定（存在する場合のみ）
      const bgm = getRandomBgm();
      if (bgm) {
        bgm.loop = true;
        bgm.volume = 0.3;
        
        // 読み上げ開始時にBGMを再生
        utterance.onstart = () => {
          bgm.play().catch(error => {
            console.error('BGM再生エラー:', error);
          });
        };
        
        // 読み上げ終了時にBGMを停止
        utterance.onend = () => {
          bgm.pause();
          bgm.currentTime = 0;
        };

        // エラー時のハンドリング
        utterance.onerror = () => {
          bgm.pause();
          bgm.currentTime = 0;
        };
      }

      synth.speak(utterance);
    }
  };

  const handleExecuteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    callLLMAPI("こんにちは");
  };

  return (
    <>
      <div className="App">
        <header>
          <h1>バーチャルレンジャー</h1>
        </header>
        <main>
          <p className="question">今日はなにして遊んだの？</p>

          <div className="box">
            <h2>あなたの発言</h2>
            <p>{transcript || '（ここに音声認識結果が表示されます）'}</p>
          </div>

          <div className="box">
            <h2>AIの返答</h2>
            <p>{aiResponse || '（ここにAIの返答が表示されます）'}</p>
          </div>

          <button onClick={handleButtonClick}>
            {isListening ? '停止' : '録音開始'}
          </button>
        </main>
        <footer>
          <p>&copy; 2025 バーチャルレンジャー</p>
        </footer>
      </div>
      <div className="execute-container">
        <button 
          className="execute-button"
          onClick={handleExecuteClick}
        >
          実行
        </button>
      </div>
    </>
  );
}

export default App;
