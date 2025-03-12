"use client";

import React, { useState, useCallback, useRef } from "react";
import { FaCopy, FaDownload, FaPlay, FaSync } from "react-icons/fa";

const MorseCodeTranslator = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [mode, setMode] = useState("textToMorse");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [options, setOptions] = useState({
    showReference: true,
    strictValidation: false,
    playSpeed: 1, // 0.5x to 2x
  });
  const audioRef = useRef(null);

  const morseCode = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
    '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
    '8': '---..', '9': '----.', ' ': '/', '.': '.-.-.-', ',': '--..--',
    '?': '..--..', '!': '-.-.--', "'": '.----.', '"': '.-..-.', '&': '.-...',
    '@': '.--.-.', '+': '.-.-.', '-': '-....-', '=': '-...-', '/': '-..-.',
  };

  const reverseMorseCode = Object.fromEntries(
    Object.entries(morseCode).map(([key, value]) => [value, key])
  );

  const textToMorse = useCallback((text) => {
    const upperText = text.toUpperCase();
    if (options.strictValidation && !/^[A-Z0-9\s.,?!'"&@+-=/]*$/.test(upperText)) {
      throw new Error("Invalid characters for strict mode");
    }
    return upperText
      .split("")
      .map(char => morseCode[char] || (options.strictValidation ? "" : "?"))
      .join(" ")
      .trim();
  }, [options.strictValidation]);

  const morseToText = useCallback((morse) => {
    const cleanedMorse = morse.trim().replace(/\s+/g, " ").replace(/\s*\/\s*/g, " / ");
    const words = cleanedMorse.split(" / ");
    if (options.strictValidation && !/^[.-]+\s*(?:\s*[.-]+\s*)*\/?\s*(?:\s*[.-]+\s*)*$/.test(cleanedMorse)) {
      throw new Error("Invalid Morse code format");
    }
    return words
      .map(word => 
        word.split(" ")
          .map(code => reverseMorseCode[code] || (options.strictValidation ? "" : "?"))
          .join("")
      )
      .join(" ")
      .trim();
  }, [options.strictValidation]);

  const processText = () => {
    setError(null);
    setOutputText("");
    setCopied(false);

    if (!inputText.trim()) {
      setError("Please enter some text or Morse code");
      return;
    }

    try {
      const result = mode === "textToMorse" ? textToMorse(inputText) : morseToText(inputText);
      if (!result) throw new Error("Invalid input for selected mode");
      setOutputText(result);
    } catch (err) {
      setError("Error: " + err.message);
    }
  };

  const playMorseAudio = () => {
    if (!outputText || mode !== "textToMorse") return;
    setAudioPlaying(true);
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const dotDuration = 100 / options.playSpeed; // milliseconds
    let time = audioContext.currentTime;

    outputText.split(" ").forEach(symbol => {
      const oscillator = audioContext.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = 600;
      oscillator.connect(audioContext.destination);

      if (symbol === ".") {
        oscillator.start(time);
        oscillator.stop(time + dotDuration / 1000);
        time += dotDuration / 1000 + dotDuration / 1000; // Dot + gap
      } else if (symbol === "-") {
        oscillator.start(time);
        oscillator.stop(time + (dotDuration * 3) / 1000);
        time += (dotDuration * 3) / 1000 + dotDuration / 1000; // Dash + gap
      } else if (symbol === "/") {
        time += (dotDuration * 7) / 1000; // Word gap
      }
    });

    setTimeout(() => {
      audioContext.close();
      setAudioPlaying(false);
    }, (time - audioContext.currentTime) * 1000 + 500);
  };

  const handleDownload = () => {
    const blob = new Blob([outputText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `morse-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setInputText("");
    setOutputText("");
    setError(null);
    setCopied(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Morse Code Translator</h2>

        {/* Input Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {mode === "textToMorse" ? "Enter Text" : "Enter Morse Code"}
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full h-32 sm:h-40 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={mode === "textToMorse" ? "HELLO WORLD" : ".... . .-.. .-.. --- / .-- --- .-. .-.. -.."}
            aria-label="Input Text"
          />
        </div>

        {/* Options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="textToMorse">Text to Morse</option>
                <option value="morseToText">Morse to Text</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Play Speed</label>
              <select
                value={options.playSpeed}
                onChange={(e) => setOptions(prev => ({ ...prev, playSpeed: parseFloat(e.target.value) }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.showReference}
                onChange={(e) => setOptions(prev => ({ ...prev, showReference: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Show Reference</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.strictValidation}
                onChange={(e) => setOptions(prev => ({ ...prev, strictValidation: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Strict Validation</span>
            </label>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={processText}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Translate
          </button>
          <button
            onClick={playMorseAudio}
            disabled={!outputText || mode !== "textToMorse" || audioPlaying}
            className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
          >
            <FaPlay className="mr-2" /> {audioPlaying ? "Playing..." : "Play Morse"}
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Output */}
        {outputText && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-700">
                {mode === "textToMorse" ? "Morse Code Output" : "Text Output"}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className={`py-1 px-3 rounded-lg transition-colors ${copied ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                >
                  <FaCopy className="inline mr-1" /> {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="py-1 px-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FaDownload className="inline mr-1" /> Download
                </button>
              </div>
            </div>
            <pre className="p-4 bg-gray-50 rounded-lg font-mono text-sm text-gray-800 whitespace-pre-wrap break-all border border-gray-200">
              {outputText}
            </pre>
          </div>
        )}

        {/* Reference Table */}
        {options.showReference && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Morse Code Reference</h3>
            <div className="overflow-x-auto h-72 overflow-auto">
              <table className="w-full text-sm text-left text-gray-600 border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3">Character</th>
                    <th className="p-3">Morse Code</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(morseCode).map(([char, code], index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono">{char}</td>
                      <td className="p-3 font-mono">{code}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Use space between letters and '/' between words. Strict mode enforces valid characters only.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MorseCodeTranslator;