"use client";

import React, { useState } from 'react';

const EnvironmentVariableEditor = () => {
  const [variables, setVariables] = useState([{ key: '', value: '' }]);
  const [generatedEnv, setGeneratedEnv] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const addVariable = () => {
    setVariables([...variables, { key: '', value: '' }]);
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

  const generateEnv = () => {
    setError(null);
    setCopied(false);

    const invalidKeys = variables.filter(v => !v.key.trim() && v.value.trim());
    if (invalidKeys.length > 0) {
      setError('All variables must have a key if a value is provided');
      setGeneratedEnv('');
      return;
    }

    const envContent = variables
      .filter(v => v.key.trim()) // Only include variables with keys
      .map(v => `${v.key}=${v.value.replace(/\n/g, '\\n')}`) // Escape newlines
      .join('\n');

    if (!envContent) {
      setError('No valid variables to generate');
      setGeneratedEnv('');
      return;
    }

    setGeneratedEnv(envContent);
  };

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
      const blob = new Blob([generatedEnv], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '.env';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Environment Variable Editor</h2>

        {/* Variable Inputs */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700 mb-2">Edit Variables</h3>
          {variables.map((variable, index) => (
            <div key={index} className="flex gap-4 items-center p-2 bg-gray-50 rounded-md">
              <input
                type="text"
                value={variable.key}
                onChange={(e) => updateVariable(index, 'key', e.target.value)}
                className="w-1/3 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="KEY (e.g., API_KEY)"
              />
              <input
                type="text"
                value={variable.value}
                onChange={(e) => updateVariable(index, 'value', e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Value (e.g., xyz123)"
              />
              {variables.length > 1 && (
                <button
                  onClick={() => removeVariable(index)}
                  className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addVariable}
            className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Add Variable
          </button>
        </div>

        {/* Generate Button */}
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate .env
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Generated .env */}
        {generatedEnv && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Generated .env File</h3>
              <div className="space-x-2">
                <button
                  onClick={handleCopy}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
            <pre className="p-4 bg-gray-50 rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">
              {generatedEnv}
            </pre>
          </div>
        )}

        {/* Instructions */}
        {!generatedEnv && !error && (
          <div className="mt-4 text-sm text-gray-600">
            <p>Enter environment variables as key-value pairs to create a .env file.</p>
            <p className="mt-1">Example:</p>
            <pre className="p-2 bg-gray-50 rounded-md text-sm font-mono">
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