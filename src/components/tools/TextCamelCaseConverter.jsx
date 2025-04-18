"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaCode,
} from "react-icons/fa";

const TextCamelCaseConverter = () => {
  const [inputText, setInputText] = useState("");
  const [camelText, setCamelText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    removeSpecialChars: true,
    trim: true,
    preserveNumbers: true,
    maxLength: 100,
    separator: "space",        // space, underscore, hyphen, custom
    customSeparator: "",       // User-defined separator
    firstWordCase: "lower",    // lower, upper
  });

  const toCamelCase = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to convert" };
    }

    let separators;
    switch (options.separator) {
      case "underscore":
        separators = /_+|_+\s*/g;
        break;
      case "hyphen":
        separators = /-+|-+\s*/g;
        break;
      case "custom":
        if (!options.customSeparator) {
          // Fallback to space if custom separator is empty
          separators = /\s+/g;
        } else {
          // Escape special regex characters in customSeparator and create the regex
          const escapedSeparator = options.customSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          separators = new RegExp(`${escapedSeparator}+|${escapedSeparator}+\\s*`, "g");
        }
        break;
      default:
        separators = /\s+/g; // space
    }

    let result = text
      .replace(separators, " ")
      .split(/\s+/)
      .filter(Boolean)
      .map((word, index) => {
        let processedWord = word.toLowerCase();
        if (options.removeSpecialChars) {
          processedWord = options.preserveNumbers
            ? processedWord.replace(/[^a-z0-9]/gi, "")
            : processedWord.replace(/[^a-z]/gi, "");
        }
        if (processedWord.length === 0) return "";
        if (index === 0) {
          return options.firstWordCase === "lower"
            ? processedWord
            : processedWord.charAt(0).toUpperCase() + processedWord.slice(1);
        }
        return processedWord.charAt(0).toUpperCase() + processedWord.slice(1);
      })
      .filter(word => word.length > 0)
      .join("");

    if (options.trim) {
      result = result.replace(/^_+|_+$/g, "");
    }

    if (options.maxLength > 0 && result.length > options.maxLength) {
      result = result.substring(0, options.maxLength);
    }

    if (!result) {
      return { error: "Resulting camelCase text is empty after processing" };
    }

    return { original: text, camel: result, changes: getChanges(text, result) };
  };

  const getChanges = (original, camel) => {
    const changes = [];
    if (original === camel) return ["No changes made"];

    const separatorUsed = options.separator === "custom" ? options.customSeparator : options.separator;
    if (original.match(/\s+|-|_/)) {
      changes.push(`Removed ${separatorUsed} separators and combined words`);
    }
    if (original.match(/[A-Z]/) || options.firstWordCase === "upper") {
      changes.push("Adjusted capitalization for camelCase");
    }
    if (options.removeSpecialChars && original.match(/[^a-zA-Z0-9\s-_]/)) {
      changes.push("Removed special characters");
    }
    if (options.trim && (original.startsWith(" ") || original.endsWith(" "))) {
      changes.push("Trimmed leading/trailing spaces");
    }
    if (options.maxLength > 0 && original.length > options.maxLength) {
      changes.push(`Truncated to ${options.maxLength} characters`);
    }
    return changes.length > 0 ? changes : ["Applied camelCase formatting"];
  };

  const handleConvert = useCallback(async () => {
    setError("");
    setCamelText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = toCamelCase(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setCamelText(result.camel);
        setHistory(prev => [...prev, { input: inputText, camel: result.camel, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setCamelText("");
    setError("");
    setOptions({
      removeSpecialChars: true,
      trim: true,
      preserveNumbers: true,
      maxLength: 100,
      separator: "space",
      customSeparator: "",
      firstWordCase: "lower",
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(0, value) : value,
    }));
  };

  const exportCamelText = () => {
    const content = `Original Text:\n${inputText}\n\nCamel Case:\n${camelText}\n\nChanges Applied:\n${toCamelCase(inputText).changes.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `camelCase_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
          Advanced Text Camel Case Converter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Convert:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 h-40 sm:h-48 resize-y transition-all"
              placeholder="e.g., Hello World, snake_case, kebab-case"
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Conversion Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Separator:</label>
                <select
                  value={options.separator}
                  onChange={(e) => handleOptionChange("separator", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="space">Space</option>
                  <option value="underscore">Underscore (_)</option>
                  <option value="hyphen">Hyphen (-)</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              {options.separator === "custom" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Custom Separator:</label>
                  <input
                    type="text"
                    value={options.customSeparator}
                    onChange={(e) => handleOptionChange("customSeparator", e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                    maxLength="5"
                    placeholder="e.g., . or ,"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-600 mb-1">First Word Case:</label>
                <select
                  value={options.firstWordCase}
                  onChange={(e) => handleOptionChange("firstWordCase", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="lower">Lowercase</option>
                  <option value="upper">Uppercase</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Length:</label>
                <input
                  type="number"
                  value={options.maxLength}
                  onChange={(e) => handleOptionChange("maxLength", Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                  min="0"
                  max="500"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.removeSpecialChars}
                    onChange={() => handleOptionChange("removeSpecialChars", !options.removeSpecialChars)}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                  />
                  <span>Remove Special Chars</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.trim}
                    onChange={() => handleOptionChange("trim", !options.trim)}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                  />
                  <span>Trim</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.preserveNumbers}
                    onChange={() => handleOptionChange("preserveNumbers", !options.preserveNumbers)}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                  />
                  <span>Preserve Numbers</span>
                </label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleConvert}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-amber-400 cursor-not-allowed" : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              <FaCode className="inline mr-2" />
              {isLoading ? "Converting..." : "Convert to Camel Case"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {camelText && (
              <button
                onClick={exportCamelText}
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
        {camelText && (
          <div className="mt-8 p-6 bg-amber-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">Camel Case Result</h2>
            <p className="mt-3 text-lg text-gray-700 break-all whitespace-pre-wrap max-h-64 overflow-y-auto">
              {camelText}
            </p>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {toCamelCase(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(camelText)}
              className="mt-4 w-full py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy to Clipboard
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Conversions (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>"{entry.camel.slice(0, 20)}{entry.camel.length > 20 ? "..." : ""}"</span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setCamelText(entry.camel);
                      setOptions(entry.options);
                    }}
                    className="text-amber-500 hover:text-amber-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-amber-100 rounded-lg border border-amber-300">
          <h3 className="font-semibold text-amber-700">Features</h3>
          <ul className="list-disc list-inside text-amber-600 text-sm">
            <li>Customizable separators (space, _, -, or custom)</li>
            <li>First word case option (lower or upper)</li>
            <li>Special character and number handling</li>
            <li>Exportable results with history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextCamelCaseConverter;