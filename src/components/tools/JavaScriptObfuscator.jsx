"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaSync, FaLock } from "react-icons/fa";

const JavaScriptObfuscator = () => {
  const [inputCode, setInputCode] = useState("");
  const [obfuscatedCode, setObfuscatedCode] = useState("");
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    renameVariables: true,
    minify: true,
    encodeStrings: false,
    stringSplitting: false,
    deadCodeInjection: false,
    controlFlowFlattening: false,
  });
  const [showOriginal, setShowOriginal] = useState(true);

  const obfuscateCode = useCallback((code) => {
    setError(null);
    setObfuscatedCode("");
    setCopied(false);

    if (!code.trim()) {
      setError("Please enter some JavaScript code");
      return;
    }

    try {
      let result = code;

      // Minify
      if (options.minify) {
        result = result
          .replace(/\/\/.*$/gm, "") // Remove single-line comments
          .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
          .replace(/\s+/g, " ") // Collapse multiple spaces
          .replace(/\s*([{}[\]()=+\-*/;:,])\s*/g, "$1") // Remove spaces around operators
          .trim();
      }

      // Rename variables
      if (options.renameVariables) {
        const variableMap = new Map();
        let varCounter = 0;

        result = result.replace(/(let|const|var)\s+(\w+)/g, (match, keyword, varName) => {
          if (!variableMap.has(varName)) {
            variableMap.set(varName, `_x${varCounter++}${Math.random().toString(36).slice(2, 5)}`);
          }
          return `${keyword} ${variableMap.get(varName)}`;
        });

        variableMap.forEach((newName, oldName) => {
          const regex = new RegExp(`\\b${oldName}\\b(?![\\w])`, "g");
          result = result.replace(regex, newName);
        });
      }

      // Encode strings
      if (options.encodeStrings) {
        result = result.replace(/"([^"]*)"|'([^']*)'/g, (match, doubleQuoted, singleQuoted) => {
          const str = doubleQuoted || singleQuoted;
          const encoded = btoa(unescape(encodeURIComponent(str)));
          return `decodeURIComponent(escape(atob("${encoded}")))`;
        });
      }

      // String splitting
      if (options.stringSplitting) {
        result = result.replace(/"([^"]{5,})"|'([^']{5,})'/g, (match, doubleQuoted, singleQuoted) => {
          const str = doubleQuoted || singleQuoted;
          const parts = str.match(/.{1,3}/g) || [];
          return parts.map(part => `"${part}"`).join("+");
        });
      }

      // Dead code injection (simple)
      if (options.deadCodeInjection) {
        const deadCode = `if(false){console.log("dead_${Math.random().toString(36).slice(2)}");};`;
        const lines = result.split(";");
        result = lines.join(`;${deadCode}`) + (lines.length > 1 ? ";" : "");
      }

      // Control flow flattening (basic)
      if (options.controlFlowFlattening) {
        const switchVar = `_ctrl${Math.random().toString(36).slice(2, 5)}`;
        result = `let ${switchVar}=0;while(${switchVar}<1){${switchVar}++;${result}}`;
      }

      setObfuscatedCode(result);
    } catch (err) {
      setError("Error obfuscating code: " + err.message);
    }
  }, [options]);

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

  const handleDownload = () => {
    if (obfuscatedCode) {
      const blob = new Blob([obfuscatedCode], { type: "text/javascript" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `obfuscated-${Date.now()}.js`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setInputCode("");
    setObfuscatedCode("");
    setError(null);
    setCopied(false);
    setShowOriginal(true);
  };

  const toggleOption = (option) => {
    setOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <FaLock className="mr-2" /> JavaScript Obfuscator
        </h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Input JavaScript Code
            </label>
            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="w-full h-48 sm:h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`function greet(name) {
  const message = "Hello, " + name;
  console.log(message);
  return message;
}

greet("World");`}
              aria-label="JavaScript Input"
            />
          </div>

          {/* Obfuscation Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Obfuscation Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(options).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => toggleOption(key)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!inputCode.trim()}
            >
              Obfuscate Code
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

        {/* Obfuscated Output */}
        {obfuscatedCode && (
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-3">
              <h3 className="font-semibold text-gray-700">Obfuscated Code</h3>
              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  className={`py-1 px-3 text-sm rounded transition-colors flex items-center ${
                    copied ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <FaCopy className="mr-2" /> {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="py-1 px-3 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
            <pre className="p-4 bg-gray-50 rounded-lg text-sm font-mono text-gray-800 whitespace-pre-wrap break-all border border-gray-200 max-h-64 overflow-auto">
              {obfuscatedCode}
            </pre>
          </div>
        )}

        {/* Original vs Obfuscated Toggle */}
        {obfuscatedCode && (
          <div className="mt-6">
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {showOriginal ? "Show Obfuscated Only" : "Show Original Comparison"}
            </button>
            {showOriginal && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-600">Original</h4>
                  <pre className="p-4 bg-gray-50 rounded-lg text-sm font-mono text-gray-800 whitespace-pre-wrap break-all border border-gray-200 max-h-48 overflow-auto">
                    {inputCode}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-600">Obfuscated</h4>
                  <pre className="p-4 bg-gray-50 rounded-lg text-sm font-mono text-gray-800 whitespace-pre-wrap break-all border border-gray-200 max-h-48 overflow-auto">
                    {obfuscatedCode}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Notes</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Minify: Removes comments and whitespace</li>
            <li>Rename Variables: Uses random suffixes</li>
            <li>Encode Strings: UTF-8 safe base64 encoding</li>
            <li>String Splitting: Splits long strings into parts</li>
            <li>Dead Code Injection: Adds useless code blocks</li>
            <li>Control Flow Flattening: Wraps code in a while loop</li>
            <li>For production, consider <code>javascript-obfuscator</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JavaScriptObfuscator;