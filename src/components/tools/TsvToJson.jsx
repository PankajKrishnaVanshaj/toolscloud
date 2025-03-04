'use client';

import React, { useState } from 'react';

const TsvToJson = () => {
  const [tsvInput, setTsvInput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [error, setError] = useState('');
  const [hasHeader, setHasHeader] = useState(true);
  const [prettyPrint, setPrettyPrint] = useState(true);
  const [delimiter, setDelimiter] = useState('\t'); // Default to tab

  const parseTSV = (tsv) => {
    const lines = tsv.trim().split('\n').map(line => line.trim());
    if (lines.length === 0) {
      throw new Error('Empty TSV input');
    }

    const rows = lines.map(line => line.split(delimiter));
    if (rows.some(row => row.length !== rows[0].length)) {
      throw new Error('Inconsistent number of columns');
    }

    let headers = hasHeader ? rows[0] : rows[0].map((_, i) => `column${i + 1}`);
    const dataRows = hasHeader ? rows.slice(1) : rows;

    const jsonArray = dataRows.map(row => {
      const obj = {};
      row.forEach((value, index) => {
        obj[headers[index]] = value;
      });
      return obj;
    });

    return prettyPrint ? JSON.stringify(jsonArray, null, 2) : JSON.stringify(jsonArray);
  };

  const handleConvert = () => {
    setError('');
    setJsonOutput('');
    try {
      const result = parseTSV(tsvInput);
      setJsonOutput(result);
    } catch (err) {
      setError(`Error converting TSV to JSON: ${err.message}`);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setTsvInput(event.target.result);
      handleConvert();
    };
    reader.onerror = () => setError('Error reading file');
    reader.readAsText(file);
  };

  const downloadJson = () => {
    if (!jsonOutput) return;
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    if (!jsonOutput) return;
    navigator.clipboard.writeText(jsonOutput);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          TSV to JSON Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                TSV Input
              </label>
              <textarea
                value={tsvInput}
                onChange={(e) => setTsvInput(e.target.value)}
                placeholder="Paste your TSV here (e.g., name\tage\nJohn\t25)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 resize-y"
              />
            </div>

            <div className="flex gap-4 items-center">
              <input
                type="file"
                accept=".tsv,.txt"
                onChange={handleFileUpload}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasHeader}
                  onChange={(e) => setHasHeader(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">Has Header Row</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={prettyPrint}
                  onChange={(e) => setPrettyPrint(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">Pretty Print</label>
              </div>
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
                <option value="\t">Tab (\t)</option>
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>

            <button
              onClick={handleConvert}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Convert to JSON
            </button>
          </div>

          {/* Output Section */}
          {jsonOutput && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">JSON Output:</h2>
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto max-h-60">
                {jsonOutput}
              </pre>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={downloadJson}
                  className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Download JSON
                </button>
              </div>
            </div>
          )}

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
              <li>Convert TSV to JSON with optional headers</li>
              <li>Support for file upload (.tsv, .txt)</li>
              <li>Custom delimiter selection</li>
              <li>Pretty print JSON output</li>
              <li>Copy to clipboard or download as file</li>
              <li>Example: "name\tage\nJohn\t25" → {`[{"name": "John", "age": "25"}]`}</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TsvToJson;