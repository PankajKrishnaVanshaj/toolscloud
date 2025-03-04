// components/PasswordLeakChecker.js
'use client';

import React, { useState } from 'react';
import { SHA1 } from 'crypto-js';

const PasswordLeakChecker = () => {
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check password against HIBP API
  const checkPasswordLeak = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    if (!password) {
      setError('Please enter a password');
      setLoading(false);
      return;
    }

    try {
      // Hash the password with SHA-1 (HIBP requirement)
      const hash = SHA1(password).toString().toUpperCase();
      const hashPrefix = hash.slice(0, 5);
      const hashSuffix = hash.slice(5);

      // Fetch matching hash prefixes from HIBP
      const response = await fetch(`https://api.pwnedpasswords.com/range/${hashPrefix}`, {
        headers: {
          'Add-Padding': true // Request padding for additional security
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from HIBP API');
      }

      const data = await response.text();
      const lines = data.split('\n');

      // Check if our hash suffix appears in the results
      const match = lines.find(line => line.startsWith(hashSuffix));
      if (match) {
        const count = parseInt(match.split(':')[1], 10);
        setResult({
          breached: true,
          count: count
        });
      } else {
        setResult({
          breached: false,
          count: 0
        });
      }
    } catch (err) {
      setError('Error checking password: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    checkPasswordLeak();
  };

  // Clear all
  const clearAll = () => {
    setPassword('');
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">Password Leak Checker</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
                placeholder="Enter password to check"
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

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'Checking...' : 'Check Password'}
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

        {/* Result */}
        {result && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Result</h2>
            <div className="bg-gray-50 p-4 rounded border">
              {result.breached ? (
                <p className="text-red-600">
                  ⚠️ This password has been exposed in {result.count} breach{result.count !== 1 ? 'es' : ''}.
                  It should not be used.
                </p>
              ) : (
                <p className="text-green-600">
                  ✓ This password has not been found in known breaches.
                  (Note: This doesn’t guarantee it’s secure.)
                </p>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Data provided by{' '}
              <a href="https://haveibeenpwned.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Have I Been Pwned
              </a>.
            </p>
          </div>
        )}

        {/* Security Note */}
        <div className="mt-6 text-sm text-gray-600">
          <p>
            <strong>Note:</strong> Your password is hashed locally using SHA-1 and only the first 5 characters of the hash are sent to the HIBP API for checking (k-anonymity). The full password never leaves your device.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordLeakChecker;