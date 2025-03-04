// components/PasswordHashGenerator.js
'use client';

import React, { useState } from 'react';
import { MD5, SHA1, SHA256, SHA512 } from 'crypto-js';

const PasswordHashGenerator = () => {
  const [password, setPassword] = useState('');
  const [algorithm, setAlgorithm] = useState('sha256');
  const [outputFormat, setOutputFormat] = useState('hex'); // hex, base64
  const [hash, setHash] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const hashFunctions = {
    md5: MD5,
    sha1: SHA1,
    sha256: SHA256,
    sha512: SHA512
  };

  // Generate hash from password
  const generateHash = () => {
    setError('');
    setHash('');

    if (!password) {
      setError('Please enter a password to hash');
      return;
    }

    try {
      const hashObj = hashFunctions[algorithm](password);
      const hashString = outputFormat === 'base64' ? hashObj.toString(CryptoJS.enc.Base64) : hashObj.toString();
      setHash(hashString);
    } catch (err) {
      setError('Hash generation failed: ' + err.message);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    generateHash();
  };

  // Copy hash to clipboard
  const copyToClipboard = () => {
    if (hash) {
      navigator.clipboard.writeText(hash);
    }
  };

  // Download hash as a text file
  const downloadAsFile = () => {
    if (hash) {
      const blob = new Blob([hash], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hash_${algorithm}.${outputFormat === 'base64' ? 'b64' : 'txt'}`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Clear all
  const clearAll = () => {
    setPassword('');
    setAlgorithm('sha256');
    setOutputFormat('hex');
    setHash('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">Password Hash Generator</h1>
        
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
                placeholder="Enter password to hash"
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

          {/* Output Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Output Format
            </label>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
            >
              <option value="hex">Hexadecimal</option>
              <option value="base64">Base64</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Generate Hash
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

        {/* Generated Hash */}
        {hash && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Generated Hash</h2>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Copy
                </button>
                <button
                  onClick={downloadAsFile}
                  className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Download
                </button>
              </div>
            </div>
            <textarea
              value={hash}
              readOnly
              className="w-full p-2 border rounded bg-gray-50 h-24 font-mono text-sm"
            />
            <p className="text-sm text-gray-600 mt-2">
              Algorithm: {algorithm.toUpperCase()} | Format: {outputFormat === 'hex' ? 'Hexadecimal' : 'Base64'}
            </p>
          </div>
        )}

        {/* Note */}
        <p className="text-sm text-gray-600 mt-4">
          <strong>Note:</strong> Generates hashes using MD5, SHA-1, SHA-256, or SHA-512. For secure password storage, use salted algorithms like bcrypt, Argon2, or PBKDF2 instead.
        </p>
      </div>
    </div>
  );
};

export default PasswordHashGenerator;