"use client";

import React, { useState, useCallback, useEffect } from "react";
import { FaCopy, FaDownload, FaHistory, FaSync } from "react-icons/fa";

const APITester = () => {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState([{ key: "", value: "" }]);
  const [queryParams, setQueryParams] = useState([{ key: "", value: "" }]);
  const [body, setBody] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [responseFormat, setResponseFormat] = useState("raw");

  const methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];

  // Dynamic field management
  const updateDynamicField = (setter) => (index, field, value) => {
    setter(prev => {
      const newItems = [...prev];
      newItems[index][field] = value;
      return newItems;
    });
  };

  const addDynamicField = (setter) => () => setter(prev => [...prev, { key: "", value: "" }]);
  const removeDynamicField = (setter, items) => (index) => {
    if (items.length > 1) setter(prev => prev.filter((_, i) => i !== index));
  };

  const buildUrlWithParams = useCallback(() => {
    const params = queryParams
      .filter(p => p.key.trim() && p.value.trim())
      .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join("&");
    return params ? `${url}?${params}` : url;
  }, [url, queryParams]);

  const testAPI = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setCopied(false);

    if (!url.trim()) {
      setError("Please enter a valid URL");
      setLoading(false);
      return;
    }

    const headersObj = headers
      .filter(h => h.key.trim() && h.value.trim())
      .reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {});

    const fetchOptions = { method, headers: headersObj };
    if (["POST", "PUT", "PATCH"].includes(method) && body.trim()) {
      fetchOptions.body = body;
      if (!headersObj["Content-Type"]) {
        headersObj["Content-Type"] = "application/json";
      }
    }

    try {
      const fullUrl = buildUrlWithParams();
      const res = await fetch(fullUrl, fetchOptions);
      const contentType = res.headers.get("content-type");
      let data;
      if (contentType?.includes("application/json")) {
        data = await res.json();
      } else if (contentType?.includes("text")) {
        data = await res.text();
      } else {
        data = "Binary or unsupported content type";
      }

      const responseData = {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: typeof data === "object" ? JSON.stringify(data, null, 2) : data,
        timestamp: new Date().toLocaleString(),
      };

      setResponse(responseData);
      setHistory(prev => [...prev, responseData].slice(-5));
    } catch (err) {
      setError(`Request failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [url, method, headers, queryParams, body, buildUrlWithParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    testAPI();
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (response?.body) {
      const blob = new Blob([response.body], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `response-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setUrl("");
    setMethod("GET");
    setHeaders([{ key: "", value: "" }]);
    setQueryParams([{ key: "", value: "" }]);
    setBody("");
    setResponse(null);
    setError(null);
  };

  const restoreFromHistory = (entry) => {
    setUrl(buildUrlWithParams());
    setMethod(entry.method || "GET");
    setResponse(entry);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">API Tester</h2>

        {/* Request Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="sm:col-span-3 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://api.example.com"
              disabled={loading}
            />
          </div>

          {/* Query Parameters */}
          <DynamicFields
            items={queryParams}
            label="Query Parameters"
            onAdd={addDynamicField(setQueryParams)}
            onUpdate={updateDynamicField(setQueryParams)}
            onRemove={removeDynamicField(setQueryParams, queryParams)}
            disabled={loading}
          />

          {/* Headers */}
          <DynamicFields
            items={headers}
            label="Headers"
            onAdd={addDynamicField(setHeaders)}
            onUpdate={updateDynamicField(setHeaders)}
            onRemove={removeDynamicField(setHeaders, headers)}
            disabled={loading}
          />

          {/* Request Body */}
          {["POST", "PUT", "PATCH"].includes(method) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Request Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder='{"key": "value"}'
                disabled={loading}
              />
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className={`flex-1 py-2 px-4 rounded-lg text-white transition-colors ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
              disabled={loading}
            >
              {loading ? "Testing..." : "Test API"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Response */}
        {response && (
          <div className="mt-6 space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Status</h3>
              <p className={`text-lg ${response.status >= 400 ? "text-red-600" : "text-green-600"}`}>
                {response.status} {response.statusText}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Response Headers</h3>
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all max-h-48 overflow-auto">
                {Object.entries(response.headers).map(([key, value]) => `${key}: ${value}`).join("\n")}
              </pre>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-700">Response Body</h3>
                <div className="flex gap-2">
                  <select
                    value={responseFormat}
                    onChange={(e) => setResponseFormat(e.target.value)}
                    className="p-1 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="raw">Raw</option>
                    <option value="pretty">Pretty</option>
                  </select>
                  <button
                    onClick={() => handleCopy(response.body)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${copied ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                  >
                    <FaCopy className="inline mr-1" /> {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    <FaDownload className="inline mr-1" /> Download
                  </button>
                </div>
              </div>
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all max-h-64 overflow-auto">
                {responseFormat === "pretty" && typeof JSON.parse(response.body) === "object" 
                  ? JSON.stringify(JSON.parse(response.body), null, 2) 
                  : response.body}
              </pre>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center mb-3">
              <FaHistory className="mr-2" /> Request History (Last 5)
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{`${entry.status} ${entry.statusText} - ${entry.timestamp}`}</span>
                  <button
                    onClick={() => restoreFromHistory(entry)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Support for multiple HTTP methods</li>
            <li>Custom headers and query parameters</li>
            <li>Request body for POST/PUT/PATCH</li>
            <li>Response formatting (raw/pretty)</li>
            <li>Copy and download responses</li>
            <li>Request history tracking</li>
            <li>Responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Reusable Dynamic Fields Component
const DynamicFields = ({ items, label, onAdd, onUpdate, onRemove, disabled }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    {items.map((item, index) => (
      <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2 items-center">
        <input
          type="text"
          value={item.key}
          onChange={(e) => onUpdate(index, "key", e.target.value)}
          className="w-full sm:w-1/3 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Key"
          disabled={disabled}
        />
        <input
          type="text"
          value={item.value}
          onChange={(e) => onUpdate(index, "value", e.target.value)}
          className="w-full sm:flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Value"
          disabled={disabled}
        />
        {items.length > 1 && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 disabled:text-gray-400"
            disabled={disabled}
          >
            Remove
          </button>
        )}
      </div>
    ))}
    <button
      type="button"
      onClick={onAdd}
      className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
      disabled={disabled}
    >
      + Add {label.slice(0, -1)}
    </button>
  </div>
);

export default APITester;