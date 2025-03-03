'use client';

import React, { useState } from 'react';

const BinaryToUnicode = () => {
  const [binaryInput, setBinaryInput] = useState('');
  const [format, setFormat] = useState('continuous'); // 'continuous' or 'bytes'
  const [unicodeOutput, setUnicodeOutput] = useState('');
  const [charCodes, setCharCodes] = useState([]);
  const [error, setError] = useState('');
  const [textInput, setTextInput] = useState(''); // For reverse conversion

  const validateBinary = (binary) => {
    return /^[01\s]+$/.test(binary);
  };

  const binaryToDecimal = (binary) => {
    return parseInt(binary, 2);
  };

  const decimalToUnicodeChar = (decimal) => {
    try {
      return String.fromCharCode(decimal);
    } catch {
      return '';
    }
  };

  const convertBinaryToUnicode = () => {
    setError('');
    setUnicodeOutput('');
    setCharCodes([]);

    if (!binaryInput.trim()) {
      setError('Please enter a binary string');
      return;
    }

    if (!validateBinary(binaryInput)) {
      setError('Invalid binary input: Use only 0s, 1s, and spaces');
      return;
    }

    let bytes;
    if (format === 'continuous') {
      const binary = binaryInput.replace(/\s/g, '');
      if (binary.length % 8 !== 0) {
        setError('Continuous binary input must be a multiple of 8 bits');
        return;
      }
      bytes = binary.match(/.{1,8}/g) || [];
    } else {
      bytes = binaryInput.trim().split(/\s+/);
      for (const byte of bytes) {
        if (byte.length !== 8) {
          setError('Each byte must be exactly 8 bits');
          return;
        }
      }
    }

    const decimals = bytes.map(binaryToDecimal);
    const chars = decimals.map(decimalToUnicodeChar);
    setUnicodeOutput(chars.join(''));
    setCharCodes(decimals);
  };

  const convertTextToBinary = () => {
    setError('');
    setBinaryInput('');

    if (!textInput.trim()) {
      setError('Please enter text to convert to binary');
      return;
    }

    const binaryArray = textInput.split('').map(char => {
      const binary = char.charCodeAt(0).toString(2).padStart(8, '0');
      return binary;
    });

    setBinaryInput(format === 'continuous' ? binaryArray.join('') : binaryArray.join(' '));
    setUnicodeOutput(textInput);
    setCharCodes(textInput.split('').map(char => char.charCodeAt(0)));
  };

  const handleBinarySubmit = (e) => {
    e.preventDefault();
    convertBinaryToUnicode();
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    convertTextToBinary();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary to Unicode Converter
        </h1>

        <div className="grid gap-6">
          {/* Binary Input Section */}
          <form onSubmit={handleBinarySubmit} className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Input
              </label>
              <textarea
                value={binaryInput}
                onChange={(e) => setBinaryInput(e.target.value)}
                placeholder={format === 'continuous' ? 'e.g., 0100100001100101' : 'e.g., 01001000 01101100'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />
            </div>
            <div className="flex gap-4 items-center">
              <label className="text-sm font-medium text-gray-700">Format:</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="continuous">Continuous Bits</option>
                <option value="bytes">Space-Separated Bytes</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Convert to Unicode
              </button>
            </div>
          </form>

          {/* Text Input Section */}
          <form onSubmit={handleTextSubmit} className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Input (Reverse Conversion)
              </label>
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="e.g., Hello"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-48"
            >
              Convert to Binary
            </button>
          </form>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Results Section */}
          {unicodeOutput && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-2">
                  <p>
                    <span className="font-medium">Unicode Text:</span> {unicodeOutput}
                  </p>
                  <button
                    onClick={() => copyToClipboard(unicodeOutput)}
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Copy
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <p>
                    <span className="font-medium">Binary:</span> {binaryInput}
                  </p>
                  <button
                    onClick={() => copyToClipboard(binaryInput)}
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Copy
                  </button>
                </div>
                <div>
                  <p className="font-medium">Character Codes (Decimal):</p>
                  <p>{charCodes.join(', ')}</p>
                </div>
                <div>
                  <p className="font-medium">Visualization:</p>
                  <div className="font-mono text-xs grid gap-1">
                    {charCodes.map((code, index) => (
                      <p key={index}>
                        {binaryInput.split(format === 'continuous' ? '' : /\s+/)[index] || ''} → {decimalToUnicodeChar(code)} (U+{code.toString(16).toUpperCase().padStart(4, '0')})
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Convert binary to Unicode characters</li>
              <li>Supports continuous bits or space-separated bytes</li>
              <li>Reverse conversion from text to binary</li>
              <li>Shows decimal character codes and visualization</li>
              <li>Copy results to clipboard</li>
              <li>Example: "01001000 01100101" → "He"</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryToUnicode;