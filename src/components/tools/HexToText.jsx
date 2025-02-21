'use client'
import React, { useState, useRef } from 'react';

const HexToText = () => {
  const [hexInput, setHexInput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const [binaryOutput, setBinaryOutput] = useState('');
  const [error, setError] = useState('');
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [allowSpaces, setAllowSpaces] = useState(true);
  const [encoding, setEncoding] = useState('utf8');
  const fileInputRef = useRef(null);

  // Convert hex to text and binary
  const convertHex = () => {
    if (!hexInput.trim()) {
      setError('Please enter a hexadecimal string');
      setTextOutput('');
      setBinaryOutput('');
      return;
    }

    try {
      setError('');
      let cleanHex = hexInput;
      if (allowSpaces) {
        cleanHex = cleanHex.replace(/\s+/g, '');
      } else {
        cleanHex = cleanHex.replace(/[^0-9A-Fa-f]/g, '');
      }

      if (cleanHex.length === 0) {
        setError('No valid hex characters found');
        return;
      }

      if (cleanHex.length % 2 !== 0) {
        setError('Hex string length must be even (each byte is 2 characters)');
        setTextOutput('');
        setBinaryOutput('');
        return;
      }

      if (!/^[0-9A-Fa-f]+$/.test(cleanHex)) {
        setError('Invalid hex string: only 0-9 and A-F allowed');
        setTextOutput('');
        setBinaryOutput('');
        return;
      }

      // Convert to text
      let text = '';
      const binaryArray = [];
      for (let i = 0; i < cleanHex.length; i += 2) {
        const byte = parseInt(cleanHex.substr(i, 2), 16);
        text += encoding === 'utf8' 
          ? String.fromCharCode(byte) 
          : String.fromCharCode(byte); // ASCII is simpler here
        binaryArray.push(byte.toString(2).padStart(8, '0'));
      }
      setTextOutput(text);
      setBinaryOutput(binaryArray.join(' '));
    } catch (err) {
      setError('Conversion error: ' + err.message);
      setTextOutput('');
      setBinaryOutput('');
    }
  };

  // Handle file upload
  const handleFileUpload = (file) => {
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const hexData = allowSpaces 
        ? event.target.result.replace(/\s+/g, '') 
        : event.target.result.replace(/[^0-9A-Fa-f]/g, '');
      setHexInput(hexData);
      try {
        if (hexData.length % 2 !== 0) {
          setError('Hex string length must be even in file');
        } else if (!/^[0-9A-Fa-f]+$/.test(hexData)) {
          setError('File contains invalid hex characters');
        } else {
          let text = '';
          const binaryArray = [];
          for (let i = 0; i < hexData.length; i += 2) {
            const byte = parseInt(hexData.substr(i, 2), 16);
            text += encoding === 'utf8' 
              ? String.fromCharCode(byte) 
              : String.fromCharCode(byte);
            binaryArray.push(byte.toString(2).padStart(8, '0'));
          }
          setTextOutput(text);
          setBinaryOutput(binaryArray.join(' '));
        }
      } catch (err) {
        setError('File conversion error: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Error reading file');
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'text/plain' || file.name.endsWith('.hex'))) {
      handleFileUpload(file);
    } else {
      setError('Please drop a valid text or .hex file');
    }
  };

  // Handle copy
  const handleCopy = (type) => {
    const content = type === 'text' ? textOutput : binaryOutput;
    if (content) {
      navigator.clipboard.writeText(content);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    }
  };

  // Clear all
  const clearAll = () => {
    setHexInput('');
    setTextOutput('');
    setBinaryOutput('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="relative bg-white p-6 rounded-lg shadow-md w-full max-w-3xl">
        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            Copied to clipboard!
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Hex to Text Converter</h1>
          <button
            onClick={clearAll}
            className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
            disabled={isLoading}
          >
            Clear All
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Options */}
        <div className="mb-4 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Conversion Options</h3>
          <div className="flex gap-4">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={allowSpaces}
                onChange={(e) => setAllowSpaces(e.target.checked)}
                className="mr-2"
                disabled={isLoading}
              />
              Allow Spaces
            </label>
            <select
              value={encoding}
              onChange={(e) => setEncoding(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm"
              disabled={isLoading}
            >
              <option value="utf8">UTF-8</option>
              <option value="ascii">ASCII</option>
            </select>
          </div>
        </div>

        {/* Hex Input */}
        <div 
          className={`mb-6 border-2 rounded-md ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="flex justify-between items-center mb-2 p-2">
            <label className="block text-sm font-medium text-gray-700">
              Enter Hexadecimal String
            </label>
            <label className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
              Upload File
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileUpload(e.target.files[0])}
                accept=".txt,.hex"
                className="hidden"
                disabled={isLoading}
              />
            </label>
          </div>
          <textarea
            value={hexInput}
            onChange={(e) => {
              setHexInput(e.target.value);
              setTextOutput('');
              setBinaryOutput('');
              setError('');
            }}
            placeholder="Paste your hex string here or drag-and-drop a file (e.g., 48656C6C6F 20576F726C64)"
            className="w-full h-32 px-3 py-2 border-t border-gray-300 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
            aria-label="Hex input"
            disabled={isLoading}
          />
          <button
            onClick={convertHex}
            className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            disabled={isLoading || !hexInput.trim()}
          >
            {isLoading ? 'Converting...' : 'Convert'}
          </button>
        </div>

        {/* Text Output */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Text Output
          </label>
          <textarea
            value={textOutput}
            readOnly
            placeholder="Converted text will appear here"
            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm resize-y"
            aria-label="Text output"
          />
          <button
            onClick={() => handleCopy('text')}
            className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            disabled={!textOutput || isLoading}
          >
            Copy Text
          </button>
        </div>

        {/* Binary Output */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Binary Output
          </label>
          <textarea
            value={binaryOutput}
            readOnly
            placeholder="Binary representation will appear here"
            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm resize-y"
            aria-label="Binary output"
          />
          <button
            onClick={() => handleCopy('binary')}
            className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            disabled={!binaryOutput || isLoading}
          >
            Copy Binary
          </button>
        </div>

        {/* Example */}
        <div className="text-sm text-gray-600">
          <p>Example input:</p>
          <pre className="bg-gray-50 p-2 rounded-md mt-1 overflow-x-auto">
            48656C6C6F 20576F726C64
          </pre>
          <p className="mt-2">Example text output:</p>
          <pre className="bg-gray-50 p-2 rounded-md mt-1 overflow-x-auto">
            Hello World
          </pre>
          <p className="mt-2">Example binary output:</p>
          <pre className="bg-gray-50 p-2 rounded-md mt-1 overflow-x-auto">
            01001000 01100101 01101100 01101100 01101111 00100000 01110111 01101111 01110010 01101100 01100100
          </pre>
        </div>
      </div>
    </div>
  );
};

export default HexToText;