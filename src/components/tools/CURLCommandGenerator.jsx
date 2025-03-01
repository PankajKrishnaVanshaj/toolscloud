"use client";

import React, { useState } from 'react';

const CURLCommandGenerator = () => {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [generatedCommand, setGeneratedCommand] = useState('');
  const [copied, setCopied] = useState(false);

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const updateHeader = (index, field, value) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const removeHeader = (index) => {
    if (headers.length > 1) {
      setHeaders(headers.filter((_, i) => i !== index));
    }
  };

  const generateCURLCommand = () => {
    if (!url.trim()) {
      setGeneratedCommand('Please enter a URL');
      setCopied(false);
      return;
    }

    let command = `curl -X ${method} "${url}"`;

    // Add headers
    headers.forEach(({ key, value }) => {
      if (key.trim() && value.trim()) {
        command += ` -H "${key}: ${value}"`;
      }
    });

    // Add body for non-GET methods
    if (method !== 'GET' && body.trim()) {
      const escapedBody = body.replace(/"/g, '\\"');
      command += ` -d "${escapedBody}"`;
      
      // Add Content-Type header if not already present
      const hasContentType = headers.some(h => h.key.toLowerCase() === 'content-type');
      if (!hasContentType) {
        command += ' -H "Content-Type: application/json"';
      }
    }

    setGeneratedCommand(command);
    setCopied(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateCURLCommand();
  };

  const handleCopy = () => {
    if (generatedCommand && generatedCommand !== 'Please enter a URL') {
      navigator.clipboard.writeText(generatedCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">CURL Command Generator</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="w-1/4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {methods.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://api.example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Headers
            </label>
            {headers.map((header, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={header.key}
                  onChange={(e) => updateHeader(index, 'key', e.target.value)}
                  className="w-1/3 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Key (e.g., Authorization)"
                />
                <input
                  type="text"
                  value={header.value}
                  onChange={(e) => updateHeader(index, 'value', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Value (e.g., Bearer token)"
                />
                {headers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeHeader(index)}
                    className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addHeader}
              className="text-sm text-blue-600 hover:underline mt-1"
            >
              + Add Header
            </button>
          </div>

          {method !== 'GET' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Request Body
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full h-32 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder='{"key": "value"}'
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate CURL Command
          </button>
        </form>

        {/* Generated Command */}
        {generatedCommand && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Generated CURL Command</h3>
              <button
                onClick={handleCopy}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                disabled={generatedCommand === 'Please enter a URL'}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="p-4 bg-gray-50 rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
              {generatedCommand}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CURLCommandGenerator;