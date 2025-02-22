'use client';

import React, { useState, useCallback } from 'react';

const BinaryToDecimal = () => {
  const [binaryInput, setBinaryInput] = useState('');
  const [decimalOutput, setDecimalOutput] = useState('');
  const [delimiter, setDelimiter] = useState('space'); // space, comma, none
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [signedMode, setSignedMode] = useState('unsigned'); // unsigned, signed
  const [bitLength, setBitLength] = useState('8'); // 4, 8, 16, 32

  const binaryToDecimal = useCallback((binary) => {
    try {
      if (!binary) {
        setDecimalOutput('');
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
          binaryArray = binary.match(new RegExp(`.{1,${bitLength}}`, 'g')) || [];
          break;
        default:
          binaryArray = binary.trim().split(/\s+/);
      }

      const decimals = binaryArray.map((bin) => {
        if (!/^[01]+$/.test(bin)) throw new Error('Invalid binary format');
        if (delimiter !== 'none' && bin.length > parseInt(bitLength)) {
          throw new Error(`Binary length exceeds selected ${bitLength}-bit limit`);
        }

        let decimal = parseInt(bin, 2);
        if (signedMode === 'signed' && bin.length === parseInt(bitLength)) {
          // Handle two's complement for signed numbers
          if (bin[0] === '1') {
            const maxValue = 2 ** bitLength;
            decimal = decimal - maxValue;
          }
        }
        return decimal.toString();
      });

      setDecimalOutput(decimals.join(' '));
      setError('');
    } catch (err) {
      setError('Error converting binary to decimal: ' + err.message);
      setDecimalOutput('');
    }
  }, [delimiter, signedMode, bitLength]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setBinaryInput(value);
    binaryToDecimal(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setBinaryInput(text);
      binaryToDecimal(text);
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
      await navigator.clipboard.writeText(decimalOutput);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const downloadOutput = () => {
    const blob = new Blob([decimalOutput], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'decimal_output.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setBinaryInput('');
    setDecimalOutput('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-yellow-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl relative">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Advanced Binary to Decimal Converter
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
                binaryToDecimal(binaryInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="space">Space</option>
              <option value="comma">Comma</option>
              <option value="none">None (Continuous)</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mr-2">Mode:</label>
            <select
              value={signedMode}
              onChange={(e) => {
                setSignedMode(e.target.value);
                binaryToDecimal(binaryInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                binaryToDecimal(binaryInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="4">4-bit</option>
              <option value="8">8-bit</option>
              <option value="16">16-bit</option>
              <option value="32">32-bit</option>
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
          <label className="block text-gray-700 mb-2">Enter Binary:</label>
          <textarea
            value={binaryInput}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-y font-mono"
            rows="6"
            placeholder="Enter binary (e.g., 01001000 01100101)"
          />
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop a text file with binary data
          </p>
        </div>

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Decimal Output:</label>
          <div className="relative">
            <textarea
              value={decimalOutput}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 min-h-[150px] resize-y font-mono"
              placeholder="Decimal output will appear here..."
            />
            {decimalOutput && (
              <div className="absolute right-2 top-2 space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors"
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
          <p>Converts binary to decimal with signed/unsigned support</p>
          <p>Supports file drag-and-drop and variable bit lengths</p>
        </div>
      </div>
    </div>
  );
};

export default BinaryToDecimal;