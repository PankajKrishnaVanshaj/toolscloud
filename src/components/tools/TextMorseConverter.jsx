"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaPlay,
  FaExchangeAlt,
} from "react-icons/fa";

const morseCode = {
  "A": ".-", "B": "-...", "C": "-.-.", "D": "-..", "E": ".", "F": "..-.",
  "G": "--.", "H": "....", "I": "..", "J": ".---", "K": "-.-", "L": ".-..",
  "M": "--", "N": "-.", "O": "---", "P": ".--.", "Q": "--.-", "R": ".-.",
  "S": "...", "T": "-", "U": "..-", "V": "...-", "W": ".--", "X": "-..-",
  "Y": "-.--", "Z": "--..", "0": "-----", "1": ".----", "2": "..---",
  "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...",
  "8": "---..", "9": "----.", ".": ".-.-.-", ",": "--..--", "?": "..--..",
  "!": "-.-.--", " ": "/"
};

const morseToText = Object.fromEntries(
  Object.entries(morseCode).map(([key, value]) => [value, key])
);

const TextMorseConverter = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [direction, setDirection] = useState("textToMorse");
  const [options, setOptions] = useState({
    addSpaces: true,
    customSeparator: " ",    // Custom separator for Morse output
    dotDuration: 100,        // Duration of dot in ms for audio
    dashDuration: 300,       // Duration of dash in ms for audio
    frequency: 600,          // Audio frequency in Hz
  });

  const textToMorse = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to convert" };
    }

    const morse = text.toUpperCase()
      .split("")
      .map(char => morseCode[char] || "")
      .filter(Boolean)
      .join(options.addSpaces ? options.customSeparator : "");

    if (!morse) {
      return { error: "No valid characters found for Morse conversion" };
    }

    return { original: text, converted: morse, type: "Text to Morse" };
  };

  const morseToTextConvert = (morse) => {
    if (!morse.trim()) {
      return { error: "Please enter some Morse code to convert" };
    }

    const parts = morse.split(options.addSpaces ? new RegExp(options.customSeparator, "g") : "");
    const text = parts
      .map(code => (code === "/" ? " " : morseToText[code] || ""))
      .join("");

    if (!text || text.trim() === "") {
      return { error: "Invalid Morse code input: Use dots (.), dashes (-), spaces, and / for word breaks" };
    }

    return { original: morse, converted: text, type: "Morse to Text" };
  };

  const playMorseAudio = () => {
    if (direction !== "textToMorse" || !outputText) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = options.frequency;
    gainNode.gain.value = 0.5;
    oscillator.type = "sine";

    let time = audioContext.currentTime;

    outputText.split(options.customSeparator).forEach(symbol => {
      if (symbol === "/") {
        time += options.dotDuration * 7 / 1000; // Word gap
      } else {
        symbol.split("").forEach(char => {
          if (char === ".") {
            oscillator.start(time);
            oscillator.stop(time + options.dotDuration / 1000);
            time += options.dotDuration / 1000 + options.dotDuration / 1000; // Dot + gap
          } else if (char === "-") {
            oscillator.start(time);
            oscillator.stop(time + options.dashDuration / 1000);
            time += options.dashDuration / 1000 + options.dotDuration / 1000; // Dash + gap
          }
        });
        time += options.dotDuration * 2 / 1000; // Letter gap
      }
    });

    oscillator.onended = () => audioContext.close();
    oscillator.start();
  };

  const handleConvert = useCallback(async () => {
    setError("");
    setOutputText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = direction === "textToMorse" ? textToMorse(inputText) : morseToTextConvert(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setOutputText(result.converted);
        setHistory(prev => [...prev, { input: inputText, output: result.converted, direction, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, direction, options]);

  const reset = () => {
    setInputText("");
    setOutputText("");
    setError("");
    setOptions({
      addSpaces: true,
      customSeparator: " ",
      dotDuration: 100,
      dashDuration: 300,
      frequency: 600,
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(50, Math.min(1000, value)) : value,
    }));
  };

  const exportConvertedText = () => {
    const content = `Input: ${inputText}\nDirection: ${direction === "textToMorse" ? "Text to Morse" : "Morse to Text"}\nOutput: ${outputText}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `morse_${direction}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full ">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
          Advanced Text Morse Converter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter {direction === "textToMorse" ? "Text" : "Morse"} to Convert:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 h-40 sm:h-48 resize-y transition-all"
              placeholder={
                direction === "textToMorse"
                  ? "e.g., HELLO WORLD"
                  : `e.g., .... . .-.. .-.. ---${options.customSeparator}/ .-- --- .-. .-.. -..`
              }
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Conversion Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Direction:</label>
                <div className="flex items-center space-x-4">
                  <label className="text-sm text-gray-600">
                    <input
                      type="radio"
                      name="direction"
                      value="textToMorse"
                      checked={direction === "textToMorse"}
                      onChange={() => setDirection("textToMorse")}
                      className="mr-2"
                    />
                    Text to Morse
                  </label>
                  <label className="text-sm text-gray-600">
                    <input
                      type="radio"
                      name="direction"
                      value="morseToText"
                      checked={direction === "morseToText"}
                      onChange={() => setDirection("morseToText")}
                      className="mr-2"
                    />
                    Morse to Text
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Custom Separator:</label>
                <input
                  type="text"
                  value={options.customSeparator}
                  onChange={(e) => handleOptionChange("customSeparator", e.target.value || " ")}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  maxLength="5"
                  placeholder="e.g., space or |"
                  disabled={!options.addSpaces}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Dot Duration (ms):</label>
                <input
                  type="number"
                  value={options.dotDuration}
                  onChange={(e) => handleOptionChange("dotDuration", parseInt(e.target.value) || 100)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  min="50"
                  max="500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Dash Duration (ms):</label>
                <input
                  type="number"
                  value={options.dashDuration}
                  onChange={(e) => handleOptionChange("dashDuration", parseInt(e.target.value) || 300)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  min="100"
                  max="1000"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Audio Frequency (Hz):</label>
                <input
                  type="number"
                  value={options.frequency}
                  onChange={(e) => handleOptionChange("frequency", parseInt(e.target.value) || 600)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  min="200"
                  max="2000"
                />
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.addSpaces}
                  onChange={() => handleOptionChange("addSpaces", !options.addSpaces)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500"
                />
                <span>Add Spaces</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleConvert}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              <FaExchangeAlt className="inline mr-2" />
              {isLoading ? "Converting..." : "Convert"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {outputText && (
              <button
                onClick={exportConvertedText}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold"
              >
                <FaDownload className="inline mr-2" />
                Export
              </button>
            )}
            {direction === "textToMorse" && outputText && (
              <button
                onClick={playMorseAudio}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
              >
                <FaPlay className="inline mr-2" />
                Play Morse
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Output Display */}
        {outputText && (
          <div className="mt-8 p-6 bg-red-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Converted {direction === "textToMorse" ? "Morse" : "Text"}
            </h2>
            <p className="mt-3 text-lg text-gray-700 break-all whitespace-pre-wrap max-h-64 overflow-y-auto">
              {outputText}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(outputText)}
              className="mt-4 w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy to Clipboard
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Conversions (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.direction === "textToMorse" ? "Text → Morse" : "Morse → Text"}: "{entry.output.slice(0, 20)}..."
                  </span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setOutputText(entry.output);
                      setDirection(entry.direction);
                      setOptions(entry.options);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-red-100 rounded-lg border border-red-300">
          <h3 className="font-semibold text-red-700">Features</h3>
          <ul className="list-disc list-inside text-red-600 text-sm">
            <li>Bidirectional conversion (Text ↔ Morse)</li>
            <li>Customizable separators and spacing</li>
            <li>Audio playback for Morse code</li>
            <li>Adjustable dot/dash duration and frequency</li>
            <li>Export results and history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextMorseConverter;