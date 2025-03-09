"use client";

import React, { useState, useCallback } from "react";
import { saveAs } from "file-saver";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo } from "react-icons/fa";

const RandomFileContentGenerator = () => {
  const [generatedContent, setGeneratedContent] = useState("");
  const [fileType, setFileType] = useState("text");
  const [contentLength, setContentLength] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    includeNumbers: false, // Add numbers to text
    customWords: "",       // Custom word list for text
    complexity: 2,         // JSON nesting level or code complexity
  });

  // Utility function for random strings
  const randomString = (length) => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  };

  // Content generation functions
  const generateTextContent = (length) => {
    const defaultSentences = [
      "The quick brown fox jumps over the lazy dog.",
      "A journey of a thousand miles begins with a single step.",
      "To be or not to be, that is the question.",
      "All that glitters is not gold.",
    ];
    const customWords = options.customWords ? options.customWords.split(",").map((w) => w.trim()) : [];
    const words = customWords.length > 0 ? customWords : defaultSentences;
    const result = [];
    for (let i = 0; i < Math.ceil(length / 20); i++) {
      const word = words[Math.floor(Math.random() * words.length)];
      result.push(options.includeNumbers ? `${word} ${Math.floor(Math.random() * 1000)}` : word);
    }
    return result.join(" ");
  };

  const generateCodeContent = (length) => {
    const complexity = Math.min(options.complexity, 5);
    const templates = [
      () => `class ${randomString(8)} {\n${Array(Math.floor(length / (50 * complexity)))
        .fill()
        .map(
          () => `  ${randomString(6)}() {\n    return ${Math.random() > 0.5 ? "true" : Math.floor(Math.random() * 1000)};\n  }`
        )
        .join("\n")}\n}`,
      () =>
        `const ${randomString(6)} = [${Array(Math.floor(length / (20 * complexity)))
          .fill()
          .map(() => Math.floor(Math.random() * 100))
          .join(", ")}];`,
      () =>
        `interface ${randomString(8)} {\n${Array(Math.floor(length / (100 * complexity)))
          .fill()
          .map(() => `  ${randomString(5)}: ${Math.random() > 0.5 ? "string" : "number"};`)
          .join("\n")}\n}`,
    ];
    return templates[Math.floor(Math.random() * templates.length)]();
  };

  const generateJSONContent = (length) => {
    const complexity = Math.min(options.complexity, 5);
    const generateNestedObject = (depth) => {
      if (depth <= 0) return Math.random() > 0.5 ? randomString(6) : Math.floor(Math.random() * 1000);
      const obj = {};
      for (let i = 0; i < Math.min(Math.floor(length / (100 * complexity)), 5); i++) {
        obj[randomString(6)] = Math.random() > 0.5
          ? generateNestedObject(depth - 1)
          : [randomString(6), Math.random(), options.includeNumbers ? Math.floor(Math.random() * 1000) : new Date().toISOString()];
      }
      return obj;
    };
    return JSON.stringify(generateNestedObject(complexity), null, 2);
  };

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate async work
      let content = "";
      switch (fileType) {
        case "text":
          content = generateTextContent(contentLength);
          break;
        case "code":
          content = generateCodeContent(contentLength);
          break;
        case "json":
          content = generateJSONContent(contentLength);
          break;
        default:
          content = generateTextContent(contentLength);
      }
      setGeneratedContent(content);
      setHistory((prev) => [...prev, { content, fileType, contentLength, options }].slice(-5));
    } catch (err) {
      setError("Failed to generate content: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [fileType, contentLength, options]);

  const handleDownload = () => {
    const extension = { text: "txt", code: "ts", json: "json" }[fileType];
    const blob = new Blob([generatedContent], { type: `text/${fileType};charset=utf-8` });
    saveAs(blob, `generated-content-${Date.now()}.${extension}`);
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(generatedContent)
      .then(() => alert("Content copied to clipboard!"))
      .catch(() => setError("Failed to copy content"));
  };

  const handleClear = () => {
    setGeneratedContent("");
    setError(null);
  };

  const restoreFromHistory = (entry) => {
    setGeneratedContent(entry.content);
    setFileType(entry.fileType);
    setContentLength(entry.contentLength);
    setOptions(entry.options);
  };

  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Random File Content Generator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="text">Plain Text</option>
                <option value="code">TypeScript Code</option>
                <option value="json">JSON Data</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Length</label>
              <input
                type="number"
                min="50"
                max="5000"
                value={contentLength}
                onChange={(e) => setContentLength(Math.min(5000, Math.max(50, Number(e.target.value) || 50)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Advanced Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Advanced Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeNumbers}
                  onChange={() => handleOptionChange("includeNumbers", !options.includeNumbers)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">Include Numbers</label>
              </div>
              {fileType === "text" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Custom Words (comma-separated):</label>
                  <input
                    type="text"
                    value={options.customWords}
                    onChange={(e) => handleOptionChange("customWords", e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., apple, banana, cherry"
                  />
                </div>
              )}
              {(fileType === "code" || fileType === "json") && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Complexity (1-5):</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={options.complexity}
                    onChange={(e) => handleOptionChange("complexity", Math.max(1, Math.min(5, Number(e.target.value) || 2)))}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={`flex-1 py-2 px-4 rounded-md text-white font-medium transition-colors flex items-center justify-center ${
                isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <FaDownload className="mr-2" />
              )}
              {isLoading ? "Generating..." : "Generate"}
            </button>
            {generatedContent && (
              <>
                <button
                  onClick={handleDownload}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
                <button
                  onClick={handleCopy}
                  className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaCopy className="mr-2" />
                  Copy
                </button>
                <button
                  onClick={handleClear}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Generated Content */}
        {generatedContent && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Generated Content:</h2>
            <pre className="bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-auto max-h-64 font-mono text-sm">
              {generatedContent}
            </pre>
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
                    {entry.fileType.toUpperCase()} ({entry.contentLength} chars): {entry.content.slice(0, 20)}...
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
            <li>Generate text, TypeScript code, or JSON</li>
            <li>Customizable length (50-5000 characters)</li>
            <li>Options for numbers, custom words, and complexity</li>
            <li>Download, copy, and track history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RandomFileContentGenerator;