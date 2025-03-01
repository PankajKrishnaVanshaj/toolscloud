"use client";

import React, { useState } from 'react';

const CodeComplexityAnalyzer = () => {
  const [codeInput, setCodeInput] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const analyzeCodeComplexity = (code) => {
    setError(null);
    setAnalysis(null);

    if (!code.trim()) {
      setError('Please enter some code');
      return;
    }

    try {
      const lines = code.split('\n').filter(line => line.trim() !== '');
      
      // Basic metrics
      const totalLines = lines.length;
      let cyclomaticComplexity = 1; // Base complexity
      let functionCount = 0;
      let nestedLevels = 0;
      let maxNesting = 0;

      // Keywords that increase complexity
      const complexityKeywords = [
        'if', 'else if', 'for', 'while', 'do', 'switch', 'case', '&&', '||', '?'
      ];

      // Simple function detection
      const functionRegex = /(function\s+\w+|\w+\s*=>\s*{|\w+\s*\([^)]*\)\s*{)/g;

      lines.forEach((line, index) => {
        const trimmedLine = line.trim();

        // Count functions
        if (functionRegex.test(trimmedLine)) {
          functionCount++;
        }

        // Count complexity
        complexityKeywords.forEach(keyword => {
          const regex = new RegExp(`\\b${keyword}\\b`, 'g');
          const matches = (trimmedLine.match(regex) || []).length;
          cyclomaticComplexity += matches;
        });

        // Track nesting
        const openBraces = (trimmedLine.match(/{/g) || []).length;
        const closeBraces = (trimmedLine.match(/}/g) || []).length;
        nestedLevels += openBraces - closeBraces;
        maxNesting = Math.max(maxNesting, nestedLevels);

        // Reset nesting if it goes negative (error in code)
        if (nestedLevels < 0) nestedLevels = 0;
      });

      setAnalysis({
        totalLines,
        functionCount,
        cyclomaticComplexity,
        maxNesting,
        avgComplexityPerFunction: functionCount > 0 
          ? (cyclomaticComplexity / functionCount).toFixed(2) 
          : 0
      });
    } catch (err) {
      setError('Error analyzing code: ' + err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    analyzeCodeComplexity(codeInput);
  };

  const getComplexityColor = (value) => {
    if (value <= 10) return 'bg-green-500';
    if (value <= 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Code Complexity Analyzer</h2>

        {/* Code Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code Input (JavaScript-like syntax)
            </label>
            <textarea
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              className="w-full h-48 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`function example(x) {
  if (x > 0) {
    for (let i = 0; i < x; i++) {
      console.log(i);
    }
  } else {
    console.log("Negative");
  }
}`}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Analyze Complexity
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-gray-700">Total Lines</h3>
                <p className="text-lg text-gray-800">{analysis.totalLines}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-gray-700">Function Count</h3>
                <p className="text-lg text-gray-800">{analysis.functionCount}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-gray-700">Cyclomatic Complexity</h3>
                <div className="flex items-center gap-2">
                  <p className="text-lg text-gray-800">{analysis.cyclomaticComplexity}</p>
                  <div className={`w-4 h-4 rounded-full ${getComplexityColor(analysis.cyclomaticComplexity)}`}></div>
                </div>
                <p className="text-sm text-gray-600">
                  {analysis.cyclomaticComplexity <= 10 ? 'Low' : analysis.cyclomaticComplexity <= 20 ? 'Moderate' : 'High'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-gray-700">Max Nesting Depth</h3>
                <p className="text-lg text-gray-800">{analysis.maxNesting}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-gray-700">Avg Complexity/Function</h3>
                <p className="text-lg text-gray-800">{analysis.avgComplexityPerFunction}</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700 mb-2">Interpretation</h3>
              <ul className="text-sm text-gray-600 list-disc pl-5">
                <li>Cyclomatic Complexity ≤ 10: Maintainable</li>
                <li>11-20: Moderate complexity, consider refactoring</li>
                <li>&gt;20: High complexity, strongly recommend refactoring</li>
                <li>Lower nesting depth improves readability</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeComplexityAnalyzer;