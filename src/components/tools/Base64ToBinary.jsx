'use client';

import React, { useState, useCallback } from 'react';

const Base64ToBinary = () => {
  const [base64Input, setBase64Input] = useState('');
  const [binaryOutput, setBinaryOutput] = useState('');
  const [delimiter, setDelimiter] = useState('space'); // space, comma, none
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [grouping, setGrouping] = useState('none'); // none, 4, 8

  const base64ToBinary = useCallback((base64) => {
    try {
      if (!base64) {
        setBinaryOutput('');
        setError('');
        return;
      }

      // Normalize Base64 input by removing any delimiters and ensuring padding
      const normalizedBase64 = base64.replace(/[\s,]+/g, '').replace(/=+$/, '') + '==='.slice(0, (4 - base64.length % 4) % 4);

      // Decode Base64 to binary string
      const binaryString = atob(normalizedBase64)
        .split('')
        .map(char => {
          const binary = char.charCodeAt(0).toString(2);
          return binary.padStart(8, '0'); // Ensure 8-bit bytes
        })
        .join('');

      // Apply grouping
      let output;
      if (grouping === 'none') {
        output = binaryString;
      } else {
        const groupSize = parseInt(grouping);
        output = binaryString.match(new RegExp(`.{1,${groupSize}}`, 'g')).join(' ');
      }

      // Apply delimiter
      output = delimiter === 'none' ? output.replace(/\s+/g, '') :
               delimiter === 'comma' ? output.replace(/\s+/g, ', ') :
               output;

      setBinaryOutput(output);
      setError('');
    } catch (err) {
      setError('Error converting Base64 to binary: ' + err.message);
      setBinaryOutput('');
    }
  }, [delimiter, grouping]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setBase64Input(value);
    base64ToBinary(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setBase64Input(text);
      base64ToBinary(text);
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
    setBase64Input('');
    setBinaryOutput('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-teal-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl relative">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Advanced Base64 to Binary Converter
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
                base64ToBinary(base64Input);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                base64ToBinary(base64Input);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
            isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <label className="block text-gray-700 mb-2">Enter Base64:</label>
          <textarea
            value={base64Input}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y font-mono"
            rows="6"
            placeholder="Enter Base64 (e.g., SGVsbG8=)"
          />
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop a text file with Base64 data
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
                  className="bg-orange-500 text-white px-3 py-1 rounded-md hover:bg-orange-600 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={downloadOutput}
                  className="bg-teal-500 text-white px-3 py-1 rounded-md hover:bg-teal-600 transition-colors"
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
          <p>Converts Base64 to 8-bit binary with customizable formatting</p>
          <p>Supports file drag-and-drop and grouping options</p>
        </div>
      </div>
    </div>
  );
};

export default Base64ToBinary;