"use client";
import React, { useState } from "react";

const TextWordCloudGenerator = () => {
  const [inputText, setInputText] = useState("");
  const [wordCloud, setWordCloud] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    minWordLength: 3,
    maxWords: 50,
    ignoreCase: true,
    removeCommonWords: true,
  });

  // Common stop words to ignore (simplified list)
  const commonWords = [
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of",
    "with", "by", "from", "is", "are", "was", "were", "be", "this", "that",
  ];

  // Generate word cloud data
  const generateWordCloud = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to generate a word cloud" };
    }

    // Clean and split text into words
    let words = text
      .replace(/[^a-zA-Z\s]/g, " ") // Remove non-letter chars
      .split(/\s+/)
      .filter(word => word.length >= options.minWordLength);

    if (options.ignoreCase) {
      words = words.map(word => word.toLowerCase());
    }

    if (options.removeCommonWords) {
      words = words.filter(word => !commonWords.includes(word.toLowerCase()));
    }

    // Count word frequencies
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // Convert to array and sort by frequency
    let wordList = Object.entries(wordFreq)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
      .slice(0, options.maxWords);

    if (wordList.length === 0) {
      return { error: "No words meet the criteria for the word cloud" };
    }

    // Normalize font sizes (min 12px, max 36px)
    const maxCount = Math.max(...wordList.map(w => w.count));
    wordList = wordList.map(item => ({
      ...item,
      size: Math.round(12 + (24 * (item.count - 1)) / (maxCount - 1 || 1)),
    }));

    return {
      original: text,
      cloud: wordList,
    };
  };

  const handleGenerate = async () => {
    setError("");
    setWordCloud([]);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
      const result = generateWordCloud(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setWordCloud(result.cloud);
    } catch (err) {
      setError("An error occurred while generating the word cloud");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setWordCloud([]);
    setError("");
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(1, value) : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Word Cloud Generator
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-40 resize-y transition-all"
              placeholder="e.g., The quick brown fox jumps over the lazy dog repeatedly."
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Word Cloud Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Min Word Length:</label>
                <input
                  type="number"
                  value={options.minWordLength}
                  onChange={(e) => handleOptionChange("minWordLength", parseInt(e.target.value) || 1)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                  max="100"
                />
              </div>
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
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {isLoading ? "Generating..." : "Generate Word Cloud"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Word Cloud Display */}
        {wordCloud.length > 0 && (
          <div className="mt-8 p-6 bg-purple-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Word Cloud
            </h2>
            <div className="mt-3 flex flex-wrap justify-center gap-4">
              {wordCloud.map(({ word, size, count }, index) => (
                <span
                  key={index}
                  style={{ fontSize: `${size}px` }}
                  className="text-purple-700 hover:text-purple-900 transition-colors"
                  title={`Count: ${count}`}
                >
                  {word}
                </span>
              ))}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(wordCloud.map(w => w.word).join(" "))}
              className="mt-4 w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all font-semibold"
            >
              Copy Words to Clipboard
            </button>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default TextWordCloudGenerator;