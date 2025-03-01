"use client";

import React, { useState } from 'react';

const HTTPRequestGenerator = () => {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState([{ key: '', value: '' }]);
  const [queryParams, setQueryParams] = useState([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [format, setFormat] = useState('fetch');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  const formats = ['fetch', 'axios', 'curl'];

  const addHeader = () => setHeaders([...headers, { key: '', value: '' }]);
  const updateHeader = (index, field, value) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };
  const removeHeader = (index) => {
    if (headers.length > 1) setHeaders(headers.filter((_, i) => i !== index));
  };

  const addQueryParam = () => setQueryParams([...queryParams, { key: '', value: '' }]);
  const updateQueryParam = (index, field, value) => {
    const newParams = [...queryParams];
    newParams[index][field] = value;
    setQueryParams(newParams);
  };
  const removeQueryParam = (index) => {
    if (queryParams.length > 1) setQueryParams(queryParams.filter((_, i) => i !== index));
  };

  const generateRequest = () => {
    if (!url.trim()) {
      setGeneratedCode('Please enter a URL');
      setCopied(false);
      return;
    }

    // Build full URL with query parameters
    const params = queryParams
      .filter(p => p.key.trim() && p.value.trim())
      .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join('&');
    const fullUrl = params ? `${url}?${params}` : url;

    // Build headers object
    const headersObj = headers
      .filter(h => h.key.trim() && h.value.trim())
      .reduce((acc, h) => {
        acc[h.key] = h.value;
        return acc;
      }, {});

    let code = '';
    switch (format) {
      case 'fetch':
        code = `fetch("${fullUrl}", {\n`;
        code += `  method: "${method}",\n`;
        if (Object.keys(headersObj).length > 0) {
          code += `  headers: ${JSON.stringify(headersObj, null, 2).replace(/\n/g, '\n  ')},\n`;
        }
        if (method !== 'GET' && body.trim()) {
          code += `  body: ${JSON.stringify(body)},\n`;
          if (!headersObj['Content-Type']) {
            code = code.replace('"headers":', '"headers": {\n    "Content-Type": "application/json",');
          }
        }
        code += `})\n  .then(response => response.json())\n  .then(data => console.log(data))\n  .catch(error => console.error('Error:', error));`;
        break;

      case 'axios':
        code = `axios({\n`;
        code += `  method: "${method.toLowerCase()}",\n`;
        code += `  url: "${fullUrl}",\n`;
        if (Object.keys(headersObj).length > 0) {
          code += `  headers: ${JSON.stringify(headersObj, null, 2).replace(/\n/g, '\n  ')},\n`;
        }
        if (method !== 'GET' && body.trim()) {
          code += `  data: ${JSON.stringify(body)},\n`;
          if (!headersObj['Content-Type']) {
            code = code.replace('"headers":', '"headers": {\n    "Content-Type": "application/json",');
          }
        }
        code += `})\n  .then(response => console.log(response.data))\n  .catch(error => console.error('Error:', error));`;
        break;

      case 'curl':
        code = `curl -X ${method} "${fullUrl}"`;
        headers.forEach(h => {
          if (h.key.trim() && h.value.trim()) code += ` -H "${h.key}: ${h.value}"`;
        });
        if (method !== 'GET' && body.trim()) {
          const escapedBody = body.replace(/"/g, '\\"');
          code += ` -d "${escapedBody}"`;
          if (!headers.some(h => h.key.toLowerCase() === 'content-type')) {
            code += ' -H "Content-Type: application/json"';
          }
        }
        break;

      default:
        code = '';
    }

    setGeneratedCode(code);
    setCopied(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateRequest();
  };

  const handleCopy = () => {
    if (generatedCode && generatedCode !== 'Please enter a URL') {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">HTTP Request Generator</h2>

        {/* Request Form */}
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
              Query Parameters
            </label>
            {queryParams.map((param, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={param.key}
                  onChange={(e) => updateQueryParam(index, 'key', e.target.value)}
                  className="w-1/3 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Key (e.g., id)"
                />
                <input
                  type="text"
                  value={param.value}
                  onChange={(e) => updateQueryParam(index, 'value', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Value (e.g., 123)"
                />
                {queryParams.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQueryParam(index)}
                    className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addQueryParam}
              className="text-sm text-blue-600 hover:underline mt-1"
            >
              + Add Query Parameter
            </button>
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

          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Output Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {formats.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Generate Request
            </button>
          </div>
        </form>

        {/* Generated Code */}
        {generatedCode && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Generated {format} Request</h3>
              <button
                onClick={handleCopy}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                disabled={generatedCode === 'Please enter a URL'}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="p-4 bg-gray-50 rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
              {generatedCode}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default HTTPRequestGenerator;