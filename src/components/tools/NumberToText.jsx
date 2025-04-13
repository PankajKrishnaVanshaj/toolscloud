"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo } from "react-icons/fa";

const NumberToText = () => {
  const [inputNumbers, setInputNumbers] = useState("");
  const [output, setOutput] = useState("");
  const [options, setOptions] = useState({
    case: "uppercase", // uppercase, lowercase
    separator: "", // Separator for input numbers
    includeNonNumbers: false, // Include non-numbers as-is
  });
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [history, setHistory] = useState([]);

  // Convert numbers to text
  const convertNumberToText = useCallback(() => {
    if (!inputNumbers.trim()) {
      setError("Please enter numbers to convert");
      setOutput("");
      return;
    }

    setError("");
    try {
      // Split input based on separator or treat as individual digits if no separator
      const numbers = options.separator
        ? inputNumbers.split(options.separator).map((n) => n.trim())
        : inputNumbers.replace(/\s+/g, "").split("");

      const result = [];
      for (const item of numbers) {
        if (/^\d+$/.test(item)) {
          const num = parseInt(item, 10);
          if (num >= 1 && num <= 26) {
            const letter = String.fromCharCode(64 + num);
            result.push(options.case === "uppercase" ? letter : letter.toLowerCase());
          } else {
            setError("Numbers must be between 1 and 26");
            setOutput("");
            return;
          }
        } else if (options.includeNonNumbers) {
          result.push(item);
        }
      }

      const formattedOutput = result.join("");
      setOutput(formattedOutput);

      // Save to history
      setHistory((prev) => [
        ...prev,
        { input: inputNumbers, output: formattedOutput, options },
      ].slice(-5));
    } catch (err) {
      setError("Conversion failed: " + err.message);
      setOutput("");
    }
  }, [inputNumbers, options]);

  // Handle input change
  const handleInputChange = (e) => {
    setInputNumbers(e.target.value);
  };

  // Handle option change
  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard
      .writeText(output)
      .then(() => {
        setIsCopied(true);
        setShowCopyAlert(true);
        setTimeout(() => {
          setShowCopyAlert(false);
          setIsCopied(false);
        }, 2000);
      })
      .catch((err) => setError("Copy failed: " + err.message));
  };

  // Handle download
  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `number-to-text-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Clear input and output
  const clearAll = () => {
    setInputNumbers("");
    setOutput("");
    setError("");
  };

  // Restore from history
  const restoreFromHistory = (entry) => {
    setInputNumbers(entry.input);
    setOutput(entry.output);
    setOptions(entry.options);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative bg-white shadow-xl rounded-2xl p-6 sm:p-8 w-full">
        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            Output copied to clipboard!
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Number to Text Converter
        </h1>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Input Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Input Numbers
          </label>
          <textarea
            value={inputNumbers}
            onChange={handleInputChange}
            placeholder="Enter numbers (e.g., 1 2 3 or 1,2,3)"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-y"
          />
        </div>

        {/* Options Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Options</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Output Case</label>
              <select
                value={options.case}
                onChange={(e) => handleOptionChange("case", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="uppercase">Uppercase (A, B, ...)</option>
                <option value="lowercase">Lowercase (a, b, ...)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Input Separator</label>
              <select
                value={options.separator}
                onChange={(e) => handleOptionChange("separator", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None (e.g., 123)</option>
                <option value=" ">Space (e.g., 1 2 3)</option>
                <option value=",">Comma (e.g., 1,2,3)</option>
                <option value="-">Hyphen (e.g., 1-2-3)</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.includeNonNumbers}
                onChange={(e) => handleOptionChange("includeNonNumbers", e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-600">Include Non-Numbers</label>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alphabetic Output
          </label>
          <div className="relative">
            <textarea
              value={output}
              readOnly
              placeholder="Output will appear here (e.g., ABC)"
              className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 h-32 font-mono text-sm resize-y"
            />
            {output && (
              <button
                onClick={handleCopy}
                className={`absolute right-2 top-2 px-3 py-1 rounded-md text-white transition-colors ${isCopied ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                <FaCopy />
              </button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={convertNumberToText}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Convert
          </button>
          {output && (
            <>
              <button
                onClick={handleDownload}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" />
                Download (.txt)
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

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Conversions (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.input.slice(0, 20)}... → {entry.output.slice(0, 20)}...
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

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Convert numbers to letters (1=A, 2=B, ..., 26=Z)</li>
            <li>Choose uppercase or lowercase output</li>
            <li>Support for custom input separators (space, comma, hyphen, none)</li>
            <li>Option to include non-numeric characters</li>
            <li>Copy, download, and track conversion history</li>
          </ul>
        </div>

        {/* Tailwind Animation */}
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-in;
          }
        `}</style>
      </div>
    </div>
  );
};

export default NumberToText;