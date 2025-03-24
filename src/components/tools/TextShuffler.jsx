"use client";

import React, { useState } from "react";
import {
  FaCopy,
  FaTrash,
  FaFileExport,
  FaRandom,
  FaUndo,
  FaDownload,
} from "react-icons/fa";

const TextShuffler = () => {
  const [inputText, setInputText] = useState("");
  const [shuffledText, setShuffledText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    shuffleType: "words",      // characters, words, lines, custom
    applyToLines: true,
    preserveCase: true,
    seed: "",
    reverse: false,            // Reverse shuffle option
    customDelimiter: "",       // Custom delimiter for splitting
    shuffleStrength: 1.0,      // 0.0 to 1.0 for partial shuffling
  });

  // Fisher-Yates shuffle with seed and strength
  const shuffleArray = (array, seed, strength = 1.0) => {
    let shuffled = [...array];
    let random = Math.random;
    if (seed) {
      let s = parseInt(seed, 36) || 1;
      random = () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
      };
    }
    const shuffleCount = Math.floor(array.length * strength);
    for (let i = shuffleCount - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const shuffleText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to shuffle" };
    }

    let resultLines = options.applyToLines ? text.split("\n") : [text];
    let shuffledLines = [];

    for (let line of resultLines) {
      let shuffledLine = line;

      let items;
      switch (options.shuffleType) {
        case "characters":
          items = line.split("");
          shuffledLine = shuffleArray(items, options.seed, options.shuffleStrength).join("");
          break;
        case "words":
          items = line.split(/\s+/).filter(w => w.length > 0);
          shuffledLine = shuffleArray(items, options.seed, options.shuffleStrength).join(" ");
          break;
        case "lines":
          shuffledLine = line;
          break;
        case "custom":
          if (!options.customDelimiter) {
            return { error: "Please specify a custom delimiter" };
          }
          items = line.split(options.customDelimiter).filter(i => i.length > 0);
          shuffledLine = shuffleArray(items, options.seed, options.shuffleStrength).join(options.customDelimiter);
          break;
        default:
          return { error: "Invalid shuffle type" };
      }

      if (!options.preserveCase) {
        shuffledLine = shuffledLine.toLowerCase();
      }

      shuffledLines.push(shuffledLine);
    }

    if (options.shuffleType === "lines" && !options.applyToLines) {
      shuffledLines = shuffleArray(resultLines, options.seed, options.shuffleStrength);
    }

    let result = shuffledLines.join("\n");
    if (options.reverse) {
      result = result.split("").reverse().join("");
    }

    return {
      original: text,
      shuffled: result,
      changes: getChanges(text, result),
    };
  };

  const getChanges = (original, shuffled) => {
    const changes = [];
    if (original === shuffled) return ["No changes made"];

    changes.push(`Shuffled ${options.shuffleType} (Strength: ${options.shuffleStrength * 100}%)`);
    if (options.applyToLines && original.includes("\n")) {
      changes.push("Applied to each line separately");
    }
    if (!options.preserveCase) {
      changes.push("Converted to lowercase");
    }
    if (options.seed) {
      changes.push(`Used seed "${options.seed}"`);
    }
    if (options.reverse) {
      changes.push("Reversed output");
    }
    if (options.shuffleType === "custom" && options.customDelimiter) {
      changes.push(`Used custom delimiter "${options.customDelimiter}"`);
    }
    return changes;
  };

  const handleShuffle = async () => {
    setError("");
    setShuffledText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = shuffleText(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setShuffledText(result.shuffled);
    } catch (err) {
      setError("An error occurred while shuffling the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setShuffledText("");
    setError("");
    setOptions({
      shuffleType: "words",
      applyToLines: true,
      preserveCase: true,
      seed: "",
      reverse: false,
      customDelimiter: "",
      shuffleStrength: 1.0,
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  const exportShuffledText = () => {
    const blob = new Blob([shuffledText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "shuffled_text.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Advanced Text Shuffler
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Shuffle:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-48 resize-y transition-all"
              placeholder="e.g., Hello World\nThis is a test"
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Shuffling Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Shuffle Type:</label>
                <select
                  value={options.shuffleType}
                  onChange={(e) => handleOptionChange("shuffleType", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="characters">Characters</option>
                  <option value="words">Words</option>
                  <option value="lines">Lines</option>
                  <option value="custom">Custom Delimiter</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Seed (optional):</label>
                <input
                  type="text"
                  value={options.seed}
                  onChange={(e) => handleOptionChange("seed", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., xyz123"
                  maxLength="20"
                />
              </div>
              {options.shuffleType === "custom" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Custom Delimiter:</label>
                  <input
                    type="text"
                    value={options.customDelimiter}
                    onChange={(e) => handleOptionChange("customDelimiter", e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., ,"
                    maxLength="5"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Shuffle Strength:</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={options.shuffleStrength}
                  onChange={(e) => handleOptionChange("shuffleStrength", parseFloat(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">{(options.shuffleStrength * 100).toFixed(0)}%</span>
              </div>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.applyToLines}
                  onChange={() => handleOptionChange("applyToLines", !options.applyToLines)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Apply to Lines Separately</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.preserveCase}
                  onChange={() => handleOptionChange("preserveCase", !options.preserveCase)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Preserve Case</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.reverse}
                  onChange={() => handleOptionChange("reverse", !options.reverse)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Reverse Output</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleShuffle}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <FaRandom className="inline mr-2" />
              {isLoading ? "Shuffling..." : "Shuffle Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {shuffledText && (
              <button
                onClick={exportShuffledText}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold"
              >
                <FaDownload className="inline mr-2" />
                Export
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
        {shuffledText && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Shuffled Text
            </h2>
            <pre className="mt-3 text-lg text-gray-700 whitespace-pre-wrap break-all">
              {shuffledText}
            </pre>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {shuffleText(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(shuffledText)}
              className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy Shuffled Text
            </button>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Shuffle characters, words, lines, or custom delimiters</li>
            <li>Adjustable shuffle strength (0-100%)</li>
            <li>Reverse output option</li>
            <li>Seed for reproducible results</li>
            <li>Preserve case and line-by-line shuffling</li>
            <li>Export shuffled text to file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextShuffler;