"use client";

import React, { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo, FaDice } from "react-icons/fa";

const UUIDv4Generator = () => {
  const [uuids, setUuids] = useState([]);
  const [count, setCount] = useState(1);
  const [format, setFormat] = useState("standard"); // standard, uppercase, no-dashes
  const [separator, setSeparator] = useState("\n"); // Output separator
  const [prefix, setPrefix] = useState(""); // Prefix for each UUID
  const [suffix, setSuffix] = useState(""); // Suffix for each UUID
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const generateUUIDs = useCallback(() => {
    const newUuids = Array.from({ length: Math.min(count, 1000) }, () => {
      let uuid = uuidv4();
      if (format === "uppercase") uuid = uuid.toUpperCase();
      if (format === "no-dashes") uuid = uuid.replace(/-/g, "");
      return `${prefix}${uuid}${suffix}`;
    });
    setUuids(newUuids);
    setIsCopied(false);
    setHistory((prev) => [
      ...prev,
      { uuids: newUuids, count, format, separator, prefix, suffix },
    ].slice(-5));
  }, [count, format, prefix, suffix]);

  const copyToClipboard = () => {
    const text = uuids.join(separator);
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const downloadAsText = () => {
    const text = uuids.join(separator);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `uuidv4-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearUuids = () => {
    setUuids([]);
    setIsCopied(false);
  };

  const restoreFromHistory = (entry) => {
    setUuids(entry.uuids);
    setCount(entry.count);
    setFormat(entry.format);
    setSeparator(entry.separator);
    setPrefix(entry.prefix);
    setSuffix(entry.suffix);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced UUID v4 Generator
        </h1>

        <div className="space-y-6">
          {/* Input Controls */}
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
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="standard">Standard (8-4-4-4-12)</option>
                <option value="uppercase">Uppercase</option>
                <option value="no-dashes">No Dashes</option>
              </select>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Advanced Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Prefix:</label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., id-"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Suffix:</label>
                <input
                  type="text"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., -v4"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Separator:</label>
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
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateUUIDs}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
            >
              <FaDice className="mr-2" />
              Generate UUIDs
            </button>
            {uuids.length > 0 && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center ${
                    isCopied
                      ? "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                      : "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500"
                  }`}
                >
                  <FaCopy className="mr-2" />
                  {isCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={downloadAsText}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
                <button
                  onClick={clearUuids}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center"
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
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated UUID v4 ({uuids.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-64 overflow-y-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                {uuids.map((uuid, index) => (
                  <div key={index} className="py-1">
                    {index + 1}. {uuid}
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
                    {entry.uuids.length} UUIDs ({entry.format}, {entry.prefix || "no"} prefix,{" "}
                    {entry.suffix || "no"} suffix)
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
            <li>Generate 1-1000 UUID v4 identifiers</li>
            <li>Formats: Standard, Uppercase, No Dashes</li>
            <li>Custom prefix, suffix, and output separator</li>
            <li>Copy, download, and track history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UUIDv4Generator;