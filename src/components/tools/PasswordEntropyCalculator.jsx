"use client";
import React, { useState, useCallback } from "react";
import { FaEye, FaEyeSlash, FaCopy, FaSync, FaInfoCircle } from "react-icons/fa";

const PasswordEntropyCalculator = () => {
  const [password, setPassword] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSpecial, setUseSpecial] = useState(true);
  const [customPool, setCustomPool] = useState(""); // Custom character pool
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Character set definitions
  const charSets = {
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    special: "!@#$%^&*()_+-=[]{}|;:,.<>?"
  };

  // Calculate entropy
  const calculateEntropy = useCallback(() => {
    setError("");
    setResults(null);

    if (!password && !useCustom) {
      setError("Please enter a password or use custom settings");
      return;
    }

    let poolSize = 0;
    let poolChars = "";

    if (useCustom) {
      if (customPool) {
        // Use custom pool if provided
        const uniqueChars = [...new Set(customPool)];
        poolSize = uniqueChars.length;
        poolChars = uniqueChars.join("");
      } else {
        // Use selected character sets
        if (!useLowercase && !useUppercase && !useNumbers && !useSpecial) {
          setError("At least one character type must be selected in custom mode");
          return;
        }
        if (useLowercase) poolChars += charSets.lowercase;
        if (useUppercase) poolChars += charSets.uppercase;
        if (useNumbers) poolChars += charSets.numbers;
        if (useSpecial) poolChars += charSets.special;
        poolSize = poolChars.length;
      }
    } else {
      // Analyze actual password
      const uniqueChars = [...new Set(password)];
      poolSize = uniqueChars.reduce((sum, char) => {
        if (/[a-z]/.test(char)) return sum + charSets.lowercase.length;
        if (/[A-Z]/.test(char)) return sum + charSets.uppercase.length;
        if (/\d/.test(char)) return sum + charSets.numbers.length;
        if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(char)) return sum + charSets.special.length;
        return sum + 1; // Unknown characters count as 1
      }, 0) / uniqueChars.length; // Average pool size per unique character
      poolChars = uniqueChars.join("");
    }

    const length = useCustom && !password ? 1 : password.length || 1;
    const entropy = Math.log2(poolSize) * length;
    const combinations = Math.pow(poolSize, length);
    const timeToCrack = estimateTimeToCrack(entropy);

    // Strength classification
    let strength = "";
    if (entropy < 28) strength = "Very Weak";
    else if (entropy < 36) strength = "Weak";
    else if (entropy < 60) strength = "Moderate";
    else if (entropy < 128) strength = "Strong";
    else strength = "Very Strong";

    setResults({
      entropy: entropy.toFixed(2),
      combinations: combinations.toLocaleString(),
      poolSize: poolSize.toFixed(2),
      length,
      strength,
      timeToCrack,
      poolChars
    });
  }, [password, useCustom, useLowercase, useUppercase, useNumbers, useSpecial, customPool]);

  // Estimate time to crack (simplified)
  const estimateTimeToCrack = (entropy) => {
    const guessesPerSecond = 1e9; // 1 billion guesses/sec (modern hardware)
    const seconds = Math.pow(2, entropy) / guessesPerSecond;
    if (seconds < 60) return `${seconds.toFixed(2)} seconds`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(2)} minutes`;
    if (seconds < 86400) return `${(seconds / 3600).toFixed(2)} hours`;
    if (seconds < 31536000) return `${(seconds / 86400).toFixed(2)} days`;
    return `${(seconds / 31536000).toFixed(2)} years`;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    calculateEntropy();
  };

  // Copy results to clipboard
  const copyToClipboard = () => {
    if (results) {
      const text = `Entropy: ${results.entropy} bits\nCombinations: ${results.combinations}\nStrength: ${results.strength}\nTime to Crack: ${results.timeToCrack}`;
      navigator.clipboard.writeText(text);
    }
  };

  // Clear all
  const clearAll = () => {
    setPassword("");
    setUseCustom(false);
    setUseLowercase(true);
    setUseUppercase(true);
    setUseNumbers(true);
    setUseSpecial(true);
    setCustomPool("");
    setResults(null);
    setError("");
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Password Entropy Calculator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password (or length for custom mode)
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder={useCustom ? "Enter length (optional)" : "Enter password"}
              />
              {!useCustom && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              )}
            </div>
          </div>

          {/* Custom Mode Toggle */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={useCustom}
                onChange={(e) => setUseCustom(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              Use Custom Character Sets
            </label>
            <p className="text-xs text-gray-500 mt-1">
              {useCustom
                ? "Calculate based on selected or custom character sets"
                : "Analyze based on actual password characters"}
            </p>
          </div>

          {/* Custom Settings */}
          {useCustom && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Character Pool (Optional)
                </label>
                <input
                  type="text"
                  value={customPool}
                  onChange={(e) => setCustomPool(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter custom characters (e.g., abc123!@#)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to use selected sets below
                </p>
              </div>
              {!customPool && (
                <div>
                  <h2 className="text-sm font-medium text-gray-700 mb-2">Character Sets</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Lowercase (a-z, 26)", state: useLowercase, setter: setUseLowercase },
                      { label: "Uppercase (A-Z, 26)", state: useUppercase, setter: setUseUppercase },
                      { label: "Numbers (0-9, 10)", state: useNumbers, setter: setUseNumbers },
                      { label: "Special (~32)", state: useSpecial, setter: setUseSpecial }
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
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Calculate Entropy
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

        {/* Results */}
        {results && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Entropy Results</h2>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaCopy /> Copy
              </button>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Entropy:</strong> {results.entropy} bits
              </p>
              <p>
                <strong>Character Pool Size:</strong> {results.poolSize}
              </p>
              <p>
                <strong>Length:</strong> {results.length} characters
              </p>
              <p>
                <strong>Possible Combinations:</strong> {results.combinations}
              </p>
              <p>
                <strong>Time to Crack (1B guesses/sec):</strong> {results.timeToCrack}
              </p>
              <p>
                <strong>Character Pool:</strong> {results.poolChars || "N/A"}
              </p>
              <p
                className={`font-medium ${
                  results.strength === "Very Strong"
                    ? "text-green-600"
                    : results.strength === "Strong"
                    ? "text-green-500"
                    : results.strength === "Moderate"
                    ? "text-yellow-600"
                    : results.strength === "Weak"
                    ? "text-orange-600"
                    : "text-red-600"
                }`}
              >
                <strong>Strength:</strong> {results.strength}
              </p>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="flex items-center gap-2 font-semibold text-blue-700 mb-2">
            <FaInfoCircle /> How It Works
          </h3>
          <p className="text-sm text-blue-600">
            Entropy measures password randomness in bits. Higher values indicate stronger passwords:
          </p>
          <ul className="list-disc list-inside text-sm text-blue-600 mt-2">
            <li>&lt;28 bits: Very Weak</li>
            <li>28-35 bits: Weak</li>
            <li>36-59 bits: Moderate</li>
            <li>60-127 bits: Strong</li>
            <li>128+ bits: Very Strong</li>
          </ul>
          <p className="text-sm text-blue-600 mt-2">
            Time to crack assumes 1 billion guesses per second (modern hardware estimate).
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordEntropyCalculator;