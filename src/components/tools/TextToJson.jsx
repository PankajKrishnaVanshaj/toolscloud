'use client';

import React, { useState } from 'react';

const TextToJson = () => {
  const [inputText, setInputText] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [format, setFormat] = useState('auto'); // auto, csv, kv (key-value)
  const [delimiter, setDelimiter] = useState(','); // For CSV
  const [prettyPrint, setPrettyPrint] = useState(true);
  const [error, setError] = useState('');

  const detectFormat = (text) => {
    if (!text.trim()) return 'auto';
    if (text.includes(',') && text.split('\n').length > 1) return 'csv';
    if (text.includes('=') || text.includes(':')) return 'kv';
    return 'plain';
  };

  const parseTextToJson = () => {
    setError('');
    setJsonOutput('');

    if (!inputText.trim()) {
      setError('Please enter some text to convert');
      return;
    }

    let detectedFormat = format === 'auto' ? detectFormat(inputText) : format;
    let result;

    try {
      switch (detectedFormat) {
        case 'csv':
          result = parseCSV(inputText);
          break;
        case 'kv':
          result = parseKeyValue(inputText);
          break;
        case 'plain':
          result = { text: inputText.trim() };
          break;
        default:
          throw new Error('Unable to detect text format');
      }

      setJsonOutput(prettyPrint ? JSON.stringify(result, null, 2) : JSON.stringify(result));
    } catch (err) {
      setError(`Conversion failed: ${err.message}`);
    }
  };

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(delimiter).map(h => h.trim());
    const data = lines.slice(1).map(line => {
      const values = line.split(delimiter).map(v => v.trim());
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index] || '';
        return obj;
      }, {});
    });
    return data;
  };

  const parseKeyValue = (text) => {
    const lines = text.trim().split('\n');
    const result = {};
    lines.forEach(line => {
      const [key, value] = line.includes('=') 
        ? line.split('=')
        : line.split(':');
      if (key && value) {
        result[key.trim()] = value.trim();
      }
    });
    return result;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    parseTextToJson();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonOutput);
  };

  const downloadJson = () => {
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Text to JSON Converter
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Text
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text (CSV, key-value, or plain)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-40"
              />
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
                  <option value="auto">Auto-detect</option>
                  <option value="csv">CSV</option>
                  <option value="kv">Key-Value</option>
                  <option value="plain">Plain Text</option>
                </select>
              </div>
              {format === 'csv' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CSV Delimiter
                  </label>
                  <input
                    type="text"
                    value={delimiter}
                    onChange={(e) => setDelimiter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., , or ;"
                    maxLength={1}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={prettyPrint}
                onChange={(e) => setPrettyPrint(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Pretty Print JSON
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Convert to JSON
          </button>
        </form>

        {/* Error Section */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-md text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* Output Section */}
        {jsonOutput && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">JSON Output:</h2>
              <div className="space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Copy
                </button>
                <button
                  onClick={downloadJson}
                  className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Download
                </button>
              </div>
            </div>
            <pre className="text-sm overflow-auto max-h-60 bg-white p-2 rounded border border-gray-200">
              {jsonOutput}
            </pre>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Examples</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Converts CSV, key-value pairs, or plain text to JSON</li>
              <li>Auto-detects input format</li>
              <li>Custom CSV delimiter</li>
              <li>Pretty print option</li>
              <li>Copy and download JSON output</li>
              <li>CSV Example: "name,age\nJohn,30"</li>
              <li>Key-Value Example: "name=John\nage=30" or "name:John\nage:30"</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TextToJson;