"use client";

import React, { useState } from 'react';

const GraphQLQueryTester = () => {
  const [endpoint, setEndpoint] = useState('');
  const [query, setQuery] = useState('');
  const [variables, setVariables] = useState('');
  const [headers, setHeaders] = useState([{ key: '', value: '' }]);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

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

  const executeQuery = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setCopied(false);

    if (!endpoint.trim() || !query.trim()) {
      setError('Please provide both an endpoint and a query');
      setLoading(false);
      return;
    }

    try {
      const headersObj = headers.reduce((acc, { key, value }) => {
        if (key.trim() && value.trim()) acc[key] = value;
        return acc;
      }, { 'Content-Type': 'application/json' });

      let variablesObj = {};
      if (variables.trim()) {
        variablesObj = JSON.parse(variables);
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: headersObj,
        body: JSON.stringify({
          query,
          variables: variablesObj
        })
      });

      const data = await res.json();
      setResponse({
        status: res.status,
        data: JSON.stringify(data, null, 2),
        ok: res.ok
      });
    } catch (err) {
      setError('Error executing query: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeQuery();
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
        <h2 className="text-2xl font-bold mb-4 text-gray-800">GraphQL Query Tester</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GraphQL Endpoint
            </label>
            <input
              type="url"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://api.example.com/graphql"
              disabled={loading}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Query / Mutation
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-40 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`query {
  users {
    id
    name
  }
}`}
                disabled={loading}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variables (JSON)
              </label>
              <textarea
                value={variables}
                onChange={(e) => setVariables(e.target.value)}
                className="w-full h-40 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`{
  "id": 1
}`}
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

          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-md text-white transition-colors ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={loading}
          >
            {loading ? 'Executing...' : 'Execute Query'}
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
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Response</h3>
              <button
                onClick={handleCopy}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className={`p-4 rounded-md ${response.ok ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={`text-lg ${response.ok ? 'text-green-700' : 'text-red-700'}`}>
                Status: {response.status}
              </p>
              <pre className="mt-2 text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
                {response.data}
              </pre>
            </div>
          </div>
        )}

        {/* Notes */}
        {!response && !error && (
          <div className="mt-4 text-sm text-gray-600">
            <p>Enter a GraphQL endpoint and query/mutation to test.</p>
            <p className="mt-1">Tips:</p>
            <ul className="list-disc pl-5">
              <li>Use a public GraphQL API (e.g., https://countries.trevorblades.com/)</li>
              <li>Variables should be valid JSON</li>
              <li>Add headers like Authorization if required</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphQLQueryTester;