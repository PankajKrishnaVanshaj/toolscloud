"use client";

import React, { useState, useCallback } from 'react';
import { FaCopy, FaDownload, FaSync, FaTable } from 'react-icons/fa';

const ASCIIConverter = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState('textToASCII');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState({
    separator: ' ',
    range: 'standard', // 'standard' (0-127) or 'extended' (0-255)
    format: 'decimal', // 'decimal', 'hex', 'binary'
  });
  const [showTable, setShowTable] = useState(false);

  const textToASCII = useCallback((text) => {
    const maxValue = options.range === 'standard' ? 127 : 255;
    return text
      .split('')
      .map(char => {
        const code = char.charCodeAt(0);
        if (code > maxValue) throw new Error(`Character '${char}' exceeds ${options.range} range (${maxValue})`);
        return options.format === 'hex' 
          ? code.toString(16).padStart(2, '0').toUpperCase()
          : options.format === 'binary' 
          ? code.toString(2).padStart(8, '0')
          : code.toString();
      })
      .join(options.separator);
  }, [options]);

  const asciiToText = useCallback((ascii) => {
    const maxValue = options.range === 'standard' ? 127 : 255;
    const codes = ascii.split(options.separator).map(code => {
      const num = options.format === 'hex' 
        ? parseInt(code, 16) 
        : options.format === 'binary' 
        ? parseInt(code, 2) 
        : parseInt(code, 10);
      if (isNaN(num) || num < 0 || num > maxValue) {
        throw new Error(`Invalid ${options.format} code: ${code} (must be 0-${maxValue})`);
      }
      return num;
    });
    return String.fromCharCode(...codes);
  }, [options]);

  const processText = () => {
    setError(null);
    setOutputText('');
    setCopied(false);

    if (!inputText.trim()) {
      setError('Please enter some text or codes');
      return;
    }

    try {
      const result = mode === 'textToASCII' 
        ? textToASCII(inputText) 
        : asciiToText(inputText);
      setOutputText(result);
    } catch (err) {
      setError('Error: ' + err.message);
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
      link.download = `ascii-${mode}-${Date.now()}.txt`;
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

  const asciiTable = Array.from({ length: options.range === 'standard' ? 128 : 256 }, (_, i) => ({
    code: i,
    char: String.fromCharCode(i),
    hex: i.toString(16).padStart(2, '0').toUpperCase(),
    binary: i.toString(2).padStart(8, '0'),
  })).filter(entry => entry.char.trim() || entry.code === 32);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">ASCII Converter</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Input {mode === 'textToASCII' ? 'Text' : `${options.format.toUpperCase()} Codes`}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-32 sm:h-48 p-4 border border-gray-300 rounded-lg resize-y focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder={mode === 'textToASCII' 
                ? 'Hello World' 
                : options.format === 'hex' 
                ? '48 65 6C 6C 6F 20 57 6F 72 6C 64' 
                : options.format === 'binary' 
                ? '01001000 01100101 01101100 01101100 01101111 00100000 01010111 01101111 01110010 01101100 01100100' 
                : '72 101 108 108 111 32 87 111 114 108 100'}
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="textToASCII">Text to ASCII</option>
                <option value="asciiToText">ASCII to Text</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <select
                value={options.format}
                onChange={(e) => setOptions(prev => ({ ...prev, format: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="decimal">Decimal</option>
                <option value="hex">Hexadecimal</option>
                <option value="binary">Binary</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Range</label>
              <select
                value={options.range}
                onChange={(e) => setOptions(prev => ({ ...prev, range: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="standard">Standard (0-127)</option>
                <option value="extended">Extended (0-255)</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Separator</label>
              <input
                type="text"
                value={options.separator}
                onChange={(e) => setOptions(prev => ({ ...prev, separator: e.target.value || ' ' }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Space by default"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Convert
            </button>
            <button
              onClick={handleCopy}
              disabled={!outputText}
              className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                copied ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } ${!outputText && 'opacity-50 cursor-not-allowed'}`}
            >
              <FaCopy className="mr-2" /> {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              disabled={!outputText}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Output */}
        {outputText && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-700 mb-2">
              {mode === 'textToASCII' ? `${options.format.toUpperCase()} Codes` : 'Text Output'}
            </h3>
            <pre className="p-4 bg-gray-50 rounded-lg text-sm font-mono text-gray-800 whitespace-pre-wrap break-all border border-gray-200">
              {outputText}
            </pre>
          </div>
        )}

        {/* ASCII Table */}
        <div className="mt-6">
          <button
            onClick={() => setShowTable(!showTable)}
            className="w-full py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            <FaTable className="mr-2" /> {showTable ? 'Hide' : 'Show'} ASCII Table
          </button>
          {showTable && (
            <div className="mt-4 overflow-x-auto max-h-64 border border-gray-200 rounded-lg">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-2">Dec</th>
                    <th className="px-4 py-2">Hex</th>
                    <th className="px-4 py-2">Bin</th>
                    <th className="px-4 py-2">Char</th>
                  </tr>
                </thead>
                <tbody>
                  {asciiTable.map((entry, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2 font-mono">{entry.code}</td>
                      <td className="px-4 py-2 font-mono">{entry.hex}</td>
                      <td className="px-4 py-2 font-mono">{entry.binary}</td>
                      <td className="px-4 py-2 font-mono">
                        {entry.char.trim() ? entry.char : entry.code === 32 ? 'SPACE' : '\\n'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert text to ASCII and vice versa</li>
            <li>Support for decimal, hex, and binary formats</li>
            <li>Standard (0-127) and extended (0-255) ranges</li>
            <li>Customizable separator</li>
            <li>Copy and download results</li>
            <li>Full ASCII table reference</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ASCIIConverter;