"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FaPlay,
  FaPause,
  FaStop,
  FaTrash,
  FaSave,
  FaCopy,
  FaDownload,
  FaHistory,
  FaVolumeUp,
} from "react-icons/fa";

const TextToSpeech = () => {
  const [text, setText] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [currentWord, setCurrentWord] = useState("");
  const [history, setHistory] = useState([]);
  const speechRef = useRef(null);

  useEffect(() => {
    const fetchVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    fetchVoices();
    window.speechSynthesis.onvoiceschanged = fetchVoices;

    if (typeof window !== "undefined") {
      const savedText = localStorage.getItem("savedText") || "";
      setText(savedText);
    }
  }, []);

  const speakText = useCallback(() => {
    if (text.trim() === "") return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = speechRate;
    speech.volume = volume;
    speech.pitch = pitch;
    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) speech.voice = voice;

    speech.onboundary = (event) => {
      const words = text.split(/\s+/);
      const charIndex = event.charIndex;
      let currentIndex = 0;
      for (let i = 0; i < words.length; i++) {
        currentIndex += words[i].length + 1;
        if (charIndex < currentIndex) {
          setCurrentWord(words[i]);
          break;
        }
      }
    };

    speech.onend = () => {
      setCurrentWord("");
      setIsPaused(false);
    };

    window.speechSynthesis.speak(speech);
    speechRef.current = speech;
    setIsPaused(false);
    setHistory(prev => [...prev, { text, voice: selectedVoice, rate: speechRate, pitch, volume }].slice(-5));
  }, [text, speechRate, volume, pitch, selectedVoice, voices, isPaused]);

  const pauseSpeech = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsPaused(false);
    setCurrentWord("");
  };

  const clearText = () => {
    setText("");
    setCurrentWord("");
    setIsPaused(false);
    localStorage.removeItem("savedText");
  };

  const saveText = () => {
    localStorage.setItem("savedText", text);
    alert("Text saved!");
  };

  const copyText = () => {
    navigator.clipboard.writeText(text);
    alert("Text copied to clipboard!");
  };

  const exportSpeech = () => {
    const content = `Text: ${text}\nVoice: ${selectedVoice}\nRate: ${speechRate}\nPitch: ${pitch}\nVolume: ${volume}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `speech_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const getHighlightedText = () => {
    if (!currentWord || !text.trim()) return text;
    const regex = new RegExp(`\\b(${currentWord})\\b`, "gi");
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === currentWord.toLowerCase() ? (
        <span key={index} className="bg-green-200 text-black px-1 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white shadow-lg rounded-2xl p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center text-gray-900">
          Advanced Text-to-Speech
        </h1>

        {/* Textarea */}
        <textarea
          className="w-full h-32 sm:h-40 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
          placeholder="Type or paste text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>

        {/* Controls */}
        <div className="my-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Speech Rate: {speechRate.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Volume: {volume.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Pitch: {pitch.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Voice:</label>
            <select
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
            >
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 text-xs sm:text-sm text-gray-600">
          <p>
            Speaking: <span className="font-bold text-green-600">{currentWord || "None"}</span>
          </p>
          <p>{text.length} characters</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs sm:text-sm flex-1 min-w-[100px]"
            onClick={speakText}
          >
            <FaPlay /> {isPaused ? "Resume" : "Speak"}
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-xs sm:text-sm flex-1 min-w-[100px]"
            onClick={pauseSpeech}
            disabled={!window.speechSynthesis.speaking}
          >
            <FaPause /> Pause
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-xs sm:text-sm flex-1 min-w-[100px]"
            onClick={stopSpeech}
          >
            <FaStop /> Stop
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-xs sm:text-sm flex-1 min-w-[100px]"
            onClick={clearText}
          >
            <FaTrash /> Clear
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs sm:text-sm flex-1 min-w-[100px]"
            onClick={saveText}
            disabled={!text}
          >
            <FaSave /> Save
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-xs sm:text-sm flex-1 min-w-[100px]"
            onClick={copyText}
            disabled={!text}
          >
            <FaCopy /> Copy
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-xs sm:text-sm flex-1 min-w-[100px]"
            onClick={exportSpeech}
            disabled={!text}
          >
            <FaDownload /> Export
          </button>
        </div>

        {/* Highlighted Text */}
        <div className="mt-4 p-3 bg-gray-50 border rounded-lg break-words max-h-64 overflow-auto text-sm sm:text-base">
          {getHighlightedText()}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center text-sm sm:text-base">
              <FaHistory className="mr-2" /> Recent Speech (Last 5)
            </h3>
            <ul className="mt-2 text-xs sm:text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    "{entry.text.slice(0, 20)}{entry.text.length > 20 ? "..." : ""}" ({entry.voice}, Rate: {entry.rate})
                  </span>
                  <button
                    onClick={() => {
                      setText(entry.text);
                      setSelectedVoice(entry.voice);
                      setSpeechRate(entry.rate);
                      setPitch(entry.pitch);
                      setVolume(entry.volume);
                    }}
                    className="text-green-500 hover:text-green-700"
                  >
                    <FaVolumeUp />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-green-100 rounded-lg border border-green-300">
          <h3 className="font-semibold text-green-700 text-sm sm:text-base">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-xs sm:text-sm">
            <li>Adjustable rate, volume, and pitch</li>
            <li>Voice selection with language info</li>
            <li>Real-time word highlighting</li>
            <li>Save, copy, and export text</li>
            <li>History of last 5 speech instances</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeech;