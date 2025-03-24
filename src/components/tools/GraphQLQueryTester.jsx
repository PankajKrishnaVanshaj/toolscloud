"use client";

import React, { useState, useCallback, useRef } from "react";
import { FaCopy, FaDownload, FaSync, FaHistory, FaPlay } from "react-icons/fa";

const GraphQLQueryTester = () => {
  const [endpoint, setEndpoint] = useState("");
  const [query, setQuery] = useState("");
  const [variables, setVariables] = useState("");
  const [headers, setHeaders] = useState([{ key: "", value: "" }]);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [prettify, setPrettify] = useState(true);
  const queryCount = useRef(0);

  const addHeader = () => setHeaders([...headers, { key: "", value: "" }]);

  const updateHeader = (index, field, value) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const removeHeader = (index) => {
    if (headers.length > 1) setHeaders(headers.filter((_, i) => i !== index));
  };

  const prettifyJSON = (str) => {
    try {
      const obj = JSON.parse(str);
      return JSON.stringify(obj, null, 2);
    } catch {
      return str;
    }
  };

  const executeQuery = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setCopied(false);

    if (!endpoint.trim() || !query.trim()) {
      setError("Endpoint and query are required");
      setLoading(false);
      return;
    }

    try {
      const headersObj = headers.reduce((acc, { key, value }) => {
        if (key.trim() && value.trim()) acc[key] = value;
        return acc;
      }, { "Content-Type": "application/json" });

      let variablesObj = {};
      if (variables.trim()) {
        variablesObj = JSON.parse(variables);
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: headersObj,
        body: JSON.stringify({ query, variables: variablesObj }),
      });

      const data = await res.json();
      const responseData = {
        status: res.status,
        data: prettify ? JSON.stringify(data, null, 2) : JSON.stringify(data),
        ok: res.ok,
        timestamp: new Date(),
      };
      setResponse(responseData);
      setHistory((prev) => [...prev, { endpoint, query, variables, response: responseData }].slice(-5));
      queryCount.current += 1;
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [endpoint, query, variables, headers, prettify]);

  const handleReset = () => {
    setEndpoint("");
    setQuery("");
    setVariables("");
    setHeaders([{ key: "", value: "" }]);
    setResponse(null);
    setError(null);
    setCopied(false);
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
      const blob = new Blob([response.data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `graphql-response-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const restoreFromHistory = (entry) => {
    setEndpoint(entry.endpoint);
    setQuery(entry.query);
    setVariables(entry.variables);
    setResponse(entry.response);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">GraphQL Query Tester</h2>

        {/* Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">GraphQL Endpoint</label>
            <input
              type="url"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="https://api.example.com/graphql"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Query / Mutation</label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-48 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`query {\n  users {\n    id\n    name\n  }\n}`}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Variables (JSON)</label>
              <textarea
                value={variables}
                onChange={(e) => setVariables(e.target.value)}
                className="w-full h-48 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`{\n  "id": 1\n}`}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Headers</label>
            {headers.map((header, index) => (
              <div key={index} className="flex gap-2 mb-3 items-center">
                <input
                  type="text"
                  value={header.key}
                  onChange={(e) => updateHeader(index, "key", e.target.value)}
                  className="w-1/3 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Key (e.g., Authorization)"
                  disabled={loading}
                />
                <input
                  type="text"
                  value={header.value}
                  onChange={(e) => updateHeader(index, "value", e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Value (e.g., Bearer token)"
                  disabled={loading}
                />
                {headers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeHeader(index)}
                    className="px-3 py-1 text-red-600 hover:text-red-800 disabled:opacity-50"
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
              className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              disabled={loading}
            >
              + Add Header
            </button>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={prettify}
                onChange={(e) => setPrettify(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={loading}
              />
              <span className="text-sm text-gray-600">Prettify Response</span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={executeQuery}
              className={`flex-1 py-2 px-4 rounded-lg text-white transition-colors ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              } flex items-center justify-center`}
              disabled={loading}
            >
              <FaPlay className="mr-2" /> {loading ? "Executing..." : "Execute Query"}
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-700">✗ {error}</p>
          </div>
        )}

        {/* Response */}
        {response && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-700">Response</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className={`py-1 px-3 rounded-lg text-sm flex items-center ${
                    copied ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  } transition-colors`}
                >
                  <FaCopy className="mr-1" /> {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="py-1 px-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
                >
                  <FaDownload className="mr-1" /> Download
                </button>
              </div>
            </div>
            <div className={`p-4 rounded-lg ${response.ok ? "bg-green-50" : "bg-red-50"} border ${response.ok ? "border-green-200" : "border-red-200"}`}>
              <p className={`text-lg ${response.ok ? "text-green-700" : "text-red-700"}`}>
                Status: {response.status} ({response.ok ? "OK" : "Error"})
              </p>
              <pre className="mt-2 text-sm font-mono text-gray-800 whitespace-pre-wrap break-all max-h-96 overflow-auto">
                {response.data}
              </pre>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <FaHistory className="mr-2" /> Query History (Last 5)
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{entry.query.slice(0, 50)}...</span>
                  <button
                    onClick={() => restoreFromHistory(entry)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Restore
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
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Try a public API: https://countries.trevorblades.com/</li>
              <li>Variables must be valid JSON</li>
              <li>Add headers like "Authorization" for protected endpoints</li>
              <li>Use history to quickly re-run previous queries</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphQLQueryTester;