"use client";

import React, { useState } from 'react';

const CodeRefactorSuggestor = () => {
  const [inputCode, setInputCode] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [language, setLanguage] = useState('javascript');

  const languages = ['javascript', 'python', 'java'];

  const analyzeCode = (code) => {
    const lines = code.split('\n').map(line => line.trim());
    const suggestionsArray = [];

    if (language === 'javascript') {
      // Check for repeated code blocks
      const repeatedLines = findRepeatedLines(lines);
      if (repeatedLines.length > 0) {
        suggestionsArray.push({
          title: 'Extract Repeated Code',
          description: 'Found repeated code that could be extracted into a function',
          details: repeatedLines.map(l => `Line ${l.line}: ${l.content}`).join('\n'),
          suggestion: 'Consider creating a reusable function'
        });
      }

      // Check for long functions
      const functionMatches = code.match(/(function\s+\w+\s*\([^)]*\)\s*{[^}]*})/g);
      if (functionMatches) {
        functionMatches.forEach(func => {
          const funcLines = func.split('\n').length;
          if (funcLines > 20) {
            suggestionsArray.push({
              title: 'Break Down Long Function',
              description: 'Function exceeds 20 lines',
              details: func.substring(0, 100) + '...',
              suggestion: 'Split into smaller, focused functions'
            });
          }
        });
      }

      // Check for var usage
      if (code.includes('var ')) {
        suggestionsArray.push({
          title: 'Modernize Variable Declarations',
          description: 'Found "var" declarations',
          details: 'Replace with "let" or "const" for better scoping',
          suggestion: 'Use "const" for constants and "let" for variables'
        });
      }

      // Check for arrow function opportunities
      const traditionalFunc = code.match(/function\s*\(([^)]*)\)\s*{/g);
      if (traditionalFunc) {
        suggestionsArray.push({
          title: 'Use Arrow Functions',
          description: 'Traditional function declarations found',
          details: traditionalFunc[0],
          suggestion: 'Convert to arrow functions for concise syntax: "() => {}"'
        });
      }
    }

    if (language === 'python') {
      // Check for missing docstrings
      const defMatches = code.match(/def\s+\w+\s*\([^)]*\):/g);
      if (defMatches && !code.includes('"""')) {
        suggestionsArray.push({
          title: 'Add Docstrings',
          description: 'Functions found without documentation',
          details: defMatches[0],
          suggestion: 'Add docstrings using """ """ for better documentation'
        });
      }

      // Check for long lines
      const longLines = lines.filter(line => line.length > 79);
      if (longLines.length > 0) {
        suggestionsArray.push({
          title: 'PEP 8 Line Length',
          description: 'Lines exceed 79 characters',
          details: longLines.map(l => l.substring(0, 50) + '...').join('\n'),
          suggestion: 'Break lines to follow PEP 8 guidelines'
        });
      }
    }

    if (language === 'java') {
      // Check for public fields
      if (code.match(/public\s+(?!class|int|void|String)\w+\s+\w+;/)) {
        suggestionsArray.push({
          title: 'Encapsulate Fields',
          description: 'Public fields detected',
          details: 'Public field declaration found',
          suggestion: 'Use private fields with getters/setters'
        });
      }
    }

    if (suggestionsArray.length === 0) {
      suggestionsArray.push({
        title: 'No Immediate Suggestions',
        description: 'Code looks good based on basic checks',
        details: '',
        suggestion: 'Keep following good practices!'
      });
    }

    setSuggestions(suggestionsArray);
  };

  const findRepeatedLines = (lines) => {
    const lineCount = {};
    const repeated = [];
    
    lines.forEach((line, index) => {
      if (line.length > 10) { // Ignore very short lines
        lineCount[line] = (lineCount[line] || 0) + 1;
        if (lineCount[line] === 2) {
          repeated.push({ line: index + 1, content: line });
        }
      }
    });
    
    return repeated;
  };

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) {
      setSuggestions([{ title: 'Error', description: 'Please enter some code' }]);
      return;
    }
    analyzeCode(inputCode);
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Code Refactor Suggestor</h2>

        {/* Input Form */}
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="flex gap-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="flex-1 h-48 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Enter your ${language} code here...`}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Analyze Code
          </button>
        </form>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-6 space-y-4">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-gray-800">{suggestion.title}</h3>
                <p className="text-gray-600">{suggestion.description}</p>
                {suggestion.details && (
                  <pre className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                    {suggestion.details}
                  </pre>
                )}
                <p className="mt-2 text-blue-600">{suggestion.suggestion}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeRefactorSuggestor;