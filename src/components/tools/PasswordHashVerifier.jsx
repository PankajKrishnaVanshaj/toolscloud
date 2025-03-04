// components/PasswordHashVerifier.js
'use client';

import React, { useState } from 'react';
import { MD5, SHA1, SHA256, SHA512 } from 'crypto-js';

const PasswordHashVerifier = () => {
  const [password, setPassword] = useState('');
  const [hash, setHash] = useState('');
  const [algorithm, setAlgorithm] = useState('sha256');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const hashFunctions = {
    md5: MD5,
    sha1: SHA1,
    sha256: SHA256,
    sha512: SHA512
  };

  // Verify password against hash
  const verifyHash = () => {
    setError('');
    setResults(null);

    if (!password) {
      setError('Please enter a password');
      return;
    }
    if (!hash) {
      setError('Please enter a hash to verify');
      return;
    }

    try {
      // Generate hash from password
      const generatedHash = hashFunctions[algorithm](password).toString();
      const isMatch = generatedHash.toLowerCase() === hash.toLowerCase().trim();

      setResults({
        generatedHash,
        isMatch,
        algorithm
      });
    } catch (err) {
      setError('Verification failed: ' + err.message);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    verifyHash();
  };

  // Copy generated hash to clipboard
  const copyToClipboard = () => {
    if (results && results.generatedHash) {
      navigator.clipboard.writeText(results.generatedHash);
    }
  };

  // Clear all
  const clearAll = () => {
    setPassword('');
    setHash('');
    setAlgorithm('sha256');
    setResults(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">Password Hash Verifier</h1>
        
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
                placeholder="Enter password"
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

          {/* Hash Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hash to Verify
            </label>
            <input
              type="text"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200 font-mono text-sm"
              placeholder="Enter hash (e.g., SHA-256)"
            />
          </div>

          {/* Algorithm Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hash Algorithm
            </label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
            >
              <option value="md5">MD5</option>
              <option value="sha1">SHA-1</option>
              <option value="sha256">SHA-256</option>
              <option value="sha512">SHA-512</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Verify Hash
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

        {/* Verification Results */}
        {results && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Verification Results</h2>
            <div className="bg-gray-50 p-4 rounded border space-y-2">
              <p className={`text-sm ${results.isMatch ? 'text-green-600' : 'text-red-600'}`}>
                <strong>Result:</strong> {results.isMatch ? '✓ Hash matches' : '✗ Hash does not match'}
              </p>
              <div className="flex justify-between items-center">
                <p className="text-sm">
                  <strong>Generated Hash ({results.algorithm.toUpperCase()}):</strong> {results.generatedHash}
                </p>
                <button
                  onClick={copyToClipboard}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Note */}
        <p className="text-sm text-gray-600 mt-4">
          <strong>Note:</strong> This tool verifies passwords against hashes using MD5, SHA-1, SHA-256, or SHA-512. These are not secure for modern password storage—use bcrypt, Argon2, or PBKDF2 with salts in production.
        </p>
      </div>
    </div>
  );
};

export default PasswordHashVerifier;