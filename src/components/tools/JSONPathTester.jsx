"use client";

import React, { useState, useEffect, useCallback } from 'react';
import jp from 'jsonpath';
import { FaCopy, FaDownload, FaSync, FaHistory } from 'react-icons/fa';

const JSONPathTester = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [pathInput, setPathInput] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [formatJson, setFormatJson] = useState(true);
  const [debounce, setDebounce] = useState(true);
  const [lastEvaluated, setLastEvaluated] = useState(null);

  const evaluateJSONPath = useCallback(() => {
    setError(null);
    setResults([]);

    if (!jsonInput.trim() || !pathInput.trim()) {
      return;
    }

    try {
      const parsedJson = JSON.parse(jsonInput);
      const matches = jp.query(parsedJson, pathInput);
      setResults(matches);
      setLastEvaluated(new Date());
      setHistory(prev => [...prev, { json: jsonInput, path: pathInput, results: matches }].slice(-5));
    } catch (err) {
      setError('Error: ' + err.message);
    }
  }, [jsonInput, pathInput]);

  useEffect(() => {
    if (debounce) {
      const timer = setTimeout(() => evaluateJSONPath(), 500);
      return () => clearTimeout(timer);
    } else {
      evaluateJSONPath();
    }
  }, [jsonInput, pathInput, debounce, evaluateJSONPath]);

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setFormatJson(true);
    } catch (err) {
      setError('Invalid JSON: Cannot format');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(results, null, 2));
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jsonpath-results-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setJsonInput('');
    setPathInput('');
    setResults([]);
    setError(null);
  };

  const restoreFromHistory = (entry) => {
    setJsonInput(entry.json);
    setPathInput(entry.path);
    setResults(entry.results);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">JSONPath Tester</h2>

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">JSON Data</label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder='{"users": [{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]}'
              aria-label="JSON Input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">JSONPath Expression</label>
            <input
              type="text"
              value={pathInput}
              onChange={(e) => setPathInput(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="$.users[*].name"
              aria-label="JSONPath Expression"
            />
          </div>
        </div>

        {/* Options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Options</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formatJson}
                onChange={(e) => setFormatJson(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">Auto-format JSON</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={debounce}
                onChange={(e) => setDebounce(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">Debounce evaluation (500ms)</span>
            </label>
            <button
              onClick={handleFormatJson}
              className="py-1 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Format Now
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={handleReset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
          <button
            onClick={handleCopy}
            disabled={!results.length}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaCopy className="mr-2" /> Copy Results
          </button>
          <button
            onClick={handleDownload}
            disabled={!results.length}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download Results
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Results */}
        {(jsonInput || pathInput) && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
              Results {lastEvaluated && (
                <span className="text-sm text-gray-500 ml-2">
                  (Last evaluated: {lastEvaluated.toLocaleTimeString()})
                </span>
              )}
            </h3>
            {results.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Found {results.length} match{results.length !== 1 ? 'es' : ''}</p>
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap max-h-64 overflow-y-auto bg-white p-3 rounded border border-gray-200">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-sm text-gray-600 italic">
                {jsonInput && pathInput && !error ? 'No matches found' : 'Enter both JSON and a path to see results'}
              </p>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
              <FaHistory className="mr-2" /> Recent Queries (Last 5)
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="truncate max-w-[70%]">{entry.path} → {JSON.stringify(entry.results).slice(0, 50)}...</span>
                  <button
                    onClick={() => restoreFromHistory(entry)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Examples */}
        {!jsonInput && !pathInput && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Examples</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li><code className="break-all">{'{"users": [{"id": 1, "name": "John"}, {"id": 2, "name": "Jane"}]}'}</code></li>
              <li><code>$.users[*].name</code> → ["John", "Jane"]</li>
              <li><code>$..id</code> → [1, 2]</li>
              <li><code>$.users[?(@.age &gt; 25)]</code> → {`[{"name": "John", "age": 30}]`}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default JSONPathTester;