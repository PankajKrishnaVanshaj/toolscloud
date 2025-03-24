"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaCut,
} from "react-icons/fa";

const TextSplitter = () => {
  const [inputText, setInputText] = useState("");
  const [splitText, setSplitText] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    splitMethod: "delimiter", // delimiter, length, lines, words, regex
    delimiter: ",",           // Custom delimiter
    splitLength: 10,          // Length for fixed-length splitting
    trimSegments: true,
    ignoreEmpty: true,
    preserveCase: true,       // Preserve original case
    maxSegments: 0,           // Limit number of segments (0 = unlimited)
    regexPattern: "",         // Custom regex pattern for splitting
    joinSeparator: "\n",      // Separator for joining output
  });

  const splitTextFunc = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to split" };
    }

    let segments = [];
    switch (options.splitMethod) {
      case "delimiter":
        if (!options.delimiter) return { error: "Delimiter cannot be empty" };
        segments = text.split(options.delimiter);
        break;
      case "length":
        if (options.splitLength < 1) return { error: "Split length must be at least 1" };
        segments = [];
        for (let i = 0; i < text.length; i += options.splitLength) {
          segments.push(text.slice(i, i + options.splitLength));
        }
        break;
      case "lines":
        segments = text.split("\n");
        break;
      case "words":
        segments = text.split(/\s+/);
        break;
      case "regex":
        if (!options.regexPattern) return { error: "Regex pattern cannot be empty" };
        try {
          const regex = new RegExp(options.regexPattern, "g");
          segments = text.split(regex);
        } catch (err) {
          return { error: `Invalid regex pattern: ${err.message}` };
        }
        break;
      default:
        return { error: "Invalid split method" };
    }

    // Apply transformations
    if (!options.preserveCase) {
      segments = segments.map(segment => segment.toLowerCase());
    }
    if (options.trimSegments) {
      segments = segments.map(segment => segment.trim());
    }
    if (options.ignoreEmpty) {
      segments = segments.filter(segment => segment.length > 0);
    }
    if (options.maxSegments > 0 && segments.length > options.maxSegments) {
      segments = segments.slice(0, options.maxSegments);
    }

    if (segments.length === 0) {
      return { error: "No valid segments found after splitting" };
    }

    return {
      original: text,
      segments,
      segmentCount: segments.length,
      changes: getChanges(text, segments),
    };
  };

  const getChanges = (original, segments) => {
    const changes = [`Split into ${segments.length} segments using ${options.splitMethod}`];
    if (options.splitMethod === "delimiter") changes.push(`Delimiter: "${options.delimiter}"`);
    if (options.splitMethod === "length") changes.push(`Length: ${options.splitLength}`);
    if (options.splitMethod === "regex") changes.push(`Pattern: "${options.regexPattern}"`);
    if (options.trimSegments) changes.push("Trimmed segments");
    if (options.ignoreEmpty) changes.push("Ignored empty segments");
    if (!options.preserveCase) changes.push("Converted to lowercase");
    if (options.maxSegments > 0) changes.push(`Limited to ${options.maxSegments} segments`);
    return changes;
  };

  const handleSplit = useCallback(async () => {
    setError("");
    setSplitText([]);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = splitTextFunc(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setSplitText(result.segments);
        setHistory(prev => [...prev, { input: inputText, output: result.segments, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setSplitText([]);
    setError("");
    setOptions({
      splitMethod: "delimiter",
      delimiter: ",",
      splitLength: 10,
      trimSegments: true,
      ignoreEmpty: true,
      preserveCase: true,
      maxSegments: 0,
      regexPattern: "",
      joinSeparator: "\n",
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(0, value) : value,
    }));
  };

  const exportSplitText = () => {
    const content = `Original Text:\n${inputText}\n\nSplit Text (${splitText.length} segments):\n${splitText.join(options.joinSeparator)}\n\nChanges:\n${splitTextFunc(inputText).changes.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `split_text_${options.splitMethod}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Advanced Text Splitter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Split:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-48 resize-y transition-all"
              placeholder="e.g., Apple, Banana, Orange\nGrape\nPear"
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Splitting Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Split Method:</label>
                <select
                  value={options.splitMethod}
                  onChange={(e) => handleOptionChange("splitMethod", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="delimiter">Delimiter</option>
                  <option value="length">Fixed Length</option>
                  <option value="lines">Lines</option>
                  <option value="words">Words</option>
                  <option value="regex">Regex</option>
                </select>
              </div>
              {options.splitMethod === "delimiter" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Delimiter:</label>
                  <input
                    type="text"
                    value={options.delimiter}
                    onChange={(e) => handleOptionChange("delimiter", e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    maxLength="10"
                    placeholder=","
                  />
                </div>
              )}
              {options.splitMethod === "length" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Split Length:</label>
                  <input
                    type="number"
                    value={options.splitLength}
                    onChange={(e) => handleOptionChange("splitLength", parseInt(e.target.value) || 1)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    min="1"
                    max="1000"
                  />
                </div>
              )}
              {options.splitMethod === "regex" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Regex Pattern:</label>
                  <input
                    type="text"
                    value={options.regexPattern}
                    onChange={(e) => handleOptionChange("regexPattern", e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., [,.]"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Segments (0 = unlimited):</label>
                <input
                  type="number"
                  value={options.maxSegments}
                  onChange={(e) => handleOptionChange("maxSegments", parseInt(e.target.value) || 0)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  min="0"
                  max="1000"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Join Separator:</label>
                <input
                  type="text"
                  value={options.joinSeparator}
                  onChange={(e) => handleOptionChange("joinSeparator", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  maxLength="5"
                  placeholder="\n"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.trimSegments}
                    onChange={() => handleOptionChange("trimSegments", !options.trimSegments)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span>Trim Segments</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.ignoreEmpty}
                    onChange={() => handleOptionChange("ignoreEmpty", !options.ignoreEmpty)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span>Ignore Empty Segments</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.preserveCase}
                    onChange={() => handleOptionChange("preserveCase", !options.preserveCase)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span>Preserve Case</span>
                </label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleSplit}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-orange-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              <FaCut className="inline mr-2" />
              {isLoading ? "Splitting..." : "Split Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {splitText.length > 0 && (
              <button
                onClick={exportSplitText}
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
        {splitText.length > 0 && (
          <div className="mt-8 p-6 bg-orange-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Split Text ({splitText.length} segments)
            </h2>
            <ul className="mt-3 text-gray-700 list-disc list-inside space-y-1 max-h-64 overflow-auto">
              {splitText.map((segment, index) => (
                <li key={index}>{segment}</li>
              ))}
            </ul>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {splitTextFunc(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(splitText.join(options.joinSeparator))}
              className="mt-4 w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy Segments
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Splits (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.options.splitMethod}: "{entry.output[0].slice(0, 20)}{entry.output[0].length > 20 ? "..." : ""}" ({entry.output.length} segments)
                  </span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setSplitText(entry.output);
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
            <li>Split by delimiter, length, lines, words, or regex</li>
            <li>Trim, ignore empty, preserve case, and limit segments</li>
            <li>Custom join separator for output</li>
            <li>Export split text and history tracking</li>
            <li>Supports up to 10000 characters</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextSplitter;