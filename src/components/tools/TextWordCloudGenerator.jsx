"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaCloud,
} from "react-icons/fa";

const TextWordCloudGenerator = () => {
  const [inputText, setInputText] = useState("");
  const [wordCloud, setWordCloud] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    minWordLength: 3,
    maxWords: 50,
    ignoreCase: true,
    removeCommonWords: true,
    customStopWords: "", // Custom words to ignore
    sortBy: "frequency", // frequency, alphabetical
    sortOrder: "descending", // ascending, descending
    minFontSize: 12,
    maxFontSize: 36,
    colorScheme: "purple", // purple, blue, green, random
  });

  const commonWords = [
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of",
    "with", "by", "from", "is", "are", "was", "were", "be", "this", "that",
  ];

  const generateWordCloud = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to generate a word cloud" };
    }

    let words = text
      .replace(/[^a-zA-Z\s]/g, " ")
      .split(/\s+/)
      .filter(word => word.length >= options.minWordLength);

    if (options.ignoreCase) {
      words = words.map(word => word.toLowerCase());
    }

    const stopWords = options.removeCommonWords
      ? [...commonWords, ...(options.customStopWords.split(",").map(w => w.trim().toLowerCase()))]
      : options.customStopWords.split(",").map(w => w.trim().toLowerCase());
    words = words.filter(word => !stopWords.includes(word.toLowerCase()) || word.length === 0);

    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    let wordList = Object.entries(wordFreq).map(([word, count]) => ({ word, count }));

    if (options.sortBy === "frequency") {
      wordList.sort((a, b) => options.sortOrder === "descending" ? b.count - a.count : a.count - b.count);
    } else {
      wordList.sort((a, b) => options.sortOrder === "descending" ? b.word.localeCompare(a.word) : a.word.localeCompare(b.word));
    }

    wordList = wordList.slice(0, options.maxWords);

    if (wordList.length === 0) {
      return { error: "No words meet the criteria for the word cloud" };
    }

    const maxCount = Math.max(...wordList.map(w => w.count));
    wordList = wordList.map(item => ({
      ...item,
      size: Math.round(options.minFontSize + (options.maxFontSize - options.minFontSize) * (item.count - 1) / (maxCount - 1 || 1)),
      color: getColor(item.count, maxCount),
    }));

    return { original: text, cloud: wordList };
  };

  const getColor = (count, maxCount) => {
    const intensity = Math.min(900, 300 + Math.round((count / maxCount) * 600));
    switch (options.colorScheme) {
      case "purple": return `text-purple-${intensity}`;
      case "blue": return `text-blue-${intensity}`;
      case "green": return `text-green-${intensity}`;
      case "random": return `text-${["red", "orange", "yellow", "green", "blue", "purple"][Math.floor(Math.random() * 6)]}-${intensity}`;
      default: return "text-purple-700";
    }
  };

  const handleGenerate = useCallback(async () => {
    setError("");
    setWordCloud([]);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const result = generateWordCloud(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setWordCloud(result.cloud);
        setHistory(prev => [...prev, { input: inputText, cloud: result.cloud, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setWordCloud([]);
    setError("");
    setOptions({
      minWordLength: 3,
      maxWords: 50,
      ignoreCase: true,
      removeCommonWords: true,
      customStopWords: "",
      sortBy: "frequency",
      sortOrder: "descending",
      minFontSize: 12,
      maxFontSize: 36,
      colorScheme: "purple",
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(option === "minFontSize" ? 8 : 1, value) : value,
    }));
  };

  const exportWordCloud = () => {
    const content = `Word Cloud\nInput Text: ${inputText}\n\nWords:\n${wordCloud.map(w => `${w.word}: ${w.count}`).join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `word_cloud_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full ">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
          Advanced Word Cloud Generator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Analyze:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-40 sm:h-48 resize-y transition-all"
              placeholder="e.g., The quick brown fox jumps over the lazy dog repeatedly."
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Word Cloud Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Min Word Length:</label>
                <input
                  type="number"
                  value={options.minWordLength}
                  onChange={(e) => handleOptionChange("minWordLength", parseInt(e.target.value) || 1)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                  max="10"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Words:</label>
                <input
                  type="number"
                  value={options.maxWords}
                  onChange={(e) => handleOptionChange("maxWords", parseInt(e.target.value) || 1)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                  max="200"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Min Font Size:</label>
                <input
                  type="number"
                  value={options.minFontSize}
                  onChange={(e) => handleOptionChange("minFontSize", parseInt(e.target.value) || 8)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="8"
                  max="24"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Font Size:</label>
                <input
                  type="number"
                  value={options.maxFontSize}
                  onChange={(e) => handleOptionChange("maxFontSize", parseInt(e.target.value) || 36)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="16"
                  max="72"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Sort By:</label>
                <select
                  value={options.sortBy}
                  onChange={(e) => handleOptionChange("sortBy", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="frequency">Frequency</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Sort Order:</label>
                <select
                  value={options.sortOrder}
                  onChange={(e) => handleOptionChange("sortOrder", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="descending">Descending</option>
                  <option value="ascending">Ascending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Color Scheme:</label>
                <select
                  value={options.colorScheme}
                  onChange={(e) => handleOptionChange("colorScheme", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="purple">Purple</option>
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="random">Random</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.ignoreCase}
                    onChange={() => handleOptionChange("ignoreCase", !options.ignoreCase)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Ignore Case</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.removeCommonWords}
                    onChange={() => handleOptionChange("removeCommonWords", !options.removeCommonWords)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Remove Common Words</span>
                </label>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Custom Stop Words (comma-separated):</label>
                <input
                  type="text"
                  value={options.customStopWords}
                  onChange={(e) => handleOptionChange("customStopWords", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., hello, world"
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              <FaCloud className="inline mr-2" />
              {isLoading ? "Generating..." : "Generate Word Cloud"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {wordCloud.length > 0 && (
              <button
                onClick={exportWordCloud}
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

        {/* Word Cloud Display */}
        {wordCloud.length > 0 && (
          <div className="mt-8 p-6 bg-purple-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">Word Cloud</h2>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:gap-4 max-h-96 overflow-y-auto">
              {wordCloud.map(({ word, size, count, color }, index) => (
                <span
                  key={index}
                  style={{ fontSize: `${size}px` }}
                  className={`${color} hover:opacity-80 transition-opacity cursor-default`}
                  title={`Count: ${count}`}
                >
                  {word}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigator.clipboard.writeText(wordCloud.map(w => w.word).join(" "))}
                className="flex-1 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all font-semibold"
              >
                <FaCopy className="inline mr-2" />
                Copy Words
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(wordCloud.map(w => `${w.word}: ${w.count}`).join("\n"))}
                className="flex-1 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all font-semibold"
              >
                <FaCopy className="inline mr-2" />
                Copy with Counts
              </button>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Word Clouds (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.cloud.slice(0, 3).map(w => w.word).join(", ")}... ({entry.cloud.length} words)
                  </span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setWordCloud(entry.cloud);
                      setOptions(entry.options);
                    }}
                    className="text-purple-500 hover:text-purple-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-purple-100 rounded-lg border border-purple-300">
          <h3 className="font-semibold text-purple-700">Features</h3>
          <ul className="list-disc list-inside text-purple-600 text-sm">
            <li>Customizable word length and count limits</li>
            <li>Sorting by frequency or alphabetical order</li>
            <li>Adjustable font sizes and color schemes</li>
            <li>Custom stop words and common word removal</li>
            <li>Export and history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextWordCloudGenerator;