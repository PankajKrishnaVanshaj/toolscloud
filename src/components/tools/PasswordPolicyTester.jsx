// components/PasswordPolicyTester.js
'use client';

import React, { useState } from 'react';

const PasswordPolicyTester = () => {
  const [password, setPassword] = useState('');
  const [minLength, setMinLength] = useState(8);
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireLowercase, setRequireLowercase] = useState(true);
  const [requireNumbers, setRequireNumbers] = useState(true);
  const [requireSpecial, setRequireSpecial] = useState(true);
  const [results, setResults] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Define policy checks
  const checkPolicy = () => {
    const checks = {
      length: password.length >= minLength,
      uppercase: requireUppercase ? /[A-Z]/.test(password) : true,
      lowercase: requireLowercase ? /[a-z]/.test(password) : true,
      numbers: requireNumbers ? /\d/.test(password) : true,
      special: requireSpecial ? /[!@#$%^&*(),.?":{}|<>]/.test(password) : true
    };

    // Calculate strength score (0-100)
    const strengthFactors = {
      length: Math.min(password.length / minLength, 2) * 30, // Max 60 points for length
      uppercase: /[A-Z]/.test(password) ? 10 : 0,
      lowercase: /[a-z]/.test(password) ? 10 : 0,
      numbers: /\d/.test(password) ? 10 : 0,
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password) ? 10 : 0
    };
    const strength = Math.min(
      strengthFactors.length +
      strengthFactors.uppercase +
      strengthFactors.lowercase +
      strengthFactors.numbers +
      strengthFactors.special,
      100
    );

    setResults({
      ...checks,
      meetsAll: Object.values(checks).every(Boolean),
      strength
    });
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

  // Clear all
  const clearAll = () => {
    setPassword('');
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">Password Policy Tester</h1>
        
        <div className="space-y-6">
          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={checkPolicy} // Real-time checking
                className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
                placeholder="Enter password to test"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Policy Settings */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Policy Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Length (4-32)
                </label>
                <input
                  type="number"
                  value={minLength}
                  onChange={(e) => setMinLength(Math.max(4, Math.min(32, parseInt(e.target.value))))}
                  min={4}
                  max={32}
                  className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={requireUppercase}
                    onChange={(e) => setRequireUppercase(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-200"
                  />
                  Require Uppercase
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={requireLowercase}
                    onChange={(e) => setRequireLowercase(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-200"
                  />
                  Require Lowercase
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={requireNumbers}
                    onChange={(e) => setRequireNumbers(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-200"
                  />
                  Require Numbers
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={requireSpecial}
                    onChange={(e) => setRequireSpecial(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-200"
                  />
                  Require Special
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test Password
            </button>
            <button
              onClick={clearAll}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Policy Compliance</h2>
            <div className="bg-gray-50 p-4 rounded border space-y-2">
              <p className={results.length ? 'text-green-600' : 'text-red-600'}>
                {results.length ? '✓' : '✗'} Minimum length ({minLength} characters)
              </p>
              <p className={results.uppercase ? 'text-green-600' : 'text-red-600'}>
                {results.uppercase ? '✓' : '✗'} {requireUppercase ? 'Requires' : 'Optional'} uppercase
              </p>
              <p className={results.lowercase ? 'text-green-600' : 'text-red-600'}>
                {results.lowercase ? '✓' : '✗'} {requireLowercase ? 'Requires' : 'Optional'} lowercase
              </p>
              <p className={results.numbers ? 'text-green-600' : 'text-red-600'}>
                {results.numbers ? '✓' : '✗'} {requireNumbers ? 'Requires' : 'Optional'} numbers
              </p>
              <p className={results.special ? 'text-green-600' : 'text-red-600'}>
                {results.special ? '✓' : '✗'} {requireSpecial ? 'Requires' : 'Optional'} special characters
              </p>
              <p className={`font-semibold ${results.meetsAll ? 'text-green-600' : 'text-red-600'}`}>
                {results.meetsAll ? '✓ Meets all policy requirements' : '✗ Does not meet policy'}
              </p>
              <div className="mt-2">
                <label className="text-sm font-medium text-gray-700">Password Strength:</label>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                  <div
                    className={`h-2.5 rounded-full ${
                      results.strength < 40 ? 'bg-red-600' : results.strength < 70 ? 'bg-yellow-500' : 'bg-green-600'
                    }`}
                    style={{ width: `${results.strength}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{results.strength}%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordPolicyTester;