'use client';

import React, { useState } from 'react';

const JsonToTsv = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [tsvOutput, setTsvOutput] = useState('');
  const [error, setError] = useState('');
  const [delimiter, setDelimiter] = useState('\t'); // Default to tab
  const [flattenNested, setFlattenNested] = useState(true);
  const [includeHeaders, setIncludeHeaders] = useState(true);

  const parseJsonToTsv = (jsonData) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (!Array.isArray(parsed)) {
        throw new Error('JSON must be an array of objects');
      }

      if (parsed.length === 0) {
        return '';
      }

      const headers = new Set();
      const rows = [];

      parsed.forEach(obj => {
        const row = {};
        const collectKeys = (data, prefix = '') => {
          Object.entries(data).forEach(([key, value]) => {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            if (flattenNested && typeof value === 'object' && value !== null) {
              collectKeys(value, fullKey);
            } else {
              headers.add(fullKey);
              row[fullKey] = value === null || value === undefined ? '' : String(value);
            }
          });
        };
        collectKeys(obj);
        rows.push(row);
      });

      const headerArray = Array.from(headers);
      let tsv = '';
      if (includeHeaders) {
        tsv += headerArray.join(delimiter) + '\n';
      }

      rows.forEach(row => {
        const values = headerArray.map(header => {
          const value = row[header] ?? '';
          return value.includes(delimiter) || value.includes('\n') ? `"${value.replace(/"/g, '""')}"` : value;
        });
        tsv += values.join(delimiter) + '\n';
      });

      return tsv.trim();
    } catch (err) {
      throw new Error(`Invalid JSON: ${err.message}`);
    }
  };

  const handleConvert = () => {
    setError('');
    setTsvOutput('');
    try {
      const result = parseJsonToTsv(jsonInput);
      setTsvOutput(result);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setJsonInput(event.target.result);
        handleConvert();
      };
      reader.readAsText(file);
    }
  };

  const downloadTsv = () => {
    if (!tsvOutput) return;
    const blob = new Blob([tsvOutput], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.tsv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          JSON to TSV Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                JSON Input
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='[{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]'
                className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
            <div className="flex gap-4">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <button
                onClick={handleConvert}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Convert to TSV
              </button>
            </div>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Options</h2>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <label className="font-medium">Delimiter:</label>
                <select
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="\t">Tab (\t)</option>
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={flattenNested}
                  onChange={(e) => setFlattenNested(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Flatten Nested Objects
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeHeaders}
                  onChange={(e) => setIncludeHeaders(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Include Headers
              </label>
            </div>
          </div>

          {/* Output Section */}
          {tsvOutput && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">TSV Output:</h2>
                <button
                  onClick={downloadTsv}
                  className="px-4 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Download TSV
                </button>
              </div>
              <pre className="text-sm font-mono bg-white p-2 rounded border border-gray-200 overflow-auto max-h-40">
                {tsvOutput}
              </pre>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Converts JSON arrays of objects to TSV</li>
              <li>Supports nested objects (flatten option)</li>
              <li>Customizable delimiter (tab, comma, etc.)</li>
              <li>File upload support for JSON files</li>
              <li>Download converted TSV</li>
              <li>Handles quotes and special characters</li>
              <li>Example: {`[{"name": "John"}, {"name": "Jane"}]`} → "name\nJohn\nJane"</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default JsonToTsv;