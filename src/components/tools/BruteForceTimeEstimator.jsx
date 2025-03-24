"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync, FaCalculator } from "react-icons/fa";

const BruteForceTimeEstimator = () => {
  const [passwordLength, setPasswordLength] = useState(8);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSpecial, setUseSpecial] = useState(true);
  const [customChars, setCustomChars] = useState("");
  const [attackRate, setAttackRate] = useState(1000000); // Attempts per second
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);

  // Character set sizes
  const charSets = {
    lowercase: 26, // a-z
    uppercase: 26, // A-Z
    numbers: 10, // 0-9
    special: 32, // !@#$%^&*()_+-=[]{}|;:,.<>? etc.
  };

  // Calculate brute force time
  const estimateTime = useCallback(() => {
    setError("");
    setResults(null);

    if (passwordLength < 1 || passwordLength > 128) {
      setError("Password length must be between 1 and 128 characters");
      return;
    }
    if (
      !useLowercase &&
      !useUppercase &&
      !useNumbers &&
      !useSpecial &&
      !customChars.trim()
    ) {
      setError("At least one character type or custom set must be selected");
      return;
    }
    if (attackRate < 1) {
      setError("Attack rate must be at least 1 attempt per second");
      return;
    }

    // Calculate total character set size
    let totalChars = 0;
    if (useLowercase) totalChars += charSets.lowercase;
    if (useUppercase) totalChars += charSets.uppercase;
    if (useNumbers) totalChars += charSets.numbers;
    if (useSpecial) totalChars += charSets.special;
    if (customChars) {
      const uniqueCustomChars = new Set(customChars.split("")).size;
      totalChars += uniqueCustomChars;
    }

    // Total possible combinations
    const combinations = Math.pow(totalChars, passwordLength);

    // Time in seconds
    const seconds = combinations / attackRate;

    // Format time
    const timeBreakdown = {
      seconds,
      minutes: seconds / 60,
      hours: seconds / 3600,
      days: seconds / 86400,
      years: seconds / (86400 * 365.25),
      centuries: seconds / (86400 * 365.25 * 100),
      millennia: seconds / (86400 * 365.25 * 1000),
    };

    // Human-readable time
    const formatTime = (value, unit) =>
      value >= 1 ? `${value.toFixed(2)} ${unit}` : null;
    const humanReadable =
      formatTime(timeBreakdown.millennia, "millennia") ||
      formatTime(timeBreakdown.centuries, "centuries") ||
      formatTime(timeBreakdown.years, "years") ||
      formatTime(timeBreakdown.days, "days") ||
      formatTime(timeBreakdown.hours, "hours") ||
      formatTime(timeBreakdown.minutes, "minutes") ||
      `${timeBreakdown.seconds.toFixed(2)} seconds`;

    setResults({
      combinations: combinations.toLocaleString(),
      totalChars,
      timeSeconds: seconds,
      humanReadable,
      timeBreakdown,
    });
  }, [
    passwordLength,
    useLowercase,
    useUppercase,
    useNumbers,
    useSpecial,
    customChars,
    attackRate,
  ]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    estimateTime();
  };

  // Copy results to clipboard
  const copyToClipboard = () => {
    if (results) {
      const text = `Character Set Size: ${results.totalChars}\nCombinations: ${results.combinations}\nTime: ${results.humanReadable}`;
      navigator.clipboard.writeText(text);
    }
  };

  // Clear all
  const clearAll = () => {
    setPasswordLength(8);
    setUseLowercase(true);
    setUseUppercase(true);
    setUseNumbers(true);
    setUseSpecial(true);
    setCustomChars("");
    setAttackRate(1000000);
    setResults(null);
    setError("");
    setShowDetailedBreakdown(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Brute Force Time Estimator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password Length (1-128)
            </label>
            <input
              type="number"
              value={passwordLength}
              onChange={(e) => setPasswordLength(Math.max(1, Math.min(128, parseInt(e.target.value) || 1)))}
              min={1}
              max={128}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Character Sets */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-2">Character Sets</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Lowercase (a-z, 26)", state: useLowercase, setter: setUseLowercase },
                { label: "Uppercase (A-Z, 26)", state: useUppercase, setter: setUseUppercase },
                { label: "Numbers (0-9, 10)", state: useNumbers, setter: setUseNumbers },
                { label: "Special (~32)", state: useSpecial, setter: setUseSpecial },
              ].map(({ label, state, setter }) => (
                <label key={label} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={state}
                    onChange={(e) => setter(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Custom Characters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Characters (e.g., emoji, unique symbols)
            </label>
            <input
              type="text"
              value={customChars}
              onChange={(e) => setCustomChars(e.target.value)}
              placeholder="Enter custom characters"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Unique characters: {customChars ? new Set(customChars.split("")).size : 0}
            </p>
          </div>

          {/* Attack Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attack Rate (attempts/sec)
            </label>
            <input
              type="number"
              value={attackRate}
              onChange={(e) => setAttackRate(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={attackRate}
              onChange={(e) => setAttackRate(parseInt(e.target.value))}
              className="mt-2 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value={1000}>1,000 (Low-end CPU)</option>
              <option value={1000000}>1,000,000 (1M, Mid-range)</option>
              <option value={1000000000}>1,000,000,000 (1B, GPU)</option>
              <option value={10000000000}>10,000,000,000 (10B, High-end)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Typical rates: 10³ (CPU) to 10¹⁰ (GPU clusters)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Estimate Time
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200 text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        {/* Estimation Results */}
        {results && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Estimation Results</h2>
              <button
                onClick={copyToClipboard}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaCopy className="mr-2" /> Copy
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
              <p className="text-sm">
                <strong>Character Set Size:</strong> {results.totalChars}
              </p>
              <p className="text-sm">
                <strong>Total Combinations:</strong> {results.combinations}
              </p>
              <p className="text-sm">
                <strong>Estimated Time:</strong> {results.humanReadable}
              </p>
              <div>
                <button
                  onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  {showDetailedBreakdown ? "Hide" : "Show"} Detailed Breakdown
                </button>
                {showDetailedBreakdown && (
                  <ul className="mt-2 list-disc pl-5 text-sm text-gray-600">
                    {Object.entries(results.timeBreakdown).map(([unit, value]) => (
                      <li key={unit}>
                        {unit.charAt(0).toUpperCase() + unit.slice(1)}: {value.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Features and Notes */}
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Customizable password length and character sets</li>
              <li>Support for custom characters (e.g., emojis)</li>
              <li>Adjustable attack rate with presets</li>
              <li>Detailed time breakdown</li>
              <li>Copy results to clipboard</li>
            </ul>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default BruteForceTimeEstimator;