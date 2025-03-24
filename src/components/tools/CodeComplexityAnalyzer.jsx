"use client";

import React, { useState, useCallback } from 'react';
import { FaSync, FaDownload, FaCog } from 'react-icons/fa';

const CodeComplexityAnalyzer = () => {
  const [codeInput, setCodeInput] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('javascript');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    includeComments: false,
    detailedReport: false,
    threshold: 10,
  });

  const analyzeCodeComplexity = useCallback((code) => {
    setError(null);
    setAnalysis(null);

    if (!code.trim()) {
      setError('Please enter some code');
      return;
    }

    try {
      const lines = code.split('\n').filter(line => 
        (settings.includeComments || !line.trim().startsWith('//')) && line.trim() !== ''
      );
      
      // Basic metrics
      const totalLines = lines.length;
      let cyclomaticComplexity = 1;
      let functionCount = 0;
      let nestedLevels = 0;
      let maxNesting = 0;
      let variableCount = 0;
      let commentCount = 0;

      // Language-specific patterns
      const patterns = {
        javascript: {
          functionRegex: /(function\s+\w+|\w+\s*=>\s*{|\w+\s*\([^)]*\)\s*{)/g,
          complexityKeywords: ['if', 'else if', 'for', 'while', 'do', 'switch', 'case', '&&', '||', '?'],
          variableRegex: /\b(var|let|const)\s+\w+/g,
          commentRegex: /\/\/.*$/gm
        },
        python: {
          functionRegex: /def\s+\w+\s*\(/g,
          complexityKeywords: ['if', 'elif', 'for', 'while', 'try', 'except'],
          variableRegex: /\b\w+\s*=/g,
          commentRegex: /#.*$/gm
        }
      };

      const currentPattern = patterns[language] || patterns.javascript;

      lines.forEach((line, index) => {
        const trimmedLine = line.trim();

        // Count comments
        if (settings.detailedReport) {
          commentCount += (trimmedLine.match(currentPattern.commentRegex) || []).length;
        }

        // Count functions
        if (currentPattern.functionRegex.test(trimmedLine)) {
          functionCount++;
        }

        // Count variables
        if (settings.detailedReport) {
          variableCount += (trimmedLine.match(currentPattern.variableRegex) || []).length;
        }

        // Count complexity
        currentPattern.complexityKeywords.forEach(keyword => {
          const regex = new RegExp(`\\b${keyword}\\b`, 'g');
          cyclomaticComplexity += (trimmedLine.match(regex) || []).length;
        });

        // Track nesting
        const openBraces = language === 'python' ? 
          (trimmedLine.endsWith(':') ? 1 : 0) : 
          (trimmedLine.match(/{/g) || []).length;
        const closeBraces = language === 'python' ? 
          (index > 0 && lines[index - 1].endsWith(':') && !trimmedLine.match(/^\s/)) ? 1 : 0 :
          (trimmedLine.match(/}/g) || []).length;
        nestedLevels += openBraces - closeBraces;
        maxNesting = Math.max(maxNesting, nestedLevels);
        if (nestedLevels < 0) nestedLevels = 0;
      });

      const result = {
        totalLines,
        functionCount,
        cyclomaticComplexity,
        maxNesting,
        avgComplexityPerFunction: functionCount > 0 
          ? (cyclomaticComplexity / functionCount).toFixed(2) 
          : 0,
        ...(settings.detailedReport && { variableCount, commentCount })
      };

      setAnalysis(result);
    } catch (err) {
      setError('Error analyzing code: ' + err.message);
    }
  }, [language, settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    analyzeCodeComplexity(codeInput);
  };

  const handleReset = () => {
    setCodeInput('');
    setAnalysis(null);
    setError(null);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `complexity-analysis-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getComplexityColor = (value) => {
    if (value <= settings.threshold) return 'bg-green-500';
    if (value <= settings.threshold * 2) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Code Complexity Analyzer</h2>

        {/* Language Selection & Settings */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full sm:w-48 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full sm:w-auto py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center justify-center"
          >
            <FaCog className="mr-2" /> Settings
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3">Analysis Settings</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.includeComments}
                  onChange={(e) => setSettings(prev => ({ ...prev, includeComments: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Include Comments in Line Count</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.detailedReport}
                  onChange={(e) => setSettings(prev => ({ ...prev, detailedReport: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Generate Detailed Report</span>
              </label>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Complexity Threshold:</label>
                <input
                  type="number"
                  value={settings.threshold}
                  onChange={(e) => setSettings(prev => ({ ...prev, threshold: Number(e.target.value) }))}
                  min="1"
                  className="w-20 p-1 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        )}

        {/* Code Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code Input ({language})
            </label>
            <textarea
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              className="w-full h-48 sm:h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={language === 'javascript' ? 
                `function example(x) {\n  if (x > 0) {\n    for (let i = 0; i < x; i++) {\n      console.log(i);\n    }\n  }\n}` :
                `def example(x):\n    if x > 0:\n        for i in range(x):\n            print(i)`
              }
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Analyze Complexity
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard title="Total Lines" value={analysis.totalLines} />
              <MetricCard title="Function Count" value={analysis.functionCount} />
              <MetricCard 
                title="Cyclomatic Complexity" 
                value={analysis.cyclomaticComplexity}
                color={getComplexityColor(analysis.cyclomaticComplexity)}
                description={analysis.cyclomaticComplexity <= settings.threshold ? 'Low' : 
                            analysis.cyclomaticComplexity <= settings.threshold * 2 ? 'Moderate' : 'High'}
              />
              <MetricCard title="Max Nesting Depth" value={analysis.maxNesting} />
              <MetricCard title="Avg Complexity/Func" value={analysis.avgComplexityPerFunction} />
              {settings.detailedReport && (
                <>
                  <MetricCard title="Variable Count" value={analysis.variableCount} />
                  <MetricCard title="Comment Count" value={analysis.commentCount} />
                </>
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleDownload}
                className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center transition-colors"
              >
                <FaDownload className="mr-2" /> Download Report
              </button>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Interpretation</h3>
              <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                <li>Complexity ≤ {settings.threshold}: Maintainable</li>
                <li>{settings.threshold + 1}-{settings.threshold * 2}: Moderate, consider refactoring</li>
                <li>&gt;{settings.threshold * 2}: High complexity, recommend refactoring</li>
                <li>Lower nesting depth improves readability</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, color, description }) => (
  <div className="p-4 bg-gray-50 rounded-md">
    <h3 className="font-semibold text-gray-700">{title}</h3>
    <div className="flex items-center gap-2">
      <p className="text-lg text-gray-800">{value}</p>
      {color && <div className={`w-4 h-4 rounded-full ${color}`}></div>}
    </div>
    {description && <p className="text-sm text-gray-600">{description}</p>}
  </div>
);

export default CodeComplexityAnalyzer;