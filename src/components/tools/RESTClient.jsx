"use client";

import React, { useState } from 'react';

const RESTClient = () => {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

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

  const sendRequest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setCopied(false);

    if (!url.trim()) {
      setError('Please provide a URL');
      setLoading(false);
      return;
    }

    try {
      const headersObj = headers.reduce((acc, { key, value }) => {
        if (key.trim() && value.trim()) acc[key] = value;
        return acc;
      }, {});

      if (!headersObj['Content-Type'] && body.trim() && method !== 'GET' && method !== 'HEAD') {
        headersObj['Content-Type'] = 'application/json';
      }

      const config = {
        method,
        headers: headersObj
      };

      if (method !== 'GET' && method !== 'HEAD' && body.trim()) {
        config.body = body;
      }

      const res = await fetch(url, config);
      const contentType = res.headers.get('content-type') || 'text/plain';
      const responseData = contentType.includes('application/json') 
        ? JSON.stringify(await res.json(), null, 2)
        : await res.text();

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        data: responseData,
        ok: res.ok
      });
    } catch (err) {
      setError('Error sending request: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendRequest();
  };

  const handleCopy = () => {
    if (response && response.data) {
      navigator.clipboard.writeText(response.data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">REST Client</h2>

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
                disabled={loading}
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
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://api.example.com"
                disabled={loading}
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
                  disabled={loading}
                />
                <input
                  type="text"
                  value={header.value}
                  onChange={(e) => updateHeader(index, 'value', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Value (e.g., Bearer token)"
                  disabled={loading}
                />
                {headers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeHeader(index)}
                    className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                    disabled={loading}
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
              disabled={loading}
            >
              + Add Header
            </button>
          </div>

          {(method !== 'GET' && method !== 'HEAD') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Request Body
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full h-32 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`{
  "key": "value"
}`}
                disabled={loading}
              />
            </div>
          )}

          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-md text-white transition-colors ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Request'}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Response */}
        {response && (
          <div className="mt-6 space-y-4">
            <div className={`p-4 rounded-md ${response.ok ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className="font-semibold text-gray-700">Status</h3>
              <p className={`text-lg ${response.ok ? 'text-green-700' : 'text-red-700'}`}>
                {response.status} {response.statusText}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700 mb-2">Response Headers</h3>
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                {Object.entries(response.headers)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join('\n')}
              </pre>
            </div>

            <div className="p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-700">Response Body</h3>
                <button
                  onClick={handleCopy}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
                {response.data}
              </pre>
            </div>
          </div>
        )}

        {/* Notes */}
        {!response && !error && (
          <div className="mt-4 text-sm text-gray-600">
            <p>Enter a URL and configure your REST request.</p>
            <p className="mt-1">Tips:</p>
            <ul className="list-disc pl-5">
              <li>Use a public API (e.g., https://jsonplaceholder.typicode.com/posts/1)</li>
              <li>Body is sent as JSON by default if Content-Type isn’t set</li>
              <li>Add headers like Authorization for protected endpoints</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default RESTClient;