"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo, FaExchangeAlt } from "react-icons/fa";

const TextToNumber = () => {
  const [inputText, setInputText] = useState("");
  const [output, setOutput] = useState("");
  const [options, setOptions] = useState({
    caseSensitive: false,
    separator: " ",
    includeNonLetters: false,
  });
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [history, setHistory] = useState([]);

  // Convert text to numbers
  const convertTextToNumber = useCallback(() => {
    if (!inputText.trim()) {
      setError("Please enter text to convert");
      setOutput("");
      return;
    }

    setError("");
    try {
      const result = [];
      const text = options.caseSensitive ? inputText : inputText.toLowerCase();

      for (const char of text) {
        if (/[a-zA-Z]/.test(char)) {
          const num = (options.caseSensitive ? char.charCodeAt(0) - (char.toUpperCase() === char ? 64 : 96) : char.charCodeAt(0) - 96);
          result.push(num);
        } else if (options.includeNonLetters) {
          result.push(char);
        }
      }

      const formattedOutput = result.join(options.separator);
      setOutput(formattedOutput);

      setHistory((prev) => [
        ...prev,
        { input: inputText, output: formattedOutput, options },
      ].slice(-5));
    } catch (err) {
      setError("Conversion failed: " + err.message);
      setOutput("");
    }
  }, [inputText, options]);

  // Convert numbers back to text
  const convertNumberToText = useCallback((numbers) => {
    try {
      const chars = numbers.split(options.separator).map((num) => {
        if (options.includeNonLetters && !/^\d+$/.test(num)) {
          return num;
        }
        const value = parseInt(num);
        if (value < 1 || value > 26) {
          throw new Error("Invalid number: must be between 1 and 26");
        }
        const charCode = value + (options.caseSensitive ? 64 : 96);
        return String.fromCharCode(charCode);
      });
      return chars.join("");
    } catch (err) {
      setError("Reverse conversion failed: " + err.message);
      return "";
    }
  }, [options]);

  // Handle swap
  const handleSwap = () => {
    if (!output) return;
    
    const reversedText = convertNumberToText(output);
    if (reversedText) {
      setInputText(reversedText);
      setOutput("");
      setHistory((prev) => [
        ...prev,
        { input: reversedText, output, options },
      ].slice(-5));
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setInputText(e.target.value);
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
    link.download = `text-to-number-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Clear input and output
  const clearAll = () => {
    setInputText("");
    setOutput("");
    setError("");
  };

  // Restore from history
  const restoreFromHistory = (entry) => {
    setInputText(entry.input);
    setOutput(entry.output);
    setOptions(entry.options);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative bg-white shadow-xl rounded-2xl p-6 sm:p-8 w-full">
        {showCopyAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            Output copied to clipboard!
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Text to Number Converter
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Input Text
          </label>
          <textarea
            value={inputText}
            onChange={handleInputChange}
            placeholder="Enter text (e.g., ABC or Hello)"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-y"
          />
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Options</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.caseSensitive}
                onChange={(e) => handleOptionChange("caseSensitive", e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-600">Case Sensitive (A ≠ a)</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.includeNonLetters}
                onChange={(e) => handleOptionChange("includeNonLetters", e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-600">Include Non-Letters</label>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Separator</label>
              <select
                value={options.separator}
                onChange={(e) => handleOptionChange("separator", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value=" ">Space</option>
                <option value=",">Comma</option>
                <option value="-">Hyphen</option>
                <option value="">None</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numeric Output
          </label>
          <div className="relative">
            <textarea
              value={output}
              readOnly
              placeholder="Output will appear here (e.g., 1 2 3)"
              className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 h-32 font-mono text-sm resize-y"
            />
            {output && (
              <div className="absolute right-2 top-2 flex gap-2">
                <button
                  onClick={handleCopy}
                  className={`px-3 py-1 rounded-md text-white transition-colors ${isCopied ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  <FaCopy />
                </button>
                <button
                  onClick={handleSwap}
                  className="px-3 py-1 rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                >
                  <FaExchangeAlt />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={convertTextToNumber}
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

        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Convert letters to numbers (A=1, B=2, ..., Z=26)</li>
            <li>Swap numbers back to text</li>
            <li>Optional case sensitivity (A ≠ a)</li>
            <li>Include or exclude non-letter characters</li>
            <li>Customizable output separator (space, comma, hyphen, none)</li>
            <li>Copy, download, and track conversion history</li>
          </ul>
        </div>

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

export default TextToNumber;