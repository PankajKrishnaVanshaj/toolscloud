'use client'

import React, { useState, useCallback } from 'react';

const BinaryDecoder = () => {
  const [binaryInput, setBinaryInput] = useState('');
  const [decodedOutput, setDecodedOutput] = useState('');
  const [decodingScheme, setDecodingScheme] = useState('utf8'); // ascii, utf8, base64
  const [delimiter, setDelimiter] = useState('space'); // space, comma, none
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);

  const decodeFromBinary = useCallback((binary) => {
    try {
      if (!binary) {
        setDecodedOutput('');
        setError('');
        return;
      }

      let binaryString;
      switch (delimiter) {
        case 'space':
          binaryString = binary.trim().split(/\s+/).join('');
          break;
        case 'comma':
          binaryString = binary.split(',').map(str => str.trim()).join('');
          break;
        case 'none':
          binaryString = binary.trim();
          break;
        default:
          binaryString = binary.trim().split(/\s+/).join('');
      }

      if (!/^[01]+$/.test(binaryString)) {
        throw new Error('Invalid binary format');
      }
      if (binaryString.length % 8 !== 0) {
        throw new Error('Binary length must be a multiple of 8 bits');
      }

      // Convert binary string to byte array
      const byteArray = [];
      for (let i = 0; i < binaryString.length; i += 8) {
        const byte = binaryString.slice(i, i + 8);
        byteArray.push(parseInt(byte, 2));
      }

      let decodedText;
      switch (decodingScheme) {
        case 'ascii':
          decodedText = byteArray.map(byte => {
            if (byte > 127) throw new Error('Byte exceeds ASCII range (0-127)');
            return String.fromCharCode(byte);
          }).join('');
          break;
        case 'utf8':
          decodedText = new TextDecoder('utf-8').decode(new Uint8Array(byteArray));
          break;
        case 'base64':
          const base64String = String.fromCharCode(...byteArray);
          decodedText = atob(base64String);
          break;
        default:
          throw new Error('Unsupported decoding scheme');
      }

      setDecodedOutput(decodedText);
      setError('');
    } catch (err) {
      setError('Error decoding from binary: ' + err.message);
      setDecodedOutput('');
    }
  }, [decodingScheme, delimiter]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setBinaryInput(value);
    decodeFromBinary(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setBinaryInput(text);
      decodeFromBinary(text);
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
      await navigator.clipboard.writeText(decodedOutput);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const downloadOutput = () => {
    const blob = new Blob([decodedOutput], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'decoded_output.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setBinaryInput('');
    setDecodedOutput('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl relative">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Advanced Binary Decoder
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
            <label className="text-sm text-gray-600 mr-2">Decoding:</label>
            <select
              value={decodingScheme}
              onChange={(e) => {
                setDecodingScheme(e.target.value);
                decodeFromBinary(binaryInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                decodeFromBinary(binaryInput);
              }}
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="space">Space</option>
              <option value="comma">Comma</option>
              <option value="none">None</option>
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
            placeholder="Enter 8-bit binary (e.g., 01001000 01100101 01101100 01101100 01101111)"
          />
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop a text file with binary data
          </p>
        </div>

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Decoded Output:</label>
          <div className="relative">
            <textarea
              value={decodedOutput}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 min-h-[150px] resize-y"
              placeholder="Decoded text will appear here..."
            />
            {decodedOutput && (
              <div className="absolute right-2 top-2 space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="bg-purple-500 text-white px-3 py-1 rounded-md hover:bg-purple-600 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={downloadOutput}
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

        {/* Info */}
        <div className="text-gray-600 text-sm text-center">
          <p>Decodes binary to text using ASCII, UTF-8, or Base64</p>
          <p>Supports file drag-and-drop and multiple delimiters</p>
        </div>
      </div>
    </div>
  );
};

export default BinaryDecoder;