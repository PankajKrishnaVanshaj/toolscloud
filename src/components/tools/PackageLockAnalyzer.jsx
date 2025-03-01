"use client";

import React, { useState } from 'react';

const PackageLockAnalyzer = () => {
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('package-lock.json')) {
      setError('Please upload a package-lock.json file');
      setAnalysis(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target.result);
        analyzePackageLock(content);
      } catch (err) {
        setError('Invalid JSON file: ' + err.message);
        setAnalysis(null);
      }
    };
    reader.readAsText(file);
  };

  const analyzePackageLock = (data) => {
    setError(null);
    const dependencies = data.dependencies || {};
    
    const stats = {
      totalDependencies: Object.keys(dependencies).length,
      versions: {},
      resolvedSources: new Set(),
      integrityCount: 0
    };

    // Analyze dependencies
    Object.entries(dependencies).forEach(([name, dep]) => {
      // Count versions
      stats.versions[dep.version] = (stats.versions[dep.version] || 0) + 1;
      
      // Count unique resolved sources
      if (dep.resolved) {
        const source = new URL(dep.resolved).hostname;
        stats.resolvedSources.add(source);
      }
      
      // Count dependencies with integrity
      if (dep.integrity) stats.integrityCount++;
    });

    setAnalysis({
      ...stats,
      resolvedSources: Array.from(stats.resolvedSources),
      versionCount: Object.keys(stats.versions).length,
      uniqueVersions: Object.entries(stats.versions)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5) // Top 5 most used versions
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Package Lock Analyzer</h2>
        
        {/* File Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload package-lock.json
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
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-gray-700">Total Dependencies</h3>
                <p className="text-2xl text-gray-900">{analysis.totalDependencies}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-gray-700">Unique Versions</h3>
                <p className="text-2xl text-gray-900">{analysis.versionCount}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-gray-700">Integrity Checks</h3>
                <p className="text-2xl text-gray-900">{analysis.integrityCount}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-gray-700">Unique Sources</h3>
                <p className="text-2xl text-gray-900">{analysis.resolvedSources.length}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Top Versions</h3>
              <ul className="list-disc pl-5">
                {analysis.uniqueVersions.map(([version, count]) => (
                  <li key={version} className="text-gray-600">
                    {version}: {count} {count === 1 ? 'package' : 'packages'}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Resolved Sources</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.resolvedSources.map((source) => (
                  <span
                    key={source}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                  >
                    {source}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {!analysis && !error && (
          <p className="text-gray-500 italic">
            Upload a package-lock.json file to see the analysis
          </p>
        )}
      </div>
    </div>
  );
};

export default PackageLockAnalyzer;