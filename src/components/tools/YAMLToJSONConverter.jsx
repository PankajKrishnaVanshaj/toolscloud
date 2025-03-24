"use client";

import React, { useState, useCallback } from 'react';
import YAML from 'yaml';
import { FaCopy, FaDownload, FaSync, FaCog } from 'react-icons/fa';

const YAMLToJSONConverter = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState('yamlToJson');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    indent: 2,
    sortKeys: false,
    flowLevel: -1, // -1 means auto, 0+ specifies flow level for YAML
    validateInput: true,
  });
  const [showOptions, setShowOptions] = useState(false);

  const convertText = useCallback(() => {
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
        if (options.validateInput && !parsedYAML) {
          throw new Error('Invalid YAML: Empty or null result');
        }
        setOutputText(JSON.stringify(parsedYAML, null, options.indent));
      } else {
        const parsedJSON = JSON.parse(inputText);
        if (options.validateInput && (parsedJSON === null || parsedJSON === undefined)) {
          throw new Error('Invalid JSON: Empty or null result');
        }
        setOutputText(YAML.stringify(parsedJSON, {
          indent: options.indent,
          sortKeys: options.sortKeys,
          flowLevel: options.flowLevel,
        }));
      }
    } catch (err) {
      setError(`Error converting ${mode === 'yamlToJson' ? 'YAML to JSON' : 'JSON to YAML'}: ${err.message}`);
    }
  }, [inputText, mode, options]);

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

  const handleDownload = () => {
    if (outputText) {
      const extension = mode === 'yamlToJson' ? 'json' : 'yaml';
      const blob = new Blob([outputText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `converted-${Date.now()}.${extension}`;
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

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">YAML ↔ JSON Converter</h2>

        {/* Input Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {mode === 'yamlToJson' ? 'YAML Input' : 'JSON Input'}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-48 sm:h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={mode === 'yamlToJson'
                ? 'name: John Doe\nage: 30\nskills:\n  - JavaScript\n  - React'
                : '{\n  "name": "John Doe",\n  "age": 30,\n  "skills": ["JavaScript", "React"]\n}'}
              aria-label={`${mode === 'yamlToJson' ? 'YAML' : 'JSON'} Input`}
            />
          </div>

          {/* Mode and Options Toggle */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Conversion Mode</label>
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
              type="button"
              onClick={() => setShowOptions(!showOptions)}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <FaCog className="mr-2" /> {showOptions ? 'Hide Options' : 'Show Options'}
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              disabled={!inputText.trim()}
            >
              Convert
            </button>
          </div>

          {/* Conversion Options */}
          {showOptions && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Conversion Options</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Indent Size</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={options.indent}
                    onChange={(e) => setOptions(prev => ({ ...prev, indent: parseInt(e.target.value) || 2 }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Flow Level (YAML)</label>
                  <input
                    type="number"
                    min="-1"
                    max="5"
                    value={options.flowLevel}
                    onChange={(e) => setOptions(prev => ({ ...prev, flowLevel: parseInt(e.target.value) || -1 }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={options.sortKeys}
                    onChange={(e) => setOptions(prev => ({ ...prev, sortKeys: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">Sort Keys</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={options.validateInput}
                    onChange={(e) => setOptions(prev => ({ ...prev, validateInput: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">Validate Input</span>
                </label>
              </div>
            </div>
          )}
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
              <h3 className="font-semibold text-gray-700 text-lg">
                {mode === 'yamlToJson' ? 'JSON Output' : 'YAML Output'}
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  className={`py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                    copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <FaCopy className="mr-2" /> {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleDownload}
                  className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
            <pre className="p-4 bg-gray-50 rounded-lg text-sm font-mono text-gray-800 whitespace-pre-wrap break-all max-h-96 overflow-auto">
              {outputText}
            </pre>
          </div>
        )}

        {/* Controls */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Bidirectional conversion (YAML ↔ JSON)</li>
            <li>Customizable indentation</li>
            <li>Sort keys option</li>
            <li>Adjustable YAML flow level</li>
            <li>Input validation</li>
            <li>Copy and download output</li>
            <li>Responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default YAMLToJSONConverter;