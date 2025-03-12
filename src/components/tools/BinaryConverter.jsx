"use client";

import React, { useState, useCallback } from 'react';
import { FaCopy, FaDownload, FaSync } from 'react-icons/fa';

const BinaryConverter = () => {
  const [inputValue, setInputValue] = useState('');
  const [inputType, setInputType] = useState('binary');
  const [output, setOutput] = useState({ binary: '', decimal: '', hex: '', text: '' });
  const [error, setError] = useState(null);
  const [options, setOptions] = useState({
    spaceEvery8: true,
    uppercaseHex: true,
    includeSpaces: false,
  });
  const [history, setHistory] = useState([]);

  const inputTypes = [
    { value: 'binary', label: 'Binary' },
    { value: 'decimal', label: 'Decimal' },
    { value: 'hex', label: 'Hexadecimal' },
    { value: 'text', label: 'Text' },
  ];

  const convertValue = useCallback(() => {
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
          if (!/^[01\s]+$/.test(inputValue)) {
            throw new Error('Invalid binary input: Use only 0s and 1s');
          }
          binary = inputValue.replace(/\s/g, '');
          break;
        case 'decimal':
          const decimalNum = parseInt(inputValue.replace(/\s/g, ''), 10);
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
      const hex = decimal.toString(16);
      const text = binaryToText(binary);

      const formattedBinary = options.spaceEvery8 ? formatBinary(binary) : binary;
      const formattedHex = options.uppercaseHex ? hex.toUpperCase() : hex;

      const result = {
        binary: formattedBinary,
        decimal: options.includeSpaces ? decimal.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ') : decimal.toString(),
        hex: options.includeSpaces ? formattedHex.match(/.{1,2}/g)?.join(' ') || formattedHex : formattedHex,
        text,
      };

      setOutput(result);
      setHistory(prev => [...prev, { input: inputValue, type: inputType, output: result }].slice(-5));
    } catch (err) {
      setError(err.message);
    }
  }, [inputValue, inputType, options]);

  const textToBinary = (text) => {
    return text
      .split('')
      .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join('');
  };

  const binaryToText = (binary) => {
    const bytes = binary.match(/.{1,8}/g) || [];
    return bytes.map(byte => String.fromCharCode(parseInt(byte, 2))).join('');
  };

  const formatBinary = (binary) => {
    return binary.replace(/(.{8})/g, '$1 ').trim();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    convertValue();
  };

  const handleCopy = (value) => {
    navigator.clipboard.writeText(value);
    alert('Copied to clipboard!');
  };

  const handleDownload = () => {
    const content = JSON.stringify(output, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `conversion-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setInputValue('');
    setOutput({ binary: '', decimal: '', hex: '', text: '' });
    setError(null);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Binary Converter</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Input Type</label>
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
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Input Value</label>
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

          {/* Conversion Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.spaceEvery8}
                  onChange={(e) => setOptions(prev => ({ ...prev, spaceEvery8: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Space every 8 bits</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.uppercaseHex}
                  onChange={(e) => setOptions(prev => ({ ...prev, uppercaseHex: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Uppercase Hex</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeSpaces}
                  onChange={(e) => setOptions(prev => ({ ...prev, includeSpaces: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Include Spaces</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Convert
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Output */}
        {output.binary && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(output).map(([key, value]) => (
                <div key={key} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-700 capitalize">{key}</h3>
                    <button
                      onClick={() => handleCopy(value)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Copy to clipboard"
                    >
                      <FaCopy />
                    </button>
                  </div>
                  <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
                    {value}
                  </pre>
                </div>
              ))}
            </div>
            <button
              onClick={handleDownload}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Results
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3">Conversion History (Last 5)</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{`${entry.type}: ${entry.input.slice(0, 20)}${entry.input.length > 20 ? '...' : ''}`}</span>
                  <button
                    onClick={() => {
                      setInputValue(entry.input);
                      setInputType(entry.type);
                      setOutput(entry.output);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert between Binary, Decimal, Hex, and Text</li>
            <li>Custom formatting options</li>
            <li>Copy individual outputs</li>
            <li>Download results as JSON</li>
            <li>History tracking (last 5 conversions)</li>
            <li>Responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryConverter;