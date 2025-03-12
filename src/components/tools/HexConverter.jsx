"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaSync, FaDownload, FaHistory } from "react-icons/fa";

const HexConverter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("textToHex");
  const [options, setOptions] = useState({
    uppercase: true,
    spaceSeparated: true,
    includePrefix: false,
  });
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const textToHex = (text) => {
    let hex = text
      .split("")
      .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
      .join(options.spaceSeparated ? " " : "");
    if (options.uppercase) hex = hex.toUpperCase();
    if (options.includePrefix) hex = "0x" + hex.replace(/\s/g, "");
    return hex;
  };

  const hexToText = (hex) => {
    const cleanHex = hex.replace(/^0x|\s+/gi, "");
    const hexArray = options.spaceSeparated ? cleanHex.match(/.{1,2}/g) : cleanHex.match(/.{1,2}/g);
    if (!hexArray || hexArray.some((h) => !/^[0-9A-Fa-f]{2}$/.test(h))) {
      throw new Error("Invalid hex format");
    }
    return hexArray.map((h) => String.fromCharCode(parseInt(h, 16))).join("");
  };

  const hexToDecimal = (hex) => {
    const cleanHex = hex.replace(/^0x|\s+/gi, "");
    if (!/^[0-9A-Fa-f]+$/.test(cleanHex)) {
      throw new Error("Invalid hex format");
    }
    return parseInt(cleanHex, 16).toString(10);
  };

  const decimalToHex = (decimal) => {
    if (!/^-?\d+$/.test(decimal)) {
      throw new Error("Invalid decimal format");
    }
    const num = parseInt(decimal, 10);
    let hex = num >= 0 ? num.toString(16) : (-num).toString(16);
    if (options.uppercase) hex = hex.toUpperCase();
    if (options.includePrefix) hex = "0x" + hex;
    if (num < 0) hex += " (negative)";
    return hex;
  };

  const convert = useCallback(() => {
    setError(null);
    setOutput("");
    setCopied(false);

    if (!input.trim()) {
      setError("Please enter a value to convert");
      return;
    }

    try {
      let result;
      switch (mode) {
        case "textToHex":
          result = textToHex(input);
          break;
        case "hexToText":
          result = hexToText(input);
          break;
        case "hexToDecimal":
          result = hexToDecimal(input);
          break;
        case "decimalToHex":
          result = decimalToHex(input);
          break;
        default:
          result = "";
      }
      setOutput(result);
      setHistory((prev) => [
        { input, mode, output: result, timestamp: new Date() },
        ...prev.slice(0, 4),
      ]);
    } catch (err) {
      setError("Conversion error: " + err.message);
    }
  }, [input, mode, options]);

  const handleSubmit = (e) => {
    e.preventDefault();
    convert();
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (output) {
      const blob = new Blob([output], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${mode}-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
    setError(null);
    setCopied(false);
  };

  const restoreFromHistory = (entry) => {
    setInput(entry.input);
    setMode(entry.mode);
    setOutput(entry.output);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Hex Converter</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Input</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-32 sm:h-40 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={
                mode === "textToHex"
                  ? "Hello"
                  : mode === "hexToText"
                  ? options.spaceSeparated
                    ? "48 65 6C 6C 6F"
                    : "48656C6C6F"
                  : mode === "hexToDecimal"
                  ? "FF"
                  : "255"
              }
              aria-label="Input for conversion"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Conversion Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="textToHex">Text to Hex</option>
                <option value="hexToText">Hex to Text</option>
                <option value="hexToDecimal">Hex to Decimal</option>
                <option value="decimalToHex">Decimal to Hex</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.uppercase}
                  onChange={(e) => setOptions((prev) => ({ ...prev, uppercase: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Uppercase</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.spaceSeparated}
                  onChange={(e) => setOptions((prev) => ({ ...prev, spaceSeparated: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Space Separated</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includePrefix}
                  onChange={(e) => setOptions((prev) => ({ ...prev, includePrefix: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Include 0x Prefix</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Convert
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!output}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Output */}
        {output && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-700">Output</h3>
              <button
                onClick={handleCopy}
                className={`py-1 px-3 text-sm rounded-lg transition-colors flex items-center ${
                  copied ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <FaCopy className="mr-2" /> {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="p-4 bg-gray-50 rounded-lg text-sm font-mono text-gray-800 whitespace-pre-wrap break-all border border-gray-200">
              {output}
            </pre>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <FaHistory className="mr-2" /> Recent Conversions (Last 5)
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {history.map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.mode}: {entry.input.slice(0, 20)}... → {entry.output.slice(0, 20)}...
                  </span>
                  <button
                    onClick={() => restoreFromHistory(entry)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Notes</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert between text, hex, and decimal</li>
            <li>Customizable output: uppercase, spacing, 0x prefix</li>
            <li>History tracking for recent conversions</li>
            <li>Download output as text file</li>
            <li>Supports negative decimal numbers</li>
            <li>Hex input can be space-separated or continuous</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HexConverter;