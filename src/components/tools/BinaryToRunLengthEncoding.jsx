'use client';

import React, { useState } from 'react';

const BinaryToRunLengthEncoding = () => {
  const [binaryInput, setBinaryInput] = useState('');
  const [rleOutput, setRleOutput] = useState('');
  const [decodedBinary, setDecodedBinary] = useState('');
  const [separator, setSeparator] = useState(' '); // Default separator
  const [error, setError] = useState('');
  const [compressionRatio, setCompressionRatio] = useState(null);

  // Validate binary input
  const validateBinary = (binary) => {
    return /^[01]+$/.test(binary);
  };

  // Encode binary to RLE
  const encodeRLE = (binary) => {
    if (!binary) return '';
    let result = '';
    let count = 1;
    let current = binary[0];

    for (let i = 1; i < binary.length; i++) {
      if (binary[i] === current) {
        count++;
      } else {
        result += `${count}${current}${separator}`;
        count = 1;
        current = binary[i];
      }
    }
    result += `${count}${current}`;
    return result;
  };

  // Decode RLE to binary
  const decodeRLE = (rle) => {
    if (!rle) return '';
    const parts = rle.split(separator).filter(part => part);
    let result = '';

    for (const part of parts) {
      const match = part.match(/^(\d+)([0-1])$/);
      if (!match) {
        setError(`Invalid RLE format in part: ${part}`);
        return '';
      }
      const count = parseInt(match[1]);
      const bit = match[2];
      result += bit.repeat(count);
    }
    return result;
  };

  // Calculate compression ratio
  const calculateCompressionRatio = (binary, rle) => {
    if (!binary || !rle) return null;
    const binaryLength = binary.length;
    const rleLength = rle.length;
    return ((binaryLength - rleLength) / binaryLength * 100).toFixed(2);
  };

  // Handle binary input
  const handleBinaryInput = (value) => {
    setBinaryInput(value);
    setError('');
    setRleOutput('');
    setDecodedBinary('');
    setCompressionRatio(null);

    if (value) {
      if (validateBinary(value)) {
        const rle = encodeRLE(value);
        setRleOutput(rle);
        setDecodedBinary(decodeRLE(rle));
        setCompressionRatio(calculateCompressionRatio(value, rle));
      } else {
        setError('Invalid binary input: Use only 0s and 1s');
      }
    }
  };

  // Handle RLE input
  const handleRleInput = (value) => {
    setRleOutput(value);
    setError('');
    setBinaryInput('');
    setDecodedBinary('');
    setCompressionRatio(null);

    if (value) {
      const decoded = decodeRLE(value);
      if (decoded) {
        setDecodedBinary(decoded);
        setBinaryInput(decoded);
        setCompressionRatio(calculateCompressionRatio(decoded, value));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary to Run-Length Encoding Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Input
              </label>
              <input
                type="text"
                value={binaryInput}
                onChange={(e) => handleBinaryInput(e.target.value)}
                placeholder="e.g., 00001111"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RLE Output
              </label>
              <input
                type="text"
                value={rleOutput}
                onChange={(e) => handleRleInput(e.target.value)}
                placeholder="e.g., 40 41"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Separator
              </label>
              <input
                type="text"
                value={separator}
                onChange={(e) => setSeparator(e.target.value || ' ')}
                placeholder="Separator (default: space)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={1}
              />
            </div>
          </div>

          {/* Results Section */}
          {(binaryInput || rleOutput) && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Original Binary:</span> {binaryInput || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">RLE Encoded:</span> {rleOutput || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Decoded Binary:</span> {decodedBinary || 'N/A'}
                </p>
                {compressionRatio && (
                  <p>
                    <span className="font-medium">Compression Ratio:</span> {compressionRatio}%{' '}
                    {compressionRatio > 0 ? '(space saved)' : '(space increased)'}
                  </p>
                )}
                <div>
                  <p className="font-medium">Visualization:</p>
                  <div className="font-mono text-xs break-all">
                    <p>Binary: {binaryInput}</p>
                    <p>RLE: {rleOutput}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Encode binary to Run-Length Encoding (RLE)</li>
              <li>Decode RLE back to binary</li>
              <li>Customizable separator (default: space)</li>
              <li>Calculates compression ratio</li>
              <li>Visualizes the encoding process</li>
              <li>Example: 00001111 → 40 41 (4 zeros, 4 ones)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryToRunLengthEncoding;