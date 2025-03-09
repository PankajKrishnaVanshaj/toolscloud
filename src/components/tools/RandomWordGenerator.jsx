"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaDice,
} from "react-icons/fa";

const RandomWordGenerator = () => {
  const [words, setWords] = useState([]);
  const [count, setCount] = useState(10);
  const [length, setLength] = useState(6);
  const [category, setCategory] = useState("general");
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    customVowels: "aeiou",
    customConsonants: "bcdfghjklmnpqrstvwxyz",
    syllableCount: 0,        // 0 for random, otherwise fixed syllables
    includeNumbers: false,   // Include digits in words
    separator: "\n",         // Separator for output
  });

  const generateRandomWord = (wordLength) => {
    const vowels = options.customVowels || "aeiou"; // Fallback if empty
    const consonants = options.customConsonants || "bcdfghjklmnpqrstvwxyz";
    const numbers = "0123456789";
    const chars = options.includeNumbers ? vowels + consonants + numbers : vowels + consonants;

    if (!chars) return "error"; // Prevent empty character pool

    const getSyllable = () => {
      const structure = Math.random() > 0.5 ? "cvc" : "cv";
      let syllable = "";
      for (let char of structure) {
        const pool = char === "c" ? consonants : vowels;
        syllable += pool[Math.floor(Math.random() * pool.length)] || ""; // Fallback for empty pool
      }
      return syllable || "a"; // Ensure at least one character
    };

    let word = "";
    if (options.syllableCount > 0) {
      for (let i = 0; i < options.syllableCount; i++) {
        word += getSyllable();
      }
      if (word.length > wordLength) word = word.slice(0, wordLength);
      else if (word.length < wordLength) {
        const remaining = wordLength - word.length;
        for (let i = 0; i < remaining; i++) {
          word += chars[Math.floor(Math.random() * chars.length)];
        }
      }
    } else {
      while (word.length < wordLength) {
        word += getSyllable();
      }
      if (word.length > wordLength) word = word.slice(0, wordLength);
    }

    return word;
  };

  const generateCategorizedWord = () => {
    const word = generateRandomWord(length);
    if (word === "error") return "invalid"; // Handle invalid generation
    switch (category) {
      case "nouns":
        return word + (Math.random() > 0.5 ? "ing" : "er");
      case "verbs":
        return (Math.random() > 0.5 ? "re" : "un") + word;
      case "adjectives":
        return word + (Math.random() > 0.5 ? "ful" : "less");
      case "general":
      default:
        return word;
    }
  };

  const generateWords = useCallback(() => {
    const newWords = Array.from({ length: Math.min(count, 1000) }, generateCategorizedWord);
    if (newWords.includes("invalid")) {
      alert("Invalid settings detected. Please check custom vowels/consonants.");
      return;
    }
    setWords(newWords);
    setIsCopied(false);
    setHistory((prev) => [
      ...prev,
      { words: newWords, options: { count, length, category, ...options } },
    ].slice(-5));
  }, [count, length, category, options]);

  const copyToClipboard = () => {
    const text = words.join(options.separator);
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const downloadAsText = () => {
    const text = words.join(options.separator);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `words-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearWords = () => {
    setWords([]);
    setIsCopied(false);
  };

  const handleOptionChange = (option, value) => {
    setOptions((prev) => ({ ...prev, [option]: value }));
  };

  const restoreFromHistory = (entry) => {
    setWords(entry.words);
    setCount(entry.options.count);
    setLength(entry.options.length);
    setCategory(entry.options.category);
    setOptions(entry.options);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
          Advanced Random Word Generator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Words (1-1000)
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Word Length (3-15)
              </label>
              <input
                type="number"
                min="3"
                max="15"
                value={length}
                onChange={(e) => setLength(Math.max(3, Math.min(15, Number(e.target.value) || 3)))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">General</option>
                <option value="nouns">Nouns</option>
                <option value="verbs">Verbs</option>
                <option value="adjectives">Adjectives</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Syllable Count (0 for random)
              </label>
              <input
                type="number"
                min="0"
                max="5"
                value={options.syllableCount}
                onChange={(e) =>
                  handleOptionChange("syllableCount", Math.max(0, Math.min(5, Number(e.target.value) || 0)))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Advanced Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Advanced Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Custom Vowels:</label>
                <input
                  type="text"
                  value={options.customVowels}
                  onChange={(e) => handleOptionChange("customVowels", e.target.value.toLowerCase())}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., aeiou"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Custom Consonants:</label>
                <input
                  type="text"
                  value={options.customConsonants}
                  onChange={(e) => handleOptionChange("customConsonants", e.target.value.toLowerCase())}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., bcdfgh..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Output Separator:</label>
                <select
                  value={options.separator}
                  onChange={(e) => handleOptionChange("separator", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="\n">Newline</option>
                  <option value=", ">Comma</option>
                  <option value=" ">Space</option>
                  <option value="; ">Semicolon</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeNumbers}
                  onChange={() => handleOptionChange("includeNumbers", !options.includeNumbers)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">Include Numbers</label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateWords}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold flex items-center justify-center"
            >
              <FaDice className="mr-2" />
              Generate Words
            </button>
            {words.length > 0 && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-3 rounded-lg text-white transition-all font-semibold flex items-center justify-center ${
                    isCopied ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" />
                  {isCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={downloadAsText}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
                <button
                  onClick={clearWords}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Output Display */}
        {words.length > 0 && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Generated Words ({words.length}):
            </h2>
            <div className="mt-3 text-lg text-gray-700 whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
              {words.join(options.separator)}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Generations (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.words.length} words ({entry.options.length} chars, {entry.options.category})
                  </span>
                  <button
                    onClick={() => restoreFromHistory(entry)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Generate nouns, verbs, adjectives, or general words</li>
            <li>Customizable vowels, consonants, and syllable count</li>
            <li>Include numbers and choose output separators</li>
            <li>Copy, download, and track history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RandomWordGenerator;