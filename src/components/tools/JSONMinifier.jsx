"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaSync, FaExpand, FaCompress } from "react-icons/fa";

const JSONMinifier = () => {
  const [inputJSON, setInputJSON] = useState("");
  const [outputJSON, setOutputJSON] = useState("");
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    minify: true,
    removeComments: false,
    formatOutput: false,
  });
  const [history, setHistory] = useState([]);

  const processJSON = useCallback(() => {
    setError(null);
    setOutputJSON("");
    setCopied(false);

    try {
      let parsed = JSON.parse(inputJSON);

      // Remove comments (basic support for // and /* */ style comments)
      if (options.removeComments) {
        const cleanedInput = inputJSON
          .replace(/\/\/.*$/gm, "") // Single-line comments
          .replace(/\/\*[\s\S]*?\*\//g, ""); // Multi-line comments
        parsed = JSON.parse(cleanedInput);
      }

      let result;
      if (options.minify) {
        result = JSON.stringify(parsed);
      } else if (options.formatOutput) {
        result = JSON.stringify(parsed, null, 2);
      } else {
        result = JSON.stringify(parsed);
      }

      setOutputJSON(result);
      setHistory((prev) => [
        ...prev,
        { input: inputJSON, output: result, timestamp: new Date() },
      ].slice(-5)); // Keep last 5 entries
    } catch (err) {
      setError("Invalid JSON: " + err.message);
      setOutputJSON("");
    }
  }, [inputJSON, options]);

  const handleSubmit = (e) => {
    e.preventDefault();
    processJSON();
  };

  const handleCopy = () => {
    if (outputJSON) {
      navigator.clipboard.writeText(outputJSON);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (outputJSON) {
      const blob = new Blob([outputJSON], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${options.minify ? "minified" : "formatted"}-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setInputJSON("");
    setOutputJSON("");
    setError(null);
    setCopied(false);
  };

  const handleHistorySelect = (entry) => {
    setInputJSON(entry.input);
    setOutputJSON(entry.output);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">JSON Minifier & Formatter</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Input JSON
            </label>
            <textarea
              value={inputJSON}
              onChange={(e) => setInputJSON(e.target.value)}
              className="w-full h-48 sm:h-64 p-4 border border-gray-300 rounded-lg resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder='{"name": "John", "age": 30, "city": "New York"}'
              aria-label="JSON Input"
            />
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.minify}
                  onChange={(e) => setOptions((prev) => ({ ...prev, minify: e.target.checked, formatOutput: !e.target.checked && prev.formatOutput }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Minify</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.removeComments}
                  onChange={(e) => setOptions((prev) => ({ ...prev, removeComments: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Remove Comments</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.formatOutput}
                  onChange={(e) => setOptions((prev) => ({ ...prev, formatOutput: e.target.checked, minify: !e.target.checked && prev.minify }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Format Output</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              disabled={!inputJSON.trim()}
            >
              {options.minify ? <FaCompress className="mr-2" /> : <FaExpand className="mr-2" />}
              {options.minify ? "Minify" : "Format"} JSON
            </button>
            <button
              onClick={handleReset}
              type="button"
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

        {/* Output */}
        {outputJSON && (
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                {options.minify ? "Minified" : "Formatted"} JSON
              </h3>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <button
                  onClick={handleCopy}
                  className={`py-2 px-4 rounded-lg text-sm flex items-center transition-colors ${
                    copied ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <FaCopy className="mr-2" /> {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors flex items-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all max-h-64 overflow-auto">
                {outputJSON}
              </pre>
              <p className="mt-2 text-sm text-gray-600">
                Size {options.minify ? "reduced" : "changed"} from {inputJSON.length} to {outputJSON.length} characters
                {options.minify && (
                  <> ({Math.round(((inputJSON.length - outputJSON.length) / inputJSON.length) * 100)}% savings)</>
                )}
              </p>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Recent Operations (Last 5)</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>
                    {entry.output.slice(0, 50)}... ({entry.timestamp.toLocaleTimeString()})
                  </span>
                  <button
                    onClick={() => handleHistorySelect(entry)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
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
            <li>Minify JSON to reduce size</li>
            <li>Format JSON for readability</li>
            <li>Remove comments from JSON-like strings</li>
            <li>Copy to clipboard with feedback</li>
            <li>Download as JSON file</li>
            <li>Track recent operations history</li>
            <li>Size comparison statistics</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JSONMinifier;