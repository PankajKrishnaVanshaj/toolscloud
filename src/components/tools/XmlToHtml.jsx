'use client';

import React, { useState } from 'react';

const XmlToHtml = () => {
  const [xmlInput, setXmlInput] = useState('');
  const [htmlOutput, setHtmlOutput] = useState('');
  const [error, setError] = useState('');
  const [options, setOptions] = useState({
    indent: 2,
    collapseContent: false,
    syntaxHighlight: true,
  });

  const xmlToHtml = (xml) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, 'application/xml');
      
      // Check for XML parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Invalid XML: ' + parserError.textContent);
      }

      const convertNode = (node, level = 0) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent.trim();
          return text ? `<span class="text-gray-800">${text}</span>` : '';
        }

        if (node.nodeType !== Node.ELEMENT_NODE) return '';

        const indent = ' '.repeat(level * options.indent);
        let html = options.syntaxHighlight
          ? `${indent}<span class="text-blue-600">&lt;${node.nodeName}</span>`
          : `${indent}<${node.nodeName}`;

        // Handle attributes
        if (node.attributes.length > 0) {
          for (let attr of node.attributes) {
            html += options.syntaxHighlight
              ? ` <span class="text-purple-600">${attr.name}</span>=<span class="text-green-600">"${attr.value}"</span>`
              : ` ${attr.name}="${attr.value}"`;
          }
        }

        html += options.syntaxHighlight ? '<span class="text-blue-600">&gt;</span>' : '>';

        // Handle child nodes
        const children = Array.from(node.childNodes)
          .map(child => convertNode(child, level + 1))
          .filter(Boolean);

        if (children.length > 0) {
          if (!options.collapseContent || children.length > 1 || node.childNodes[0].nodeType !== Node.TEXT_NODE) {
            html += '\n' + children.join('\n') + '\n' + indent;
          } else {
            html += children[0];
          }
        }

        html += options.syntaxHighlight
          ? `<span class="text-blue-600">&lt;/${node.nodeName}&gt;</span>`
          : `</${node.nodeName}>`;

        return html;
      };

      const htmlContent = Array.from(xmlDoc.childNodes)
        .map(node => convertNode(node))
        .join('\n');
      
      return `<pre class="p-4 bg-gray-100 rounded-md overflow-auto">${htmlContent}</pre>`;
    } catch (err) {
      setError(err.message);
      return '';
    }
  };

  const handleConvert = () => {
    setError('');
    setHtmlOutput('');
    if (!xmlInput.trim()) {
      setError('Please enter an XML string');
      return;
    }
    const html = xmlToHtml(xmlInput);
    setHtmlOutput(html);
  };

  const handleOptionChange = (key, value) => {
    setOptions(prev => {
      const newOptions = { ...prev, [key]: value };
      if (xmlInput) {
        setHtmlOutput(xmlToHtml(xmlInput));
      }
      return newOptions;
    });
  };

  const sampleXml = () => {
    const sample = `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <person id="1">
    <name>John Doe</name>
    <age>30</age>
  </person>
</root>`;
    setXmlInput(sample);
    setError('');
    setHtmlOutput(xmlToHtml(sample));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          XML to HTML Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                XML Input
              </label>
              <textarea
                value={xmlInput}
                onChange={(e) => setXmlInput(e.target.value)}
                placeholder="Enter your XML here..."
                className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleConvert}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Convert to HTML
              </button>
              <button
                onClick={sampleXml}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Load Sample
              </button>
            </div>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Options</h2>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Indent Size:</label>
                <select
                  value={options.indent}
                  onChange={(e) => handleOptionChange('indent', parseInt(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>No Indent</option>
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                  <option value={8}>8 Spaces</option>
                </select>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.collapseContent}
                  onChange={(e) => handleOptionChange('collapseContent', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Collapse Single Text Content
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.syntaxHighlight}
                  onChange={(e) => handleOptionChange('syntaxHighlight', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Syntax Highlighting
              </label>
            </div>
          </div>

          {/* Output Section */}
          {htmlOutput && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold mb-2">HTML Output:</h2>
              <div dangerouslySetInnerHTML={{ __html: htmlOutput }} />
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Converts XML to formatted HTML representation</li>
              <li>Supports syntax highlighting</li>
              <li>Customizable indentation and content collapsing</li>
              <li>Validates XML input</li>
              <li>Use "Load Sample" for a demo</li>
              <li>Output is pre-formatted for easy reading</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default XmlToHtml;