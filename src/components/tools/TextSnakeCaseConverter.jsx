"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaLink,
} from "react-icons/fa";

const TextSnakeCaseConverter = () => {
  const [inputText, setInputText] = useState("");
  const [snakeText, setSnakeText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    removeSpecialChars: true,
    trim: true,
    preserveNumbers: true,
    customSeparator: "_",      // Custom separator instead of underscore
    maxLength: 100,
    preserveChars: "",         // Custom chars to preserve (e.g., "@#")
    collapseSeparators: true,  // Collapse multiple separators into one
  });

  const toSnakeCase = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to convert" };
    }

    let result = text;

    // Normalize accented characters to base form
    result = result.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Split by various separators and case changes
    result = result
      .replace(/([A-Z])/g, " $1") // Split camelCase/PascalCase
      .replace(/[-]+/g, " ")      // Replace hyphens with spaces
      .split(/\s+/)
      .filter(Boolean)
      .map(word => word.toLowerCase());

    // Apply special character handling
    if (options.removeSpecialChars) {
      const preserveRegex = options.preserveChars ? `[${options.preserveChars.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}]` : "";
      const allowedChars = options.preserveNumbers ? `a-z0-9${preserveRegex}` : `a-z${preserveRegex}`;
      result = result.map(word => word.replace(new RegExp(`[^${allowedChars}]`, "g"), ""));
    }

    // Join with custom separator
    result = result.filter(word => word.length > 0).join(options.customSeparator);

    // Collapse multiple separators if enabled
    if (options.collapseSeparators) {
      result = result.replace(new RegExp(`${options.customSeparator}+`, "g"), options.customSeparator);
    }

    // Trim leading/trailing separators
    if (options.trim) {
      result = result.replace(new RegExp(`^${options.customSeparator}+|${options.customSeparator}+$`, "g"), "");
    }

    // Enforce max length
    if (options.maxLength > 0 && result.length > options.maxLength) {
      result = result.substring(0, options.maxLength).replace(new RegExp(`${options.customSeparator}$`), "");
    }

    if (!result) {
      return { error: "Resulting snake_case text is empty after processing" };
    }

    return { original: text, snake: result, changes: getChanges(text, result) };
  };

  const getChanges = (original, snake) => {
    const changes = [];
    if (original === snake) return ["No changes made"];

    if (original.match(/[A-Z]/)) changes.push("Converted uppercase to lowercase");
    if (original.match(/\s+|-/)) changes.push(`Replaced separators with "${options.customSeparator}"`);
    if (options.removeSpecialChars && original.match(/[^a-zA-Z0-9\s-]/)) {
      changes.push(`Removed special characters${options.preserveChars ? ` (preserved: ${options.preserveChars})` : ""}`);
    }
    if (!options.preserveNumbers && original.match(/[0-9]/)) changes.push("Removed numbers");
    if (options.trim && (original.startsWith(" ") || original.endsWith(" "))) changes.push("Trimmed leading/trailing spaces");
    if (options.maxLength > 0 && original.length > options.maxLength) changes.push(`Truncated to ${options.maxLength} characters`);
    if (options.collapseSeparators && original.match(/[-_\s]{2,}/)) changes.push("Collapsed multiple separators");
    return changes.length > 0 ? changes : ["Applied snake_case formatting"];
  };

  const handleConvert = useCallback(async () => {
    setError("");
    setSnakeText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = toSnakeCase(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setSnakeText(result.snake);
        setHistory(prev => [...prev, { input: inputText, snake: result.snake, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setSnakeText("");
    setError("");
    setOptions({
      removeSpecialChars: true,
      trim: true,
      preserveNumbers: true,
      customSeparator: "_",
      maxLength: 100,
      preserveChars: "",
      collapseSeparators: true,
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(0, value) : value,
    }));
  };

  const exportSnakeText = () => {
    const content = `Original Text:\n${inputText}\n\nSnake Case:\n${snakeText}\n\nChanges Applied:\n${toSnakeCase(inputText).changes.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `snake_case_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
          Advanced Text Snake Case Converter
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-40 sm:h-48 resize-y transition-all"
              placeholder="e.g., Hello World, camelCase, kebab-case, @test#123"
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
                <label className="block text-sm text-gray-600 mb-1">Custom Separator:</label>
                <input
                  type="text"
                  value={options.customSeparator}
                  onChange={(e) => handleOptionChange("customSeparator", e.target.value || "_")}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  maxLength="5"
                  placeholder="e.g., _ or -"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Length:</label>
                <input
                  type="number"
                  value={options.maxLength}
                  onChange={(e) => handleOptionChange("maxLength", Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  max="500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Preserve Characters:</label>
                <input
                  type="text"
                  value={options.preserveChars}
                  onChange={(e) => handleOptionChange("preserveChars", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., @#"
                  maxLength="10"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.removeSpecialChars}
                    onChange={() => handleOptionChange("removeSpecialChars", !options.removeSpecialChars)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Remove Special Chars</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.trim}
                    onChange={() => handleOptionChange("trim", !options.trim)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Trim</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.preserveNumbers}
                    onChange={() => handleOptionChange("preserveNumbers", !options.preserveNumbers)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Preserve Numbers</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.collapseSeparators}
                    onChange={() => handleOptionChange("collapseSeparators", !options.collapseSeparators)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Collapse Separators</span>
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
                isLoading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              <FaLink className="inline mr-2" />
              {isLoading ? "Converting..." : "Convert to Snake Case"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {snakeText && (
              <button
                onClick={exportSnakeText}
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
        {snakeText && (
          <div className="mt-8 p-6 bg-indigo-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">Snake Case Result</h2>
            <p className="mt-3 text-lg text-gray-700 break-all whitespace-pre-wrap max-h-64 overflow-y-auto">
              {snakeText}
            </p>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {toSnakeCase(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(snakeText)}
              className="mt-4 w-full py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all font-semibold"
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
                  <span>"{entry.snake.slice(0, 20)}{entry.snake.length > 20 ? "..." : ""}"</span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setSnakeText(entry.snake);
                      setOptions(entry.options);
                    }}
                    className="text-indigo-500 hover:text-indigo-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-indigo-100 rounded-lg border border-indigo-300">
          <h3 className="font-semibold text-indigo-700">Features</h3>
          <ul className="list-disc list-inside text-indigo-600 text-sm">
            <li>Customizable separator and preserved characters</li>
            <li>Flexible special char and number handling</li>
            <li>Collapsible separators and max length control</li>
            <li>Exportable results with history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextSnakeCaseConverter;