"use client";

import React, { useState } from 'react';

const CodeLinter = () => {
  const [codeInput, setCodeInput] = useState('');
  const [lintResults, setLintResults] = useState([]);
  const [error, setError] = useState(null);

  const lintCode = (code) => {
    setError(null);
    setLintResults([]);

    if (!code.trim()) {
      setError('Please enter some code to lint');
      return;
    }

    const lines = code.split('\n');
    const issues = [];

    // Track variables and their usage
    const variables = new Map(); // { name: { declared: lineNum, used: [lineNums] } }
    let inFunction = false;
    let braceCount = 0;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      const lineNum = index + 1;

      // Skip empty lines or comments
      if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) {
        return;
      }

      // Brace tracking for scope
      braceCount += (trimmedLine.match(/{/g) || []).length - (trimmedLine.match(/}/g) || []).length;
      if (trimmedLine.includes('function')) inFunction = true;
      if (braceCount === 0) inFunction = false;

      // Rule 1: Check for undeclared variables (basic check)
      const varDecls = trimmedLine.match(/(let|const|var)\s+(\w+)/g);
      if (varDecls) {
        varDecls.forEach(decl => {
          const [, , varName] = decl.match(/(let|const|var)\s+(\w+)/);
          variables.set(varName, { declared: lineNum, used: [] });
        });
      }

      // Check variable usage
      const words = trimmedLine.split(/\W+/).filter(word => word && !/^(let|const|var|function|if|for|while|return)$/.test(word));
      words.forEach(word => {
        if (variables.has(word) && !varDecls?.some(decl => decl.includes(word))) {
          variables.get(word).used.push(lineNum);
        } else if (!variables.has(word) && !inFunction && !/^\d+$/.test(word)) {
          issues.push({
            line: lineNum,
            message: `Undeclared variable '${word}'`,
            type: 'error'
          });
        }
      });

      // Rule 2: Semicolon missing
      if (!trimmedLine.endsWith(';') && !trimmedLine.endsWith('{') && !trimmedLine.endsWith('}') && !trimmedLine.includes('function')) {
        issues.push({
          line: lineNum,
          message: 'Missing semicolon at end of line',
          type: 'warning'
        });
      }

      // Rule 3: Long line
      if (line.length > 80) {
        issues.push({
          line: lineNum,
          message: 'Line exceeds 80 characters',
          type: 'warning'
        });
      }

      // Rule 4: CamelCase for variables
      if (varDecls) {
        varDecls.forEach(decl => {
          const varName = decl.match(/(let|const|var)\s+(\w+)/)[2];
          if (!/^[a-z][a-zA-Z0-9]*$/.test(varName)) {
            issues.push({
              line: lineNum,
              message: `Variable '${varName}' should use camelCase`,
              type: 'style'
            });
          }
        });
      }
    });

    // Rule 5: Unused variables
    variables.forEach((info, name) => {
      if (info.used.length === 0) {
        issues.push({
          line: info.declared,
          message: `Variable '${name}' is declared but never used`,
          type: 'warning'
        });
      }
    });

    setLintResults(issues);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    lintCode(codeInput);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-700 bg-red-50';
      case 'warning': return 'text-yellow-700 bg-yellow-50';
      case 'style': return 'text-blue-700 bg-blue-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Code Linter</h2>

        {/* Code Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              JavaScript Code
            </label>
            <textarea
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              className="w-full h-48 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`let user_name = "John";
const x = 5
for(let i=0; i<5; i++) {
  console.log(user_name)
}`}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Lint Code
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Lint Results */}
        {lintResults.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold text-gray-700">Linting Results</h3>
            <div className="space-y-2">
              {lintResults.map((issue, index) => (
                <div key={index} className={`p-3 rounded-md ${getTypeColor(issue.type)}`}>
                  <p className="text-sm">
                    <span className="font-mono">Line {issue.line}</span>: {issue.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {lintResults.length === 0 && codeInput.trim() && !error && (
          <div className="mt-6 p-4 bg-green-50 rounded-md">
            <p className="text-sm text-green-700">No linting issues found!</p>
          </div>
        )}

        {/* Notes */}
        <div className="mt-4 text-sm text-gray-600">
          <p>Basic linting rules applied:</p>
          <ul className="list-disc pl-5">
            <li>Undeclared variables</li>
            <li>Missing semicolons</li>
            <li>Line length &gt; 80 characters</li>
            <li>CamelCase variable naming</li>
            <li>Unused variables</li>
          </ul>
          <p className="mt-2">This is a simple linter. For full linting, consider using ESLint.</p>
        </div>
      </div>
    </div>
  );
};

export default CodeLinter;