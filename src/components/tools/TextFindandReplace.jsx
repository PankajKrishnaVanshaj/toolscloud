"use client";

import { useState, useCallback } from "react";
import {
  FaExchangeAlt,
  FaUndo,
  FaTrash,
  FaCopy,
  FaDownload,
  FaHistory,
} from "react-icons/fa";

const TextFindandReplace = () => {
  const [text, setText] = useState("");
  const [findWord, setFindWord] = useState("");
  const [replaceWord, setReplaceWord] = useState("");
  const [prevText, setPrevText] = useState("");
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    caseSensitive: false,
    useRegex: false,
    replaceAll: true,
    replaceLimit: 1, // Only used if replaceAll is false
  });

  // Count occurrences of findWord
  const countOccurrences = () => {
    if (!findWord.trim()) return 0;
    try {
      const regex = options.useRegex
        ? new RegExp(findWord, options.caseSensitive ? "g" : "gi")
        : new RegExp(findWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), options.caseSensitive ? "g" : "gi");
      return (text.match(regex) || []).length;
    } catch (err) {
      return 0; // Invalid regex will return 0 matches
    }
  };

  // Highlight found words
  const getHighlightedText = () => {
    if (!findWord.trim()) return text;
    try {
      const regex = options.useRegex
        ? new RegExp(`(${findWord})`, options.caseSensitive ? "g" : "gi")
        : new RegExp(`(${findWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, options.caseSensitive ? "g" : "gi");
      return text.split(regex).map((part, index) =>
        part.match(regex) ? (
          <span key={index} className="bg-yellow-300 text-black px-1 rounded">
            {part}
          </span>
        ) : (
          part
        )
      );
    } catch (err) {
      return text; // Invalid regex falls back to plain text
    }
  };

  // Handle replace operation
  const handleReplace = useCallback(() => {
    if (!findWord.trim()) return;
    setPrevText(text);
    try {
      const regex = options.useRegex
        ? new RegExp(findWord, options.caseSensitive ? "g" : "gi")
        : new RegExp(findWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), options.caseSensitive ? "g" : "gi");
      let newText = text;
      if (options.replaceAll) {
        newText = text.replace(regex, replaceWord);
      } else {
        let count = 0;
        newText = text.replace(regex, (match) => {
          count++;
          return count <= options.replaceLimit ? replaceWord : match;
        });
      }
      setText(newText);
      setHistory(prev => [...prev, { text: text, find: findWord, replace: replaceWord, options }].slice(-5));
    } catch (err) {
      console.error("Replace failed:", err);
    }
  }, [text, findWord, replaceWord, options]);

  // Clear all fields
  const handleClearAll = () => {
    setText("");
    setFindWord("");
    setReplaceWord("");
    setPrevText("");
  };

  // Undo last replace
  const handleUndo = () => {
    if (prevText) setText(prevText);
  };

  // Copy result to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  // Export result
  const exportResult = () => {
    const content = `Original Text:\n${prevText || text}\n\nModified Text:\n${text}\n\nFind: ${findWord}\nReplace: ${replaceWord}\nOptions: ${JSON.stringify(options, null, 2)}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `text_replace_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="mx-auto w-full  bg-white shadow-lg rounded-2xl p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center text-gray-900">
          Advanced Text Find & Replace
        </h1>

        {/* Textarea */}
        <textarea
          className="w-full h-32 sm:h-40 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          placeholder="Enter your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>

        {/* Find & Replace Fields */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 my-4">
          <input
            type="text"
            placeholder="Find word or regex..."
            className="w-full sm:flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            value={findWord}
            onChange={(e) => setFindWord(e.target.value)}
          />
          <input
            type="text"
            placeholder="Replace with..."
            className="w-full sm:flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            value={replaceWord}
            onChange={(e) => setReplaceWord(e.target.value)}
          />
        </div>

        {/* Options */}
        <div className="p-3 bg-gray-50 rounded-lg space-y-2">
          <p className="text-sm font-medium text-gray-700">Options:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={options.caseSensitive}
                onChange={() => setOptions(prev => ({ ...prev, caseSensitive: !prev.caseSensitive }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span>Case Sensitive</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={options.useRegex}
                onChange={() => setOptions(prev => ({ ...prev, useRegex: !prev.useRegex }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span>Use Regular Expression</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={options.replaceAll}
                onChange={() => setOptions(prev => ({ ...prev, replaceAll: !prev.replaceAll }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span>Replace All</span>
            </label>
            {!options.replaceAll && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Replace Limit:</label>
                <input
                  type="number"
                  value={options.replaceLimit}
                  onChange={(e) => setOptions(prev => ({ ...prev, replaceLimit: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  min="1"
                />
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
          <button
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center justify-center text-sm sm:text-base"
            onClick={handleReplace}
          >
            <FaExchangeAlt className="mr-2" /> Replace
          </button>
          <button
            className="flex-1 px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition flex items-center justify-center text-sm sm:text-base"
            onClick={handleUndo}
            disabled={!prevText}
          >
            <FaUndo className="mr-2" /> Undo
          </button>
          <button
            className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition flex items-center justify-center text-sm sm:text-base"
            onClick={handleClearAll}
          >
            <FaTrash className="mr-2" /> Clear All
          </button>
          {text && (
            <button
              className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition flex items-center justify-center text-sm sm:text-base"
              onClick={exportResult}
            >
              <FaDownload className="mr-2" /> Export
            </button>
          )}
          {text && (
            <button
              className="flex-1 px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition flex items-center justify-center text-sm sm:text-base"
              onClick={handleCopy}
            >
              <FaCopy className="mr-2" /> Copy
            </button>
          )}
        </div>

        {/* Stats */}
        <p className="mt-4 text-xs sm:text-sm text-gray-600">
          ✏️ Word Count: {text.split(/\s+/).filter(Boolean).length} | 🔍 Matches: {countOccurrences()}
        </p>

        {/* Highlighted Text */}
        <div className="mt-4 p-3 bg-gray-100 border rounded-lg break-words max-h-64 overflow-auto text-sm sm:text-base">
          {getHighlightedText()}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center text-sm sm:text-base">
              <FaHistory className="mr-2" /> Recent Replacements (Last 5)
            </h3>
            <ul className="mt-2 text-xs sm:text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>
                      Find: "{entry.find}" → Replace: "{entry.replace}"
                    </span>
                    <button
                      onClick={() => {
                        setText(entry.text);
                        setFindWord(entry.find);
                        setReplaceWord(entry.replace);
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
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700 text-sm sm:text-base">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-xs sm:text-sm">
            <li>Find and replace with case sensitivity</li>
            <li>Regular expression support</li>
            <li>Replace all or limit replacements</li>
            <li>Undo, copy, and export functionality</li>
            <li>History tracking of last 5 operations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextFindandReplace;