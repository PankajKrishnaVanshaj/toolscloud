'use client';

import React, { useState } from 'react';
import { saveAs } from 'file-saver'; // For file download

const JsonToText = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [outputFormat, setOutputFormat] = useState('plain');
  const [textOutput, setTextOutput] = useState('');
  const [error, setError] = useState('');
  const [delimiter, setDelimiter] = useState(','); // For CSV
  const [indent, setIndent] = useState(2); // For plain text indentation

  const formats = {
    plain: 'Plain Text',
    csv: 'CSV',
    yaml: 'YAML',
  };

  const convertJsonToText = () => {
    setError('');
    setTextOutput('');

    if (!jsonInput.trim()) {
      setError('Please enter a JSON string');
      return;
    }

    let parsedJson;
    try {
      parsedJson = JSON.parse(jsonInput);
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
      return;
    }

    switch (outputFormat) {
      case 'plain':
        setTextOutput(JSON.stringify(parsedJson, null, indent));
        break;
      case 'csv':
        if (!Array.isArray(parsedJson)) {
          setError('CSV format requires an array of objects');
          break;
        }
        const headers = Object.keys(parsedJson[0] || {});
        const csvRows = [
          headers.join(delimiter),
          ...parsedJson.map(obj =>
            headers.map(header => JSON.stringify(obj[header] ?? '')).join(delimiter)
          ),
        ];
        setTextOutput(csvRows.join('\n'));
        break;
      case 'yaml':
        setTextOutput(jsonToYaml(parsedJson));
        break;
      default:
        setError('Unsupported format');
    }
  };

  // Simple YAML converter (basic implementation)
  const jsonToYaml = (json, level = 0) => {
    const indentStr = '  '.repeat(level);
    if (Array.isArray(json)) {
      return json.length === 0
        ? '[]'
        : json.map(item => `${indentStr}- ${typeof item === 'object' ? '\n' + jsonToYaml(item, level + 1) : item}`).join('\n');
    } else if (json && typeof json === 'object') {
      return Object.entries(json).length === 0
        ? '{}'
        : Object.entries(json)
            .map(([key, value]) =>
              `${indentStr}${key}: ${typeof value === 'object' ? '\n' + jsonToYaml(value, level + 1) : value}`
            )
            .join('\n');
    }
    return String(json);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    convertJsonToText();
  };

  const downloadFile = () => {
    if (!textOutput) return;
    const extension = outputFormat === 'csv' ? 'csv' : outputFormat === 'yaml' ? 'yaml' : 'txt';
    const blob = new Blob([textOutput], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `converted.${extension}`);
  };

  const copyToClipboard = () => {
    if (!textOutput) return;
    navigator.clipboard.writeText(textOutput);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          JSON to Text Converter
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                JSON Input
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='e.g., {"name": "John", "age": 30}'
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 resize-y"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Output Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(formats).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              {outputFormat === 'csv' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CSV Delimiter
                  </label>
                  <input
                    type="text"
                    value={delimiter}
                    onChange={(e) => setDelimiter(e.target.value)}
                    placeholder="e.g., , or ;"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {outputFormat === 'plain' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Indentation (spaces)
                  </label>
                  <input
                    type="number"
                    value={indent}
                    onChange={(e) => setIndent(parseInt(e.target.value) || 0)}
                    min="0"
                    max="8"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Convert
            </button>
          </div>
        </form>

        {/* Error Section */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-md text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* Output Section */}
        {textOutput && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Converted Text:</h2>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Copy
                </button>
                <button
                  onClick={downloadFile}
                  className="px-4 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Download
                </button>
              </div>
            </div>
            <pre className="text-sm whitespace-pre-wrap break-words overflow-auto max-h-60">
              {textOutput}
            </pre>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Convert JSON to Plain Text, CSV, or YAML</li>
              <li>Customizable CSV delimiter</li>
              <li>Adjustable indentation for plain text</li>
              <li>Copy to clipboard or download as file</li>
              <li>CSV requires an array of objects</li>
              <li>Example: {`{"name": "John"} or [{"name": "John"}, {"name": "Jane"}]`}</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default JsonToText;