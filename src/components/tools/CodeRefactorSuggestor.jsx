"use client";

import React, { useState, useCallback } from 'react';
import { FaSync, FaDownload, FaCog } from 'react-icons/fa';

const CodeRefactorSuggestor = () => {
  const [inputCode, setInputCode] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [language, setLanguage] = useState('javascript');
  const [settings, setSettings] = useState({
    maxFunctionLength: 20,
    minRepeatLength: 10,
    showCodeExamples: true,
    strictMode: false,
  });
  const [showSettings, setShowSettings] = useState(false);

  const languages = ['javascript', 'python', 'java', 'typescript'];

  const analyzeCode = useCallback((code) => {
    const lines = code.split('\n').map(line => line.trim());
    const suggestionsArray = [];

    const addSuggestion = (title, description, details, suggestion, example = '') => {
      suggestionsArray.push({ title, description, details, suggestion, example });
    };

    // Common analysis across languages
    const repeatedLines = findRepeatedLines(lines, settings.minRepeatLength);
    if (repeatedLines.length > 0) {
      addSuggestion(
        'Extract Repeated Code',
        'Found repeated code that could be extracted',
        repeatedLines.map(l => `Line ${l.line}: ${l.content}`).join('\n'),
        'Create a reusable function or method',
        language === 'javascript' && settings.showCodeExamples ? 
          `const reusedFunc = () => {\n  ${repeatedLines[0].content}\n};` : ''
      );
    }

    if (language === 'javascript' || language === 'typescript') {
      const funcRegex = language === 'typescript' ? 
        /(function\s+\w+\s*\([^)]*\)\s*:\s*\w+\s*{[^}]*})|(=>[^;]*)/g :
        /(function\s+\w+\s*\([^)]*\)\s*{[^}]*})|(=>[^;]*)/g;
      const functionMatches = code.match(funcRegex);
      if (functionMatches) {
        functionMatches.forEach(func => {
          const funcLines = func.split('\n').length;
          if (funcLines > settings.maxFunctionLength) {
            addSuggestion(
              'Break Down Long Function',
              `Function exceeds ${settings.maxFunctionLength} lines`,
              func.substring(0, 100) + '...',
              'Split into smaller, focused functions'
            );
          }
        });
      }

      if (code.includes('var ') && (language === 'javascript' || settings.strictMode)) {
        addSuggestion(
          'Modernize Variable Declarations',
          'Found "var" declarations',
          'First occurrence: ' + code.match(/var\s+\w+/)[0],
          'Use "const" for constants and "let" for variables',
          settings.showCodeExamples ? 'const x = 10; // or let y = 20;' : ''
        );
      }

      if (language === 'javascript' && code.match(/function\s*\(([^)]*)\)\s*{/g)) {
        addSuggestion(
          'Use Arrow Functions',
          'Traditional function declarations found',
          code.match(/function\s*\(([^)]*)\)\s*{/)[0],
          'Convert to arrow functions',
          settings.showCodeExamples ? 'const fn = () => {};' : ''
        );
      }

      if (language === 'typescript' && settings.strictMode && !code.match(/:\s*\w+/)) {
        addSuggestion(
          'Add Type Annotations',
          'Missing type definitions',
          'No type annotations found',
          'Add TypeScript type annotations'
        );
      }
    }

    if (language === 'python') {
      const defMatches = code.match(/def\s+\w+\s*\([^)]*\):/g);
      if (defMatches && (!code.includes('"""') || settings.strictMode)) {
        addSuggestion(
          'Add Docstrings',
          'Functions found without documentation',
          defMatches[0],
          'Add docstrings using """ """',
          settings.showCodeExamples ? 'def func():\n    """Description"""\n    pass' : ''
        );
      }

      const longLines = lines.filter(line => line.length > 79);
      if (longLines.length > 0) {
        addSuggestion(
          'PEP 8 Line Length',
          'Lines exceed 79 characters',
          longLines.map(l => l.substring(0, 50) + '...').join('\n'),
          'Break lines to follow PEP 8'
        );
      }

      if (code.match(/\bprint\s*\(/) && settings.strictMode) {
        addSuggestion(
          'Use Logging',
          'Print statements found',
          code.match(/\bprint\s*\(/)[0],
          'Replace with logging module'
        );
      }
    }

    if (language === 'java') {
      if (code.match(/public\s+(?!class|int|void|String)\w+\s+\w+;/)) {
        addSuggestion(
          'Encapsulate Fields',
          'Public fields detected',
          code.match(/public\s+(?!class|int|void|String)\w+\s+\w+;/)[0],
          'Use private fields with getters/setters',
          settings.showCodeExamples ? 'private int x;\npublic int getX() { return x; }' : ''
        );
      }

      if (code.match(/System\.out\.print(ln)?\(/)) {
        addSuggestion(
          'Use Proper Logging',
          'System.out statements found',
          code.match(/System\.out\.print(ln)?\(/)[0],
          'Replace with a logging framework'
        );
      }
    }

    if (suggestionsArray.length === 0) {
      addSuggestion(
        'No Immediate Suggestions',
        'Code looks good based on current checks',
        '',
        'Keep following good practices!'
      );
    }

    setSuggestions(suggestionsArray);
  }, [language, settings]);

  const findRepeatedLines = (lines, minLength) => {
    const lineCount = {};
    const repeated = [];
    lines.forEach((line, index) => {
      if (line.length > minLength) {
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
      setSuggestions([{ title: 'Error', description: 'Please enter some code', details: '', suggestion: '' }]);
      return;
    }
    analyzeCode(inputCode);
  };

  const handleDownload = () => {
    const blob = new Blob([inputCode], { type: `text/${language}` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `code-${Date.now()}.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'java'}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setInputCode('');
    setSuggestions([]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Code Refactor Suggestor</h2>

        {/* Input Form */}
        <form onSubmit={handleAnalyze} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full sm:w-40 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
              ))}
            </select>
            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="flex-1 h-48 sm:h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Enter your ${language} code here...`}
              aria-label="Code Input"
            />
          </div>

          {/* Settings */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center text-blue-600 hover:text-blue-700 mb-3"
            >
              <FaCog className="mr-2" /> {showSettings ? 'Hide Settings' : 'Show Settings'}
            </button>
            {showSettings && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600">Max Function Length</label>
                  <input
                    type="number"
                    value={settings.maxFunctionLength}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxFunctionLength: Number(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    min="10"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Min Repeat Length</label>
                  <input
                    type="number"
                    value={settings.minRepeatLength}
                    onChange={(e) => setSettings(prev => ({ ...prev, minRepeatLength: Number(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    min="5"
                  />
                </div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.showCodeExamples}
                    onChange={(e) => setSettings(prev => ({ ...prev, showCodeExamples: e.target.checked }))}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-600">Show Code Examples</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.strictMode}
                    onChange={(e) => setSettings(prev => ({ ...prev, strictMode: e.target.checked }))}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-600">Strict Mode</span>
                </label>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              disabled={!inputCode.trim()}
            >
              Analyze Code
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center justify-center"
              disabled={!inputCode.trim()}
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>
        </form>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Refactoring Suggestions</h3>
            {suggestions.map((suggestion, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800">{suggestion.title}</h4>
                <p className="text-gray-600">{suggestion.description}</p>
                {suggestion.details && (
                  <pre className="mt-2 text-sm text-gray-700 bg-white p-2 rounded whitespace-pre-wrap">
                    {suggestion.details}
                  </pre>
                )}
                <p className="mt-2 text-blue-600">{suggestion.suggestion}</p>
                {suggestion.example && (
                  <pre className="mt-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                    {suggestion.example}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports JavaScript, TypeScript, Python, and Java</li>
            <li>Detects repeated code blocks</li>
            <li>Checks function length and variable declarations</li>
            <li>Language-specific best practices</li>
            <li>Customizable analysis settings</li>
            <li>Code example suggestions (optional)</li>
            <li>Download analyzed code</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CodeRefactorSuggestor;