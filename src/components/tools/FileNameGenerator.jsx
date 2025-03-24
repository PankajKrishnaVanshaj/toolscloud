"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo, FaDice } from "react-icons/fa";

const FileNameGenerator = () => {
  const [fileNames, setFileNames] = useState([]);
  const [count, setCount] = useState(10);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [extension, setExtension] = useState(".txt");
  const [includeDate, setIncludeDate] = useState(false);
  const [dateFormat, setDateFormat] = useState("YYYYMMDD");
  const [separator, setSeparator] = useState("_");
  const [customWords, setCustomWords] = useState("");
  const [includeNumber, setIncludeNumber] = useState(true);
  const [numberRange, setNumberRange] = useState({ min: 1, max: 1000 });
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);

  // Default words for file name generation
  const defaultWords = [
    "document", "report", "image", "data", "project",
    "backup", "log", "config", "test", "output",
  ];

  const getDateString = () => {
    const date = new Date();
    switch (dateFormat) {
      case "YYYYMMDD":
        return date.toISOString().slice(0, 10).replace(/-/g, "");
      case "DDMMYYYY":
        return `${date.getDate().toString().padStart(2, "0")}${(
          date.getMonth() + 1
        ).toString().padStart(2, "0")}${date.getFullYear()}`;
      case "YYYY-MM-DD":
        return date.toISOString().slice(0, 10);
      default:
        return "";
    }
  };

  const generateFileNames = useCallback(() => {
    const words = customWords.trim() ? customWords.split(",").map((w) => w.trim()) : defaultWords;
    const newFileNames = Array.from({ length: Math.min(count, 1000) }, () => {
      const randomWord = words[Math.floor(Math.random() * words.length)];
      const randomNum = includeNumber
        ? Math.floor(Math.random() * (numberRange.max - numberRange.min + 1)) + numberRange.min
        : "";
      const datePart = includeDate ? `${getDateString()}${separator}` : "";

      return `${prefix}${datePart}${randomWord}${randomNum}${suffix}${extension}`.replace(
        /_+/g,
        separator
      );
    });

    setFileNames(newFileNames);
    setIsCopied(false);
    setHistory((prev) => [
      ...prev,
      {
        fileNames: newFileNames,
        options: { count, prefix, suffix, extension, includeDate, dateFormat, separator, customWords, includeNumber, numberRange },
      },
    ].slice(-5));
  }, [count, prefix, suffix, extension, includeDate, dateFormat, separator, customWords, includeNumber, numberRange]);

  const copyToClipboard = () => {
    const text = fileNames.join("\n");
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const downloadAsText = () => {
    const text = fileNames.join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `filenames-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearFileNames = () => {
    setFileNames([]);
    setIsCopied(false);
  };

  const restoreFromHistory = (entry) => {
    setFileNames(entry.fileNames);
    setCount(entry.options.count);
    setPrefix(entry.options.prefix);
    setSuffix(entry.options.suffix);
    setExtension(entry.options.extension);
    setIncludeDate(entry.options.includeDate);
    setDateFormat(entry.options.dateFormat);
    setSeparator(entry.options.separator);
    setCustomWords(entry.options.customWords);
    setIncludeNumber(entry.options.includeNumber);
    setNumberRange(entry.options.numberRange);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced File Name Generator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of File Names (1-1000)
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
                File Extension
              </label>
              <select
                value={extension}
                onChange={(e) => setExtension(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value=".txt">.txt</option>
                <option value=".csv">.csv</option>
                <option value=".jpg">.jpg</option>
                <option value=".png">.png</option>
                <option value=".pdf">.pdf</option>
                <option value=".docx">.docx</option>
                <option value="">None</option>
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
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., user"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suffix (optional)
              </label>
              <input
                type="text"
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., v1"
              />
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
                  <option value="_">Underscore (_)</option>
                  <option value="-">Hyphen (-)</option>
                  <option value=".">Dot (.)</option>
                  <option value="">None</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeDate}
                  onChange={(e) => setIncludeDate(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">Include Date</label>
                {includeDate && (
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="ml-2 p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="YYYYMMDD">YYYYMMDD</option>
                    <option value="DDMMYYYY">DDMMYYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Custom Words (comma-separated):</label>
                <input
                  type="text"
                  value={customWords}
                  onChange={(e) => setCustomWords(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., file, note, memo"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeNumber}
                  onChange={(e) => setIncludeNumber(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">Include Number</label>
                {includeNumber && (
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={numberRange.min}
                      onChange={(e) =>
                        setNumberRange((prev) => ({
                          ...prev,
                          min: Math.max(1, Number(e.target.value) || 1),
                        }))
                      }
                      className="w-16 p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      value={numberRange.max}
                      onChange={(e) =>
                        setNumberRange((prev) => ({
                          ...prev,
                          max: Math.max(prev.min, Number(e.target.value) || 1000),
                        }))
                      }
                      className="w-16 p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Max"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateFileNames}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaDice className="mr-2" />
              Generate File Names
            </button>
            {fileNames.length > 0 && (
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
                  onClick={clearFileNames}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>

          {/* Output */}
          {fileNames.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Generated File Names ({fileNames.length}):
              </h2>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-64 overflow-y-auto font-mono text-sm">
                <ul className="list-decimal list-inside text-gray-800">
                  {fileNames.map((name, index) => (
                    <li key={index} className="py-1">{name}</li>
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
                    <span>{entry.fileNames.length} names (e.g., {entry.fileNames[0]})</span>
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
              <li>Custom prefix, suffix, and separator</li>
              <li>Optional date with multiple formats</li>
              <li>Custom words and number range</li>
              <li>Multiple file extensions or none</li>
              <li>Copy, download, and history tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileNameGenerator;