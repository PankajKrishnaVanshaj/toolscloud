"use client";

import React, { useState } from 'react';

const CodeCoverageAnalyzer = () => {
  const [coverageData, setCoverageData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file.name);

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

  const analyzeCoverage = (data) => {
    setError(null);
    
    // Aggregate totals from all files
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
        statements: {
          covered: metrics.s.covered,
          total: metrics.s.total
        },
        branches: {
          covered: metrics.b.covered,
          total: metrics.b.total
        },
        functions: {
          covered: metrics.f.covered,
          total: metrics.f.total
        },
        lines: {
          covered: metrics.l.covered,
          total: metrics.l.total
        }
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

    setCoverageData({
      totals,
      files,
      summary: {
        statements: (totals.statements.covered / totals.statements.total * 100).toFixed(1),
        branches: (totals.branches.covered / totals.branches.total * 100).toFixed(1),
        functions: (totals.functions.covered / totals.functions.total * 100).toFixed(1),
        lines: (totals.lines.covered / totals.lines.total * 100).toFixed(1)
      }
    });
  };

  const getCoverageColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Code Coverage Analyzer</h2>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Coverage Report (JSON)
          </label>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {selectedFile && <p className="mt-2 text-sm text-gray-600">Selected: {selectedFile}</p>}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Coverage Results */}
        {coverageData && (
          <div className="space-y-6">
            {/* Overall Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.entries(coverageData.summary).map(([type, percentage]) => (
                <div key={type} className="p-4 bg-gray-50 rounded-md">
                  <h3 className="font-semibold text-gray-700 capitalize">{type}</h3>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`${getCoverageColor(percentage)} h-2.5 rounded-full`}
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
              <h3 className="font-semibold text-gray-700 mb-2">File Breakdown</h3>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-2">File</th>
                      <th className="px-4 py-2">Statements</th>
                      <th className="px-4 py-2">Branches</th>
                      <th className="px-4 py-2">Functions</th>
                      <th className="px-4 py-2">Lines</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coverageData.files.map((file, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2 font-mono text-gray-800">{file.path}</td>
                        <td className="px-4 py-2">{file.statements.covered}/{file.statements.total} ({(file.statements.covered / file.statements.total * 100).toFixed(1)}%)</td>
                        <td className="px-4 py-2">{file.branches.covered}/{file.branches.total} ({(file.branches.covered / file.branches.total * 100).toFixed(1)}%)</td>
                        <td className="px-4 py-2">{file.functions.covered}/{file.functions.total} ({(file.functions.covered / file.functions.total * 100).toFixed(1)}%)</td>
                        <td className="px-4 py-2">{file.lines.covered}/{file.lines.total} ({(file.lines.covered / file.lines.total * 100).toFixed(1)}%)</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!coverageData && !error && (
          <p className="text-gray-500 italic">
            Upload a coverage JSON file (e.g., from Jest/Istanbul) to see the analysis
          </p>
        )}
      </div>
    </div>
  );
};

export default CodeCoverageAnalyzer;