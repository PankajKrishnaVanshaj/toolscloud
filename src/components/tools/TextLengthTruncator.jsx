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

const TextLengthTruncator = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    maxLength: 100,
    truncateAtWord: true,
    addEllipsis: true,
    truncatePosition: "end", // start, middle, end
    customEllipsis: "",       // Custom truncation indicator
    preserveSentences: false, // Try to truncate at sentence boundaries
    minLength: 0,            // Minimum length to enforce (pads if shorter)
    padChar: " ",            // Character to pad with if under minLength
  });

  const truncateText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to truncate" };
    }

    if (options.maxLength < 1) {
      return { error: "Max length must be at least 1" };
    }

    let result = text;
    const changes = [];
    const ellipsis = options.customEllipsis || (options.addEllipsis ? "…" : "");

    // Handle minLength padding
    if (options.minLength > 0 && text.length < options.minLength) {
      result = text.padEnd(options.minLength, options.padChar);
      changes.push(`Padded to minimum length ${options.minLength} with '${options.padChar}'`);
    }

    if (result.length <= options.maxLength) {
      return {
        original: text,
        truncated: result,
        changes: changes.length > 0 ? changes : ["Text is within length limits"],
      };
    }

    let truncatePoint;
    switch (options.truncatePosition) {
      case "start":
        if (options.truncateAtWord) {
          truncatePoint = result.indexOf(" ", result.length - options.maxLength);
          if (truncatePoint === -1 || truncatePoint > result.length - options.maxLength / 2) {
            truncatePoint = result.length - options.maxLength;
          }
          result = ellipsis + result.substring(truncatePoint).trim();
        } else {
          result = ellipsis + result.substring(result.length - options.maxLength).trim();
        }
        break;
      case "middle":
        const halfLength = Math.floor((options.maxLength - ellipsis.length) / 2);
        if (options.truncateAtWord) {
          const startPoint = result.lastIndexOf(" ", halfLength);
          const endPoint = result.indexOf(" ", result.length - halfLength);
          const start = startPoint === -1 ? halfLength : startPoint;
          const end = endPoint === -1 ? result.length - halfLength : endPoint;
          result = result.substring(0, start).trim() + ellipsis + result.substring(end).trim();
        } else {
          result = result.substring(0, halfLength).trim() + ellipsis + result.substring(result.length - halfLength).trim();
        }
        break;
      case "end":
        if (options.preserveSentences) {
          truncatePoint = result.lastIndexOf(".", options.maxLength);
          if (truncatePoint === -1 || truncatePoint < options.maxLength / 2) {
            truncatePoint = options.truncateAtWord ? result.lastIndexOf(" ", options.maxLength) : options.maxLength;
          }
          if (truncatePoint === -1) truncatePoint = options.maxLength;
          result = result.substring(0, truncatePoint + 1).trim();
        } else if (options.truncateAtWord) {
          truncatePoint = result.lastIndexOf(" ", options.maxLength);
          if (truncatePoint === -1 || truncatePoint < options.maxLength / 2) {
            truncatePoint = options.maxLength;
          }
          result = result.substring(0, truncatePoint).trim();
        } else {
          result = result.substring(0, options.maxLength).trim();
        }
        if (ellipsis) result += ellipsis;
        break;
      default:
        break;
    }

    changes.push(`Truncated to max length ${options.maxLength} at ${options.truncatePosition}`);
    if (options.truncateAtWord) changes.push("Truncated at word boundary");
    if (options.preserveSentences && options.truncatePosition === "end") changes.push("Preserved sentence boundary");
    if (ellipsis) changes.push(`Added ${options.customEllipsis ? "custom" : "default"} ellipsis`);

    return {
      original: text,
      truncated: result,
      changes,
    };
  };

  const handleTruncate = useCallback(async () => {
    setError("");
    setOutputText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = truncateText(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setOutputText(result.truncated);
        setHistory(prev => [...prev, { input: inputText, output: result.truncated, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setOutputText("");
    setError("");
    setOptions({
      maxLength: 100,
      truncateAtWord: true,
      addEllipsis: true,
      truncatePosition: "end",
      customEllipsis: "",
      preserveSentences: false,
      minLength: 0,
      padChar: " ",
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(option === "minLength" ? 0 : 1, parseInt(value) || 0) : value,
    }));
  };

  const exportTruncatedText = () => {
    const content = `Original Text:\n${inputText}\n\nTruncated Text:\n${outputText}\n\nChanges Applied:\n${truncateText(inputText).changes.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `truncated_text_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full ">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
          Advanced Text Length Truncator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Truncate:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-40 sm:h-48 resize-y transition-all"
              placeholder="e.g., This is a long text that needs truncation. It has multiple sentences."
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Truncation Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Length:</label>
                <input
                  type="number"
                  value={options.maxLength}
                  onChange={(e) => handleOptionChange("maxLength", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  min="1"
                  max="5000"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Min Length (0 = none):</label>
                <input
                  type="number"
                  value={options.minLength}
                  onChange={(e) => handleOptionChange("minLength", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  min="0"
                  max={options.maxLength}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Truncate Position:</label>
                <select
                  value={options.truncatePosition}
                  onChange={(e) => handleOptionChange("truncatePosition", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="start">Start</option>
                  <option value="middle">Middle</option>
                  <option value="end">End</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Custom Ellipsis:</label>
                <input
                  type="text"
                  value={options.customEllipsis}
                  onChange={(e) => handleOptionChange("customEllipsis", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Default: …"
                  maxLength="10"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Pad Character:</label>
                <input
                  type="text"
                  value={options.padChar}
                  onChange={(e) => handleOptionChange("padChar", e.target.value.slice(0, 1) || " ")}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Default: space"
                  maxLength="1"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.truncateAtWord}
                    onChange={() => handleOptionChange("truncateAtWord", !options.truncateAtWord)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span>Truncate at Word</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.addEllipsis}
                    onChange={() => handleOptionChange("addEllipsis", !options.addEllipsis)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span>Add Ellipsis</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.preserveSentences}
                    onChange={() => handleOptionChange("preserveSentences", !options.preserveSentences)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                    disabled={options.truncatePosition !== "end"}
                  />
                  <span>Preserve Sentences {options.truncatePosition !== "end" && "(End only)"}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleTruncate}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-orange-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              <FaCut className="inline mr-2" />
              {isLoading ? "Truncating..." : "Truncate Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {outputText && (
              <button
                onClick={exportTruncatedText}
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
        {outputText && (
          <div className="mt-8 p-6 bg-orange-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">Truncated Text</h2>
            <p className="mt-3 text-lg text-gray-700 break-words whitespace-pre-wrap max-h-64 overflow-y-auto">
              {outputText}
            </p>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {truncateText(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(outputText)}
              className="mt-4 w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all font-semibold"
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
              <FaHistory className="mr-2" /> Recent Truncations (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>"{entry.output.slice(0, 30)}{entry.output.length > 30 ? "..." : ""}"</span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setOutputText(entry.output);
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
            <li>Truncate at start, middle, or end</li>
            <li>Word or sentence boundary truncation</li>
            <li>Custom ellipsis and padding options</li>
            <li>Minimum length enforcement</li>
            <li>Export results and history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextLengthTruncator;