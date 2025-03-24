"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaHistory, FaUndo, FaPlay } from "react-icons/fa";

const RegexGenerator = () => {
  const [patternType, setPatternType] = useState("email");
  const [customPattern, setCustomPattern] = useState("");
  const [options, setOptions] = useState({
    caseInsensitive: false,
    global: false,
    multiline: false,
    dotAll: false,
  });
  const [regex, setRegex] = useState("");
  const [testInput, setTestInput] = useState("");
  const [matches, setMatches] = useState([]);
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  // Predefined regex patterns
  const patterns = {
    email: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/,
    phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
    url: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
    number: /\d+/,
    date: /\b\d{4}-\d{2}-\d{2}\b/,
    alphanumeric: /[a-zA-Z0-9]+/,
    ip: /\b(?:\d{1,3}\.){3}\d{1,3}\b/,
    hex: /#?[0-9A-Fa-f]{6}\b/,
    custom: null, // Placeholder for custom input
  };

  // Generate regex with options
  const generateRegex = useCallback(() => {
    try {
      setError("");
      let flags = "";
      if (options.caseInsensitive) flags += "i";
      if (options.global) flags += "g";
      if (options.multiline) flags += "m";
      if (options.dotAll) flags += "s";

      let basePattern = patternType === "custom" ? customPattern : patterns[patternType].source;
      if (!basePattern) {
        setError("Please enter a custom pattern for 'Custom' type");
        return;
      }

      const regexString = `/${basePattern}/${flags}`;
      setRegex(regexString);
      testRegex(regexString);
      setHistory((prev) => [
        ...prev,
        { patternType, customPattern, options, regex: regexString, testInput },
      ].slice(-5));
      setIsCopied(false);
    } catch (err) {
      setError(`Invalid regex pattern: ${err.message}`);
    }
  }, [patternType, customPattern, options, testInput]);

  // Test regex against input
  const testRegex = (regexString) => {
    try {
      const flagStr = regexString.split("/")[2] || "";
      const patternStr = regexString.slice(1, regexString.lastIndexOf("/"));
      const regexObj = new RegExp(patternStr, flagStr);
      const foundMatches = options.global
        ? [...testInput.matchAll(regexObj)].map((match) => match[0])
        : testInput.match(regexObj) || [];
      setMatches(foundMatches);
      setError("");
    } catch (err) {
      setMatches([]);
      setError(`Regex test failed: ${err.message}`);
    }
  };

  // Handle option change
  const handleOptionChange = (option) => {
    setOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (!regex) return;
    navigator.clipboard
      .writeText(regex)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  // Clear all fields
  const clearAll = () => {
    setRegex("");
    setTestInput("");
    setMatches([]);
    setCustomPattern("");
    setIsCopied(false);
    setError("");
  };

  // Restore from history
  const restoreFromHistory = (entry) => {
    setPatternType(entry.patternType);
    setCustomPattern(entry.customPattern || "");
    setOptions(entry.options);
    setRegex(entry.regex);
    setTestInput(entry.testInput);
    testRegex(entry.regex);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Regex Generator
        </h1>

        <div className="space-y-6">
          {/* Pattern Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pattern Type
            </label>
            <select
              value={patternType}
              onChange={(e) => setPatternType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="email">Email</option>
              <option value="phone">Phone Number</option>
              <option value="url">URL</option>
              <option value="number">Number</option>
              <option value="date">Date (YYYY-MM-DD)</option>
              <option value="alphanumeric">Alphanumeric</option>
              <option value="ip">IP Address</option>
              <option value="hex">Hex Color</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Custom Pattern Input */}
          {patternType === "custom" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Pattern
              </label>
              <input
                type="text"
                value={customPattern}
                onChange={(e) => setCustomPattern(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your custom regex (e.g., [a-z]+)"
              />
            </div>
          )}

          {/* Regex Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Regex Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {["caseInsensitive", "global", "multiline", "dotAll"].map((opt) => (
                <div key={opt} className="flex items-center">
                  <input
                    type="checkbox"
                    id={opt}
                    checked={options[opt]}
                    onChange={() => handleOptionChange(opt)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={opt} className="ml-2 text-sm text-gray-700">
                    {opt === "caseInsensitive" && "Case Insensitive (i)"}
                    {opt === "global" && "Global Match (g)"}
                    {opt === "multiline" && "Multiline (m)"}
                    {opt === "dotAll" && "Dot All (s)"}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Test Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Input
            </label>
            <textarea
              value={testInput}
              onChange={(e) => {
                setTestInput(e.target.value);
                if (regex) testRegex(regex);
              }}
              className="w-full h-32 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter text to test the regex against"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateRegex}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaPlay className="mr-2" />
              Generate Regex
            </button>
            {regex && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md text-white transition-colors flex items-center justify-center ${
                    isCopied ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" />
                  {isCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={clearAll}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>

          {/* Error Message */}
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          {/* Generated Output */}
          {regex && (
            <div className="mt-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Generated Regex:</h2>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
                    {regex}
                  </pre>
                </div>
              </div>

              {testInput && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-700 mb-2">
                    Matches ({matches.length || 0}):
                  </h2>
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-48 overflow-auto">
                    {matches.length > 0 ? (
                      <ul className="list-disc list-inside text-gray-800">
                        {matches.map((match, index) => (
                          <li key={index} className="py-1 break-all">{match}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">No matches found</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold text-gray-700 flex items-center">
                <FaHistory className="mr-2" /> Recent Patterns (Last 5)
              </h3>
              <ul className="mt-2 text-sm text-gray-600 space-y-2">
                {history.slice().reverse().map((entry, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>
                      {entry.patternType === "custom" ? "Custom" : entry.patternType}:{" "}
                      {entry.regex.slice(0, 20)}...
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
              <li>Predefined patterns for common use cases</li>
              <li>Custom regex pattern input</li>
              <li>Flags: case-insensitive, global, multiline, dot-all</li>
              <li>Test input and view matches in real-time</li>
              <li>Copy and track recent patterns</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegexGenerator;