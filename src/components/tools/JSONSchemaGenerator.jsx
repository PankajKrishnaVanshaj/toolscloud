"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaSync } from "react-icons/fa";

const JSONSchemaGenerator = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [schema, setSchema] = useState("");
  const [options, setOptions] = useState({
    strictMode: false,
    includeExamples: false,
    addDescriptions: false,
    enforceMinMax: false,
  });
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const inferSchema = useCallback((obj, depth = 0) => {
    const schema = {
      type: typeof obj === "object" && obj !== null ? (Array.isArray(obj) ? "array" : "object") : typeof obj,
    };

    if (options.addDescriptions && depth === 0) {
      schema.description = "Generated JSON schema";
    }

    if (schema.type === "object") {
      schema.properties = {};
      for (const [key, value] of Object.entries(obj)) {
        schema.properties[key] = inferSchema(value, depth + 1);
        if (options.addDescriptions) {
          schema.properties[key].description = `Property: ${key}`;
        }
      }
      if (options.strictMode) {
        schema.required = Object.keys(obj);
      }
    } else if (schema.type === "array") {
      if (obj.length > 0) {
        schema.items = inferSchema(obj[0], depth + 1);
        if (options.enforceMinMax) {
          schema.minItems = 1;
          schema.maxItems = obj.length;
        }
      } else {
        schema.items = { type: "any" };
      }
    } else if (schema.type === "number" && options.enforceMinMax) {
      schema.minimum = Math.floor(obj);
      schema.maximum = Math.ceil(obj);
    } else if (schema.type === "string" && options.enforceMinMax) {
      schema.minLength = 1;
      schema.maxLength = obj.length;
    }

    if (options.includeExamples && obj !== null && typeof obj !== "object") {
      schema.examples = [obj];
    }

    if (schema.type === "null") schema.type = "null";
    return schema;
  }, [options]);

  const generateSchema = () => {
    setError(null);
    setSchema("");
    setCopied(false);

    if (!jsonInput.trim()) {
      setError("Please enter a JSON object");
      return;
    }

    try {
      const parsedJson = JSON.parse(jsonInput);
      const generatedSchema = {
        $schema: "http://json-schema.org/draft-07/schema#",
        ...inferSchema(parsedJson),
      };
      setSchema(JSON.stringify(generatedSchema, null, 2));
    } catch (err) {
      setError("Invalid JSON: " + err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateSchema();
  };

  const handleCopy = () => {
    if (schema) {
      navigator.clipboard.writeText(schema);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (schema) {
      const blob = new Blob([schema], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `schema-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setJsonInput("");
    setSchema("");
    setError(null);
    setCopied(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">JSON Schema Generator</h2>

        {/* JSON Input */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              JSON Input
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full h-48 sm:h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`{\n  "name": "John Doe",\n  "age": 30,\n  "isStudent": false,\n  "courses": ["Math", "Science"]\n}`}
              aria-label="JSON Input"
            />
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Schema Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(options).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              disabled={!jsonInput.trim()}
            >
              Generate Schema
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
              disabled={!schema}
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

        {/* Generated Schema */}
        {schema && (
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-3">
              <h3 className="font-semibold text-gray-700 text-lg">Generated JSON Schema</h3>
              <button
                onClick={handleCopy}
                className={`py-2 px-4 rounded-lg transition-colors flex items-center justify-center w-full sm:w-auto ${
                  copied ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <FaCopy className="mr-2" />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="p-4 bg-gray-50 rounded-lg text-sm font-mono text-gray-800 whitespace-pre-wrap break-all border border-gray-200 max-h-96 overflow-auto">
              {schema}
            </pre>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Infers types (string, number, boolean, object, array, null)</li>
            <li>Strict mode adds "required" for all properties</li>
            <li>Include examples from input data</li>
            <li>Add descriptions to schema properties</li>
            <li>Enforce min/max constraints for numbers, strings, and arrays</li>
            <li>Supports nested objects and arrays</li>
            <li>Download schema as JSON file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JSONSchemaGenerator;