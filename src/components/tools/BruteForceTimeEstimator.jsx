// components/BruteForceTimeEstimator.js
'use client';

import React, { useState } from 'react';

const BruteForceTimeEstimator = () => {
  const [passwordLength, setPasswordLength] = useState(8);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSpecial, setUseSpecial] = useState(true);
  const [attackRate, setAttackRate] = useState(1000000); // Attempts per second
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // Character set sizes
  const charSets = {
    lowercase: 26, // a-z
    uppercase: 26, // A-Z
    numbers: 10,   // 0-9
    special: 32    // !@#$%^&*()_+-=[]{}|;:,.<>? etc.
  };

  // Calculate brute force time
  const estimateTime = () => {
    setError('');
    setResults(null);

    if (passwordLength < 1 || passwordLength > 128) {
      setError('Password length must be between 1 and 128 characters');
      return;
    }
    if (!useLowercase && !useUppercase && !useNumbers && !useSpecial) {
      setError('At least one character type must be selected');
      return;
    }
    if (attackRate < 1) {
      setError('Attack rate must be at least 1 attempt per second');
      return;
    }

    // Calculate total character set size
    let totalChars = 0;
    if (useLowercase) totalChars += charSets.lowercase;
    if (useUppercase) totalChars += charSets.uppercase;
    if (useNumbers) totalChars += charSets.numbers;
    if (useSpecial) totalChars += charSets.special;

    // Total possible combinations
    const combinations = Math.pow(totalChars, passwordLength);

    // Time in seconds
    const seconds = combinations / attackRate;

    // Format time
    const timeBreakdown = {
      seconds: seconds,
      minutes: seconds / 60,
      hours: seconds / 3600,
      days: seconds / 86400,
      years: seconds / (86400 * 365.25), // Account for leap years
      centuries: seconds / (86400 * 365.25 * 100)
    };

    // Human-readable time
    let humanReadable = '';
    if (timeBreakdown.centuries >= 1) {
      humanReadable = `${timeBreakdown.centuries.toFixed(2)} centuries`;
    } else if (timeBreakdown.years >= 1) {
      humanReadable = `${timeBreakdown.years.toFixed(2)} years`;
    } else if (timeBreakdown.days >= 1) {
      humanReadable = `${timeBreakdown.days.toFixed(2)} days`;
    } else if (timeBreakdown.hours >= 1) {
      humanReadable = `${timeBreakdown.hours.toFixed(2)} hours`;
    } else if (timeBreakdown.minutes >= 1) {
      humanReadable = `${timeBreakdown.minutes.toFixed(2)} minutes`;
    } else {
      humanReadable = `${timeBreakdown.seconds.toFixed(2)} seconds`;
    }

    setResults({
      combinations: combinations.toLocaleString(),
      timeSeconds: seconds,
      humanReadable,
      timeBreakdown
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    estimateTime();
  };

  // Copy results to clipboard
  const copyToClipboard = () => {
    if (results) {
      const text = `Combinations: ${results.combinations}\nTime: ${results.humanReadable}`;
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
    setAttackRate(1000000);
    setResults(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">Brute Force Time Estimator</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password Length (1-128)
            </label>
            <input
              type="number"
              value={passwordLength}
              onChange={(e) => setPasswordLength(parseInt(e.target.value))}
              min={1}
              max={128}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
            />
          </div>

          {/* Character Sets */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-2">Character Sets</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={useLowercase}
                  onChange={(e) => setUseLowercase(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-200"
                />
                Lowercase (a-z, 26)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={useUppercase}
                  onChange={(e) => setUseUppercase(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-200"
                />
                Uppercase (A-Z, 26)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={useNumbers}
                  onChange={(e) => setUseNumbers(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-200"
                />
                Numbers (0-9, 10)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={useSpecial}
                  onChange={(e) => setUseSpecial(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-200"
                />
                Special (~32)
              </label>
            </div>
          </div>

          {/* Attack Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attack Rate (attempts per second)
            </label>
            <input
              type="number"
              value={attackRate}
              onChange={(e) => setAttackRate(parseInt(e.target.value))}
              min={1}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
            />
            <p className="text-xs text-gray-500 mt-1">
              Default: 1,000,000 (1M) attempts/sec. Typical rates range from thousands to billions depending on hardware.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Estimate Time
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm text-center mt-4">{error}</div>
        )}

        {/* Estimation Results */}
        {results && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Estimation Results</h2>
              <button
                onClick={copyToClipboard}
                className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Copy Results
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded border space-y-2">
              <p className="text-sm">
                <strong>Total Combinations:</strong> {results.combinations}
              </p>
              <p className="text-sm">
                <strong>Estimated Time:</strong> {results.humanReadable}
              </p>
              <p className="text-sm font-medium">Breakdown:</p>
              <ul className="list-disc pl-5 text-sm">
                <li>Seconds: {results.timeBreakdown.seconds.toFixed(2)}</li>
                <li>Minutes: {results.timeBreakdown.minutes.toFixed(2)}</li>
                <li>Hours: {results.timeBreakdown.hours.toFixed(2)}</li>
                <li>Days: {results.timeBreakdown.days.toFixed(2)}</li>
                <li>Years: {results.timeBreakdown.years.toFixed(2)}</li>
                <li>Centuries: {results.timeBreakdown.centuries.toFixed(2)}</li>
              </ul>
            </div>
          </div>
        )}

        {/* Note */}
        <p className="text-sm text-gray-600 mt-4">
          <strong>Note:</strong> This is a theoretical estimate assuming a constant attack rate. Real-world brute-force attacks vary based on hardware, optimization, and attack strategy (e.g., dictionary attacks).
        </p>
      </div>
    </div>
  );
};

export default BruteForceTimeEstimator;