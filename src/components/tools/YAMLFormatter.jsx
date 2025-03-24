"use client";

import React, { useState, useCallback } from 'react';
import YAML from 'yaml';
import { FaCopy, FaDownload, FaSync, FaCog } from 'react-icons/fa';

const YAMLFormatter = () => {
  const [inputYAML, setInputYAML] = useState('');
  const [formattedYAML, setFormattedYAML] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    indent: 2,
    sortKeys: false,
    lineWidth: 80,
    validateOnly: false,
  });
  const [showOptions, setShowOptions] = useState(false);

  const formatYAML = useCallback(() => {
    setError(null);
    setFormattedYAML('');
    setCopied(false);

    if (!inputYAML.trim()) {
      setError('Please enter YAML content to format');
      return;
    }

    try {
      const parsed = YAML.parse(inputYAML);
      if (options.validateOnly) {
        setFormattedYAML('YAML is valid!');
      } else {
        const formatted = YAML.stringify(parsed, {
          indent: options.indent,
          sortKeys: options.sortKeys,
          lineWidth: options.lineWidth,
        });
        setFormattedYAML(formatted);
      }
    } catch (err) {
      setError('Invalid YAML: ' + err.message);
    }
  }, [inputYAML, options]);

  const handleSubmit = (e) => {
    e.preventDefault();
    formatYAML();
  };

  const handleCopy = () => {
    if (formattedYAML && formattedYAML !== 'YAML is valid!') {
      navigator.clipboard.writeText(formattedYAML);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (formattedYAML && formattedYAML !== 'YAML is valid!') {
      const blob = new Blob([formattedYAML], { type: 'text/yaml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `formatted-${Date.now()}.yaml`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setInputYAML('');
    setFormattedYAML('');
    setError(null);
    setCopied(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">YAML Formatter</h2>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="Toggle Options"
          >
            <FaCog className="text-xl" />
          </button>
        </div>

        {/* Options Panel */}
        {showOptions && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Formatting Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Indent Size</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={options.indent}
                  onChange={(e) => setOptions({ ...options, indent: parseInt(e.target.value) || 2 })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Line Width</label>
                <input
                  type="number"
                  min="40"
                  max="200"
                  value={options.lineWidth}
                  onChange={(e) => setOptions({ ...options, lineWidth: parseInt(e.target.value) || 80 })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.sortKeys}
                  onChange={(e) => setOptions({ ...options, sortKeys: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Sort Keys</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.validateOnly}
                  onChange={(e) => setOptions({ ...options, validateOnly: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Validate Only</span>
              </label>
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">YAML Input</label>
            <textarea
              value={inputYAML}
              onChange={(e) => setInputYAML(e.target.value)}
              className="w-full h-48 sm:h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`name: John Doe\nage: 30\naddress:\n  street: 123 Main St\n  city: New York`}
              aria-label="YAML Input"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              {options.validateOnly ? 'Validate YAML' : 'Format YAML'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Formatted Output */}
        {formattedYAML && (
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-3">
              <h3 className="text-lg font-semibold text-gray-700">
                {options.validateOnly ? 'Validation Result' : 'Formatted YAML'}
              </h3>
              {!options.validateOnly && (
                <div className="flex gap-3">
                  <button
                    onClick={handleCopy}
                    className={`py-2 px-4 rounded-lg transition-colors flex items-center ${
                      copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <FaCopy className="mr-2" /> {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <FaDownload className="mr-2" /> Download
                  </button>
                </div>
              )}
            </div>
            <pre className="p-4 bg-gray-50 rounded-lg text-sm font-mono text-gray-800 whitespace-pre-wrap break-all border border-gray-200 overflow-auto max-h-96">
              {formattedYAML}
            </pre>
          </div>
        )}

        {/* Instructions */}
        {!formattedYAML && !error && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">How to Use</h3>
            <p className="text-sm text-blue-600">
              Enter YAML content to format it with proper indentation and structure. Customize formatting options above.
            </p>
            <p className="mt-2 text-sm text-blue-600">Example:</p>
            <pre className="mt-2 p-2 bg-white rounded-md font-mono text-sm text-blue-800">
              {`name: John Doe\nage: 30\naddress:\nstreet: 123 Main St\ncity: New York`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default YAMLFormatter;