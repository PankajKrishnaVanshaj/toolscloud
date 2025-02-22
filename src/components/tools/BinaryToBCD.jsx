'use client';

import React, { useState, useCallback } from 'react';

const BinaryToBCD = () => {
  const [binaryInput, setBinaryInput] = useState('');
  const [bcdOutput, setBcdOutput] = useState('');
  const [delimiter, setDelimiter] = useState('space'); // space, comma, none
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [bitLength, setBitLength] = useState('auto'); // auto, 4, 8, 16
  const [grouping, setGrouping] = useState('4'); // 4 (standard BCD), none

  const binaryToBCD = useCallback((binary) => {
    try {
      if (!binary) {
        setBcdOutput('');
        setError('');
        return;
      }

      let binaryArray;
      switch (delimiter) {
        case 'space':
          binaryArray = binary.trim().split(/\s+/);
          break;
        case 'comma':
          binaryArray = binary.split(',').map(str => str.trim());
          break;
        case 'none':
          binaryArray = [binary.trim()];
          break;
        default:
          binaryArray = binary.trim().split(/\s+/);
      }

      const bcdCodes = binaryArray.map((bin) => {
        if (!/^[01]+$/.test(bin)) throw new Error('Invalid binary format');
        if (bitLength !== 'auto' && bin.length !== parseInt(bitLength)) {
          throw new Error(`Binary must be ${bitLength} bits when not in auto mode`);
        }

        const decimal = parseInt(bin, 2);
        if (decimal > (2 ** (bitLength === 'auto' ? bin.length : parseInt(bitLength)) - 1)) {
          throw new Error('Binary value exceeds bit length capacity');
        }

        // Convert decimal to BCD
        let bcd = '';
        let num = decimal;
        if (num === 0) {
          bcd = '0000'; // Special case for 0
        } else {
          while (num > 0) {
            const digit = num % 10;
            bcd = digit.toString(2).padStart(4, '0') + bcd;
            num = Math.floor(num / 10);
          }
        }

        if (grouping === '4') {
          return bcd.match(/.{1,4}/g).join(' ');
        }
        return bcd;
      });

      setBcdOutput(bcdCodes.join(delimiter === 'none' ? '' : delimiter === 'space' ? ' ' : ', '));
      setError('');
    } catch (err) {
      setError('Error converting binary to BCD: ' + err.message);
      setBcdOutput('');
    }
  }, [delimiter, bitLength, grouping]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setBinaryInput(value);
    binaryToBCD(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setBinaryInput(text);
      binaryToBCD(text);
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
      await navigator.clipboard.writeText(bcdOutput);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const downloadOutput = () => {
    const blob = new Blob([bcdOutput], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bcd_output.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setBinaryInput('');
    setBcdOutput('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl relative">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Advanced Binary to BCD Converter
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
                binaryToBCD(binaryInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                binaryToBCD(binaryInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="auto">Auto</option>
              <option value="4">4-bit</option>
              <option value="8">8-bit</option>
              <option value="16">16-bit</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mr-2">Grouping:</label>
            <select
              value={grouping}
              onChange={(e) => {
                setGrouping(e.target.value);
                binaryToBCD(binaryInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="4">4-bit Groups</option>
              <option value="none">None</option>
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
            isDragging ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <label className="block text-gray-700 mb-2">Enter Binary:</label>
          <textarea
            value={binaryInput}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y font-mono"
            rows="6"
            placeholder="Enter binary (e.g., 1001 1010)"
          />
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop a text file with binary data
          </p>
        </div>

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">BCD Output:</label>
          <div className="relative">
            <textarea
              value={bcdOutput}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 min-h-[150px] resize-y font-mono"
              placeholder="BCD output will appear here..."
            />
            {bcdOutput && (
              <div className="absolute right-2 top-2 space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={downloadOutput}
                  className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors"
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
          <p>Converts binary to BCD (Binary-Coded Decimal)</p>
          <p>Supports file drag-and-drop, bit lengths, and grouping</p>
        </div>
      </div>
    </div>
  );
};

export default BinaryToBCD;