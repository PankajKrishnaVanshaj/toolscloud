"use client";

import React, { useState } from 'react';
import YAML from 'yaml';

const YAMLToJSONConverter = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState('yamlToJson'); // 'yamlToJson' or 'jsonToYaml'
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const convertText = () => {
    setError(null);
    setOutputText('');
    setCopied(false);

    if (!inputText.trim()) {
      setError('Please enter some text to convert');
      return;
    }

    try {
      if (mode === 'yamlToJson') {
        const parsedYAML = YAML.parse(inputText);
        setOutputText(JSON.stringify(parsedYAML, null, 2));
      } else {
        const parsedJSON = JSON.parse(inputText);
        setOutputText(YAML.stringify(parsedJSON));
      }
    } catch (err) {
      setError(`Error converting ${mode === 'yamlToJson' ? 'YAML to JSON' : 'JSON to YAML'}: ${err.message}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    convertText();
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">YAML to JSON Converter</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {mode === 'yamlToJson' ? 'YAML Input' : 'JSON Input'}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-48 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={mode === 'yamlToJson' 
                ? 'name: John Doe\nage: 30' 
                : '{\n  "name": "John Doe",\n  "age": 30\n}'}
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
                <option value="yamlToJson">YAML to JSON</option>
                <option value="jsonToYaml">JSON to YAML</option>
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
                {mode === 'yamlToJson' ? 'JSON Output' : 'YAML Output'}
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

        {/* Notes */}
        {!outputText && !error && (
          <div className="mt-4 text-sm text-gray-600">
            <p>Convert between YAML and JSON formats.</p>
            <p className="mt-1">Examples:</p>
            <ul className="list-disc pl-5">
              <li>YAML: <code>name: John</code> → JSON: <code>{'{"name": "John"}'}</code></li>
              <li>JSON: <code>{'{"age": 30}'}</code> → YAML: <code>age: 30</code></li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default YAMLToJSONConverter;