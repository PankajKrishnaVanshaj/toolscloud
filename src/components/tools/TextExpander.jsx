"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaExpand,
} from "react-icons/fa";

const TextExpander = () => {
  const [inputText, setInputText] = useState("");
  const [expandedText, setExpandedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    expansionType: "words",    // characters, words, lines, sentences
    repeatCount: 3,
    separator: " ",
    applyToLines: true,
    maxLength: 10000,
    preserveCase: true,        // Preserve original case
    alternateSeparator: false, // Alternate separators between repetitions
    secondSeparator: "-",      // Secondary separator for alternation
    wrapText: "",              // Text to wrap around each repetition
  });

  const expandText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to expand" };
    }

    if (options.repeatCount < 1) {
      return { error: "Repeat count must be at least 1" };
    }

    if (options.maxLength < 1) {
      return { error: "Maximum length must be at least 1" };
    }

    let resultLines = options.applyToLines ? text.split("\n") : [text];
    let expandedLines = [];

    for (let line of resultLines) {
      let expandedLine = line;

      switch (options.expansionType) {
        case "characters":
          expandedLine = line.split("").map(char => {
            const repeated = Array(options.repeatCount + 1).join(char + options.separator).slice(0, -options.separator.length);
            return options.wrapText ? `${options.wrapText}${repeated}${options.wrapText}` : repeated;
          }).join("");
          break;
        case "words":
          const words = line.split(/\s+/).filter(w => w.length > 0);
          expandedLine = words.map(word => {
            let repeated = "";
            for (let i = 0; i < options.repeatCount; i++) {
              const sep = options.alternateSeparator && i % 2 === 1 ? options.secondSeparator : options.separator;
              repeated += word + (i < options.repeatCount - 1 ? sep : "");
            }
            return options.wrapText ? `${options.wrapText}${repeated}${options.wrapText}` : repeated;
          }).join(options.separator);
          break;
        case "lines":
          let lineRepeated = "";
          for (let i = 0; i < options.repeatCount; i++) {
            const sep = options.alternateSeparator && i % 2 === 1 ? options.secondSeparator : options.separator;
            lineRepeated += line + (i < options.repeatCount - 1 ? sep : "");
          }
          expandedLine = options.wrapText ? `${options.wrapText}${lineRepeated}${options.wrapText}` : lineRepeated;
          break;
        case "sentences":
          const sentences = line.split(/(?<=\.|\?|!)\s+/).filter(s => s.length > 0);
          expandedLine = sentences.map(sentence => {
            let repeated = "";
            for (let i = 0; i < options.repeatCount; i++) {
              const sep = options.alternateSeparator && i % 2 === 1 ? options.secondSeparator : options.separator;
              repeated += sentence + (i < options.repeatCount - 1 ? sep : "");
            }
            return options.wrapText ? `${options.wrapText}${repeated}${options.wrapText}` : repeated;
          }).join(options.separator);
          break;
        default:
          return { error: "Invalid expansion type" };
      }

      if (!options.preserveCase) {
        expandedLine = expandedLine.toLowerCase();
      }

      expandedLines.push(expandedLine);
    }

    let result = expandedLines.join("\n");
    if (result.length > options.maxLength) {
      result = result.slice(0, options.maxLength);
    }

    return {
      original: text,
      expanded: result,
      changes: getChanges(text, result),
    };
  };

  const getChanges = (original, expanded) => {
    const changes = [];
    if (original === expanded) return ["No changes made"];

    changes.push(`Expanded ${options.expansionType} ${options.repeatCount} times`);
    if (options.separator) changes.push(`Used separator "${options.separator}"`);
    if (options.alternateSeparator) changes.push(`Alternated with "${options.secondSeparator}"`);
    if (options.applyToLines && original.includes("\n")) changes.push("Applied to each line separately");
    if (!options.preserveCase) changes.push("Converted to lowercase");
    if (options.wrapText) changes.push(`Wrapped with "${options.wrapText}"`);
    if (expanded.length >= options.maxLength) changes.push(`Truncated to ${options.maxLength} characters`);
    return changes;
  };

  const handleExpand = useCallback(async () => {
    setError("");
    setExpandedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = expandText(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setExpandedText(result.expanded);
        setHistory(prev => [...prev, { input: inputText, output: result.expanded, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setExpandedText("");
    setError("");
    setOptions({
      expansionType: "words",
      repeatCount: 3,
      separator: " ",
      applyToLines: true,
      maxLength: 10000,
      preserveCase: true,
      alternateSeparator: false,
      secondSeparator: "-",
      wrapText: "",
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(1, value) : value,
    }));
  };

  const exportExpandedText = () => {
    const content = `Original Text:\n${inputText}\n\nExpanded Text:\n${expandedText}\n\nChanges:\n${expandText(inputText).changes.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `expanded_text_${options.expansionType}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Advanced Text Expander
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Expand:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-48 resize-y transition-all"
              placeholder="e.g., Hello World\nThis is a test."
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Expansion Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Expansion Type:</label>
                <select
                  value={options.expansionType}
                  onChange={(e) => handleOptionChange("expansionType", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="characters">Characters</option>
                  <option value="words">Words</option>
                  <option value="lines">Lines</option>
                  <option value="sentences">Sentences</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Repeat Count:</label>
                <input
                  type="number"
                  value={options.repeatCount}
                  onChange={(e) => handleOptionChange("repeatCount", parseInt(e.target.value) || 1)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="1"
                  max="50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Primary Separator:</label>
                <input
                  type="text"
                  value={options.separator}
                  onChange={(e) => handleOptionChange("separator", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  maxLength="10"
                  placeholder=" "
                />
              </div>
              {options.alternateSeparator && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Secondary Separator:</label>
                  <input
                    type="text"
                    value={options.secondSeparator}
                    onChange={(e) => handleOptionChange("secondSeparator", e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    maxLength="10"
                    placeholder="-"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Length:</label>
                <input
                  type="number"
                  value={options.maxLength}
                  onChange={(e) => handleOptionChange("maxLength", parseInt(e.target.value) || 1)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="1"
                  max="20000"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Wrap Text (optional):</label>
                <input
                  type="text"
                  value={options.wrapText}
                  onChange={(e) => handleOptionChange("wrapText", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  maxLength="20"
                  placeholder="e.g., *"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.applyToLines}
                    onChange={() => handleOptionChange("applyToLines", !options.applyToLines)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Apply to Lines Separately</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.preserveCase}
                    onChange={() => handleOptionChange("preserveCase", !options.preserveCase)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Preserve Case</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.alternateSeparator}
                    onChange={() => handleOptionChange("alternateSeparator", !options.alternateSeparator)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Alternate Separators</span>
                </label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleExpand}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              <FaExpand className="inline mr-2" />
              {isLoading ? "Expanding..." : "Expand Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {expandedText && (
              <button
                onClick={exportExpandedText}
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
        {expandedText && (
          <div className="mt-8 p-6 bg-indigo-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Expanded Text ({expandedText.length} characters)
            </h2>
            <pre className="mt-3 text-lg text-gray-700 whitespace-pre-wrap break-all max-h-64 overflow-auto">
              {expandedText}
            </pre>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {expandText(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(expandedText)}
              className="mt-4 w-full py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy Expanded Text
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Expansions (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.options.expansionType}: "{entry.output.slice(0, 30)}{entry.output.length > 30 ? "..." : ""}"
                  </span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setExpandedText(entry.output);
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
            <li>Expand characters, words, lines, or sentences</li>
            <li>Custom repeat count and separators (with alternation)</li>
            <li>Line-by-line or full-text expansion</li>
            <li>Preserve case, wrap text, and max length options</li>
            <li>Export expanded text and history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextExpander;