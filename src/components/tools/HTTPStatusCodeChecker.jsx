"use client";

import React, { useState, useCallback, useEffect } from "react";
import { FaSync, FaDownload, FaHistory } from "react-icons/fa";

const HTTPStatusCodeChecker = () => {
  const [url, setUrl] = useState("");
  const [statusResult, setStatusResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [method, setMethod] = useState("HEAD");
  const [followRedirects, setFollowRedirects] = useState(true);
  const [timeout, setTimeout] = useState(5000);

  const statusCodeDescriptions = {
    100: "Continue - The server has received the request headers and the client should proceed.",
    200: "OK - The request was successful.",
    201: "Created - The request was successful and a resource was created.",
    204: "No Content - The request was successful but there is no content to return.",
    301: "Moved Permanently - The resource has been permanently moved to a new URL.",
    302: "Found - The resource is temporarily located at a different URL.",
    304: "Not Modified - The resource has not been modified since the last request.",
    400: "Bad Request - The server cannot process the request due to client error.",
    401: "Unauthorized - Authentication is required and has failed or not been provided.",
    403: "Forbidden - The server refuses to fulfill the request.",
    404: "Not Found - The requested resource could not be found.",
    500: "Internal Server Error - The server encountered an unexpected condition.",
    502: "Bad Gateway - The server received an invalid response from an upstream server.",
    503: "Service Unavailable - The server is temporarily unable to handle the request.",
    504: "Gateway Timeout - The server did not receive a timely response from an upstream server.",
  };

  const checkStatusCode = useCallback(async () => {
    setLoading(true);
    setError(null);
    setStatusResult(null);

    if (!url.trim()) {
      setError("Please enter a valid URL");
      setLoading(false);
      return;
    }

    const formattedUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(formattedUrl, {
        method,
        redirect: followRedirects ? "follow" : "manual",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let status = response.status;
      let headers = Object.fromEntries(response.headers.entries());
      let redirectUrl = followRedirects ? null : response.headers.get("location");

      // Fallback to GET if HEAD fails or status is unavailable
      if (!status && method === "HEAD") {
        const fallbackResponse = await fetch(formattedUrl, {
          method: "GET",
          redirect: followRedirects ? "follow" : "manual",
        });
        status = fallbackResponse.status;
        headers = Object.fromEntries(fallbackResponse.headers.entries());
        redirectUrl = followRedirects ? null : fallbackResponse.headers.get("location");
      }

      const description = statusCodeDescriptions[status] || "Unknown status code - Refer to HTTP standards for details.";
      const result = {
        status,
        description,
        url: formattedUrl,
        headers,
        redirectUrl,
        timestamp: new Date(),
      };

      setStatusResult(result);
      setHistory((prev) => [result, ...prev].slice(0, 5)); // Keep last 5 checks
    } catch (err) {
      setError(`Failed to check status: ${err.message}. Possible issues: CORS, server blocks, or timeout (${timeout}ms).`);
    } finally {
      setLoading(false);
    }
  }, [url, method, followRedirects, timeout]);

  const handleSubmit = (e) => {
    e.preventDefault();
    checkStatusCode();
  };

  const handleReset = () => {
    setUrl("");
    setStatusResult(null);
    setError(null);
  };

  const handleDownload = () => {
    if (!statusResult) return;
    const content = JSON.stringify(statusResult, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `http-status-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return "bg-green-50 text-green-700 border-green-200";
    if (status >= 400 && status < 500) return "bg-red-50 text-red-700 border-red-200";
    if (status >= 500) return "bg-orange-50 text-orange-700 border-orange-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">HTTP Status Code Checker</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="example.com or https://example.com"
              disabled={loading}
              aria-label="URL to check"
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="HEAD">HEAD</option>
                <option value="GET">GET</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Follow Redirects</label>
              <input
                type="checkbox"
                checked={followRedirects}
                onChange={(e) => setFollowRedirects(e.target.checked)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timeout (ms)</label>
              <input
                type="number"
                value={timeout}
                onChange={(e) => setTimeout(Math.max(1000, parseInt(e.target.value)))}
                min="1000"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className={`flex-1 py-2 px-4 rounded-lg text-white transition-colors ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={loading}
            >
              {loading ? "Checking..." : "Check Status"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
              disabled={!statusResult || loading}
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Status Result */}
        {statusResult && (
          <div className="mt-6">
            <div className={`p-4 rounded-lg border ${getStatusColor(statusResult.status)}`}>
              <h3 className="font-semibold text-lg">Result</h3>
              <p className="text-xl mt-1">
                Status: {statusResult.status} -{" "}
                {statusResult.status >= 200 && statusResult.status < 300
                  ? "Success"
                  : statusResult.status >= 400 && statusResult.status < 500
                  ? "Client Error"
                  : "Server Error"}
              </p>
              <p className="text-sm mt-1">
                URL: <span className="font-mono">{statusResult.url}</span>
              </p>
              {statusResult.redirectUrl && (
                <p className="text-sm mt-1">
                  Redirected to: <span className="font-mono">{statusResult.redirectUrl}</span>
                </p>
              )}
              <p className="text-sm mt-2">{statusResult.description}</p>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium">Response Headers</summary>
                <pre className="mt-2 text-xs bg-white p-2 rounded border max-h-40 overflow-auto">
                  {JSON.stringify(statusResult.headers, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Checks (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.map((entry, index) => (
                <li key={index} className="flex justify-between">
                  <span>
                    {entry.url} - {entry.status} ({entry.timestamp.toLocaleTimeString()})
                  </span>
                  <button
                    onClick={() => setStatusResult(entry)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    View
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700">Features & Notes</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports HEAD and GET methods</li>
            <li>Configurable redirect handling</li>
            <li>Custom timeout settings</li>
            <li>Shows response headers</li>
            <li>History of last 5 checks</li>
            <li>Download results as JSON</li>
            <li>Note: Some servers may block requests or require CORS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HTTPStatusCodeChecker;