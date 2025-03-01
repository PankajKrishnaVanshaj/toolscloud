"use client";

import React, { useState } from 'react';

const HTTPMethodTester = () => {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const headersObj = {};
      if (headers) {
        const headerLines = headers.split('\n');
        headerLines.forEach(line => {
          const [key, value] = line.split(':').map(s => s.trim());
          if (key && value) headersObj[key] = value;
        });
      }

      const config = {
        method,
        headers: headersObj,
      };

      if (method !== 'GET' && method !== 'HEAD' && body) {
        config.body = body;
        if (!headersObj['Content-Type']) {
          headersObj['Content-Type'] = 'application/json';
        }
      }

      const res = await fetch(url, config);
      const contentType = res.headers.get('content-type');
      let responseData;

      if (contentType && contentType.includes('application/json')) {
        responseData = await res.json();
      } else {
        responseData = await res.text();
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: responseData
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">HTTP Method Tester</h2>

        {/* Request Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-32 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {methods.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com"
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Headers (key: value, one per line)
            </label>
            <textarea
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              className="w-full h-24 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Content-Type: application/json\nAuthorization: Bearer token"
            />
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
                placeholder='{"key": "value"}'
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white transition-colors ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Sending...' : 'Send Request'}
          </button>
        </form>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            Error: {error}
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700">Status</h3>
              <p className="text-lg">
                {response.status} {response.statusText}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700 mb-2">Response Headers</h3>
              <pre className="text-sm whitespace-pre-wrap">
                {Object.entries(response.headers)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join('\n')}
              </pre>
            </div>

            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700 mb-2">Response Body</h3>
              <pre className="text-sm whitespace-pre-wrap">
                {typeof response.body === 'object'
                  ? JSON.stringify(response.body, null, 2)
                  : response.body}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HTTPMethodTester;