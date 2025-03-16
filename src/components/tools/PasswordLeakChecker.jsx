"use client";

import React, { useState, useCallback } from "react";
import { SHA1 } from "crypto-js";
import { FaEye, FaEyeSlash, FaSync, FaLock } from "react-icons/fa";

const PasswordLeakChecker = () => {
  const [password, setPassword] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [checkHistory, setCheckHistory] = useState([]);
  const [strengthCheck, setStrengthCheck] = useState(false);

  // Check password strength (basic implementation)
  const checkPasswordStrength = (pwd) => {
    const hasLength = pwd.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    const score = [hasLength, hasUpperCase, hasLowerCase, hasNumbers, hasSpecial].filter(Boolean).length;
    return {
      score,
      message:
        score === 5
          ? "Strong"
          : score >= 3
          ? "Moderate"
          : "Weak - Consider adding more variety (length, uppercase, numbers, special characters)",
    };
  };

  // Check password against HIBP API
  const checkPasswordLeak = useCallback(async () => {
    setLoading(true);
    setError("");
    setResult(null);

    if (!password) {
      setError("Please enter a password");
      setLoading(false);
      return;
    }

    try {
      const hash = SHA1(password).toString().toUpperCase();
      const hashPrefix = hash.slice(0, 5);
      const hashSuffix = hash.slice(5);

      const response = await fetch(`https://api.pwnedpasswords.com/range/${hashPrefix}`, {
        headers: { "Add-Padding": true },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch from HIBP API");
      }

      const data = await response.text();
      const lines = data.split("\n");
      const match = lines.find((line) => line.startsWith(hashSuffix));

      const resultData = match
        ? { breached: true, count: parseInt(match.split(":")[1], 10) }
        : { breached: false, count: 0 };

      setResult(resultData);

      // Add to history
      setCheckHistory((prev) => [
        {
          password: password.slice(0, 3) + "*".repeat(password.length - 3),
          ...resultData,
          timestamp: new Date().toLocaleString(),
          strength: strengthCheck ? checkPasswordStrength(password) : null,
        },
        ...prev.slice(0, 4), // Keep last 5 entries
      ]);
    } catch (err) {
      setError("Error checking password: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [password, strengthCheck]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    checkPasswordLeak();
  };

  // Clear all
  const clearAll = () => {
    setPassword("");
    setResult(null);
    setError("");
    setCheckHistory([]);
    setStrengthCheck(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Password Leak Checker
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter password to check"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={strengthCheck}
                onChange={(e) => setStrengthCheck(e.target.checked)}
                className="mr-2 accent-blue-500"
                disabled={loading}
              />
              <span className="text-sm text-gray-700">Check Password Strength</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              ) : (
                <FaLock className="mr-2" />
              )}
              {loading ? "Checking..." : "Check Password"}
            </button>
            <button
              type="button"
              onClick={clearAll}
              disabled={loading}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Result</h2>
            <div className="p-4 bg-gray-50 rounded-lg border">
              {result.breached ? (
                <p className="text-red-600">
                  ⚠️ This password has been exposed in{" "}
                  {result.count.toLocaleString()} breach{result.count !== 1 ? "es" : ""}. It should
                  not be used.
                </p>
              ) : (
                <p className="text-green-600">
                  ✓ This password has not been found in known breaches. (Note: This doesn’t
                  guarantee it’s secure.)
                </p>
              )}
              {strengthCheck && (
                <p className="mt-2 text-sm">
                  <span className="font-medium">Strength: </span>
                  <span
                    className={
                      checkPasswordStrength(password).score === 5
                        ? "text-green-600"
                        : checkPasswordStrength(password).score >= 3
                        ? "text-yellow-600"
                        : "text-red-600"
                    }
                  >
                    {checkPasswordStrength(password).message}
                  </span>
                </p>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Data provided by{" "}
              <a
                href="https://haveibeenpwned.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Have I Been Pwned
              </a>
              .
            </p>
          </div>
        )}

        {/* Check History */}
        {checkHistory.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Check History</h2>
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {checkHistory.map((entry, index) => (
                <li key={index} className="p-3 bg-gray-50 rounded-md text-sm">
                  <span className="font-medium">{entry.password}</span> -{" "}
                  {entry.breached ? (
                    <span className="text-red-600">
                      Breached ({entry.count.toLocaleString()})
                    </span>
                  ) : (
                    <span className="text-green-600">Not Breached</span>
                  )}
                  {entry.strength && (
                    <span className="ml-2">
                      | Strength:{" "}
                      <span
                        className={
                          entry.strength.score === 5
                            ? "text-green-600"
                            : entry.strength.score >= 3
                            ? "text-yellow-600"
                            : "text-red-600"
                        }
                      >
                        {entry.strength.message}
                      </span>
                    </span>
                  )}
                  <span className="block text-gray-500 text-xs mt-1">{entry.timestamp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Security Note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>Security Note:</strong> Your password is hashed locally using SHA-1. Only the
            first 5 characters of the hash are sent to the HIBP API (k-anonymity). The full password
            never leaves your device.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordLeakChecker;