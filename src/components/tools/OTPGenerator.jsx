"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo, FaDice } from "react-icons/fa";

const OTPGenerator = () => {
  const [otps, setOtps] = useState([]);
  const [count, setCount] = useState(10);
  const [length, setLength] = useState(6);
  const [format, setFormat] = useState("numeric");
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    customChars: "",
    separator: "\n",
    includeLowercase: false,
    uniqueOTPs: false,
  });

  const generateOTP = useCallback(() => {
    let chars;
    if (options.customChars) {
      chars = options.customChars;
    } else {
      const numeric = "0123456789";
      const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const lowercase = options.includeLowercase ? "abcdefghijklmnopqrstuvwxyz" : "";
      chars =
        format === "numeric"
          ? numeric
          : numeric + uppercase + lowercase;
    }

    if (!chars) return "INVALID"; // Fallback for empty character set

    return Array.from({ length: Math.min(length, 12) }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  }, [length, format, options]);

  const generateOTPs = useCallback(() => {
    let newOtps = [];
    const maxAttempts = options.uniqueOTPs ? count * 10 : count; // Prevent infinite loop
    const otpSet = new Set();

    for (let i = 0; i < count && (otpSet.size < count || !options.uniqueOTPs); i++) {
      const otp = generateOTP();
      if (otp === "INVALID") {
        alert("Invalid custom character set!");
        return;
      }
      if (options.uniqueOTPs) {
        if (!otpSet.has(otp)) {
          otpSet.add(otp);
          newOtps.push(otp);
        }
      } else {
        newOtps.push(otp);
      }
      if (i >= maxAttempts) break; // Safety limit
    }

    if (options.uniqueOTPs && newOtps.length < count) {
      alert("Could not generate enough unique OTPs with the given settings.");
    }

    setOtps(newOtps);
    setIsCopied(false);
    setHistory((prev) => [
      ...prev,
      { otps: newOtps, count, length, format, options },
    ].slice(-5));
  }, [count, length, format, options, generateOTP]);

  const copyToClipboard = () => {
    const text = otps.join(options.separator);
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const downloadAsText = () => {
    const text = otps.join(options.separator);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `otps-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearOTPs = () => {
    setOtps([]);
    setIsCopied(false);
  };

  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const restoreFromHistory = (entry) => {
    setOtps(entry.otps);
    setCount(entry.count);
    setLength(entry.length);
    setFormat(entry.format);
    setOptions(entry.options);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced OTP Generator
        </h1>

        <div className="space-y-6">
          {/* Input Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of OTPs (1-1000)
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
                OTP Length (4-12)
              </label>
              <input
                type="number"
                min="4"
                max="12"
                value={length}
                onChange={(e) => setLength(Math.max(4, Math.min(12, Number(e.target.value) || 4)))}
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
                <option value="numeric">Numeric (0-9)</option>
                <option value="alphanumeric">Alphanumeric (0-9, A-Z)</option>
                <option value="custom">Custom Characters</option>
              </select>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Advanced Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {format === "custom" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Custom Characters:</label>
                  <input
                    type="text"
                    value={options.customChars}
                    onChange={(e) => handleOptionChange("customChars", e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 123ABC"
                  />
                </div>
              )}
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
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeLowercase}
                  onChange={() => handleOptionChange("includeLowercase", !options.includeLowercase)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={format === "custom"}
                />
                <label className="text-sm text-gray-600">Include Lowercase (a-z)</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.uniqueOTPs}
                  onChange={() => handleOptionChange("uniqueOTPs", !options.uniqueOTPs)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">Generate Unique OTPs</label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateOTPs}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaDice className="mr-2" />
              Generate OTPs
            </button>
            {otps.length > 0 && (
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
                  onClick={clearOTPs}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* OTP Output */}
        {otps.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated OTPs ({otps.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-64 overflow-auto font-mono text-gray-800 whitespace-pre-wrap">
              {otps.join(options.separator)}
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
                    {entry.otps.length} OTPs ({entry.length} chars, {entry.format})
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

        {/* Note */}
        <div className="mt-6 text-sm text-gray-600 bg-yellow-50 p-4 rounded-lg">
          <p>
            <strong>Note:</strong> These OTPs are for testing purposes only. For production, use a cryptographically secure method with proper validation and expiration.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPGenerator;