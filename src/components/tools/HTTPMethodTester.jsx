"use client";

import React, { useState, useCallback, useRef } from "react";
import { FaSync, FaDownload, FaHistory, FaPlus } from "react-icons/fa";

const HTTPMethodTester = () => {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [timeout, setTimeout] = useState(30); // seconds
  const abortController = useRef(null);

  const methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    abortController.current = new AbortController();

    try {
      const headersObj = parseHeaders(headers);
      
      const config = {
        method,
        headers: headersObj,
        signal: abortController.current.signal,
      };

      if (method !== "GET" && method !== "HEAD" && body) {
        config.body = body;
        if (!headersObj["Content-Type"]) {
          headersObj["Content-Type"] = "application/json";
        }
      }

      const fetchPromise = fetch(url, config);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), timeout * 1000)
      );

      const res = await Promise.race([fetchPromise, timeoutPromise]);
      const contentType = res.headers.get("content-type");
      let responseData;

      if (contentType?.includes("application/json")) {
        responseData = await res.json();
      } else {
        responseData = await res.text();
      }

      const responseObj = {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: responseData,
        timestamp: new Date(),
      };

      setResponse(responseObj);
      setHistory((prev) => [responseObj, ...prev].slice(0, 5));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url, method, headers, body, timeout]);

  const parseHeaders = (headersStr) => {
    const headersObj = {};
    if (headersStr) {
      headersStr.split("\n").forEach((line) => {
        const [key, ...value] = line.split(":").map((s) => s.trim());
        if (key && value.length) headersObj[key] = value.join(":");
      });
    }
    return headersObj;
  };

  const handleReset = () => {
    setUrl("");
    setMethod("GET");
    setHeaders("");
    setBody("");
    setResponse(null);
    setError(null);
  };

  const handleAbort = () => {
    if (abortController.current) {
      abortController.current.abort();
      setLoading(false);
      setError("Request aborted by user");
    }
  };

  const handleDownload = () => {
    if (!response) return;
    const content = JSON.stringify(response, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `response-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const restoreFromHistory = (entry) => {
    setUrl(entry.url || "");
    setMethod(entry.method || "GET");
    setHeaders(
      entry.headers
        ? Object.entries(entry.headers).map(([k, v]) => `${k}: ${v}`).join("\n")
        : ""
    );
    setBody(entry.body || "");
    setResponse(entry);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center        ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          HTTP Method Tester
        </h2>

        {/* Request Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full sm:w-32 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {methods.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com"
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              aria-label="API URL"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Headers (key: value, one per line)
            </label>
            <textarea
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              className="w-full h-24 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Content-Type: application/json\nAuthorization: Bearer token"
            />
          </div>

          {(method !== "GET" && method !== "HEAD") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Body
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder='{"key": "value"}'
              />
            </div>
          )}

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Timeout (seconds):
            </label>
            <input
              type="number"
              value={timeout}
              onChange={(e) => setTimeout(Math.max(1, e.target.value))}
              min="1"
              className="w-20 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <span className="animate-spin mr-2">⏳</span>
              ) : (
                <FaPlus className="mr-2" />
              )}
              {loading ? "Sending..." : "Send Request"}
            </button>
            {loading && (
              <button
                type="button"
                onClick={handleAbort}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Abort
              </button>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            Error: {error}
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="mt-6 space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Status</h3>
              <p className="text-lg font-mono">
                {response.status} {response.statusText}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Response Headers</h3>
              <pre className="text-sm font-mono whitespace-pre-wrap overflow-auto max-h-48">
                {Object.entries(response.headers)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join("\n")}
              </pre>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Response Body</h3>
              <pre className="text-sm font-mono whitespace-pre-wrap overflow-auto max-h-64">
                {typeof response.body === "object"
                  ? JSON.stringify(response.body, null, 2)
                  : response.body}
              </pre>
            </div>

            <button
              onClick={handleDownload}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Response
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
              <FaHistory className="mr-2" /> Request History (Last 5)
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {history.map((entry, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-2 bg-white rounded hover:bg-gray-50 transition-colors"
                >
                  <span>
                    {entry.method} {entry.url?.slice(0, 30) || url.slice(0, 30)}... -{" "}
                    {entry.status} ({entry.timestamp.toLocaleTimeString()})
                  </span>
                  <button
                    onClick={() => restoreFromHistory(entry)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features List */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Support for all major HTTP methods</li>
            <li>Custom headers and request body</li>
            <li>Configurable timeout with abort option</li>
            <li>Response download as JSON</li>
            <li>Request history tracking</li>
            <li>Automatic Content-Type detection</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HTTPMethodTester;