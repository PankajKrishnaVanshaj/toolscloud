"use client";

import React, { useState } from 'react';

const ASCIIConverter = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState('textToASCII'); // 'textToASCII' or 'asciiToText'
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const textToASCII = (text) => {
    return text
      .split('')
      .map(char => char.charCodeAt(0))
      .join(' ');
  };

  const asciiToText = (ascii) => {
    const codes = ascii.split(/\s+/).map(code => {
      const num = parseInt(code, 10);
      if (isNaN(num) || num < 0 || num > 127) {
        throw new Error(`Invalid ASCII code: ${code} (must be 0-127)`);
      }
      return num;
    });
    return String.fromCharCode(...codes);
  };

  const processText = () => {
    setError(null);
    setOutputText('');
    setCopied(false);

    if (!inputText.trim()) {
      setError('Please enter some text or ASCII codes');
      return;
    }

    try {
      const result = mode === 'textToASCII' 
        ? textToASCII(inputText) 
        : asciiToText(inputText);
      setOutputText(result);
    } catch (err) {
      setError('Error processing input: ' + err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    processText();
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Common ASCII characters for reference
  const asciiTable = [
    { char: 'A', code: 65, description: 'Uppercase A' },
    { char: 'a', code: 97, description: 'Lowercase a' },
    { char: '0', code: 48, description: 'Digit 0' },
    { char: ' ', code: 32, description: 'Space' },
    { char: '@', code: 64, description: 'At sign' },
    { char: '\n', code: 10, description: 'Line Feed (LF)' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">ASCII Converter</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Input {mode === 'textToASCII' ? 'Text' : 'ASCII Codes'}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={mode === 'textToASCII' 
                ? 'Hello World' 
                : '72 101 108 108 111 32 87 111 114 108 100'}
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
                <option value="textToASCII">Text to ASCII</option>
                <option value="asciiToText">ASCII to Text</option>
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
        {outputText && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">
                {mode === 'textToASCII' ? 'ASCII Codes' : 'Text Output'}
              </h3>
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
              {outputText}
            </pre>
          </div>
        )}

        {/* ASCII Reference Table */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-700 mb-2">Common ASCII Characters</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Character</th>
                  <th className="px-4 py-2">ASCII Code</th>
                  <th className="px-4 py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                {asciiTable.map((entry, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2 font-mono">
                      {entry.char === '\n' ? '\\n' : entry.char}
                    </td>
                    <td className="px-4 py-2 font-mono">{entry.code}</td>
                    <td className="px-4 py-2">{entry.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Enter text to convert to ASCII codes (e.g., 'A' → 65) or space-separated ASCII codes to convert to text (e.g., 65 → 'A'). Valid range: 0-127.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ASCIIConverter;