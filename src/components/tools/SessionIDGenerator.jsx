"use client";

import React, { useState, useCallback } from "react";
import { generate } from "randomstring";
import { v4 as uuidv4 } from "uuid";
import { FaCopy, FaDownload, FaSync, FaCheck } from "react-icons/fa";

const SessionIDGenerator = () => {
  const [length, setLength] = useState(32);
  const [count, setCount] = useState(1);
  const [format, setFormat] = useState("alphanumeric");
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [includeTimestamp, setIncludeTimestamp] = useState(false);
  const [sessionIds, setSessionIds] = useState([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Generate session IDs
  const generateSessionIds = useCallback(() => {
    setError("");
    setSessionIds([]);
    setCopied(false);

    if (format !== "uuid" && (length < 8 || length > 128)) {
      setError("Length must be between 8 and 128 characters (except for UUID)");
      return;
    }
    if (count < 1 || count > 100) {
      setError("Number of IDs must be between 1 and 100");
      return;
    }
    if (prefix.length > 20 || suffix.length > 20) {
      setError("Prefix and Suffix must be 20 characters or less");
      return;
    }

    const timestamp = includeTimestamp ? `${Date.now()}_` : "";
    const newSessionIds = Array.from({ length: count }, () => {
      let id;
      switch (format) {
        case "uuid":
          id = uuidv4();
          break;
        case "hex":
          id = generate({ length, charset: "hex" });
          break;
        case "numeric":
          id = generate({ length, charset: "numeric" });
          break;
        case "alphanumeric":
        default:
          id = generate({ length, charset: "alphanumeric", capitalization: "uppercase" });
          break;
      }
      return `${prefix}${timestamp}${id}${suffix}`;
    });

    setSessionIds(newSessionIds);
  }, [length, count, format, prefix, suffix, includeTimestamp]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    generateSessionIds();
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (sessionIds.length > 0) {
      const text = sessionIds.join("\n");
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    }
  };

  // Download as text file
  const downloadIds = () => {
    if (sessionIds.length > 0) {
      const text = sessionIds.join("\n");
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `session-ids-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Clear all
  const clearAll = () => {
    setLength(32);
    setCount(1);
    setFormat("alphanumeric");
    setPrefix("");
    setSuffix("");
    setIncludeTimestamp(false);
    setSessionIds([]);
    setError("");
    setCopied(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Session ID Generator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Length (8-128) {format === "uuid" && "(Ignored for UUID)"}
              </label>
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                min={8}
                max={128}
                disabled={format === "uuid"}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of IDs (1-100)
              </label>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                min={1}
                max={100}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="alphanumeric">Alphanumeric (A-Z, 0-9)</option>
                <option value="numeric">Numeric (0-9)</option>
                <option value="hex">Hexadecimal (0-9, A-F)</option>
                <option value="uuid">UUID v4</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Include Timestamp
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeTimestamp}
                  onChange={(e) => setIncludeTimestamp(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-600">Add timestamp</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prefix (Max 20 chars)
              </label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value.slice(0, 20))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., SID_"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Suffix (Max 20 chars)
              </label>
              <input
                type="text"
                value={suffix}
                onChange={(e) => setSuffix(e.target.value.slice(0, 20))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., _2023"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Generate IDs
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-2 bg-red-50 text-red-700 text-sm text-center rounded-md">
            {error}
          </div>
        )}

        {/* Generated Session IDs */}
        {sessionIds.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Generated Session IDs ({sessionIds.length})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {copied ? <FaCheck className="mr-2" /> : <FaCopy className="mr-2" />}
                  {copied ? "Copied!" : "Copy All"}
                </button>
                <button
                  onClick={downloadIds}
                  className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border max-h-80 overflow-y-auto">
              <ul className="list-none font-mono text-sm space-y-2">
                {sessionIds.map((id, index) => (
                  <li key={index} className="py-1 break-all bg-white rounded-md p-2 shadow-sm">
                    {id}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-gray-600 mt-2 italic">
              These IDs are randomly generated and should be stored securely.
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Formats: Alphanumeric, Numeric, Hex, UUID v4</li>
            <li>Customizable length (8-128), count (1-100)</li>
            <li>Prefix, suffix, and optional timestamp</li>
            <li>Copy to clipboard and download as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SessionIDGenerator;