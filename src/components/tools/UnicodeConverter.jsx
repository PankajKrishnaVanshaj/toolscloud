"use client";

import React, { useState } from 'react';

const UnicodeConverter = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState('textToUnicode'); // 'textToUnicode' or 'unicodeToText'
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const textToUnicode = (text) => {
    return text
      .split('')
      .map(char => {
        const code = char.charCodeAt(0);
        return `U+${code.toString(16).toUpperCase().padStart(4, '0')}`;
      })
      .join(' ');
  };

  const unicodeToText = (unicode) => {
    const codes = unicode.split(/\s+/).map(code => {
      const match = code.match(/U\+([0-9A-Fa-f]{4,})/i);
      if (!match) throw new Error(`Invalid Unicode format: ${code}`);
      return parseInt(match[1], 16);
    });
    return String.fromCodePoint(...codes);
  };

  const processText = () => {
    setError(null);
    setOutputText('');
    setCopied(false);

    if (!inputText.trim()) {
      setError('Please enter some text or Unicode values');
      return;
    }

    try {
      const result = mode === 'textToUnicode' 
        ? textToUnicode(inputText) 
        : unicodeToText(inputText);
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

  // Sample Unicode characters for reference
  const unicodeTable = [
    { char: 'A', code: 'U+0041', description: 'Latin Capital Letter A' },
    { char: '<', code: 'U+003C', description: 'Less-than Sign' },
    { char: 'π', code: 'U+03C0', description: 'Greek Small Letter Pi' },
    { char: '💡', code: 'U+1F4A1', description: 'Light Bulb' },
    { char: ' ', code: 'U+0020', description: 'Space' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Unicode Converter</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Input {mode === 'textToUnicode' ? 'Text' : 'Unicode'}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={mode === 'textToUnicode' 
                ? 'Hello World' 
                : 'U+0048 U+0065 U+006C U+006C U+006F U+0020 U+0057 U+006F U+0072 U+006C U+0064'}
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
                <option value="textToUnicode">Text to Unicode</option>
                <option value="unicodeToText">Unicode to Text</option>
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
                {mode === 'textToUnicode' ? 'Unicode Output' : 'Text Output'}
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

        {/* Unicode Reference Table */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-700 mb-2">Sample Unicode Characters</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Character</th>
                  <th className="px-4 py-2">Unicode</th>
                  <th className="px-4 py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                {unicodeTable.map((entry, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2 font-mono">{entry.char}</td>
                    <td className="px-4 py-2 font-mono">{entry.code}</td>
                    <td className="px-4 py-2">{entry.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Enter text to convert to Unicode (e.g., 'A' → U+0041) or Unicode codes to convert to text (e.g., U+0041 → 'A').
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnicodeConverter;