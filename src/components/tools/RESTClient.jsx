"use client";

import React, { useState, useCallback, useRef } from 'react';
import { FaCopy, FaDownload, FaHistory, FaSync, FaPlay } from 'react-icons/fa';

const RESTClient = () => {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [queryParams, setQueryParams] = useState([{ key: '', value: '' }]);
  const abortController = useRef(null);

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

  // Header Management
  const addHeader = () => setHeaders([...headers, { key: '', value: '' }]);
  const updateHeader = (index, field, value) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };
  const removeHeader = (index) => {
    if (headers.length > 1) setHeaders(headers.filter((_, i) => i !== index));
  };

  // Query Param Management
  const addQueryParam = () => setQueryParams([...queryParams, { key: '', value: '' }]);
  const updateQueryParam = (index, field, value) => {
    const newParams = [...queryParams];
    newParams[index][field] = value;
    setQueryParams(newParams);
  };
  const removeQueryParam = (index) => {
    if (queryParams.length > 1) setQueryParams(queryParams.filter((_, i) => i !== index));
  };

  // Build Full URL with Query Params
  const buildUrl = useCallback(() => {
    const params = queryParams
      .filter(p => p.key.trim() && p.value.trim())
      .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join('&');
    return params ? `${url}?${params}` : url;
  }, [url, queryParams]);

  const sendRequest = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setCopied(false);

    const fullUrl = buildUrl();
    if (!fullUrl.trim()) {
      setError('Please provide a URL');
      setLoading(false);
      return;
    }

    abortController.current = new AbortController();

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
        headers: headersObj,
        signal: abortController.current.signal
      };

      if (method !== 'GET' && method !== 'HEAD' && body.trim()) {
        config.body = body;
      }

      const startTime = performance.now();
      const res = await fetch(fullUrl, config);
      const endTime = performance.now();

      const contentType = res.headers.get('content-type') || 'text/plain';
      const responseData = contentType.includes('application/json')
        ? JSON.stringify(await res.json(), null, 2)
        : await res.text();

      const responseObj = {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        data: responseData,
        ok: res.ok,
        time: (endTime - startTime).toFixed(2)
      };

      setResponse(responseObj);
      setHistory(prev => [...prev, { url: fullUrl, method, timestamp: new Date(), response: responseObj }].slice(-5));
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request was cancelled');
      } else {
        setError('Error sending request: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [method, headers, body, buildUrl]);

  const handleCancel = () => {
    if (abortController.current) {
      abortController.current.abort();
    }
  };

  const handleCopy = () => {
    if (response?.data) {
      navigator.clipboard.writeText(response.data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (response?.data) {
      const blob = new Blob([response.data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `response-${Date.now()}.${response.data.startsWith('{') ? 'json' : 'txt'}`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setUrl('');
    setMethod('GET');
    setHeaders([{ key: '', value: '' }]);
    setBody('');
    setQueryParams([{ key: '', value: '' }]);
    setResponse(null);
    setError(null);
    setCopied(false);
  };

  const handleHistorySelect = (entry) => {
    setUrl(entry.url.split('?')[0]);
    setMethod(entry.method);
    setResponse(entry.response);
    const params = new URLSearchParams(entry.url.split('?')[1]);
    setQueryParams(
      Array.from(params.entries()).map(([key, value]) => ({ key, value })) || [{ key: '', value: '' }]
    );
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">REST Client</h2>

        {/* Request Form */}
        <form onSubmit={(e) => { e.preventDefault(); sendRequest(); }} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                disabled={loading}
              >
                {methods.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="https://api.example.com"
                disabled={loading}
              />
            </div>
          </div>

          {/* Query Params */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Query Parameters</label>
            {queryParams.map((param, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={param.key}
                  onChange={(e) => updateQueryParam(index, 'key', e.target.value)}
                  className="w-1/3 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="Key (e.g., api_key)"
                  disabled={loading}
                />
                <input
                  type="text"
                  value={param.value}
                  onChange={(e) => updateQueryParam(index, 'value', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="Value (e.g., xyz123)"
                  disabled={loading}
                />
                {queryParams.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQueryParam(index)}
                    className="text-red-600 hover:text-red-800"
                    disabled={loading}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addQueryParam}
              className="text-sm text-blue-600 hover:underline mt-1"
              disabled={loading}
            >
              + Add Query Param
            </button>
          </div>

          {/* Headers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Headers</label>
            {headers.map((header, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={header.key}
                  onChange={(e) => updateHeader(index, 'key', e.target.value)}
                  className="w-1/3 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="Key (e.g., Authorization)"
                  disabled={loading}
                />
                <input
                  type="text"
                  value={header.value}
                  onChange={(e) => updateHeader(index, 'value', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="Value (e.g., Bearer token)"
                  disabled={loading}
                />
                {headers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeHeader(index)}
                    className="text-red-600 hover:text-red-800"
                    disabled={loading}
                  >
                    ✕
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Request Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full h-32 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder={`{\n  "key": "value"\n}`}
                disabled={loading}
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              className={`flex-1 py-2 px-4 rounded-md text-white transition-colors ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } flex items-center justify-center`}
              disabled={loading}
            >
              <FaPlay className="mr-2" /> {loading ? 'Sending...' : 'Send Request'}
            </button>
            {loading && (
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2 px-4 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-2 px-4 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Response */}
        {response && (
          <div className="mt-6 space-y-4">
            <div className={`p-4 rounded-lg ${response.ok ? 'bg-green-50' : 'bg-red-50'} border ${response.ok ? 'border-green-200' : 'border-red-200'}`}>
              <h3 className="font-semibold text-gray-700">Status</h3>
              <p className={`text-lg ${response.ok ? 'text-green-700' : 'text-red-700'}`}>
                {response.status} {response.statusText} ({response.time}ms)
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2">Response Headers</h3>
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                {Object.entries(response.headers).map(([key, value]) => `${key}: ${value}`).join('\n')}
              </pre>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-700">Response Body</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className={`px-3 py-1 text-sm rounded transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    <FaCopy className="inline mr-1" /> {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                  >
                    <FaDownload className="inline mr-1" /> Download
                  </button>
                </div>
              </div>
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all max-h-96 overflow-auto">
                {response.data}
              </pre>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center mb-2">
              <FaHistory className="mr-2" /> Request History (Last 5)
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{entry.method} {entry.url.slice(0, 50)}{entry.url.length > 50 ? '...' : ''}</span>
                  <button
                    onClick={() => handleHistorySelect(entry)}
                    className="text-blue-600 hover:underline"
                  >
                    Load
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tips */}
        {!response && !error && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Tips</h3>
            <ul className="list-disc list-inside text-sm text-blue-600 space-y-1">
              <li>Test with: https://jsonplaceholder.typicode.com/posts/1</li>
              <li>Add query params for filtering</li>
              <li>Set Content-Type for custom body formats</li>
              <li>Use history to reload previous requests</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default RESTClient;