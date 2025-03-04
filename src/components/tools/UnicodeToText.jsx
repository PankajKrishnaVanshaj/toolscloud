'use client';

import React, { useState } from 'react';

const UnicodeToText = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('toText'); // 'toText' or 'toUnicode'
  const [format, setFormat] = useState('U+XXXX'); // 'U+XXXX', 'decimal', 'hex'
  const [delimiter, setDelimiter] = useState(' '); // Space, comma, newline, custom
  const [customDelimiter, setCustomDelimiter] = useState('');
  const [error, setError] = useState('');

  const convertToText = (inputStr) => {
    setError('');
    const values = inputStr.trim().split(getDelimiter());
    
    try {
      const result = values.map(value => {
        if (!value) return '';
        
        let codePoint;
        if (format === 'U+XXXX') {
          const match = value.match(/^U\+([0-9A-Fa-f]{4,6})$/);
          if (!match) throw new Error(`Invalid Unicode format: ${value}`);
          codePoint = parseInt(match[1], 16);
        } else if (format === 'decimal') {
          codePoint = parseInt(value, 10);
        } else if (format === 'hex') {
          codePoint = parseInt(value, 16);
        }

        if (isNaN(codePoint) || codePoint < 0 || codePoint > 0x10FFFF) {
          throw new Error(`Invalid code point: ${value}`);
        }
        
        return String.fromCodePoint(codePoint);
      }).join('');
      
      setOutput(result);
    } catch (err) {
      setError(err.message);
      setOutput('');
    }
  };

  const convertToUnicode = (inputStr) => {
    setError('');
    const chars = inputStr.split('');
    
    try {
      const result = chars.map(char => {
        const codePoint = char.codePointAt(0);
        if (format === 'U+XXXX') {
          return `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;
        } else if (format === 'decimal') {
          return codePoint.toString(10);
        } else if (format === 'hex') {
          return codePoint.toString(16).toUpperCase();
        }
      }).join(getDelimiter());
      
      setOutput(result);
    } catch (err) {
      setError(err.message);
      setOutput('');
    }
  };

  const getDelimiter = () => {
    return delimiter === 'custom' && customDelimiter ? customDelimiter : delimiter === 'newline' ? '\n' : delimiter;
  };

  const handleConvert = () => {
    if (!input.trim()) {
      setError('Please enter some input');
      setOutput('');
      return;
    }
    
    if (mode === 'toText') {
      convertToText(input);
    } else {
      convertToUnicode(input);
    }
  };

  const handleSwap = () => {
    setInput(output);
    setOutput('');
    setMode(mode === 'toText' ? 'toUnicode' : 'toText');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Unicode to Text Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {mode === 'toText' ? 'Unicode Input' : 'Text Input'}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'toText' 
                  ? 'e.g., U+0041 U+0042 or 65 66' 
                  : 'e.g., AB'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="grid gap-2">
                <label className="block text-sm font-medium text-gray-700">
                  Conversion Mode
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="toText">Unicode to Text</option>
                  <option value="toUnicode">Text to Unicode</option>
                </select>
              </div>
              <button
                onClick={handleSwap}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
              >
                Swap
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="U+XXXX">U+XXXX (e.g., U+0041)</option>
                  <option value="decimal">Decimal (e.g., 65)</option>
                  <option value="hex">Hex (e.g., 41)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delimiter
                </label>
                <select
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value=" ">Space</option>
                  <option value=",">Comma</option>
                  <option value="newline">Newline</option>
                  <option value="custom">Custom</option>
                </select>
                {delimiter === 'custom' && (
                  <input
                    type="text"
                    value={customDelimiter}
                    onChange={(e) => setCustomDelimiter(e.target.value)}
                    placeholder="Custom delimiter"
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            </div>

            <button
              onClick={handleConvert}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Convert
            </button>
          </div>

          {/* Output Section */}
          {output && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Output:</h2>
              <pre className="text-sm whitespace-pre-wrap break-all">{output}</pre>
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
              <li>Convert between Unicode code points and text</li>
              <li>Supports U+XXXX, decimal, and hex formats</li>
              <li>Multiple delimiter options (space, comma, newline, custom)</li>
              <li>Bulk conversion for multiple values</li>
              <li>Swap input/output with one click</li>
              <li>Example: U+0041 U+0042 → AB</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default UnicodeToText;