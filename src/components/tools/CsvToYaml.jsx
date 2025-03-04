'use client';

import React, { useState } from 'react';
import jsyaml from 'js-yaml'; // You'll need to install this package

const CsvToYaml = () => {
  const [csvInput, setCsvInput] = useState('');
  const [yamlOutput, setYamlOutput] = useState('');
  const [error, setError] = useState('');
  const [options, setOptions] = useState({
    indent: 2,
    flowLevel: -1,
    header: true,
    arrayOutput: true,
  });

  const parseCSV = (csv) => {
    const lines = csv.trim().split('\n');
    const result = [];
    const headers = options.header ? lines[0].split(',').map(h => h.trim()) : null;

    if (options.header && lines.length < 2) {
      throw new Error('CSV must have at least one data row if header is enabled');
    }

    const dataLines = options.header ? lines.slice(1) : lines;
    for (const line of dataLines) {
      const values = line.split(',').map(v => v.trim());
      if (headers && values.length !== headers.length) {
        throw new Error('Mismatch between header and data columns');
      }
      const obj = headers
        ? headers.reduce((acc, header, i) => {
            acc[header] = isNaN(values[i]) ? values[i] : Number(values[i]);
            return acc;
          }, {})
        : values.map(v => (isNaN(v) ? v : Number(v)));
      result.push(obj);
    }

    return options.arrayOutput ? result : { data: result };
  };

  const convertToYaml = () => {
    setError('');
    setYamlOutput('');

    if (!csvInput.trim()) {
      setError('Please enter or upload a CSV');
      return;
    }

    try {
      const parsedData = parseCSV(csvInput);
      const yaml = jsyaml.dump(parsedData, {
        indent: options.indent,
        flowLevel: options.flowLevel,
      });
      setYamlOutput(yaml);
    } catch (err) {
      setError(`Error converting CSV to YAML: ${err.message}`);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvInput(event.target.result);
      setError('');
    };
    reader.onerror = () => setError('Error reading file');
    reader.readAsText(file);
  };

  const downloadYaml = () => {
    if (!yamlOutput) return;
    const blob = new Blob([yamlOutput], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.yaml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOptionChange = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          CSV to YAML Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CSV Input
              </label>
              <textarea
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder="e.g., name,age,city\nJohn,25,New York"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-y"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <button
                onClick={convertToYaml}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Convert to YAML
              </button>
            </div>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Conversion Options</h2>
            <div className="grid gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.header}
                  onChange={(e) => handleOptionChange('header', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                CSV has header row
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.arrayOutput}
                  onChange={(e) => handleOptionChange('arrayOutput', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Output as array (vs object with "data" key)
              </label>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Indentation:</label>
                <select
                  value={options.indent}
                  onChange={(e) => handleOptionChange('indent', parseInt(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                  <option value={6}>6 spaces</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Flow Level:</label>
                <select
                  value={options.flowLevel}
                  onChange={(e) => handleOptionChange('flowLevel', parseInt(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={-1}>Auto</option>
                  <option value={0}>Inline</option>
                  <option value={1}>1 level</option>
                  <option value={2}>2 levels</option>
                </select>
              </div>
            </div>
          </div>

          {/* Output Section */}
          {yamlOutput && (
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">YAML Output:</h2>
                <button
                  onClick={downloadYaml}
                  className="px-4 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Download YAML
                </button>
              </div>
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto max-h-60">
                {yamlOutput}
              </pre>
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
              <li>Convert CSV to YAML with customizable formatting</li>
              <li>Supports file upload (.csv)</li>
              <li>Header row support for key-value pairs</li>
              <li>Array or object output options</li>
              <li>Adjustable indentation and flow level</li>
              <li>Download converted YAML file</li>
              <li>Example: "name,age\nJohn,25" → "- name: John\n  age: 25"</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default CsvToYaml;