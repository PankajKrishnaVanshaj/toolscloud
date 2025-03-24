"use client";
import React, { useState, useCallback } from "react";
import { FaEye, FaEyeSlash, FaSync, FaCopy } from "react-icons/fa";

const PasswordPolicyTester = () => {
  const [password, setPassword] = useState("");
  const [minLength, setMinLength] = useState(8);
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireLowercase, setRequireLowercase] = useState(true);
  const [requireNumbers, setRequireNumbers] = useState(true);
  const [requireSpecial, setRequireSpecial] = useState(true);
  const [forbidRepeats, setForbidRepeats] = useState(false);
  const [minUniqueChars, setMinUniqueChars] = useState(4);
  const [results, setResults] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // Define policy checks
  const checkPolicy = useCallback(() => {
    const uniqueChars = new Set(password).size;
    const checks = {
      length: password.length >= minLength,
      uppercase: requireUppercase ? /[A-Z]/.test(password) : true,
      lowercase: requireLowercase ? /[a-z]/.test(password) : true,
      numbers: requireNumbers ? /\d/.test(password) : true,
      special: requireSpecial ? /[!@#$%^&*(),.?":{}|<>]/.test(password) : true,
      repeats: forbidRepeats ? !/(.)\1{2,}/.test(password) : true,
      uniqueChars: uniqueChars >= minUniqueChars,
    };

    // Calculate strength score (0-100)
    const strengthFactors = {
      length: Math.min(password.length / minLength, 2) * 25, // Max 50 points
      uppercase: /[A-Z]/.test(password) ? 10 : 0,
      lowercase: /[a-z]/.test(password) ? 10 : 0,
      numbers: /\d/.test(password) ? 10 : 0,
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password) ? 10 : 0,
      unique: (uniqueChars / password.length) * 15 || 0, // Bonus for uniqueness
    };
    const strength = Math.min(
      strengthFactors.length +
        strengthFactors.uppercase +
        strengthFactors.lowercase +
        strengthFactors.numbers +
        strengthFactors.special +
        strengthFactors.unique,
      100
    );

    // Additional metrics
    const entropy = calculateEntropy(password);

    setResults({
      ...checks,
      meetsAll: Object.values(checks).every(Boolean),
      strength,
      entropy,
      uniqueCharsCount: uniqueChars,
    });
  }, [
    password,
    minLength,
    requireUppercase,
    requireLowercase,
    requireNumbers,
    requireSpecial,
    forbidRepeats,
    minUniqueChars,
  ]);

  // Calculate Shannon entropy (simplified)
  const calculateEntropy = (str) => {
    const charCount = {};
    str.split("").forEach((char) => {
      charCount[char] = (charCount[char] || 0) + 1;
    });
    const len = str.length;
    return (
      -Object.values(charCount).reduce((sum, count) => {
        const p = count / len;
        return sum + p * Math.log2(p);
      }, 0) || 0
    ).toFixed(2);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      setResults(null);
      return;
    }
    checkPolicy();
  };

  // Copy password to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Clear all
  const clearAll = () => {
    setPassword("");
    setMinLength(8);
    setRequireUppercase(true);
    setRequireLowercase(true);
    setRequireNumbers(true);
    setRequireSpecial(true);
    setForbidRepeats(false);
    setMinUniqueChars(4);
    setResults(null);
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Password Policy Tester
        </h1>

        <div className="space-y-6">
          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={checkPolicy}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password to test"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              <button
                type="button"
                onClick={copyToClipboard}
                disabled={!password}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 disabled:text-gray-300"
                title="Copy to clipboard"
              >
                <FaCopy />
              </button>
              {copied && (
                <span className="absolute right-12 top-0 -translate-y-full text-green-600 text-xs">
                  Copied!
                </span>
              )}
            </div>
          </div>

          {/* Policy Settings */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Policy Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Length (4-32)
                </label>
                <input
                  type="number"
                  value={minLength}
                  onChange={(e) =>
                    setMinLength(Math.max(4, Math.min(32, parseInt(e.target.value))))
                  }
                  min={4}
                  max={32}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Unique Characters (1-10)
                </label>
                <input
                  type="number"
                  value={minUniqueChars}
                  onChange={(e) =>
                    setMinUniqueChars(Math.max(1, Math.min(10, parseInt(e.target.value))))
                  }
                  min={1}
                  max={10}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {[
                { label: "Require Uppercase", value: requireUppercase, setter: setRequireUppercase },
                { label: "Require Lowercase", value: requireLowercase, setter: setRequireLowercase },
                { label: "Require Numbers", value: requireNumbers, setter: setRequireNumbers },
                { label: "Require Special", value: requireSpecial, setter: setRequireSpecial },
                { label: "Forbid Repeats (3+)", value: forbidRepeats, setter: setForbidRepeats },
              ].map(({ label, value, setter }) => (
                <label key={label} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setter(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleSubmit}
              disabled={!password}
              className="flex-1 py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Test Password
            </button>
            <button
              onClick={clearAll}
              className="flex-1 py-2 px-6 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear
            </button>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Policy Compliance</h2>
            <div className="bg-gray-50 p-4 rounded-lg border space-y-2">
              {[
                { key: "length", label: `Minimum length (${minLength} chars)` },
                { key: "uppercase", label: `${requireUppercase ? "Requires" : "Optional"} uppercase` },
                { key: "lowercase", label: `${requireLowercase ? "Requires" : "Optional"} lowercase` },
                { key: "numbers", label: `${requireNumbers ? "Requires" : "Optional"} numbers` },
                { key: "special", label: `${requireSpecial ? "Requires" : "Optional"} special chars` },
                { key: "repeats", label: "No repeated chars (3+)" },
                { key: "uniqueChars", label: `Min unique chars (${minUniqueChars})` },
              ].map(({ key, label }) => (
                <p key={key} className={results[key] ? "text-green-600" : "text-red-600"}>
                  {results[key] ? "✓" : "✗"} {label}
                </p>
              ))}
              <p
                className={`font-semibold ${
                  results.meetsAll ? "text-green-600" : "text-red-600"
                }`}
              >
                {results.meetsAll
                  ? "✓ Meets all policy requirements"
                  : "✗ Does not meet policy"}
              </p>
              <div className="mt-4 space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Password Strength:
                  </label>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div
                      className={`h-2.5 rounded-full ${
                        results.strength < 40
                          ? "bg-red-600"
                          : results.strength < 70
                          ? "bg-yellow-500"
                          : "bg-green-600"
                      }`}
                      style={{ width: `${results.strength}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{results.strength}%</p>
                </div>
                <p className="text-sm text-gray-600">
                  Entropy: {results.entropy} bits (Unique chars: {results.uniqueCharsCount})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Real-time password checking</li>
            <li>Customizable policy settings</li>
            <li>Strength meter with entropy calculation</li>
            <li>Copy to clipboard functionality</li>
            <li>Toggle password visibility</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PasswordPolicyTester;