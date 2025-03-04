// components/EncryptionTool.js
'use client';

import React, { useState } from 'react';
import { encrypt, decrypt } from 'crypto-js/aes';
import UTF8 from 'crypto-js/enc-utf8';

const EncryptionTool = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [mode, setMode] = useState('encrypt'); // 'encrypt' or 'decrypt'
  const [algorithm, setAlgorithm] = useState('aes'); // Can extend with more algorithms
  const [error, setError] = useState('');

  // Handle encryption
  const handleEncrypt = () => {
    try {
      if (!secretKey) {
        setError('Please enter a secret key');
        return;
      }
      if (!inputText) {
        setError('Please enter text to encrypt');
        return;
      }
      
      const encrypted = encrypt(inputText, secretKey).toString();
      setOutputText(encrypted);
      setError('');
    } catch (err) {
      setError('Encryption failed: ' + err.message);
    }
  };

  // Handle decryption
  const handleDecrypt = () => {
    try {
      if (!secretKey) {
        setError('Please enter a secret key');
        return;
      }
      if (!inputText) {
        setError('Please enter text to decrypt');
        return;
      }
      
      const decrypted = decrypt(inputText, secretKey).toString(UTF8);
      if (!decrypted) {
        setError('Invalid encrypted text or wrong key');
        return;
      }
      setOutputText(decrypted);
      setError('');
    } catch (err) {
      setError('Decryption failed: ' + err.message);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    mode === 'encrypt' ? handleEncrypt() : handleDecrypt();
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
  };

  // Clear all fields
  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setSecretKey('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">Encryption Tool</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mode Selection */}
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={() => setMode('encrypt')}
              className={`px-4 py-2 rounded ${
                mode === 'encrypt'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Encrypt
            </button>
            <button
              type="button"
              onClick={() => setMode('decrypt')}
              className={`px-4 py-2 rounded ${
                mode === 'decrypt'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Decrypt
            </button>
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
              <option value="aes">AES</option>
              {/* Add more algorithms here in future */}
            </select>
          </div>

          {/* Secret Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secret Key
            </label>
            <input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
              placeholder="Enter your secret key"
            />
          </div>

          {/* Input Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {mode === 'encrypt' ? 'Plain Text' : 'Encrypted Text'}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200 h-32"
              placeholder={mode === 'encrypt' 
                ? 'Enter text to encrypt' 
                : 'Enter text to decrypt'}
            />
          </div>

          {/* Output Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Result
            </label>
            <div className="relative">
              <textarea
                value={outputText}
                readOnly
                className="w-full p-2 border rounded bg-gray-50 h-32"
                placeholder="Result will appear here"
              />
              {outputText && (
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
              {mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
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

export default EncryptionTool;