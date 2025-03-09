"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo } from "react-icons/fa";

const UsernameGenerator = () => {
  const [usernames, setUsernames] = useState([]);
  const [count, setCount] = useState(10);
  const [length, setLength] = useState(8);
  const [style, setStyle] = useState("random"); // random, name-based, word-based
  const [includeNumbers, setIncludeNumbers] = useState(false);
  const [separator, setSeparator] = useState("none"); // none, hyphen, underscore
  const [caseStyle, setCaseStyle] = useState("lowercase"); // lowercase, uppercase, camel
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);

  // Sample data for generation
  const firstNames = ["john", "jane", "alex", "emma", "chris", "sophia", "mike", "lisa"];
  const lastNames = ["smith", "doe", "johnson", "brown", "wilson", "taylor", "davis", "clark"];
  const words = ["cloud", "star", "river", "forest", "moon", "sky", "wind", "stone"];

  const generateUsername = useCallback(() => {
    const getRandomString = (len) => {
      const chars = "abcdefghijklmnopqrstuvwxyz";
      return Array.from({ length: len }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join("");
    };

    const getNumber = () => Math.floor(Math.random() * 1000);

    const applyCaseStyle = (text) => {
      switch (caseStyle) {
        case "uppercase":
          return text.toUpperCase();
        case "camel":
          return text.replace(/(^\w|\b\w)/g, (char) => char.toUpperCase());
        case "lowercase":
        default:
          return text.toLowerCase();
      }
    };

    let username = "";
    const sep = separator === "hyphen" ? "-" : separator === "underscore" ? "_" : "";

    switch (style) {
      case "random":
        username = getRandomString(length);
        break;
      case "name-based":
        const first = firstNames[Math.floor(Math.random() * firstNames.length)];
        const last = lastNames[Math.floor(Math.random() * lastNames.length)];
        username = separator === "none" ? `${first}${last}` : `${first}${sep}${last}`;
        break;
      case "word-based":
        const word1 = words[Math.floor(Math.random() * words.length)];
        const word2 = words[Math.floor(Math.random() * words.length)];
        username = separator === "none" ? `${word1}${word2}` : `${word1}${sep}${word2}`;
        break;
      default:
        username = getRandomString(length);
    }

    // Apply prefix and suffix
    if (prefix) username = separator === "none" ? `${prefix}${username}` : `${prefix}${sep}${username}`;
    if (suffix) username = separator === "none" ? `${username}${suffix}` : `${username}${sep}${suffix}`;

    // Trim or pad to desired length (before numbers)
    if (username.length > length && !includeNumbers) {
      username = username.slice(0, length);
    } else if (username.length < length && !includeNumbers) {
      username += getRandomString(length - username.length);
    }

    // Add numbers if selected
    if (includeNumbers) {
      const num = getNumber();
      username = separator === "none" ? `${username}${num}` : `${username}${sep}${num}`;
      if (username.length > length) username = username.slice(0, length); // Trim after numbers
    }

    return applyCaseStyle(username);
  }, [length, style, separator, caseStyle, prefix, suffix, includeNumbers]);

  const generateUsernames = () => {
    const newUsernames = Array.from({ length: Math.min(count, 1000) }, generateUsername);
    setUsernames(newUsernames);
    setIsCopied(false);
    setHistory((prev) => [
      ...prev,
      {
        usernames: newUsernames,
        options: { count, length, style, includeNumbers, separator, caseStyle, prefix, suffix },
      },
    ].slice(-5));
  };

  const copyToClipboard = () => {
    const text = usernames.join("\n");
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const downloadAsText = () => {
    const text = usernames.join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `usernames-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearUsernames = () => {
    setUsernames([]);
    setIsCopied(false);
  };

  const restoreFromHistory = (entry) => {
    setUsernames(entry.usernames);
    setCount(entry.options.count);
    setLength(entry.options.length);
    setStyle(entry.options.style);
    setIncludeNumbers(entry.options.includeNumbers);
    setSeparator(entry.options.separator);
    setCaseStyle(entry.options.caseStyle);
    setPrefix(entry.options.prefix);
    setSuffix(entry.options.suffix);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">
          Advanced Username Generator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Usernames (1-1000)
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
                Username Length (4-20)
              </label>
              <input
                type="number"
                min="4"
                max="20"
                value={length}
                onChange={(e) => setLength(Math.max(4, Math.min(20, Number(e.target.value) || 4)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="random">Random (e.g., xk7p9m2n)</option>
                <option value="name-based">Name-Based (e.g., john-smith)</option>
                <option value="word-based">Word-Based (e.g., cloud-river)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Separator
              </label>
              <select
                value={separator}
                onChange={(e) => setSeparator(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">None</option>
                <option value="hyphen">Hyphen (-)</option>
                <option value="underscore">Underscore (_)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case Style
              </label>
              <select
                value={caseStyle}
                onChange={(e) => setCaseStyle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="lowercase">Lowercase (e.g., johnsmith)</option>
                <option value="uppercase">Uppercase (e.g., JOHNSMITH)</option>
                <option value="camel">CamelCase (e.g., JohnSmith)</option>
              </select>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Advanced Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Prefix:</label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., user"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Suffix:</label>
                <input
                  type="text"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., pro"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeNumbers"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="includeNumbers" className="text-sm text-gray-600">
                  Include Numbers
                </label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateUsernames}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaCopy className="mr-2" />
              Generate Usernames
            </button>
            {usernames.length > 0 && (
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
                  onClick={clearUsernames}
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
        {usernames.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Usernames ({usernames.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-64 overflow-y-auto">
              <ul className="list-decimal list-inside text-gray-800">
                {usernames.map((username, index) => (
                  <li key={index} className="py-1">{username}</li>
                ))}
              </ul>
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
                    {entry.usernames.length} usernames ({entry.options.length} chars, {entry.options.style})
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
            <li>Styles: Random, Name-Based, or Word-Based</li>
            <li>Custom separators and case styles (lowercase, uppercase, camel)</li>
            <li>Add prefix/suffix and optional numbers</li>
            <li>Copy, download, and track history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UsernameGenerator;