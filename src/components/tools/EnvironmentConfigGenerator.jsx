"use client";

import React, { useState } from 'react';
import YAML from 'yaml';

const EnvironmentConfigGenerator = () => {
  const [variables, setVariables] = useState([{ key: '', value: '' }]);
  const [format, setFormat] = useState('env');
  const [generatedConfig, setGeneratedConfig] = useState('');
  const [copied, setCopied] = useState(false);

  const formats = [
    { value: 'env', label: '.env' },
    { value: 'json', label: 'JSON' },
    { value: 'yaml', label: 'YAML' }
  ];

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

  const generateConfig = () => {
    const configObj = variables.reduce((acc, { key, value }) => {
      if (key.trim()) acc[key] = value;
      return acc;
    }, {});

    let output = '';
    switch (format) {
      case 'env':
        output = variables
          .filter(v => v.key.trim())
          .map(v => `${v.key}=${v.value.replace(/\n/g, '\\n')}`)
          .join('\n');
        break;
      case 'json':
        output = JSON.stringify(configObj, null, 2);
        break;
      case 'yaml':
        output = YAML.stringify(configObj);
        break;
      default:
        output = '';
    }

    setGeneratedConfig(output);
    setCopied(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateConfig();
  };

  const handleCopy = () => {
    if (generatedConfig) {
      navigator.clipboard.writeText(generatedConfig);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Environment Config Generator</h2>

        {/* Variable Inputs */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700 mb-2">Define Variables</h3>
          {variables.map((variable, index) => (
            <div key={index} className="flex gap-4 items-center p-2 bg-gray-50 rounded-md">
              <input
                type="text"
                value={variable.key}
                onChange={(e) => updateVariable(index, 'key', e.target.value)}
                className="w-1/3 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Key (e.g., API_KEY)"
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

        {/* Format Selection and Generation */}
        <div className="mt-6 flex gap-4 items-center">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Output Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {formats.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate Config
          </button>
        </div>

        {/* Generated Config */}
        {generatedConfig && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Generated {formats.find(f => f.value === format).label} Config</h3>
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
              {generatedConfig}
            </pre>
          </div>
        )}

        {/* Notes */}
        {!generatedConfig && (
          <div className="mt-4 text-sm text-gray-600">
            <p className="mt-1">Enter key-value pairs to generate environment configuration files.</p>
            <p className="mt-1">Example outputs:</p>
            <ul className="list-disc pl-5">
              <li>.env: <code>API_KEY=xyz123</code></li>
              <li>JSON: <code>{'{"API_KEY": "xyz123"}'}</code></li>
              <li>YAML: <code>API_KEY: xyz123</code></li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnvironmentConfigGenerator;