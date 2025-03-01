"use client";

import React, { useState } from 'react';

const APITester = () => {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState([{ key: '', value: '' }]);
  const [queryParams, setQueryParams] = useState([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

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

  const buildUrlWithParams = () => {
    const params = queryParams
      .filter(p => p.key.trim() && p.value.trim())
      .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join('&');
    return params ? `${url}?${params}` : url;
  };

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setCopied(false);

    if (!url.trim()) {
      setError('Please enter a valid URL');
      setLoading(false);
      return;
    }

    const headersObj = headers
      .filter(h => h.key.trim() && h.value.trim())
      .reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {});

    const fetchOptions = {
      method,
      headers: headersObj
    };

    if (method !== 'GET' && method !== 'DELETE' && body.trim()) {
      fetchOptions.body = body;
      if (!headersObj['Content-Type']) {
        headersObj['Content-Type'] = 'application/json';
      }
    }

    try {
      const fullUrl = buildUrlWithParams();
      const res = await fetch(fullUrl, fetchOptions);
      const contentType = res.headers.get('content-type');
      const data = contentType?.includes('application/json') 
        ? await res.json() 
        : await res.text();

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: typeof data === 'object' ? JSON.stringify(data, null, 2) : data
      });
    } catch (err) {
      setError('Request failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    testAPI();
  };

  const handleCopy = () => {
    if (response?.body) {
      navigator.clipboard.writeText(response.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">API Tester</h2>

        {/* Request Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-1/4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {methods.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://api.example.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Query Parameters</label>
            {queryParams.map((param, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={param.key}
                  onChange={(e) => updateQueryParam(index, 'key', e.target.value)}
                  className="w-1/3 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Key (e.g., id)"
                  disabled={loading}
                />
                <input
                  type="text"
                  value={param.value}
                  onChange={(e) => updateQueryParam(index, 'value', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Value (e.g., 123)"
                  disabled={loading}
                />
                {queryParams.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQueryParam(index)}
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
              onClick={addQueryParam}
              className="text-sm text-blue-600 hover:underline"
              disabled={loading}
            >
              + Add Query Parameter
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Headers</label>
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
              className="text-sm text-blue-600 hover:underline"
              disabled={loading}
            >
              + Add Header
            </button>
          </div>

          {(method !== 'GET' && method !== 'DELETE') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Request Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full h-32 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder='{"key": "value"}'
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
            {loading ? 'Testing...' : 'Test API'}
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
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700">Status</h3>
              <p className={`text-lg ${response.status >= 400 ? 'text-red-600' : 'text-green-600'}`}>
                {response.status} {response.statusText}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700 mb-2">Response Headers</h3>
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
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
                {response.body}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default APITester;