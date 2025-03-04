// components/DecryptionTool.js
'use client';

import React, { useState } from 'react';
import AES from 'crypto-js/aes';
import UTF8 from 'crypto-js/enc-utf8';
import Base64 from 'crypto-js/enc-base64';

const DecryptionTool = () => {
  const [encryptedText, setEncryptedText] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [format, setFormat] = useState('aes'); // AES or Base64
  const [error, setError] = useState('');
  const [showKey, setShowKey] = useState(false);

  // Handle AES decryption
  const handleAESDecrypt = () => {
    try {
      if (!secretKey) {
        setError('Please enter a secret key');
        return;
      }
      if (!encryptedText) {
        setError('Please enter encrypted text');
        return;
      }

      const decrypted = AES.decrypt(encryptedText, secretKey).toString(UTF8);
      if (!decrypted) {
        setError('Invalid encrypted text or wrong key');
        return;
      }
      setDecryptedText(decrypted);
      setError('');
    } catch (err) {
      setError('AES Decryption failed: ' + err.message);
    }
  };

  // Handle Base64 decoding
  const handleBase64Decode = () => {
    try {
      if (!encryptedText) {
        setError('Please enter encoded text');
        return;
      }
      const decoded = Base64.parse(encryptedText).toString(UTF8);
      setDecryptedText(decoded);
      setError('');
    } catch (err) {
      setError('Base64 Decoding failed: ' + err.message);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    format === 'aes' ? handleAESDecrypt() : handleBase64Decode();
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(decryptedText);
  };

  // Clear all fields
  const clearAll = () => {
    setEncryptedText('');
    setDecryptedText('');
    setSecretKey('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">Decryption Tool</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Decryption Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
            >
              <option value="aes">AES</option>
              <option value="base64">Base64</option>
            </select>
          </div>

          {/* Secret Key (for AES only) */}
          {format === 'aes' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secret Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
                  placeholder="Enter your secret key"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          )}

          {/* Encrypted Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {format === 'aes' ? 'Encrypted Text' : 'Encoded Text'}
            </label>
            <textarea
              value={encryptedText}
              onChange={(e) => setEncryptedText(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200 h-32"
              placeholder={format === 'aes' 
                ? 'Enter AES encrypted text' 
                : 'Enter Base64 encoded text'}
            />
          </div>

          {/* Decrypted Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Decrypted Result
            </label>
            <div className="relative">
              <textarea
                value={decryptedText}
                readOnly
                className="w-full p-2 border rounded bg-gray-50 h-32"
                placeholder="Decrypted text will appear here"
              />
              {decryptedText && (
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
              Decrypt
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

export default DecryptionTool;