"use client";
import React, { useState } from "react";

const TextSorter = () => {
  const [inputText, setInputText] = useState("");
  const [sortedText, setSortedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    sortType: "alphabetical", // alphabetical, length, numerical
    sortOrder: "ascending",   // ascending, descending
    caseSensitive: false,     // Case sensitivity for alphabetical sort
    trimLines: true,          // Trim whitespace from lines before sorting
    ignoreEmpty: true,        // Ignore empty lines
  });

  // Sort text based on options
  const sortText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to sort" };
    }

    let lines = text.split("\n");

    // Apply trimming and empty line filtering
    if (options.trimLines) {
      lines = lines.map(line => line.trim());
    }
    if (options.ignoreEmpty) {
      lines = lines.filter(line => line.length > 0);
    }

    if (lines.length === 0) {
      return { error: "No valid lines to sort after filtering" };
    }

    let sortedLines;

    switch (options.sortType) {
      case "alphabetical":
        sortedLines = lines.sort((a, b) => {
          const compareA = options.caseSensitive ? a : a.toLowerCase();
          const compareB = options.caseSensitive ? b : b.toLowerCase();
          return options.sortOrder === "ascending" ? compareA.localeCompare(compareB) : compareB.localeCompare(compareA);
        });
        break;
      case "length":
        sortedLines = lines.sort((a, b) => {
          return options.sortOrder === "ascending" ? a.length - b.length : b.length - a.length;
        });
        break;
      case "numerical":
        sortedLines = lines.sort((a, b) => {
          const numA = parseFloat(a) || 0;
          const numB = parseFloat(b) || 0;
          return options.sortOrder === "ascending" ? numA - numB : numB - numA;
        });
        break;
      default:
        return { error: "Invalid sort type" };
    }

    const result = sortedLines.join("\n");

    return {
      original: text,
      sorted: result,
      lineCount: sortedLines.length,
    };
  };

  const handleSort = async () => {
    setError("");
    setSortedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = sortText(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setSortedText(result.sorted);
    } catch (err) {
      setError("An error occurred while sorting the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setSortedText("");
    setError("");
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Sorter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Sort (one item per line):
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 resize-y transition-all"
              placeholder="e.g., Banana\nApple\nCherry"
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Sorting Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Sort Type:</label>
                <select
                  value={options.sortType}
                  onChange={(e) => handleOptionChange("sortType", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="alphabetical">Alphabetical</option>
                  <option value="length">Length</option>
                  <option value="numerical">Numerical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Sort Order:</label>
                <select
                  value={options.sortOrder}
                  onChange={(e) => handleOptionChange("sortOrder", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ascending">Ascending</option>
                  <option value="descending">Descending</option>
                </select>
              </div>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.caseSensitive}
                  onChange={() => handleOptionChange("caseSensitive", !options.caseSensitive)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Case Sensitive (Alphabetical)</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.trimLines}
                  onChange={() => handleOptionChange("trimLines", !options.trimLines)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Trim Lines</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.ignoreEmpty}
                  onChange={() => handleOptionChange("ignoreEmpty", !options.ignoreEmpty)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Ignore Empty Lines</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleSort}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Sorting..." : "Sort Text"}
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
        {sortedText && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Sorted Text ({options.sortType}, {options.sortOrder})
            </h2>
            <pre className="mt-3 text-lg text-gray-700 whitespace-pre-wrap break-all">
              {sortedText}
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(sortedText)}
              className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold"
            >
              Copy Sorted Text to Clipboard
            </button>
          </div>
        )}

       
      </div>
    </div>
  );
};

export default TextSorter;