"use client";

import { useState, useCallback } from "react";
import {
  FaCopy,
  FaDownload,
  FaUpload,
  FaUndo,
  FaRedo,
  FaTrash,
} from "react-icons/fa";

const TextKeywordExtractor = () => {
  const [inputText, setInputText] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [options, setOptions] = useState({
    minWordLength: 3,
    maxKeywords: 10,
    ignoreCase: true,
    removeCommonWords: true,
    minFrequency: 2,
    includeNGrams: false,
    nGramSize: 2,
    customStopWords: "",
  });

  // Common stop words (expanded list)
  const commonWords = [
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of",
    "with", "by", "from", "is", "are", "was", "were", "be", "this", "that",
    "it", "he", "she", "they", "we", "you", "i", "not", "as", "all", "any",
    "can", "do", "does", "has", "have", "had", "if", "no", "so", "up", "down",
  ];

  const updateHistory = useCallback((newKeywords) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ inputText, keywords: newKeywords });
      return newHistory.slice(-10); // Limit to 10 entries
    });
    setHistoryIndex(prev => prev + 1);
  }, [inputText, historyIndex]);

  const extractKeywords = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to extract keywords from" };
    }

    // Parse custom stop words
    const customStopWords = options.customStopWords
      .split(",")
      .map(word => word.trim().toLowerCase())
      .filter(word => word);

    // Clean and split text into words
    let words = text
      .replace(/[^a-zA-Z\s]/g, " ") // Remove non-letter chars
      .split(/\s+/)
      .filter(word => word.length >= options.minWordLength);

    if (options.ignoreCase) {
      words = words.map(word => word.toLowerCase());
    }

    if (options.removeCommonWords) {
      const stopWords = [...commonWords, ...customStopWords];
      words = words.filter(word => !stopWords.includes(word.toLowerCase()));
    }

    // Count word frequencies
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // Extract n-grams if enabled
    let nGrams = [];
    if (options.includeNGrams && options.nGramSize > 1) {
      for (let i = 0; i < words.length - options.nGramSize + 1; i++) {
        const nGram = words.slice(i, i + options.nGramSize).join(" ");
        nGrams.push(nGram);
      }
      nGrams.forEach(ngram => {
        wordFreq[ngram] = (wordFreq[ngram] || 0) + 1;
      });
    }

    // Filter by minimum frequency and sort
    let keywordList = Object.entries(wordFreq)
      .filter(([, count]) => count >= options.minFrequency)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
      .slice(0, options.maxKeywords);

    if (keywordList.length === 0) {
      return { error: "No keywords meet the specified criteria" };
    }

    return { keywords: keywordList };
  };

  const handleExtract = async () => {
    setError("");
    setKeywords([]);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
      const result = extractKeywords(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setKeywords(result.keywords);
      updateHistory(result.keywords);
    } catch (err) {
      setError("An error occurred while extracting keywords");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const prevState = history[historyIndex - 1];
      setInputText(prevState.inputText);
      setKeywords(prevState.keywords);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextState = history[historyIndex + 1];
      setInputText(nextState.inputText);
      setKeywords(nextState.keywords);
    }
  };

  const reset = () => {
    setInputText("");
    setKeywords([]);
    setError("");
    setHistory([]);
    setHistoryIndex(-1);
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(1, value) : value,
    }));
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setInputText(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleExport = () => {
    if (keywords.length === 0) return;
    const blob = new Blob([keywords.map(k => `${k.word} (${k.count})`).join("\n")], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `keywords_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleCopy = () => {
    if (keywords.length === 0) return;
    navigator.clipboard.writeText(keywords.map(k => k.word).join(", "));
    alert("Keywords copied to clipboard!");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center text-gray-900">
          Advanced Text Keyword Extractor
        </h1>

        {/* Input Section */}
        <div className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              Enter Text to Analyze:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-32 sm:h-40 resize-y transition-all text-sm sm:text-base"
              placeholder="e.g., The quick brown fox jumps over the lazy dog repeatedly."
              maxLength={10000}
            />
            <div className="text-right text-xs sm:text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm sm:text-base font-medium text-gray-700">Extraction Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm text-gray-600 mb-1">Min Word Length:</label>
                <input
                  type="number"
                  value={options.minWordLength}
                  onChange={(e) => handleOptionChange("minWordLength", parseInt(e.target.value) || 1)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  min="1"
                  max="10"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-gray-600 mb-1">Max Keywords:</label>
                <input
                  type="number"
                  value={options.maxKeywords}
                  onChange={(e) => handleOptionChange("maxKeywords", parseInt(e.target.value) || 1)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  min="1"
                  max="50"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-gray-600 mb-1">Min Frequency:</label>
                <input
                  type="number"
                  value={options.minFrequency}
                  onChange={(e) => handleOptionChange("minFrequency", parseInt(e.target.value) || 1)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  min="1"
                  max="100"
                />
              </div>
              <label className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.ignoreCase}
                  onChange={() => handleOptionChange("ignoreCase", !options.ignoreCase)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <span>Ignore Case</span>
              </label>
              <label className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.removeCommonWords}
                  onChange={() => handleOptionChange("removeCommonWords", !options.removeCommonWords)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <span>Remove Common Words</span>
              </label>
              <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                <label className="block text-xs sm:text-sm text-gray-600 mb-1">Custom Stop Words (comma-separated):</label>
                <input
                  type="text"
                  value={options.customStopWords}
                  onChange={(e) => handleOptionChange("customStopWords", e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  placeholder="e.g., hello, world"
                />
              </div>
              <label className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.includeNGrams}
                  onChange={() => handleOptionChange("includeNGrams", !options.includeNGrams)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <span>Include N-Grams</span>
              </label>
              {options.includeNGrams && (
                <div>
                  <label className="block text-xs sm:text-sm text-gray-600 mb-1">N-Gram Size:</label>
                  <input
                    type="number"
                    value={options.nGramSize}
                    onChange={(e) => handleOptionChange("nGramSize", parseInt(e.target.value) || 2)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    min="2"
                    max="5"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            <button
              onClick={handleExtract}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm sm:text-base disabled:bg-green-400`}
            >
              {isLoading ? "Extracting..." : "Extract Keywords"}
            </button>
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0 || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm sm:text-base disabled:bg-gray-400"
            >
              <FaUndo /> Undo
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1 || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm sm:text-base disabled:bg-gray-400"
            >
              <FaRedo /> Redo
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all text-sm sm:text-base disabled:bg-gray-400"
            >
              <FaTrash /> Reset
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm sm:text-base cursor-pointer">
              <FaUpload /> Import
              <input
                type="file"
                accept=".txt"
                className="hidden"
                onChange={handleImport}
              />
            </label>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 sm:mt-6 p-4 bg-red-50 text-red-700 rounded-lg text-center text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Keywords Display */}
        {keywords.length > 0 && (
          <div className="mt-4 sm:mt-8 p-4 sm:p-6 bg-green-50 rounded-lg">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 text-center">
              Extracted Keywords
            </h2>
            <ul className="mt-3 space-y-2 max-h-60 overflow-auto">
              {keywords.map(({ word, count }, index) => (
                <li key={index} className="flex justify-between items-center text-gray-700 text-sm sm:text-base">
                  <span>{word}</span>
                  <span className="text-xs sm:text-sm text-gray-500">({count} occurrences)</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2 sm:gap-3 justify-center">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all text-sm sm:text-base"
              >
                <FaCopy /> Copy Keywords
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm sm:text-base"
              >
                <FaDownload /> Export Keywords
              </button>
            </div>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-4 sm:mt-6 p-4 bg-green-100 rounded-lg border border-green-300">
          <h3 className="font-semibold text-green-700 text-sm sm:text-base">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-xs sm:text-sm">
            <li>Extract keywords with customizable options</li>
            <li>Support for n-grams and custom stop words</li>
            <li>Undo/redo history (up to 10 steps)</li>
            <li>Import/export text and keywords</li>
            <li>Responsive design for all devices</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextKeywordExtractor;