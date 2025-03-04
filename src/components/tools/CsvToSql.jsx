'use client';

import React, { useState } from 'react';

const CsvToSql = () => {
  const [csvInput, setCsvInput] = useState('');
  const [sqlOutput, setSqlOutput] = useState('');
  const [tableName, setTableName] = useState('my_table');
  const [dialect, setDialect] = useState('mysql'); // MySQL, PostgreSQL, SQLite
  const [inferTypes, setInferTypes] = useState(true);
  const [error, setError] = useState('');

  const parseCSV = (csv) => {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => line.split(',').map(v => v.trim()));
    return { headers, rows };
  };

  const inferDataType = (value) => {
    if (!inferTypes) return 'TEXT';
    if (/^\d+$/.test(value)) return 'INTEGER';
    if (/^\d*\.\d+$/.test(value)) return 'FLOAT';
    if (/^(true|false)$/i.test(value)) return 'BOOLEAN';
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'DATE';
    return 'TEXT';
  };

  const generateSQL = () => {
    setError('');
    setSqlOutput('');

    if (!csvInput.trim()) {
      setError('Please enter CSV data');
      return;
    }

    try {
      const { headers, rows } = parseCSV(csvInput);
      if (rows.length === 0) {
        setError('No data rows found in CSV');
        return;
      }

      // Infer column types from first row
      const columnTypes = headers.map((_, index) => 
        inferDataType(rows[0][index] || '')
      );

      let sql = '';
      
      // Create table statement (optional for MySQL/PostgreSQL)
      if (dialect === 'mysql' || dialect === 'postgresql') {
        sql += `CREATE TABLE ${tableName} (\n`;
        sql += headers.map((header, i) => `  "${header}" ${columnTypes[i]}`).join(',\n');
        sql += '\n);\n\n';
      }

      // Insert statements
      sql += rows.map(row => {
        const values = row.map((value, i) => {
          const type = columnTypes[i];
          if (type === 'INTEGER' || type === 'FLOAT') return value || '0';
          if (type === 'BOOLEAN') return value.toLowerCase() === 'true' ? 'TRUE' : 'FALSE';
          if (type === 'DATE' || type === 'TEXT') return `'${value.replace(/'/g, "''")}'`;
          return `'${value}'`;
        });
        return `INSERT INTO ${tableName} ("${headers.join('","')}") VALUES (${values.join(',')});`;
      }).join('\n');

      setSqlOutput(sql);
    } catch (err) {
      setError(`Error parsing CSV: ${err.message}`);
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlOutput);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          CSV to SQL Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CSV Input (comma-separated)
              </label>
              <textarea
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder="name,age,city\nJohn,25,New York\nJane,30,London"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 font-mono text-sm"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Table Name
                </label>
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SQL Dialect
                </label>
                <select
                  value={dialect}
                  onChange={(e) => setDialect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mysql">MySQL</option>
                  <option value="postgresql">PostgreSQL</option>
                  <option value="sqlite">SQLite</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={inferTypes}
                  onChange={(e) => setInferTypes(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Infer Data Types
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <button
              onClick={generateSQL}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Convert to SQL
            </button>
          </div>

          {/* Output Section */}
          {sqlOutput && (
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">SQL Output:</h2>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  Copy to Clipboard
                </button>
              </div>
              <pre className="text-sm font-mono bg-white p-2 rounded overflow-auto max-h-60">
                {sqlOutput}
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
              <li>Converts CSV to SQL INSERT statements</li>
              <li>Supports MySQL, PostgreSQL, and SQLite dialects</li>
              <li>Infers data types (INTEGER, FLOAT, BOOLEAN, DATE, TEXT)</li>
              <li>Upload CSV files or paste text</li>
              <li>Custom table name</li>
              <li>Example: "name,age\nJohn,25" → INSERT INTO my_table ("name","age") VALUES ('John',25);</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default CsvToSql;