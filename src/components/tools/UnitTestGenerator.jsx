"use client";

import React, { useState } from 'react';

const UnitTestGenerator = () => {
  const [inputCode, setInputCode] = useState('');
  const [generatedTests, setGeneratedTests] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateUnitTests = (code) => {
    setError(null);
    setGeneratedTests('');
    setCopied(false);

    if (!code.trim()) {
      setError('Please enter some JavaScript code');
      return;
    }

    try {
      // Basic parsing for function declarations
      const functionRegex = /function\s+(\w+)\s*\(([^)]*)\)\s*{([^}]*)}/g;
      const arrowFunctionRegex = /const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*{([^}]*)}/g;
      let match;
      const functions = [];

      // Parse regular functions
      while ((match = functionRegex.exec(code)) !== null) {
        const [, name, params, body] = match;
        functions.push({ name, params: params.split(',').map(p => p.trim()).filter(Boolean), body });
      }

      // Parse arrow functions
      while ((match = arrowFunctionRegex.exec(code)) !== null) {
        const [, name, params, body] = match;
        functions.push({ name, params: params.split(',').map(p => p.trim()).filter(Boolean), body });
      }

      if (functions.length === 0) {
        setError('No valid functions found in the code');
        return;
      }

      // Generate Jest tests
      let testCode = `// Generated Unit Tests using Jest\n\n`;
      testCode += `const { ${functions.map(f => f.name).join(', ')} } = require('./yourModule'); // Adjust the import path\n\n`;

      functions.forEach(func => {
        testCode += `describe('${func.name}', () => {\n`;
        
        // Basic test for function existence
        testCode += `  it('should be defined', () => {\n`;
        testCode += `    expect(${func.name}).toBeDefined();\n`;
        testCode += `  });\n\n`;

        // Test for basic return value (assuming simple cases)
        const paramValues = func.params.map((_, i) => i + 1); // Simple numeric inputs
        testCode += `  it('should return a value with basic inputs', () => {\n`;
        if (paramValues.length > 0) {
          testCode += `    const result = ${func.name}(${paramValues.join(', ')});\n`;
          testCode += `    expect(result).toBeDefined();\n`;
        } else {
          testCode += `    const result = ${func.name}();\n`;
          testCode += `    expect(result).toBeDefined();\n`;
        }
        testCode += `  });\n`;

        // Test for parameter handling (if any)
        if (func.params.length > 0) {
          testCode += `\n  it('should handle parameters correctly', () => {\n`;
          testCode += `    const result = ${func.name}(${paramValues.join(', ')});\n`;
          // Add a basic expectation based on function body analysis
          const hasReturn = func.body.includes('return');
          if (hasReturn) {
            testCode += `    expect(typeof result).toMatch(/number|string|boolean|object/);\n`;
          } else {
            testCode += `    expect(result).toBeUndefined();\n`;
          }
          testCode += `  });\n`;
        }

        testCode += `});\n\n`;
      });

      setGeneratedTests(testCode.trim());
    } catch (err) {
      setError('Error generating tests: ' + err.message);
    }
  };

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

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Unit Test Generator</h2>

        {/* Code Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              JavaScript Code
            </label>
            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="w-full h-48 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`function add(a, b) {
  return a + b;
}

const multiply = (x, y) => {
  return x * y;
}`}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate Tests
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Generated Tests */}
        {generatedTests && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Generated Jest Tests</h3>
              <button
                onClick={handleCopy}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="p-4 bg-gray-50 rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
              {generatedTests}
            </pre>
          </div>
        )}

        {/* Notes */}
        {!generatedTests && !error && (
          <div className="mt-4 text-sm text-gray-600">
            <p>Enter JavaScript functions to generate basic Jest unit tests.</p>
            <p className="mt-1">Features:</p>
            <ul className="list-disc pl-5">
              <li>Detects function declarations and arrow functions</li>
              <li>Generates tests for existence and basic functionality</li>
              <li>Handles parameter validation</li>
            </ul>
            <p className="mt-2">Note: Tests are basic skeletons; customize them for specific use cases.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitTestGenerator;