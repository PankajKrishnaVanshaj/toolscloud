'use client';

import React, { useState, useCallback } from 'react';

const DecimalToBinary = () => {
  const [decimalInput, setDecimalInput] = useState('');
  const [binaryOutput, setBinaryOutput] = useState('');
  const [delimiter, setDelimiter] = useState('space'); // space, comma, none
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [signedMode, setSignedMode] = useState('unsigned'); // unsigned, signed
  const [bitLength, setBitLength] = useState('8'); // 4, 8, 16, 32
  const [grouping, setGrouping] = useState('none'); // none, 4, 8

  const decimalToBinary = useCallback((decimal) => {
    try {
      if (!decimal) {
        setBinaryOutput('');
        setError('');
        return;
      }

      let decimalArray;
      switch (delimiter) {
        case 'space':
          decimalArray = decimal.trim().split(/\s+/);
          break;
        case 'comma':
          decimalArray = decimal.split(',').map(str => str.trim());
          break;
        case 'none':
          decimalArray = decimal.match(/-?\d+/g) || [];
          break;
        default:
          decimalArray = decimal.trim().split(/\s+/);
      }

      const maxUnsigned = 2 ** parseInt(bitLength) - 1;
      const minSigned = -(2 ** (parseInt(bitLength) - 1));
      const maxSigned = 2 ** (parseInt(bitLength) - 1) - 1;

      const binaries = decimalArray.map((dec) => {
        const num = parseInt(dec, 10);
        if (isNaN(num)) throw new Error('Invalid decimal number');

        let binary;
        if (signedMode === 'unsigned') {
          if (num < 0) throw new Error('Unsigned mode does not support negative numbers');
          if (num > maxUnsigned) throw new Error(`Number exceeds ${bitLength}-bit unsigned limit (${maxUnsigned})`);
          binary = num.toString(2).padStart(parseInt(bitLength), '0');
        } else { // signed
          if (num < minSigned || num > maxSigned) {
            throw new Error(`Number out of ${bitLength}-bit signed range (${minSigned} to ${maxSigned})`);
          }
          binary = num < 0
            ? (maxUnsigned + 1 + num).toString(2).padStart(parseInt(bitLength), '0') // Two's complement
            : num.toString(2).padStart(parseInt(bitLength), '0');
        }

        if (grouping !== 'none') {
          const groupSize = parseInt(grouping);
          return binary.match(new RegExp(`.{1,${groupSize}}`, 'g')).join(' ');
        }
        return binary;
      });

      setBinaryOutput(binaries.join(' '));
      setError('');
    } catch (err) {
      setError('Error converting decimal to binary: ' + err.message);
      setBinaryOutput('');
    }
  }, [delimiter, signedMode, bitLength, grouping]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setDecimalInput(value);
    decimalToBinary(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setDecimalInput(text);
      decimalToBinary(text);
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
    setDecimalInput('');
    setBinaryOutput('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-red-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl relative">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Advanced Decimal to Binary Converter
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
                decimalToBinary(decimalInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="space">Space</option>
              <option value="comma">Comma</option>
              <option value="none">None</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mr-2">Mode:</label>
            <select
              value={signedMode}
              onChange={(e) => {
                setSignedMode(e.target.value);
                decimalToBinary(decimalInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="unsigned">Unsigned</option>
              <option value="signed">Signed (2's Complement)</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mr-2">Bit Length:</label>
            <select
              value={bitLength}
              onChange={(e) => {
                setBitLength(e.target.value);
                decimalToBinary(decimalInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="4">4-bit</option>
              <option value="8">8-bit</option>
              <option value="16">16-bit</option>
              <option value="32">32-bit</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mr-2">Grouping:</label>
            <select
              value={grouping}
              onChange={(e) => {
                setGrouping(e.target.value);
                decimalToBinary(decimalInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">None</option>
              <option value="4">4-bit Groups</option>
              <option value="8">8-bit Groups</option>
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
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <label className="block text-gray-700 mb-2">Enter Decimal:</label>
          <textarea
            value={decimalInput}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
            rows="6"
            placeholder="Enter decimal numbers (e.g., 72 101 or -1)"
          />
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop a text file with decimal data
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
                  className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={downloadOutput}
                  className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors"
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
          <p>Converts decimal to binary with signed/unsigned support</p>
          <p>Supports file drag-and-drop, bit lengths, and grouping</p>
        </div>
      </div>
    </div>
  );
};

export default DecimalToBinary;