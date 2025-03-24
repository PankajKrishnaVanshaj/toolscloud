"use client";

import React, { useState, useCallback } from 'react';
import { FaCopy, FaDownload, FaSync } from 'react-icons/fa';

const UnitTestGenerator = () => {
  const [inputCode, setInputCode] = useState('');
  const [generatedTests, setGeneratedTests] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [testOptions, setTestOptions] = useState({
    framework: 'jest', // 'jest' or 'mocha'
    includeEdgeCases: true,
    includeTypeChecks: true,
    includeComments: true,
  });

  const generateUnitTests = useCallback((code) => {
    setError(null);
    setGeneratedTests('');
    setCopied(false);

    if (!code.trim()) {
      setError('Please enter some JavaScript code');
      return;
    }

    try {
      // Parse functions
      const functionRegex = /function\s+(\w+)\s*\(([^)]*)\)\s*{([^}]*)}/g;
      const arrowFunctionRegex = /const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*{([^}]*)}/g;
      let match;
      const functions = [];

      while ((match = functionRegex.exec(code)) !== null) {
        const [, name, params, body] = match;
        functions.push({ name, params: params.split(',').map(p => p.trim()).filter(Boolean), body });
      }

      while ((match = arrowFunctionRegex.exec(code)) !== null) {
        const [, name, params, body] = match;
        functions.push({ name, params: params.split(',').map(p => p.trim()).filter(Boolean), body });
      }

      if (functions.length === 0) {
        setError('No valid functions found in the code');
        return;
      }

      // Generate tests based on selected framework
      let testCode = testOptions.includeComments 
        ? `// Generated Unit Tests using ${testOptions.framework.toUpperCase()}\n// Generated on ${new Date().toLocaleString()}\n\n`
        : '';
      
      testCode += testOptions.framework === 'jest'
        ? `const { ${functions.map(f => f.name).join(', ')} } = require('./yourModule');\n\n`
        : `const { ${functions.map(f => f.name).join(', ')} } = require('./yourModule');\nconst assert = require('assert');\n\n`;

      functions.forEach(func => {
        const describe = testOptions.framework === 'jest' ? 'describe' : 'describe';
        const it = testOptions.framework === 'jest' ? 'it' : 'it';
        const expect = testOptions.framework === 'jest' 
          ? 'expect' 
          : (assertion => `assert(${assertion})`);
        
        testCode += `${describe}('${func.name}', () => {\n`;

        // Existence test
        testCode += testOptions.includeComments ? `  // Test function existence\n` : '';
        testCode += `  ${it}('should be defined', () => {\n`;
        testCode += testOptions.framework === 'jest'
          ? `    ${expect}(${func.name}).toBeDefined();\n`
          : `    ${expect(`typeof ${func.name} !== 'undefined'`)};\n`;
        testCode += `  });\n\n`;

        const paramValues = func.params.map((_, i) => i + 1);
        
        // Basic functionality test
        testCode += testOptions.includeComments ? `  // Test basic functionality\n` : '';
        testCode += `  ${it}('should return a value with basic inputs', () => {\n`;
        const call = `${func.name}(${paramValues.join(', ')})`;
        testCode += `    const result = ${call};\n`;
        testCode += testOptions.framework === 'jest'
          ? `    ${expect}(result).toBeDefined();\n`
          : `    ${expect(`result !== undefined`)};\n`;
        testCode += `  });\n\n`;

        // Parameter handling and type checking
        if (func.params.length > 0 && testOptions.includeTypeChecks) {
          testCode += testOptions.includeComments ? `  // Test parameter type handling\n` : '';
          testCode += `  ${it}('should handle parameter types correctly', () => {\n`;
          testCode += `    const result = ${call};\n`;
          const hasReturn = func.body.includes('return');
          if (hasReturn) {
            testCode += testOptions.framework === 'jest'
              ? `    ${expect}(typeof result).toMatch(/number|string|boolean|object/);\n`
              : `    ${expect(`['number', 'string', 'boolean', 'object'].includes(typeof result)`)};\n`;
          } else {
            testCode += testOptions.framework === 'jest'
              ? `    ${expect}(result).toBeUndefined();\n`
              : `    ${expect(`result === undefined`)};\n`;
          }
          testCode += `  });\n\n`;
        }

        // Edge cases
        if (testOptions.includeEdgeCases && func.params.length > 0) {
          testCode += testOptions.includeComments ? `  // Test edge cases\n` : '';
          testCode += `  ${it}('should handle edge cases', () => {\n`;
          testCode += `    const zeroResult = ${func.name}(${func.params.map(() => '0').join(', ')});\n`;
          testCode += testOptions.framework === 'jest'
            ? `    ${expect}(zeroResult).toBeDefined();\n`
            : `    ${expect(`zeroResult !== undefined`)};\n`;
          testCode += `  });\n`;
        }

        testCode += `});\n\n`;
      });

      setGeneratedTests(testCode.trim());
    } catch (err) {
      setError('Error generating tests: ' + err.message);
    }
  }, [testOptions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    generateUnitTests(inputCode);
  };

  const handleCopy = () => {
    if (generatedTests) {
      navigator.clipboard.writeText(generatedTests);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (generatedTests) {
      const blob = new Blob([generatedTests], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tests-${Date.now()}.js`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setInputCode('');
    setGeneratedTests('');
    setError(null);
    setCopied(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Unit Test Generator</h1>

        {/* Code Input */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              JavaScript Code
            </label>
            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="w-full h-48 sm:h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`function add(a, b) {
  return a + b;
}

const multiply = (x, y) => {
  return x * y;
}`}
              aria-label="JavaScript Code Input"
            />
          </div>

          {/* Test Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Test Generation Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Framework</label>
                <select
                  value={testOptions.framework}
                  onChange={(e) => setTestOptions(prev => ({ ...prev, framework: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="jest">Jest</option>
                  <option value="mocha">Mocha</option>
                </select>
              </div>
              {['includeEdgeCases', 'includeTypeChecks', 'includeComments'].map(option => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={testOptions[option]}
                    onChange={(e) => setTestOptions(prev => ({ ...prev, [option]: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">
                    {option.replace('include', '').replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Generate Tests
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={handleDownload}
              disabled={!generatedTests}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Generated Tests */}
        {generatedTests && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-700">
                Generated {testOptions.framework.toUpperCase()} Tests
              </h3>
              <button
                onClick={handleCopy}
                className={`py-1 px-3 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                  copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <FaCopy /> {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="p-4 bg-gray-50 rounded-lg text-sm font-mono text-gray-800 whitespace-pre-wrap break-all border border-gray-200 max-h-96 overflow-auto">
              {generatedTests}
            </pre>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports Jest and Mocha frameworks</li>
            <li>Detects regular and arrow functions</li>
            <li>Generates existence, functionality, and type tests</li>
            <li>Optional edge case testing</li>
            <li>Customizable with comments and type checks</li>
            <li>Copy and download generated tests</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UnitTestGenerator;