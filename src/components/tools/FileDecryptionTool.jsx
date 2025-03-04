// components/FileDecryptionTool.js
'use client';

import React, { useState } from 'react';

const FileDecryptionTool = () => {
  const [file, setFile] = useState(null);
  const [key, setKey] = useState('');
  const [decryptedData, setDecryptedData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Derive AES key from user-provided string
  const deriveKey = async (keyString) => {
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(keyString),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('salt'), // Fixed salt for simplicity; should be unique in practice
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  };

  // Decrypt file
  const decryptFile = async () => {
    setLoading(true);
    setError('');
    setDecryptedData(null);

    if (!file) {
      setError('Please select a file to decrypt');
      setLoading(false);
      return;
    }
    if (!key) {
      setError('Please enter a decryption key');
      setLoading(false);
      return;
    }

    try {
      // Read file content as ArrayBuffer
      const reader = new FileReader();
      const encryptedData = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
      });

      // Derive AES key
      const aesKey = await deriveKey(key);

      // Extract IV (first 12 bytes) and ciphertext
      const iv = encryptedData.slice(0, 12);
      const ciphertext = encryptedData.slice(12);

      // Decrypt using AES-GCM
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        aesKey,
        ciphertext
      );

      // Create Blob for download
      const blob = new Blob([decryptedBuffer], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);

      // Attempt text preview
      let textPreview = null;
      try {
        const decoder = new TextDecoder('utf-8');
        textPreview = decoder.decode(decryptedBuffer.slice(0, 1024)); // Limit to 1KB
        if (!/^[ -~\t\n\r]*$/.test(textPreview)) { // Check if printable ASCII
          textPreview = null; // Not text
        }
      } catch (e) {
        textPreview = null;
      }

      setDecryptedData({
        url,
        size: decryptedBuffer.byteLength,
        textPreview,
        blob
      });
    } catch (err) {
      setError('Decryption failed: ' + (err.message || 'Invalid key or file format'));
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setDecryptedData(null);
      setError('');
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    decryptFile();
  };

  // Download decrypted file
  const downloadFile = () => {
    if (decryptedData && decryptedData.url) {
      const link = document.createElement('a');
      link.href = decryptedData.url;
      link.download = `decrypted_${file ? file.name : 'file'}`;
      link.click();
    }
  };

  // Copy text preview to clipboard
  const copyToClipboard = () => {
    if (decryptedData && decryptedData.textPreview) {
      navigator.clipboard.writeText(decryptedData.textPreview);
    }
  };

  // Clear all
  const clearAll = () => {
    setFile(null);
    setKey('');
    setDecryptedData(null);
    setError('');
    document.getElementById('fileInput').value = '';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">File Decryption Tool</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Encrypted File
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

          {/* Key Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Decryption Key
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
              placeholder="Enter the key used for encryption"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'Decrypting...' : 'Decrypt File'}
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

        {/* Decrypted Results */}
        {decryptedData && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Decrypted Results</h2>
            <div className="bg-gray-50 p-4 rounded border space-y-4">
              <p className="text-sm">
                <strong>File Size:</strong> {(decryptedData.size / 1024).toFixed(2)} KB
              </p>
              <div className="flex gap-4">
                <button
                  onClick={downloadFile}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Download File
                </button>
                {decryptedData.textPreview && (
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Copy Text Preview
                  </button>
                )}
              </div>
              {decryptedData.textPreview && (
                <div>
                  <p className="text-sm font-medium">Text Preview (First 1KB):</p>
                  <textarea
                    value={decryptedData.textPreview}
                    readOnly
                    className="w-full p-2 border rounded bg-gray-100 h-24 font-mono text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Note */}
        <p className="text-sm text-gray-600 mt-4">
          <strong>Note:</strong> Decrypts AES-GCM encrypted files using the Web Crypto API. The file must have a 12-byte IV prepended to the ciphertext, and the key must match the one used for encryption.
        </p>
      </div>
    </div>
  );
};

export default FileDecryptionTool;