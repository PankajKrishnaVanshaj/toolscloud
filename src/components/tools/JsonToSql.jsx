'use client';

import React, { useState } from 'react';

const JsonToSql = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [tableName, setTableName] = useState('my_table');
  const [sqlOutput, setSqlOutput] = useState('');
  const [error, setError] = useState('');
  const [options, setOptions] = useState({
    includeCreateTable: true,
    inferTypes: true,
    wrapValues: true,
    batchSize: 100,
  });

  const inferSqlType = (value) => {
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'INTEGER' : 'FLOAT';
    } else if (typeof value === 'boolean') {
      return 'BOOLEAN';
    } else if (typeof value === 'string') {
      return value.match(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/) ? 'DATETIME' : 'VARCHAR(255)';
    } else if (value === null) {
      return 'VARCHAR(255)';
    }
    return 'TEXT';
  };

  const flattenObject = (obj, parent = '', result = {}) => {
    for (const [key, value] of Object.entries(obj)) {
      const newKey = parent ? `${parent}_${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        flattenObject(value, newKey, result);
      } else {
        result[newKey] = value;
      }
    }
    return result;
  };

  const generateSql = () => {
    setError('');
    setSqlOutput('');

    let parsedData;
    try {
      parsedData = JSON.parse(jsonInput);
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
      return;
    }

    if (!Array.isArray(parsedData) && typeof parsedData === 'object') {
      parsedData = [parsedData]; // Wrap single object in array
    }

    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      setError('JSON must be an array of objects or a single object');
      return;
    }

    // Flatten nested objects and get schema from first record
    const flattenedData = parsedData.map(item => flattenObject(item));
    const schema = Object.keys(flattenedData[0]).reduce((acc, key) => {
      acc[key] = options.inferTypes ? inferSqlType(flattenedData[0][key]) : 'VARCHAR(255)';
      return acc;
    }, {});

    let sql = '';

    // Generate CREATE TABLE statement
    if (options.includeCreateTable) {
      sql += `CREATE TABLE ${tableName} (\n`;
      sql += Object.entries(schema)
        .map(([key, type]) => `  ${key} ${type}`)
        .join(',\n');
      sql += '\n);\n\n';
    }

    // Generate INSERT statements
    const insertHeader = `INSERT INTO ${tableName} (${Object.keys(schema).join(', ')}) VALUES\n`;
    const batches = [];
    for (let i = 0; i < flattenedData.length; i += options.batchSize) {
      batches.push(flattenedData.slice(i, i + options.batchSize));
    }

    batches.forEach((batch, batchIndex) => {
      if (batchIndex > 0) sql += '\n';
      sql += insertHeader;
      sql += batch
        .map(row => {
          const values = Object.values(row).map(value => {
            if (value === null || value === undefined) return 'NULL';
            if (options.wrapValues) {
              return typeof value === 'string' ? `'${value.replace(/'/g, "''")}'` : value;
            }
            return value;
          });
          return `  (${values.join(', ')})`;
        })
        .join(',\n');
      sql += ';';
    });

    setSqlOutput(sql);
  };

  const handleOptionChange = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlOutput);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          JSON to SQL Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                JSON Input
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='[{"id": 1, "name": "John"}, {"id": 2, "name": "Jane"}]'
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 font-mono text-sm"
              />
            </div>

            <div>
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

            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Options</h2>
              <div className="grid gap-2 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.includeCreateTable}
                    onChange={(e) => handleOptionChange('includeCreateTable', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Include CREATE TABLE
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.inferTypes}
                    onChange={(e) => handleOptionChange('inferTypes', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Infer Data Types
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.wrapValues}
                    onChange={(e) => handleOptionChange('wrapValues', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Wrap String Values in Quotes
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Batch Size:</label>
                  <input
                    type="number"
                    value={options.batchSize}
                    onChange={(e) => handleOptionChange('batchSize', parseInt(e.target.value) || 100)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={generateSql}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Convert to SQL
            </button>
          </div>

          {/* Output Section */}
          {sqlOutput && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">SQL Output:</h2>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  Copy
                </button>
              </div>
              <pre className="text-sm font-mono overflow-auto max-h-60 bg-white p-2 rounded">
                {sqlOutput}
              </pre>
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
              <li>Converts JSON arrays or single objects to SQL INSERT statements</li>
              <li>Handles nested objects by flattening them</li>
              <li>Optional CREATE TABLE statement with inferred data types</li>
              <li>Customizable table name and batch size for large datasets</li>
              <li>Supports string escaping and null values</li>
              <li>Example:{` {"id": 1, "name": "John"}`} → INSERT INTO my_table (id, name) VALUES (1, 'John')</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default JsonToSql;