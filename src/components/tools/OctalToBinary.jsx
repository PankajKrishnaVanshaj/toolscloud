'use client';

import React, { useState, useCallback } from 'react';

const OctalToBinary = () => {
  const [octalInput, setOctalInput] = useState('');
  const [binaryOutput, setBinaryOutput] = useState('');
  const [delimiter, setDelimiter] = useState('space'); // space, comma, none
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [grouping, setGrouping] = useState('none'); // none, 3, 4
  const [padding, setPadding] = useState('none'); // none, left

  const octalToBinary = useCallback((octal) => {
    try {
      if (!octal) {
        setBinaryOutput('');
        setError('');
        return;
      }

      let octalArray;
      switch (delimiter) {
        case 'space':
          octalArray = octal.trim().split(/\s+/);
          break;
        case 'comma':
          octalArray = octal.split(',').map(str => str.trim());
          break;
        case 'none':
          octalArray = octal.match(/.{1,3}/g) || [];
          break;
        default:
          octalArray = octal.trim().split(/\s+/);
      }

      const binaries = octalArray.map((oct) => {
        if (!/^[0-7]+$/.test(oct)) throw new Error('Invalid octal format');

        let binary = parseInt(oct, 8).toString(2);
        if (padding === 'left') {
          const minLength = oct.length * 3; // Each octal digit = 3 binary digits
          binary = binary.padStart(minLength, '0');
        }

        if (grouping !== 'none') {
          const groupSize = parseInt(grouping);
          return binary.match(new RegExp(`.{1,${groupSize}}`, 'g')).join(' ');
        }
        return binary;
      });

      setBinaryOutput(binaries.join(' '));
      setError('');
    } catch (err) {
      setError('Error converting octal to binary: ' + err.message);
      setBinaryOutput('');
    }
  }, [delimiter, grouping, padding]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setOctalInput(value);
    octalToBinary(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setOctalInput(text);
      octalToBinary(text);
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
    setOctalInput('');
    setBinaryOutput('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl relative">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Advanced Octal to Binary Converter
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
                octalToBinary(octalInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                octalToBinary(octalInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="none">None</option>
              <option value="3">3-bit Groups</option>
              <option value="4">4-bit Groups</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mr-2">Padding:</label>
            <select
              value={padding}
              onChange={(e) => {
                setPadding(e.target.value);
                octalToBinary(octalInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="none">None</option>
              <option value="left">Left (Leading 0s)</option>
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
            isDragging ? 'border-teal-500 bg-teal-50' : 'border-gray-300'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <label className="block text-gray-700 mb-2">Enter Octal:</label>
          <textarea
            value={octalInput}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y font-mono"
            rows="6"
            placeholder="Enter octal (e.g., 110 145)"
          />
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop a text file with octal data
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
                  className="bg-teal-500 text-white px-3 py-1 rounded-md hover:bg-teal-600 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={downloadOutput}
                  className="bg-pink-500 text-white px-3 py-1 rounded-md hover:bg-pink-600 transition-colors"
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
          <p>Converts octal to binary with customizable formatting</p>
          <p>Supports file drag-and-drop, grouping, and padding</p>
        </div>
      </div>
    </div>
  );
};

export default OctalToBinary;