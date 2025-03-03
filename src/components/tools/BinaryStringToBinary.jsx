'use client';

import React, { useState } from 'react';

const BinaryStringToBinary = () => {
  const [inputString, setInputString] = useState('');
  const [binaryOutput, setBinaryOutput] = useState('');
  const [encoding, setEncoding] = useState('utf8'); // 'ascii' or 'utf8'
  const [bitLength, setBitLength] = useState(8); // Per character
  const [separator, setSeparator] = useState(' '); // Space or none
  const [reverseInput, setReverseInput] = useState('');
  const [reverseOutput, setReverseOutput] = useState('');
  const [error, setError] = useState('');

  const stringToBinary = (str) => {
    try {
      const encoder = new TextEncoder();
      const bytes = encoding === 'ascii' 
        ? new Uint8Array([...str].map(char => char.charCodeAt(0) & 0x7F))
        : encoder.encode(str);
      
      const binaryArray = Array.from(bytes).map(byte => 
        byte.toString(2).padStart(bitLength, '0')
      );
      
      return {
        binary: binaryArray.join(separator),
        breakdown: Array.from(bytes).map((byte, index) => ({
          char: str[index] || '',
          byte: byte,
          binary: byte.toString(2).padStart(bitLength, '0'),
          hex: byte.toString(16).toUpperCase().padStart(2, '0'),
        })),
      };
    } catch (err) {
      setError(`Conversion error: ${err.message}`);
      return { binary: '', breakdown: [] };
    }
  };

  const binaryToString = (binary) => {
    try {
      const cleanedBinary = binary.replace(new RegExp(separator, 'g'), '');
      if (!/^[01]+$/.test(cleanedBinary)) {
        throw new Error('Invalid binary input');
      }
      
      const byteLength = bitLength;
      const bytes = [];
      for (let i = 0; i < cleanedBinary.length; i += byteLength) {
        const byte = cleanedBinary.slice(i, i + byteLength);
        bytes.push(parseInt(byte, 2));
      }

      const decoder = new TextDecoder(encoding);
      const uint8Array = new Uint8Array(bytes);
      return decoder.decode(uint8Array);
    } catch (err) {
      setError(`Reverse conversion error: ${err.message}`);
      return '';
    }
  };

  const handleStringInput = (value) => {
    setInputString(value);
    setError('');
    const result = stringToBinary(value);
    setBinaryOutput(result.binary);
  };

  const handleBinaryInput = (value) => {
    setReverseInput(value);
    setError('');
    const result = binaryToString(value);
    setReverseOutput(result);
  };

  const handleConvert = () => {
    handleStringInput(inputString);
    handleBinaryInput(reverseInput);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary String to Binary Converter
        </h1>

        <div className="grid gap-6">
          {/* String to Binary Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text String
              </label>
              <input
                type="text"
                value={inputString}
                onChange={(e) => handleStringInput(e.target.value)}
                placeholder="Enter text (e.g., Hello)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Output
              </label>
              <textarea
                value={binaryOutput}
                readOnly
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none"
              />
            </div>
          </div>

          {/* Binary to String Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Input
              </label>
              <input
                type="text"
                value={reverseInput}
                onChange={(e) => handleBinaryInput(e.target.value)}
                placeholder="Enter binary (e.g., 01001000 01100101)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Output
              </label>
              <textarea
                value={reverseOutput}
                readOnly
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none"
              />
            </div>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Options</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Encoding
                </label>
                <select
                  value={encoding}
                  onChange={(e) => setEncoding(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ascii">ASCII (7-bit)</option>
                  <option value="utf8">UTF-8</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bit Length per Character
                </label>
                <select
                  value={bitLength}
                  onChange={(e) => setBitLength(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={7}>7-bit</option>
                  <option value={8}>8-bit</option>
                  <option value={16}>16-bit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Separator
                </label>
                <select
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value=" ">Space</option>
                  <option value="">None</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleConvert}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Convert
          </button>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Breakdown Section */}
          {inputString && binaryOutput && !error && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Character Breakdown:</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 py-1">Char</th>
                      <th className="px-2 py-1">Decimal</th>
                      <th className="px-2 py-1">Binary</th>
                      <th className="px-2 py-1">Hex</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stringToBinary(inputString).breakdown.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-2 py-1">{item.char || '(non-printable)'}</td>
                        <td className="px-2 py-1">{item.byte}</td>
                        <td className="px-2 py-1 font-mono">{item.binary}</td>
                        <td className="px-2 py-1 font-mono">{item.hex}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Convert text to binary and back</li>
              <li>Supports ASCII and UTF-8 encoding</li>
              <li>Customizable bit length (7, 8, 16)</li>
              <li>Optional separator between bytes</li>
              <li>Detailed character-by-character breakdown</li>
              <li>Example: "Hi" → 01001000 01101001 (UTF-8, 8-bit)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryStringToBinary;