"use client";

import React, { useState, useCallback } from 'react';
import { FaDownload, FaSync, FaChartBar } from 'react-icons/fa';

const PackageLockAnalyzer = () => {
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const [analysisOptions, setAnalysisOptions] = useState({
    showDevDependencies: true,
    showNestedDependencies: false,
    checkOutdated: false,
  });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('package-lock.json')) {
      setError('Please upload a package-lock.json file');
      setAnalysis(null);
      return;
    }

    setFileName(file.name);
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

  const analyzePackageLock = useCallback((data) => {
    setError(null);
    const dependencies = data.dependencies || {};
    const lockfileVersion = data.lockfileVersion || 1;

    const stats = {
      totalDependencies: 0,
      devDependencies: 0,
      prodDependencies: 0,
      versions: {},
      resolvedSources: new Set(),
      integrityCount: 0,
      nestedDependencies: 0,
      potentiallyOutdated: 0,
      lockfileVersion,
    };

    const analyzeDependencies = (deps, isNested = false) => {
      Object.entries(deps).forEach(([name, dep]) => {
        stats.totalDependencies++;
        if (dep.dev && analysisOptions.showDevDependencies) stats.devDependencies++;
        else if (!dep.dev) stats.prodDependencies++;
        
        stats.versions[dep.version] = (stats.versions[dep.version] || 0) + 1;
        
        if (dep.resolved) {
          const source = new URL(dep.resolved).hostname;
          stats.resolvedSources.add(source);
        }
        
        if (dep.integrity) stats.integrityCount++;
        
        if (isNested && analysisOptions.showNestedDependencies) stats.nestedDependencies++;
        
        if (analysisOptions.checkOutdated && dep.version) {
          const versionParts = dep.version.split('.');
          if (parseInt(versionParts[0]) < 1) stats.potentiallyOutdated++;
        }

        if (dep.dependencies) {
          analyzeDependencies(dep.dependencies, true);
        }
      });
    };

    analyzeDependencies(dependencies);

    const topVersions = Object.entries(stats.versions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    setAnalysis({
      ...stats,
      resolvedSources: Array.from(stats.resolvedSources),
      versionCount: Object.keys(stats.versions).length,
      uniqueVersions: topVersions,
    });
  }, [analysisOptions]);

  const handleDownloadReport = () => {
    const report = JSON.stringify(analysis, null, 2);
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}-analysis.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetAnalyzer = () => {
    setAnalysis(null);
    setError(null);
    setFileName('');
    document.getElementById('fileInput').value = '';
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <FaChartBar className="mr-2" /> Package Lock Analyzer
        </h2>

        {/* File Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload package-lock.json
          </label>
          <input
            id="fileInput"
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-colors"
          />
        </div>

        {/* Analysis Options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Analysis Options</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(analysisOptions).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setAnalysisOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Dependencies', value: analysis.totalDependencies },
                { label: 'Unique Versions', value: analysis.versionCount },
                { label: 'Integrity Checks', value: analysis.integrityCount },
                { label: 'Unique Sources', value: analysis.resolvedSources.length },
                ...(analysisOptions.showDevDependencies ? [{ label: 'Dev Dependencies', value: analysis.devDependencies }] : []),
                { label: 'Prod Dependencies', value: analysis.prodDependencies },
                ...(analysisOptions.showNestedDependencies ? [{ label: 'Nested Dependencies', value: analysis.nestedDependencies }] : []),
                ...(analysisOptions.checkOutdated ? [{ label: 'Potentially Outdated', value: analysis.potentiallyOutdated }] : []),
              ].map((item, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700">{item.label}</h3>
                  <p className="text-2xl text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Top Versions</h3>
                <ul className="list-disc pl-5 text-gray-600">
                  {analysis.uniqueVersions.map(([version, count]) => (
                    <li key={version}>
                      {version}: {count} {count === 1 ? 'package' : 'packages'}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Resolved Sources</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.resolvedSources.map((source) => (
                    <span key={source} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700">Lockfile Version</h3>
              <p className="text-lg text-gray-900">v{analysis.lockfileVersion}</p>
            </div>
          </div>
        )}

        {/* Controls */}
        {analysis && (
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownloadReport}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Report
            </button>
            <button
              onClick={resetAnalyzer}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        )}

        {/* Placeholder */}
        {!analysis && !error && (
          <p className="text-gray-500 italic text-center">
            Upload a package-lock.json file to see the analysis
          </p>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Analyze total dependencies and versions</li>
            <li>Track development vs production dependencies</li>
            <li>Identify nested dependencies</li>
            <li>Check for potentially outdated packages</li>
            <li>View resolved sources and integrity checks</li>
            <li>Download analysis report</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PackageLockAnalyzer;