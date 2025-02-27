"use client";
import React, { useState } from "react";

const TextSplitter = () => {
  const [inputText, setInputText] = useState("");
  const [splitText, setSplitText] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    splitMethod: "delimiter", // delimiter, length, lines
    delimiter: ",",           // Custom delimiter
    splitLength: 10,          // Length for fixed-length splitting
    trimSegments: true,       // Trim whitespace from segments
    ignoreEmpty: true,        // Ignore empty segments
  });

  // Split text based on options
  const splitTextFunc = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to split" };
    }

    let segments = [];
    switch (options.splitMethod) {
      case "delimiter":
        segments = text.split(options.delimiter);
        break;
      case "length":
        if (options.splitLength < 1) {
          return { error: "Split length must be at least 1" };
        }
        segments = [];
        for (let i = 0; i < text.length; i += options.splitLength) {
          segments.push(text.slice(i, i + options.splitLength));
        }
        break;
      case "lines":
        segments = text.split("\n");
        break;
      default:
        return { error: "Invalid split method" };
    }

    // Apply trimming and empty segment filtering
    if (options.trimSegments) {
      segments = segments.map(segment => segment.trim());
    }
    if (options.ignoreEmpty) {
      segments = segments.filter(segment => segment.length > 0);
    }

    if (segments.length === 0) {
      return { error: "No valid segments found after splitting" };
    }

    return {
      original: text,
      segments,
      segmentCount: segments.length,
    };
  };

  const handleSplit = async () => {
    setError("");
    setSplitText([]);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = splitTextFunc(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setSplitText(result.segments);
    } catch (err) {
      setError("An error occurred while splitting the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setSplitText([]);
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
          Text Splitter
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-40 resize-y transition-all"
              placeholder="e.g., Apple, Banana, Orange"
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Splitting Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Split Method:</label>
                <select
                  value={options.splitMethod}
                  onChange={(e) => handleOptionChange("splitMethod", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="delimiter">Delimiter</option>
                  <option value="length">Fixed Length</option>
                  <option value="lines">Lines</option>
                </select>
              </div>
              {options.splitMethod === "delimiter" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Delimiter:</label>
                  <input
                    type="text"
                    value={options.delimiter}
                    onChange={(e) => handleOptionChange("delimiter", e.target.value)}
                    className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    min="1"
                    max="1000"
                  />
                </div>
              )}
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
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleSplit}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-orange-400 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {isLoading ? "Splitting..." : "Split Text"}
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
        {splitText.length > 0 && (
          <div className="mt-8 p-6 bg-orange-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Split Text ({splitText.length} segments)
            </h2>
            <ul className="mt-3 text-gray-700 list-disc list-inside space-y-1">
              {splitText.map((segment, index) => (
                <li key={index}>{segment}</li>
              ))}
            </ul>
            <button
              onClick={() => navigator.clipboard.writeText(splitText.join("\n"))}
              className="mt-4 w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all font-semibold"
            >
              Copy Segments to Clipboard
            </button>
          </div>
        )}

       
      </div>
    </div>
  );
};

export default TextSplitter;