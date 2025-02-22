'use client';

import React, { useState, useCallback } from 'react';

const BCDToBinary = () => {
  const [bcdInput, setBcdInput] = useState('');
  const [binaryOutput, setBinaryOutput] = useState('');
  const [delimiter, setDelimiter] = useState('space'); // space, comma, none
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [grouping, setGrouping] = useState('4'); // 4 (standard BCD), none
  const [outputBitLength, setOutputBitLength] = useState('auto'); // auto, 4, 8, 16

  const bcdToBinary = useCallback((bcd) => {
    try {
      if (!bcd) {
        setBinaryOutput('');
        setError('');
        return;
      }

      let bcdArray;
      switch (delimiter) {
        case 'space':
          bcdArray = bcd.trim().split(/\s+/);
          break;
        case 'comma':
          bcdArray = bcd.split(',').map(str => str.trim());
          break;
        case 'none':
          bcdArray = bcd.trim().match(/.{4}/g) || [];
          break;
        default:
          bcdArray = bcd.trim().split(/\s+/);
      }

      if (grouping === '4' && delimiter !== 'none') {
        bcdArray = bcdArray.join('').match(/.{4}/g) || [];
      }

      const binaries = bcdArray.map((bcdSegment) => {
        if (!/^[01]+$/.test(bcdSegment)) throw new Error('Invalid BCD format');
        if (bcdSegment.length % 4 !== 0) throw new Error('BCD segments must be multiples of 4 bits');
        
        let decimal = 0;
        for (let i = 0; i < bcdSegment.length; i += 4) {
          const digit = parseInt(bcdSegment.slice(i, i + 4), 2);
          if (digit > 9) throw new Error('BCD digit exceeds 9');
          decimal = decimal * 10 + digit;
        }

        let binary = decimal.toString(2);
        if (outputBitLength !== 'auto') {
          const maxValue = 2 ** parseInt(outputBitLength) - 1;
          if (decimal > maxValue) {
            throw new Error(`Decimal ${decimal} exceeds ${outputBitLength}-bit limit (${maxValue})`);
          }
          binary = binary.padStart(parseInt(outputBitLength), '0');
        }

        return binary;
      });

      setBinaryOutput(binaries.join(delimiter === 'none' ? '' : delimiter === 'space' ? ' ' : ', '));
      setError('');
    } catch (err) {
      setError('Error converting BCD to binary: ' + err.message);
      setBinaryOutput('');
    }
  }, [delimiter, grouping, outputBitLength]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setBcdInput(value);
    bcdToBinary(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setBcdInput(text);
      bcdToBinary(text);
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
    setBcdInput('');
    setBinaryOutput('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl relative">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Advanced BCD to Binary Converter
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
                bcdToBinary(bcdInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="space">Space</option>
              <option value="comma">Comma</option>
              <option value="none">None</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mr-2">Grouping:</label>
            <select
              value={grouping}
              onChange={(e) => {
                setGrouping(e.target.value);
                bcdToBinary(bcdInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="4">4-bit Groups</option>
              <option value="none">None</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mr-2">Output Bit Length:</label>
            <select
              value={outputBitLength}
              onChange={(e) => {
                setOutputBitLength(e.target.value);
                bcdToBinary(bcdInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="auto">Auto</option>
              <option value="4">4-bit</option>
              <option value="8">8-bit</option>
              <option value="16">16-bit</option>
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
            isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <label className="block text-gray-700 mb-2">Enter BCD:</label>
          <textarea
            value={bcdInput}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-y font-mono"
            rows="6"
            placeholder="Enter BCD (e.g., 0000 1001 0001 0000)"
          />
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop a text file with BCD data
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
                  className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={downloadOutput}
                  className="bg-purple-500 text-white px-3 py-1 rounded-md hover:bg-purple-600 transition-colors"
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
          <p>Converts BCD (Binary-Coded Decimal) to binary</p>
          <p>Supports file drag-and-drop, grouping, and output bit lengths</p>
        </div>
      </div>
    </div>
  );
};

export default BCDToBinary;