'use client';

import React, { useState } from 'react';
import yaml from 'js-yaml';

const JsonToYaml = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [yamlOutput, setYamlOutput] = useState('');
  const [error, setError] = useState('');
  const [options, setOptions] = useState({
    indent: 2,
    flowLevel: -1, // -1 means auto, higher numbers force flow style
    sortKeys: false,
  });

  const validateJSON = (input) => {
    try {
      JSON.parse(input);
      return true;
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
      return false;
    }
  };

  const convertToYAML = (input) => {
    setError('');
    setYamlOutput('');

    if (!input.trim()) {
      return;
    }

    if (validateJSON(input)) {
      const jsonData = JSON.parse(input);
      try {
        const yamlText = yaml.dump(jsonData, {
          indent: options.indent,
          flowLevel: options.flowLevel,
          sortKeys: options.sortKeys,
        });
        setYamlOutput(yamlText);
      } catch (err) {
        setError(`YAML conversion failed: ${err.message}`);
      }
    }
  };

  const convertToJSON = (input) => {
    setError('');
    setJsonInput('');

    if (!input.trim()) {
      return;
    }

    try {
      const jsonData = yaml.load(input);
      const jsonText = JSON.stringify(jsonData, null, 2);
      setJsonInput(jsonText);
    } catch (err) {
      setError(`Invalid YAML: ${err.message}`);
    }
  };

  const handleJsonChange = (value) => {
    setJsonInput(value);
    convertToYAML(value);
  };

  const handleYamlChange = (value) => {
    setYamlOutput(value);
    convertToJSON(value);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      if (file.name.endsWith('.json')) {
        handleJsonChange(content);
      } else if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
        handleYamlChange(content);
      } else {
        setError('Unsupported file type. Please upload .json or .yaml/.yml');
      }
    };
    reader.readAsText(file);
  };

  const downloadFile = (content, type) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted.${type === 'json' ? 'json' : 'yaml'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          JSON to YAML Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                JSON Input
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => handleJsonChange(e.target.value)}
                placeholder='{"key": "value"}'
                className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                YAML Output
              </label>
              <textarea
                value={yamlOutput}
                onChange={(e) => handleYamlChange(e.target.value)}
                placeholder="key: value"
                className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Conversion Options</h2>
            <div className="grid gap-4 md:grid-cols-3 text-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Indentation
                </label>
                <select
                  value={options.indent}
                  onChange={(e) => setOptions({ ...options, indent: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                  <option value={8}>8 spaces</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Flow Level
                </label>
                <select
                  value={options.flowLevel}
                  onChange={(e) => setOptions({ ...options, flowLevel: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={-1}>Auto</option>
                  <option value={0}>Block only</option>
                  <option value={1}>Flow level 1</option>
                  <option value={2}>Flow level 2</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.sortKeys}
                  onChange={(e) => setOptions({ ...options, sortKeys: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Sort Keys
                </label>
              </div>
            </div>
          </div>

          {/* File Operations */}
          <div className="flex gap-4 justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload File
              </label>
              <input
                type="file"
                accept=".json,.yaml,.yml"
                onChange={handleFileUpload}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => downloadFile(jsonInput, 'json')}
                disabled={!jsonInput}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300"
              >
                Download JSON
              </button>
              <button
                onClick={() => downloadFile(yamlOutput, 'yaml')}
                disabled={!yamlOutput}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300"
              >
                Download YAML
              </button>
            </div>
          </div>

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
              <li>Bidirectional JSON ↔ YAML conversion</li>
              <li>Customizable indentation and flow style</li>
              <li>Sort keys alphabetically</li>
              <li>File upload (.json, .yaml, .yml)</li>
              <li>Download converted files</li>
              <li>Real-time validation and conversion</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default JsonToYaml;