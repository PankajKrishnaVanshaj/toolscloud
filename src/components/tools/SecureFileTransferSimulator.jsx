// components/SecureFileTransferSimulator.js
'use client';

import React, { useState } from 'react';
import { AES, enc } from 'crypto-js';

const SecureFileTransferSimulator = () => {
  const [file, setFile] = useState(null);
  const [secretKey, setSecretKey] = useState('');
  const [transferStatus, setTransferStatus] = useState('idle'); // idle, encrypting, transferring, complete, error
  const [progress, setProgress] = useState(0);
  const [encryptedData, setEncryptedData] = useState('');
  const [error, setError] = useState('');

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setTransferStatus('idle');
      setProgress(0);
      setEncryptedData('');
      setError('');
    }
  };

  // Simulate secure file transfer
  const simulateTransfer = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }
    if (!secretKey) {
      setError('Please enter a secret key');
      return;
    }

    try {
      // Step 1: Read file content
      setTransferStatus('encrypting');
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        const fileContent = e.target.result;

        // Step 2: Encrypt file content
        const encrypted = AES.encrypt(fileContent, secretKey).toString();
        setEncryptedData(encrypted);

        // Step 3: Simulate transfer
        setTransferStatus('transferring');
        const fileSize = file.size / 1024; // Size in KB
        const transferSpeed = 50 + Math.random() * 50; // Simulated KB/s (50-100 KB/s)
        const totalTime = fileSize / transferSpeed * 1000; // Time in ms
        const steps = 20; // Number of progress updates
        const intervalTime = totalTime / steps;

        let currentProgress = 0;
        const progressInterval = setInterval(() => {
          currentProgress += 100 / steps;
          setProgress(Math.min(currentProgress, 100));

          if (currentProgress >= 100) {
            clearInterval(progressInterval);
            setTransferStatus('complete');
          }
        }, intervalTime);
      };
      fileReader.onerror = () => {
        setError('Error reading file');
        setTransferStatus('error');
      };
      fileReader.readAsText(file); // Assuming text-based files for simplicity
    } catch (err) {
      setError('Transfer simulation failed: ' + err.message);
      setTransferStatus('error');
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    simulateTransfer();
  };

  // Copy encrypted data to clipboard
  const copyToClipboard = () => {
    if (encryptedData) {
      navigator.clipboard.writeText(encryptedData);
    }
  };

  // Clear all
  const clearAll = () => {
    setFile(null);
    setSecretKey('');
    setTransferStatus('idle');
    setProgress(0);
    setEncryptedData('');
    setError('');
    document.getElementById('fileInput').value = ''; // Reset file input
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">Secure File Transfer Simulator</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select File
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

          {/* Secret Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Encryption Key
            </label>
            <input
              type="text"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
              placeholder="Enter a secret key for encryption"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              disabled={transferStatus === 'encrypting' || transferStatus === 'transferring'}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              Start Transfer
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

        {/* Transfer Status */}
        {transferStatus !== 'idle' && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Transfer Status</h2>
            <div className="bg-gray-50 p-4 rounded border">
              <p className="text-sm">
                <span className="font-medium">Status:</span>{' '}
                {transferStatus === 'encrypting' && 'Encrypting file...'}
                {transferStatus === 'transferring' && 'Transferring file...'}
                {transferStatus === 'complete' && 'Transfer completed'}
                {transferStatus === 'error' && 'Transfer failed'}
              </p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{Math.round(progress)}% complete</p>
              </div>
              {encryptedData && transferStatus === 'complete' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Encrypted Data
                  </label>
                  <div className="relative">
                    <textarea
                      value={encryptedData}
                      readOnly
                      className="w-full p-2 border rounded bg-gray-50 h-24 font-mono text-sm"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="absolute right-2 top-2 px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm text-center mt-4">{error}</div>
        )}

        {/* Note */}
        <p className="text-sm text-gray-600 mt-4">
          <strong>Note:</strong> This is a simulation. Files are encrypted locally using AES and "transferred" with mock progress. No actual network transfer occurs.
        </p>
      </div>
    </div>
  );
};

export default SecureFileTransferSimulator;