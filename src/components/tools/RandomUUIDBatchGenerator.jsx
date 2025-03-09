"use client";

import React, { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo, FaDice } from "react-icons/fa";

const RandomUUIDBatchGenerator = () => {
  const [uuids, setUuids] = useState([]);
  const [count, setCount] = useState(10);
  const [format, setFormat] = useState("standard"); // standard, uppercase, no-dashes
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    separator: "\n", // Output separator
    prefix: "",     // Prefix for each UUID
    suffix: "",     // Suffix for each UUID
    includeIndex: false, // Include numbering
  });

  // Generate UUIDs with options
  const generateUUIDs = useCallback(() => {
    const newUuids = Array.from({ length: Math.min(count, 1000) }, () => {
      let uuid = uuidv4();
      if (format === "uppercase") uuid = uuid.toUpperCase();
      if (format === "no-dashes") uuid = uuid.replace(/-/g, "");
      if (options.prefix) uuid = `${options.prefix}${uuid}`;
      if (options.suffix) uuid = `${uuid}${options.suffix}`;
      return uuid;
    });
    setUuids(newUuids);
    setIsCopied(false);
    setHistory((prev) => [
      ...prev,
      { uuids: newUuids, count, format, options },
    ].slice(-5));
  }, [count, format, options]);

  // Copy to clipboard
  const copyToClipboard = () => {
    const text = uuids.map((uuid, i) => (options.includeIndex ? `${i + 1}. ${uuid}` : uuid)).join(options.separator);
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  // Download as text file
  const downloadAsText = () => {
    const text = uuids.map((uuid, i) => (options.includeIndex ? `${i + 1}. ${uuid}` : uuid)).join(options.separator);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `uuid-batch-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Clear UUIDs
  const clearUuids = () => {
    setUuids([]);
    setIsCopied(false);
  };

  // Handle option change
  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  // Restore from history
  const restoreFromHistory = (entry) => {
    setUuids(entry.uuids);
    setCount(entry.count);
    setFormat(entry.format);
    setOptions(entry.options);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Random UUID Batch Generator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of UUIDs (1-1000)
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
                UUID Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="standard">Standard (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)</option>
                <option value="uppercase">Uppercase</option>
                <option value="no-dashes">No Dashes</option>
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
                <label className="block text-sm text-gray-600 mb-1">Prefix:</label>
                <input
                  type="text"
                  value={options.prefix}
                  onChange={(e) => handleOptionChange("prefix", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., id-"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Suffix:</label>
                <input
                  type="text"
                  value={options.suffix}
                  onChange={(e) => handleOptionChange("suffix", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., -v4"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeIndex}
                  onChange={() => handleOptionChange("includeIndex", !options.includeIndex)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">Include Index</label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateUUIDs}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaDice className="mr-2" />
              Generate UUIDs
            </button>
            {uuids.length > 0 && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md text-white transition-colors font-medium flex items-center justify-center ${
                    isCopied ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
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
                  onClick={clearUuids}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Generated UUIDs */}
        {uuids.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">
              Generated UUIDs ({uuids.length}):
            </h2>
            <div className="mt-2 bg-gray-50 p-4 rounded-md border border-gray-200 max-h-64 overflow-y-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                {uuids.map((uuid, index) => (
                  <div key={index} className="py-1">
                    {options.includeIndex ? `${index + 1}. ${uuid}` : uuid}
                  </div>
                ))}
              </pre>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Generations (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.uuids.length} UUIDs ({entry.format}, {entry.count})
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
            <li>Generate UUID v4 in standard, uppercase, or no-dashes format</li>
            <li>Custom separators, prefixes, and suffixes</li>
            <li>Option to include index numbering</li>
            <li>Copy, download, and track history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RandomUUIDBatchGenerator;