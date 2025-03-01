"use client";

import React, { useState } from 'react';

const APIMockServer = () => {
  const [endpoints, setEndpoints] = useState([
    { path: '/api/users', method: 'GET', response: '{"data": "Mock users"}', status: 200 }
  ]);
  const [testUrl, setTestUrl] = useState('');
  const [testMethod, setTestMethod] = useState('GET');
  const [testResult, setTestResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const methods = ['GET', 'POST', 'PUT', 'DELETE'];

  const addEndpoint = () => {
    setEndpoints([...endpoints, { path: '', method: 'GET', response: '', status: 200 }]);
  };

  const updateEndpoint = (index, field, value) => {
    const newEndpoints = [...endpoints];
    newEndpoints[index][field] = value;
    setEndpoints(newEndpoints);
  };

  const removeEndpoint = (index) => {
    if (endpoints.length > 1) {
      setEndpoints(endpoints.filter((_, i) => i !== index));
    }
  };

  const mockFetch = async (url, options = {}) => {
    const method = options.method || 'GET';
    const endpoint = endpoints.find(e => e.path === url && e.method === method);

    if (!endpoint) {
      return Promise.reject({ status: 404, message: 'Endpoint not found' });
    }

    try {
      const response = JSON.parse(endpoint.response);
      return Promise.resolve({
        status: endpoint.status,
        ok: endpoint.status >= 200 && endpoint.status < 300,
        json: () => Promise.resolve(response),
        text: () => Promise.resolve(endpoint.response)
      });
    } catch (err) {
      return Promise.reject({ status: 500, message: 'Invalid JSON response: ' + err.message });
    }
  };

  const testEndpoint = async () => {
    setTestResult(null);
    setCopied(false);

    if (!testUrl.trim()) {
      setTestResult({ status: 'error', message: 'Please enter a URL to test' });
      return;
    }

    try {
      const response = await mockFetch(testUrl, { method: testMethod });
      const data = response.ok ? await response.json() : await response.text();
      setTestResult({
        status: response.status,
        message: `${response.status} ${response.ok ? 'OK' : 'Error'}`,
        data: JSON.stringify(data, null, 2)
      });
    } catch (err) {
      setTestResult({
        status: err.status || 500,
        message: err.message || 'An error occurred',
        data: null
      });
    }
  };

  const handleTestSubmit = (e) => {
    e.preventDefault();
    testEndpoint();
  };

  const handleCopy = () => {
    if (testResult && testResult.data) {
      navigator.clipboard.writeText(testResult.data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">API Mock Server</h2>

        {/* Endpoint Definitions */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700 mb-2">Define Endpoints</h3>
          {endpoints.map((endpoint, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-md space-y-3">
              <div className="flex gap-4">
                <select
                  value={endpoint.method}
                  onChange={(e) => updateEndpoint(index, 'method', e.target.value)}
                  className="w-1/4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {methods.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={endpoint.path}
                  onChange={(e) => updateEndpoint(index, 'path', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="/api/endpoint"
                />
                <input
                  type="number"
                  value={endpoint.status}
                  onChange={(e) => updateEndpoint(index, 'status', parseInt(e.target.value))}
                  className="w-1/6 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Status (e.g., 200)"
                  min="100"
                  max="599"
                />
                {endpoints.length > 1 && (
                  <button
                    onClick={() => removeEndpoint(index)}
                    className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
              <textarea
                value={endpoint.response}
                onChange={(e) => updateEndpoint(index, 'response', e.target.value)}
                className="w-full h-24 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder='{"key": "value"}'
              />
            </div>
          ))}
          <button
            onClick={addEndpoint}
            className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Add Endpoint
          </button>
        </div>

        {/* Test Interface */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-700 mb-2">Test Mock API</h3>
          <form onSubmit={handleTestSubmit} className="space-y-4">
            <div className="flex gap-4">
              <div className="w-1/4">
                <select
                  value={testMethod}
                  onChange={(e) => setTestMethod(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {methods.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="/api/users"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Test
              </button>
            </div>
          </form>

          {/* Test Result */}
          {testResult && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-700">Test Result</h4>
                {testResult.data && (
                  <button
                    onClick={handleCopy}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                )}
              </div>
              <div className={`p-4 rounded-md ${testResult.status === 'error' || testResult.status >= 400 ? 'bg-red-50' : 'bg-green-50'}`}>
                <p className={`text-lg ${testResult.status === 'error' || testResult.status >= 400 ? 'text-red-700' : 'text-green-700'}`}>
                  {testResult.message}
                </p>
                {testResult.data && (
                  <pre className="mt-2 text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
                    {testResult.data}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="mt-6 text-sm text-gray-600">
          <p>This is a client-side mock server simulation. To test:</p>
          <ul className="list-disc pl-5">
            <li>Define endpoints with paths, methods, responses, and status codes</li>
            <li>Enter a URL and method to test against the mock</li>
            <li>Responses must be valid JSON</li>
            <li>For a real server, use Next.js API routes or a backend</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default APIMockServer;