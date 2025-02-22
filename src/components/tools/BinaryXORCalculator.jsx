'use client';

import React, { useState, useCallback } from 'react';

const BinaryXORCalculator = () => {
  const [binary1, setBinary1] = useState('');
  const [binary2, setBinary2] = useState('');
  const [result, setResult] = useState('');
  const [delimiter, setDelimiter] = useState('none'); // space, comma, none
  const [grouping, setGrouping] = useState('none'); // none, 4, 8
  const [bitLength, setBitLength] = useState('auto'); // auto, 4, 8, 16, 32
  const [error, setError] = useState('');
  const [isDragging1, setIsDragging1] = useState(false);
  const [isDragging2, setIsDragging2] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);

  const calculateXOR = useCallback(() => {
    try {
      if (!binary1 || !binary2) {
        setResult('');
        setError('');
        return;
      }

      let bin1, bin2;
      switch (delimiter) {
        case 'space':
          bin1 = binary1.trim().split(/\s+/).join('');
          bin2 = binary2.trim().split(/\s+/).join('');
          break;
        case 'comma':
          bin1 = binary1.split(',').map(str => str.trim()).join('');
          bin2 = binary2.split(',').map(str => str.trim()).join('');
          break;
        case 'none':
          bin1 = binary1.trim();
          bin2 = binary2.trim();
          break;
        default:
          bin1 = binary1.trim().split(/\s+/).join('');
          bin2 = binary2.trim().split(/\s+/).join('');
      }

      if (!/^[01]+$/.test(bin1) || !/^[01]+$/.test(bin2)) {
        throw new Error('Invalid binary format');
      }

      const maxLength = Math.max(bin1.length, bin2.length);
      if (bitLength !== 'auto' && (bin1.length > parseInt(bitLength) || bin2.length > parseInt(bitLength))) {
        throw new Error(`Binary inputs must not exceed ${bitLength} bits when not in auto mode`);
      }

      // Pad to equal length or specified bit length
      const targetLength = bitLength === 'auto' ? maxLength : parseInt(bitLength);
      bin1 = bin1.padStart(targetLength, '0');
      bin2 = bin2.padStart(targetLength, '0');

      // Perform XOR operation
      let xorResult = '';
      for (let i = 0; i < targetLength; i++) {
        xorResult += (parseInt(bin1[i]) ^ parseInt(bin2[i])).toString();
      }

      // Apply grouping
      if (grouping !== 'none') {
        const groupSize = parseInt(grouping);
        xorResult = xorResult.match(new RegExp(`.{1,${groupSize}}`, 'g')).join(' ');
      }

      setResult(xorResult);
      setError('');
    } catch (err) {
      setError('Error calculating XOR: ' + err.message);
      setResult('');
    }
  }, [binary1, binary2, delimiter, grouping, bitLength]);

  const handleInputChange1 = (e) => {
    setBinary1(e.target.value);
    calculateXOR();
  };

  const handleInputChange2 = (e) => {
    setBinary2(e.target.value);
    calculateXOR();
  };

  const handleFileUpload1 = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setBinary1(e.target.result.trim());
      calculateXOR();
    };
    reader.onerror = () => setError('Error reading file for Binary 1');
    reader.readAsText(file);
  };

  const handleFileUpload2 = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setBinary2(e.target.result.trim());
      calculateXOR();
    };
    reader.onerror = () => setError('Error reading file for Binary 2');
    reader.readAsText(file);
  };

  const handleDrop1 = (e) => {
    e.preventDefault();
    setIsDragging1(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/plain') {
      handleFileUpload1(file);
    } else {
      setError('Please drop a valid text file for Binary 1');
    }
  };

  const handleDrop2 = (e) => {
    e.preventDefault();
    setIsDragging2(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/plain') {
      handleFileUpload2(file);
    } else {
      setError('Please drop a valid text file for Binary 2');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const downloadOutput = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'xor_result.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setBinary1('');
    setBinary2('');
    setResult('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl relative">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Advanced Binary XOR Calculator
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
                calculateXOR();
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                calculateXOR();
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                calculateXOR();
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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

        {/* Input Section 1 */}
        <div
          className={`mb-6 p-4 border-2 rounded-md ${
            isDragging1 ? 'border-green-500 bg-green-50' : 'border-gray-300'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging1(true);
          }}
          onDragLeave={() => setIsDragging1(false)}
          onDrop={handleDrop1}
        >
          <label className="block text-gray-700 mb-2">Binary 1:</label>
          <textarea
            value={binary1}
            onChange={handleInputChange1}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-y font-mono"
            rows="3"
            placeholder="Enter first binary number (e.g., 1010)"
          />
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop a text file for Binary 1
          </p>
        </div>

        {/* Input Section 2 */}
        <div
          className={`mb-6 p-4 border-2 rounded-md ${
            isDragging2 ? 'border-green-500 bg-green-50' : 'border-gray-300'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging2(true);
          }}
          onDragLeave={() => setIsDragging2(false)}
          onDrop={handleDrop2}
        >
          <label className="block text-gray-700 mb-2">Binary 2:</label>
          <textarea
            value={binary2}
            onChange={handleInputChange2}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-y font-mono"
            rows="3"
            placeholder="Enter second binary number (e.g., 1100)"
          />
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop a text file for Binary 2
          </p>
        </div>

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">XOR Result:</label>
          <div className="relative">
            <textarea
              value={result}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 min-h-[100px] resize-y font-mono"
              placeholder="XOR result will appear here..."
            />
            {result && (
              <div className="absolute right-2 top-2 space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors"
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
          <p>Performs XOR operation on two binary numbers</p>
          <p>Supports file drag-and-drop, bit lengths, and grouping</p>
        </div>
      </div>
    </div>
  );
};

export default BinaryXORCalculator;