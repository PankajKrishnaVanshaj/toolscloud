"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo, FaDice } from "react-icons/fa";

const GUIDGenerator = () => {
  const [guids, setGuids] = useState([]);
  const [count, setCount] = useState(10);
  const [format, setFormat] = useState("standard"); // standard, uppercase, no-dashes
  const [separator, setSeparator] = useState("\n"); // Output separator
  const [useBraces, setUseBraces] = useState(false); // Wrap in braces
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);

  // Generate a Version 4 UUID/GUID
  const generateGUID = useCallback(() => {
    const hex = () => Math.floor(Math.random() * 16).toString(16);
    let guid = (
      Array(8).fill().map(hex).join("") + "-" +
      Array(4).fill().map(hex).join("") + "-" +
      "4" + Array(3).fill().map(hex).join("") + "-" + // Version 4
      ["8", "9", "a", "b"][Math.floor(Math.random() * 4)] + Array(3).fill().map(hex).join("") + "-" + // Variant
      Array(12).fill().map(hex).join("")
    );

    if (format === "uppercase") guid = guid.toUpperCase();
    if (format === "no-dashes") guid = guid.replace(/-/g, "");
    if (useBraces) guid = `{${guid}}`;

    return guid;
  }, [format, useBraces]);

  const generateGUIDs = () => {
    const newGuids = Array.from({ length: Math.min(count, 1000) }, generateGUID);
    setGuids(newGuids);
    setIsCopied(false);
    setHistory((prev) => [
      ...prev,
      { guids: newGuids, count, format, separator, useBraces },
    ].slice(-5));
  };

  const copyToClipboard = () => {
    const text = guids.join(separator);
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const downloadAsText = () => {
    const text = guids.join(separator);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `guids-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearGUIDs = () => {
    setGuids([]);
    setIsCopied(false);
  };

  const restoreFromHistory = (entry) => {
    setGuids(entry.guids);
    setCount(entry.count);
    setFormat(entry.format);
    setSeparator(entry.separator);
    setUseBraces(entry.useBraces);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced GUID Generator
        </h1>

        <div className="space-y-6">
          {/* Input Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of GUIDs (1-1000)
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
                <option value="standard">Standard (e.g., 550e8400-e29b-41d4-a716-446655440000)</option>
                <option value="uppercase">Uppercase (e.g., 550E8400-E29B-41D4-A716-446655440000)</option>
                <option value="no-dashes">No Dashes (e.g., 550e8400e29b41d4a716446655440000)</option>
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
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="\n">Newline</option>
                  <option value=", ">Comma</option>
                  <option value=" ">Space</option>
                  <option value="; ">Semicolon</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={useBraces}
                  onChange={() => setUseBraces(!useBraces)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">Wrap in Braces (e.g., {`550e8400-...`})</label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateGUIDs}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaDice className="mr-2" />
              Generate GUIDs
            </button>
            {guids.length > 0 && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
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
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
                <button
                  onClick={clearGUIDs}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Generated GUIDs */}
        {guids.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated GUIDs ({guids.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto font-mono text-gray-800 whitespace-pre-wrap">
              {guids.join(separator)}
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
                    {entry.guids.length} GUIDs ({entry.format}, {entry.useBraces ? "with braces" : "no braces"})
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

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Generate Version 4 UUIDs/GUIDs</li>
            <li>Formats: Standard, Uppercase, No Dashes</li>
            <li>Custom output separators and optional braces</li>
            <li>Copy, download, and track history</li>
          </ul>
          <p className="text-blue-600 text-sm mt-2">
            <strong>Note:</strong> These are random Version 4 UUIDs for testing purposes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GUIDGenerator;