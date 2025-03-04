'use client';

import React, { useState } from 'react';

const TextToAscii = () => {
  const [text, setText] = useState('');
  const [asciiOutput, setAsciiOutput] = useState('');
  const [format, setFormat] = useState('decimal'); // decimal, hex, binary
  const [delimiter, setDelimiter] = useState('space'); // space, comma, custom
  const [customDelimiter, setCustomDelimiter] = useState('');
  const [reverseInput, setReverseInput] = useState('');
  const [reverseOutput, setReverseOutput] = useState('');
  const [error, setError] = useState('');

  const textToAscii = (input) => {
    setError('');
    if (!input) {
      setAsciiOutput('');
      return;
    }

    const codes = input.split('').map(char => char.charCodeAt(0));
    let formattedOutput;

    switch (format) {
      case 'decimal':
        formattedOutput = codes.join(getDelimiter());
        break;
      case 'hex':
        formattedOutput = codes.map(code => code.toString(16).toUpperCase().padStart(2, '0')).join(getDelimiter());
        break;
      case 'binary':
        formattedOutput = codes.map(code => code.toString(2).padStart(8, '0')).join(getDelimiter());
        break;
      default:
        formattedOutput = codes.join(getDelimiter());
    }

    setAsciiOutput(formattedOutput);
  };

  const asciiToText = (input) => {
    setError('');
    if (!input) {
      setReverseOutput('');
      return;
    }

    const delimiter = getDelimiter();
    const codes = input.split(delimiter).map(str => str.trim()).filter(Boolean);

    try {
      let textOutput;
      switch (format) {
        case 'decimal':
          textOutput = codes.map(code => String.fromCharCode(parseInt(code, 10))).join('');
          break;
        case 'hex':
          textOutput = codes.map(code => String.fromCharCode(parseInt(code, 16))).join('');
          break;
        case 'binary':
          textOutput = codes.map(code => String.fromCharCode(parseInt(code, 2))).join('');
          break;
        default:
          textOutput = codes.map(code => String.fromCharCode(parseInt(code, 10))).join('');
      }
      setReverseOutput(textOutput);
    } catch (err) {
      setError(`Invalid ${format} input: ${err.message}`);
      setReverseOutput('');
    }
  };

  const getDelimiter = () => {
    switch (delimiter) {
      case 'space':
        return ' ';
      case 'comma':
        return ', ';
      case 'custom':
        return customDelimiter || ' ';
      default:
        return ' ';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleTextChange = (value) => {
    setText(value);
    textToAscii(value);
  };

  const handleReverseChange = (value) => {
    setReverseInput(value);
    asciiToText(value);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Text to ASCII Converter
        </h1>

        <div className="grid gap-6">
          {/* Text to ASCII Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Input
              </label>
              <textarea
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Enter text to convert to ASCII"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Output Format
                </label>
                <select
                  value={format}
                  onChange={(e) => {
                    setFormat(e.target.value);
                    textToAscii(text);
                    asciiToText(reverseInput);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="decimal">Decimal</option>
                  <option value="hex">Hexadecimal</option>
                  <option value="binary">Binary</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delimiter
                </label>
                <select
                  value={delimiter}
                  onChange={(e) => {
                    setDelimiter(e.target.value);
                    textToAscii(text);
                    asciiToText(reverseInput);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="space">Space</option>
                  <option value="comma">Comma</option>
                  <option value="custom">Custom</option>
                </select>
                {delimiter === 'custom' && (
                  <input
                    type="text"
                    value={customDelimiter}
                    onChange={(e) => {
                      setCustomDelimiter(e.target.value);
                      textToAscii(text);
                      asciiToText(reverseInput);
                    }}
                    placeholder="Custom delimiter"
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ASCII Output
              </label>
              <div className="flex items-center gap-2">
                <textarea
                  value={asciiOutput}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 h-24"
                />
                <button
                  onClick={() => copyToClipboard(asciiOutput)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* ASCII to Text Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ASCII Input
              </label>
              <textarea
                value={reverseInput}
                onChange={(e) => handleReverseChange(e.target.value)}
                placeholder={`Enter ASCII codes (${format}, separated by ${getDelimiter().trim()})`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Output
              </label>
              <div className="flex items-center gap-2">
                <textarea
                  value={reverseOutput}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 h-24"
                />
                <button
                  onClick={() => copyToClipboard(reverseOutput)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

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
              <li>Convert text to ASCII (decimal, hex, binary)</li>
              <li>Convert ASCII back to text</li>
              <li>Customizable delimiter (space, comma, or custom)</li>
              <li>Copy output to clipboard</li>
              <li>Example: "Hi" → 72 105 (decimal), H 69 (hex), 1001000 1101001 (binary)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TextToAscii;