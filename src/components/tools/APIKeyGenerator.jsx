"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaKey,
} from "react-icons/fa";

const APIKeyGenerator = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [count, setCount] = useState(10);
  const [length, setLength] = useState(32);
  const [format, setFormat] = useState("alphanumeric");
  const [prefix, setPrefix] = useState("api_");
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    case: "mixed", // uppercase, lowercase, mixed
    separator: "\n", // Output separator
    includeSpecial: false, // Include special characters
  });

  const generateAPIKey = () => {
    let characters;
    switch (format) {
      case "alphanumeric":
        characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" +
          (options.includeSpecial ? "-_!@#$%" : "");
        break;
      case "hex":
        characters = "0123456789ABCDEF";
        break;
      case "base64":
        characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        break;
      default:
        characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    }

    const keyLength = Math.max(1, Math.min(length, 128) - prefix.length);
    let key = prefix;
    for (let i = 0; i < keyLength; i++) {
      key += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Apply case preference
    if (options.case === "uppercase") return key.toUpperCase();
    if (options.case === "lowercase") return key.toLowerCase();
    return key;
  };

  const generateAPIKeys = useCallback(() => {
    if (length - prefix.length < 1) {
      alert("Key length must be greater than prefix length.");
      return;
    }
    const newApiKeys = Array.from({ length: Math.min(count, 1000) }, generateAPIKey);
    setApiKeys(newApiKeys);
    setIsCopied(false);
    setHistory((prev) => [
      ...prev,
      { keys: newApiKeys, options: { count, length, format, prefix, ...options } },
    ].slice(-5));
  }, [count, length, format, prefix, options]);

  const copyToClipboard = () => {
    const text = apiKeys.join(options.separator);
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const downloadAsText = () => {
    const text = apiKeys.join(options.separator);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `api-keys-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearAPIKeys = () => {
    setApiKeys([]);
    setIsCopied(false);
  };

  const handleOptionChange = (option, value) => {
    setOptions((prev) => ({ ...prev, [option]: value }));
  };

  const restoreFromHistory = (entry) => {
    setApiKeys(entry.keys);
    setCount(entry.options.count);
    setLength(entry.options.length);
    setFormat(entry.options.format);
    setPrefix(entry.options.prefix);
    setOptions(entry.options);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
          API Key Generator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Keys (1-1000)
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Length (8-128)
              </label>
              <input
                type="number"
                min="8"
                max="128"
                value={length}
                onChange={(e) => setLength(Math.max(8, Math.min(128, Number(e.target.value) || 8)))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="alphanumeric">Alphanumeric (A-Z, a-z, 0-9)</option>
                <option value="hex">Hexadecimal (0-9, A-F)</option>
                <option value="base64">Base64 (A-Z, a-z, 0-9, +, /)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prefix (optional)
              </label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., api_"
              />
            </div>
          </div>

          {/* Advanced Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Advanced Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Case:</label>
                <select
                  value={options.case}
                  onChange={(e) => handleOptionChange("case", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mixed">Mixed Case</option>
                  <option value="uppercase">Uppercase</option>
                  <option value="lowercase">Lowercase</option>
                </select>
              </div>
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
              {format === "alphanumeric" && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={options.includeSpecial}
                    onChange={() => handleOptionChange("includeSpecial", !options.includeSpecial)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-600">Include Special (-_!@#$%)</label>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateAPIKeys}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold flex items-center justify-center"
            >
              <FaKey className="mr-2" />
              Generate Keys
            </button>
            {apiKeys.length > 0 && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-3 rounded-lg text-white transition-all font-semibold flex items-center justify-center ${
                    isCopied ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" />
                  {isCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={downloadAsText}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
                <button
                  onClick={clearAPIKeys}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Output Display */}
        {apiKeys.length > 0 && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Generated API Keys ({apiKeys.length}):
            </h2>
            <div className="mt-3 text-lg text-gray-700 whitespace-pre-wrap break-words max-h-64 overflow-y-auto font-mono">
              {apiKeys.join(options.separator)}
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
                    {entry.keys.length} keys ({entry.options.length} chars, {entry.options.format})
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

        {/* Notes */}
        <div className="mt-6 p-4 bg-yellow-100 rounded-lg border border-yellow-300">
          <h3 className="font-semibold text-yellow-700">Note</h3>
          <p className="text-sm text-yellow-600">
            These are randomly generated API keys for testing purposes only. For production use,
            ensure keys are cryptographically secure and managed properly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default APIKeyGenerator;