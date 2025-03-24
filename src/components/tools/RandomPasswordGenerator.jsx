"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaEye, FaEyeSlash, FaDownload, FaHistory, FaUndo, FaDice } from "react-icons/fa";

const RandomPasswordGenerator = () => {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSpecial, setIncludeSpecial] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [customChars, setCustomChars] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [history, setHistory] = useState([]);
  const [showAlert, setShowAlert] = useState(false);

  const generatePassword = useCallback(() => {
    let chars = "";
    if (includeUppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLowercase) chars += "abcdefghijklmnopqrstuvwxyz";
    if (includeNumbers) chars += "0123456789";
    if (includeSpecial) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    if (customChars) chars += customChars;

    if (excludeSimilar) {
      chars = chars.replace(/[IlO0]/g, "");
    }

    if (chars.length === 0) {
      setPassword("Please select at least one character type or add custom characters.");
      return;
    }

    let pass = "";
    for (let i = 0; i < length; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
    setHistory((prev) => [
      ...prev,
      { password: pass, length, options: { includeUppercase, includeLowercase, includeNumbers, includeSpecial, excludeSimilar, customChars } },
    ].slice(-5));
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSpecial, excludeSimilar, customChars]);

  const copyToClipboard = () => {
    if (!password || password.startsWith("Please")) return;
    navigator.clipboard.writeText(password).then(() => {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    }).catch((err) => console.error("Failed to copy:", err));
  };

  const downloadPassword = () => {
    if (!password || password.startsWith("Please")) return;
    const blob = new Blob([password], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `password-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getPasswordStrength = () => {
    if (password.startsWith("Please")) return "N/A";
    let strength = 0;
    if (includeUppercase) strength++;
    if (includeLowercase) strength++;
    if (includeNumbers) strength++;
    if (includeSpecial) strength++;
    if (customChars) strength++;
    if (length >= 16) strength++;

    if (strength <= 2) return "Weak";
    if (strength <= 4) return "Medium";
    return "Strong";
  };

  const restoreFromHistory = (entry) => {
    setPassword(entry.password);
    setLength(entry.length);
    setIncludeUppercase(entry.options.includeUppercase);
    setIncludeLowercase(entry.options.includeLowercase);
    setIncludeNumbers(entry.options.includeNumbers);
    setIncludeSpecial(entry.options.includeSpecial);
    setExcludeSimilar(entry.options.excludeSimilar);
    setCustomChars(entry.options.customChars);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative bg-white shadow-lg rounded-2xl p-6 sm:p-8 w-full">
        {/* Alert Notification */}
        {showAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            Password copied to clipboard!
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Password Generator
        </h1>

        {/* Password Length */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password Length: {length}
          </label>
          <input
            type="range"
            min="6"
            max="100"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Character Options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <p className="text-sm font-medium text-gray-700">Character Options:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeUppercase}
                onChange={(e) => setIncludeUppercase(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">Uppercase (A-Z)</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeLowercase}
                onChange={(e) => setIncludeLowercase(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">Lowercase (a-z)</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">Numbers (0-9)</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeSpecial}
                onChange={(e) => setIncludeSpecial(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">Special (!@#$%^&*)</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={excludeSimilar}
                onChange={(e) => setExcludeSimilar(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">Exclude Similar (I, l, O, 0)</span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Custom Characters:</label>
            <input
              type="text"
              value={customChars}
              onChange={(e) => setCustomChars(e.target.value)}
              placeholder="e.g., ~`{}"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={generatePassword}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold flex items-center justify-center"
          >
            <FaDice className="mr-2" />
            Generate Password
          </button>
          {password && !password.startsWith("Please") && (
            <>
              <button
                onClick={copyToClipboard}
                className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold flex items-center justify-center"
              >
                <FaCopy className="mr-2" />
                Copy
              </button>
              <button
                onClick={downloadPassword}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold flex items-center justify-center"
              >
                <FaDownload className="mr-2" />
                Download
              </button>
            </>
          )}
        </div>

        {/* Password Output */}
        {password && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-lg text-gray-700 truncate max-w-[70%]">
                {showPassword ? password : "●".repeat(Math.min(password.length, 20))}
              </p>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="mt-2">
              <span className="font-medium text-gray-700">Strength: </span>
              <span
                className={`font-semibold ${
                  getPasswordStrength() === "Strong"
                    ? "text-green-600"
                    : getPasswordStrength() === "Medium"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {getPasswordStrength()}
              </span>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Passwords (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="truncate max-w-[80%]">{entry.password}</span>
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
            <li>Customizable length (6-100 characters)</li>
            <li>Include uppercase, lowercase, numbers, special characters</li>
            <li>Exclude similar characters for readability</li>
            <li>Add custom characters to the pool</li>
            <li>Copy, download, and track password history</li>
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

export default RandomPasswordGenerator;