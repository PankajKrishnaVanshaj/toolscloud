"use client";

import React, { useState, useCallback, useRef } from "react";
import { FaPlus, FaTrash, FaCopy, FaDownload, FaHistory } from "react-icons/fa";

const APIMockServer = () => {
  const [endpoints, setEndpoints] = useState([
    { id: Date.now(), path: "/api/users", method: "GET", response: '{"data": "Mock users"}', status: 200, headers: [], delay: 0 },
  ]);
  const [testUrl, setTestUrl] = useState("");
  const [testMethod, setTestMethod] = useState("GET");
  const [testHeaders, setTestHeaders] = useState([]);
  const [testResult, setTestResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const testCount = useRef(0);

  const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

  // Add new endpoint
  const addEndpoint = () => {
    setEndpoints([...endpoints, { id: Date.now(), path: "", method: "GET", response: "", status: 200, headers: [], delay: 0 }]);
  };

  // Update endpoint
  const updateEndpoint = (id, field, value) => {
    setEndpoints(endpoints.map(ep => ep.id === id ? { ...ep, [field]: value } : ep));
  };

  // Remove endpoint
  const removeEndpoint = (id) => {
    if (endpoints.length > 1) {
      setEndpoints(endpoints.filter(ep => ep.id !== id));
    }
  };

  // Add header to endpoint
  const addHeader = (id) => {
    setEndpoints(endpoints.map(ep => 
      ep.id === id ? { ...ep, headers: [...ep.headers, { key: "", value: "" }] } : ep
    ));
  };

  // Update header
  const updateHeader = (id, index, field, value) => {
    setEndpoints(endpoints.map(ep => {
      if (ep.id === id) {
        const newHeaders = [...ep.headers];
        newHeaders[index][field] = value;
        return { ...ep, headers: newHeaders };
      }
      return ep;
    }));
  };

  // Mock fetch implementation
  const mockFetch = useCallback(async (url, options = {}) => {
    const method = options.method || "GET";
    const endpoint = endpoints.find(e => e.path === url && e.method === method);

    if (!endpoint) {
      return Promise.reject({ status: 404, message: "Endpoint not found" });
    }

    await new Promise(resolve => setTimeout(resolve, endpoint.delay));

    try {
      const response = JSON.parse(endpoint.response);
      const headers = new Headers(endpoint.headers.map(h => [h.key, h.value]));
      return Promise.resolve({
        status: endpoint.status,
        ok: endpoint.status >= 200 && endpoint.status < 300,
        json: () => Promise.resolve(response),
        text: () => Promise.resolve(endpoint.response),
        headers,
      });
    } catch (err) {
      return Promise.reject({ status: 500, message: "Invalid JSON response: " + err.message });
    }
  }, [endpoints]);

  // Test endpoint
  const testEndpoint = async () => {
    setTestResult(null);
    setCopied(false);
    testCount.current += 1;

    if (!testUrl.trim()) {
      setTestResult({ status: "error", message: "Please enter a URL to test" });
      return;
    }

    try {
      const headers = testHeaders.reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {});
      const response = await mockFetch(testUrl, { method: testMethod, headers });
      const data = response.ok ? await response.json() : await response.text();
      const result = {
        status: response.status,
        message: `${response.status} ${response.ok ? "OK" : "Error"}`,
        data: JSON.stringify(data, null, 2),
        headers: Object.fromEntries(response.headers),
      };
      setTestResult(result);
      setHistory(prev => [...prev, { ...result, url: testUrl, method: testMethod, timestamp: new Date() }].slice(-5));
    } catch (err) {
      setTestResult({
        status: err.status || 500,
        message: err.message || "An error occurred",
        data: null,
      });
    }
  };

  // Handle form submission
  const handleTestSubmit = (e) => {
    e.preventDefault();
    testEndpoint();
  };

  // Copy result
  const handleCopy = () => {
    if (testResult?.data) {
      navigator.clipboard.writeText(testResult.data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Download endpoints configuration
  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(endpoints, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mock-endpoints-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">API Mock Server</h2>

        {/* Endpoints Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Define Endpoints</h3>
          <div className="space-y-6">
            {endpoints.map((endpoint) => (
              <div key={endpoint.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-4">
                  <select
                    value={endpoint.method}
                    onChange={(e) => updateEndpoint(endpoint.id, "method", e.target.value)}
                    className="sm:col-span-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {methods.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <input
                    type="text"
                    value={endpoint.path}
                    onChange={(e) => updateEndpoint(endpoint.id, "path", e.target.value)}
                    className="sm:col-span-6 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="/api/endpoint"
                  />
                  <input
                    type="number"
                    value={endpoint.status}
                    onChange={(e) => updateEndpoint(endpoint.id, "status", parseInt(e.target.value))}
                    className="sm:col-span-2 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Status"
                    min="100"
                    max="599"
                  />
                  <button
                    onClick={() => removeEndpoint(endpoint.id)}
                    disabled={endpoints.length === 1}
                    className="sm:col-span-2 p-2 text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <FaTrash />
                  </button>
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-1">Response Delay (ms)</label>
                  <input
                    type="number"
                    value={endpoint.delay}
                    onChange={(e) => updateEndpoint(endpoint.id, "delay", parseInt(e.target.value) || 0)}
                    className="w-full sm:w-24 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="5000"
                  />
                </div>
                <textarea
                  value={endpoint.response}
                  onChange={(e) => updateEndpoint(endpoint.id, "response", e.target.value)}
                  className="w-full h-24 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder='{"key": "value"}'
                />
                <div className="mt-4">
                  <button
                    onClick={() => addHeader(endpoint.id)}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <FaPlus className="mr-1" /> Add Header
                  </button>
                  {endpoint.headers.map((header, index) => (
                    <div key={index} className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={header.key}
                        onChange={(e) => updateHeader(endpoint.id, index, "key", e.target.value)}
                        placeholder="Header Key"
                        className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={header.value}
                        onChange={(e) => updateHeader(endpoint.id, index, "value", e.target.value)}
                        placeholder="Header Value"
                        className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={addEndpoint}
              className="w-full py-2 mt-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center"
            >
              <FaPlus className="mr-2" /> Add Endpoint
            </button>
          </div>
        </div>

        {/* Test Interface */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Test Mock API</h3>
          <form onSubmit={handleTestSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <select
                value={testMethod}
                onChange={(e) => setTestMethod(e.target.value)}
                className="sm:col-span-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {methods.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <input
                type="text"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                className="sm:col-span-8 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="/api/users"
              />
              <button
                type="submit"
                className="sm:col-span-2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Test
              </button>
            </div>
            <div>
              <button
                type="button"
                onClick={() => setTestHeaders([...testHeaders, { key: "", value: "" }])}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <FaPlus className="mr-1" /> Add Test Header
              </button>
              {testHeaders.map((header, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={header.key}
                    onChange={(e) => {
                      const newHeaders = [...testHeaders];
                      newHeaders[index].key = e.target.value;
                      setTestHeaders(newHeaders);
                    }}
                    placeholder="Header Key"
                    className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={header.value}
                    onChange={(e) => {
                      const newHeaders = [...testHeaders];
                      newHeaders[index].value = e.target.value;
                      setTestHeaders(newHeaders);
                    }}
                    placeholder="Header Value"
                    className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </form>

          {/* Test Result */}
          {testResult && (
            <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-lg font-semibold text-gray-700">Test Result</h4>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className={`py-1 px-3 text-sm rounded transition-colors ${copied ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                  >
                    <FaCopy className="inline mr-1" /> {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="py-1 px-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    <FaDownload className="inline mr-1" /> Export
                  </button>
                </div>
              </div>
              <div className={`p-4 rounded-md ${testResult.status >= 400 ? "bg-red-50" : "bg-green-50"}`}>
                <p className={`text-lg ${testResult.status >= 400 ? "text-red-700" : "text-green-700"}`}>
                  {testResult.message}
                </p>
                {testResult.data && (
                  <pre className="mt-2 text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
                    {testResult.data}
                  </pre>
                )}
                {testResult.headers && Object.keys(testResult.headers).length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-gray-700">Response Headers:</p>
                    <ul className="text-sm text-gray-600">
                      {Object.entries(testResult.headers).map(([key, value]) => (
                        <li key={key}>{key}: {value}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <FaHistory className="mr-2" /> Request History (Last 5)
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{entry.method} {entry.url} - {entry.message} ({entry.timestamp.toLocaleTimeString()})</span>
                  <button
                    onClick={() => {
                      setTestUrl(entry.url);
                      setTestMethod(entry.method);
                      testEndpoint();
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Retry
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Support for GET, POST, PUT, DELETE, PATCH</li>
            <li>Custom status codes and response delays</li>
            <li>Custom response headers</li>
            <li>Request history tracking</li>
            <li>Export endpoints configuration</li>
            <li>Test with custom headers</li>
            <li>Copy response data</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default APIMockServer;