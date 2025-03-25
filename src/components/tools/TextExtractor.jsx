"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaFilter,
} from "react-icons/fa";

const TextExtractor = () => {
  const [inputText, setInputText] = useState("");
  const [extractedText, setExtractedText] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    extractType: "words",      // words, numbers, emails, urls, custom, hashtags, mentions
    customPattern: "",
    caseSensitive: false,
    outputFormat: "list",
    separator: ", ",
    removeDuplicates: false,   // Remove duplicate matches
    matchWholeWords: false,    // Match whole words only (for custom pattern)
    limitMatches: 0,           // Limit number of matches (0 = unlimited)
  });

  const extractText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to extract from" };
    }

    let matches = [];
    let pattern;

    switch (options.extractType) {
      case "words":
        pattern = options.caseSensitive ? /\b\w+\b/g : /\b\w+\b/gi;
        matches = [...text.matchAll(pattern)].map(match => match[0]);
        break;
      case "numbers":
        pattern = /\d+(?:\.\d+)?/g; // Include decimals
        matches = [...text.matchAll(pattern)].map(match => match[0]);
        break;
      case "emails":
        pattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        matches = [...text.matchAll(pattern)].map(match => match[0]);
        break;
      case "urls":
        pattern = /https?:\/\/[^\s]+/g;
        matches = [...text.matchAll(pattern)].map(match => match[0]);
        break;
      case "hashtags":
        pattern = /#\w+/g;
        matches = [...text.matchAll(pattern)].map(match => match[0]);
        break;
      case "mentions":
        pattern = /@\w+/g;
        matches = [...text.matchAll(pattern)].map(match => match[0]);
        break;
      case "custom":
        if (!options.customPattern) {
          return { error: "Please enter a custom pattern for extraction" };
        }
        try {
          const flags = options.caseSensitive ? "g" : "gi";
          const basePattern = options.matchWholeWords ? `\\b${options.customPattern}\\b` : options.customPattern;
          pattern = new RegExp(basePattern, flags);
          matches = [...text.matchAll(pattern)].map(match => match[0]);
        } catch (err) {
          return { error: `Invalid regex pattern: ${err.message}` };
        }
        break;
      default:
        return { error: "Invalid extract type" };
    }

    if (matches.length === 0) {
      return { error: "No matches found for the specified criteria" };
    }

    if (options.removeDuplicates) {
      matches = [...new Set(matches)];
    }

    if (options.limitMatches > 0 && matches.length > options.limitMatches) {
      matches = matches.slice(0, options.limitMatches);
    }

    let output;
    switch (options.outputFormat) {
      case "list":
        output = matches;
        break;
      case "string":
        output = matches.join(options.separator);
        break;
      case "json":
        output = JSON.stringify(matches, null, 2);
        break;
      default:
        output = matches;
    }

    return {
      original: text,
      extracted: output,
      matchCount: matches.length,
    };
  };

  const handleExtract = useCallback(async () => {
    setError("");
    setExtractedText([]);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = extractText(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setExtractedText(result.extracted);
        setHistory(prev => [...prev, { input: inputText, output: result.extracted, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred while extracting");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setExtractedText([]);
    setError("");
    setOptions({
      extractType: "words",
      customPattern: "",
      caseSensitive: false,
      outputFormat: "list",
      separator: ", ",
      removeDuplicates: false,
      matchWholeWords: false,
      limitMatches: 0,
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  const exportExtractedText = () => {
    const content = `Input Text:\n${inputText}\n\nExtracted (${options.extractType}, ${options.outputFormat}):\n${options.outputFormat === "list" ? extractedText.join("\n") : extractedText}\n\nMatch Count: ${extractText(inputText).matchCount}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `extracted_text_${options.extractType}_${options.outputFormat}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full ">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Advanced Text Extractor
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Extract From:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-48 resize-y transition-all"
              placeholder="e.g., Contact: john@example.com, Phone: 123.45, #tag @user https://example.com"
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Extraction Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Extract Type:</label>
                <select
                  value={options.extractType}
                  onChange={(e) => handleOptionChange("extractType", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="words">Words</option>
                  <option value="numbers">Numbers</option>
                  <option value="emails">Emails</option>
                  <option value="urls">URLs</option>
                  <option value="hashtags">Hashtags</option>
                  <option value="mentions">Mentions</option>
                  <option value="custom">Custom Pattern</option>
                </select>
              </div>
              {options.extractType === "custom" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Custom Pattern (regex):</label>
                  <input
                    type="text"
                    value={options.customPattern}
                    onChange={(e) => handleOptionChange("customPattern", e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., [A-Z]+"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Output Format:</label>
                <select
                  value={options.outputFormat}
                  onChange={(e) => handleOptionChange("outputFormat", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="list">List</option>
                  <option value="string">String</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              {options.outputFormat === "string" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Separator:</label>
                  <input
                    type="text"
                    value={options.separator}
                    onChange={(e) => handleOptionChange("separator", e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    maxLength="10"
                    placeholder=", "
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Match Limit (0 = unlimited):</label>
                <input
                  type="number"
                  value={options.limitMatches}
                  onChange={(e) => handleOptionChange("limitMatches", Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  min="0"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.caseSensitive}
                    onChange={() => handleOptionChange("caseSensitive", !options.caseSensitive)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span>Case Sensitive</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.removeDuplicates}
                    onChange={() => handleOptionChange("removeDuplicates", !options.removeDuplicates)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span>Remove Duplicates</span>
                </label>
                {options.extractType === "custom" && (
                  <label className="flex items-center space-x-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={options.matchWholeWords}
                      onChange={() => handleOptionChange("matchWholeWords", !options.matchWholeWords)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                    />
                    <span>Match Whole Words</span>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleExtract}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-orange-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              <FaFilter className="inline mr-2" />
              {isLoading ? "Extracting..." : "Extract Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {extractedText.length > 0 && (
              <button
                onClick={exportExtractedText}
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
        {extractedText && (
          <div className="mt-8 p-6 bg-orange-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Extracted Text ({options.extractType}, {extractText(inputText).matchCount} matches)
            </h2>
            <div className="mt-3 text-lg text-gray-700">
              {options.outputFormat === "list" && Array.isArray(extractedText) ? (
                <ul className="list-disc list-inside space-y-1 max-h-64 overflow-auto">
                  {extractedText.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <pre className="whitespace-pre-wrap break-all max-h-64 overflow-auto">
                  {typeof extractedText === "string" ? extractedText : JSON.stringify(extractedText, null, 2)}
                </pre>
              )}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(
                options.outputFormat === "list" && Array.isArray(extractedText) ? extractedText.join("\n") : extractedText
              )}
              className="mt-4 w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy Extracted Text
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Extractions (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.options.extractType} ({entry.options.outputFormat}): "{entry.output.slice(0, 30)}{entry.output.length > 30 ? "..." : ""}"
                  </span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setExtractedText(entry.output);
                      setOptions(entry.options);
                    }}
                    className="text-orange-500 hover:text-orange-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-orange-100 rounded-lg border border-orange-300">
          <h3 className="font-semibold text-orange-700">Features</h3>
          <ul className="list-disc list-inside text-orange-600 text-sm">
            <li>Extract words, numbers, emails, URLs, hashtags, mentions, or custom patterns</li>
            <li>Flexible output formats (list, string, JSON)</li>
            <li>Case sensitivity, duplicate removal, and match limits</li>
            <li>Whole word matching for custom patterns</li>
            <li>Export results and history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextExtractor;