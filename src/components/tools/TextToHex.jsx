'use client'
import React, { useState } from 'react';

const TextToHex = () => {
  const [textInput, setTextInput] = useState('');
  const [hexOutput, setHexOutput] = useState('');
  const [binaryOutput, setBinaryOutput] = useState('');
  const [error, setError] = useState('');
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [encoding, setEncoding] = useState('utf8');
  const [includeSpaces, setIncludeSpaces] = useState(true);

  // Convert text to hex and binary
  const convertToHex = () => {
    if (!textInput.trim()) {
      setError('Please enter text to convert');
      setHexOutput('');
      setBinaryOutput('');
      return;
    }

    try {
      setError('');
      let hex = '';
      const binaryArray = [];
      
      // Convert each character to hex and binary
      for (let i = 0; i < textInput.length; i++) {
        const charCode = textInput.charCodeAt(i);
        const hexValue = charCode.toString(16).padStart(2, '0').toUpperCase();
        hex += includeSpaces && i > 0 ? ' ' + hexValue : hexValue;
        binaryArray.push(charCode.toString(2).padStart(8, '0'));
      }

      setHexOutput(hex);
      setBinaryOutput(binaryArray.join(' '));
    } catch (err) {
      setError('Conversion error: ' + err.message);
      setHexOutput('');
      setBinaryOutput('');
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const textData = event.target.result;
      setTextInput(textData);
      try {
        let hex = '';
        const binaryArray = [];
        for (let i = 0; i < textData.length; i++) {
          const charCode = textData.charCodeAt(i);
          const hexValue = charCode.toString(16).padStart(2, '0').toUpperCase();
          hex += includeSpaces && i > 0 ? ' ' + hexValue : hexValue;
          binaryArray.push(charCode.toString(2).padStart(8, '0'));
        }
        setHexOutput(hex);
        setBinaryOutput(binaryArray.join(' '));
      } catch (err) {
        setError('File conversion error: ' + err.message);
        setHexOutput('');
        setBinaryOutput('');
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Error reading file');
      setIsLoading(false);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Handle copy
  const handleCopy = (type) => {
    const content = type === 'hex' ? hexOutput : binaryOutput;
    if (content) {
      navigator.clipboard.writeText(content);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    }
  };

  // Clear all
  const clearAll = () => {
    setTextInput('');
    setHexOutput('');
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
          <h1 className="text-2xl font-bold text-gray-800">Text to Hex Converter</h1>
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
                checked={includeSpaces}
                onChange={(e) => setIncludeSpaces(e.target.checked)}
                className="mr-2"
                disabled={isLoading}
              />
              Include Spaces
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

        {/* Text Input */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Enter Text
            </label>
            <label className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
              Upload File
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".txt"
                className="hidden"
                disabled={isLoading}
              />
            </label>
          </div>
          <textarea
            value={textInput}
            onChange={(e) => {
              setTextInput(e.target.value);
              setHexOutput('');
              setBinaryOutput('');
              setError('');
            }}
            placeholder="Enter your text here (e.g., Hello World)"
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
            aria-label="Text input"
            disabled={isLoading}
          />
          <button
            onClick={convertToHex}
            className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            disabled={isLoading || !textInput.trim()}
          >
            {isLoading ? 'Converting...' : 'Convert to Hex'}
          </button>
        </div>

        {/* Hex Output */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hex Output
          </label>
          <textarea
            value={hexOutput}
            readOnly
            placeholder="Hexadecimal output will appear here"
            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm resize-y"
            aria-label="Hex output"
          />
          <button
            onClick={() => handleCopy('hex')}
            className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            disabled={!hexOutput || isLoading}
          >
            Copy Hex
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
            placeholder="Binary output will appear here"
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
            Hello World
          </pre>
          <p className="mt-2">Example hex output (with spaces):</p>
          <pre className="bg-gray-50 p-2 rounded-md mt-1 overflow-x-auto">
            48 65 6C 6C 6F 20 57 6F 72 6C 64
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

export default TextToHex;