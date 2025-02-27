"use client";
import React, { useState } from "react";

const TextLengthTruncator = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    maxLength: 100,
    truncateAtWord: true,
    addEllipsis: true,
  });

  // Truncate text based on options
  const truncateText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to truncate" };
    }

    if (options.maxLength < 1) {
      return { error: "Max length must be at least 1" };
    }

    let result = text;

    if (result.length <= options.maxLength) {
      return {
        original: text,
        truncated: result,
        changes: ["Text is already within length limit"],
      };
    }

    if (options.truncateAtWord) {
      // Find the last space before maxLength
      let truncatePoint = result.lastIndexOf(" ", options.maxLength);
      if (truncatePoint === -1 || truncatePoint < options.maxLength / 2) {
        truncatePoint = options.maxLength; // Fallback to character limit if no suitable word boundary
      }
      result = result.substring(0, truncatePoint).trim();
    } else {
      result = result.substring(0, options.maxLength).trim();
    }

    const changes = ["Truncated to specified length"];
    if (options.addEllipsis) {
      result += "…"; // Unicode ellipsis
      changes.push("Added ellipsis");
    }

    return {
      original: text,
      truncated: result,
      changes,
    };
  };

  const handleTruncate = async () => {
    setError("");
    setOutputText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = truncateText(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setOutputText(result.truncated);
    } catch (err) {
      setError("An error occurred while truncating the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setOutputText("");
    setError("");
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Length Truncator
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-40 resize-y transition-all"
              placeholder="e.g., This is a long text that needs truncation"
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Truncation Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <label>Max Length:</label>
                <input
                  type="number"
                  value={options.maxLength}
                  onChange={(e) => handleOptionChange("maxLength", Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 p-1 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  min="1"
                  max="1000"
                />
              </div>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.truncateAtWord}
                  onChange={() => handleOptionChange("truncateAtWord", !options.truncateAtWord)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                />
                <span>Truncate at Word Boundary</span>
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
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleTruncate}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-orange-400 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {isLoading ? "Truncating..." : "Truncate Text"}
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
        {outputText && (
          <div className="mt-8 p-6 bg-orange-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Truncated Text
            </h2>
            <p className="mt-3 text-lg text-center text-gray-700 break-words">
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
              Copy to Clipboard
            </button>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default TextLengthTruncator;