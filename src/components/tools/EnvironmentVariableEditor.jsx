"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaPlus, FaTrash, FaUndo, FaHistory } from "react-icons/fa";

const EnvironmentVariableEditor = () => {
  const [variables, setVariables] = useState([{ key: "", value: "" }]);
  const [generatedEnv, setGeneratedEnv] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    uppercaseKeys: false,
    quoteValues: false,
    includeComments: false,
  });

  const addVariable = () => {
    setVariables([...variables, { key: "", value: "" }]);
  };

  const updateVariable = (index, field, value) => {
    const newVariables = [...variables];
    newVariables[index][field] = value;
    setVariables(newVariables);
  };

  const removeVariable = (index) => {
    if (variables.length > 1) {
      setVariables(variables.filter((_, i) => i !== index));
    }
  };

  const generateEnv = useCallback(() => {
    setError(null);
    setCopied(false);

    const invalidKeys = variables.filter((v) => !v.key.trim() && v.value.trim());
    if (invalidKeys.length > 0) {
      setError("All variables must have a key if a value is provided");
      setGeneratedEnv("");
      return;
    }

    const validVariables = variables.filter((v) => v.key.trim());
    if (validVariables.length === 0) {
      setError("At least one valid variable is required");
      setGeneratedEnv("");
      return;
    }

    const envContent = validVariables
      .map((v) => {
        let key = options.uppercaseKeys ? v.key.trim().toUpperCase() : v.key.trim();
        let value = v.value.replace(/\n/g, "\\n");
        if (options.quoteValues) value = `"${value}"`;
        return options.includeComments && v.key ? `# ${v.key} description\n${key}=${value}` : `${key}=${value}`;
      })
      .join("\n");

    setGeneratedEnv(envContent);
    setHistory((prev) => [...prev, envContent].slice(-5)); // Keep last 5 in history
  }, [variables, options]);

  const handleSubmit = (e) => {
    e.preventDefault();
    generateEnv();
  };

  const handleCopy = () => {
    if (generatedEnv) {
      navigator.clipboard.writeText(generatedEnv);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (generatedEnv) {
      const blob = new Blob([generatedEnv], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `.env-${Date.now()}`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setVariables([{ key: "", value: "" }]);
    setGeneratedEnv("");
    setError(null);
    setCopied(false);
  };

  const restoreFromHistory = (entry) => {
    const lines = entry.split("\n").filter((line) => !line.startsWith("#"));
    const restoredVars = lines.map((line) => {
      const [key, ...valueParts] = line.split("=");
      return { key, value: valueParts.join("=").replace(/^"|"$/g, "") };
    });
    setVariables(restoredVars);
    setGeneratedEnv(entry);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Environment Variable Editor</h1>

        {/* Options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Options</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.uppercaseKeys}
                onChange={(e) => setOptions((prev) => ({ ...prev, uppercaseKeys: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">Uppercase Keys</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.quoteValues}
                onChange={(e) => setOptions((prev) => ({ ...prev, quoteValues: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">Quote Values</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.includeComments}
                onChange={(e) => setOptions((prev) => ({ ...prev, includeComments: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">Include Comments</span>
            </label>
          </div>
        </div>

        {/* Variable Inputs */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Variables</h3>
          <div className="space-y-3">
            {variables.map((variable, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-2 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  value={variable.key}
                  onChange={(e) => updateVariable(index, "key", e.target.value)}
                  className="w-full sm:w-1/3 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="KEY (e.g., API_KEY)"
                />
                <input
                  type="text"
                  value={variable.value}
                  onChange={(e) => updateVariable(index, "value", e.target.value)}
                  className="w-full sm:flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Value (e.g., xyz123)"
                />
                {variables.length > 1 && (
                  <button
                    onClick={() => removeVariable(index)}
                    className="w-full sm:w-auto px-3 py-1 text-sm text-red-600 hover:text-red-800 flex items-center justify-center"
                  >
                    <FaTrash className="mr-1" /> Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addVariable}
            className="mt-3 w-full py-2 px-4 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center justify-center"
          >
            <FaPlus className="mr-2" /> Add Variable
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={handleSubmit}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Generate .env
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaUndo className="mr-2" /> Reset
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Generated Output */}
        {generatedEnv && (
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-700">Generated .env</h3>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <button
                  onClick={handleCopy}
                  className={`py-2 px-4 rounded-md transition-colors flex items-center ${
                    copied ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <FaCopy className="mr-2" /> {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
            <pre className="p-4 bg-gray-50 rounded-lg text-sm font-mono text-gray-800 whitespace-pre-wrap break-all border border-gray-200 max-h-64 overflow-auto">
              {generatedEnv}
            </pre>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center mb-3">
              <FaHistory className="mr-2" /> Recent Generations (Last 5)
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="truncate max-w-[70%]">{entry.slice(0, 50)}...</span>
                  <button
                    onClick={() => restoreFromHistory(entry)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Instructions */}
        {!generatedEnv && !error && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">How to Use</h3>
            <p className="text-sm text-blue-600">
              Enter key-value pairs for your environment variables. Customize output with options like uppercase keys or quoted values. Example:
            </p>
            <pre className="mt-2 p-2 bg-white rounded-md text-sm font-mono text-blue-800">
              API_KEY=xyz123
              DATABASE_URL=mysql://localhost:3306
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnvironmentVariableEditor;