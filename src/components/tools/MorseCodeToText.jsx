"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaPlay, FaSync, FaDownload, FaCopy } from "react-icons/fa";

const MorseCodeToText = () => {
  const [morseInput, setMorseInput] = useState("");
  const [textOutput, setTextOutput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [morseOutput, setMorseOutput] = useState("");
  const [separator, setSeparator] = useState(" / ");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1.0); // Speed multiplier for audio
  const [caseSensitive, setCaseSensitive] = useState(false);
  const audioContextRef = useRef(null);

  // Expanded Morse code dictionary
  const morseDictionary = {
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

  const reverseMorseDictionary = Object.fromEntries(
    Object.entries(morseDictionary).map(([key, value]) => [value, key])
  );

  // Text to Morse conversion
  const textToMorse = useCallback(
    (text) => {
      setError("");
      const processedText = caseSensitive ? text : text.toUpperCase();
      const morseWords = processedText
        .split(" ")
        .map((word) => {
          const morseChars = word
            .split("")
            .map((char) => morseDictionary[char] || "")
            .filter(Boolean);
          return morseChars.length ? morseChars.join(" ") : "";
        })
        .filter(Boolean);

      if (morseWords.length === 0) {
        setError("Invalid text input: contains no valid characters");
        return "";
      }

      const result = morseWords.join(separator);
      setHistory((prev) => [...prev, { text, morse: result }].slice(-10));
      return result;
    },
    [separator, caseSensitive]
  );

  // Morse to Text conversion
  const morseToText = useCallback(
    (morse) => {
      setError("");
      const cleanedMorse = morse.trim();
      if (!cleanedMorse) {
        setError("Morse code input is empty");
        return "";
      }

      const words = cleanedMorse.split(separator).map((word) => {
        const chars = word
          .split(" ")
          .map((char) => reverseMorseDictionary[char] || "")
          .filter(Boolean);
        return chars.join("");
      });

      if (words.every((word) => word === "")) {
        setError("Invalid Morse code: no valid characters found");
        return "";
      }

      const result = words.join(" ");
      setHistory((prev) => [...prev, { morse, text: result }].slice(-10));
      return result;
    },
    [separator]
  );

  // Input handlers
  const handleMorseInput = (value) => {
    setMorseInput(value);
    const text = morseToText(value);
    setTextOutput(text);
  };

  const handleTextInput = (value) => {
    setTextInput(value);
    const morse = textToMorse(value);
    setMorseOutput(morse);
  };

  // Audio playback
  const playMorseAudio = useCallback(() => {
    if (!audioEnabled || (!morseOutput && !morseInput)) return;

    const morseToPlay = morseOutput || morseInput;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioContext;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 600; // Frequency in Hz
    oscillator.type = "sine";

    let time = audioContext.currentTime;
    const baseDotDuration = 0.1 / audioSpeed; // Adjusted by speed
    const dotDuration = baseDotDuration;
    const dashDuration = dotDuration * 3;
    const spaceDuration = dotDuration;

    morseToPlay.split("").forEach((char) => {
      if (char === ".") {
        oscillator.start(time);
        oscillator.stop(time + dotDuration);
        time += dotDuration + spaceDuration;
      } else if (char === "-") {
        oscillator.start(time);
        oscillator.stop(time + dashDuration);
        time += dashDuration + spaceDuration;
      } else if (char === " " || char === separator) {
        time += dashDuration; // Space between words or characters
      }
    });

    oscillator.onended = () => audioContext.close();
    oscillator.start();
  }, [morseOutput, morseInput, audioEnabled, audioSpeed, separator]);

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Download as text file
  const downloadResult = () => {
    const content = `Morse: ${morseInput || morseOutput}\nText: ${textOutput || textInput}`;
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
    setMorseInput("");
    setTextOutput("");
    setTextInput("");
    setMorseOutput("");
    setSeparator(" / ");
    setError("");
    setHistory([]);
    setAudioEnabled(false);
    setAudioSpeed(1.0);
    setCaseSensitive(false);
    if (audioContextRef.current) audioContextRef.current.close();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Morse Code Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Morse Code
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={morseInput}
                  onChange={(e) => handleMorseInput(e.target.value)}
                  placeholder="e.g., ... --- ... / ... --- ..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={playMorseAudio}
                  disabled={!audioEnabled || (!morseInput && !morseOutput)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <FaPlay className="mr-2" /> Play
                </button>
                <button
                  onClick={() => copyToClipboard(morseInput || morseOutput)}
                  disabled={!morseInput && !morseOutput}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <FaCopy className="mr-2" /> Copy
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {textOutput || "Enter Morse code to see text"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => handleTextInput(e.target.value)}
                  placeholder="e.g., SOS"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => copyToClipboard(textInput || textOutput)}
                  disabled={!textInput && !textOutput}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <FaCopy className="mr-2" /> Copy
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {morseOutput || "Enter text to see Morse code"}
              </p>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Word Separator
                </label>
                <input
                  type="text"
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  placeholder="e.g., /"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Audio Speed ({audioSpeed.toFixed(1)}x)
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={audioSpeed}
                  onChange={(e) => setAudioSpeed(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={audioEnabled}
                  onChange={(e) => setAudioEnabled(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Enable Audio Playback</span>
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
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={downloadResult}
              disabled={!morseInput && !morseOutput && !textInput && !textOutput}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* History Section */}
          {history.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">
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
              <li>Audio playback with adjustable speed (0.5x - 2x)</li>
              <li>Customizable word separator</li>
              <li>Copy to clipboard and download as text file</li>
              <li>Case sensitivity option</li>
              <li>History of last 10 conversions</li>
              <li>Supports extended character set (letters, numbers, punctuation)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MorseCodeToText;