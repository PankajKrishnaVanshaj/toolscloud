"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo, FaDice } from "react-icons/fa";

const RandomBooleanGenerator = () => {
  const [booleans, setBooleans] = useState([]);
  const [count, setCount] = useState(10);
  const [format, setFormat] = useState("text"); // text, number, emoji, json
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    probability: 0.5,      // Probability of true (0.0 to 1.0)
    separator: "\n",       // Output separator
    trueText: "true",      // Custom true text
    falseText: "false",    // Custom false text
  });

  const generateBooleans = useCallback(() => {
    const newBooleans = Array.from({ length: Math.min(count, 1000) }, () => {
      const value = Math.random() < options.probability;
      switch (format) {
        case "text":
          return value ? options.trueText : options.falseText;
        case "number":
          return value ? "1" : "0";
        case "emoji":
          return value ? "✅" : "❌";
        case "json":
          return JSON.stringify(value);
        default:
          return value ? options.trueText : options.falseText;
      }
    });
    setBooleans(newBooleans);
    setIsCopied(false);
    setHistory((prev) => [
      ...prev,
      { booleans: newBooleans, count, format, options },
    ].slice(-5));
  }, [count, format, options]);

  const copyToClipboard = () => {
    const text = booleans.join(options.separator);
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const downloadAsText = () => {
    const text = booleans.join(options.separator);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `booleans-${Date.now()}.${format === "json" ? "json" : "txt"}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearBooleans = () => {
    setBooleans([]);
    setIsCopied(false);
  };

  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const restoreFromHistory = (entry) => {
    setBooleans(entry.booleans);
    setCount(entry.count);
    setFormat(entry.format);
    setOptions(entry.options);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Advanced Random Boolean Generator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Booleans (1-1000)
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
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="text">Text (true/false)</option>
                <option value="number">Number (1/0)</option>
                <option value="emoji">Emoji (✅/❌)</option>
                <option value="json">JSON (true/false)</option>
              </select>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Advanced Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">True Probability (0-1):</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={options.probability}
                  onChange={(e) =>
                    handleOptionChange("probability", Math.max(0, Math.min(1, Number(e.target.value) || 0.5)))
                  }
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Separator:</label>
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
              {format === "text" && (
                <>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">True Text:</label>
                    <input
                      type="text"
                      value={options.trueText}
                      onChange={(e) => handleOptionChange("trueText", e.target.value || "true")}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., yes"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">False Text:</label>
                    <input
                      type="text"
                      value={options.falseText}
                      onChange={(e) => handleOptionChange("falseText", e.target.value || "false")}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., no"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateBooleans}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaDice className="mr-2" />
              Generate Booleans
            </button>
            {booleans.length > 0 && (
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
                  onClick={clearBooleans}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Output Display */}
        {booleans.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Booleans ({booleans.length}):
            </h2>
            <div className="bg-white p-4 rounded-md border border-gray-200 max-h-64 overflow-y-auto whitespace-pre-wrap font-mono text-gray-800">
              {booleans.join(options.separator)}
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
                    {entry.booleans.length} booleans ({entry.format}, P={entry.options.probability})
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
            <li>Formats: Text, Number, Emoji, JSON</li>
            <li>Custom true/false text (for text format)</li>
            <li>Adjustable true probability</li>
            <li>Custom output separators</li>
            <li>Copy, download, and track history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RandomBooleanGenerator;