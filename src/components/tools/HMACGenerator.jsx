// components/HMACGenerator.js
'use client';

import React, { useState } from 'react';
import { HmacMD5, HmacSHA1, HmacSHA256, HmacSHA512 } from 'crypto-js';

const HMACGenerator = () => {
  const [message, setMessage] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [algorithm, setAlgorithm] = useState('sha256');
  const [outputFormat, setOutputFormat] = useState('hex'); // hex, base64
  const [generatedHmac, setGeneratedHmac] = useState('');
  const [error, setError] = useState('');

  const hmacFunctions = {
    md5: HmacMD5,
    sha1: HmacSHA1,
    sha256: HmacSHA256,
    sha512: HmacSHA512
  };

  // Generate HMAC
  const generateHmac = () => {
    try {
      if (!message) {
        setError('Please enter a message');
        return;
      }
      if (!secretKey) {
        setError('Please enter a secret key');
        return;
      }

      const hmac = hmacFunctions[algorithm](message, secretKey);
      const output = outputFormat === 'base64' ? hmac.toString(CryptoJS.enc.Base64) : hmac.toString();
      setGeneratedHmac(output);
      setError('');
    } catch (err) {
      setError('HMAC generation failed: ' + err.message);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    generateHmac();
  };

  // Copy generated HMAC to clipboard
  const copyToClipboard = () => {
    if (generatedHmac) {
      navigator.clipboard.writeText(generatedHmac);
    }
  };

  // Clear all fields
  const clearAll = () => {
    setMessage('');
    setSecretKey('');
    setGeneratedHmac('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">HMAC Generator</h1>
        
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
              <option value="md5">HMAC-MD5</option>
              <option value="sha1">HMAC-SHA1</option>
              <option value="sha256">HMAC-SHA256</option>
              <option value="sha512">HMAC-SHA512</option>
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

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200 h-24"
              placeholder="Enter the message to authenticate"
            />
          </div>

          {/* Secret Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secret Key
            </label>
            <input
              type="text"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
              placeholder="Enter your secret key"
            />
          </div>

          {/* Generated HMAC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Generated HMAC
            </label>
            <div className="relative">
              <textarea
                value={generatedHmac}
                readOnly
                className="w-full p-2 border rounded bg-gray-50 h-24 font-mono text-sm"
                placeholder="Generated HMAC will appear here"
              />
              {generatedHmac && (
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
              Generate HMAC
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

export default HMACGenerator;