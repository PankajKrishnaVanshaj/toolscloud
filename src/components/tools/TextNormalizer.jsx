"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaCompress,
} from "react-icons/fa";

const TextNormalizer = () => {
  const [inputText, setInputText] = useState("");
  const [normalizedText, setNormalizedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    case: "none",
    normalizeSpaces: true,
    trim: true,
    removeSpecialChars: false,
    normalizeUnicode: false,
    removePunctuation: false,   // Remove punctuation marks
    normalizeQuotes: false,     // Standardize quotes to single/double
    removeNumbers: false,       // Remove all numbers
    customReplace: "",          // Custom string to replace
    customReplaceWith: "",      // Replacement for custom string
  });

  const normalizeText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to normalize" };
    }

    let result = text;

    // Custom replacement first (if specified)
    if (options.customReplace) {
      const regex = new RegExp(options.customReplace, "g");
      result = result.replace(regex, options.customReplaceWith || "");
    }

    // Normalize Unicode
    if (options.normalizeUnicode) {
      result = result.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    }

    // Case conversion
    switch (options.case) {
      case "lower":
        result = result.toLowerCase();
        break;
      case "upper":
        result = result.toUpperCase();
        break;
      case "title":
        result = result.replace(/\b\w/g, char => char.toUpperCase());
        break;
      case "sentence":
        result = result.replace(/(^\s*\w|[\.\!\?]\s*\w)/g, char => char.toUpperCase());
        break;
      default:
        break;
    }

    // Normalize quotes
    if (options.normalizeQuotes) {
      result = result.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
    }

    // Remove numbers
    if (options.removeNumbers) {
      result = result.replace(/\d+/g, "");
    }

    // Remove special characters
    if (options.removeSpecialChars) {
      result = result.replace(/[^a-zA-Z0-9\s]/g, "");
    } else if (options.removePunctuation) {
      result = result.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    }

    // Normalize spaces
    if (options.normalizeSpaces) {
      result = result.replace(/\s+/g, " ").replace(/\n+/g, "\n");
    }

    // Trim
    if (options.trim) {
      result = result.trim();
    }

    return {
      original: text,
      normalized: result,
      changes: getChanges(text, result),
    };
  };

  const getChanges = (original, normalized) => {
    const changes = [];
    if (original === normalized) return ["No changes made"];

    if (options.customReplace && original.includes(options.customReplace)) {
      changes.push(`Replaced "${options.customReplace}" with "${options.customReplaceWith}"`);
    }
    if (options.normalizeUnicode && original.match(/[\u00C0-\u017F]/)) {
      changes.push("Normalized Unicode characters");
    }
    if (options.case !== "none") {
      changes.push(`Converted case to ${options.case}`);
    }
    if (options.normalizeQuotes && original.match(/[‘’“”]/)) {
      changes.push("Normalized quotes");
    }
    if (options.removeNumbers && original.match(/\d/)) {
      changes.push("Removed numbers");
    }
    if (options.removeSpecialChars && original.match(/[^a-zA-Z0-9\s]/)) {
      changes.push("Removed special characters");
    } else if (options.removePunctuation && original.match(/[.,\/#!$%\^&\*;:{}=\-_`~()]/)) {
      changes.push("Removed punctuation");
    }
    if (options.normalizeSpaces && original.match(/\s{2,}|\n{2,}/)) {
      changes.push("Normalized multiple spaces and newlines");
    }
    if (options.trim && (original.startsWith(" ") || original.endsWith(" ") || original.startsWith("\n") || original.endsWith("\n"))) {
      changes.push("Trimmed leading/trailing spaces");
    }
    return changes.length > 0 ? changes : ["Applied basic normalization"];
  };

  const handleNormalize = useCallback(async () => {
    setError("");
    setNormalizedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = normalizeText(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setNormalizedText(result.normalized);
        setHistory(prev => [...prev, { input: inputText, output: result.normalized, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred while normalizing");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setNormalizedText("");
    setError("");
    setOptions({
      case: "none",
      normalizeSpaces: true,
      trim: true,
      removeSpecialChars: false,
      normalizeUnicode: false,
      removePunctuation: false,
      normalizeQuotes: false,
      removeNumbers: false,
      customReplace: "",
      customReplaceWith: "",
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  const exportNormalizedText = () => {
    const content = `Original Text:\n${inputText}\n\nNormalized Text:\n${normalizedText}\n\nChanges Applied:\n${normalizeText(inputText).changes.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `normalized_text_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full ">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Advanced Text Normalizer
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Normalize:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 h-48 resize-y transition-all"
              placeholder="e.g.,  Héllo   Wôrld! 123 “test”\n\n  Te$t  "
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Normalization Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Case:</label>
                <select
                  value={options.case}
                  onChange={(e) => handleOptionChange("case", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="none">Keep Original</option>
                  <option value="lower">Lowercase</option>
                  <option value="upper">Uppercase</option>
                  <option value="title">Title Case</option>
                  <option value="sentence">Sentence Case</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Custom Replace:</label>
                <input
                  type="text"
                  value={options.customReplace}
                  onChange={(e) => handleOptionChange("customReplace", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Text to replace"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Replace With:</label>
                <input
                  type="text"
                  value={options.customReplaceWith}
                  onChange={(e) => handleOptionChange("customReplaceWith", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Replacement text"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.normalizeSpaces}
                    onChange={() => handleOptionChange("normalizeSpaces", !options.normalizeSpaces)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Normalize Spaces</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.trim}
                    onChange={() => handleOptionChange("trim", !options.trim)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Trim</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.removeSpecialChars}
                    onChange={() => handleOptionChange("removeSpecialChars", !options.removeSpecialChars)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Remove Special Chars</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.removePunctuation}
                    onChange={() => handleOptionChange("removePunctuation", !options.removePunctuation)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Remove Punctuation</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.normalizeUnicode}
                    onChange={() => handleOptionChange("normalizeUnicode", !options.normalizeUnicode)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Normalize Unicode</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.normalizeQuotes}
                    onChange={() => handleOptionChange("normalizeQuotes", !options.normalizeQuotes)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Normalize Quotes</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.removeNumbers}
                    onChange={() => handleOptionChange("removeNumbers", !options.removeNumbers)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Remove Numbers</span>
                </label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleNormalize}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-teal-400 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700"
              }`}
            >
              <FaCompress className="inline mr-2" />
              {isLoading ? "Normalizing..." : "Normalize Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {normalizedText && (
              <button
                onClick={exportNormalizedText}
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
        {normalizedText && (
          <div className="mt-8 p-6 bg-teal-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Normalized Text
            </h2>
            <p className="mt-3 text-lg text-gray-700 break-words whitespace-pre-wrap max-h-64 overflow-auto">
              {normalizedText}
            </p>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {normalizeText(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(normalizedText)}
              className="mt-4 w-full py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy Normalized Text
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Normalizations (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    "{entry.output.slice(0, 30)}{entry.output.length > 30 ? "..." : ""}"
                  </span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setNormalizedText(entry.output);
                      setOptions(entry.options);
                    }}
                    className="text-teal-500 hover:text-teal-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-teal-100 rounded-lg border border-teal-300">
          <h3 className="font-semibold text-teal-700">Features</h3>
          <ul className="list-disc list-inside text-teal-600 text-sm">
            <li>Multiple case options (lower, upper, title, sentence)</li>
            <li>Space, Unicode, quote, and punctuation normalization</li>
            <li>Custom text replacement</li>
            <li>Remove numbers and special characters</li>
            <li>Export results and history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextNormalizer;