// components/ChecksumGenerator.js
'use client';

import React, { useState } from 'react';
import { MD5, SHA1, SHA256 } from 'crypto-js';

const ChecksumGenerator = () => {
  const [inputType, setInputType] = useState('text'); // text, file
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState(null);
  const [algorithm, setAlgorithm] = useState('sha256');
  const [outputFormat, setOutputFormat] = useState('hex'); // hex, base64
  const [checksum, setChecksum] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const hashFunctions = {
    md5: MD5,
    sha1: SHA1,
    sha256: SHA256
  };

  // Compute checksum from text
  const computeTextChecksum = () => {
    try {
      if (!textInput) {
        setError('Please enter text to compute checksum');
        return false;
      }
      const hash = hashFunctions[algorithm](textInput);
      const result = outputFormat === 'base64' ? hash.toString(CryptoJS.enc.Base64) : hash.toString();
      setChecksum(result);
      return true;
    } catch (err) {
      setError('Checksum computation failed: ' + err.message);
      return false;
    }
  };

  // Compute checksum from file
  const computeFileChecksum = async () => {
    if (!file) {
      setError('Please select a file');
      return false;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      const result = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file); // Treat file as text for simplicity
      });

      const hash = hashFunctions[algorithm](result);
      const checksumResult = outputFormat === 'base64' ? hash.toString(CryptoJS.enc.Base64) : hash.toString();
      setChecksum(checksumResult);
      return true;
    } catch (err) {
      setError('File checksum computation failed: ' + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setChecksum('');

    const success = inputType === 'text' ? computeTextChecksum() : await computeFileChecksum();
    if (!success) {
      setChecksum('');
    }
  };

  // Handle file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setChecksum('');
    setError('');
  };

  // Copy checksum to clipboard
  const copyToClipboard = () => {
    if (checksum) {
      navigator.clipboard.writeText(checksum);
    }
  };

  // Clear all
  const clearAll = () => {
    setTextInput('');
    setFile(null);
    setChecksum('');
    setError('');
    if (document.getElementById('fileInput')) {
      document.getElementById('fileInput').value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">Checksum Generator</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Input Type
            </label>
            <select
              value={inputType}
              onChange={(e) => setInputType(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
            >
              <option value="text">Text</option>
              <option value="file">File</option>
            </select>
          </div>

          {/* Algorithm Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Algorithm
            </label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
            >
              <option value="md5">MD5</option>
              <option value="sha1">SHA-1</option>
              <option value="sha256">SHA-256</option>
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

          {/* Input */}
          {inputType === 'text' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Input
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full p-2 border rounded focus:ring focus:ring-blue-200 h-24"
                placeholder="Enter text to compute checksum"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Input
              </label>
              <input
                id="fileInput"
                type="file"
                onChange={handleFileChange}
                className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
              />
              {file && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'Computing...' : 'Generate Checksum'}
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

        {/* Generated Checksum */}
        {checksum && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Generated Checksum</h2>
            <div className="bg-gray-50 p-4 rounded border">
              <div className="flex justify-between items-center">
                <p className="font-mono text-sm break-all">{checksum}</p>
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
      </div>
    </div>
  );
};

export default ChecksumGenerator;