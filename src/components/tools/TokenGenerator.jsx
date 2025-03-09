"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo, FaDice } from "react-icons/fa";

const TokenGenerator = () => {
  const [tokens, setTokens] = useState([]);
  const [count, setCount] = useState(10);
  const [length, setLength] = useState(32);
  const [format, setFormat] = useState("alphanumeric"); // alphanumeric, hex, base64, custom
  const [separator, setSeparator] = useState("none"); // none, hyphen, underscore, custom
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [customChars, setCustomChars] = useState("");
  const [caseOption, setCaseOption] = useState("mixed"); // mixed, upper, lower
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const generateToken = useCallback(() => {
    let characters;
    switch (format) {
      case "alphanumeric":
        characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        break;
      case "hex":
        characters = "0123456789ABCDEF";
        break;
      case "base64":
        characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        break;
      case "custom":
        characters = customChars || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        if (!characters) return "error: no custom characters";
        break;
      default:
        characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    }

    const sep = separator === "hyphen" ? "-" : separator === "underscore" ? "_" : separator === "custom" ? separator : "";
    const tokenLength = Math.min(length, 128) - prefix.length - suffix.length;
    if (tokenLength <= 0) return "error: length too short";

    let token = prefix;
    if (sep) {
      const segmentLength = Math.floor(tokenLength / 4);
      const segments = [];
      for (let i = 0; i < 4; i++) {
        const remaining = tokenLength - segments.length * segmentLength;
        const currentLength = i === 3 ? remaining : segmentLength;
        if (currentLength > 0) {
          segments.push(
            Array.from({ length: currentLength }, () =>
              characters.charAt(Math.floor(Math.random() * characters.length))
            ).join("")
          );
        }
      }
      token += segments.join(sep);
    } else {
      token += Array.from({ length: tokenLength }, () =>
        characters.charAt(Math.floor(Math.random() * characters.length))
      ).join("");
    }
    token += suffix;

    // Apply case option
    if (caseOption === "upper") token = token.toUpperCase();
    else if (caseOption === "lower") token = token.toLowerCase();

    return token;
  }, [length, format, separator, prefix, suffix, customChars, caseOption]);

  const generateTokens = useCallback(() => {
    const newTokens = Array.from({ length: Math.min(count, 1000) }, generateToken);
    if (newTokens.some((t) => t.startsWith("error"))) {
      alert(newTokens.find((t) => t.startsWith("error")));
      return;
    }
    setTokens(newTokens);
    setIsCopied(false);
    setHistory((prev) => [
      ...prev,
      { tokens: newTokens, options: { count, length, format, separator, prefix, suffix, customChars, caseOption } },
    ].slice(-5));
  }, [count, length, format, separator, prefix, suffix, customChars, caseOption, generateToken]);

  const copyToClipboard = () => {
    const text = tokens.join("\n");
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const downloadAsText = () => {
    const text = tokens.join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tokens-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearTokens = () => {
    setTokens([]);
    setIsCopied(false);
  };

  const restoreFromHistory = (entry) => {
    setTokens(entry.tokens);
    setCount(entry.options.count);
    setLength(entry.options.length);
    setFormat(entry.options.format);
    setSeparator(entry.options.separator);
    setPrefix(entry.options.prefix);
    setSuffix(entry.options.suffix);
    setCustomChars(entry.options.customChars);
    setCaseOption(entry.options.caseOption);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Token Generator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Tokens (1-1000)
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
                Token Length (8-128)
              </label>
              <input
                type="number"
                min="8"
                max="128"
                value={length}
                onChange={(e) => setLength(Math.max(8, Math.min(128, Number(e.target.value) || 8)))}
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
                <option value="alphanumeric">Alphanumeric (A-Z, a-z, 0-9)</option>
                <option value="hex">Hexadecimal (0-9, A-F)</option>
                <option value="base64">Base64 (A-Z, a-z, 0-9, +, /)</option>
                <option value="custom">Custom Characters</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case Option
              </label>
              <select
                value={caseOption}
                onChange={(e) => setCaseOption(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="mixed">Mixed Case</option>
                <option value="upper">Uppercase</option>
                <option value="lower">Lowercase</option>
              </select>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Advanced Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Separator:</label>
                <select
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">None</option>
                  <option value="hyphen">Hyphen (-)</option>
                  <option value="underscore">Underscore (_)</option>
                  <option value="custom">Custom (Next Field)</option>
                </select>
              </div>
              {separator === "custom" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Custom Separator:</label>
                  <input
                    type="text"
                    value={separator === "custom" ? separator : ""}
                    onChange={(e) => setSeparator(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., . or |"
                    maxLength={1}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Prefix:</label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., token_"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Suffix:</label>
                <input
                  type="text"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., _v1"
                />
              </div>
              {format === "custom" && (
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Custom Characters:</label>
                  <input
                    type="text"
                    value={customChars}
                    onChange={(e) => setCustomChars(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., ABC123!@#"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateTokens}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaDice className="mr-2" />
              Generate Tokens
            </button>
            {tokens.length > 0 && (
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
                  onClick={clearTokens}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>

          {/* Output */}
          {tokens.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Generated Tokens ({tokens.length}):
              </h2>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-64 overflow-y-auto font-mono text-sm break-all">
                {tokens.join("\n")}
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
                      {entry.tokens.length} tokens ({entry.options.length} chars, {entry.options.format})
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

          {/* Note */}
          <div className="mt-4 text-sm text-gray-600">
            <p>
              <strong>Note:</strong> These tokens are randomly generated for testing purposes only. For production, use cryptographically secure methods (e.g., `crypto.randomBytes`).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenGenerator;