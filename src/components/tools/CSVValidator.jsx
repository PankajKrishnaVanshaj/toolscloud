"use client";

import React, { useState, useCallback, useRef } from 'react';
import { FaUpload, FaDownload, FaSync, FaEye } from 'react-icons/fa';

const CSVValidator = () => {
  const [csvInput, setCsvInput] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [delimiter, setDelimiter] = useState(',');
  const [showPreview, setShowPreview] = useState(false);
  const [validationOptions, setValidationOptions] = useState({
    checkColumnCount: true,
    checkEmptyColumns: true,
    checkEmptyRows: true,
    checkQuotes: true,
  });
  const fileInputRef = useRef(null);

  const validateCSV = useCallback((csvData) => {
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

      // Parse CSV with custom delimiter
      const rows = lines.map(line => {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let char of line) {
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === delimiter && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim());
        return values;
      });

      const headers = rows[0];
      const columnCount = headers.length;
      const issues = [];
      const columnStats = headers.map(() => ({ empty: 0, nonEmpty: 0 }));
      let previewData = rows.slice(0, 5); // First 5 rows for preview

      // Validation checks
      rows.forEach((row, index) => {
        // Column count consistency
        if (validationOptions.checkColumnCount && row.length !== columnCount) {
          issues.push({
            row: index + 1,
            message: `Inconsistent column count: expected ${columnCount}, got ${row.length}`
          });
        }

        // Empty rows
        if (validationOptions.checkEmptyRows && row.every(cell => cell.trim() === '')) {
          issues.push({
            row: index + 1,
            message: 'Row is completely empty'
          });
        }

        // Quote validation
        if (validationOptions.checkQuotes) {
          row.forEach((cell, colIndex) => {
            const quoteCount = (cell.match(/"/g) || []).length;
            if (quoteCount % 2 !== 0) {
              issues.push({
                row: index + 1,
                message: `Unmatched quotes in column "${headers[colIndex] || `Column ${colIndex + 1}`}"`
              });
            }
          });
        }

        // Column stats
        row.forEach((cell, colIndex) => {
          if (colIndex < columnCount) { // Ensure index is within bounds
            if (cell.trim() === '') {
              columnStats[colIndex].empty++;
            } else {
              columnStats[colIndex].nonEmpty++;
            }
          }
        });
      });

      // Empty columns
      if (validationOptions.checkEmptyColumns) {
        columnStats.forEach((stat, index) => {
          if (stat.nonEmpty === 0) {
            issues.push({
              row: 0,
              message: `Column "${headers[index] || `Column ${index + 1}`}" (index ${index}) is completely empty`
            });
          }
        });
      }

      setValidationResult({
        headers,
        rowCount: rows.length,
        columnCount,
        issues,
        columnStats,
        previewData
      });
    } catch (err) {
      setError('Error parsing CSV: ' + err.message);
    }
  }, [delimiter, validationOptions]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file.name);
    setError(null);

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

  const handleDownload = () => {
    if (!validationResult) return;
    const report = {
      summary: {
        rowCount: validationResult.rowCount,
        columnCount: validationResult.columnCount,
        issuesCount: validationResult.issues.length
      },
      issues: validationResult.issues,
      columnStats: validationResult.headers.map((header, i) => ({
        name: header,
        empty: validationResult.columnStats[i].empty,
        nonEmpty: validationResult.columnStats[i].nonEmpty
      }))
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `csv-validation-report-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setCsvInput('');
    setValidationResult(null);
    setError(null);
    setSelectedFile(null);
    setShowPreview(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">CSV Validator</h1>

        {/* Input Options */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Paste CSV Data</label>
            <textarea
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              className="w-full h-48 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`name${delimiter}age${delimiter}city\nJohn${delimiter}25${delimiter}New York\nJane${delimiter}${delimiter}London`}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <span className="text-sm text-gray-600">OR</span>
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="flex-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          {selectedFile && <p className="text-sm text-gray-600">Selected: {selectedFile}</p>}
        </div>

        {/* Validation Options */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Validation Options</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delimiter</label>
              <select
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="\t">Tab (\t)</option>
              </select>
            </div>
            <div className="space-y-2">
              {Object.entries(validationOptions).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setValidationOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">
                    {key.replace(/check/, '').replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSubmit}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FaUpload className="mr-2" /> Validate CSV
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Validation Results */}
        {validationResult && (
          <div className="mt-6 space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
              <h2 className="font-semibold text-gray-700 mb-2">Summary</h2>
              <p className="text-sm text-gray-600">
                Rows: {validationResult.rowCount} | Columns: {validationResult.columnCount} | Issues: {validationResult.issues.length}
              </p>
            </div>

            {validationResult.issues.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
                <h2 className="font-semibold text-gray-700 mb-2">Issues</h2>
                <ul className="space-y-2 text-sm text-gray-600 max-h-48 overflow-y-auto">
                  {validationResult.issues.map((issue, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-red-500 mr-2">✗</span> Row {issue.row}: {issue.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
              <h2 className="font-semibold text-gray-700 mb-2">Column Statistics</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                      <th className="px-4 py-3">Column</th>
                      <th className="px-4 py-3">Empty</th>
                      <th className="px-4 py-3">Non-Empty</th>
                      <th className="px-4 py-3">Fill Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validationResult.headers.map((header, index) => {
                      const total = validationResult.columnStats[index].empty + validationResult.columnStats[index].nonEmpty;
                      const fillRate = total ? ((validationResult.columnStats[index].nonEmpty / total) * 100).toFixed(1) : 0;
                      return (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2 font-mono">{header || `Column ${index + 1}`}</td>
                          <td className="px-4 py-2">{validationResult.columnStats[index].empty}</td>
                          <td className="px-4 py-2">{validationResult.columnStats[index].nonEmpty}</td>
                          <td className="px-4 py-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${fillRate >= 75 ? 'bg-green-500' : fillRate >= 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${fillRate}%` }}
                              ></div>
                            </div>
                            <span className="ml-2">{fillRate}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Preview */}
            <div>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="w-full py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                <FaEye className="mr-2" /> {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
              {showPreview && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                      <tr>
                        {validationResult.headers.map((header, index) => (
                          <th key={index} className="px-4 py-3">{header || `Column ${index + 1}`}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {validationResult.previewData.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-2">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <button
              onClick={handleDownload}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Validation Report
            </button>
          </div>
        )}

        {!validationResult && !error && (
          <div className="mt-6 text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">
              Enter CSV data or upload a file to validate
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Validate CSV structure and consistency</li>
            <li>Customizable delimiter (comma, semicolon, tab)</li>
            <li>Configurable validation rules</li>
            <li>Preview first 5 rows</li>
            <li>Column fill rate visualization</li>
            <li>Downloadable validation report</li>
            <li>Support for file upload and text input</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CSVValidator;