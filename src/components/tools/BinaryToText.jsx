'use client';

import React, { useState, useCallback } from 'react';

const BinaryToText = () => {
  const [binaryInput, setBinaryInput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const [delimiter, setDelimiter] = useState('space'); // space, comma, none
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [bitMode, setBitMode] = useState('auto'); // auto, 7bit, 8bit

  const binaryToText = useCallback((binary) => {
    try {
      if (!binary) {
        setTextOutput('');
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
          binaryArray = binary.match(/.{1,8}/g) || [];
          break;
        default:
          binaryArray = binary.trim().split(/\s+/);
      }

      const text = binaryArray
        .map((bin) => {
          if (!/^[01]+$/.test(bin)) throw new Error('Invalid binary format');
          const bits = bitMode === 'auto' ? bin.length : (bitMode === '7bit' ? 7 : 8);
          if (bin.length !== bits && bitMode !== 'auto') {
            throw new Error(`Each binary segment must be ${bits} bits`);
          }
          return String.fromCharCode(parseInt(bin, 2));
        })
        .join('');

      setTextOutput(text);
      setError('');
    } catch (err) {
      setError('Error converting binary to text: ' + err.message);
      setTextOutput('');
    }
  }, [delimiter, bitMode]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setBinaryInput(value);
    binaryToText(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setBinaryInput(text);
      binaryToText(text);
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
      await navigator.clipboard.writeText(textOutput);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const downloadOutput = () => {
    const blob = new Blob([textOutput], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted_text.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setBinaryInput('');
    setTextOutput('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl relative">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Advanced Binary to Text Converter
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
                binaryToText(binaryInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="space">Space</option>
              <option value="comma">Comma</option>
              <option value="none">None (Continuous)</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mr-2">Bit Mode:</label>
            <select
              value={bitMode}
              onChange={(e) => {
                setBitMode(e.target.value);
                binaryToText(binaryInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="auto">Auto Detect</option>
              <option value="7bit">7-bit</option>
              <option value="8bit">8-bit</option>
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
          <label className="block text-gray-700 mb-2">Enter Binary:</label>
          <textarea
            value={binaryInput}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
            rows="6"
            placeholder="Enter binary numbers (e.g., 01001000 01100101 01101100 01101100 01101111)"
          />
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop a text file with binary data
          </p>
        </div>

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Text Output:</label>
          <div className="relative">
            <textarea
              value={textOutput}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 min-h-[150px] resize-y"
              placeholder="Converted text will appear here..."
            />
            {textOutput && (
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
          <p>Converts binary to text with customizable delimiters and bit modes</p>
          <p>Supports file drag-and-drop, copy, and download features</p>
        </div>
      </div>
    </div>
  );
};

export default BinaryToText;