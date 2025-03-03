'use client';

import React, { useState, useCallback, useEffect } from 'react';

const BCDToBinary = () => {
  const [bcdInput, setBcdInput] = useState('');
  const [binaryOutput, setBinaryOutput] = useState('');
  const [delimiter, setDelimiter] = useState('space');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [bcdFormat, setBcdFormat] = useState('8421'); // 8-4-2-1, Excess-3
  const [outputBitLength, setOutputBitLength] = useState('auto');
  const [showSteps, setShowSteps] = useState(false);
  const [steps, setSteps] = useState([]);
  const [reverseMode, setReverseMode] = useState(false); // Toggle between BCD to Binary and Binary to BCD
  const [binaryInput, setBinaryInput] = useState('');

  const bcdToBinary = useCallback((bcd) => {
    try {
      if (!bcd) {
        setBinaryOutput('');
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
          throw new Error(`Invalid BCD segment at position ${index + 1}: ${bcdSegment}`);
        }

        let decimal = 0;
        const segmentSteps = [];

        for (let i = 0; i < bcdSegment.length; i += 4) {
          const bcdDigit = bcdSegment.slice(i, i + 4);
          let digit = parseInt(bcdDigit, 2);
          if (bcdFormat === 'excess3') digit -= 3; // Adjust for Excess-3
          if (digit < 0 || digit > 9) throw new Error(`BCD digit ${bcdDigit} out of range (0-9)`);
          
          segmentSteps.push(`${bcdDigit} = ${digit}`);
          decimal = decimal * 10 + digit;
        }

        let binary = decimal.toString(2);
        if (outputBitLength !== 'auto') {
          const maxValue = 2 ** parseInt(outputBitLength) - 1;
          if (decimal > maxValue) {
            throw new Error(`Decimal ${decimal} exceeds ${outputBitLength}-bit limit`);
          }
          binary = binary.padStart(parseInt(outputBitLength), '0');
        }

        conversionSteps.push({
          bcd: bcdSegment,
          decimal,
          binary,
          steps: segmentSteps,
        });

        return binary;
      });

      setBinaryOutput(binaries.join(delimiter === 'none' ? '' : delimiter === 'space' ? ' ' : ', '));
      setSteps(conversionSteps);
      setError('');
    } catch (err) {
      setError('Error converting BCD to binary: ' + err.message);
      setBinaryOutput('');
      setSteps([]);
    }
  }, [delimiter, bcdFormat, outputBitLength]);

  const binaryToBCD = useCallback((binary) => {
    try {
      if (!binary) {
        setBcdInput('');
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
      const bcds = binaryArray.map((bin, index) => {
        if (!/^[01]+$/.test(bin)) {
          throw new Error(`Invalid binary segment at position ${index + 1}: ${bin}`);
        }

        const decimal = parseInt(bin, 2);
        let decimalStr = decimal.toString();
        const segmentSteps = [];

        let bcd = '';
        for (let digit of decimalStr) {
          let bcdDigit = parseInt(digit).toString(2).padStart(4, '0');
          if (bcdFormat === 'excess3') {
            const excessDigit = parseInt(digit) + 3;
            bcdDigit = excessDigit.toString(2).padStart(4, '0');
          }
          segmentSteps.push(`${digit} = ${bcdDigit}`);
          bcd += bcdDigit;
        }

        conversionSteps.push({
          binary: bin,
          decimal,
          bcd,
          steps: segmentSteps,
        });

        return bcd;
      });

      setBcdInput(bcds.join(delimiter === 'none' ? '' : delimiter === 'space' ? ' ' : ', '));
      setSteps(conversionSteps);
      setError('');
    } catch (err) {
      setError('Error converting binary to BCD: ' + err.message);
      setBcdInput('');
      setSteps([]);
    }
  }, [delimiter, bcdFormat]);

  const handleInputChange = (e, isReverse = false) => {
    const value = e.target.value;
    if (isReverse) {
      setBinaryInput(value);
      binaryToBCD(value);
    } else {
      setBcdInput(value);
      bcdToBinary(value);
    }
  };

  const handleFileUpload = (file, isReverse = false) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      if (isReverse) {
        setBinaryInput(text);
        binaryToBCD(text);
      } else {
        setBcdInput(text);
        bcdToBinary(text);
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
    setBcdInput('');
    setBinaryInput('');
    setBinaryOutput('');
    setError('');
    setSteps([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-3xl relative">
        <h1 className="text-4xl font-extrabold mb-6 text-gray-800 text-center">
          Advanced BCD ↔ Binary Converter
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
                reverseMode ? 'bg-purple-500 text-white' : 'bg-green-500 text-white'
              } hover:bg-opacity-80`}
            >
              {reverseMode ? 'Binary to BCD' : 'BCD to Binary'}
            </button>
          </div>
          <div>
            <label className="text-sm text-gray-600 mr-2">Delimiter:</label>
            <select
              value={delimiter}
              onChange={(e) => {
                setDelimiter(e.target.value);
                reverseMode ? binaryToBCD(binaryInput) : bcdToBinary(bcdInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="space">Space</option>
              <option value="comma">Comma</option>
              <option value="none">None</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mr-2">BCD Format:</label>
            <select
              value={bcdFormat}
              onChange={(e) => {
                setBcdFormat(e.target.value);
                reverseMode ? binaryToBCD(binaryInput) : bcdToBinary(bcdInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="8421">8-4-2-1</option>
              <option value="excess3">Excess-3</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mr-2">Output Bit Length:</label>
            <select
              value={outputBitLength}
              onChange={(e) => {
                setOutputBitLength(e.target.value);
                reverseMode ? binaryToBCD(binaryInput) : bcdToBinary(bcdInput);
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
          <label className="block text-gray-700 mb-2">
            {reverseMode ? 'Enter Binary:' : 'Enter BCD:'}
          </label>
          <textarea
            value={reverseMode ? binaryInput : bcdInput}
            onChange={(e) => handleInputChange(e, reverseMode)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-y font-mono"
            rows="6"
            placeholder={reverseMode ? 'Enter binary (e.g., 1010 1100)' : 'Enter BCD (e.g., 0000 1001 0001 0000)'}
          />
          <p className="text-sm text-gray-500 mt-1">Drag and drop a text file</p>
        </div>

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">
            {reverseMode ? 'BCD Output:' : 'Binary Output:'}
          </label>
          <div className="relative">
            <textarea
              value={reverseMode ? bcdInput : binaryOutput}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 min-h-[150px] resize-y font-mono"
              placeholder="Output will appear here..."
            />
            {(reverseMode ? bcdInput : binaryOutput) && (
              <div className="absolute right-2 top-2 space-x-2">
                <button
                  onClick={() => copyToClipboard(reverseMode ? bcdInput : binaryOutput)}
                  className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={() => downloadOutput(reverseMode ? bcdInput : binaryOutput, reverseMode ? 'bcd_output.txt' : 'binary_output.txt')}
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

        {/* Steps Toggle and Display */}
        <div className="mb-6">
          <button
            onClick={() => setShowSteps(!showSteps)}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            {showSteps ? 'Hide Conversion Steps' : 'Show Conversion Steps'}
          </button>
          {showSteps && steps.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Conversion Steps:</h2>
              {steps.map((step, index) => (
                <div key={index} className="mb-4">
                  <p className="font-medium">
                    {reverseMode ? 'Binary' : 'BCD'} Segment {index + 1}: {reverseMode ? step.binary : step.bcd}
                  </p>
                  <p>Decimal: {step.decimal}</p>
                  <p>{reverseMode ? 'BCD' : 'Binary'}: {reverseMode ? step.bcd : step.binary}</p>
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
          <p>Converts between BCD and Binary with advanced options</p>
          <p>Supports 8-4-2-1 and Excess-3 BCD formats, file input, and detailed steps</p>
        </div>
      </div>
    </div>
  );
};

export default BCDToBinary;