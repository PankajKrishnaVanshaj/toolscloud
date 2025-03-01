"use client"
import React, { useState } from 'react';
import { faker } from '@faker-js/faker'; // For random data generation
import crypto from 'crypto'; // Node.js crypto module for hash-based signatures

const RandomSignatureGenerator = () => {
  const [signature, setSignature] = useState('');
  const [type, setType] = useState('hash'); // Signature type: hash, uuid, stylized
  const [length, setLength] = useState(32); // Length for hash or stylized signatures
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]); // History of generated signatures

  // Generate random signature based on type
  const generateSignature = () => {
    let newSignature = '';
    try {
      switch (type) {
        case 'hash':
          // Generate a cryptographic hash (e.g., SHA-256) from random data
          const randomData = faker.string.alphanumeric({ length: 20 });
          newSignature = crypto
            .createHash('sha256')
            .update(randomData)
            .digest('hex')
            .slice(0, length);
          break;
        case 'uuid':
          // Generate a UUID
          newSignature = faker.string.uuid();
          break;
        case 'stylized':
          // Generate a stylized random string (e.g., for creative use)
          newSignature = faker.string
            .alphanumeric({ length })
            .replace(/(\w{4})/g, '$1-')
            .slice(0, -1)
            .toUpperCase();
          break;
        default:
          throw new Error('Invalid signature type');
      }
      setSignature(newSignature);
      setHistory((prev) => [
        { value: newSignature, type, timestamp: new Date() },
        ...prev.slice(0, 9), // Limit to 10 entries
      ]);
      setError('');
    } catch (err) {
      setError(`Generation failed: ${err.message}`);
    }
  };

  // Copy signature to clipboard
  const handleCopy = () => {
    if (signature) {
      navigator.clipboard.writeText(signature);
      setError('Signature copied to clipboard!');
      setTimeout(() => setError(''), 2000);
    }
  };

  // Download signature as text file
  const handleDownload = () => {
    if (signature) {
      const blob = new Blob([signature], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `signature_${type}_${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Reset
  const handleReset = () => {
    setSignature('');
    setError('');
  };

  // Load from history
  const loadFromHistory = (entry) => {
    setSignature(entry.value);
    setType(entry.type);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
        Random Signature Generator
      </h2>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Signature Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="hash">Cryptographic Hash (SHA-256)</option>
              <option value="uuid">UUID</option>
              <option value="stylized">Stylized String</option>
            </select>
          </div>
          {(type === 'hash' || type === 'stylized') && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Length (characters)
              </label>
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(Math.min(64, Math.max(4, e.target.value)))}
                min={4}
                max={64}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={generateSignature}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate Signature
          </button>
          <button
            onClick={handleCopy}
            disabled={!signature}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Copy
          </button>
          <button
            onClick={handleDownload}
            disabled={!signature}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Download
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Output */}
      {signature && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Generated Signature
          </h3>
          <pre className="w-full p-3 bg-white border border-gray-300 rounded-lg font-mono text-sm overflow-x-auto">
            {signature}
          </pre>
          <p className="text-xs text-gray-600 mt-1">
            Length: {signature.length} characters
          </p>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div
          className={`mb-4 text-sm p-3 rounded-md ${
            error.includes('copied') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {error}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Generation History</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((entry, index) => (
              <div
                key={index}
                onClick={() => loadFromHistory(entry)}
                className="p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
              >
                <p className="text-sm font-medium text-gray-800">
                  {entry.type} - {entry.timestamp.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {entry.value.slice(0, 50)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RandomSignatureGenerator;