"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo, FaDice } from "react-icons/fa";

const CouponCodeGenerator = () => {
  const [codes, setCodes] = useState([]);
  const [count, setCount] = useState(10);
  const [length, setLength] = useState(8);
  const [format, setFormat] = useState("alphanumeric"); // alphanumeric, letters, numbers, custom
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [separator, setSeparator] = useState(""); // Separator between segments
  const [segments, setSegments] = useState(1); // Number of segments
  const [customChars, setCustomChars] = useState(""); // Custom character set
  const [isUpperCase, setIsUpperCase] = useState(true); // Uppercase or lowercase
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const generateCouponCodes = useCallback(() => {
    const characters = {
      alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      numbers: "0123456789",
      custom: customChars || "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    };

    const charSet = characters[format] || characters.alphanumeric;
    if (format === "custom" && !customChars) {
      alert("Please enter custom characters for the 'Custom' format.");
      return;
    }

    const segmentLength = Math.floor(length / segments);
    const newCodes = Array.from({ length: Math.min(count, 1000) }, () => {
      let code = prefix;
      for (let s = 0; s < segments; s++) {
        let segment = "";
        for (let i = 0; i < Math.min(segmentLength, 20); i++) {
          segment += charSet.charAt(Math.floor(Math.random() * charSet.length));
        }
        code += (s > 0 ? separator : "") + (isUpperCase ? segment : segment.toLowerCase());
      }
      code += suffix;
      return code;
    });

    setCodes(newCodes);
    setIsCopied(false);
    setHistory((prev) => [
      ...prev,
      {
        codes: newCodes,
        options: { count, length, format, prefix, suffix, separator, segments, customChars, isUpperCase },
      },
    ].slice(-5));
  }, [count, length, format, prefix, suffix, separator, segments, customChars, isUpperCase]);

  const copyToClipboard = () => {
    const text = codes.join("\n");
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const downloadAsText = () => {
    const text = codes.join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `coupons-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearCodes = () => {
    setCodes([]);
    setIsCopied(false);
  };

  const restoreFromHistory = (entry) => {
    setCodes(entry.codes);
    setCount(entry.options.count);
    setLength(entry.options.length);
    setFormat(entry.options.format);
    setPrefix(entry.options.prefix);
    setSuffix(entry.options.suffix);
    setSeparator(entry.options.separator);
    setSegments(entry.options.segments);
    setCustomChars(entry.options.customChars);
    setIsUpperCase(entry.options.isUpperCase);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Coupon Code Generator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Codes (1-1000)
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
                Total Code Length (4-20)
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
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="alphanumeric">Alphanumeric</option>
                <option value="letters">Letters Only</option>
                <option value="numbers">Numbers Only</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Segments (1-5)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={segments}
                onChange={(e) => setSegments(Math.max(1, Math.min(5, Number(e.target.value) || 1)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                  placeholder="e.g., COUPON-"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Suffix:</label>
                <input
                  type="text"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., -2023"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Separator:</label>
                <select
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  <option value="-">Hyphen (-)</option>
                  <option value="_">Underscore (_)</option>
                  <option value=".">Dot (.)</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isUpperCase}
                  onChange={() => setIsUpperCase(!isUpperCase)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">Uppercase</label>
              </div>
              {format === "custom" && (
                <div className="sm:col-span-2">
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
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateCouponCodes}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaDice className="mr-2" />
              Generate Codes
            </button>
            {codes.length > 0 && (
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
                  onClick={clearCodes}
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
        {codes.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Coupon Codes ({codes.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto font-mono text-gray-800">
              <ul className="list-decimal list-inside">
                {codes.map((code, index) => (
                  <li key={index} className="py-1 break-all">{code}</li>
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
                    {entry.codes.length} codes ({entry.options.length} chars, {entry.options.format})
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
            <li>Generate alphanumeric, letters, numbers, or custom codes</li>
            <li>Custom prefix, suffix, and separators</li>
            <li>Segmented codes with adjustable length</li>
            <li>Uppercase/lowercase toggle and history tracking</li>
            <li>Copy or download generated codes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CouponCodeGenerator;