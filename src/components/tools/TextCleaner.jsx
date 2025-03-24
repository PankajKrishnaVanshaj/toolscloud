"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaBroom,
} from "react-icons/fa";

const TextCleaner = () => {
  const [inputText, setInputText] = useState("");
  const [cleanedText, setCleanedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    removeExtraSpaces: true,
    removeSpecialChars: false,
    preserveChars: "",         // Characters to preserve despite removal
    removeHTML: false,
    removeNumbers: false,
    trim: true,
    customRegex: "",
    convertCase: "none",       // none, lower, upper
    removeEmptyLines: false,   // Remove empty lines
  });

  const cleanText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to clean" };
    }

    let result = text;
    let changes = [];

    // Remove HTML tags
    if (options.removeHTML) {
      const original = result;
      result = result.replace(/<[^>]*>/g, "");
      if (original !== result) changes.push("Removed HTML tags");
    }

    // Apply custom regex
    if (options.customRegex) {
      try {
        const regex = new RegExp(options.customRegex, "g");
        const original = result;
        result = result.replace(regex, "");
        if (original !== result) changes.push(`Applied custom regex: "${options.customRegex}"`);
      } catch (err) {
        return { error: "Invalid custom regex pattern" };
      }
    }

    // Remove special characters with preservation
    if (options.removeSpecialChars) {
      const preservePattern = options.preserveChars ? `[${options.preserveChars.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}]` : "";
      const original = result;
      result = result.replace(new RegExp(`[^a-zA-Z0-9\\s.,!?${preservePattern}]`, "g"), "");
      if (original !== result) changes.push(`Removed special characters (preserved: "${options.preserveChars}")`);
    }

    // Remove numbers
    if (options.removeNumbers) {
      const original = result;
      result = result.replace(/\d+/g, "");
      if (original !== result) changes.push("Removed numbers");
    }

    // Convert case
    switch (options.convertCase) {
      case "lower":
        const origLower = result;
        result = result.toLowerCase();
        if (origLower !== result) changes.push("Converted to lowercase");
        break;
      case "upper":
        const origUpper = result;
        result = result.toUpperCase();
        if (origUpper !== result) changes.push("Converted to uppercase");
        break;
      default:
        break;
    }

    // Normalize extra spaces and remove empty lines
    if (options.removeExtraSpaces || options.removeEmptyLines) {
      const original = result;
      let lines = result.split("\n");
      if (options.removeEmptyLines) {
        lines = lines.filter(line => line.trim());
        if (lines.length < original.split("\n").length) changes.push("Removed empty lines");
      }
      if (options.removeExtraSpaces) {
        lines = lines.map(line => line.replace(/\s+/g, " ").trim());
        result = lines.join("\n");
        if (original.match(/\s{2,}|\n{2,}/)) changes.push("Removed extra spaces");
      } else {
        result = lines.join("\n");
      }
    }

    // Trim
    if (options.trim) {
      const original = result;
      result = result.trim();
      if (original !== result) changes.push("Trimmed leading/trailing spaces");
    }

    return {
      original: text,
      cleaned: result,
      changes: changes.length > 0 ? changes : ["No significant changes made"],
    };
  };

  const handleClean = useCallback(async () => {
    setError("");
    setCleanedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = cleanText(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setCleanedText(result.cleaned);
        setHistory(prev => [...prev, { input: inputText, cleaned: result.cleaned, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setCleanedText("");
    setError("");
    setOptions({
      removeExtraSpaces: true,
      removeSpecialChars: false,
      preserveChars: "",
      removeHTML: false,
      removeNumbers: false,
      trim: true,
      customRegex: "",
      convertCase: "none",
      removeEmptyLines: false,
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  const exportText = () => {
    const content = `Original Text:\n${inputText}\n\nCleaned Text:\n${cleanedText}\n\nChanges Applied:\n${cleanText(inputText).changes.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `cleaned_text_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
          Advanced Text Cleaner
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Clean:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-40 sm:h-48 resize-y transition-all"
              placeholder="e.g.,  Hello   <b>World!</b>  @#$  123"
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Cleaning Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.removeExtraSpaces}
                    onChange={() => handleOptionChange("removeExtraSpaces", !options.removeExtraSpaces)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                  />
                  <span>Remove Extra Spaces</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.removeSpecialChars}
                    onChange={() => handleOptionChange("removeSpecialChars", !options.removeSpecialChars)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                  />
                  <span>Remove Special Chars</span>
                </label>
                {options.removeSpecialChars && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Preserve Chars:</label>
                    <input
                      type="text"
                      value={options.preserveChars}
                      onChange={(e) => handleOptionChange("preserveChars", e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., @#"
                      maxLength="20"
                    />
                  </div>
                )}
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.removeHTML}
                    onChange={() => handleOptionChange("removeHTML", !options.removeHTML)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                  />
                  <span>Remove HTML</span>
                </label>
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.removeNumbers}
                    onChange={() => handleOptionChange("removeNumbers", !options.removeNumbers)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                  />
                  <span>Remove Numbers</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.trim}
                    onChange={() => handleOptionChange("trim", !options.trim)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                  />
                  <span>Trim</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.removeEmptyLines}
                    onChange={() => handleOptionChange("removeEmptyLines", !options.removeEmptyLines)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                  />
                  <span>Remove Empty Lines</span>
                </label>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Convert Case:</label>
                  <select
                    value={options.convertCase}
                    onChange={(e) => handleOptionChange("convertCase", e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="none">None</option>
                    <option value="lower">Lowercase</option>
                    <option value="upper">Uppercase</option>
                  </select>
                </div>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Custom Regex:</label>
                <input
                  type="text"
                  value={options.customRegex}
                  onChange={(e) => handleOptionChange("customRegex", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., [aeiou]"
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleClean}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <FaBroom className="inline mr-2" />
              {isLoading ? "Cleaning..." : "Clean Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {cleanedText && (
              <button
                onClick={exportText}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
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
        {cleanedText && (
          <div className="mt-8 p-6 bg-green-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">Cleaned Text</h2>
            <pre className="mt-3 text-lg text-gray-700 whitespace-pre-wrap break-all max-h-64 overflow-y-auto">
              {cleanedText}
            </pre>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {cleanText(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(cleanedText)}
              className="mt-4 w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy Cleaned Text
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Cleanings (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>"{entry.cleaned.slice(0, 20)}{entry.cleaned.length > 20 ? "..." : ""}"</span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setCleanedText(entry.cleaned);
                      setOptions(entry.options);
                    }}
                    className="text-green-500 hover:text-green-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-green-100 rounded-lg border border-green-300">
          <h3 className="font-semibold text-green-700">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm">
            <li>Remove HTML, special chars, numbers, and extra spaces</li>
            <li>Preserve specific characters and custom regex cleaning</li>
            <li>Case conversion and empty line removal</li>
            <li>Exportable results with history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextCleaner;