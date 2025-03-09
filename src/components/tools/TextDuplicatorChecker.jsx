"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaFileExport,
  FaCog,
  FaEye,
  FaEyeSlash,
  FaSearch,
  FaHistory,
  FaUndo,
} from "react-icons/fa";

const findDuplicates = (text, options = {}) => {
  const {
    caseSensitive = false,
    ignoreWords = new Set(),
    minWordLength = 1,
    customRegex = null,
    ignoreNumbers = false,
  } = options;

  const normalizedText = caseSensitive ? text : text.toLowerCase();
  const wordRegex = customRegex || (ignoreNumbers ? /\b[a-zA-Z]+\b/g : /\b\w+\b/g);
  const words = normalizedText.match(wordRegex) || [];
  const sentences = normalizedText.match(/[^.!?]+[.!?]+|\S+$/g) || [];
  const characters = text.replace(/\s+/g, "").length;

  const wordMap = {};
  const sentenceMap = {};

  const filteredWords = words.filter(
    (word) => word.length >= minWordLength && !ignoreWords.has(word)
  );

  filteredWords.forEach((word) => {
    wordMap[word] = (wordMap[word] || 0) + 1;
  });

  sentences.forEach((sentence) => {
    const trimmedSentence = sentence.trim();
    sentenceMap[trimmedSentence] = (sentenceMap[trimmedSentence] || 0) + 1;
  });

  const duplicateWords = Object.entries(wordMap).filter(([_, count]) => count > 1);
  const duplicateSentences = Object.entries(sentenceMap).filter(([_, count]) => count > 1);
  const frequentWords = Object.entries(wordMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const uniqueWords = new Set(filteredWords).size;
  const avgWordLength =
    filteredWords.reduce((sum, word) => sum + word.length, 0) /
    (filteredWords.length || 1);

  return {
    duplicateWords,
    duplicateSentences,
    wordCount: filteredWords.length,
    sentenceCount: sentences.length,
    characterCount: characters,
    frequentWords,
    uniqueWords,
    avgWordLength: avgWordLength.toFixed(2),
  };
};

const calculateReadingTime = (wordCount) => {
  const wordsPerMinute = 200;
  return (wordCount / wordsPerMinute).toFixed(2);
};

const TextDuplicatorChecker = () => {
  const [text, setText] = useState("");
  const [stats, setStats] = useState({
    duplicateWords: [],
    duplicateSentences: [],
    wordCount: 0,
    sentenceCount: 0,
    characterCount: 0,
    frequentWords: [],
    uniqueWords: 0,
    avgWordLength: "0.00",
  });
  const [options, setOptions] = useState({
    caseSensitive: false,
    ignoreWords: new Set(),
    minWordLength: 1,
    showDetailedStats: false,
    customRegex: null,
    ignoreNumbers: false,
    highlightDuplicates: false,
  });
  const [ignoreInput, setIgnoreInput] = useState("");
  const [exportFormat, setExportFormat] = useState("txt");
  const [regexInput, setRegexInput] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const newStats = findDuplicates(text, options);
    setStats(newStats);
  }, [text, options]);

  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const addIgnoreWord = () => {
    if (ignoreInput.trim()) {
      setOptions((prev) => ({
        ...prev,
        ignoreWords: new Set(prev.ignoreWords).add(ignoreInput.trim().toLowerCase()),
      }));
      setIgnoreInput("");
    }
  };

  const removeIgnoreWord = (word) => {
    setOptions((prev) => {
      const newSet = new Set(prev.ignoreWords);
      newSet.delete(word);
      return { ...prev, ignoreWords: newSet };
    });
  };

  const handleRegexChange = () => {
    try {
      if (regexInput.trim()) {
        const regex = new RegExp(regexInput, "g");
        setOptions((prev) => ({ ...prev, customRegex: regex }));
      } else {
        setOptions((prev) => ({ ...prev, customRegex: null }));
      }
    } catch (err) {
      alert("Invalid regex pattern");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    alert("Text copied to clipboard!");
  };

  const clearText = () => {
    setText("");
    setStats({
      duplicateWords: [],
      duplicateSentences: [],
      wordCount: 0,
      sentenceCount: 0,
      characterCount: 0,
      frequentWords: [],
      uniqueWords: 0,
      avgWordLength: "0.00",
    });
    setHistory(prev => [...prev, { text, stats, options: { ...options, ignoreWords: Array.from(options.ignoreWords) } }].slice(-5));
  };

  const exportFile = useCallback(() => {
    let exportContent = "";
    const filename = `text_analysis_${Date.now()}.${exportFormat}`;

    if (exportFormat === "txt") {
      exportContent = [
        "Text Content:",
        text,
        "",
        "Analysis:",
        `Word Count: ${stats.wordCount}`,
        `Sentence Count: ${stats.sentenceCount}`,
        `Character Count (excluding spaces): ${stats.characterCount}`,
        `Unique Words: ${stats.uniqueWords}`,
        `Average Word Length: ${stats.avgWordLength}`,
        `Reading Time: ${calculateReadingTime(stats.wordCount)} min`,
        "",
        stats.frequentWords.length > 0 && "Top 5 Frequent Words:",
        ...(stats.frequentWords.map(([word, count]) => ` "${word}": ${count} times`) || []),
        "",
        stats.duplicateWords.length > 0 && "Duplicate Words:",
        ...(stats.duplicateWords.map(([word, count]) => ` "${word}": ${count} times`) || []),
        "",
        stats.duplicateSentences.length > 0 && "Duplicate Sentences:",
        ...(stats.duplicateSentences.map(([sentence, count]) => ` "${sentence}": ${count} times`) || []),
      ]
        .filter(Boolean)
        .join("\n");
    } else if (exportFormat === "json") {
      exportContent = JSON.stringify(
        { text, stats, options: { ...options, ignoreWords: Array.from(options.ignoreWords) } },
        null,
        2
      );
    } else if (exportFormat === "csv") {
      exportContent = [
        "Type,Item,Count",
        ...stats.duplicateWords.map(([word, count]) => `Word,"${word}",${count}`),
        ...stats.duplicateSentences.map(([sentence, count]) => `Sentence,"${sentence}",${count}`),
      ].join("\n");
    }

    const blob = new Blob([exportContent], {
      type: exportFormat === "txt" ? "text/plain" : exportFormat === "json" ? "application/json" : "text/csv",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [text, stats, options, exportFormat]);

  const highlightText = () => {
    if (!options.highlightDuplicates) return text;
    let highlighted = text;
    stats.duplicateWords.forEach(([word]) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      highlighted = highlighted.replace(regex, `<span class="bg-yellow-200">$&</span>`);
    });
    stats.duplicateSentences.forEach(([sentence]) => {
      const regex = new RegExp(sentence.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "gi");
      highlighted = highlighted.replace(regex, `<span class="bg-red-200">$&</span>`);
    });
    return highlighted;
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full">
        <div className="flex justify-between items-center mb-6">        
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
        Advanced Text Duplication Analyzer</h1>
          <button
            onClick={() => handleOptionChange("showDetailedStats", !options.showDetailedStats)}
            className="p-2 text-blue-500 hover:text-blue-700"
          >
            <FaCog />
          </button>
        </div>

        {/* Options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <label className="block text-gray-700 font-medium mb-2">Analysis Options:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.caseSensitive}
                  onChange={(e) => handleOptionChange("caseSensitive", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Case Sensitive</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.ignoreNumbers}
                  onChange={(e) => handleOptionChange("ignoreNumbers", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Ignore Numbers</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.highlightDuplicates}
                  onChange={(e) => handleOptionChange("highlightDuplicates", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Highlight Duplicates</span>
              </label>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  value={options.minWordLength}
                  onChange={(e) => handleOptionChange("minWordLength", Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Min Word Length</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={regexInput}
                  onChange={(e) => setRegexInput(e.target.value)}
                  placeholder="Custom Regex (e.g., [a-z]+)"
                  className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleRegexChange}
                  className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <FaSearch />
                </button>
              </div>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={ignoreInput}
                  onChange={(e) => setIgnoreInput(e.target.value)}
                  placeholder="Add word to ignore..."
                  className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addIgnoreWord}
                  className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
              {options.ignoreWords.size > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {Array.from(options.ignoreWords).map((word) => (
                    <span
                      key={word}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-200 rounded text-sm"
                    >
                      {word}
                      <FaEyeSlash
                        className="cursor-pointer text-red-500 hover:text-red-700"
                        onClick={() => removeIgnoreWord(word)}
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Textarea */}
        <div className="mb-6">
          <textarea
            className="w-full h-48 sm:h-64 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            placeholder="Type or paste text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {options.highlightDuplicates && (
            <div
              className="w-full h-48 sm:h-64 p-4 border rounded-lg bg-gray-50 overflow-y-auto mt-2"
              dangerouslySetInnerHTML={{ __html: highlightText() }}
            />
          )}
          <div className="text-right text-sm text-gray-500 mt-1">
            {text.length}/10000 characters
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            className="flex-1 py-3 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition flex items-center justify-center"
            onClick={copyToClipboard}
          >
            <FaCopy className="mr-2" /> Copy
          </button>
          <button
            className="flex-1 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition flex items-center justify-center"
            onClick={clearText}
          >
            <FaTrash className="mr-2" /> Clear
          </button>
          <div className="flex-1 flex gap-2">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="txt">Text (.txt)</option>
              <option value="json">JSON (.json)</option>
              <option value="csv">CSV (.csv)</option>
            </select>
            <button
              className="flex-1 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition flex items-center justify-center"
              onClick={exportFile}
            >
              <FaFileExport className="mr-2" /> Export
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-6 p-4 border rounded-lg bg-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p>📌 Word Count: <strong>{stats.wordCount}</strong></p>
            <p>📌 Sentence Count: <strong>{stats.sentenceCount}</strong></p>
            <p>📌 Character Count (no spaces): <strong>{stats.characterCount}</strong></p>
            {options.showDetailedStats && (
              <>
                <p>📌 Unique Words: <strong>{stats.uniqueWords}</strong></p>
                <p>📌 Avg Word Length: <strong>{stats.avgWordLength}</strong></p>
              </>
            )}
            <p>📖 Reading Time: <strong>{calculateReadingTime(stats.wordCount)} min</strong></p>
          </div>
          {stats.frequentWords.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700">Top 5 Frequent Words:</h3>
              <ul className="list-disc ml-5 text-gray-600">
                {stats.frequentWords.map(([word, count], index) => (
                  <li key={index}>
                    "{word}": <strong>{count}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Duplicates */}
        {stats.duplicateWords.length > 0 && (
          <div className="mb-6 p-4 border rounded-lg bg-red-100">
            <h3 className="font-semibold text-red-700">Duplicate Words:</h3>
            <ul className="list-disc ml-5 text-gray-700">
              {stats.duplicateWords.map(([word, count], index) => (
                <li key={index}>
                  "{word}": <strong>{count}</strong> times
                  {options.showDetailedStats && (
                    <button
                      className="ml-2 text-blue-500 hover:text-blue-700"
                      onClick={() => removeIgnoreWord(word)}
                    >
                      <FaEyeSlash className="inline" /> Ignore
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {stats.duplicateSentences.length > 0 && (
          <div className="mb-6 p-4 border rounded-lg bg-orange-100">
            <h3 className="font-semibold text-orange-700">Duplicate Sentences:</h3>
            <ul className="list-disc ml-5 text-gray-700">
              {stats.duplicateSentences.map(([sentence, count], index) => (
                <li key={index}>
                  "{sentence}": <strong>{count}</strong> times
                </li>
              ))}
            </ul>
          </div>
        )}

        {stats.duplicateWords.length === 0 && stats.duplicateSentences.length === 0 && text && (
          <div className="mb-6 p-4 border rounded-lg bg-green-100 text-green-700">
            ✅ No duplicates found!
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Analyses (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>"{entry.text.slice(0, 20)}..."</span>
                  <button
                    onClick={() => {
                      setText(entry.text);
                      setStats(entry.stats);
                      setOptions(entry.options);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Real-time duplicate detection with highlighting</li>
            <li>Custom regex and ignore options (words/numbers)</li>
            <li>Detailed stats toggle and history tracking</li>
            <li>Export as TXT, JSON, or CSV</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextDuplicatorChecker;