"use client";

import { useState, useEffect, useRef } from "react";
import { FaPlay, FaPause, FaStop, FaTrash, FaSave } from "react-icons/fa";

const TextToSpeech = () => {
  const [text, setText] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [currentWord, setCurrentWord] = useState("");

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

  const speakText = () => {
    if (text.trim() === "") return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsSpeaking(true);
      setIsPaused(false);
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = speechRate;
    speech.volume = volume;
    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) speech.voice = voice;

    speech.onboundary = (event) => {
      const words = text.split(" ");
      const currentWordIndex = event.charIndex / (text.length / words.length);
      setCurrentWord(words[Math.floor(currentWordIndex)]);
    };

    speech.onend = () => {
      setCurrentWord("");
      setIsPaused(false);
    };

    window.speechSynthesis.speak(speech);
    speechRef.current = speech;
    setIsPaused(false);
  };

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
    localStorage.clear("savedText");
  };

  const saveText = () => {
    localStorage.setItem("savedText", text);
    alert("Text saved!");
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-2xl">
      <textarea
        className="w-full h-40 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Type or paste text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>

      <div className="my-3 space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Speech Rate: {speechRate}
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
        <label className="block text-sm font-medium text-gray-700">
          Volume: {volume}
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

      <div className="my-3">
        <label className="block text-sm font-medium text-gray-700">Voice</label>
        <select
          className="w-full p-2 border rounded-lg"
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
        >
          {voices.map((voice) => (
            <option key={voice.name} value={voice.name}>
              {voice.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-between">
        <p className="text-md font-semibold text-secondary">
          Speaking:{" "}
          <span className="font-bold text-primary">{currentWord}</span>
        </p>
        <p className="text-right text-sm text-secondary">
          {text.length} characters
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-4">
        <button
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text shadow-md border border-gray-300 rounded-xl hover:border-primary hover:shadow-lg"
          onClick={speakText}
        >
          <FaPlay className="text-primary" /> {isPaused ? "Resume" : "Speak"}
        </button>

        <button
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text shadow-md border border-gray-300 rounded-xl hover:border-primary hover:shadow-lg"
          onClick={pauseSpeech}
        >
          <FaPause className="text-primary" /> Pause
        </button>

        <button
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text shadow-md border border-gray-300 rounded-xl hover:border-primary hover:shadow-lg"
          onClick={stopSpeech}
        >
          <FaStop className="text-primary" /> Stop
        </button>

        <button
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text shadow-md border border-gray-300 rounded-xl hover:border-primary hover:shadow-lg"
          onClick={clearText}
        >
          <FaTrash className="text-primary" /> Clear
        </button>

        <button
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text shadow-md border border-gray-300 rounded-xl hover:border-primary hover:shadow-lg"
          onClick={saveText}
        >
          <FaSave className="text-primary" /> Save
        </button>
      </div>
    </div>
  );
};

export default TextToSpeech;
