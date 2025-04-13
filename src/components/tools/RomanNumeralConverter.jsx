"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaHistory, FaUndo, FaExchangeAlt } from "react-icons/fa";

const RomanNumeralConverter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("toRoman"); // toRoman or toNumber
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [showCopyAlert, setShowCopyAlert] = useState(false);

  // Roman numeral mapping
  const romanValues = [
    { value: 1000, numeral: "M" },
    { value: 900, numeral: "CM" },
    { value: 500, numeral: "D" },
    { value: 400, numeral: "CD" },
    { value: 100, numeral: "C" },
    { value: 90, numeral: "XC" },
    { value: 50, numeral: "L" },
    { value: 40, numeral: "XL" },
    { value: 10, numeral: "X" },
    { value: 9, numeral: "IX" },
    { value: 5, numeral: "V" },
    { value: 4, numeral: "IV" },
    { value: 1, numeral: "I" },
  ];

  // Convert number to Roman numeral
  const toRoman = (num) => {
    if (!num || isNaN(num) || num < 1 || num > 3999) {
      return "";
    }
    let result = "";
    for (const { value, numeral } of romanValues) {
      while (num >= value) {
        result += numeral;
        num -= value;
      }
    }
    return result;
  };

  // Convert Roman numeral to number
  const toNumber = (roman) => {
    if (!roman) return "";
    const romanUpper = roman.toUpperCase();
    let result = 0;
    let i = 0;

    for (const { value, numeral } of romanValues) {
      while (romanUpper.startsWith(numeral, i)) {
        result += value;
        i += numeral.length;
      }
    }

    // Validate if the Roman numeral is correct
    return i === romanUpper.length && toRoman(result) === romanUpper ? result : "";
  };

  // Validate input based on mode
  const validateInput = useCallback(() => {
    if (!input.trim()) return "Input is required";
    if (mode === "toRoman") {
      const num = parseInt(input, 10);
      if (isNaN(num)) return "Enter a valid number";
      if (num < 1 || num > 3999) return "Number must be between 1 and 3999";
    } else {
      if (!/^[IVXLCDMivxlcdm]+$/.test(input)) return "Enter valid Roman numerals (I, V, X, L, C, D, M)";
      if (!toNumber(input)) return "Invalid Roman numeral";
    }
    return "";
  }, [input, mode]);

  // Handle conversion
  const handleConvert = useCallback(() => {
    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      setOutput("");
      return;
    }

    setError("");
    let result;
    if (mode === "toRoman") {
      result = toRoman(parseInt(input, 10));
    } else {
      result = toNumber(input);
    }

    setOutput(result);
    setHistory((prev) => [
      ...prev,
      { input, output: result, mode },
    ].slice(-5));
  }, [input, mode, validateInput]);

  // Handle copy to clipboard
  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    }).catch((err) => setError(`Copy failed: ${err.message}`));
  };

  // Clear form
  const clearForm = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  // Restore from history
  const restoreFromHistory = (entry) => {
    setInput(entry.input);
    setOutput(entry.output);
    setMode(entry.mode);
    setError("");
  };

  // Switch modes
  const toggleMode = () => {
    setMode((prev) => (prev === "toRoman" ? "toNumber" : "toRoman"));
    setInput("");
    setOutput("");
    setError("");
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
          Roman Numeral Converter
        </h1>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Mode Toggle */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={toggleMode}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FaExchangeAlt className="mr-2" />
            {mode === "toRoman" ? "Switch to Roman → Number" : "Switch to Number → Roman"}
          </button>
        </div>

        {/* Input Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {mode === "toRoman" ? "Number (1-3999)" : "Roman Numeral"}
          </label>
          <div className="flex gap-2">
            <input
              type={mode === "toRoman" ? "number" : "text"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === "toRoman" ? "Enter a number (e.g., 123)" : "Enter Roman numeral (e.g., CXXIII)"}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={mode === "toRoman" ? 1 : undefined}
              max={mode === "toRoman" ? 3999 : undefined}
            />
            <button
              onClick={handleConvert}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              disabled={!input.trim()}
            >
              Convert
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {mode === "toRoman" ? "Roman Numeral" : "Number"}
          </label>
          <div className="relative">
            <input
              type="text"
              value={output}
              readOnly
              placeholder="Conversion result will appear here"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
            />
            {output && (
              <button
                onClick={handleCopy}
                className="absolute right-2 top-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaCopy />
              </button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={clearForm}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaTrash className="mr-2" />
            Clear
          </button>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Conversions (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.mode === "toRoman"
                      ? `${entry.input} → ${entry.output}`
                      : `${entry.input} → ${entry.output}`}
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
        <div className="p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Convert numbers (1-3999) to Roman numerals</li>
            <li>Convert valid Roman numerals to numbers</li>
            <li>Input validation for both modes</li>
            <li>Copy results to clipboard</li>
            <li>Track and restore recent conversions</li>
            <li>Switch between conversion modes</li>
          </ul>
        </div>

        {/* Animation */}
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

export default RomanNumeralConverter;