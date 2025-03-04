'use client';

import React, { useState } from 'react';

const CsvToXml = () => {
  const [csvInput, setCsvInput] = useState('');
  const [xmlOutput, setXmlOutput] = useState('');
  const [rootElement, setRootElement] = useState('root');
  const [rowElement, setRowElement] = useState('item');
  const [error, setError] = useState('');
  const [indentation, setIndentation] = useState(2); // Spaces for XML indentation

  const parseCSV = (csv) => {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(value => value.trim());
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index] || '';
        return obj;
      }, {});
    });
    return data;
  };

  const convertToXML = (data) => {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootElement}>\n`;
    data.forEach(item => {
      xml += `${' '.repeat(indentation)}<${rowElement}>\n`;
      Object.entries(item).forEach(([key, value]) => {
        xml += `${' '.repeat(indentation * 2)}<${key}>${escapeXML(value)}</${key}>\n`;
      });
      xml += `${' '.repeat(indentation)}</${rowElement}>\n`;
    });
    xml += `</${rootElement}>`;
    return xml;
  };

  const escapeXML = (str) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const handleConvert = () => {
    setError('');
    setXmlOutput('');

    if (!csvInput.trim()) {
      setError('Please enter CSV data');
      return;
    }

    try {
      const data = parseCSV(csvInput);
      const xml = convertToXML(data);
      setXmlOutput(xml);
    } catch (err) {
      setError(`Error converting CSV to XML: ${err.message}`);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvInput(event.target.result);
    };
    reader.onerror = () => {
      setError('Error reading file');
    };
    reader.readAsText(file);
  };

  const downloadXML = () => {
    if (!xmlOutput) return;
    const blob = new Blob([xmlOutput], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          CSV to XML Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CSV Input
              </label>
              <textarea
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder="name,age,city\nJohn,25,New York\nJane,30,London"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 font-mono text-sm"
              />
            </div>

            <div className="flex gap-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <button
                onClick={handleConvert}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Convert to XML
              </button>
            </div>
          </div>

          {/* Options Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Root Element Name
              </label>
              <input
                type="text"
                value={rootElement}
                onChange={(e) => setRootElement(e.target.value || 'root')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Row Element Name
              </label>
              <input
                type="text"
                value={rowElement}
                onChange={(e) => setRowElement(e.target.value || 'item')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Indentation (spaces)
              </label>
              <select
                value={indentation}
                onChange={(e) => setIndentation(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>0 (No indentation)</option>
                <option value={2}>2</option>
                <option value={4}>4</option>
                <option value={8}>8</option>
              </select>
            </div>
          </div>

          {/* Output Section */}
          {xmlOutput && (
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">XML Output:</h2>
                <button
                  onClick={downloadXML}
                  className="px-4 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Download XML
                </button>
              </div>
              <pre className="text-sm font-mono bg-white p-2 rounded border border-gray-200 overflow-auto max-h-60">
                {xmlOutput}
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
              <li>Convert CSV to XML with custom root and row elements</li>
              <li>Upload CSV files or paste text</li>
              <li>Adjustable XML indentation</li>
              <li>Downloadable XML output</li>
              <li>Escapes special XML characters</li>
              <li>Example CSV: "name,age\nJohn,25"</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default CsvToXml;