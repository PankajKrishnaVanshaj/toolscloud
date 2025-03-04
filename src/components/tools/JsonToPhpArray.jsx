'use client';

import React, { useState } from 'react';

const JsonToPhpArray = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [phpOutput, setPhpOutput] = useState('');
  const [error, setError] = useState('');
  const [options, setOptions] = useState({
    indent: 2, // Spaces for indentation
    useArraySyntax: true, // true for [], false for array()
    singleQuotes: false, // true for single quotes, false for double quotes
    shortSyntax: true, // true for short array syntax in values
  });

  const jsonToPhpArray = (obj, level = 0) => {
    const indent = ' '.repeat(options.indent * level);
    const quote = options.singleQuotes ? "'" : '"';
    let result = '';

    if (Array.isArray(obj)) {
      if (obj.length === 0) return options.useArraySyntax ? '[]' : 'array()';
      result += options.useArraySyntax ? '[' : 'array(';
      const innerIndent = ' '.repeat(options.indent * (level + 1));
      const items = obj.map(item => {
        const value = typeof item === 'object' && item !== null 
          ? jsonToPhpArray(item, level + 1)
          : formatValue(item);
        return `${innerIndent}${value},`;
      });
      result += '\n' + items.join('\n') + '\n' + indent + (options.useArraySyntax ? ']' : ')');
    } else if (typeof obj === 'object' && obj !== null) {
      if (Object.keys(obj).length === 0) return options.useArraySyntax ? '[]' : 'array()';
      result += options.useArraySyntax ? '[' : 'array(';
      const innerIndent = ' '.repeat(options.indent * (level + 1));
      const items = Object.entries(obj).map(([key, value]) => {
        const formattedValue = typeof value === 'object' && value !== null 
          ? jsonToPhpArray(value, level + 1)
          : formatValue(value);
        return `${innerIndent}${quote}${key}${quote} => ${formattedValue},`;
      });
      result += '\n' + items.join('\n') + '\n' + indent + (options.useArraySyntax ? ']' : ')');
    } else {
      result = formatValue(obj);
    }

    return result;
  };

  const formatValue = (value) => {
    if (value === null) return 'null';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') {
      const quote = options.singleQuotes ? "'" : '"';
      return `${quote}${value.replace(options.singleQuotes ? /'/g : /"/g, '\\' + quote)}${quote}`;
    }
    return value;
  };

  const convertJson = () => {
    setError('');
    setPhpOutput('');

    if (!jsonInput.trim()) {
      setError('Please enter a JSON string');
      return;
    }

    try {
      const parsedJson = JSON.parse(jsonInput);
      const phpArray = jsonToPhpArray(parsedJson);
      setPhpOutput(phpArray);
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
    }
  };

  const handleOptionChange = (key, value) => {
    setOptions(prev => {
      const newOptions = { ...prev, [key]: value };
      if (jsonInput && !error) {
        try {
          const parsedJson = JSON.parse(jsonInput);
          setPhpOutput(jsonToPhpArray(parsedJson));
        } catch {}
      }
      return newOptions;
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(phpOutput);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          JSON to PHP Array Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                JSON Input
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"name": "John", "age": 30, "skills": ["PHP", "React"]}'
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 font-mono text-sm"
              />
            </div>

            <button
              onClick={convertJson}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Convert to PHP Array
            </button>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Formatting Options</h2>
            <div className="grid gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.useArraySyntax}
                  onChange={(e) => handleOptionChange('useArraySyntax', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Use [] instead of array()
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.singleQuotes}
                  onChange={(e) => handleOptionChange('singleQuotes', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Use single quotes instead of double quotes
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.shortSyntax}
                  onChange={(e) => handleOptionChange('shortSyntax', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Use short syntax for nested arrays
              </label>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Indentation:</label>
                <select
                  value={options.indent}
                  onChange={(e) => handleOptionChange('indent', parseInt(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                  <option value={8}>8 spaces</option>
                </select>
              </div>
            </div>
          </div>

          {/* Output Section */}
          {phpOutput && (
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">PHP Array Output:</h2>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Copy
                </button>
              </div>
              <pre className="text-sm font-mono bg-white p-2 rounded border border-gray-200 overflow-auto max-h-60">
                {phpOutput}
              </pre>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Converts JSON to PHP array syntax</li>
              <li>Supports nested objects and arrays</li>
              <li>Customizable formatting options</li>
              <li>Handles strings, numbers, booleans, null</li>
              <li>Copy output to clipboard</li>
              <li>Example: {`{"key": "value"} `}→ ['key' =&gt; 'value']</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default JsonToPhpArray;