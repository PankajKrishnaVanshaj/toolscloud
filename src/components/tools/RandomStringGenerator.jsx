"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo, FaDice } from "react-icons/fa";

const RandomStringGenerator = () => {
  const [strings, setStrings] = useState([]);
  const [count, setCount] = useState(10);
  const [length, setLength] = useState(16);
  const [charSet, setCharSet] = useState("alphanumeric");
  const [customChars, setCustomChars] = useState("");
  const [separator, setSeparator] = useState("none");
  const [caseOption, setCaseOption] = useState("mixed"); // mixed, upper, lower
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const characterSets = {
    alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  };

  const generateString = useCallback(() => {
    let chars =
      charSet === "custom" && customChars
        ? customChars
        : charSet === "alphanumeric+symbols"
        ? characterSets.alphanumeric + characterSets.symbols
        : characterSets[charSet];
    if (!chars) chars = characterSets.alphanumeric; // Fallback

    const stringLength = Math.min(length, 128);
    const sep =
      separator === "hyphen"
        ? "-"
        : separator === "underscore"
        ? "_"
        : separator === "dot"
        ? "."
        : separator === "space"
        ? " "
        : "";

    let result;
    if (sep) {
      const segmentLength = Math.floor(stringLength / 4);
      const segments = [];
      for (let i = 0; i < 4; i++) {
        const remaining = stringLength - segments.length * (segmentLength + 1);
        const currentLength = i === 3 ? remaining : segmentLength;
        if (currentLength > 0) {
          segments.push(
            Array.from({ length: currentLength }, () =>
              chars.charAt(Math.floor(Math.random() * chars.length))
            ).join("")
          );
        }
      }
      result = segments.join(sep);
    } else {
      result = Array.from({ length: stringLength }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join("");
    }

    // Apply case option
    if (caseOption === "upper") return result.toUpperCase();
    if (caseOption === "lower") return result.toLowerCase();
    return result;
  }, [length, charSet, customChars, separator, caseOption]);

  const generateStrings = useCallback(() => {
    const newStrings = Array.from({ length: Math.min(count, 1000) }, generateString);
    setStrings(newStrings);
    setIsCopied(false);
    setHistory((prev) => [
      ...prev,
      { strings: newStrings, count, length, charSet, customChars, separator, caseOption },
    ].slice(-5));
  }, [count, length, charSet, customChars, separator, caseOption, generateString]);

  const copyToClipboard = () => {
    const text = strings.join("\n");
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const downloadAsText = () => {
    const text = strings.join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `strings-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearStrings = () => {
    setStrings([]);
    setIsCopied(false);
  };

  const restoreFromHistory = (entry) => {
    setStrings(entry.strings);
    setCount(entry.count);
    setLength(entry.length);
    setCharSet(entry.charSet);
    setCustomChars(entry.customChars);
    setSeparator(entry.separator);
    setCaseOption(entry.caseOption);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Random String Generator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Strings (1-1000)
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
                String Length (4-128)
              </label>
              <input
                type="number"
                min="4"
                max="128"
                value={length}
                onChange={(e) => setLength(Math.max(4, Math.min(128, Number(e.target.value) || 4)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Character Set
              </label>
              <select
                value={charSet}
                onChange={(e) => setCharSet(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="alphanumeric">Alphanumeric (A-Z, a-z, 0-9)</option>
                <option value="letters">Letters Only (A-Z, a-z)</option>
                <option value="numbers">Numbers Only (0-9)</option>
                <option value="alphanumeric+symbols">Alphanumeric + Symbols</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case
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
              {charSet === "custom" && (
                <div>
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
                  <option value="dot">Dot (.)</option>
                  <option value="space">Space</option>
                </select>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateStrings}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaDice className="mr-2" />
              Generate Strings
            </button>
            {strings.length > 0 && (
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
                  onClick={clearStrings}
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
        {strings.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Strings ({strings.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-64 overflow-y-auto font-mono text-sm">
              {strings.map((str, index) => (
                <div key={index} className="py-1 break-all">
                  {str}
                </div>
              ))}
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
                    {entry.count} strings ({entry.length} chars, {entry.charSet})
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
            <li>Generate alphanumeric, letters, numbers, or custom strings</li>
            <li>Control case (mixed, upper, lower)</li>
            <li>Custom separators (hyphen, underscore, dot, space)</li>
            <li>Copy, download, and track history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RandomStringGenerator;