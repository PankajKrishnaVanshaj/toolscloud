'use client';

import React, { useState } from 'react';

const AsciiToText = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('asciiToText'); // 'asciiToText' or 'textToAscii'
  const [format, setFormat] = useState('decimal'); // 'decimal', 'hex', 'binary'
  const [separator, setSeparator] = useState(' '); // Space, comma, etc.
  const [error, setError] = useState('');

  const asciiToText = (inputStr) => {
    setError('');
    const values = inputStr.trim().split(separator).filter(Boolean);
    
    if (values.length === 0) {
      setError('No input provided');
      return '';
    }

    try {
      const chars = values.map(value => {
        let num;
        switch (format) {
          case 'decimal':
            num = parseInt(value, 10);
            break;
          case 'hex':
            num = parseInt(value, 16);
            break;
          case 'binary':
            num = parseInt(value, 2);
            break;
          default:
            throw new Error('Invalid format');
        }
        if (isNaN(num) || num < 0 || num > 255) {
          throw new Error(`Invalid ${format} value: ${value}`);
        }
        return String.fromCharCode(num);
      });
      return chars.join('');
    } catch (err) {
      setError(err.message);
      return '';
    }
  };

  const textToAscii = (text) => {
    setError('');
    if (!text) {
      setError('No input provided');
      return '';
    }

    const chars = text.split('');
    const values = chars.map(char => {
      const code = char.charCodeAt(0);
      switch (format) {
        case 'decimal':
          return code;
        case 'hex':
          return code.toString(16).toUpperCase().padStart(2, '0');
        case 'binary':
          return code.toString(2).padStart(8, '0');
        default:
          return code;
      }
    });
    return values.join(separator);
  };

  const handleConvert = () => {
    if (mode === 'asciiToText') {
      setOutput(asciiToText(input));
    } else {
      setOutput(textToAscii(input));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setInput(event.target.result);
        handleConvert();
      };
      reader.readAsText(file);
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ascii_${mode === 'asciiToText' ? 'text' : format}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          ASCII to Text Converter
        </h1>

        <div className="grid gap-6">
          {/* Mode and Format Selection */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conversion Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="asciiToText">ASCII to Text</option>
                <option value="textToAscii">Text to ASCII</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {mode === 'asciiToText' ? 'Input Format' : 'Output Format'}
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="decimal">Decimal</option>
                <option value="hex">Hexadecimal</option>
                <option value="binary">Binary</option>
              </select>
            </div>
          </div>

          {/* Separator and Input */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Separator (for ASCII input/output)
              </label>
              <input
                type="text"
                value={separator}
                onChange={(e) => setSeparator(e.target.value || ' ')}
                placeholder="e.g., space, comma"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {mode === 'asciiToText' ? 'ASCII Input' : 'Text Input'}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'asciiToText' 
                  ? `Enter ${format} ASCII codes (e.g., 72 101 108 108 111)` 
                  : 'Enter text (e.g., Hello)'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleConvert}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Convert
            </button>
            <label className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-center cursor-pointer">
              Upload File
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".txt"
              />
            </label>
            <button
              onClick={handleDownload}
              disabled={!output}
              className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-purple-300"
            >
              Download Output
            </button>
          </div>

          {/* Output */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Output:</h2>
            <textarea
              value={output}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 h-32"
            />
          </div>

          {/* Error */}
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
              <li>Convert ASCII codes to text and text to ASCII</li>
              <li>Supports decimal, hex, and binary formats</li>
              <li>Custom separator for ASCII input/output</li>
              <li>File upload for bulk conversion</li>
              <li>Download output as text file</li>
              <li>Example: "72 101 108 108 111" → "Hello" (decimal)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default AsciiToText;