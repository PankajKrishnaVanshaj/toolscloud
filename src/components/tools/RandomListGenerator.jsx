"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo, FaDice } from "react-icons/fa";

const RandomListGenerator = () => {
  const [items, setItems] = useState("");
  const [generatedList, setGeneratedList] = useState([]);
  const [count, setCount] = useState(5);
  const [order, setOrder] = useState("random"); // random, alphabetical, reverse, custom
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    separator: "\n", // Output separator
    caseSensitive: false, // Preserve case for sorting
    prefixEach: "", // Prefix for each item
  });

  // Generate random list
  const generateList = useCallback(() => {
    if (!items.trim()) {
      setGeneratedList(["Please enter some items!"]);
      return;
    }

    const itemArray = items.split("\n").map((item) => item.trim()).filter(Boolean);
    if (itemArray.length === 0) {
      setGeneratedList(["No valid items found!"]);
      return;
    }

    let result = [];
    if (allowDuplicates) {
      for (let i = 0; i < Math.min(count, 1000); i++) {
        result.push(itemArray[Math.floor(Math.random() * itemArray.length)]);
      }
    } else {
      const shuffled = [...itemArray].sort(() => Math.random() - 0.5);
      result = shuffled.slice(0, Math.min(count, itemArray.length));
    }

    // Apply ordering
    switch (order) {
      case "alphabetical":
        result.sort(options.caseSensitive ? undefined : (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        break;
      case "reverse":
        result.sort(options.caseSensitive ? (a, b) => b.localeCompare(a) : (a, b) => b.toLowerCase().localeCompare(a.toLowerCase()));
        break;
      case "custom":
        result.sort((a, b) => a.length - b.length); // Sort by length as an example
        break;
      case "random":
      default:
        break;
    }

    // Apply prefix if specified
    if (options.prefixEach) {
      result = result.map((item) => `${options.prefixEach}${item}`);
    }

    setGeneratedList(result);
    setHistory((prev) => [
      ...prev,
      { items: itemArray, generated: result, count, order, allowDuplicates, options },
    ].slice(-5));
    setIsCopied(false);
  }, [items, count, order, allowDuplicates, options]);

  // Copy to clipboard
  const copyToClipboard = () => {
    const text = generatedList.join(options.separator);
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  // Download as text
  const downloadAsText = () => {
    const text = generatedList.join(options.separator);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `random-list-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Clear all
  const clearAll = () => {
    setItems("");
    setGeneratedList([]);
    setIsCopied(false);
  };

  // Restore from history
  const restoreFromHistory = (entry) => {
    setItems(entry.items.join("\n"));
    setGeneratedList(entry.generated);
    setCount(entry.count);
    setOrder(entry.order);
    setAllowDuplicates(entry.allowDuplicates);
    setOptions(entry.options);
    setIsCopied(false);
  };

  // Handle option change
  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Random List Generator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Items (one per line)
            </label>
            <textarea
              value={items}
              onChange={(e) => setItems(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter items, one per line..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Items (1-1000)
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <select
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="random">Random</option>
                <option value="alphabetical">Alphabetical</option>
                <option value="reverse">Reverse Alphabetical</option>
                <option value="custom">By Length</option>
              </select>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Advanced Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Output Separator:</label>
                <select
                  value={options.separator}
                  onChange={(e) => handleOptionChange("separator", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="\n">Newline</option>
                  <option value=", ">Comma</option>
                  <option value=" ">Space</option>
                  <option value="; ">Semicolon</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Prefix Each Item:</label>
                <input
                  type="text"
                  value={options.prefixEach}
                  onChange={(e) => handleOptionChange("prefixEach", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Item-"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allowDuplicates"
                  checked={allowDuplicates}
                  onChange={(e) => setAllowDuplicates(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allowDuplicates" className="text-sm text-gray-600">
                  Allow Duplicates
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="caseSensitive"
                  checked={options.caseSensitive}
                  onChange={(e) => handleOptionChange("caseSensitive", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="caseSensitive" className="text-sm text-gray-600">
                  Case-Sensitive Sorting
                </label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateList}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaDice className="mr-2" />
              Generate List
            </button>
            {generatedList.length > 0 && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors font-medium flex items-center justify-center ${
                    isCopied
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" />
                  {isCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={downloadAsText}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
                <button
                  onClick={clearAll}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Generated List */}
        {generatedList.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Generated List ({generatedList.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-64 overflow-auto whitespace-pre-wrap">
              {generatedList.join(options.separator)}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Lists (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.generated.length} items ({entry.order}, {entry.allowDuplicates ? "with" : "no"} duplicates)
                  </span>
                  <button
                    onClick={() => restoreFromHistory(entry)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
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
            <li>Generate random lists with or without duplicates</li>
            <li>Sort alphabetically, reverse, by length, or keep random</li>
            <li>Custom separators and item prefixes</li>
            <li>Copy, download, and track recent lists</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RandomListGenerator;