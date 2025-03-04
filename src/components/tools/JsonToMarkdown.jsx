'use client';

import React, { useState } from 'react';

const JsonToMarkdown = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [markdownOutput, setMarkdownOutput] = useState('');
  const [error, setError] = useState('');
  const [options, setOptions] = useState({
    tableForObjects: true,
    codeBlockForJson: false,
    headerLevel: 2,
    includeKeys: true,
    maxDepth: 5,
  });

  const parseJson = (input) => {
    try {
      return JSON.parse(input);
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
      return null;
    }
  };

  const jsonToMarkdown = (data, depth = 0) => {
    if (depth > options.maxDepth) return '*[Depth limit reached]*';
    if (data === null) return 'null';
    if (data === undefined) return 'undefined';

    const indent = '  '.repeat(depth);

    if (Array.isArray(data)) {
      if (data.length === 0) return `${indent}- (empty array)`;
      return data.map((item, index) => {
        const value = jsonToMarkdown(item, depth + 1);
        return `${indent}- ${options.includeKeys ? `Item ${index}: ` : ''}${value}`;
      }).join('\n');
    }

    if (typeof data === 'object') {
      if (Object.keys(data).length === 0) return `${indent}(empty object)`;

      if (options.tableForObjects && depth === 0) {
        const headers = Object.keys(data);
        const values = headers.map(key => {
          const value = data[key];
          return typeof value === 'object' ? JSON.stringify(value) : value;
        });
        const headerRow = `| ${headers.join(' | ')} |`;
        const separator = `| ${headers.map(() => '---').join(' | ')} |`;
        const valueRow = `| ${values.map(v => String(v)).join(' | ')} |`;
        return `${headerRow}\n${separator}\n${valueRow}`;
      }

      return Object.entries(data).map(([key, value]) => {
        const formattedValue = jsonToMarkdown(value, depth + 1);
        return `${indent}${options.headerLevel > 0 ? '#'.repeat(options.headerLevel + depth) + ' ' : ''}${key}${options.includeKeys ? ': ' : ''}${formattedValue}`;
      }).join('\n');
    }

    return String(data);
  };

  const convertJsonToMarkdown = () => {
    setError('');
    setMarkdownOutput('');

    const jsonData = parseJson(jsonInput);
    if (!jsonData) return;

    const markdown = options.codeBlockForJson
      ? `\`\`\`markdown\n${jsonToMarkdown(jsonData)}\n\`\`\``
      : jsonToMarkdown(jsonData);
    setMarkdownOutput(markdown);
  };

  const handleInputChange = (value) => {
    setJsonInput(value);
    setError('');
  };

  const handleOptionChange = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    convertJsonToMarkdown();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdownOutput);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          JSON to Markdown Converter
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                JSON Input
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder='e.g., {"name": "John", "age": 30, "skills": ["JavaScript", "React"]}'
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 font-mono text-sm"
              />
            </div>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Conversion Options</h2>
            <div className="grid gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.tableForObjects}
                  onChange={(e) => handleOptionChange('tableForObjects', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Use Tables for Top-Level Objects
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.codeBlockForJson}
                  onChange={(e) => handleOptionChange('codeBlockForJson', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Wrap Output in Code Block
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.includeKeys}
                  onChange={(e) => handleOptionChange('includeKeys', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Include Key Names
              </label>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Header Level:</label>
                <select
                  value={options.headerLevel}
                  onChange={(e) => handleOptionChange('headerLevel', parseInt(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>None</option>
                  <option value={1}>H1</option>
                  <option value={2}>H2</option>
                  <option value={3}>H3</option>
                  <option value={4}>H4</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Max Nesting Depth:</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={options.maxDepth}
                  onChange={(e) => handleOptionChange('maxDepth', parseInt(e.target.value))}
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Convert to Markdown
          </button>
        </form>

        {/* Error Section */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-md text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* Output Section */}
        {markdownOutput && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Markdown Output:</h2>
              <button
                onClick={copyToClipboard}
                className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                Copy
              </button>
            </div>
            <pre className="text-sm font-mono whitespace-pre-wrap">{markdownOutput}</pre>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Converts JSON to Markdown with customizable formatting</li>
              <li>Supports nested objects and arrays</li>
              <li>Table generation for top-level objects</li>
              <li>Code block wrapping option</li>
              <li>Adjustable header levels and depth</li>
              <li>Example: {`{"name": "John", "age": 30}`} → | name | age | \n| --- | --- | \n| John | 30 |</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default JsonToMarkdown;