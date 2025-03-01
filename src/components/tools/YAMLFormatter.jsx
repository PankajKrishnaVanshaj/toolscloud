"use client";

import React, { useState } from 'react';
import YAML from 'yaml';

const YAMLFormatter = () => {
  const [inputYAML, setInputYAML] = useState('');
  const [formattedYAML, setFormattedYAML] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const formatYAML = () => {
    setError(null);
    setFormattedYAML('');
    setCopied(false);

    if (!inputYAML.trim()) {
      setError('Please enter YAML content to format');
      return;
    }

    try {
      // Parse the YAML to validate and reformat
      const parsed = YAML.parse(inputYAML);
      // Stringify with default formatting (2 spaces indent)
      const formatted = YAML.stringify(parsed, { indent: 2 });
      setFormattedYAML(formatted);
    } catch (err) {
      setError('Invalid YAML: ' + err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    formatYAML();
  };

  const handleCopy = () => {
    if (formattedYAML) {
      navigator.clipboard.writeText(formattedYAML);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">YAML Formatter</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              YAML Input
            </label>
            <textarea
              value={inputYAML}
              onChange={(e) => setInputYAML(e.target.value)}
              className="w-full h-48 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`name: John Doe
age: 30
address:
street: 123 Main St
city: New York`}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Format YAML
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Formatted Output */}
        {formattedYAML && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Formatted YAML</h3>
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
              {formattedYAML}
            </pre>
          </div>
        )}

        {/* Instructions */}
        {!formattedYAML && !error && (
          <div className="mt-4 text-sm text-gray-600">
            <p>Enter YAML content to format it with proper indentation and structure.</p>
            <p className="mt-1">Example:</p>
            <pre className="mt-1 p-2 bg-gray-50 rounded-md font-mono">
              {`name: John Doe\nage: 30\naddress:\nstreet: 123 Main St\ncity: New York`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default YAMLFormatter;