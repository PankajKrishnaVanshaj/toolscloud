'use client';

import React, { useState } from 'react';

const UnicodeToBinary = () => {
  const [inputText, setInputText] = useState('');
  const [bitLength, setBitLength] = useState(8); // 8-bit or 16-bit per character
  const [separator, setSeparator] = useState('space'); // Space, comma, or none
  const [outputFormat, setOutputFormat] = useState('binary'); // Binary, hex, or decimal
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const convertToBinary = (text, bits) => {
    return Array.from(text)
      .map(char => {
        const code = char.charCodeAt(0);
        return code.toString(2).padStart(bits, '0');
      });
  };

  const convertToHex = (text) => {
    return Array.from(text)
      .map(char => char.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase());
  };

  const convertToDecimal = (text) => {
    return Array.from(text)
      .map(char => char.charCodeAt(0).toString(10));
  };

  const formatOutput = (array) => {
    switch (separator) {
      case 'space': return array.join(' ');
      case 'comma': return array.join(', ');
      case 'none': return array.join('');
      default: return array.join(' ');
    }
  };

  const handleConvert = () => {
    setError('');
    setResult(null);

    if (!inputText.trim()) {
      setError('Please enter some text to convert');
      return;
    }

    try {
      let converted;
      switch (outputFormat) {
        case 'binary':
          converted = convertToBinary(inputText, bitLength);
          break;
        case 'hex':
          converted = convertToHex(inputText);
          break;
        case 'decimal':
          converted = convertToDecimal(inputText);
          break;
        default:
          converted = convertToBinary(inputText, bitLength);
      }

      const formattedOutput = formatOutput(converted);

      setResult({
        characters: Array.from(inputText),
        converted: converted,
        formatted: formattedOutput,
      });
    } catch (err) {
      setError(`Conversion failed: ${err.message}`);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Unicode to Binary Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Text
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to convert (e.g., Hello)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bit Length (for Binary)
                </label>
                <select
                  value={bitLength}
                  onChange={(e) => setBitLength(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
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
                  <option value="space">Space</option>
                  <option value="comma">Comma</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Output Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="binary">Binary</option>
                  <option value="hex">Hexadecimal</option>
                  <option value="decimal">Decimal</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleConvert}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Convert
            </button>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Results Section */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Conversion Results:</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium">Formatted Output:</p>
                  <div className="flex items-center gap-2">
                    <p className="break-all">{result.formatted}</p>
                    <button
                      onClick={() => copyToClipboard(result.formatted)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <p className="font-medium">Character Breakdown:</p>
                  <div className="grid gap-2">
                    {result.characters.map((char, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-8 text-center">"{char}"</span>
                        <span className="font-mono">{result.converted[index]}</span>
                        <span className="text-gray-500">(U+{char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')})</span>
                      </div>
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
              <li>Convert Unicode text to binary, hex, or decimal</li>
              <li>Supports 8-bit or 16-bit per character (binary only)</li>
              <li>Customizable separator (space, comma, none)</li>
              <li>Detailed character-by-character breakdown</li>
              <li>Copy results to clipboard</li>
              <li>Example: "Hi" → 01001000 01101001 (8-bit binary)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default UnicodeToBinary;