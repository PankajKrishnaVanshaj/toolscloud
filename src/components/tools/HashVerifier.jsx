// components/HashVerifier.js
'use client';

import React, { useState } from 'react';
import { MD5, SHA1, SHA256, SHA512 } from 'crypto-js';

const HashVerifier = () => {
  const [inputText, setInputText] = useState('');
  const [hashOutput, setHashOutput] = useState('');
  const [verifyHash, setVerifyHash] = useState('');
  const [algorithm, setAlgorithm] = useState('md5');
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');

  const hashFunctions = {
    md5: MD5,
    sha1: SHA1,
    sha256: SHA256,
    sha512: SHA512
  };

  // Generate hash
  const generateHash = () => {
    try {
      if (!inputText) {
        setError('Please enter text to hash');
        return;
      }
      const hash = hashFunctions[algorithm](inputText).toString();
      setHashOutput(hash);
      setError('');
      verifyHash && verifyHashValue(hash);
    } catch (err) {
      setError('Hash generation failed: ' + err.message);
    }
  };

  // Verify hash
  const verifyHashValue = (generatedHash = hashOutput) => {
    if (!verifyHash) {
      setVerificationResult(null);
      return;
    }
    const isValid = generatedHash.toLowerCase() === verifyHash.toLowerCase();
    setVerificationResult(isValid);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    generateHash();
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(hashOutput);
  };

  // Clear all fields
  const clearAll = () => {
    setInputText('');
    setHashOutput('');
    setVerifyHash('');
    setVerificationResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">Hash Verifier</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Input Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Input Text
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200 h-32"
              placeholder="Enter text to hash"
            />
          </div>

          {/* Generated Hash */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Generated Hash
            </label>
            <div className="relative">
              <textarea
                value={hashOutput}
                readOnly
                className="w-full p-2 border rounded bg-gray-50 h-32 font-mono text-sm"
                placeholder="Generated hash will appear here"
              />
              {hashOutput && (
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="absolute right-2 top-2 px-2 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  Copy
                </button>
              )}
            </div>
          </div>

          {/* Verify Hash */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hash to Verify
            </label>
            <input
              type="text"
              value={verifyHash}
              onChange={(e) => {
                setVerifyHash(e.target.value);
                hashOutput && verifyHashValue();
              }}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200 font-mono"
              placeholder="Enter hash to verify against"
            />
            {verificationResult !== null && (
              <p className={`mt-2 text-sm ${
                verificationResult ? 'text-green-600' : 'text-red-600'
              }`}>
                {verificationResult ? '✓ Hash matches' : '✗ Hash does not match'}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

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
      </div>
    </div>
  );
};

export default HashVerifier;