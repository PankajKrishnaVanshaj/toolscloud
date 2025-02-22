'use client';

import React, { useState, useCallback } from 'react';

const ASCIIToBinary = () => {
  const [asciiInput, setAsciiInput] = useState('');
  const [binaryOutput, setBinaryOutput] = useState('');
  const [delimiter, setDelimiter] = useState('space'); // space, comma, none
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [bitLength, setBitLength] = useState('8'); // 7, 8
  const [grouping, setGrouping] = useState('none'); // none, 4

  const asciiToBinary = useCallback((ascii) => {
    try {
      if (!ascii) {
        setBinaryOutput('');
        setError('');
        return;
      }

      const binary = ascii.split('').map((char) => {
        const decimal = char.charCodeAt(0);
        if (bitLength === '7' && decimal > 127) {
          throw new Error('Character exceeds 7-bit ASCII range (0-127)');
        }
        if (decimal > 255) {
          throw new Error('Character exceeds 8-bit range (0-255)');
        }

        let binaryStr = decimal.toString(2).padStart(parseInt(bitLength), '0');
        if (grouping === '4') {
          return binaryStr.match(/.{1,4}/g).join(' ');
        }
        return binaryStr;
      }).join(delimiter === 'none' ? '' : delimiter === 'space' ? ' ' : ', ');

      setBinaryOutput(binary);
      setError('');
    } catch (err) {
      setError('Error converting ASCII to binary: ' + err.message);
      setBinaryOutput('');
    }
  }, [delimiter, bitLength, grouping]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setAsciiInput(value);
    asciiToBinary(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setAsciiInput(text);
      asciiToBinary(text);
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
    setAsciiInput('');
    setBinaryOutput('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-yellow-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl relative">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Advanced ASCII to Binary Converter
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
                asciiToBinary(asciiInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                asciiToBinary(asciiInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="7">7-bit</option>
              <option value="8">8-bit</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mr-2">Grouping:</label>
            <select
              value={grouping}
              onChange={(e) => {
                setGrouping(e.target.value);
                asciiToBinary(asciiInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="none">None</option>
              <option value="4">4-bit Groups</option>
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
          <label className="block text-gray-700 mb-2">Enter ASCII:</label>
          <textarea
            value={asciiInput}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            rows="6"
            placeholder="Enter ASCII text (e.g., Hello)"
          />
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop a text file with ASCII data
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
                  className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition-colors"
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
          <p>Converts ASCII to binary with customizable formatting</p>
          <p>Supports file drag-and-drop, bit lengths, and grouping</p>
        </div>
      </div>
    </div>
  );
};

export default ASCIIToBinary;