"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaPlus, FaTrash, FaSync } from "react-icons/fa";

const CURLCommandGenerator = () => {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState([{ key: "", value: "" }]);
  const [body, setBody] = useState("");
  const [generatedCommand, setGeneratedCommand] = useState("");
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    verbose: false,
    followRedirects: false,
    insecure: false,
    timeout: "",
    basicAuth: { username: "", password: "" },
  });

  const methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];

  const addHeader = () => setHeaders([...headers, { key: "", value: "" }]);

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

  const generateCURLCommand = useCallback(() => {
    if (!url.trim()) {
      setGeneratedCommand("Please enter a URL");
      setCopied(false);
      return;
    }

    let command = "curl";

    // Additional options
    if (options.verbose) command += " -v";
    if (options.followRedirects) command += " -L";
    if (options.insecure) command += " -k";
    if (options.timeout) command += ` --max-time ${options.timeout}`;
    if (options.basicAuth.username && options.basicAuth.password) {
      command += ` -u "${options.basicAuth.username}:${options.basicAuth.password}"`;
    }

    command += ` -X ${method} "${url}"`;

    // Headers
    headers.forEach(({ key, value }) => {
      if (key.trim() && value.trim()) {
        command += ` -H "${key}: ${value}"`;
      }
    });

    // Body
    if (method !== "GET" && method !== "HEAD" && body.trim()) {
      const escapedBody = body.replace(/"/g, '\\"');
      command += ` -d "${escapedBody}"`;
      const hasContentType = headers.some((h) => h.key.toLowerCase() === "content-type");
      if (!hasContentType) {
        command += ' -H "Content-Type: application/json"';
      }
    }

    setGeneratedCommand(command);
    setCopied(false);
  }, [url, method, headers, body, options]);

  const handleSubmit = (e) => {
    e.preventDefault();
    generateCURLCommand();
  };

  const handleCopy = () => {
    if (generatedCommand && generatedCommand !== "Please enter a URL") {
      navigator.clipboard.writeText(generatedCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (generatedCommand && generatedCommand !== "Please enter a URL") {
      const blob = new Blob([generatedCommand], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `curl-${Date.now()}.sh`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setUrl("");
    setMethod("GET");
    setHeaders([{ key: "", value: "" }]);
    setBody("");
    setGeneratedCommand("");
    setCopied(false);
    setOptions({
      verbose: false,
      followRedirects: false,
      insecure: false,
      timeout: "",
      basicAuth: { username: "", password: "" },
    });
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">CURL Command Generator</h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Method and URL */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {methods.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="https://api.example.com"
                required
              />
            </div>
          </div>

          {/* Headers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Headers</label>
            {headers.map((header, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-2 mb-3 items-start sm:items-center">
                <input
                  type="text"
                  value={header.key}
                  onChange={(e) => updateHeader(index, "key", e.target.value)}
                  className="w-full sm:w-1/3 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Key (e.g., Authorization)"
                />
                <input
                  type="text"
                  value={header.value}
                  onChange={(e) => updateHeader(index, "value", e.target.value)}
                  className="w-full sm:flex-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Value (e.g., Bearer token)"
                />
                {headers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeHeader(index)}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addHeader}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <FaPlus className="mr-1" /> Add Header
            </button>
          </div>

          {/* Request Body */}
          {method !== "GET" && method !== "HEAD" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Request Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full h-32 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder='{"key": "value"}'
              />
            </div>
          )}

          {/* Additional Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Additional Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.verbose}
                  onChange={(e) => setOptions((prev) => ({ ...prev, verbose: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Verbose (-v)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.followRedirects}
                  onChange={(e) => setOptions((prev) => ({ ...prev, followRedirects: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Follow Redirects (-L)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.insecure}
                  onChange={(e) => setOptions((prev) => ({ ...prev, insecure: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Insecure (-k)</span>
              </label>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Timeout (seconds)</label>
                <input
                  type="number"
                  value={options.timeout}
                  onChange={(e) => setOptions((prev) => ({ ...prev, timeout: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g., 30"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Basic Auth Username</label>
                <input
                  type="text"
                  value={options.basicAuth.username}
                  onChange={(e) => setOptions((prev) => ({ ...prev, basicAuth: { ...prev.basicAuth, username: e.target.value } }))}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Username"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Basic Auth Password</label>
                <input
                  type="password"
                  value={options.basicAuth.password}
                  onChange={(e) => setOptions((prev) => ({ ...prev, basicAuth: { ...prev.basicAuth, password: e.target.value } }))}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Generate CURL
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </form>

        {/* Generated Command */}
        {generatedCommand && (
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-3">
              <h3 className="font-semibold text-gray-700">Generated CURL Command</h3>
              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  className={`py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                    copied ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  disabled={generatedCommand === "Please enter a URL"}
                >
                  <FaCopy className="mr-2" /> {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                  disabled={generatedCommand === "Please enter a URL"}
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
            <pre className="p-4 bg-gray-50 rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap break-all border border-gray-200">
              {generatedCommand}
            </pre>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Support for multiple HTTP methods</li>
            <li>Custom headers management</li>
            <li>Request body for POST/PUT/PATCH</li>
            <li>Verbose mode, redirects, and insecure options</li>
            <li>Timeout configuration</li>
            <li>Basic authentication support</li>
            <li>Copy and download functionality</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CURLCommandGenerator;