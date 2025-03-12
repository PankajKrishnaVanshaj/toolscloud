"use client";

import React, { useState, useCallback } from 'react';
import { FaCopy, FaDownload, FaSync, FaCog } from 'react-icons/fa';

const CodeCommentGenerator = () => {
  const [inputCode, setInputCode] = useState('');
  const [commentedCode, setCommentedCode] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const [commentOptions, setCommentOptions] = useState({
    functions: true,
    conditionals: true,
    loops: true,
    variables: true,
    verbose: false,
    includeLineNumbers: false,
  });

  const generateComments = useCallback((code) => {
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
      let indentLevel = 0;
      let lineNumber = 1;

      const getCommentPrefix = () => language === 'python' ? '# ' : '// ';
      const getIndent = (level) => ' '.repeat(level * 2);

      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        const indent = line.match(/^\s*/)[0] || '';
        let comment = '';

        // Skip empty lines or existing comments
        if (!trimmedLine || trimmedLine.startsWith(getCommentPrefix()) || 
            (language === 'javascript' && (trimmedLine.startsWith('/*') || trimmedLine.endsWith('*/')))) {
          commentedLines.push(commentOptions.includeLineNumbers ? `${lineNumber++}. ${line}` : line);
          return;
        }

        // Comment generation based on options
        if (language === 'javascript' || language === 'typescript') {
          if (commentOptions.functions && 
              (/function\s+\w+\s*\(/.test(trimmedLine) || /\w+\s*=>\s*{/.test(trimmedLine))) {
            const funcNameMatch = trimmedLine.match(/function\s+(\w+)|(\w+)\s*=>/);
            const funcName = funcNameMatch ? (funcNameMatch[1] || funcNameMatch[2]) : 'anonymous';
            const params = trimmedLine.match(/\((.*?)\)/)?.[1] || '';
            comment = `${getIndent(indentLevel)}${getCommentPrefix()}Function: ${funcName} - ${commentOptions.verbose ? `Handles ${params || 'no parameters'}` : 'Defines a function'}`;
            indentLevel++;
          }
          else if (commentOptions.conditionals && /if\s*\(/.test(trimmedLine)) {
            const condition = trimmedLine.match(/if\s*\((.*?)\)/)?.[1] || 'condition';
            comment = `${getIndent(indentLevel)}${getCommentPrefix()}If: Checks if ${condition}`;
            indentLevel++;
          }
          else if (commentOptions.loops && /for\s*\(/.test(trimmedLine)) {
            const loopParts = trimmedLine.match(/for\s*\((.*?);(.*?);(.*?)\)/);
            const init = loopParts?.[1] || 'init';
            const cond = loopParts?.[2] || 'condition';
            comment = `${getIndent(indentLevel)}${getCommentPrefix()}Loop: Iterates with ${init} while ${cond}`;
            indentLevel++;
          }
          else if (commentOptions.loops && /while\s*\(/.test(trimmedLine)) {
            const condition = trimmedLine.match(/while\s*\((.*?)\)/)?.[1] || 'condition';
            comment = `${getIndent(indentLevel)}${getCommentPrefix()}While: Loops while ${condition}`;
            indentLevel++;
          }
          else if (commentOptions.variables && /(let|const|var)\s+\w+\s*=/.test(trimmedLine)) {
            const varMatch = trimmedLine.match(/(let|const|var)\s+(\w+)\s*=\s*(.+)/);
            if (varMatch) {
              const [, type, name, value] = varMatch;
              comment = `${getIndent(indentLevel)}${getCommentPrefix()}${type === 'const' ? 'Constant' : 'Variable'}: Initializes ${name} with ${value.slice(0, 20)}${value.length > 20 ? '...' : ''}`;
            }
          }
          else if (trimmedLine === '}') {
            indentLevel = Math.max(0, indentLevel - 1);
          }
        } else if (language === 'python') {
          if (commentOptions.functions && trimmedLine.startsWith('def ')) {
            const funcName = trimmedLine.match(/def\s+(\w+)\s*\(/)?.[1] || 'anonymous';
            const params = trimmedLine.match(/\((.*?)\)/)?.[1] || '';
            comment = `${getIndent(indentLevel)}${getCommentPrefix()}Function: ${funcName} - ${commentOptions.verbose ? `Handles ${params || 'no parameters'}` : 'Defines a function'}`;
            indentLevel++;
          }
          else if (commentOptions.conditionals && trimmedLine.startsWith('if ')) {
            const condition = trimmedLine.match(/if\s+(.*?):/)?.[1] || 'condition';
            comment = `${getIndent(indentLevel)}${getCommentPrefix()}If: Checks if ${condition}`;
            indentLevel++;
          }
          else if (commentOptions.loops && trimmedLine.startsWith('for ')) {
            const loopParts = trimmedLine.match(/for\s+(.*?)\s+in\s+(.*?):/) || [];
            const varName = loopParts[1] || 'variable';
            const iterable = loopParts[2] || 'iterable';
            comment = `${getIndent(indentLevel)}${getCommentPrefix()}Loop: Iterates ${varName} over ${iterable}`;
            indentLevel++;
          }
          else if (commentOptions.loops && trimmedLine.startsWith('while ')) {
            const condition = trimmedLine.match(/while\s+(.*?):/)?.[1] || 'condition';
            comment = `${getIndent(indentLevel)}${getCommentPrefix()}While: Loops while ${condition}`;
            indentLevel++;
          }
          else if (indentLevel > 0 && !trimmedLine) {
            indentLevel = Math.max(0, indentLevel - 1);
          }
        }

        if (comment) commentedLines.push(comment);
        commentedLines.push(commentOptions.includeLineNumbers ? `${lineNumber++}. ${line}` : line);
      });

      setCommentedCode(commentedLines.join('\n'));
    } catch (err) {
      setError('Error processing code: ' + err.message);
    }
  }, [language, commentOptions]);

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

  const handleDownload = () => {
    if (commentedCode) {
      const blob = new Blob([commentedCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `commented_code_${Date.now()}.${language === 'python' ? 'py' : 'js'}`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setInputCode('');
    setCommentedCode('');
    setError(null);
    setCopied(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Code Comment Generator</h2>

        {/* Language Selection & Options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
              </select>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Comment Options</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(commentOptions).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setCommentOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Input Code ({language})
            </label>
            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="w-full h-48 sm:h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={language === 'python' ? 
                `def greet(name):\n    if name:\n        return f"Hello, {name}"` : 
                `function greet(name) {\n  if (name) {\n    return \`Hello, \${name}\`;\n  }\n}`}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaCog className="mr-2" /> Generate Comments
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
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

        {/* Commented Code */}
        {commentedCode && (
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
              <h3 className="font-semibold text-gray-700">Commented Code</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className={`py-2 px-4 rounded-lg transition-colors flex items-center ${
                    copied ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <FaCopy className="mr-2" /> {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleDownload}
                  className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
            <pre className="p-4 bg-gray-50 rounded-lg text-sm font-mono text-gray-800 whitespace-pre-wrap border border-gray-200 max-h-96 overflow-auto">
              {commentedCode}
            </pre>
          </div>
        )}

        {/* Features List */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports JavaScript, TypeScript, and Python</li>
            <li>Comments for functions, conditionals, loops, and variables</li>
            <li>Customizable comment types and verbosity</li>
            <li>Optional line numbers</li>
            <li>Copy and download generated code</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CodeCommentGenerator;