'use client';

import React, { useState } from 'react';

const TsvToCsv = () => {
  const [tsvInput, setTsvInput] = useState('');
  const [csvOutput, setCsvOutput] = useState('');
  const [delimiter, setDelimiter] = useState(',');
  const [quoteFields, setQuoteFields] = useState(true);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('converted.csv');

  const convertTsvToCsv = (tsv) => {
    try {
      setError('');
      if (!tsv.trim()) {
        setError('Please enter TSV data or upload a file');
        return '';
      }

      const rows = tsv.split('\n').map(row => row.trim());
      const csvRows = rows.map(row => {
        const fields = row.split('\t');
        return fields.map(field => {
          const trimmed = field.trim();
          if (quoteFields || trimmed.includes(delimiter) || trimmed.includes('"') || trimmed.includes('\n')) {
            return `"${trimmed.replace(/"/g, '""')}"`;
          }
          return trimmed;
        }).join(delimiter);
      });
      
      return csvRows.join('\n');
    } catch (err) {
      setError(`Conversion error: ${err.message}`);
      return '';
    }
  };

  const handleInputChange = (value) => {
    setTsvInput(value);
    setCsvOutput(convertTsvToCsv(value));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name.replace('.tsv', '.csv'));
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setTsvInput(text);
      setCsvOutput(convertTsvToCsv(text));
    };
    reader.onerror = () => setError('Error reading file');
    reader.readAsText(file);
  };

  const downloadCsv = () => {
    if (!csvOutput) {
      setError('No CSV data to download');
      return;
    }

    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setTsvInput('');
    setCsvOutput('');
    setError('');
    setFileName('converted.csv');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          TSV to CSV Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                TSV Input
              </label>
              <textarea
                value={tsvInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Paste TSV data here (e.g., column1\tcolumn2\nvalue1\tvalue2)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 resize-y"
              />
            </div>

            <div className="flex gap-4">
              <label className="block text-sm font-medium text-gray-700">
                Upload TSV File
                <input
                  type="file"
                  accept=".tsv,.txt"
                  onChange={handleFileUpload}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </label>
              <div className="flex items-end gap-2">
                <button
                  onClick={clearAll}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Conversion Options</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CSV Delimiter
                </label>
                <select
                  value={delimiter}
                  onChange={(e) => {
                    setDelimiter(e.target.value);
                    setCsvOutput(convertTsvToCsv(tsvInput));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value=" ">Space</option>
                  <option value="\t">Tab</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={quoteFields}
                  onChange={(e) => {
                    setQuoteFields(e.target.checked);
                    setCsvOutput(convertTsvToCsv(tsvInput));
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Quote all fields
                </label>
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CSV Output
            </label>
            <textarea
              value={csvOutput}
              readOnly
              placeholder="CSV output will appear here"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 h-40 resize-y"
            />
            <div className="mt-2 flex justify-between items-center">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="File name"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={downloadCsv}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Download CSV
              </button>
            </div>
          </div>

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
              <li>Convert TSV to CSV with custom delimiters</li>
              <li>Upload TSV files or paste text</li>
              <li>Optional field quoting</li>
              <li>Download converted CSV</li>
              <li>Handles quotes and special characters</li>
              <li>Example TSV: "Name\tAge\nJohn\t30"</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TsvToCsv;