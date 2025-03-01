"use client";

import React, { useState } from 'react';

const JSONSchemaGenerator = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [schema, setSchema] = useState('');
  const [strictMode, setStrictMode] = useState(false); // Whether to require all properties
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const inferSchema = (obj, strict = false) => {
    const schema = {
      type: typeof obj === 'object' && obj !== null ? (Array.isArray(obj) ? 'array' : 'object') : typeof obj,
    };

    if (schema.type === 'object') {
      schema.properties = {};
      for (const [key, value] of Object.entries(obj)) {
        schema.properties[key] = inferSchema(value, strict);
      }
      if (strict) {
        schema.required = Object.keys(obj);
      }
    } else if (schema.type === 'array') {
      if (obj.length > 0) {
        // Infer schema from first item, assuming uniformity for simplicity
        schema.items = inferSchema(obj[0], strict);
      } else {
        schema.items = { type: 'any' }; // Empty array, allow any type
      }
    } else if (schema.type === 'null') {
      schema.type = 'null';
    }

    return schema;
  };

  const generateSchema = () => {
    setError(null);
    setSchema('');
    setCopied(false);

    if (!jsonInput.trim()) {
      setError('Please enter a JSON object');
      return;
    }

    try {
      const parsedJson = JSON.parse(jsonInput);
      const generatedSchema = {
        $schema: "http://json-schema.org/draft-07/schema#",
        ...inferSchema(parsedJson, strictMode)
      };
      setSchema(JSON.stringify(generatedSchema, null, 2));
    } catch (err) {
      setError('Invalid JSON: ' + err.message);
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

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">JSON Schema Generator</h2>

        {/* JSON Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              JSON Input
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full h-48 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`{
  "name": "John Doe",
  "age": 30,
  "isStudent": false,
  "courses": ["Math", "Science"]
}`}
            />
          </div>

          <div className="flex gap-4 items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={strictMode}
                onChange={(e) => setStrictMode(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Strict Mode (require all properties)</span>
            </label>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Generate Schema
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Generated Schema */}
        {schema && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Generated JSON Schema</h3>
              <button
                onClick={handleCopy}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="p-4 bg-gray-50 rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
              {schema}
            </pre>
          </div>
        )}

        {/* Notes */}
        {!schema && !error && (
          <div className="mt-4 text-sm text-gray-600">
            <p>Enter a JSON object to generate its schema.</p>
            <p className="mt-1">Features:</p>
            <ul className="list-disc pl-5">
              <li>Infers types (string, number, boolean, object, array, null)</li>
              <li>Strict mode adds "required" for all properties</li>
              <li>Supports nested objects and arrays</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default JSONSchemaGenerator;