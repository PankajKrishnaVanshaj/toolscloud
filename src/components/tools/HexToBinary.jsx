'use client';

import React, { useState, useCallback } from 'react';

const HexToBinary = () => {
  const [hexInput, setHexInput] = useState('');
  const [binaryOutput, setBinaryOutput] = useState('');
  const [delimiter, setDelimiter] = useState('space'); // space, comma, none
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [bitLength, setBitLength] = useState('8'); // 4, 8, 16
  const [prefixHandling, setPrefixHandling] = useState('auto'); // auto, ignore, strict

  const hexToBinary = useCallback((hex) => {
    try {
      if (!hex) {
        setBinaryOutput('');
        setError('');
        return;
      }

      let hexArray;
      switch (delimiter) {
        case 'space':
          hexArray = hex.trim().split(/\s+/);
          break;
        case 'comma':
          hexArray = hex.split(',').map(str => str.trim());
          break;
        case 'none':
          hexArray = hex.match(/.{1,2}/g) || [];
          break;
        default:
          hexArray = hex.trim().split(/\s+/);
      }

      const binary = hexArray
        .map((hexStr) => {
          // Handle prefixes
          let cleanHex = hexStr;
          if (prefixHandling === 'auto' || prefixHandling === 'ignore') {
            cleanHex = hexStr.replace(/^(0x|#)/i, '');
          } else if (prefixHandling === 'strict' && !/^(0x|#)?[0-9A-Fa-f]+$/.test(hexStr)) {
            throw new Error('Invalid hex format with strict prefix handling');
          }

          if (!/^[0-9A-Fa-f]+$/.test(cleanHex)) {
            throw new Error('Invalid hexadecimal value');
          }

          const decimal = parseInt(cleanHex, 16);
          let binaryStr = decimal.toString(2);
          return binaryStr.padStart(parseInt(bitLength), '0');
        })
        .join(' ');

      setBinaryOutput(binary);
      setError('');
    } catch (err) {
      setError('Error converting hex to binary: ' + err.message);
      setBinaryOutput('');
    }
  }, [delimiter, bitLength, prefixHandling]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setHexInput(value);
    hexToBinary(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setHexInput(text);
      hexToBinary(text);
    };
    reader.onerror = () => setError('Error reading file');
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/plain') {
      handleFileUpload(file);
    } else {
      setError('Please drop a valid text file');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(binaryOutput);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const downloadOutput = () => {
    const blob = new Blob([binaryOutput], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'binary_output.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setHexInput('');
    setBinaryOutput('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl relative">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Advanced Hex to Binary Converter
        </h1>

        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in">
            Copied to clipboard!
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6 justify-center">
          <div>
            <label className="text-sm text-gray-600 mr-2">Delimiter:</label>
            <select
              value={delimiter}
              onChange={(e) => {
                setDelimiter(e.target.value);
                hexToBinary(hexInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="space">Space</option>
              <option value="comma">Comma</option>
              <option value="none">None (Continuous)</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mr-2">Bit Length:</label>
            <select
              value={bitLength}
              onChange={(e) => {
                setBitLength(e.target.value);
                hexToBinary(hexInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="4">4-bit</option>
              <option value="8">8-bit</option>
              <option value="16">16-bit</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mr-2">Prefix:</label>
            <select
              value={prefixHandling}
              onChange={(e) => {
                setPrefixHandling(e.target.value);
                hexToBinary(hexInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="auto">Auto (Remove 0x/#)</option>
              <option value="ignore">Ignore (Allow Any)</option>
              <option value="strict">Strict (Must Match)</option>
            </select>
          </div>
          <button
            onClick={clearAll}
            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Input Section */}
        <div
          className={`mb-6 p-4 border-2 rounded-md ${
            isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <label className="block text-gray-700 mb-2">Enter Hex:</label>
          <textarea
            value={hexInput}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y font-mono"
            rows="6"
            placeholder="Enter hexadecimal (e.g., 48 65 or 0x48 0x65)"
          />
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop a text file with hex data
          </p>
        </div>

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Binary Output:</label>
          <div className="relative">
            <textarea
              value={binaryOutput}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 min-h-[150px] resize-y font-mono"
              placeholder="Binary output will appear here..."
            />
            {binaryOutput && (
              <div className="absolute right-2 top-2 space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="bg-indigo-500 text-white px-3 py-1 rounded-md hover:bg-indigo-600 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={downloadOutput}
                  className="bg-pink-500 text-white px-3 py-1 rounded-md hover:bg-pink-600 transition-colors"
                >
                  Download
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm text-center mb-4">{error}</div>
        )}

        {/* Info */}
        <div className="text-gray-600 text-sm text-center">
          <p>Converts hex to binary with customizable options</p>
          <p>Supports file drag-and-drop, variable bit lengths, and prefix handling</p>
        </div>
      </div>
    </div>
  );
};

export default HexToBinary;