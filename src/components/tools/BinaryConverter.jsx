"use client";

import React, { useState } from 'react';

const BinaryConverter = () => {
  const [inputValue, setInputValue] = useState('');
  const [inputType, setInputType] = useState('binary');
  const [output, setOutput] = useState({ binary: '', decimal: '', hex: '', text: '' });
  const [error, setError] = useState(null);

  const inputTypes = [
    { value: 'binary', label: 'Binary' },
    { value: 'decimal', label: 'Decimal' },
    { value: 'hex', label: 'Hexadecimal' },
    { value: 'text', label: 'Text' }
  ];

  const convertValue = () => {
    setError(null);
    setOutput({ binary: '', decimal: '', hex: '', text: '' });

    if (!inputValue.trim()) {
      setError('Please enter a value to convert');
      return;
    }

    try {
      let binary = '';

      switch (inputType) {
        case 'binary':
          // Validate binary input
          if (!/^[01\s]+$/.test(inputValue)) {
            throw new Error('Invalid binary input: Use only 0s and 1s');
          }
          binary = inputValue.replace(/\s/g, ''); // Remove spaces
          break;
        case 'decimal':
          const decimalNum = parseInt(inputValue, 10);
          if (isNaN(decimalNum) || decimalNum < 0) {
            throw new Error('Invalid decimal input: Enter a positive number');
          }
          binary = decimalNum.toString(2);
          break;
        case 'hex':
          if (!/^[0-9A-Fa-f\s]+$/.test(inputValue)) {
            throw new Error('Invalid hex input: Use 0-9 and A-F');
          }
          const hexNum = parseInt(inputValue.replace(/\s/g, ''), 16);
          if (isNaN(hexNum)) {
            throw new Error('Invalid hex input');
          }
          binary = hexNum.toString(2);
          break;
        case 'text':
          binary = textToBinary(inputValue);
          break;
        default:
          throw new Error('Unknown input type');
      }

      const decimal = parseInt(binary, 2);
      const hex = decimal.toString(16).toUpperCase();
      const text = binaryToText(binary);

      setOutput({
        binary: formatBinary(binary),
        decimal: decimal.toString(),
        hex: hex,
        text: text
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const textToBinary = (text) => {
    return text
      .split('')
      .map(char => {
        const code = char.charCodeAt(0);
        return code.toString(2).padStart(8, '0');
      })
      .join('');
  };

  const binaryToText = (binary) => {
    const bytes = binary.match(/.{1,8}/g) || [];
    return bytes
      .map(byte => String.fromCharCode(parseInt(byte, 2)))
      .join('');
  };

  const formatBinary = (binary) => {
    // Add spaces every 8 bits for readability
    return binary.replace(/(.{8})/g, '$1 ').trim();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    convertValue();
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Binary Converter</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Type
              </label>
              <select
                value={inputType}
                onChange={(e) => setInputType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {inputTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Value
              </label>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full h-24 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={
                  inputType === 'binary' ? '01001000 01100101 01101100 01101100 01101111' :
                  inputType === 'decimal' ? '72 101 108 108 111' :
                  inputType === 'hex' ? '48 65 6C 6C 6F' :
                  'Hello'
                }
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Convert
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Output */}
        {output.binary && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-gray-700">Binary</h3>
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
                  {output.binary}
                </pre>
              </div>
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-gray-700">Decimal</h3>
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
                  {output.decimal}
                </pre>
              </div>
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-gray-700">Hexadecimal</h3>
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
                  {output.hex}
                </pre>
              </div>
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-gray-700">Text</h3>
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
                  {output.text}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {!output.binary && !error && (
          <div className="mt-4 text-sm text-gray-600">
            <p>Convert between binary, decimal, hexadecimal, and text formats.</p>
            <p className="mt-1">Examples:</p>
            <ul className="list-disc pl-5">
              <li>Binary: <code>01001000 01100101 01101100 01101100 01101111</code> = "Hello"</li>
              <li>Decimal: <code>72</code> = "H"</li>
              <li>Hex: <code>48</code> = "H"</li>
              <li>Text: <code>Hello</code></li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default BinaryConverter;