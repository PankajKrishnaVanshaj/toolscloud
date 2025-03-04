'use client';

import React, { useState } from 'react';
import yaml from 'js-yaml';

const YamlToXml = () => {
  const [yamlInput, setYamlInput] = useState('');
  const [xmlOutput, setXmlOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2); // XML indentation spaces
  const [rootNode, setRootNode] = useState('root'); // Default root node name

  const convertYamlToXml = (yamlText) => {
    setError('');
    setXmlOutput('');

    if (!yamlText.trim()) {
      setError('Please enter YAML input');
      return;
    }

    try {
      // Parse YAML to JSON
      const jsonData = yaml.load(yamlText);

      // Convert JSON to XML
      const xml = jsonToXml(jsonData, rootNode, 0);
      setXmlOutput(xml);
    } catch (err) {
      setError(`Invalid YAML: ${err.message}`);
    }
  };

  const jsonToXml = (obj, nodeName, level) => {
    const indentStr = ' '.repeat(level * indent);

    // Handle null or undefined
    if (obj === null || obj === undefined) {
      return `${indentStr}<${nodeName}/>`;
    }

    // Handle primitive types
    if (typeof obj !== 'object') {
      return `${indentStr}<${nodeName}>${escapeXml(obj.toString())}</${nodeName}>`;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj
        .map(item => jsonToXml(item, 'item', level))
        .join('\n');
    }

    // Handle objects
    const children = Object.entries(obj)
      .map(([key, value]) => jsonToXml(value, key, level + 1))
      .join('\n');

    return children
      ? `${indentStr}<${nodeName}>\n${children}\n${indentStr}</${nodeName}>`
      : `${indentStr}<${nodeName}/>`;
  };

  const escapeXml = (unsafe) => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case "'": return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  };

  const handleConvert = () => {
    convertYamlToXml(yamlInput);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          YAML to XML Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                YAML Input
              </label>
              <textarea
                value={yamlInput}
                onChange={(e) => setYamlInput(e.target.value)}
                placeholder="Enter YAML here..."
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                XML Output
              </label>
              <textarea
                value={xmlOutput}
                readOnly
                placeholder="XML output will appear here..."
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
              />
              {xmlOutput && (
                <button
                  onClick={() => copyToClipboard(xmlOutput)}
                  className="mt-2 px-4 py-1 bg-gray-200 rounded hover:bg-gray-300 w-full text-sm"
                >
                  Copy to Clipboard
                </button>
              )}
            </div>
          </div>

          {/* Options Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Root Node Name
              </label>
              <input
                type="text"
                value={rootNode}
                onChange={(e) => setRootNode(e.target.value || 'root')}
                placeholder="e.g., root"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                XML Indentation (spaces)
              </label>
              <select
                value={indent}
                onChange={(e) => setIndent(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={0}>No indentation</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleConvert}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Convert to XML
          </button>

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
              <li>Converts YAML to XML with proper nesting</li>
              <li>Supports custom root node name</li>
              <li>Adjustable XML indentation</li>
              <li>Handles arrays and primitive types</li>
              <li>Copy output to clipboard</li>
              <li>Example YAML: `name: John\nage: 30` → `<root><name>John</name><age>30</age></root>`</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default YamlToXml;