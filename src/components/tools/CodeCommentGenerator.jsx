"use client";

import React, { useState } from 'react';

const CodeCommentGenerator = () => {
  const [inputCode, setInputCode] = useState('');
  const [commentedCode, setCommentedCode] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateComments = (code) => {
    setError(null);
    setCommentedCode('');
    setCopied(false);

    if (!code.trim()) {
      setError('Please enter some code');
      return;
    }

    try {
      const lines = code.split('\n');
      const commentedLines = [];
      let inMultiLineComment = false;
      let indentLevel = 0;

      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        const indent = line.match(/^\s*/)[0] || '';
        let comment = '';

        // Skip empty lines or existing comments
        if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) {
          commentedLines.push(line);
          if (trimmedLine.startsWith('/*')) inMultiLineComment = true;
          if (trimmedLine.endsWith('*/')) inMultiLineComment = false;
          return;
        }

        if (inMultiLineComment) {
          commentedLines.push(line);
          return;
        }

        // Function declaration
        if (/function\s+\w+\s*\(/.test(trimmedLine) || /\w+\s*=>\s*{/.test(trimmedLine)) {
          const funcNameMatch = trimmedLine.match(/function\s+(\w+)|(\w+)\s*=>/);
          const funcName = funcNameMatch ? (funcNameMatch[1] || funcNameMatch[2]) : 'anonymous';
          comment = `${indent}// Function: ${funcName} - Defines a function to`;
          indentLevel++;
        }

        // If statement
        else if (/if\s*\(/.test(trimmedLine)) {
          const condition = trimmedLine.match(/if\s*\((.*?)\)/)?.[1] || 'condition';
          comment = `${indent}// If: Checks if ${condition}`;
          indentLevel++;
        }

        // For loop
        else if (/for\s*\(/.test(trimmedLine)) {
          const loopParts = trimmedLine.match(/for\s*\((.*?);(.*?);(.*?)\)/);
          const init = loopParts?.[1] || 'init';
          const cond = loopParts?.[2] || 'condition';
          comment = `${indent}// Loop: Iterates with ${init} while ${cond}`;
          indentLevel++;
        }

        // While loop
        else if (/while\s*\(/.test(trimmedLine)) {
          const condition = trimmedLine.match(/while\s*\((.*?)\)/)?.[1] || 'condition';
          comment = `${indent}// While: Loops while ${condition}`;
          indentLevel++;
        }

        // Closing brace
        else if (trimmedLine === '}') {
          indentLevel = Math.max(0, indentLevel - 1);
          commentedLines.push(line);
          return;
        }

        // Variable declaration
        else if (/(let|const|var)\s+\w+\s*=/.test(trimmedLine)) {
          const varMatch = trimmedLine.match(/(let|const|var)\s+(\w+)\s*=\s*(.+)/);
          if (varMatch) {
            const [, type, name, value] = varMatch;
            comment = `${indent}// ${type === 'const' ? 'Constant' : 'Variable'}: Initializes ${name} with ${value.slice(0, 20)}${value.length > 20 ? '...' : ''}`;
          }
        }

        if (comment) {
          commentedLines.push(comment);
        }
        commentedLines.push(line);
      });

      setCommentedCode(commentedLines.join('\n'));
    } catch (err) {
      setError('Error processing code: ' + err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateComments(inputCode);
  };

  const handleCopy = () => {
    if (commentedCode) {
      navigator.clipboard.writeText(commentedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Code Comment Generator</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code Input (JavaScript-like syntax)
            </label>
            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="w-full h-48 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`function add(a, b) {
  if (a > 0) {
    const sum = a + b;
    return sum;
  }
  return 0;
}`}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate Comments
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Commented Code */}
        {commentedCode && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Commented Code</h3>
              <button
                onClick={handleCopy}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="p-4 bg-gray-50 rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap">
              {commentedCode}
            </pre>
          </div>
        )}

        {/* Notes */}
        {!commentedCode && !error && (
          <div className="mt-4 text-sm text-gray-600">
            <p>Enter JavaScript-like code to generate basic comments for functions, conditionals, loops, and variables.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeCommentGenerator;