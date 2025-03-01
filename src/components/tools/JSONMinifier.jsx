"use client";

import React, { useState } from 'react';

const JSONMinifier = () => {
  const [inputJSON, setInputJSON] = useState('');
  const [minifiedJSON, setMinifiedJSON] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const minifyJSON = () => {
    setError(null);
    setMinifiedJSON('');
    setCopied(false);

    try {
      const parsed = JSON.parse(inputJSON);
      const minified = JSON.stringify(parsed);
      setMinifiedJSON(minified);
    } catch (err) {
      setError('Invalid JSON: ' + err.message);
      setMinifiedJSON('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    minifyJSON();
  };

  const handleCopy = () => {
    if (minifiedJSON) {
      navigator.clipboard.writeText(minifiedJSON);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (minifiedJSON) {
      const blob = new Blob([minifiedJSON], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'minified.json';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">JSON Minifier</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Input JSON
            </label>
            <textarea
              value={inputJSON}
              onChange={(e) => setInputJSON(e.target.value)}
              className="w-full h-48 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder='{"name": "John", "age": 30, "city": "New York"}'
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Minify JSON
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Minified Output */}
        {minifiedJSON && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-700">
                Minified JSON
              </h3>
              <div className="space-x-2">
                <button
                  onClick={handleCopy}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
                {minifiedJSON}
              </pre>
              <p className="mt-2 text-sm text-gray-600">
                Size reduced from {inputJSON.length} to {minifiedJSON.length} characters
                ({Math.round(((inputJSON.length - minifiedJSON.length) / inputJSON.length) * 100)}% savings)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JSONMinifier;