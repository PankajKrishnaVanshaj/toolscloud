"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo } from "react-icons/fa";

const RandomNameGenerator = () => {
  const [names, setNames] = useState([]);
  const [count, setCount] = useState(1);
  const [culture, setCulture] = useState("generic");
  const [format, setFormat] = useState("full");
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    gender: "any", // any, male, female
    prefix: "",    // e.g., Mr., Dr.
    suffix: "",    // e.g., Jr., PhD
    separator: "\n", // Separator for output
  });

  // Expanded name data with gender-specific first names
  const nameData = {
    generic: {
      male: ["Alex", "Jordan", "Taylor", "Casey", "Riley"],
      female: ["Alexis", "Morgan", "Sydney", "Kelly", "Peyton"],
      last: ["Smith", "Johnson", "Brown", "Davis", "Wilson"],
    },
    english: {
      male: ["James", "William", "Henry", "Thomas", "Edward"],
      female: ["Emma", "Olivia", "Charlotte", "Amelia", "Sophia"],
      last: ["Thompson", "Harris", "Lewis", "Clark", "Walker"],
    },
    spanish: {
      male: ["Carlos", "Juan", "Miguel", "Alejandro", "Diego"],
      female: ["Sofia", "Isabella", "Maria", "Lucia", "Valentina"],
      last: ["Garcia", "Martinez", "Lopez", "Rodriguez", "Perez"],
    },
    japanese: {
      male: ["Hiro", "Yuki", "Ren", "Kaito", "Sora"],
      female: ["Sakura", "Aiko", "Hana", "Yui", "Miku"],
      last: ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe"],
    },
  };

  const generateNames = useCallback(() => {
    const data = nameData[culture];
    const newNames = Array.from({ length: Math.min(count, 100) }, () => {
      const genderPool =
        options.gender === "any"
          ? Math.random() > 0.5 ? data.male : data.female
          : options.gender === "male" ? data.male : data.female;
      const first = genderPool[Math.floor(Math.random() * genderPool.length)];
      const last = data.last[Math.floor(Math.random() * data.last.length)];

      let name;
      switch (format) {
        case "first":
          name = first;
          break;
        case "last":
          name = last;
          break;
        case "full":
        default:
          name = `${first} ${last}`;
      }

      if (options.prefix) name = `${options.prefix} ${name}`;
      if (options.suffix) name = `${name}, ${options.suffix}`;

      return name;
    });

    setNames(newNames);
    setIsCopied(false);
    setHistory((prev) => [
      ...prev,
      { names: newNames, count, culture, format, options },
    ].slice(-5));
  }, [count, culture, format, options]);

  const copyToClipboard = () => {
    const text = names.join(options.separator);
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const downloadAsText = () => {
    const text = names.join(options.separator);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `names-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearNames = () => {
    setNames([]);
    setIsCopied(false);
  };

  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const restoreFromHistory = (entry) => {
    setNames(entry.names);
    setCount(entry.count);
    setCulture(entry.culture);
    setFormat(entry.format);
    setOptions(entry.options);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Random Name Generator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Names (1-100)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Culture
              </label>
              <select
                value={culture}
                onChange={(e) => setCulture(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="generic">Generic</option>
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="japanese">Japanese</option>
              </select>
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
                <option value="full">Full Name</option>
                <option value="first">First Name Only</option>
                <option value="last">Last Name Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                value={options.gender}
                onChange={(e) => handleOptionChange("gender", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="any">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
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
                  value={options.prefix}
                  onChange={(e) => handleOptionChange("prefix", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Mr., Dr."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Suffix:</label>
                <input
                  type="text"
                  value={options.suffix}
                  onChange={(e) => handleOptionChange("suffix", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Jr., PhD"
                />
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
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateNames}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaDownload className="mr-2" />
              Generate Names
            </button>
            {names.length > 0 && (
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
                  onClick={clearNames}
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
        {names.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2 text-center">
              Generated Names ({names.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto whitespace-pre-wrap break-words">
              {names.join(options.separator)}
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
                    {entry.names.length} {entry.culture} names ({entry.format})
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
            <li>Generate names in Generic, English, Spanish, or Japanese styles</li>
            <li>Choose full, first, or last name format</li>
            <li>Filter by gender (Male, Female, or Any)</li>
            <li>Add custom prefixes and suffixes</li>
            <li>Customizable output separator</li>
            <li>Copy, download, and track history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RandomNameGenerator;