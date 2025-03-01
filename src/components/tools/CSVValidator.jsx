"use client";

import React, { useState } from 'react';

const CSVValidator = () => {
  const [csvInput, setCsvInput] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const validateCSV = (csvData) => {
    setError(null);
    setValidationResult(null);

    if (!csvData.trim()) {
      setError('Please provide CSV data');
      return;
    }

    try {
      const lines = csvData.split('\n').filter(line => line.trim() !== '');
      if (lines.length === 0) {
        setError('Empty CSV data');
        return;
      }

      // Parse CSV
      const rows = lines.map(line => {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let char of line) {
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim()); // Add last value
        return values;
      });

      const headers = rows[0];
      const columnCount = headers.length;
      const issues = [];
      const columnStats = headers.map(() => ({ empty: 0, nonEmpty: 0 }));

      // Validate rows
      rows.forEach((row, index) => {
        if (row.length !== columnCount) {
          issues.push({
            row: index + 1,
            message: `Inconsistent column count: expected ${columnCount}, got ${row.length}`
          });
        }

        row.forEach((cell, colIndex) => {
          if (cell === '') {
            columnStats[colIndex].empty++;
          } else {
            columnStats[colIndex].nonEmpty++;
          }
        });
      });

      // Check for entirely empty columns
      columnStats.forEach((stat, index) => {
        if (stat.nonEmpty === 0) {
          issues.push({
            row: 0,
            message: `Column "${headers[index]}" (index ${index}) is completely empty`
          });
        }
      });

      setValidationResult({
        headers,
        rowCount: rows.length,
        columnCount,
        issues,
        columnStats
      });
    } catch (err) {
      setError('Error parsing CSV: ' + err.message);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file.name);

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      setValidationResult(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      validateCSV(e.target.result);
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    validateCSV(csvInput);
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">CSV Validator</h2>

        {/* Input Options */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paste CSV Data
            </label>
            <textarea
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="name,age,city\nJohn,25,New York\nJane,,London"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">OR</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>
          {selectedFile && <p className="text-sm text-gray-600">Selected: {selectedFile}</p>}
          <button
            onClick={handleSubmit}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Validate CSV
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Validation Results */}
        {validationResult && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700 mb-2">Summary</h3>
              <p className="text-sm text-gray-600">
                Rows: {validationResult.rowCount} | Columns: {validationResult.columnCount}
              </p>
              <p className="text-sm text-gray-600">
                Issues found: {validationResult.issues.length}
              </p>
            </div>

            {validationResult.issues.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-gray-700 mb-2">Issues</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  {validationResult.issues.map((issue, index) => (
                    <li key={index}>
                      Row {issue.row}: {issue.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700 mb-2">Column Statistics</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                      <th className="px-4 py-2">Column</th>
                      <th className="px-4 py-2">Empty</th>
                      <th className="px-4 py-2">Non-Empty</th>
                      <th className="px-4 py-2">Fill Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validationResult.headers.map((header, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2 font-mono">{header || `Column ${index + 1}`}</td>
                        <td className="px-4 py-2">{validationResult.columnStats[index].empty}</td>
                        <td className="px-4 py-2">{validationResult.columnStats[index].nonEmpty}</td>
                        <td className="px-4 py-2">
                          {((validationResult.columnStats[index].nonEmpty / 
                            (validationResult.columnStats[index].empty + validationResult.columnStats[index].nonEmpty)) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CSVValidator;