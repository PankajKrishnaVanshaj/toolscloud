'use client';

import React, { useState } from 'react';

const TextToCsv = () => {
  const [inputText, setInputText] = useState('');
  const [delimiter, setDelimiter] = useState(',');
  const [hasHeaders, setHasHeaders] = useState(false);
  const [customHeaders, setCustomHeaders] = useState('');
  const [outputCsv, setOutputCsv] = useState('');
  const [error, setError] = useState('');
  const [inputFormat, setInputFormat] = useState('plain');

  const parseTextToCsv = () => {
    setError('');
    setOutputCsv('');

    if (!inputText.trim()) {
      setError('Please enter some text to convert');
      return;
    }

    let rows = [];
    let headers = customHeaders.split(',').map(h => h.trim()).filter(h => h);

    try {
      switch (inputFormat) {
        case 'plain':
          rows = inputText.split('\n').map(line => 
            line.split(/\s+/).map(item => item.trim()).filter(item => item)
          );
          break;
        case 'json':
          const jsonData = JSON.parse(inputText);
          if (Array.isArray(jsonData)) {
            if (jsonData.length > 0 && typeof jsonData[0] === 'object') {
              headers = headers.length ? headers : Object.keys(jsonData[0]);
              rows = jsonData.map(obj => 
                headers.map(key => obj[key] !== undefined ? String(obj[key]) : '')
              );
            } else {
              rows = jsonData.map(item => [String(item)]);
            }
          } else {
            throw new Error('JSON must be an array');
          }
          break;
        case 'list':
          rows = inputText.split('\n').map(line => [line.trim()]);
          break;
        default:
          throw new Error('Unsupported input format');
      }

      // Apply headers if specified
      if (hasHeaders && headers.length) {
        if (rows[0].length !== headers.length) {
          setError('Number of headers must match number of columns');
          return;
        }
        rows.unshift(headers);
      }

      // Convert to CSV
      const csv = rows.map(row => 
        row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(delimiter)
      ).join('\n');
      setOutputCsv(csv);
    } catch (err) {
      setError(`Error processing input: ${err.message}`);
    }
  };

  const downloadCsv = () => {
    if (!outputCsv) return;
    const blob = new Blob([outputCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'converted.csv');
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    parseTextToCsv();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Text to CSV Converter
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
                placeholder="Enter text to convert (e.g., space-separated values, JSON, list)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Input Format
                </label>
                <select
                  value={inputFormat}
                  onChange={(e) => setInputFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="plain">Plain Text (space-separated)</option>
                  <option value="json">JSON Array</option>
                  <option value="list">List (one per line)</option>
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
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="\t">Tab (\t)</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={hasHeaders}
                onChange={(e) => setHasHeaders(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Include Headers
              </label>
            </div>

            {hasHeaders && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Headers (comma-separated)
                </label>
                <input
                  type="text"
                  value={customHeaders}
                  onChange={(e) => setCustomHeaders(e.target.value)}
                  placeholder="e.g., Name,Age,City"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Convert to CSV
          </button>
        </form>

        {/* Error Section */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-md text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* Output Section */}
        {outputCsv && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">CSV Output:</h2>
              <button
                onClick={downloadCsv}
                className="px-4 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Download CSV
              </button>
            </div>
            <pre className="text-sm overflow-auto max-h-40 bg-white p-2 rounded">
              {outputCsv}
            </pre>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Convert plain text, JSON, or lists to CSV</li>
              <li>Customizable delimiter (comma, semicolon, tab, pipe)</li>
              <li>Optional custom headers</li>
              <li>Download as CSV file</li>
              <li>Plain text: space-separated values per line</li>
              <li>JSON: array of values or objects</li>
              <li>List: one item per line</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TextToCsv;