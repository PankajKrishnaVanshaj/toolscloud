"use client";

import React, { useState, useEffect } from 'react';
import jp from 'jsonpath';

const JSONPathTester = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [pathInput, setPathInput] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const evaluateJSONPath = () => {
    setError(null);
    setResults([]);

    if (!jsonInput.trim() || !pathInput.trim()) {
      return;
    }

    try {
      const parsedJson = JSON.parse(jsonInput);
      const matches = jp.query(parsedJson, pathInput);
      setResults(matches);
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  useEffect(() => {
    evaluateJSONPath();
  }, [jsonInput, pathInput]);

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">JSONPath Tester</h2>

        {/* Input Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              JSON Data
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full h-48 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder='{"users": [{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]}'
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              JSONPath Expression
            </label>
            <input
              type="text"
              value={pathInput}
              onChange={(e) => setPathInput(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="$.users[*].name"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Results */}
        {(jsonInput || pathInput) && (
          <div className="mt-6">
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700 mb-2">Results</h3>
              {results.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Found {results.length} match{results.length !== 1 ? 'es' : ''}</p>
                  <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-sm text-gray-600 italic">
                  {jsonInput && pathInput ? 'No matches found' : 'Enter both JSON and a path to see results'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Examples */}
        {!jsonInput && !pathInput && (
          <div className="mt-4 text-sm text-gray-600">
            <p>Try these examples:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>
                JSON: <code className="break-all">{'{"users": [{"id": 1, "name": "John"}, {"id": 2, "name": "Jane"}]}'}</code>
              </li>
              <li>
                Path: <code>$.users[*].name</code> → ["John", "Jane"]
              </li>
              <li>
                Path: <code>$..id</code> → [1, 2]
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default JSONPathTester;