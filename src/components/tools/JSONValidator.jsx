"use client";

import React, { useState } from 'react';

const JSONValidator = () => {
  const [inputJSON, setInputJSON] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const validateJSON = (jsonString) => {
    setValidationResult(null);
    setCopied(false);

    if (!jsonString.trim()) {
      setValidationResult({
        isValid: false,
        message: 'Please enter JSON to validate',
        errorDetails: null,
        formattedJSON: null
      });
      return;
    }

    try {
      const parsed = JSON.parse(jsonString);
      const formatted = JSON.stringify(parsed, null, 2);
      setValidationResult({
        isValid: true,
        message: 'Valid JSON',
        errorDetails: null,
        formattedJSON: formatted
      });
    } catch (err) {
      // Extract line and column from error message if available
      const errorDetails = {
        message: err.message,
        line: null,
        column: null
      };

      // Some browsers include position in the error message (e.g., "at position 42")
      const positionMatch = err.message.match(/position (\d+)/);
      if (positionMatch) {
        const position = parseInt(positionMatch[1], 10);
        const lines = jsonString.substring(0, position).split('\n');
        errorDetails.line = lines.length;
        errorDetails.column = lines[lines.length - 1].length + 1;
      }

      setValidationResult({
        isValid: false,
        message: 'Invalid JSON',
        errorDetails,
        formattedJSON: null
      });
    }
  };

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

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">JSON Validator</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              JSON Input
            </label>
            <textarea
              value={inputJSON}
              onChange={(e) => setInputJSON(e.target.value)}
              className="w-full h-48 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`{
  "name": "John",
  "age": 30,
  "city": "New York"
}`}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Validate JSON
          </button>
        </form>

        {/* Validation Result */}
        {validationResult && (
          <div className="mt-6 space-y-4">
            <div className={`p-4 rounded-md ${validationResult.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className="font-semibold text-gray-700">Validation Result</h3>
              <p className={`text-lg ${validationResult.isValid ? 'text-green-700' : 'text-red-700'}`}>
                {validationResult.message}
              </p>
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
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-700">Formatted JSON</h3>
                  <button
                    onClick={handleCopy}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
                  {validationResult.formattedJSON}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JSONValidator;