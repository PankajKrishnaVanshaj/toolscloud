"use client";

import React, { useState } from 'react';

const JavaScriptObfuscator = () => {
  const [inputCode, setInputCode] = useState('');
  const [obfuscatedCode, setObfuscatedCode] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    renameVariables: true,
    minify: true,
    encodeStrings: false
  });

  const obfuscateCode = (code) => {
    setError(null);
    setObfuscatedCode('');
    setCopied(false);

    if (!code.trim()) {
      setError('Please enter some JavaScript code');
      return;
    }

    try {
      let result = code;

      // Step 1: Minify (remove comments and extra whitespace)
      if (options.minify) {
        result = result
          .replace(/\/\/.*$/gm, '') // Remove single-line comments
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
          .replace(/\s+/g, ' ') // Collapse multiple spaces
          .replace(/\s*([{}[\]()=+\-*/;:,])\s*/g, '$1') // Remove spaces around operators
          .trim();
      }

      // Step 2: Rename variables (simple approach)
      if (options.renameVariables) {
        const variableMap = new Map();
        let varCounter = 0;

        // Match variable declarations (let, const, var)
        result = result.replace(/(let|const|var)\s+(\w+)/g, (match, keyword, varName) => {
          if (!variableMap.has(varName)) {
            variableMap.set(varName, `_v${varCounter++}`);
          }
          return `${keyword} ${variableMap.get(varName)}`;
        });

        // Replace variable references
        variableMap.forEach((newName, oldName) => {
          const regex = new RegExp(`\\b${oldName}\\b(?![\\w])`, 'g');
          result = result.replace(regex, newName);
        });
      }

      // Step 3: Encode strings (basic base64 encoding)
      if (options.encodeStrings) {
        result = result.replace(/"([^"]*)"|'([^']*)'/g, (match, doubleQuoted, singleQuoted) => {
          const str = doubleQuoted || singleQuoted;
          const encoded = btoa(str);
          return `atob("${encoded}")`;
        });
      }

      setObfuscatedCode(result);
    } catch (err) {
      setError('Error obfuscating code: ' + err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    obfuscateCode(inputCode);
  };

  const handleCopy = () => {
    if (obfuscatedCode) {
      navigator.clipboard.writeText(obfuscatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleOption = (option) => {
    setOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">JavaScript Obfuscator</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              JavaScript Code
            </label>
            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="w-full h-48 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`function greet(name) {
  const message = "Hello, " + name;
  console.log(message);
  return message;
}

greet("World");`}
            />
          </div>

          {/* Obfuscation Options */}
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.renameVariables}
                onChange={() => toggleOption('renameVariables')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Rename Variables</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.minify}
                onChange={() => toggleOption('minify')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Minify</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.encodeStrings}
                onChange={() => toggleOption('encodeStrings')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Encode Strings</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Obfuscate Code
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Obfuscated Output */}
        {obfuscatedCode && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Obfuscated Code</h3>
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
              {obfuscatedCode}
            </pre>
          </div>
        )}

        {/* Notes */}
        <div className="mt-4 text-sm text-gray-600">
          <p>Notes:</p>
          <ul className="list-disc pl-5">
            <li>This is a basic obfuscator; use advanced tools like <code>javascript-obfuscator</code> for production.</li>
            <li>Renames variables with simple prefixes (e.g., _v0, _v1).</li>
            <li>Minifies by removing comments and extra whitespace.</li>
            <li>Encodes strings using base64 (decoded with <code>atob</code>).</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JavaScriptObfuscator;