"use client";

import React, { useState } from 'react';

const HexConverter = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('textToHex'); // 'textToHex', 'hexToText', 'hexToDecimal', 'decimalToHex'
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const textToHex = (text) => {
    return text
      .split('')
      .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(' ');
  };

  const hexToText = (hex) => {
    const hexArray = hex.replace(/\s+/g, '').match(/.{1,2}/g);
    if (!hexArray || hexArray.some(h => !/^[0-9A-Fa-f]{2}$/.test(h))) {
      throw new Error('Invalid hex format');
    }
    return hexArray.map(h => String.fromCharCode(parseInt(h, 16))).join('');
  };

  const hexToDecimal = (hex) => {
    const cleanHex = hex.replace(/\s+/g, '');
    if (!/^[0-9A-Fa-f]+$/.test(cleanHex)) {
      throw new Error('Invalid hex format');
    }
    return parseInt(cleanHex, 16).toString(10);
  };

  const decimalToHex = (decimal) => {
    if (!/^-?\d+$/.test(decimal)) {
      throw new Error('Invalid decimal format');
    }
    const num = parseInt(decimal, 10);
    return num >= 0 
      ? num.toString(16).toUpperCase() 
      : (-num).toString(16).toUpperCase().padStart(2, '0') + ' (negative)';
  };

  const convert = () => {
    setError(null);
    setOutput('');
    setCopied(false);

    if (!input.trim()) {
      setError('Please enter a value to convert');
      return;
    }

    try {
      let result;
      switch (mode) {
        case 'textToHex':
          result = textToHex(input);
          break;
        case 'hexToText':
          result = hexToText(input);
          break;
        case 'hexToDecimal':
          result = hexToDecimal(input);
          break;
        case 'decimalToHex':
          result = decimalToHex(input);
          break;
        default:
          result = '';
      }
      setOutput(result);
    } catch (err) {
      setError('Conversion error: ' + err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    convert();
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Hex Converter</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Input
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={
                mode === 'textToHex' ? 'Hello' :
                mode === 'hexToText' ? '48 65 6C 6C 6F' :
                mode === 'hexToDecimal' ? 'FF' :
                '255'
              }
            />
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conversion Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="textToHex">Text to Hex</option>
                <option value="hexToText">Hex to Text</option>
                <option value="hexToDecimal">Hex to Decimal</option>
                <option value="decimalToHex">Decimal to Hex</option>
              </select>
            </div>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Convert
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Output */}
        {output && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Output</h3>
              <button
                onClick={handleCopy}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="p-4 bg-gray-50 rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
              {output}
            </pre>
          </div>
        )}

        {/* Notes */}
        <div className="mt-6 text-sm text-gray-600">
          <p>Convert between text, hexadecimal, and decimal values:</p>
          <ul className="list-disc pl-5">
            <li>Text to Hex: Converts each character to its hex value (e.g., "A" → "41")</li>
            <li>Hex to Text: Converts hex bytes to characters (e.g., "41" → "A")</li>
            <li>Hex to Decimal: Converts hex to base-10 (e.g., "FF" → "255")</li>
            <li>Decimal to Hex: Converts base-10 to hex (e.g., "255" → "FF")</li>
          </ul>
          <p className="mt-2">
            Note: Hex input can be space-separated (e.g., "48 65") or continuous (e.g., "4865").
          </p>
        </div>
      </div>
    </div>
  );
};

export default HexConverter;