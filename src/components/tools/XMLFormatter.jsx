"use client";

import React, { useState } from 'react';

const XMLFormatter = () => {
  const [inputXML, setInputXML] = useState('');
  const [formattedXML, setFormattedXML] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const formatXML = (xmlString) => {
    setError(null);
    setFormattedXML('');
    setCopied(false);

    if (!xmlString.trim()) {
      setError('Please enter some XML to format');
      return;
    }

    try {
      // Parse the XML string
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
      const errorNode = xmlDoc.querySelector('parsererror');
      if (errorNode) {
        throw new Error('Invalid XML: Parsing error');
      }

      // Format the XML with indentation
      const formatNode = (node, level = 0) => {
        const indent = '  '.repeat(level);
        let result = '';

        if (node.nodeType === Node.ELEMENT_NODE) {
          const tagName = node.tagName;
          const attributes = Array.from(node.attributes)
            .map(attr => `${attr.name}="${attr.value}"`)
            .join(' ');
          
          result += `${indent}<${tagName}${attributes ? ' ' + attributes : ''}`;

          const children = Array.from(node.childNodes);
          if (children.length === 0) {
            result += ' />\n';
          } else {
            result += '>\n';
            children.forEach(child => {
              result += formatNode(child, level + 1);
            });
            result += `${indent}</${tagName}>\n`;
          }
        } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
          result += `${indent}${node.textContent.trim()}\n`;
        } else if (node.nodeType === Node.COMMENT_NODE) {
          result += `${indent}<!--${node.textContent}-->\n`;
        }

        return result;
      };

      const formatted = formatNode(xmlDoc.documentElement);
      setFormattedXML(formatted.trim());
    } catch (err) {
      setError('Error formatting XML: ' + err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    formatXML(inputXML);
  };

  const handleCopy = () => {
    if (formattedXML) {
      navigator.clipboard.writeText(formattedXML);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">XML Formatter</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Input XML
            </label>
            <textarea
              value={inputXML}
              onChange={(e) => setInputXML(e.target.value)}
              className="w-full h-48 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder='<root><child attr="value">Text</child></root>'
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Format XML
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Formatted Output */}
        {formattedXML && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Formatted XML</h3>
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
              {formattedXML}
            </pre>
          </div>
        )}

        {/* Instructions */}
        {!formattedXML && !error && (
          <div className="mt-4 text-sm text-gray-600">
            <p>Enter raw XML to format it with proper indentation.</p>
            <p className="mt-1">Example:</p>
            <pre className="mt-1 font-mono">
              {'<root><child attr="value">Text</child></root>'}
            </pre>
            <p className="mt-1">Becomes:</p>
            <pre className="mt-1 font-mono">
              {`<root>
  <child attr="value">
    Text
  </child>
</root>`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default XMLFormatter;