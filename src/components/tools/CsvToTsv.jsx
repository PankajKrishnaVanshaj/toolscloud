'use client';

import React, { useState } from 'react';

const CsvToTsv = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [inputDelimiter, setInputDelimiter] = useState(',');
  const [outputDelimiter, setOutputDelimiter] = useState('\t');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('converted');

  const parseCSVorTSV = (text, delimiter) => {
    try {
      const rows = text.trim().split('\n').map(row => row.split(delimiter));
      return rows;
    } catch (err) {
      setError(`Error parsing input: ${err.message}`);
      return [];
    }
  };

  const convertToOutputFormat = (rows, delimiter) => {
    return rows.map(row => row.join(delimiter)).join('\n');
  };

  const handleConvert = () => {
    setError('');
    setOutputText('');

    if (!inputText.trim()) {
      setError('Please enter or upload some text');
      return;
    }

    const rows = parseCSVorTSV(inputText, inputDelimiter);
    if (rows.length === 0) return;

    const converted = convertToOutputFormat(rows, outputDelimiter);
    setOutputText(converted);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name.split('.')[0]);
    const reader = new FileReader();
    reader.onload = (event) => {
      setInputText(event.target.result);
      setError('');
    };
    reader.onerror = () => setError('Error reading file');
    reader.readAsText(file);
  };

  const downloadFile = () => {
    if (!outputText) return;

    const extension = outputDelimiter === '\t' ? 'tsv' : 'csv';
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const swapDelimiters = () => {
    setInputDelimiter(outputDelimiter);
    setOutputDelimiter(inputDelimiter);
    setInputText(outputText);
    setOutputText('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          CSV to TSV Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Text
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your CSV/TSV here (e.g., a,b,c\n1,2,3)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-y"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Input Delimiter
                </label>
                <select
                  value={inputDelimiter}
                  onChange={(e) => setInputDelimiter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value=",">Comma (,)</option>
                  <option value="\t">Tab (\t)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Output Delimiter
                </label>
                <select
                  value={outputDelimiter}
                  onChange={(e) => setOutputDelimiter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="\t">Tab (\t)</option>
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <input
                type="file"
                accept=".csv,.tsv,.txt"
                onChange={handleFileUpload}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <button
                onClick={swapDelimiters}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
              >
                Swap Delimiters
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleConvert}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Convert
            </button>
            <button
              onClick={downloadFile}
              disabled={!outputText}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300"
            >
              Download
            </button>
          </div>

          {/* Output Section */}
          {outputText && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Output:</h2>
              <textarea
                value={outputText}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 h-32 resize-y"
              />
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
              <li>Convert between CSV and TSV formats</li>
              <li>Custom input and output delimiters (comma, tab, semicolon, pipe)</li>
              <li>File upload support (.csv, .tsv, .txt)</li>
              <li>Swap delimiters to reverse conversion</li>
              <li>Download converted file</li>
              <li>Example: "a,b,c" → "a\tb\tc"</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default CsvToTsv;