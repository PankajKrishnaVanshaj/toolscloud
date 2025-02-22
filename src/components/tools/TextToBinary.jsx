'use client';

import React, { useState, useCallback } from 'react';

const TextToBinary = () => {
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('textToBinary');
  const [encoding, setEncoding] = useState('8bit');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);

  // Text to Binary conversion
  const textToBinary = useCallback((text) => {
    try {
      if (!text) {
        setOutput('');
        setError('');
        return;
      }

      const bits = encoding === '8bit' ? 8 : 7;
      const binary = text
        .split('')
        .map((char) => {
          const binaryChar = char.charCodeAt(0).toString(2);
          return '0'.repeat(bits - binaryChar.length) + binaryChar;
        })
        .join(' ');
      
      setOutput(binary);
      setError('');
    } catch (err) {
      setError('Error converting text to binary');
      setOutput('');
    }
  }, [encoding]);

  // Binary to Text conversion
  const binaryToText = useCallback((binary) => {
    try {
      if (!binary) {
        setOutput('');
        setError('');
        return;
      }

      const binaryArray = binary.trim().split(/\s+/);
      const text = binaryArray
        .map((bin) => {
          if (!/^[01]+$/.test(bin)) throw new Error('Invalid binary format');
          return String.fromCharCode(parseInt(bin, 2));
        })
        .join('');
      
      setOutput(text);
      setError('');
    } catch (err) {
      setError('Error converting binary to text: ' + err.message);
      setOutput('');
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputText(value);
    mode === 'textToBinary' ? textToBinary(value) : binaryToText(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setInputText(text);
      mode === 'textToBinary' ? textToBinary(text) : binaryToText(text);
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

  const toggleMode = () => {
    setMode(mode === 'textToBinary' ? 'binaryToText' : 'textToBinary');
    setInputText('');
    setOutput('');
    setError('');
  };

  const downloadOutput = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mode === 'textToBinary' ? 'binary.txt' : 'text.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000); // Hide after 2 seconds
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl relative">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Advanced Text ↔ Binary Converter
        </h1>

        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in">
            Copied to clipboard!
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-4 mb-6 justify-center">
          <button
            onClick={toggleMode}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Switch to {mode === 'textToBinary' ? 'Binary → Text' : 'Text → Binary'}
          </button>
          <select
            value={encoding}
            onChange={(e) => setEncoding(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="8bit">8-bit</option>
            <option value="7bit">7-bit</option>
          </select>
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
          <label className="block text-gray-700 mb-2">
            {mode === 'textToBinary' ? 'Enter Text:' : 'Enter Binary:'}
          </label>
          <textarea
            value={inputText}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            rows="6"
            placeholder={
              mode === 'textToBinary'
                ? 'Type your text here or drag a .txt file...'
                : 'Enter binary numbers (space-separated)...'
            }
          />
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop a text file here
          </p>
        </div>

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Output:</label>
          <div className="relative">
            <textarea
              value={output}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 min-h-[150px] resize-y"
              placeholder="Result will appear here..."
            />
            {output && (
              <div className="absolute right-2 top-2 space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={downloadOutput}
                  className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors"
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
          <p>
            {mode === 'textToBinary'
              ? `Converts text to ${encoding} binary representation`
              : 'Converts space-separated binary to text'}
          </p>
          <p>Supports file drag-and-drop and download functionality</p>
        </div>
      </div>
    </div>
  );
};

export default TextToBinary;