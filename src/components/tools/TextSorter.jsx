"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaSort,
} from "react-icons/fa";

const TextSorter = () => {
  const [inputText, setInputText] = useState("");
  const [sortedText, setSortedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    sortType: "alphabetical", // alphabetical, length, numerical, custom
    sortOrder: "ascending",
    caseSensitive: false,
    trimLines: true,
    ignoreEmpty: true,
    removeDuplicates: false,  // Remove duplicate lines
    customSeparator: "",      // Custom separator for splitting lines
    reverseAfterSort: false,  // Reverse the sorted result
  });

  const sortText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to sort" };
    }

    let lines = options.customSeparator ? text.split(options.customSeparator) : text.split("\n");

    if (options.trimLines) {
      lines = lines.map(line => line.trim());
    }
    if (options.ignoreEmpty) {
      lines = lines.filter(line => line.length > 0);
    }
    if (lines.length === 0) {
      return { error: "No valid lines to sort after filtering" };
    }

    if (options.removeDuplicates) {
      lines = [...new Set(lines)];
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
          return options.sortOrder === "ascending" ? a.length - b.length || a.localeCompare(b) : b.length - a.length || b.localeCompare(a);
        });
        break;
      case "numerical":
        sortedLines = lines.sort((a, b) => {
          const numA = parseFloat(a) || 0;
          const numB = parseFloat(b) || 0;
          return options.sortOrder === "ascending" ? numA - numB || a.localeCompare(b) : numB - numA || b.localeCompare(a);
        });
        break;
      case "custom":
        if (!options.customSeparator) {
          return { error: "Custom separator required for custom sort" };
        }
        sortedLines = lines.sort((a, b) => {
          const compareA = options.caseSensitive ? a : a.toLowerCase();
          const compareB = options.caseSensitive ? b : b.toLowerCase();
          return options.sortOrder === "ascending" ? compareA.localeCompare(compareB) : compareB.localeCompare(compareA);
        });
        break;
      default:
        return { error: "Invalid sort type" };
    }

    if (options.reverseAfterSort) {
      sortedLines = sortedLines.reverse();
    }

    const result = sortedLines.join(options.customSeparator || "\n");

    return {
      original: text,
      sorted: result,
      lineCount: sortedLines.length,
    };
  };

  const handleSort = useCallback(async () => {
    setError("");
    setSortedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = sortText(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setSortedText(result.sorted);
        setHistory(prev => [...prev, { input: inputText, output: result.sorted, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An error occurred while sorting the text");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setSortedText("");
    setError("");
    setOptions({
      sortType: "alphabetical",
      sortOrder: "ascending",
      caseSensitive: false,
      trimLines: true,
      ignoreEmpty: true,
      removeDuplicates: false,
      customSeparator: "",
      reverseAfterSort: false,
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  const exportSortedText = () => {
    const content = `Original Text:\n${inputText}\n\nSorted Text (${options.sortType}, ${options.sortOrder}):\n${sortedText}\n\nLine Count: ${sortText(inputText).lineCount}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sorted_text_${options.sortType}_${options.sortOrder}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Advanced Text Sorter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Sort (one item per line or separator):
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-48 resize-y transition-all"
              placeholder={`e.g., Banana\nApple\nCherry or Banana,Apple,Cherry`}
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Sorting Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Sort Type:</label>
                <select
                  value={options.sortType}
                  onChange={(e) => handleOptionChange("sortType", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="alphabetical">Alphabetical</option>
                  <option value="length">Length</option>
                  <option value="numerical">Numerical</option>
                  <option value="custom">Custom Separator</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Sort Order:</label>
                <select
                  value={options.sortOrder}
                  onChange={(e) => handleOptionChange("sortOrder", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ascending">Ascending</option>
                  <option value="descending">Descending</option>
                </select>
              </div>
              {options.sortType === "custom" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Custom Separator:</label>
                  <input
                    type="text"
                    value={options.customSeparator}
                    onChange={(e) => handleOptionChange("customSeparator", e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., ,"
                    maxLength={5}
                  />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.caseSensitive}
                    onChange={() => handleOptionChange("caseSensitive", !options.caseSensitive)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Case Sensitive</span>
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
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.removeDuplicates}
                    onChange={() => handleOptionChange("removeDuplicates", !options.removeDuplicates)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Remove Duplicates</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.reverseAfterSort}
                    onChange={() => handleOptionChange("reverseAfterSort", !options.reverseAfterSort)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Reverse After Sort</span>
                </label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleSort}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <FaSort className="inline mr-2" />
              {isLoading ? "Sorting..." : "Sort Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {sortedText && (
              <button
                onClick={exportSortedText}
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
        {sortedText && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Sorted Text ({options.sortType}, {options.sortOrder})
            </h2>
            <pre className="mt-3 text-lg text-gray-700 whitespace-pre-wrap break-all">
              {sortedText}
            </pre>
            <div className="mt-4 text-sm text-gray-600">
              <p>Line Count: {sortText(inputText).lineCount}</p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(sortedText)}
              className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy Sorted Text
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Sorts (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.options.sortType} ({entry.options.sortOrder}): "{entry.output.slice(0, 30)}{entry.output.length > 30 ? "..." : ""}"
                  </span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setSortedText(entry.output);
                      setOptions(entry.options);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Sort by alphabetical, length, numerical, or custom separator</li>
            <li>Ascending or descending order</li>
            <li>Case sensitivity, trimming, and duplicate removal</li>
            <li>Custom separator and reverse sort options</li>
            <li>Export sorted text and history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextSorter;