"use client";

import React, { useState, useCallback } from 'react';
import { FaCopy, FaDownload, FaSync, FaInfoCircle } from 'react-icons/fa';

const UnicodeConverter = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState('textToUnicode');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState({
    separator: ' ',
    prefix: 'U+',
    case: 'upper',
    includeDecimal: false,
  });

  const textToUnicode = useCallback((text) => {
    const codes = text.split('').map(char => {
      const code = char.charCodeAt(0);
      const hex = code.toString(16).padStart(4, '0');
      const formattedHex = options.case === 'upper' ? hex.toUpperCase() : hex.toLowerCase();
      return options.includeDecimal 
        ? `${options.prefix}${formattedHex} (${code})`
        : `${options.prefix}${formattedHex}`;
    });
    return codes.join(options.separator);
  }, [options]);

  const unicodeToText = useCallback((unicode) => {
    const codes = unicode.split(options.separator).map(code => {
      const cleanCode = code.replace(/\(.*\)/, '').trim(); // Remove decimal part if present
      const match = cleanCode.match(new RegExp(`${options.prefix}([0-9A-Fa-f]{4,})`, 'i'));
      if (!match) throw new Error(`Invalid Unicode format: ${code}`);
      return parseInt(match[1], 16);
    });
    return String.fromCodePoint(...codes);
  }, [options]);

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

  const handleDownload = () => {
    if (outputText) {
      const blob = new Blob([outputText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `unicode-${mode}-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setInputText('');
    setOutputText('');
    setError(null);
    setCopied(false);
  };

  const unicodeTable = [
    { char: 'A', code: 'U+0041', decimal: 65, description: 'Latin Capital Letter A' },
    { char: '<', code: 'U+003C', decimal: 60, description: 'Less-than Sign' },
    { char: 'π', code: 'U+03C0', decimal: 960, description: 'Greek Small Letter Pi' },
    { char: '💡', code: 'U+1F4A1', decimal: 128161, description: 'Light Bulb' },
    { char: ' ', code: 'U+0020', decimal: 32, description: 'Space' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center">
          Unicode Converter <FaInfoCircle className="ml-2 text-gray-500" title="Convert between text and Unicode" />
        </h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Input {mode === 'textToUnicode' ? 'Text' : 'Unicode'}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-40 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={mode === 'textToUnicode' 
                ? 'Hello World' 
                : 'U+0048 U+0065 U+006C U+006C U+006F U+0020 U+0057 U+006F U+0072 U+006C U+0064'}
              aria-label="Input Text or Unicode"
            />
          </div>

          {/* Conversion Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="textToUnicode">Text to Unicode</option>
                <option value="unicodeToText">Unicode to Text</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Separator</label>
              <select
                value={options.separator}
                onChange={(e) => setOptions(prev => ({ ...prev, separator: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value=" ">Space</option>
                <option value=",">Comma</option>
                <option value=";">Semicolon</option>
                <option value="\n">New Line</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prefix</label>
              <input
                value={options.prefix}
                onChange={(e) => setOptions(prev => ({ ...prev, prefix: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="U+"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Case</label>
              <select
                value={options.case}
                onChange={(e) => setOptions(prev => ({ ...prev, case: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="upper">Uppercase</option>
                <option value="lower">Lowercase</option>
              </select>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeDecimal}
                  onChange={(e) => setOptions(prev => ({ ...prev, includeDecimal: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Include Decimal Values</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              disabled={!inputText.trim()}
            >
              Convert
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Output */}
        {outputText && (
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-3">
              <h3 className="font-semibold text-gray-700">
                {mode === 'textToUnicode' ? 'Unicode Output' : 'Text Output'}
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  className={`py-2 px-4 rounded-lg transition-colors flex items-center ${
                    copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <FaCopy className="mr-2" /> {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleDownload}
                  className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
            <pre className="p-4 bg-gray-50 rounded-lg text-sm font-mono text-gray-800 whitespace-pre-wrap break-all border border-gray-200">
              {outputText}
            </pre>
          </div>
        )}

        {/* Unicode Reference Table */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-700 mb-3">Sample Unicode Characters</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600 border-collapse">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th className="p-3">Character</th>
                  <th className="p-3">Unicode</th>
                  <th className="p-3">Decimal</th>
                  <th className="p-3">Description</th>
                </tr>
              </thead>
              <tbody>
                {unicodeTable.map((entry, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono">{entry.char}</td>
                    <td className="p-3 font-mono">{entry.code}</td>
                    <td className="p-3 font-mono">{entry.decimal}</td>
                    <td className="p-3">{entry.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Convert text to Unicode (e.g., 'A' → U+0041) or Unicode to text (e.g., U+0041 → 'A'). Customize output with options above.
          </p>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert text to Unicode and vice versa</li>
            <li>Customizable separator (space, comma, etc.)</li>
            <li>Adjustable prefix and case</li>
            <li>Optional decimal value display</li>
            <li>Copy and download results</li>
            <li>Responsive design with reference table</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UnicodeConverter;