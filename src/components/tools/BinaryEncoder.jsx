'use client';

import React, { useState, useCallback } from 'react';

const BinaryEncoder = () => {
  const [inputText, setInputText] = useState('');
  const [binaryOutput, setBinaryOutput] = useState('');
  const [encodingScheme, setEncodingScheme] = useState('utf8'); // ascii, utf8, base64
  const [delimiter, setDelimiter] = useState('space'); // space, comma, none
  const [grouping, setGrouping] = useState('none'); // none, 4, 8
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);

  const encodeToBinary = useCallback((text) => {
    try {
      if (!text) {
        setBinaryOutput('');
        setError('');
        return;
      }

      let byteArray;
      switch (encodingScheme) {
        case 'ascii':
          byteArray = Array.from(text).map(char => {
            const code = char.charCodeAt(0);
            if (code > 127) throw new Error('Character exceeds ASCII range (0-127)');
            return code;
          });
          break;
        case 'utf8':
          byteArray = new TextEncoder().encode(text);
          break;
        case 'base64':
          const base64 = btoa(text);
          byteArray = Array.from(base64).map(char => char.charCodeAt(0));
          break;
        default:
          throw new Error('Unsupported encoding scheme');
      }

      const binaryArray = byteArray.map(byte => {
        let binary = byte.toString(2).padStart(8, '0');
        if (grouping !== 'none') {
          const groupSize = parseInt(grouping);
          return binary.match(new RegExp(`.{1,${groupSize}}`, 'g')).join(' ');
        }
        return binary;
      });

      setBinaryOutput(binaryArray.join(delimiter === 'none' ? '' : delimiter === 'space' ? ' ' : ', '));
      setError('');
    } catch (err) {
      setError('Error encoding to binary: ' + err.message);
      setBinaryOutput('');
    }
  }, [encodingScheme, delimiter, grouping]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputText(value);
    encodeToBinary(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setInputText(text);
      encodeToBinary(text);
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
    setInputText('');
    setBinaryOutput('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl relative">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Advanced Binary Encoder
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
            <label className="text-sm text-gray-600 mr-2">Encoding:</label>
            <select
              value={encodingScheme}
              onChange={(e) => {
                setEncodingScheme(e.target.value);
                encodeToBinary(inputText);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ascii">ASCII</option>
              <option value="utf8">UTF-8</option>
              <option value="base64">Base64</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mr-2">Delimiter:</label>
            <select
              value={delimiter}
              onChange={(e) => {
                setDelimiter(e.target.value);
                encodeToBinary(inputText);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                encodeToBinary(inputText);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <label className="block text-gray-700 mb-2">Enter Text:</label>
          <textarea
            value={inputText}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            rows="6"
            placeholder="Enter text to encode (e.g., Hello)"
          />
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop a text file with data to encode
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
                  className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={downloadOutput}
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

        {/* Info */}
        <div className="text-gray-600 text-sm text-center">
          <p>Encodes text to binary using ASCII, UTF-8, or Base64</p>
          <p>Supports file drag-and-drop, delimiters, and grouping</p>
        </div>
      </div>
    </div>
  );
};

export default BinaryEncoder;