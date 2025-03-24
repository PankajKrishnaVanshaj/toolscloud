"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload, FaCopy } from "react-icons/fa";

const RandomWordPairGenerator = () => {
  const [wordPairs, setWordPairs] = useState([]);
  const [count, setCount] = useState(1);
  const [category, setCategory] = useState("nature");
  const [format, setFormat] = useState("adjective-noun");
  const [history, setHistory] = useState([]);

  // Word lists by category
  const wordLists = {
    nature: {
      nouns: [
        "Cloud", "River", "Mountain", "Forest", "Ocean", "Star", "Moon",
        "Shadow", "Flame", "Stone", "Wind", "Tree", "Path", "Echo", "Dawn",
      ],
      adjectives: [
        "Silent", "Vivid", "Golden", "Mystic", "Eternal", "Fierce", "Gentle",
        "Hidden", "Bright", "Dark", "Swift", "Calm", "Wild", "Ancient", "Crystal",
      ],
    },
    tech: {
      nouns: [
        "Code", "Server", "Network", "Pixel", "Data", "Circuit", "Byte",
        "Cloud", "Stream", "Pulse", "Grid", "Node", "Link", "Frame", "Core",
      ],
      adjectives: [
        "Digital", "Smart", "Fast", "Secure", "Virtual", "Quantum", "Neon",
        "Dynamic", "Static", "Global", "Local", "Binary", "Infinite", "Modular", "Encrypted",
      ],
    },
    fantasy: {
      nouns: [
        "Dragon", "Quest", "Realm", "Sword", "Mage", "Castle", "Rune",
        "Spirit", "Goblin", "Elf", "Orc", "Tome", "Crown", "Portal", "Myth",
      ],
      adjectives: [
        "Mystic", "Enchanted", "Dark", "Radiant", "Cursed", "Ancient", "Fabled",
        "Ethereal", "Brave", "Wicked", "Sacred", "Lost", "Glowing", "Forbidden", "Legendary",
      ],
    },
  };

  // Generate word pairs
  const generateWordPairs = useCallback(() => {
    const { nouns, adjectives } = wordLists[category];
    const pairs = [];
    for (let i = 0; i < count; i++) {
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const pair =
        format === "adjective-noun" ? `${adj} ${noun}` : `${noun} ${adj}`;
      pairs.push(pair);
    }
    setWordPairs(pairs);
    setHistory((prev) => [...prev, { category, format, pairs }].slice(-10)); // Keep last 10
  }, [count, category, format]);

  // Reset to default
  const reset = () => {
    setWordPairs([]);
    setCount(1);
    setCategory("nature");
    setFormat("adjective-noun");
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (wordPairs.length > 0) {
      navigator.clipboard.writeText(wordPairs.join("\n"));
      alert("Word pairs copied to clipboard!");
    }
  };

  // Download as text file
  const downloadPairs = () => {
    if (wordPairs.length > 0) {
      const blob = new Blob([wordPairs.join("\n")], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `word-pairs-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Word Pair Generator
        </h1>

        {/* Controls */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Pairs
              </label>
              <input
                type="number"
                value={count}
                onChange={(e) =>
                  setCount(Math.max(1, Math.min(20, Number(e.target.value))))
                }
                min="1"
                max="20"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500"
              >
                <option value="nature">Nature</option>
                <option value="tech">Technology</option>
                <option value="fantasy">Fantasy</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500"
              >
                <option value="adjective-noun">Adjective-Noun</option>
                <option value="noun-adjective">Noun-Adjective</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateWordPairs}
              className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              Generate Word Pairs
            </button>
            <button
              onClick={copyToClipboard}
              disabled={!wordPairs.length}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaCopy className="mr-2" /> Copy
            </button>
            <button
              onClick={downloadPairs}
              disabled={!wordPairs.length}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Generated Word Pairs */}
        {wordPairs.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-3 text-center text-purple-600">
              Generated Word Pairs
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {wordPairs.map((pair, index) => (
                <li
                  key={index}
                  className="text-gray-700 p-2 bg-white rounded-md shadow-sm text-center"
                >
                  {pair}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!wordPairs.length && (
          <div className="mt-6 text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500 italic">
              Click "Generate Word Pairs" to create random combinations!
            </p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-700 mb-2">Generation History</h3>
            <ul className="text-sm text-blue-600 space-y-2 max-h-32 overflow-y-auto">
              {history.slice().reverse().map((entry, index) => (
                <li key={index}>
                  {entry.pairs.length} {entry.category} pairs ({entry.format}):{" "}
                  {entry.pairs.join(", ")}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-purple-600 text-sm space-y-1">
            <li>Multiple categories: Nature, Technology, Fantasy</li>
            <li>Customizable pair count (1-20)</li>
            <li>Format options: Adjective-Noun or Noun-Adjective</li>
            <li>Copy to clipboard and download as text file</li>
            <li>Generation history tracking</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Tip: Use these pairs for naming, writing prompts, or creative inspiration!
        </p>
      </div>
    </div>
  );
};

export default RandomWordPairGenerator;