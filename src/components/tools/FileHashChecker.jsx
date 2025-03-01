"use client";

import React, { useState } from 'react';

const FileHashChecker = () => {
  const [file, setFile] = useState(null);
  const [hashType, setHashType] = useState('SHA-256');
  const [expectedHash, setExpectedHash] = useState('');
  const [calculatedHash, setCalculatedHash] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const hashAlgorithms = ['MD5', 'SHA-1', 'SHA-256'];

  const calculateHash = async (fileData, algorithm) => {
    try {
      setLoading(true);
      setError(null);
      setCalculatedHash('');
      setCopied(false);

      // Read file as ArrayBuffer
      const arrayBuffer = await fileData.arrayBuffer();

      // Use Web Crypto API to calculate hash
      let cryptoAlgorithm = algorithm;
      if (algorithm === 'MD5') {
        // Web Crypto doesn't support MD5 natively, use a fallback (simplified)
        const md5Hash = await import('md5').then(module => module.default(arrayBuffer));
        return md5Hash;
      } else {
        cryptoAlgorithm = algorithm.replace('SHA-', 'SHA-'); // Adjust for Web Crypto naming
        const hashBuffer = await crypto.subtle.digest(cryptoAlgorithm, arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (err) {
      setError('Error calculating hash: ' + err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const hash = await calculateHash(selectedFile, hashType);
    if (hash) {
      setCalculatedHash(hash);
    }
  };

  const handleHashTypeChange = async (newHashType) => {
    setHashType(newHashType);
    if (file) {
      const hash = await calculateHash(file, newHashType);
      if (hash) {
        setCalculatedHash(hash);
      }
    }
  };

  const handleCopy = () => {
    if (calculatedHash) {
      navigator.clipboard.writeText(calculatedHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const verifyHash = () => {
    if (!calculatedHash || !expectedHash) return null;
    return calculatedHash.toLowerCase() === expectedHash.toLowerCase();
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">File Hash Checker</h2>

        {/* File Upload and Options */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload File
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            {file && <p className="mt-2 text-sm text-gray-600">Selected: {file.name}</p>}
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hash Algorithm
              </label>
              <select
                value={hashType}
                onChange={(e) => handleHashTypeChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                {hashAlgorithms.map(alg => (
                  <option key={alg} value={alg}>{alg}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Hash (optional)
              </label>
              <input
                type="text"
                value={expectedHash}
                onChange={(e) => setExpectedHash(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter hash to verify"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Hash Result */}
        {calculatedHash && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-700">Calculated Hash</h3>
                <button
                  onClick={handleCopy}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  disabled={loading}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
                {loading ? 'Calculating...' : calculatedHash}
              </pre>
            </div>

            {expectedHash && (
              <div className={`p-4 rounded-md ${verifyHash() ? 'bg-green-50' : 'bg-red-50'}`}>
                <h3 className="font-semibold text-gray-700">Verification</h3>
                <p className={`text-lg ${verifyHash() ? 'text-green-700' : 'text-red-700'}`}>
                  {verifyHash() ? 'Hash matches!' : 'Hash does not match'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div className="mt-4 text-sm text-gray-600">
          <p>Notes:</p>
          <ul className="list-disc pl-5">
            <li>MD5 is implemented via a fallback (not native Web Crypto)</li>
            <li>SHA-1 and SHA-256 use the Web Crypto API</li>
            <li>Hash verification is case-insensitive</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FileHashChecker;