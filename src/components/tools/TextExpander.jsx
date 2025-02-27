"use client";
import React, { useState } from "react";

const TextExpander = () => {
  const [inputText, setInputText] = useState("");
  const [expandedText, setExpandedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    expansionType: "words",  // characters, words, lines
    repeatCount: 3,          // Number of times to repeat
    separator: " ",          // Separator between repetitions
    applyToLines: true,      // Apply expansion to each line separately
    maxLength: 1000,         // Maximum length of output text
  });

  // Expand text based on options
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
          expandedLine = line.split("").map(char => char.repeat(options.repeatCount)).join(options.separator);
          break;
        case "words":
          expandedLine = line.split(/\s+/).map(word => Array(options.repeatCount + 1).join(word + options.separator)).join(options.separator).trim();
          break;
        case "lines":
          expandedLine = Array(options.repeatCount + 1).join(line + options.separator).trim();
          break;
        default:
          return { error: "Invalid expansion type" };
      }

      expandedLines.push(expandedLine);
    }

    let result = expandedLines.join("\n");

    // Enforce max length
    if (result.length > options.maxLength) {
      result = result.slice(0, options.maxLength);
    }

    return {
      original: text,
      expanded: result,
      changes: getChanges(text, result),
    };
  };

  // Helper to identify changes made
  const getChanges = (original, expanded) => {
    const changes = [];
    if (original === expanded) return ["No changes made"];

    changes.push(`Expanded ${options.expansionType} ${options.repeatCount} times with separator "${options.separator}"`);
    if (options.applyToLines && original.includes("\n")) {
      changes.push("Applied to each line separately");
    }
    if (expanded.length >= options.maxLength) {
      changes.push(`Truncated to maximum length of ${options.maxLength} characters`);
    }
    return changes;
  };

  const handleExpand = async () => {
    setError("");
    setExpandedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = expandText(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setExpandedText(result.expanded);
    } catch (err) {
      setError("An error occurred while expanding the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setExpandedText("");
    setError("");
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(1, value) : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Expander
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-40 resize-y transition-all"
              placeholder="e.g., Hello World"
              maxLength={1000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/1000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Expansion Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Expansion Type:</label>
                <select
                  value={options.expansionType}
                  onChange={(e) => handleOptionChange("expansionType", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="characters">Characters</option>
                  <option value="words">Words</option>
                  <option value="lines">Lines</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Repeat Count:</label>
                <input
                  type="number"
                  value={options.repeatCount}
                  onChange={(e) => handleOptionChange("repeatCount", parseInt(e.target.value) || 1)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="1"
                  max="50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Separator:</label>
                <input
                  type="text"
                  value={options.separator}
                  onChange={(e) => handleOptionChange("separator", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  maxLength="10"
                  placeholder=" "
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Length:</label>
                <input
                  type="number"
                  value={options.maxLength}
                  onChange={(e) => handleOptionChange("maxLength", parseInt(e.target.value) || 1)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="1"
                  max="10000"
                />
              </div>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.applyToLines}
                  onChange={() => handleOptionChange("applyToLines", !options.applyToLines)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Apply to Lines Separately</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleExpand}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {isLoading ? "Expanding..." : "Expand Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Output Display */}
        {expandedText && (
          <div className="mt-8 p-6 bg-indigo-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Expanded Text
            </h2>
            <pre className="mt-3 text-lg text-gray-700 whitespace-pre-wrap break-all">
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
              Copy Expanded Text to Clipboard
            </button>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default TextExpander;