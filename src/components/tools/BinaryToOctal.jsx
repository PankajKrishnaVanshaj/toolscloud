'use client';

import React, { useState, useCallback } from 'react';

const BinaryToOctal = () => {
  const [binaryInput, setBinaryInput] = useState('');
  const [octalOutput, setOctalOutput] = useState('');
  const [delimiter, setDelimiter] = useState('space'); // space, comma, none
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [grouping, setGrouping] = useState('none'); // none, 3
  const [padding, setPadding] = useState('none'); // none, left, right

  const binaryToOctal = useCallback((binary) => {
    try {
      if (!binary) {
        setOctalOutput('');
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

      const octals = binaryArray.map((bin) => {
        if (!/^[01]+$/.test(bin)) throw new Error('Invalid binary format');

        let binaryStr = bin;
        // Ensure binary length is a multiple of 3 for clean octal conversion
        const remainder = binaryStr.length % 3;
        if (remainder !== 0) {
          if (padding === 'left') {
            binaryStr = '0'.repeat(3 - remainder) + binaryStr;
          } else if (padding === 'right') {
            binaryStr = binaryStr + '0'.repeat(3 - remainder);
          }
        }

        const octal = binaryStr
          .match(/.{1,3}/g)
          .map(chunk => parseInt(chunk, 2).toString(8))
          .join('');

        if (grouping === '3') {
          return octal.match(/.{1,3}/g).join(' ');
        }
        return octal;
      });

      setOctalOutput(octals.join(' '));
      setError('');
    } catch (err) {
      setError('Error converting binary to octal: ' + err.message);
      setOctalOutput('');
    }
  }, [delimiter, grouping, padding]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setBinaryInput(value);
    binaryToOctal(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setBinaryInput(text);
      binaryToOctal(text);
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
      await navigator.clipboard.writeText(octalOutput);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const downloadOutput = () => {
    const blob = new Blob([octalOutput], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'octal_output.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setBinaryInput('');
    setOctalOutput('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl relative">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Advanced Binary to Octal Converter
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
                binaryToOctal(binaryInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="space">Space</option>
              <option value="comma">Comma</option>
              <option value="none">None (Continuous)</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mr-2">Grouping:</label>
            <select
              value={grouping}
              onChange={(e) => {
                setGrouping(e.target.value);
                binaryToOctal(binaryInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="none">None</option>
              <option value="3">3-digit Groups</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mr-2">Padding:</label>
            <select
              value={padding}
              onChange={(e) => {
                setPadding(e.target.value);
                binaryToOctal(binaryInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="none">None</option>
              <option value="left">Left (Leading 0s)</option>
              <option value="right">Right (Trailing 0s)</option>
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
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y font-mono"
            rows="6"
            placeholder="Enter binary (e.g., 01001000 01100101)"
          />
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop a text file with binary data
          </p>
        </div>

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Octal Output:</label>
          <div className="relative">
            <textarea
              value={octalOutput}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 min-h-[150px] resize-y font-mono"
              placeholder="Octal output will appear here..."
            />
            {octalOutput && (
              <div className="absolute right-2 top-2 space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="bg-purple-500 text-white px-3 py-1 rounded-md hover:bg-purple-600 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={downloadOutput}
                  className="bg-orange-500 text-white px-3 py-1 rounded-md hover:bg-orange-600 transition-colors"
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
          <p>Converts binary to octal with customizable formatting</p>
          <p>Supports file drag-and-drop, grouping, and padding</p>
        </div>
      </div>
    </div>
  );
};

export default BinaryToOctal;