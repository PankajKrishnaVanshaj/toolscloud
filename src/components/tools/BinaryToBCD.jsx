'use client';

import React, { useState, useCallback, useEffect } from 'react';

const BinaryToBCD = () => {
  const [binaryInput, setBinaryInput] = useState('');
  const [bcdOutput, setBcdOutput] = useState('');
  const [delimiter, setDelimiter] = useState('space');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [bitLength, setBitLength] = useState('auto');
  const [bcdFormat, setBcdFormat] = useState('8421'); // 8-4-2-1, Excess-3
  const [reverseMode, setReverseMode] = useState(false);
  const [steps, setSteps] = useState([]);
  const [showSteps, setShowSteps] = useState(false);

  const binaryToBCD = useCallback((binary) => {
    try {
      if (!binary) {
        setBcdOutput('');
        setSteps([]);
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

      const conversionSteps = [];
      const bcdCodes = binaryArray.map((bin, index) => {
        if (!/^[01]+$/.test(bin)) throw new Error(`Invalid binary at position ${index + 1}: ${bin}`);
        if (bitLength !== 'auto' && bin.length !== parseInt(bitLength)) {
          throw new Error(`Binary must be ${bitLength} bits when not in auto mode`);
        }

        const decimal = parseInt(bin, 2);
        const maxValue = bitLength === 'auto' ? 2 ** bin.length - 1 : 2 ** parseInt(bitLength) - 1;
        if (decimal > maxValue) throw new Error(`Value ${decimal} exceeds ${bitLength === 'auto' ? bin.length : bitLength}-bit limit`);

        let bcd = '';
        let num = decimal;
        const segmentSteps = [];

        if (num === 0) {
          bcd = '0000';
          segmentSteps.push('0 = 0000');
        } else {
          while (num > 0) {
            const digit = num % 10;
            let bcdDigit = digit.toString(2).padStart(4, '0');
            if (bcdFormat === 'excess3') {
              const excessDigit = digit + 3;
              bcdDigit = excessDigit.toString(2).padStart(4, '0');
            }
            segmentSteps.push(`${digit} = ${bcdDigit}`);
            bcd = bcdDigit + bcd;
            num = Math.floor(num / 10);
          }
        }

        conversionSteps.push({
          binary: bin,
          decimal,
          bcd,
          steps: segmentSteps.reverse(), // Reverse to show natural order
        });

        return bcd.match(/.{1,4}/g).join(' ');
      });

      setBcdOutput(bcdCodes.join(delimiter === 'none' ? '' : delimiter === 'space' ? ' ' : ', '));
      setSteps(conversionSteps);
      setError('');
    } catch (err) {
      setError('Error converting binary to BCD: ' + err.message);
      setBcdOutput('');
      setSteps([]);
    }
  }, [delimiter, bitLength, bcdFormat]);

  const bcdToBinary = useCallback((bcd) => {
    try {
      if (!bcd) {
        setBinaryInput('');
        setSteps([]);
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

      const conversionSteps = [];
      const binaries = bcdArray.map((bcdSegment, index) => {
        if (!/^[01]+$/.test(bcdSegment) || bcdSegment.length % 4 !== 0) {
          throw new Error(`Invalid BCD at position ${index + 1}: ${bcdSegment}`);
        }

        let decimal = 0;
        const segmentSteps = [];
        for (let i = 0; i < bcdSegment.length; i += 4) {
          const bcdDigit = bcdSegment.slice(i, i + 4);
          let digit = parseInt(bcdDigit, 2);
          if (bcdFormat === 'excess3') digit -= 3;
          if (digit < 0 || digit > 9) throw new Error(`BCD digit ${bcdDigit} out of range`);
          segmentSteps.push(`${bcdDigit} = ${digit}`);
          decimal = decimal * 10 + digit;
        }

        let binary = decimal.toString(2);
        if (bitLength !== 'auto') {
          binary = binary.padStart(parseInt(bitLength), '0');
        }

        conversionSteps.push({
          bcd: bcdSegment,
          decimal,
          binary,
          steps: segmentSteps,
        });

        return binary;
      });

      setBinaryInput(binaries.join(delimiter === 'none' ? '' : delimiter === 'space' ? ' ' : ', '));
      setSteps(conversionSteps);
      setError('');
    } catch (err) {
      setError('Error converting BCD to binary: ' + err.message);
      setBinaryInput('');
      setSteps([]);
    }
  }, [delimiter, bitLength, bcdFormat]);

  const handleInputChange = (e, isReverse = false) => {
    const value = e.target.value;
    if (isReverse) {
      setBcdOutput(value);
      bcdToBinary(value);
    } else {
      setBinaryInput(value);
      binaryToBCD(value);
    }
  };

  const handleFileUpload = (file, isReverse = false) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      if (isReverse) {
        setBcdOutput(text);
        bcdToBinary(text);
      } else {
        setBinaryInput(text);
        binaryToBCD(text);
      }
    };
    reader.onerror = () => setError('Error reading file');
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/plain') {
      handleFileUpload(file, reverseMode);
    } else {
      setError('Please drop a valid text file');
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const downloadOutput = (text, filename) => {
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
    setBcdOutput('');
    setError('');
    setSteps([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-3xl relative">
        <h1 className="text-4xl font-extrabold mb-6 text-gray-800 text-center">
          Advanced Binary ↔ BCD Converter
        </h1>

        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in">
            Copied to clipboard!
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6 justify-center items-center bg-gray-50 p-4 rounded-md">
          <div>
            <label className="text-sm text-gray-600 mr-2">Mode:</label>
            <button
              onClick={() => setReverseMode(!reverseMode)}
              className={`px-3 py-1 rounded-md transition-colors ${
                reverseMode ? 'bg-blue-500 text-white' : 'bg-yellow-500 text-white'
              } hover:bg-opacity-80`}
            >
              {reverseMode ? 'BCD to Binary' : 'Binary to BCD'}
            </button>
          </div>
          <div>
            <label className="text-sm text-gray-600 mr-2">Delimiter:</label>
            <select
              value={delimiter}
              onChange={(e) => {
                setDelimiter(e.target.value);
                reverseMode ? bcdToBinary(bcdOutput) : binaryToBCD(binaryInput);
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
                reverseMode ? bcdToBinary(bcdOutput) : binaryToBCD(binaryInput);
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
            <label className="text-sm text-gray-600 mr-2">BCD Format:</label>
            <select
              value={bcdFormat}
              onChange={(e) => {
                setBcdFormat(e.target.value);
                reverseMode ? bcdToBinary(bcdOutput) : binaryToBCD(binaryInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="8421">8-4-2-1</option>
              <option value="excess3">Excess-3</option>
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
          <label className="block text-gray-700 mb-2">
            {reverseMode ? 'Enter BCD:' : 'Enter Binary:'}
          </label>
          <textarea
            value={reverseMode ? bcdOutput : binaryInput}
            onChange={(e) => handleInputChange(e, reverseMode)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y font-mono"
            rows="6"
            placeholder={reverseMode ? 'Enter BCD (e.g., 0000 1001)' : 'Enter binary (e.g., 1001 1010)'}
          />
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop a text file with data
          </p>
        </div>

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">
            {reverseMode ? 'Binary Output:' : 'BCD Output:'}
          </label>
          <div className="relative">
            <textarea
              value={reverseMode ? binaryInput : bcdOutput}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 min-h-[150px] resize-y font-mono"
              placeholder="Output will appear here..."
            />
            {(reverseMode ? binaryInput : bcdOutput) && (
              <div className="absolute right-2 top-2 space-x-2">
                <button
                  onClick={() => copyToClipboard(reverseMode ? binaryInput : bcdOutput)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={() => downloadOutput(reverseMode ? binaryInput : bcdOutput, reverseMode ? 'binary_output.txt' : 'bcd_output.txt')}
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

        {/* Steps Toggle and Display */}
        <div className="mb-6">
          <button
            onClick={() => setShowSteps(!showSteps)}
            className="w-full px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
          >
            {showSteps ? 'Hide Conversion Steps' : 'Show Conversion Steps'}
          </button>
          {showSteps && steps.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Conversion Steps:</h2>
              {steps.map((step, index) => (
                <div key={index} className="mb-4">
                  <p className="font-medium">
                    {reverseMode ? 'BCD' : 'Binary'} Segment {index + 1}: {reverseMode ? step.bcd : step.binary}
                  </p>
                  <p>Decimal: {step.decimal}</p>
                  <p>{reverseMode ? 'Binary' : 'BCD'}: {reverseMode ? step.binary : step.bcd}</p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {step.steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="text-gray-600 text-sm text-center">
          <p>Converts between Binary and BCD with advanced options</p>
          <p>Supports 8-4-2-1 and Excess-3 formats, file input, and detailed steps</p>
        </div>
      </div>
    </div>
  );
};

export default BinaryToBCD;