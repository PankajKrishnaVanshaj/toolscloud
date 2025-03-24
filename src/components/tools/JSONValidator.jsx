"use client";

import React, { useState, useCallback, useRef } from "react";
import { FaCopy, FaDownload, FaSync, FaExpand } from "react-icons/fa";

const JSONValidator = () => {
  const [inputJSON, setInputJSON] = useState("");
  const [validationResult, setValidationResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [expandedView, setExpandedView] = useState(false);
  const [validationOptions, setValidationOptions] = useState({
    strictMode: false,
    checkDepth: true,
    maxDepth: 10,
  });
  const validationCount = useRef(0);

  const validateJSON = useCallback((jsonString) => {
    setValidationResult(null);
    setCopied(false);

    if (!jsonString.trim()) {
      setValidationResult({
        isValid: false,
        message: "Please enter JSON to validate",
        errorDetails: null,
        formattedJSON: null,
        depth: 0,
      });
      return;
    }

    try {
      const parsed = JSON.parse(jsonString);
      const formatted = JSON.stringify(parsed, null, 2);

      // Calculate nesting depth
      const calculateDepth = (obj, currentDepth = 0) => {
        if (!obj || typeof obj !== "object") return currentDepth;
        return Math.max(
          ...Object.values(obj).map((val) =>
            calculateDepth(val, currentDepth + 1)
          ),
          currentDepth
        );
      };
      const depth = calculateDepth(parsed);

      // Validation based on options
      const errors = [];
      if (validationOptions.checkDepth && depth > validationOptions.maxDepth) {
        errors.push(`JSON nesting depth (${depth}) exceeds maximum allowed (${validationOptions.maxDepth})`);
      }
      if (validationOptions.strictMode) {
        const hasInvalidTypes = (obj) => {
          if (obj === null || typeof obj !== "object") return false;
          return Object.values(obj).some((val) =>
            val === undefined || val instanceof Function || hasInvalidTypes(val)
          );
        };
        if (hasInvalidTypes(parsed)) {
          errors.push("Strict mode: Undefined values or functions detected");
        }
      }

      if (errors.length > 0) {
        setValidationResult({
          isValid: false,
          message: "JSON validation failed",
          errorDetails: { message: errors.join("; ") },
          formattedJSON: formatted,
          depth,
        });
      } else {
        setValidationResult({
          isValid: true,
          message: "Valid JSON",
          errorDetails: null,
          formattedJSON: formatted,
          depth,
        });
      }
    } catch (err) {
      const errorDetails = {
        message: err.message,
        line: null,
        column: null,
      };
      const positionMatch = err.message.match(/position (\d+)/);
      if (positionMatch) {
        const position = parseInt(positionMatch[1], 10);
        const lines = jsonString.substring(0, position).split("\n");
        errorDetails.line = lines.length;
        errorDetails.column = lines[lines.length - 1].length + 1;
      }

      setValidationResult({
        isValid: false,
        message: "Invalid JSON syntax",
        errorDetails,
        formattedJSON: null,
        depth: 0,
      });
    }
    validationCount.current += 1;
  }, [validationOptions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    validateJSON(inputJSON);
  };

  const handleCopy = () => {
    if (validationResult?.formattedJSON) {
      navigator.clipboard.writeText(validationResult.formattedJSON);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (validationResult?.formattedJSON) {
      const blob = new Blob([validationResult.formattedJSON], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `validated-json-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setInputJSON("");
    setValidationResult(null);
    setCopied(false);
    setExpandedView(false);
    validationCount.current = 0;
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">JSON Validator</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              JSON Input
            </label>
            <textarea
              value={inputJSON}
              onChange={(e) => setInputJSON(e.target.value)}
              className="w-full h-48 sm:h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`{\n  "name": "John",\n  "age": 30,\n  "city": "New York"\n}`}
              aria-label="JSON Input"
            />
          </div>

          {/* Validation Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Validation Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={validationOptions.strictMode}
                  onChange={(e) => setValidationOptions(prev => ({ ...prev, strictMode: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Strict Mode (No undefined/functions)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={validationOptions.checkDepth}
                  onChange={(e) => setValidationOptions(prev => ({ ...prev, checkDepth: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Check Nesting Depth</span>
              </label>
              {validationOptions.checkDepth && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Max Depth:</label>
                  <input
                    type="number"
                    value={validationOptions.maxDepth}
                    onChange={(e) => setValidationOptions(prev => ({ ...prev, maxDepth: Math.max(1, parseInt(e.target.value) || 10) }))}
                    className="w-20 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              disabled={!inputJSON.trim()}
            >
              Validate JSON
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              disabled={!validationResult?.formattedJSON}
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>
        </form>

        {/* Validation Result */}
        {validationResult && (
          <div className="mt-6 space-y-6">
            <div className={`p-4 rounded-lg ${validationResult.isValid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} border`}>
              <h3 className="font-semibold text-gray-700 mb-2">Validation Result</h3>
              <p className={`text-lg ${validationResult.isValid ? "text-green-700" : "text-red-700"}`}>
                {validationResult.message}
              </p>
              {validationResult.depth > 0 && (
                <p className="text-sm text-gray-600 mt-1">Nesting Depth: {validationResult.depth}</p>
              )}
              {validationResult.errorDetails && (
                <div className="mt-2 text-sm text-red-600">
                  <p>Error: {validationResult.errorDetails.message}</p>
                  {validationResult.errorDetails.line && (
                    <p>Line: {validationResult.errorDetails.line}, Column: {validationResult.errorDetails.column}</p>
                  )}
                </div>
              )}
            </div>

            {validationResult.formattedJSON && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-700">Formatted JSON</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setExpandedView(!expandedView)}
                      className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                      title={expandedView ? "Collapse" : "Expand"}
                    >
                      <FaExpand />
                    </button>
                    <button
                      onClick={handleCopy}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        copied ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      <FaCopy className="inline mr-1" /> {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
                <pre className={`text-sm font-mono text-gray-800 whitespace-pre-wrap break-all ${expandedView ? "max-h-none" : "max-h-64 overflow-auto"}`}>
                  {validationResult.formattedJSON}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Features List */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Syntax validation with detailed error reporting</li>
            <li>Formatted JSON output</li>
            <li>Strict mode validation</li>
            <li>Nesting depth checking</li>
            <li>Copy and download options</li>
            <li>Expandable view for large JSON</li>
            <li>Responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JSONValidator;