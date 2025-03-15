"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaPlay, FaSync, FaDownload, FaCopy } from "react-icons/fa";

const BinaryToMorseCode = () => {
  const [binaryInput, setBinaryInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [morseOutput, setMorseOutput] = useState("");
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({
    unitDuration: 100, // ms
    wordSpace: 7,      // Units between words
    charSpace: 3,      // Units between characters
    frequency: 600,    // Hz for audio
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef(null);

  // Morse code mapping
  const morseCodeMap = {
    A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
    G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
    M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
    S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
    Y: "-.--", Z: "--..", 0: "-----", 1: ".----", 2: "..---",
    3: "...--", 4: "....-", 5: ".....", 6: "-....", 7: "--...",
    8: "---..", 9: "----.", " ": "/", ".": ".-.-.-", ",": "--..--",
    "?": "..--..", "!": "-.-.--",
  };

  const binaryToText = (binary) => {
    if (!/^[01\s]+$/.test(binary)) {
      setError("Invalid binary input: Use only 0s, 1s, and spaces");
      return "";
    }

    const bytes = binary.split(" ");
    let text = "";
    for (const byte of bytes) {
      if (byte.length === 0) continue;
      const decimal = parseInt(byte, 2);
      if (decimal >= 0 && decimal <= 255) {
        text += String.fromCharCode(decimal);
      } else {
        setError(`Byte out of range: ${byte} (0-255)`);
        return "";
      }
    }
    return text;
  };

  const textToMorse = (text) => {
    return text
      .toUpperCase()
      .split("")
      .map((char) => morseCodeMap[char] || "")
      .join(" ");
  };

  const handleBinaryInput = useCallback((value) => {
    setBinaryInput(value);
    setError("");
    const text = binaryToText(value);
    if (text) {
      setTextInput(text);
      setMorseOutput(textToMorse(text));
    } else {
      setTextInput("");
      setMorseOutput("");
    }
  }, []);

  const handleTextInput = useCallback((value) => {
    setTextInput(value);
    setError("");
    setMorseOutput(textToMorse(value));
    const binary = value
      .split("")
      .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
      .join(" ");
    setBinaryInput(binary);
  }, []);

  const playMorseAudio = useCallback(() => {
    if (!morseOutput || isPlaying) return;

    setIsPlaying(true);
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioContext;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.type = "sine";
    oscillator.frequency.value = settings.frequency;

    let time = audioContext.currentTime;
    const unit = settings.unitDuration / 1000; // Convert to seconds

    morseOutput.split(" ").forEach((symbol) => {
      if (symbol === "/") {
        time += unit * settings.wordSpace;
      } else if (symbol) {
        symbol.split("").forEach((char) => {
          gainNode.gain.setValueAtTime(1, time);
          if (char === ".") {
            time += unit;
          } else if (char === "-") {
            time += unit * 3;
          }
          gainNode.gain.setValueAtTime(0, time);
          time += unit; // Intra-character space
        });
        time += unit * (settings.charSpace - 1); // Inter-character space
      }
    });

    oscillator.start();
    oscillator.stop(time);
    oscillator.onended = () => setIsPlaying(false);
  }, [morseOutput, settings, isPlaying]);

  const stopMorseAudio = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      setIsPlaying(false);
    }
  };

  const downloadMorse = () => {
    const blob = new Blob([morseOutput], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `morse-code-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(morseOutput);
    alert("Morse code copied to clipboard!");
  };

  const reset = () => {
    setBinaryInput("");
    setTextInput("");
    setMorseOutput("");
    setError("");
    setSettings({ unitDuration: 100, wordSpace: 7, charSpace: 3, frequency: 600 });
    stopMorseAudio();
  };

  const handleSettingsChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: parseInt(value) }));
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Binary to Morse Code Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Input (space-separated bytes)
              </label>
              <input
                type="text"
                value={binaryInput}
                onChange={(e) => handleBinaryInput(e.target.value)}
                placeholder="e.g., 01001000 01100101 01101100 01101100 01101111"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Input
              </label>
              <input
                type="text"
                value={textInput}
                onChange={(e) => handleTextInput(e.target.value)}
                placeholder="e.g., HELLO"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Settings Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Audio Settings</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Unit Duration (ms)", key: "unitDuration", min: 50, max: 500 },
                { label: "Word Space (units)", key: "wordSpace", min: 1, max: 10 },
                { label: "Char Space (units)", key: "charSpace", min: 1, max: 10 },
                { label: "Frequency (Hz)", key: "frequency", min: 200, max: 1000 },
              ].map(({ label, key, min, max }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} ({settings[key]})
                  </label>
                  <input
                    type="range"
                    value={settings[key]}
                    onChange={(e) => handleSettingsChange(key, e.target.value)}
                    min={min}
                    max={max}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Output Section */}
          {morseOutput && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Morse Code Output:</h2>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <p className="font-mono text-lg flex-1 break-all">{morseOutput}</p>
                <div className="flex gap-2">
                  <button
                    onClick={isPlaying ? stopMorseAudio : playMorseAudio}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    disabled={!morseOutput}
                  >
                    <FaPlay className="mr-2" /> {isPlaying ? "Stop" : "Play"}
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center"
                    disabled={!morseOutput}
                  >
                    <FaCopy className="mr-2" /> Copy
                  </button>
                  <button
                    onClick={downloadMorse}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                    disabled={!morseOutput}
                  >
                    <FaDownload className="mr-2" /> Download
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center">
            <button
              onClick={reset}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Features Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Bidirectional conversion: Binary ↔ Text ↔ Morse</li>
              <li>Audio playback with customizable timing and frequency</li>
              <li>Copy Morse code to clipboard</li>
              <li>Download Morse code as text file</li>
              <li>Real-time error feedback</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinaryToMorseCode;