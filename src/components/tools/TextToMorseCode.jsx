"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaPlay, FaStop, FaDownload, FaCopy, FaSync } from "react-icons/fa";

const TextToMorseCode = () => {
  const [text, setText] = useState("");
  const [morseCode, setMorseCode] = useState("");
  const [error, setError] = useState("");
  const [speed, setSpeed] = useState(20); // Words per minute (WPM)
  const [frequency, setFrequency] = useState(600); // Hz
  const [isPlaying, setIsPlaying] = useState(false);
  const [history, setHistory] = useState([]);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const audioContextRef = useRef(null);

  // Expanded Morse code dictionary
  const morseDict = {
    A: ".-",
    B: "-...",
    C: "-.-.",
    D: "-..",
    E: ".",
    F: "..-.",
    G: "--.",
    H: "....",
    I: "..",
    J: ".---",
    K: "-.-",
    L: ".-..",
    M: "--",
    N: "-.",
    O: "---",
    P: ".--.",
    Q: "--.-",
    R: ".-.",
    S: "...",
    T: "-",
    U: "..-",
    V: "...-",
    W: ".--",
    X: "-..-",
    Y: "-.--",
    Z: "--..",
    "0": "-----",
    "1": ".----",
    "2": "..---",
    "3": "...--",
    "4": "....-",
    "5": ".....",
    "6": "-....",
    "7": "--...",
    "8": "---..",
    "9": "----.",
    " ": "/",
    ".": ".-.-.-",
    ",": "--..--",
    "?": "..--..",
    "!": "-.-.--",
    "&": ".-...",
    "'": ".----.",
    "@": ".--.-.",
    "(": "-.--.",
    ")": "-.--.-",
    ":": "---...",
    "=": "-...-",
    "+": ".-.-.",
    "-": "-....-",
    '"': ".-..-.",
    "/": "-..-.",
    $: "...-..-",
  };

  const reverseMorseDict = Object.fromEntries(
    Object.entries(morseDict).map(([key, value]) => [value, key])
  );

  // Conversion functions
  const convertToMorse = useCallback(
    (input) => {
      setError("");
      const processedText = caseSensitive ? input : input.toUpperCase();
      let result = "";
      for (const char of processedText) {
        if (morseDict[char]) {
          result += morseDict[char] + " ";
        } else if (char !== " ") {
          setError(`Unsupported character: ${char}`);
          return "";
        }
      }
      const morseResult = result.trim();
      setHistory((prev) => [...prev, { text: input, morse: morseResult }].slice(-10));
      return morseResult;
    },
    [caseSensitive]
  );

  const convertToText = useCallback((morse) => {
    setError("");
    const morseWords = morse.trim().split(" / ");
    let result = "";
    for (const word of morseWords) {
      const morseChars = word.split(" ");
      for (const char of morseChars) {
        if (reverseMorseDict[char]) {
          result += reverseMorseDict[char];
        } else if (char !== "") {
          setError(`Invalid Morse code sequence: ${char}`);
          return "";
        }
      }
      result += " ";
    }
    const textResult = result.trim();
    setHistory((prev) => [...prev, { morse, text: textResult }].slice(-10));
    return textResult;
  }, []);

  // Input handlers
  const handleTextChange = (value) => {
    setText(value);
    const morse = convertToMorse(value);
    setMorseCode(morse);
  };

  const handleMorseChange = (value) => {
    setMorseCode(value);
    const text = convertToText(value);
    setText(text);
  };

  // Audio playback
  const playMorseCode = useCallback(() => {
    if (!morseCode || isPlaying) return;

    setIsPlaying(true);
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioContext;

    const unitTime = 1200 / speed; // Unit time in ms based on WPM (PARIS standard)
    let currentTime = audioContext.currentTime;

    const playSignal = (duration) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = frequency;
      gainNode.gain.value = 0.5;
      oscillator.start(currentTime);
      oscillator.stop(currentTime + duration / 1000);
      currentTime += duration / 1000;
      currentTime += unitTime / 1000; // Gap between signals
    };

    morseCode.split("").forEach((char) => {
      if (char === ".") {
        playSignal(unitTime); // Dot
      } else if (char === "-") {
        playSignal(unitTime * 3); // Dash
      } else if (char === " ") {
        currentTime += (unitTime * 2) / 1000; // Space between letters
      } else if (char === "/") {
        currentTime += (unitTime * 6) / 1000; // Space between words
      }
    });

    setTimeout(() => {
      audioContext.close();
      setIsPlaying(false);
    }, (currentTime - audioContext.currentTime) * 1000 + 100);
  }, [morseCode, speed, frequency, isPlaying]);

  const stopMorseCode = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      setIsPlaying(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
  };

  // Download as text file
  const downloadResult = () => {
    const content = `Text: ${text}\nMorse: ${morseCode}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `morse-conversion-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Reset all
  const reset = () => {
    setText("");
    setMorseCode("");
    setError("");
    setSpeed(20);
    setFrequency(600);
    setIsPlaying(false);
    setHistory([]);
    setCaseSensitive(false);
    if (audioContextRef.current) audioContextRef.current.close();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Text to Morse Code Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <textarea
                  value={text}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder="Enter text (e.g., HELLO WORLD)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                />
                <button
                  onClick={() => copyToClipboard(text)}
                  disabled={!text}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <FaCopy className="mr-2" /> Copy
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Morse Code
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <textarea
                  value={morseCode}
                  onChange={(e) => handleMorseChange(e.target.value)}
                  placeholder="Enter Morse code (e.g., .... . .-.. .-.. --- / .-- --- .-. .-.. -..)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 font-mono"
                />
                <button
                  onClick={() => copyToClipboard(morseCode)}
                  disabled={!morseCode}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <FaCopy className="mr-2" /> Copy
                </button>
              </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Speed ({speed} WPM)
                </label>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency ({frequency} Hz)
                </label>
                <input
                  type="range"
                  min="200"
                  max="1000"
                  step="50"
                  value={frequency}
                  onChange={(e) => setFrequency(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Case Sensitive</span>
              </div>
            </div>

            {/* Audio Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={playMorseCode}
                disabled={isPlaying || !morseCode}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaPlay className="mr-2" /> Play
              </button>
              <button
                onClick={stopMorseCode}
                disabled={!isPlaying}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaStop className="mr-2" /> Stop
              </button>
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
              <button
                onClick={downloadResult}
                disabled={!text && !morseCode}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Visualization Section */}
          {morseCode && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Visualization</h2>
              <div className="flex flex-wrap gap-1 font-mono text-sm">
                {morseCode.split("").map((char, index) => (
                  <span
                    key={index}
                    className={
                      char === "."
                        ? "w-2 h-2 bg-blue-500 rounded-full"
                        : char === "-"
                        ? "w-6 h-2 bg-blue-500 rounded"
                        : char === " "
                        ? "w-2 h-2"
                        : char === "/"
                        ? "w-4 h-2"
                        : ""
                    }
                  ></span>
                ))}
              </div>
            </div>
          )}

          {/* History Section */}
          {history.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Conversion History (Last 10)
              </h2>
              <div className="space-y-2 text-sm max-h-40 overflow-y-auto">
                {history
                  .slice()
                  .reverse()
                  .map((entry, index) => (
                    <div key={index} className="p-2 bg-gray-100 rounded">
                      <p>
                        <strong>Text:</strong> {entry.text}
                      </p>
                      <p>
                        <strong>Morse:</strong> {entry.morse}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Features Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Bidirectional conversion: Text ↔ Morse</li>
              <li>Audio playback with adjustable speed (5-40 WPM) and frequency (200-1000 Hz)</li>
              <li>Copy to clipboard and download as text file</li>
              <li>Case sensitivity option</li>
              <li>Visual representation of Morse code</li>
              <li>History of last 10 conversions</li>
              <li>Supports extended character set (letters, numbers, punctuation)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextToMorseCode;