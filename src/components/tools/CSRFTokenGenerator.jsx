"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaSync } from "react-icons/fa";

const CSRFTokenGenerator = () => {
  const [tokenLength, setTokenLength] = useState(32);
  const [tokenCount, setTokenCount] = useState(1);
  const [tokens, setTokens] = useState([]);
  const [error, setError] = useState("");
  const [format, setFormat] = useState("hex"); // New: hex, base64, alphanumeric
  const [prefix, setPrefix] = useState(""); // New: custom prefix
  const [includeTimestamp, setIncludeTimestamp] = useState(false); // New: timestamp option

  // Generate secure CSRF token based on format
  const generateToken = useCallback(() => {
    const array = new Uint8Array(tokenLength / 2);
    window.crypto.getRandomValues(array);

    let token;
    if (format === "hex") {
      token = Array.from(array)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    } else if (format === "base64") {
      token = btoa(String.fromCharCode(...array))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    } else if (format === "alphanumeric") {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      token = Array.from(array)
        .map((byte) => chars[byte % chars.length])
        .join("")
        .slice(0, tokenLength);
    }

    const timestamp = includeTimestamp ? `${Date.now()}-` : "";
    return `${prefix}${timestamp}${token}`.slice(0, Math.max(tokenLength, prefix.length + (includeTimestamp ? 14 : 0) + token.length));
  }, [tokenLength, format, prefix, includeTimestamp]);

  // Generate multiple tokens
  const generateTokens = () => {
    setError("");
    setTokens([]);

    if (tokenLength < 16 || tokenLength > 128) {
      setError("Token length must be between 16 and 128 characters");
      return;
    }
    if (tokenCount < 1 || tokenCount > 50) {
      setError("Number of tokens must be between 1 and 50");
      return;
    }
    if (prefix.length > 20) {
      setError("Prefix must not exceed 20 characters");
      return;
    }

    const newTokens = Array.from({ length: tokenCount }, generateToken);
    setTokens(newTokens);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    generateTokens();
  };

  // Copy tokens to clipboard
  const copyToClipboard = () => {
    if (tokens.length > 0) {
      const text = tokens.join("\n");
      navigator.clipboard.writeText(text);
    }
  };

  // Download tokens as text file
  const downloadTokens = () => {
    if (tokens.length > 0) {
      const blob = new Blob([tokens.join("\n")], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `csrf-tokens-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Clear all
  const clearAll = () => {
    setTokenLength(32);
    setTokenCount(1);
    setTokens([]);
    setError("");
    setFormat("hex");
    setPrefix("");
    setIncludeTimestamp(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          CSRF Token Generator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Token Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token Length (16-128)
              </label>
              <input
                type="number"
                value={tokenLength}
                onChange={(e) => setTokenLength(parseInt(e.target.value))}
                min={16}
                max={128}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended: 32+ characters
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Tokens (1-50)
              </label>
              <input
                type="number"
                value={tokenCount}
                onChange={(e) => setTokenCount(parseInt(e.target.value))}
                min={1}
                max={50}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="hex">Hexadecimal</option>
                <option value="base64">Base64 URL-safe</option>
                <option value="alphanumeric">Alphanumeric</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prefix (Optional, max 20 chars)
              </label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value.slice(0, 20))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., csrf_"
              />
            </div>
          </div>

          {/* Additional Options */}
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeTimestamp}
                onChange={(e) => setIncludeTimestamp(e.target.checked)}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Include Timestamp</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Generate Tokens
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="flex-1 py-2 px-6 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {/* Generated Tokens */}
        {tokens.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-800">
                Generated CSRF Tokens ({tokens.length})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FaCopy className="mr-2" /> Copy All
                </button>
                <button
                  onClick={downloadTokens}
                  className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border max-h-64 overflow-y-auto">
              <ul className="list-disc pl-5 font-mono text-sm space-y-2">
                {tokens.map((token, index) => (
                  <li key={index} className="break-all">{token}</li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Securely store these tokens and associate them with user sessions to prevent CSRF attacks.
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Cryptographically secure token generation</li>
            <li>Multiple formats: Hex, Base64, Alphanumeric</li>
            <li>Custom prefix and timestamp options</li>
            <li>Copy to clipboard and download as text file</li>
          </ul>
        </div>

        
      </div>
    </div>
  );
};

export default CSRFTokenGenerator;