"use client";

import React, { useState, useCallback } from "react";
import { FaSync, FaDownload, FaCog } from "react-icons/fa";

const CodeLinter = () => {
  const [codeInput, setCodeInput] = useState("");
  const [lintResults, setLintResults] = useState([]);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [lintOptions, setLintOptions] = useState({
    checkUndeclaredVars: true,
    checkSemicolons: true,
    checkLineLength: true,
    maxLineLength: 80,
    checkCamelCase: true,
    checkUnusedVars: true,
    checkIndentation: true,
    indentSize: 2,
  });

  const lintCode = useCallback((code) => {
    setError(null);
    setLintResults([]);

    if (!code.trim()) {
      setError("Please enter some code to lint");
      return;
    }

    const lines = code.split("\n");
    const issues = [];
    const variables = new Map();
    let inFunction = false;
    let braceCount = 0;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      const lineNum = index + 1;

      if (!trimmedLine || trimmedLine.startsWith("//") || trimmedLine.startsWith("/*")) {
        return;
      }

      // Brace tracking
      braceCount += (trimmedLine.match(/{/g) || []).length - (trimmedLine.match(/}/g) || []).length;
      if (trimmedLine.includes("function")) inFunction = true;
      if (braceCount === 0) inFunction = false;

      // Indentation check
      if (lintOptions.checkIndentation) {
        const leadingSpaces = line.match(/^\s*/)[0].length;
        if (leadingSpaces % lintOptions.indentSize !== 0) {
          issues.push({
            line: lineNum,
            message: `Incorrect indentation (expected multiple of ${lintOptions.indentSize} spaces)`,
            type: "style",
          });
        }
      }

      // Variable declaration
      if (lintOptions.checkUndeclaredVars || lintOptions.checkUnusedVars) {
        const varDecls = trimmedLine.match(/(let|const|var)\s+(\w+)/g);
        if (varDecls) {
          varDecls.forEach((decl) => {
            const [, , varName] = decl.match(/(let|const|var)\s+(\w+)/);
            variables.set(varName, { declared: lineNum, used: [] });
          });
        }

        const words = trimmedLine.split(/\W+/).filter(
          (word) => word && !/^(let|const|var|function|if|for|while|return)$/.test(word)
        );
        words.forEach((word) => {
          if (variables.has(word) && !varDecls?.some((decl) => decl.includes(word))) {
            variables.get(word).used.push(lineNum);
          } else if (
            lintOptions.checkUndeclaredVars &&
            !variables.has(word) &&
            !inFunction &&
            !/^\d+$/.test(word)
          ) {
            issues.push({
              line: lineNum,
              message: `Undeclared variable '${word}'`,
              type: "error",
            });
          }
        });
      }

      // Semicolon check
      if (
        lintOptions.checkSemicolons &&
        !trimmedLine.endsWith(";") &&
        !trimmedLine.endsWith("{") &&
        !trimmedLine.endsWith("}") &&
        !trimmedLine.includes("function")
      ) {
        issues.push({
          line: lineNum,
          message: "Missing semicolon at end of line",
          type: "warning",
        });
      }

      // Line length
      if (lintOptions.checkLineLength && line.length > lintOptions.maxLineLength) {
        issues.push({
          line: lineNum,
          message: `Line exceeds ${lintOptions.maxLineLength} characters`,
          type: "warning",
        });
      }

      // CamelCase check
      if (lintOptions.checkCamelCase) {
        const varDecls = trimmedLine.match(/(let|const|var)\s+(\w+)/g);
        if (varDecls) {
          varDecls.forEach((decl) => {
            const varName = decl.match(/(let|const|var)\s+(\w+)/)[2];
            if (!/^[a-z][a-zA-Z0-9]*$/.test(varName)) {
              issues.push({
                line: lineNum,
                message: `Variable '${varName}' should use camelCase`,
                type: "style",
              });
            }
          });
        }
      }
    });

    // Unused variables
    if (lintOptions.checkUnusedVars) {
      variables.forEach((info, name) => {
        if (info.used.length === 0) {
          issues.push({
            line: info.declared,
            message: `Variable '${name}' is declared but never used`,
            type: "warning",
          });
        }
      });
    }

    setLintResults(issues);
  }, [lintOptions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    lintCode(codeInput);
  };

  const handleReset = () => {
    setCodeInput("");
    setLintResults([]);
    setError(null);
  };

  const handleDownload = () => {
    const blob = new Blob([codeInput], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `code-${Date.now()}.js`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "error":
        return "text-red-700 bg-red-50 border-red-200";
      case "warning":
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "style":
        return "text-blue-700 bg-blue-50 border-blue-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6"> Code Linter</h2>

        {/* Code Input */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              JavaScript Code
            </label>
            <textarea
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`let user_name = "John";
const x = 5
for(let i=0; i<5; i++) {
  console.log(user_name)
}`}
              aria-label="JavaScript Code Input"
            />
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Lint Code
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={handleDownload}
              disabled={!codeInput.trim()}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>
        </form>

        {/* Settings */}
        <div className="mt-6">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            <FaCog className="mr-2" /> {showSettings ? "Hide Settings" : "Show Settings"}
          </button>
          {showSettings && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Linting Options</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(lintOptions).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    {typeof value === "boolean" ? (
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) =>
                            setLintOptions((prev) => ({ ...prev, [key]: e.target.checked }))
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-600">
                          {key.replace(/check/, "").replace(/([A-Z])/g, " $1").trim()}
                        </span>
                      </label>
                    ) : (
                      <label className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {key.replace(/([A-Z])/g, " $1").trim()}:
                        </span>
                        <input
                          type="number"
                          value={value}
                          onChange={(e) =>
                            setLintOptions((prev) => ({
                              ...prev,
                              [key]: parseInt(e.target.value) || 0,
                            }))
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          min="1"
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Lint Results */}
        {lintResults.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Linting Results</h3>
            <div className="space-y-3">
              {lintResults.map((issue, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${getTypeColor(issue.type)}`}
                >
                  <p className="text-sm">
                    <span className="font-mono">Line {issue.line}</span>: {issue.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {lintResults.length === 0 && codeInput.trim() && !error && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700">✓ No linting issues found!</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Detects undeclared and unused variables</li>
            <li>Checks for missing semicolons</li>
            <li>Enforces line length limits</li>
            <li>Validates camelCase naming</li>
            <li>Verifies proper indentation</li>
            <li>Customizable linting rules</li>
            <li>Download linted code</li>
          </ul>
          <p className="mt-2 text-sm text-blue-600">
            Note: This is a basic linter. For comprehensive analysis, use ESLint.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CodeLinter;