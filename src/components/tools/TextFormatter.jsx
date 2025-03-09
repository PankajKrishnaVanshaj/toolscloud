"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaTextHeight,
} from "react-icons/fa";

const TextFormatter = () => {
  const [inputText, setInputText] = useState("");
  const [formattedText, setFormattedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    caseStyle: "none",         // none, lower, upper, title, sentence
    wrapLines: false,
    prefix: "",
    suffix: "",
    align: "left",             // left, right, center, justify
    width: 20,
    trim: true,
    replaceRegex: "",          // Custom regex for replacement
    replaceWith: "",           // Replacement string
    removeDuplicates: false,   // Remove duplicate lines
    sortLines: false,          // Sort lines alphabetically
  });

  const formatText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to format" };
    }

    let result = text;
    let changes = [];

    // Apply regex replacement
    if (options.replaceRegex) {
      try {
        const regex = new RegExp(options.replaceRegex, "g");
        const original = result;
        result = result.replace(regex, options.replaceWith);
        if (original !== result) changes.push(`Applied regex replacement: "${options.replaceRegex}" -> "${options.replaceWith}"`);
      } catch (err) {
        return { error: "Invalid regex pattern" };
      }
    }

    // Apply case style
    switch (options.caseStyle) {
      case "lower":
        result = result.toLowerCase();
        changes.push("Converted to lowercase");
        break;
      case "upper":
        result = result.toUpperCase();
        changes.push("Converted to uppercase");
        break;
      case "title":
        result = result.replace(/\b\w/g, char => char.toUpperCase());
        changes.push("Converted to title case");
        break;
      case "sentence":
        result = result.replace(/(^\s*\w|[.!?]\s+\w)/g, char => char.toUpperCase());
        changes.push("Converted to sentence case");
        break;
      default:
        break;
    }

    // Split into lines
    let lines = result.split("\n");

    // Trim lines
    if (options.trim) {
      const originalLines = [...lines];
      lines = lines.map(line => line.trim());
      if (lines.some((line, i) => line !== originalLines[i])) changes.push("Trimmed whitespace");
    }

    // Remove duplicates
    if (options.removeDuplicates) {
      const uniqueLines = [...new Set(lines)];
      if (uniqueLines.length < lines.length) {
        lines = uniqueLines;
        changes.push("Removed duplicate lines");
      }
    }

    // Sort lines
    if (options.sortLines) {
      const sortedLines = [...lines].sort();
      if (sortedLines.join("\n") !== lines.join("\n")) {
        lines = sortedLines;
        changes.push("Sorted lines alphabetically");
      }
    }

    // Apply wrapping and alignment
    lines = lines.map(line => {
      let formattedLine = line;

      // Apply alignment with fixed width
      if (options.width > 0 && formattedLine.length < options.width) {
        const padding = " ".repeat(options.width - formattedLine.length);
        switch (options.align) {
          case "left":
            formattedLine = formattedLine + padding;
            break;
          case "right":
            formattedLine = padding + formattedLine;
            break;
          case "center":
            const leftPadding = " ".repeat(Math.floor((options.width - formattedLine.length) / 2));
            const rightPadding = " ".repeat(options.width - formattedLine.length - leftPadding.length);
            formattedLine = leftPadding + formattedLine + rightPadding;
            break;
          case "justify":
            // Simple justification: distribute spaces (not perfect for single lines)
            formattedLine = formattedLine.padEnd(options.width, " ");
            break;
          default:
            break;
        }
      }

      // Apply wrapping
      if (options.wrapLines && (options.prefix || options.suffix)) {
        formattedLine = `${options.prefix}${formattedLine}${options.suffix}`;
      }

      return formattedLine;
    });

    result = lines.join("\n");

    return {
      original: text,
      formatted: result,
      changes: changes.length > 0 ? changes : ["No significant changes made"],
    };
  };

  const handleFormat = useCallback(async () => {
    setError("");
    setFormattedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = formatText(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setFormattedText(result.formatted);
        setHistory(prev => [...prev, { input: inputText, formatted: result.formatted, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setFormattedText("");
    setError("");
    setOptions({
      caseStyle: "none",
      wrapLines: false,
      prefix: "",
      suffix: "",
      align: "left",
      width: 20,
      trim: true,
      replaceRegex: "",
      replaceWith: "",
      removeDuplicates: false,
      sortLines: false,
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(0, value) : value,
    }));
  };

  const exportText = () => {
    const content = `Original Text:\n${inputText}\n\nFormatted Text:\n${formattedText}\n\nChanges Applied:\n${formatText(inputText).changes.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `formatted_text_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
          Advanced Text Formatter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Format:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-40 sm:h-48 resize-y transition-all"
              placeholder="e.g., hello world\nthis is a test"
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Formatting Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Case Style:</label>
                <select
                  value={options.caseStyle}
                  onChange={(e) => handleOptionChange("caseStyle", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="none">None</option>
                  <option value="lower">Lowercase</option>
                  <option value="upper">Uppercase</option>
                  <option value="title">Title Case</option>
                  <option value="sentence">Sentence Case</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Align:</label>
                <select
                  value={options.align}
                  onChange={(e) => handleOptionChange("align", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="center">Center</option>
                  <option value="justify">Justify</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Width:</label>
                <input
                  type="number"
                  value={options.width}
                  onChange={(e) => handleOptionChange("width", parseInt(e.target.value) || 0)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                  max="200"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.wrapLines}
                    onChange={() => handleOptionChange("wrapLines", !options.wrapLines)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Wrap Lines</span>
                </label>
                {options.wrapLines && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Prefix:</label>
                      <input
                        type="text"
                        value={options.prefix}
                        onChange={(e) => handleOptionChange("prefix", e.target.value)}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        maxLength="20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Suffix:</label>
                      <input
                        type="text"
                        value={options.suffix}
                        onChange={(e) => handleOptionChange("suffix", e.target.value)}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        maxLength="20"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Replace (Regex):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={options.replaceRegex}
                    onChange={(e) => handleOptionChange("replaceRegex", e.target.value)}
                    className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., \d+"
                  />
                  <input
                    type="text"
                    value={options.replaceWith}
                    onChange={(e) => handleOptionChange("replaceWith", e.target.value)}
                    className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Replacement"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.trim}
                    onChange={() => handleOptionChange("trim", !options.trim)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Trim</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.removeDuplicates}
                    onChange={() => handleOptionChange("removeDuplicates", !options.removeDuplicates)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Remove Duplicates</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.sortLines}
                    onChange={() => handleOptionChange("sortLines", !options.sortLines)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Sort Lines</span>
                </label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleFormat}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              <FaTextHeight className="inline mr-2" />
              {isLoading ? "Formatting..." : "Format Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {formattedText && (
              <button
                onClick={exportText}
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
        {formattedText && (
          <div className="mt-8 p-6 bg-purple-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">Formatted Text</h2>
            <pre className="mt-3 text-lg text-gray-700 whitespace-pre-wrap break-all max-h-64 overflow-y-auto">
              {formattedText}
            </pre>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {formatText(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(formattedText)}
              className="mt-4 w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy Formatted Text
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Formats (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>"{entry.formatted.slice(0, 20)}{entry.formatted.length > 20 ? "..." : ""}"</span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setFormattedText(entry.formatted);
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
            <li>Multiple case styles and alignment options</li>
            <li>Custom prefix/suffix wrapping and regex replacement</li>
            <li>Line deduplication and sorting</li>
            <li>Exportable results with history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextFormatter;