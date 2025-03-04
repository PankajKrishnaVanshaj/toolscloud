'use client';

import React, { useState } from 'react';

const CsvToHtmlTable = () => {
  const [csvInput, setCsvInput] = useState('');
  const [htmlTable, setHtmlTable] = useState('');
  const [error, setError] = useState('');
  const [options, setOptions] = useState({
    headers: true,
    bordered: true,
    striped: false,
    hover: true,
    responsive: false,
  });

  const parseCSV = (csv) => {
    const lines = csv.trim().split('\n').map(line => line.trim());
    if (lines.length === 0) return [];
    
    return lines.map(line => {
      const values = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
          inQuotes = !inQuotes;
        } else if (line[i] === ',' && !inQuotes) {
          values.push(current);
          current = '';
        } else {
          current += line[i];
        }
      }
      values.push(current);
      return values;
    });
  };

  const generateHtmlTable = () => {
    setError('');
    setHtmlTable('');

    if (!csvInput.trim()) {
      setError('Please enter CSV data');
      return;
    }

    try {
      const data = parseCSV(csvInput);
      if (data.length === 0) {
        setError('No valid CSV data found');
        return;
      }

      let classes = 'table';
      if (options.bordered) classes += ' table-bordered';
      if (options.striped) classes += ' table-striped';
      if (options.hover) classes += ' table-hover';

      let html = options.responsive ? '<div class="table-responsive">\n' : '';
      html += `  <table class="${classes}">\n`;

      if (options.headers && data.length > 0) {
        html += '    <thead>\n      <tr>\n';
        data[0].forEach(header => {
          html += `        <th>${escapeHtml(header)}</th>\n`;
        });
        html += '      </tr>\n    </thead>\n';
        data.shift(); // Remove header row from body data
      }

      html += '    <tbody>\n';
      data.forEach(row => {
        html += '      <tr>\n';
        row.forEach(cell => {
          html += `        <td>${escapeHtml(cell)}</td>\n`;
        });
        html += '      </tr>\n';
      });
      html += '    </tbody>\n  </table>\n';
      if (options.responsive) html += '</div>';

      setHtmlTable(html);
    } catch (err) {
      setError(`Error parsing CSV: ${err.message}`);
    }
  };

  const escapeHtml = (text) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvInput(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(htmlTable);
  };

  const handleOptionChange = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          CSV to HTML Table Converter
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
                placeholder="e.g., Name,Age,City\nJohn,25,New York\nJane,30,London"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
              />
            </div>
            <div className="flex gap-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <button
                onClick={generateHtmlTable}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Convert to HTML
              </button>
            </div>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Table Options</h2>
            <div className="grid gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.headers}
                  onChange={(e) => handleOptionChange('headers', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Use First Row as Headers
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.bordered}
                  onChange={(e) => handleOptionChange('bordered', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Bordered Table
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.striped}
                  onChange={(e) => handleOptionChange('striped', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Striped Rows
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.hover}
                  onChange={(e) => handleOptionChange('hover', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Hover Effect
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.responsive}
                  onChange={(e) => handleOptionChange('responsive', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Responsive Wrapper
              </label>
            </div>
          </div>

          {/* Output Section */}
          {htmlTable && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">HTML Table Output:</h2>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Copy to Clipboard
                </button>
              </div>
              <pre className="text-sm bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                {htmlTable}
              </pre>
              <div className="mt-4">
                <h3 className="text-md font-semibold mb-2">Preview:</h3>
                <div dangerouslySetInnerHTML={{ __html: htmlTable }} />
              </div>
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
              <li>Convert CSV to styled HTML tables</li>
              <li>Supports file upload or manual input</li>
              <li>Customizable with Bootstrap-like classes</li>
              <li>Handles quoted values and commas</li>
              <li>Preview and copy generated HTML</li>
              <li>Example: "Name,Age\nJohn,25" → &lt;table&gt;...&lt;/table&gt;</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default CsvToHtmlTable;