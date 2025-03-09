"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo, FaDice } from "react-icons/fa";

const TitleGenerator = () => {
  const [titles, setTitles] = useState([]);
  const [count, setCount] = useState(1);
  const [category, setCategory] = useState("general");
  const [length, setLength] = useState("medium");
  const [tone, setTone] = useState("neutral"); // neutral, formal, casual, dramatic
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    prefix: "",
    suffix: "",
    separator: " ",
    includeNumbers: false,
  });

  // Expanded word banks
  const wordBanks = {
    general: {
      adjectives: ["Great", "Hidden", "Simple", "Bold", "Bright", "Curious", "Vivid", "Silent"],
      nouns: ["Journey", "Secret", "Path", "Adventure", "Dream", "Story", "Moment", "Echo"],
      verbs: ["Unveiling", "Discovering", "Exploring", "Mastering", "Building", "Crafting", "Chasing"],
    },
    tech: {
      adjectives: ["Smart", "Digital", "Next", "Quantum", "Cloud", "Agile", "Neural", "Virtual"],
      nouns: ["Code", "Network", "Algorithm", "System", "Future", "Data", "Tech", "Edge"],
      verbs: ["Coding", "Hacking", "Optimizing", "Deploying", "Innovating", "Analyzing", "Securing"],
    },
    fantasy: {
      adjectives: ["Mystic", "Ancient", "Enchanted", "Dark", "Golden", "Eternal", "Fabled", "Lost"],
      nouns: ["Realm", "Quest", "Legend", "Dragon", "Kingdom", "Magic", "Sword", "Oracle"],
      verbs: ["Wielding", "Questing", "Conjuring", "Battling", "Forging", "Summoning", "Ruling"],
    },
    business: {
      adjectives: ["Strategic", "Global", "Profitable", "Dynamic", "Innovative", "Leading", "Sustainable"],
      nouns: ["Success", "Growth", "Market", "Leadership", "Vision", "Profit", "Strategy", "Brand"],
      verbs: ["Scaling", "Leveraging", "Monetizing", "Branding", "Networking", "Expanding", "Investing"],
    },
  };

  // Tone-specific modifiers
  const toneModifiers = {
    neutral: { prefix: "", suffix: "" },
    formal: { prefix: "A Study in", suffix: "Principles" },
    casual: { prefix: "Hey,", suffix: "Made Easy" },
    dramatic: { prefix: "Behold:", suffix: "Unleashed" },
  };

  // Title patterns
  const patterns = {
    short: [
      (words) => `${words.adjectives[0]}${options.separator}${words.nouns[0]}`,
      (words) => `${words.verbs[0]}${options.separator}${words.nouns[0]}`,
    ],
    medium: [
      (words) => `The${options.separator}${words.adjectives[0]}${options.separator}${words.nouns[0]}`,
      (words) => `${words.verbs[0]}${options.separator}the${options.separator}${words.nouns[0]}`,
      (words) => `${words.adjectives[0]}${options.separator}${words.nouns[0]}${options.separator}Guide`,
    ],
    long: [
      (words) =>
        `The${options.separator}${words.adjectives[0]}${options.separator}Art${options.separator}of${options.separator}${words.verbs[0]}${options.separator}${words.nouns[0]}`,
      (words) =>
        `${words.verbs[0]}${options.separator}${words.adjectives[0]}${options.separator}${words.nouns[0]}${options.separator}in${options.separator}Practice`,
      (words) =>
        `A${options.separator}${words.adjectives[0]}${options.separator}${words.nouns[0]}${options.separator}for${options.separator}${words.verbs[0]}${options.separator}Success`,
    ],
  };

  const generateTitles = useCallback(() => {
    const bank = wordBanks[category];
    const selectedPatterns = patterns[length];
    const toneMod = toneModifiers[tone];

    const newTitles = Array.from({ length: Math.min(count, 100) }, () => {
      const words = {
        adjectives: [...bank.adjectives].sort(() => Math.random() - 0.5),
        nouns: [...bank.nouns].sort(() => Math.random() - 0.5),
        verbs: [...bank.verbs].sort(() => Math.random() - 0.5),
      };
      const pattern = selectedPatterns[Math.floor(Math.random() * selectedPatterns.length)];
      let title = pattern(words);
      
      if (options.prefix || toneMod.prefix) title = `${options.prefix || toneMod.prefix}${options.separator}${title}`;
      if (options.suffix || toneMod.suffix) title += `${options.separator}${options.suffix || toneMod.suffix}`;
      if (options.includeNumbers) title += `${options.separator}${Math.floor(Math.random() * 100)}`;

      return title.trim();
    });

    setTitles(newTitles);
    setHistory((prev) => [
      ...prev,
      { titles: newTitles, options: { count, category, length, tone, ...options } },
    ].slice(-5));
    setIsCopied(false);
  }, [count, category, length, tone, options]);

  const copyToClipboard = () => {
    const text = titles.join("\n");
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const downloadAsText = () => {
    const text = titles.join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `titles-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearTitles = () => {
    setTitles([]);
    setIsCopied(false);
  };

  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const restoreFromHistory = (entry) => {
    setTitles(entry.titles);
    setCount(entry.options.count);
    setCategory(entry.options.category);
    setLength(entry.options.length);
    setTone(entry.options.tone);
    setOptions(entry.options);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Title Generator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Titles (1-100)
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
              >
                <option value="general">General</option>
                <option value="tech">Technology</option>
                <option value="fantasy">Fantasy</option>
                <option value="business">Business</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title Length
              </label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="neutral">Neutral</option>
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="dramatic">Dramatic</option>
              </select>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Advanced Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Prefix:</label>
                <input
                  type="text"
                  value={options.prefix}
                  onChange={(e) => handleOptionChange("prefix", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., The"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Suffix:</label>
                <input
                  type="text"
                  value={options.suffix}
                  onChange={(e) => handleOptionChange("suffix", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Today"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Separator:</label>
                <select
                  value={options.separator}
                  onChange={(e) => handleOptionChange("separator", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value=" ">Space</option>
                  <option value="-">Hyphen</option>
                  <option value="_">Underscore</option>
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateTitles}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaDice className="mr-2" />
              Generate Titles
            </button>
            {titles.length > 0 && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors font-medium flex items-center justify-center ${
                    isCopied
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
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
                  onClick={clearTitles}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Generated Titles */}
        {titles.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Titles ({titles.length}):
            </h2>
            <div className="bg-white p-4 rounded-md border border-gray-200 max-h-64 overflow-y-auto">
              <ul className="list-decimal list-inside text-gray-800">
                {titles.map((title, index) => (
                  <li key={index} className="py-1 break-words">{title}</li>
                ))}
              </ul>
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
                    {entry.titles.length} titles ({entry.options.category}, {entry.options.length})
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
            <li>Categories: General, Tech, Fantasy, Business</li>
            <li>Lengths: Short, Medium, Long</li>
            <li>Tones: Neutral, Formal, Casual, Dramatic</li>
            <li>Custom prefix, suffix, separator, and numbers</li>
            <li>Copy, download, and history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TitleGenerator;