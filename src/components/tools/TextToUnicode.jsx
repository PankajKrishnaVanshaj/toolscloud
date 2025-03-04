'use client';

import React, { useState } from 'react';

const TextToUnicode = () => {
  const [inputText, setInputText] = useState('');
  const [outputFormat, setOutputFormat] = useState('decimal'); // decimal, hex, html, unicode
  const [delimiter, setDelimiter] = useState('space'); // space, comma, none
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const textToUnicode = (text) => {
    return text.split('').map(char => char.charCodeAt(0));
  };

  const unicodeToText = (codes) => {
    try {
      const codeArray = codes.split(/[\s,]+/).map(code => {
        const num = parseInt(code, outputFormat === 'hex' ? 16 : 10);
        if (isNaN(num) || num < 0 || num > 0x10FFFF) throw new Error('Invalid Unicode code');
        return String.fromCharCode(num);
      });
      return codeArray.join('');
    } catch (err) {
      setError(`Invalid Unicode input: ${err.message}`);
      return '';
    }
  };

  const formatUnicode = (codes) => {
    switch (outputFormat) {
      case 'decimal':
        return codes.map(code => code.toString(10));
      case 'hex':
        return codes.map(code => `U+${code.toString(16).toUpperCase().padStart(4, '0')}`);
      case 'html':
        return codes.map(code => `&#${code};`);
      case 'unicode':
        return codes.map(code => `\\u${code.toString(16).toUpperCase().padStart(4, '0')}`);
      default:
        return codes.map(code => code.toString(10));
    }
  };

  const joinOutput = (formatted) => {
    switch (delimiter) {
      case 'space':
        return formatted.join(' ');
      case 'comma':
        return formatted.join(', ');
      case 'none':
        return formatted.join('');
      default:
        return formatted.join(' ');
    }
  };

  const handleTextInput = (text) => {
    setInputText(text);
    setError('');
    if (text.trim() === '') {
      setResult(null);
      return;
    }

    const codes = textToUnicode(text);
    const formatted = formatUnicode(codes);
    const output = joinOutput(formatted);

    setResult({
      text: text,
      codes: codes,
      formatted: output,
      characters: text.split('').map((char, i) => ({
        char,
        decimal: codes[i],
        hex: codes[i].toString(16).toUpperCase().padStart(4, '0'),
        html: `&#${codes[i]};`,
        unicode: `\\u${codes[i].toString(16).toUpperCase().padStart(4, '0')}`,
      })),
    });
  };

  const handleUnicodeInput = (codes) => {
    setError('');
    const text = unicodeToText(codes);
    setInputText(text);
    if (text) {
      handleTextInput(text);
    } else {
      setResult(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Text to Unicode Converter
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
                onChange={(e) => handleTextInput(e.target.value)}
                placeholder="Enter text to convert to Unicode"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unicode Codes
              </label>
              <textarea
                value={result?.formatted || ''}
                onChange={(e) => handleUnicodeInput(e.target.value)}
                placeholder="Enter Unicode codes to convert to text (e.g., 72 101 108 108 111)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Output Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => {
                    setOutputFormat(e.target.value);
                    if (inputText) handleTextInput(inputText);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="decimal">Decimal (e.g., 72)</option>
                  <option value="hex">Hex (e.g., U+0048)</option>
                  <option value="html">HTML Entity (e.g., &#72;)</option>
                  <option value="unicode">Unicode Escape (e.g., \u0048)</option>
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
                    if (inputText) handleTextInput(inputText);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="space">Space</option>
                  <option value="comma">Comma</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Results Section */}
          {result && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
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
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 border">Char</th>
                          <th className="p-2 border">Decimal</th>
                          <th className="p-2 border">Hex</th>
                          <th className="p-2 border">HTML</th>
                          <th className="p-2 border">Unicode</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.characters.map((charData, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="p-2 border">{charData.char}</td>
                            <td className="p-2 border">{charData.decimal}</td>
                            <td className="p-2 border">U+{charData.hex}</td>
                            <td className="p-2 border">{charData.html}</td>
                            <td className="p-2 border">{charData.unicode}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
              <li>Convert text to Unicode and back</li>
              <li>Multiple output formats: decimal, hex, HTML, Unicode escape</li>
              <li>Customizable delimiters (space, comma, none)</li>
              <li>Detailed character breakdown</li>
              <li>Copy formatted output to clipboard</li>
              <li>Supports all Unicode characters up to U+10FFFF</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TextToUnicode;