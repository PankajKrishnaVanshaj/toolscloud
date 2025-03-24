"use client";

import React, { useState, useCallback, useRef } from 'react';
import { FaUpload, FaDownload, FaSync, FaSort } from 'react-icons/fa';

const CodeCoverageAnalyzer = () => {
  const [coverageData, setCoverageData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [threshold, setThreshold] = useState(80);
  const [sortBy, setSortBy] = useState({ field: 'path', direction: 'asc' });
  const [filterText, setFilterText] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file.name);
    setError(null);

    if (!file.name.endsWith('.json')) {
      setError('Please upload a JSON coverage file');
      setCoverageData(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        analyzeCoverage(data);
      } catch (err) {
        setError('Invalid JSON file: ' + err.message);
        setCoverageData(null);
      }
    };
    reader.readAsText(file);
  };

  const analyzeCoverage = useCallback((data) => {
    const totals = {
      statements: { covered: 0, total: 0 },
      branches: { covered: 0, total: 0 },
      functions: { covered: 0, total: 0 },
      lines: { covered: 0, total: 0 }
    };

    const files = [];

    Object.entries(data).forEach(([filePath, metrics]) => {
      const fileStats = {
        path: filePath,
        statements: { covered: metrics.s?.covered || 0, total: metrics.s?.total || 0 },
        branches: { covered: metrics.b?.covered || 0, total: metrics.b?.total || 0 },
        functions: { covered: metrics.f?.covered || 0, total: metrics.f?.total || 0 },
        lines: { covered: metrics.l?.covered || 0, total: metrics.l?.total || 0 }
      };

      totals.statements.covered += fileStats.statements.covered;
      totals.statements.total += fileStats.statements.total;
      totals.branches.covered += fileStats.branches.covered;
      totals.branches.total += fileStats.branches.total;
      totals.functions.covered += fileStats.functions.covered;
      totals.functions.total += fileStats.functions.total;
      totals.lines.covered += fileStats.lines.covered;
      totals.lines.total += fileStats.lines.total;

      files.push(fileStats);
    });

    const summary = {
      statements: totals.statements.total ? (totals.statements.covered / totals.statements.total * 100).toFixed(1) : 0,
      branches: totals.branches.total ? (totals.branches.covered / totals.branches.total * 100).toFixed(1) : 0,
      functions: totals.functions.total ? (totals.functions.covered / totals.functions.total * 100).toFixed(1) : 0,
      lines: totals.lines.total ? (totals.lines.covered / totals.lines.total * 100).toFixed(1) : 0
    };

    setCoverageData({ totals, files, summary });
  }, []);

  const getCoverageColor = (percentage) => {
    if (percentage >= threshold) return 'bg-green-500';
    if (percentage >= threshold - 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const sortFiles = (files) => {
    return [...files].sort((a, b) => {
      const field = sortBy.field;
      if (field === 'path') {
        return sortBy.direction === 'asc' ? a.path.localeCompare(b.path) : b.path.localeCompare(a.path);
      }
      const aPercent = a[field].total ? (a[field].covered / a[field].total * 100) : 0;
      const bPercent = b[field].total ? (b[field].covered / b[field].total * 100) : 0;
      return sortBy.direction === 'asc' ? aPercent - bPercent : bPercent - aPercent;
    });
  };

  const filterFiles = (files) => {
    return filterText ? files.filter(file => file.path.toLowerCase().includes(filterText.toLowerCase())) : files;
  };

  const handleSort = (field) => {
    setSortBy(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleDownload = () => {
    if (!coverageData) return;
    const report = {
      summary: coverageData.summary,
      files: coverageData.files
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `coverage-report-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setCoverageData(null);
    setError(null);
    setSelectedFile(null);
    setFilterText('');
    setSortBy({ field: 'path', direction: 'asc' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Code Coverage Analyzer</h1>

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Coverage Report (JSON)
            </label>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFile && <p className="mt-2 text-sm text-gray-600">Selected: {selectedFile}</p>}
          </div>
          <div className="flex-1 flex flex-col sm:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Threshold (%)</label>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(Math.max(0, Math.min(100, e.target.value)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
              />
            </div>
            <button
              onClick={handleReset}
              className="mt-auto py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Coverage Results */}
        {coverageData && (
          <div className="space-y-6">
            {/* Overall Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(coverageData.summary).map(([type, percentage]) => (
                <div key={type} className="p-4 bg-gray-50 rounded-lg shadow-sm">
                  <h2 className="font-semibold text-gray-700 capitalize">{type}</h2>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${getCoverageColor(percentage)} h-3 rounded-full transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {percentage}% ({coverageData.totals[type].covered}/{coverageData.totals[type].total})
                  </p>
                </div>
              ))}
            </div>

            {/* File Breakdown */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
                <h2 className="text-lg font-semibold text-gray-700">File Breakdown</h2>
                <div className="flex gap-3 w-full sm:w-auto">
                  <input
                    type="text"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder="Filter files..."
                    className="w-full sm:w-64 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleDownload}
                    className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                  >
                    <FaDownload className="mr-2" /> Download Report
                  </button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                    <tr>
                      {['path', 'statements', 'branches', 'functions', 'lines'].map(field => (
                        <th
                          key={field}
                          className="px-4 py-3 cursor-pointer hover:bg-gray-200"
                          onClick={() => handleSort(field)}
                        >
                          <div className="flex items-center">
                            {field.charAt(0).toUpperCase() + field.slice(1)}
                            <FaSort className="ml-1" />
                            {sortBy.field === field && (sortBy.direction === 'asc' ? '↑' : '↓')}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filterFiles(sortFiles(coverageData.files)).map((file, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 font-mono text-gray-800">{file.path}</td>
                        {['statements', 'branches', 'functions', 'lines'].map(type => {
                          const percentage = file[type].total ? (file[type].covered / file[type].total * 100).toFixed(1) : 0;
                          return (
                            <td key={type} className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`${getCoverageColor(percentage)} h-2 rounded-full`}
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span>{file[type].covered}/{file[type].total} ({percentage}%)</span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!coverageData && !error && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">
              Upload a coverage JSON file (e.g., from Jest/Istanbul) to see the analysis
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Analyze statements, branches, functions, and lines coverage</li>
            <li>Customizable coverage threshold</li>
            <li>Sortable and filterable file breakdown</li>
            <li>Visual progress bars with dynamic coloring</li>
            <li>Downloadable coverage report</li>
            <li>Responsive design with scrollable tables</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CodeCoverageAnalyzer;