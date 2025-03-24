"use client";
import React, { useState, useCallback } from "react";
import { FaPlay, FaStop, FaDownload, FaSync, FaCopy } from "react-icons/fa";

const MorseCodeToBinary = () => {
  const [morseInput, setMorseInput] = useState("");
  const [binaryOutput, setBinaryOutput] = useState("");
  const [textOutput, setTextOutput] = useState("");
  const [error, setError] = useState("");
  const [bitLength, setBitLength] = useState(8);
  const [playMorse, setPlayMorse] = useState(false);
  const [frequency, setFrequency] = useState(600); // Audio frequency in Hz
  const [dotDuration, setDotDuration] = useState(100); // Dot duration in ms
  const audioContextRef = React.useRef(null);

  // Morse code dictionary
  const MORSE_TO_CHAR = {
    ".-": "A", "-...": "B", "-.-.": "C", "-..": "D", ".": "E",
    "..-.": "F", "--.": "G", "....": "H", "..": "I", ".---": "J",
    "-.-": "K", ".-..": "L", "--": "M", "-.": "N", "---": "O",
    ".--.": "P", "--.-": "Q", ".-.": "R", "...": "S", "-": "T",
    "..-": "U", "...-": "V", ".--": "W", "-..-": "X", "-.--": "Y",
    "--..": "Z", "-----": "0", ".----": "1", "..---": "2", "...--": "3",
    "....-": "4", ".....": "5", "-....": "6", "--...": "7", "---..": "8",
    "----.": "9", ".-.-.-": ".", "--..--": ",", "..--..": "?", "-.-.--": "!",
    "-....-": "-", ".-..-.": '"', ".----..": "[", ".----.-": "]",
    "-..-.": "/", "...-..-": "$", ".--.-.": "@", "-...-": "="
  };

  const CHAR_TO_MORSE = Object.fromEntries(
    Object.entries(MORSE_TO_CHAR).map(([k, v]) => [v, k])
  );

  // Conversion logic
  const morseToBinary = (morse) => {
    const morseWords = morse.trim().split(/\s{2,}/);
    const binaryWords = morseWords.map((word) => {
      const morseChars = word.split(" ");
      const binaryChars = morseChars.map((char) => {
        if (!MORSE_TO_CHAR[char]) return null;
        return char.split("").map((symbol) => (symbol === "." ? "1" : "11")).join("00");
      }).filter(Boolean);
      return binaryChars.join("00");
    });
    return binaryWords.join("0000");
  };

  const binaryToMorse = (binary) => {
    const binaryWords = binary.split("0000");
    const morseWords = binaryWords.map((word) => {
      const binaryChars = word.split(/(?<=^(?:1|11)(?:00(?:1|11))*)00/);
      const morseChars = binaryChars.filter(Boolean).map((char) => {
        const symbols = char.match(/(1|11)/g);
        if (!symbols) return null;
        return symbols.map((bit) => (bit === "1" ? "." : "-")).join("");
      });
      return morseChars.filter(Boolean).join(" ");
    });
    return morseWords.join("  ");
  };

  // Audio playback
  const playMorseCode = useCallback((morse) => {
    if (audioContextRef.current) audioContextRef.current.close();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioContext;
    let currentTime = audioContext.currentTime;

    morse.split("").forEach((symbol) => {
      if (symbol === "." || symbol === "-") {
        const oscillator = audioContext.createOscillator();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, currentTime);
        oscillator.connect(audioContext.destination);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + (symbol === "." ? dotDuration : dotDuration * 3) / 1000);
        currentTime += (symbol === "." ? dotDuration : dotDuration * 3) / 1000;
        currentTime += dotDuration / 1000; // Gap between symbols
      } else if (symbol === " ") {
        currentTime += dotDuration * 3 / 1000; // Gap between letters or words
      }
    });

    setTimeout(() => {
      if (audioContextRef.current === audioContext) {
        audioContext.close();
        setPlayMorse(false);
      }
    }, currentTime * 1000);
  }, [frequency, dotDuration]);

  const stopMorseCode = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      setPlayMorse(false);
    }
  };

  // Handlers
  const handleMorseInput = (value) => {
    setMorseInput(value);
    setError("");
    const cleanedInput = value.trim().replace(/\s+/g, " ");
    if (!cleanedInput) {
      setBinaryOutput("");
      setTextOutput("");
      return;
    }

    const morseWords = cleanedInput.split("  ");
    const invalidChar = morseWords.some((word) =>
      word.split(" ").some((char) => !MORSE_TO_CHAR[char])
    );
    if (invalidChar) {
      setError("Invalid Morse code character");
      setBinaryOutput("");
      setTextOutput("");
      return;
    }

    const binary = morseToBinary(cleanedInput);
    const text = morseWords.map((word) =>
      word.split(" ").map((char) => MORSE_TO_CHAR[char] || "").join("")
    ).join(" ");
    setBinaryOutput(binary.padStart(Math.ceil(binary.length / bitLength) * bitLength, "0"));
    setTextOutput(text);
  };

  const handleBinaryInput = (value) => {
    setBinaryOutput(value);
    setError("");
    if (!/^[01]+$/.test(value)) {
      setError("Invalid binary input");
      setMorseInput("");
      setTextOutput("");
      return;
    }

    const morse = binaryToMorse(value);
    const text = morse.split("  ").map((word) =>
      word.split(" ").map((char) => MORSE_TO_CHAR[char] || "").join("")
    ).join(" ");
    setMorseInput(morse);
    setTextOutput(text);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const downloadText = () => {
    const content = `Morse: ${morseInput}\nBinary: ${binaryOutput}\nText: ${textOutput}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `morse-conversion-${Date.now()}.txt`;
    link.click();
  };

  const reset = () => {
    setMorseInput("");
    setBinaryOutput("");
    setTextOutput("");
    setError("");
    setBitLength(8);
    setFrequency(600);
    setDotDuration(100);
    stopMorseCode();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Morse Code to Binary Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Morse Code
              </label>
              <textarea
                value={morseInput}
                onChange={(e) => handleMorseInput(e.target.value)}
                placeholder="e.g., ... --- ... (SOS)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Output
              </label>
              <textarea
                value={binaryOutput}
                onChange={(e) => handleBinaryInput(e.target.value)}
                placeholder="e.g., 10101011001100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 font-mono resize-y"
              />
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bit Length
                </label>
                <select
                  value={bitLength}
                  onChange={(e) => setBitLength(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={8}>8-bit</option>
                  <option value={16}>16-bit</option>
                  <option value={32}>32-bit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency ({frequency} Hz)
                </label>
                <input
                  type="range"
                  min="200"
                  max="1000"
                  value={frequency}
                  onChange={(e) => setFrequency(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dot Duration ({dotDuration} ms)
                </label>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="10"
                  value={dotDuration}
                  onChange={(e) => setDotDuration(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  setPlayMorse(true);
                  playMorseCode(morseInput);
                }}
                disabled={!morseInput || playMorse}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaPlay className="mr-2" /> {playMorse ? "Playing..." : "Play"}
              </button>
              <button
                onClick={stopMorseCode}
                disabled={!playMorse}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaStop className="mr-2" /> Stop
              </button>
              <button
                onClick={downloadText}
                disabled={!textOutput}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Results Section */}
          {textOutput && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Results</h2>
              <div className="space-y-2 text-sm text-gray-700">
                {["Text", "Morse", "Binary"].map((label) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="font-medium min-w-[60px]">{label}:</span>
                    <span className={label === "Binary" ? "font-mono" : ""}>
                      {label === "Text" ? textOutput : label === "Morse" ? morseInput : binaryOutput}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          label === "Text" ? textOutput : label === "Morse" ? morseInput : binaryOutput
                        )
                      }
                      className="p-1 text-gray-500 hover:text-blue-500"
                    >
                      <FaCopy />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Features & Usage */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features & Usage</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert Morse code to binary and text</li>
              <li>Convert binary to Morse code and text</li>
              <li>Play Morse code with customizable frequency (200-1000 Hz) and duration (50-300 ms)</li>
              <li>Supports 8, 16, 32-bit binary padding</li>
              <li>Copy results to clipboard</li>
              <li>Download results as text file</li>
              <li>Use single space between letters, double space between words</li>
              <li>Example: ... --- ... (SOS) → 10101011001100</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MorseCodeToBinary;