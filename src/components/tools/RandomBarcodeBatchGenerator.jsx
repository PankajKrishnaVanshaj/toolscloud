"use client"
import React, { useState } from 'react';
import { faker } from '@faker-js/faker'; // For random data generation

const RandomBarcodeBatchGenerator = () => {
  const [barcodeType, setBarcodeType] = useState('ean13'); // Barcode type: ean13, upc, custom
  const [batchSize, setBatchSize] = useState(10); // Number of barcodes to generate
  const [customLength, setCustomLength] = useState(12); // Length for custom barcodes
  const [barcodes, setBarcodes] = useState([]); // Generated barcodes
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]); // History of batches

  // Generate a single barcode based on type
  const generateBarcode = () => {
    try {
      switch (barcodeType) {
        case 'ean13':
          // EAN-13: 13 digits, last digit is a checksum
          const eanBase = faker.string.numeric({ length: 12 });
          const eanChecksum = calculateEan13Checksum(eanBase);
          return eanBase + eanChecksum;
        case 'upc':
          // UPC-A: 12 digits, last digit is a checksum
          const upcBase = faker.string.numeric({ length: 11 });
          const upcChecksum = calculateUpcChecksum(upcBase);
          return upcBase + upcChecksum;
        case 'custom':
          return faker.string.numeric({ length: customLength }); // Custom numeric string
        default:
          throw new Error('Invalid barcode type');
      }
    } catch (err) {
      throw new Error(`Barcode generation failed: ${err.message}`);
    }
  };

  // Calculate EAN-13 checksum
  const calculateEan13Checksum = (base) => {
    const digits = base.split('').map(Number);
    const sum = digits.reduce((acc, digit, i) => acc + (i % 2 === 0 ? digit : digit * 3), 0);
    const checksum = (10 - (sum % 10)) % 10;
    return checksum.toString();
  };

  // Calculate UPC-A checksum
  const calculateUpcChecksum = (base) => {
    const digits = base.split('').map(Number);
    const sum = digits.reduce((acc, digit, i) => acc + (i % 2 === 0 ? digit * 3 : digit), 0);
    const checksum = (10 - (sum % 10)) % 10;
    return checksum.toString();
  };

  // Generate a batch of barcodes
  const generateBatch = () => {
    try {
      const newBarcodes = Array.from({ length: batchSize }, generateBarcode);
      setBarcodes(newBarcodes);
      setHistory((prev) => [
        { barcodes: newBarcodes, type: barcodeType, timestamp: new Date() },
        ...prev.slice(0, 9), // Limit to 10 batches
      ]);
      setError('');
    } catch (err) {
      setError(`Generation failed: ${err.message}`);
    }
  };

  // Copy barcodes to clipboard
  const handleCopy = () => {
    if (barcodes.length > 0) {
      navigator.clipboard.writeText(barcodes.join('\n'));
      setError('Barcodes copied to clipboard!');
      setTimeout(() => setError(''), 2000);
    }
  };

  // Download barcodes as a text file
  const handleDownload = () => {
    if (barcodes.length > 0) {
      const blob = new Blob([barcodes.join('\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `barcodes_${barcodeType}_${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Download as CSV
  const handleDownloadCsv = () => {
    if (barcodes.length > 0) {
      const csvContent = 'Barcode\n' + barcodes.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `barcodes_${barcodeType}_${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Reset
  const handleReset = () => {
    setBarcodes([]);
    setError('');
  };

  // Load from history
  const loadFromHistory = (entry) => {
    setBarcodes(entry.barcodes);
    setBarcodeType(entry.type);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
        Random Barcode Batch Generator
      </h2>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Barcode Type
            </label>
            <select
              value={barcodeType}
              onChange={(e) => setBarcodeType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ean13">EAN-13 (13 digits)</option>
              <option value="upc">UPC-A (12 digits)</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch Size
            </label>
            <input
              type="number"
              value={batchSize}
              onChange={(e) => setBatchSize(Math.min(100, Math.max(1, e.target.value)))}
              min={1}
              max={100}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {barcodeType === 'custom' && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Length
              </label>
              <input
                type="number"
                value={customLength}
                onChange={(e) => setCustomLength(Math.min(20, Math.max(4, e.target.value)))}
                min={4}
                max={20}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={generateBatch}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate Batch
          </button>
          <button
            onClick={handleCopy}
            disabled={barcodes.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Copy
          </button>
          <button
            onClick={handleDownload}
            disabled={barcodes.length === 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Download TXT
          </button>
          <button
            onClick={handleDownloadCsv}
            disabled={barcodes.length === 0}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Download CSV
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
      {barcodes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Generated Barcodes ({barcodes.length})
          </h3>
          <div className="w-full p-3 bg-white border border-gray-300 rounded-lg font-mono text-sm overflow-y-auto max-h-64">
            {barcodes.map((barcode, index) => (
              <div key={index} className="py-1">
                {barcode}
              </div>
            ))}
          </div>
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
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Batch History</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((entry, index) => (
              <div
                key={index}
                onClick={() => loadFromHistory(entry)}
                className="p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
              >
                <p className="text-sm font-medium text-gray-800">
                  {entry.type} Batch ({entry.barcodes.length}) - {entry.timestamp.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {entry.barcodes[0]}...
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RandomBarcodeBatchGenerator;