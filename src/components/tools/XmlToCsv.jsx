'use client';

import React, { useState } from 'react';

const XmlToCsv = () => {
  const [xmlInput, setXmlInput] = useState('');
  const [csvOutput, setCsvOutput] = useState('');
  const [delimiter, setDelimiter] = useState(',');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [error, setError] = useState('');

  const parseXML = (xmlString) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Invalid XML: ' + parserError.textContent);
      }
      return xmlDoc;
    } catch (err) {
      setError(`XML Parsing Error: ${err.message}`);
      return null;
    }
  };

  const xmlToCsv = () => {
    setError('');
    setCsvOutput('');

    if (!xmlInput.trim()) {
      setError('Please enter XML content');
      return;
    }

    const xmlDoc = parseXML(xmlInput);
    if (!xmlDoc) return;

    // Find all elements that could represent records
    const records = xmlDoc.documentElement.children;
    if (records.length === 0) {
      setError('No records found in XML');
      return;
    }

    // Extract headers from the first record
    const headers = new Set();
    Array.from(records[0].children).forEach(child => headers.add(child.tagName));

    // Convert to CSV
    let csvLines = [];
    if (includeHeaders) {
      csvLines.push(Array.from(headers).join(delimiter));
    }

    Array.from(records).forEach(record => {
      const row = Array.from(headers).map(header => {
        const node = record.querySelector(header);
        return node ? `"${node.textContent.replace(/"/g, '""')}"` : '';
      });
      csvLines.push(row.join(delimiter));
    });

    setCsvOutput(csvLines.join('\n'));
  };

  const handleConvert = (e) => {
    e.preventDefault();
    xmlToCsv();
  };

  const downloadCsv = () => {
    if (!csvOutput) return;
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'converted.csv');
    link.click();
    URL.revokeObjectURL(url);
  };

  const sampleXML = `<data>
  <record>
    <name>John Doe</name>
    <age>30</age>
    <city>New York</city>
  </record>
  <record>
    <name>Jane Smith</name>
    <age>25</age>
    <city>Los Angeles</city>
  </record>
</data>`;

  const handleSample = () => {
    setXmlInput(sampleXML);
    setError('');
    setCsvOutput('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          XML to CSV Converter
        </h1>

        <form onSubmit={handleConvert} className="grid gap-6">
          {/* XML Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              XML Input
            </label>
            <textarea
              value={xmlInput}
              onChange={(e) => setXmlInput(e.target.value)}
              placeholder="Paste your XML here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 font-mono text-sm"
            />
            <button
              type="button"
              onClick={handleSample}
              className="mt-2 px-4 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Load Sample XML
            </button>
          </div>

          {/* Options */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delimiter
              </label>
              <select
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="\t">Tab</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeHeaders}
                onChange={(e) => setIncludeHeaders(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Include Headers
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Convert to CSV
          </button>
        </form>

        {/* CSV Output */}
        {csvOutput && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">CSV Output:</h2>
              <button
                onClick={downloadCsv}
                className="px-4 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Download CSV
              </button>
            </div>
            <pre className="text-sm font-mono bg-white p-2 rounded border border-gray-200 overflow-auto max-h-40">
              {csvOutput}
            </pre>
          </div>
        )}

        {/* Error Section */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-md text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Converts XML to CSV format</li>
              <li>Supports custom delimiters (comma, semicolon, tab, pipe)</li>
              <li>Optional headers in output</li>
              <li>Download result as CSV file</li>
              <li>Load sample XML for testing</li>
              <li>Handles nested elements at the record level</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default XmlToCsv;