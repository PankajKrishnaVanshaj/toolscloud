// components/FileEncryptionTool.js
'use client';

import React, { useState } from 'react';

const FileEncryptionTool = () => {
  const [file, setFile] = useState(null);
  const [key, setKey] = useState('');
  const [encryptedData, setEncryptedData] = useState(null);
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

  // Encrypt file
  const encryptFile = async () => {
    setLoading(true);
    setError('');
    setEncryptedData(null);

    if (!file) {
      setError('Please select a file to encrypt');
      setLoading(false);
      return;
    }
    if (!key) {
      setError('Please enter an encryption key');
      setLoading(false);
      return;
    }

    try {
      // Read file content as ArrayBuffer
      const reader = new FileReader();
      const fileData = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
      });

      // Derive AES key
      const aesKey = await deriveKey(key);

      // Generate 12-byte IV (nonce)
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      // Encrypt the file data
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        aesKey,
        fileData
      );

      // Combine IV and ciphertext into a single ArrayBuffer
      const encryptedWithIv = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      encryptedWithIv.set(iv, 0);
      encryptedWithIv.set(new Uint8Array(encryptedBuffer), iv.length);

      // Create Blob for download
      const blob = new Blob([encryptedWithIv], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);

      setEncryptedData({
        url,
        size: encryptedWithIv.length,
        blob
      });
    } catch (err) {
      setError('Encryption failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setEncryptedData(null);
      setError('');
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    encryptFile();
  };

  // Download encrypted file
  const downloadFile = () => {
    if (encryptedData && encryptedData.url) {
      const link = document.createElement('a');
      link.href = encryptedData.url;
      link.download = `encrypted_${file ? file.name : 'file'}.enc`;
      link.click();
    }
  };

  // Clear all
  const clearAll = () => {
    setFile(null);
    setKey('');
    setEncryptedData(null);
    setError('');
    document.getElementById('fileInput').value = '';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">File Encryption Tool</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File to Encrypt
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
              Encryption Key
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
              placeholder="Enter a secure key"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'Encrypting...' : 'Encrypt File'}
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

        {/* Encrypted Results */}
        {encryptedData && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Encrypted Results</h2>
            <div className="bg-gray-50 p-4 rounded border space-y-4">
              <p className="text-sm">
                <strong>File Size:</strong> {(encryptedData.size / 1024).toFixed(2)} KB
              </p>
              <button
                onClick={downloadFile}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Download Encrypted File
              </button>
              <p className="text-sm text-gray-600">
                Format: AES-GCM with 12-byte IV prepended
              </p>
            </div>
          </div>
        )}

        {/* Note */}
        <p className="text-sm text-gray-600 mt-4">
          <strong>Note:</strong> Encrypts files using AES-GCM with a 256-bit key derived from your input via PBKDF2. The output includes a 12-byte IV followed by the ciphertext, compatible with the File Decryption Tool.
        </p>
      </div>
    </div>
  );
};

export default FileEncryptionTool;