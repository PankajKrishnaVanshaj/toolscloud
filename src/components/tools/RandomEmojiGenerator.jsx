"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo, FaDice } from "react-icons/fa";

const RandomEmojiGenerator = () => {
  const [emojis, setEmojis] = useState([]);
  const [count, setCount] = useState(10);
  const [category, setCategory] = useState("all");
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    uniqueOnly: false,    // Generate only unique emojis
    separator: " ",       // Separator between emojis
    customEmojis: "",     // Custom emoji list
  });

  // Expanded emoji categories
  const emojiCategories = {
    all: [
      "😀", "😂", "😍", "😢", "😡", "👍", "👎", "❤️", "⭐", "🌟", "🍎", "🍕", "🐱", "🐶", "🌍", "🚀",
      "😊", "🤓", "🥳", "👋", "✌️", "📱", "💻", "🐰", "🦊", "✈️", "🏖️",
    ],
    faces: [
      "😀", "😂", "😍", "😢", "😡", "😊", "😳", "🥳", "😴", "🤓", "😜", "😱", "🥰", "😇", "🤗",
    ],
    gestures: [
      "👍", "👎", "👋", "✌️", "👌", "🤝", "🙏", "✊", "👊", "🤘", "👏", "🙌", "🖐️", "🤞",
    ],
    objects: [
      "❤️", "⭐", "🌟", "🍎", "🍕", "📱", "💻", "🎮", "🎸", "⚽", "💡", "📚", "🎁", "🖥️", "⌚",
    ],
    animals: [
      "🐱", "🐶", "🐰", "🦊", "🐻", "🐼", "🐸", "🐵", "🦁", "🐘", "🐍", "🦋", "🐳", "🦄", "🐙",
    ],
    travel: [
      "🌍", "🚀", "✈️", "🚗", "🚢", "🏖️", "⛰️", "🏰", "🌋", "🏝️", "🌄", "🚂", "🏙️", "🌉", "⛺",
    ],
    food: [
      "🍎", "🍕", "🍔", "🍟", "🍣", "🍝", "🍦", "🍰", "🍫", "🍉", "🍓", "🍗", "🥐", "🥗", "☕",
    ],
  };

  const generateEmojis = useCallback(() => {
    let availableEmojis = options.customEmojis
      ? options.customEmojis.split(/\s+|,|;|\n/).filter((e) => e.trim())
      : emojiCategories[category];

    if (!availableEmojis.length) {
      alert("No emojis available for this category or custom input!");
      return;
    }

    let newEmojis = [];
    if (options.uniqueOnly && count <= availableEmojis.length) {
      const shuffled = [...availableEmojis].sort(() => 0.5 - Math.random());
      newEmojis = shuffled.slice(0, Math.min(count, 100));
    } else {
      newEmojis = Array.from({ length: Math.min(count, 100) }, () => {
        return availableEmojis[Math.floor(Math.random() * availableEmojis.length)];
      });
    }

    setEmojis(newEmojis);
    setIsCopied(false);
    setHistory((prev) => [
      ...prev,
      { emojis: newEmojis, count, category, options },
    ].slice(-5));
  }, [count, category, options]);

  const copyToClipboard = () => {
    const text = emojis.join(options.separator);
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const downloadAsText = () => {
    const text = emojis.join(options.separator);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `emojis-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearEmojis = () => {
    setEmojis([]);
    setIsCopied(false);
  };

  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const restoreFromHistory = (entry) => {
    setEmojis(entry.emojis);
    setCount(entry.count);
    setCategory(entry.category);
    setOptions(entry.options);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">
          Advanced Random Emoji Generator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Emojis (1-100)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={options.customEmojis.length > 0}
              >
                <option value="all">All Categories</option>
                <option value="faces">Faces & Emotions</option>
                <option value="gestures">Gestures & Hands</option>
                <option value="objects">Objects & Symbols</option>
                <option value="animals">Animals</option>
                <option value="travel">Travel & Places</option>
                <option value="food">Food & Drinks</option>
              </select>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Advanced Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Separator:</label>
                <select
                  value={options.separator}
                  onChange={(e) => handleOptionChange("separator", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value=" ">Space</option>
                  <option value="">None</option>
                  <option value=",">Comma</option>
                  <option value="\n">Newline</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.uniqueOnly}
                  onChange={() => handleOptionChange("uniqueOnly", !options.uniqueOnly)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">Unique Emojis Only</label>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Custom Emojis:</label>
                <textarea
                  value={options.customEmojis}
                  onChange={(e) => handleOptionChange("customEmojis", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-y"
                  placeholder="Enter custom emojis (separated by space, comma, or newline)"
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateEmojis}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaDice className="mr-2" />
              Generate Emojis
            </button>
            {emojis.length > 0 && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors font-medium flex items-center justify-center text-white ${
                    isCopied ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" />
                  {isCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={downloadAsText}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
                <button
                  onClick={clearEmojis}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Output Display */}
        {emojis.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">
              Generated Emojis ({emojis.length}):
            </h2>
            <div className="mt-3 bg-gray-50 p-4 rounded-md border border-gray-200 max-h-64 overflow-auto flex flex-wrap gap-3 text-2xl">
              {emojis.map((emoji, index) => (
                <span key={index} title={`Emoji ${index + 1}`}>
                  {emoji}
                </span>
              ))}
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
                    {entry.emojis.length} emojis ({entry.category})
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
            <li>Multiple categories: Faces, Gestures, Objects, Animals, Travel, Food</li>
            <li>Custom emoji input support</li>
            <li>Unique emoji option and custom separators</li>
            <li>Copy, download, and history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RandomEmojiGenerator;