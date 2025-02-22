'use client';

import React, { useState, useCallback } from 'react';

const IntegerToBinary = () => {
  const [integerInput, setIntegerInput] = useState('');
  const [binaryOutput, setBinaryOutput] = useState('');
  const [delimiter, setDelimiter] = useState('space'); // space, comma, none
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [bitLength, setBitLength] = useState('auto'); // auto, 4, 8, 16, 32
  const [signedMode, setSignedMode] = useState('unsigned'); // unsigned, signed
  const [grouping, setGrouping] = useState('none'); // none, 4, 8

  const integerToBinary = useCallback((integer) => {
    try {
      if (!integer) {
        setBinaryOutput('');
        setError('');
        return;
      }

      let integerArray;
      switch (delimiter) {
        case 'space':
          integerArray = integer.trim().split(/\s+/);
          break;
        case 'comma':
          integerArray = integer.split(',').map(str => str.trim());
          break;
        case 'none':
          integerArray = integer.match(/-?\d+/g) || [];
          break;
        default:
          integerArray = integer.trim().split(/\s+/);
      }

      const binaries = integerArray.map((int) => {
        const num = parseInt(int, 10);
        if (isNaN(num)) throw new Error('Invalid integer input');

        const actualBitLength = bitLength === 'auto' ? Math.max(4, Math.ceil(Math.log2(Math.abs(num) + 1))) : parseInt(bitLength);
        const maxUnsigned = 2 ** actualBitLength - 1;
        const minSigned = -(2 ** (actualBitLength - 1));
        const maxSigned = 2 ** (actualBitLength - 1) - 1;

        if (signedMode === 'unsigned') {
          if (num < 0) throw new Error('Unsigned mode does not support negative numbers');
          if (bitLength !== 'auto' && num > maxUnsigned) {
            throw new Error(`Number exceeds ${actualBitLength}-bit unsigned limit (${maxUnsigned})`);
          }
          let binary = num.toString(2);
          if (bitLength !== 'auto') binary = binary.padStart(actualBitLength, '0');
          if (grouping !== 'none') {
            const groupSize = parseInt(grouping);
            return binary.match(new RegExp(`.{1,${groupSize}}`, 'g')).join(' ');
          }
          return binary;
        } else { // signed
          if (bitLength !== 'auto' && (num < minSigned || num > maxSigned)) {
            throw new Error(`Number out of ${actualBitLength}-bit signed range (${minSigned} to ${maxSigned})`);
          }
          let binary = num < 0
            ? (maxUnsigned + 1 + num).toString(2).padStart(actualBitLength, '0') // Two's complement
            : num.toString(2).padStart(actualBitLength, '0');
          if (bitLength === 'auto' && num >= 0) binary = binary.replace(/^0+/, '') || '0'; // Remove leading zeros in auto mode for positive numbers
          if (grouping !== 'none') {
            const groupSize = parseInt(grouping);
            return binary.match(new RegExp(`.{1,${groupSize}}`, 'g')).join(' ');
          }
          return binary;
        }
      });

      setBinaryOutput(binaries.join(delimiter === 'none' ? '' : delimiter === 'space' ? ' ' : ', '));
      setError('');
    } catch (err) {
      setError('Error converting integer to binary: ' + err.message);
      setBinaryOutput('');
    }
  }, [delimiter, bitLength, signedMode, grouping]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setIntegerInput(value);
    integerToBinary(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setIntegerInput(text);
      integerToBinary(text);
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
    setIntegerInput('');
    setBinaryOutput('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl relative">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Advanced Integer to Binary Converter
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
                integerToBinary(integerInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="space">Space</option>
              <option value="comma">Comma</option>
              <option value="none">None</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mr-2">Bit Length:</label>
            <select
              value={bitLength}
              onChange={(e) => {
                setBitLength(e.target.value);
                integerToBinary(integerInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="auto">Auto</option>
              <option value="4">4-bit</option>
              <option value="8">8-bit</option>
              <option value="16">16-bit</option>
              <option value="32">32-bit</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mr-2">Mode:</label>
            <select
              value={signedMode}
              onChange={(e) => {
                setSignedMode(e.target.value);
                integerToBinary(integerInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="unsigned">Unsigned</option>
              <option value="signed">Signed (2's Complement)</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mr-2">Grouping:</label>
            <select
              value={grouping}
              onChange={(e) => {
                setGrouping(e.target.value);
                integerToBinary(integerInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <label className="block text-gray-700 mb-2">Enter Integer:</label>
          <textarea
            value={integerInput}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
            rows="6"
            placeholder="Enter integers (e.g., 4 10 or -1)"
          />
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop a text file with integer data
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
                  className="bg-purple-500 text-white px-3 py-1 rounded-md hover:bg-purple-600 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={downloadOutput}
                  className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors"
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
          <p>Converts integer to binary with signed/unsigned support</p>
          <p>Supports file drag-and-drop, bit lengths, and grouping</p>
        </div>
      </div>
    </div>
  );
};

export default IntegerToBinary;