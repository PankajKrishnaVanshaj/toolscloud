'use client';

import React, { useState, useCallback } from 'react';

const BinaryComplement = () => {
  const [binaryInput, setBinaryInput] = useState('');
  const [onesComplement, setOnesComplement] = useState('');
  const [twosComplement, setTwosComplement] = useState('');
  const [delimiter, setDelimiter] = useState('none'); // space, comma, none
  const [grouping, setGrouping] = useState('none'); // none, 4, 8
  const [bitLength, setBitLength] = useState('auto'); // auto, 4, 8, 16, 32
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);

  const calculateComplements = useCallback(() => {
    try {
      if (!binaryInput) {
        setOnesComplement('');
        setTwosComplement('');
        setError('');
        return;
      }

      let binary;
      switch (delimiter) {
        case 'space':
          binary = binaryInput.trim().split(/\s+/).join('');
          break;
        case 'comma':
          binary = binaryInput.split(',').map(str => str.trim()).join('');
          break;
        case 'none':
          binary = binaryInput.trim();
          break;
        default:
          binary = binaryInput.trim().split(/\s+/).join('');
      }

      if (!/^[01]+$/.test(binary)) {
        throw new Error('Invalid binary format');
      }

      const targetLength = bitLength === 'auto' ? binary.length : parseInt(bitLength);
      if (bitLength !== 'auto' && binary.length > targetLength) {
        throw new Error(`Binary input must not exceed ${bitLength} bits when not in auto mode`);
      }

      // Pad to target length
      binary = binary.padStart(targetLength, '0');

      // Calculate one's complement (invert bits)
      let onesComp = '';
      for (let i = 0; i < binary.length; i++) {
        onesComp += binary[i] === '0' ? '1' : '0';
      }

      // Calculate two's complement (one's complement + 1)
      let twosComp = '';
      let carry = 1;
      for (let i = binary.length - 1; i >= 0; i--) {
        const bit = parseInt(onesComp[i]) + carry;
        twosComp = (bit % 2).toString() + twosComp;
        carry = Math.floor(bit / 2);
      }

      // Apply grouping
      if (grouping !== 'none') {
        const groupSize = parseInt(grouping);
        onesComp = onesComp.match(new RegExp(`.{1,${groupSize}}`, 'g')).join(' ');
        twosComp = twosComp.match(new RegExp(`.{1,${groupSize}}`, 'g')).join(' ');
      }

      setOnesComplement(onesComp);
      setTwosComplement(twosComp);
      setError('');
    } catch (err) {
      setError('Error calculating complements: ' + err.message);
      setOnesComplement('');
      setTwosComplement('');
    }
  }, [binaryInput, delimiter, grouping, bitLength]);

  const handleInputChange = (e) => {
    setBinaryInput(e.target.value);
    calculateComplements();
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setBinaryInput(e.target.result.trim());
      calculateComplements();
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

  const copyToClipboard = (text) => async () => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const downloadOutput = (text, filename) => () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setBinaryInput('');
    setOnesComplement('');
    setTwosComplement('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl relative">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Advanced Binary Complement Calculator
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
                calculateComplements();
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
                calculateComplements();
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="auto">Auto</option>
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
                calculateComplements();
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
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
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y font-mono"
            rows="3"
            placeholder="Enter binary number (e.g., 1010)"
          />
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop a text file with binary data
          </p>
        </div>

        {/* One's Complement Output */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">One's Complement:</label>
          <div className="relative">
            <textarea
              value={onesComplement}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 min-h-[100px] resize-y font-mono"
              placeholder="One's complement will appear here..."
            />
            {onesComplement && (
              <div className="absolute right-2 top-2 space-x-2">
                <button
                  onClick={copyToClipboard(onesComplement)}
                  className="bg-indigo-500 text-white px-3 py-1 rounded-md hover:bg-indigo-600 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={downloadOutput(onesComplement, 'ones_complement.txt')}
                  className="bg-orange-500 text-white px-3 py-1 rounded-md hover:bg-orange-600 transition-colors"
                >
                  Download
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Two's Complement Output */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Two's Complement:</label>
          <div className="relative">
            <textarea
              value={twosComplement}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 min-h-[100px] resize-y font-mono"
              placeholder="Two's complement will appear here..."
            />
            {twosComplement && (
              <div className="absolute right-2 top-2 space-x-2">
                <button
                  onClick={copyToClipboard(twosComplement)}
                  className="bg-indigo-500 text-white px-3 py-1 rounded-md hover:bg-indigo-600 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={downloadOutput(twosComplement, 'twos_complement.txt')}
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
          <p>Calculates one's and two's complement of a binary number</p>
          <p>Supports file drag-and-drop, bit lengths, and grouping</p>
        </div>
      </div>
    </div>
  );
};

export default BinaryComplement;