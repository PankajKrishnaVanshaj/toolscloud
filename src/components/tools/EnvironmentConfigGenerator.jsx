"use client";

import React, { useState, useCallback } from 'react';
import YAML from 'yaml';
import { FaPlus, FaTrash, FaCopy, FaDownload, FaSync } from 'react-icons/fa';

const EnvironmentConfigGenerator = () => {
  const [variables, setVariables] = useState([{ key: '', value: '', secret: false }]);
  const [format, setFormat] = useState('env');
  const [generatedConfig, setGeneratedConfig] = useState('');
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState('config');
  const [history, setHistory] = useState([]);

  const formats = [
    { value: 'env', label: '.env', extension: '.env' },
    { value: 'json', label: 'JSON', extension: '.json' },
    { value: 'yaml', label: 'YAML', extension: '.yaml' },
    { value: 'ini', label: 'INI', extension: '.ini' },
  ];

  const addVariable = () => {
    setVariables([...variables, { key: '', value: '', secret: false }]);
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

  const generateConfig = useCallback(() => {
    const configObj = variables.reduce((acc, { key, value }) => {
      if (key.trim()) acc[key] = value;
      return acc;
    }, {});

    let output = '';
    switch (format) {
      case 'env':
        output = variables
          .filter(v => v.key.trim())
          .map(v => `${v.key}=${v.secret ? '"********"' : v.value.replace(/\n/g, '\\n')}`)
          .join('\n');
        break;
      case 'json':
        output = JSON.stringify(configObj, null, 2);
        break;
      case 'yaml':
        output = YAML.stringify(configObj);
        break;
      case 'ini':
        output = variables
          .filter(v => v.key.trim())
          .map(v => `${v.key}=${v.secret ? '"********"' : v.value}`)
          .join('\n');
        break;
      default:
        output = '';
    }

    setGeneratedConfig(output);
    setHistory(prev => [...prev, { format, output, timestamp: new Date() }].slice(-5));
    setCopied(false);
  }, [format, variables]);

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

  const handleDownload = () => {
    if (generatedConfig) {
      const extension = formats.find(f => f.value === format).extension;
      const blob = new Blob([generatedConfig], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}${extension}`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setVariables([{ key: '', value: '', secret: false }]);
    setGeneratedConfig('');
    setFileName('config');
    setCopied(false);
  };

  const restoreFromHistory = (entry) => {
    setFormat(entry.format);
    setGeneratedConfig(entry.output);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Environment Config Generator</h2>

        {/* Variable Inputs */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Define Variables</h3>
          <div className="space-y-4">
            {variables.map((variable, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center p-3 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  value={variable.key}
                  onChange={(e) => updateVariable(index, 'key', e.target.value)}
                  className="w-full sm:w-1/3 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Key (e.g., API_KEY)"
                />
                <input
                  type={variable.secret ? "password" : "text"}
                  value={variable.value}
                  onChange={(e) => updateVariable(index, 'value', e.target.value)}
                  className="w-full sm:flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Value (e.g., xyz123)"
                />
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={variable.secret}
                    onChange={(e) => updateVariable(index, 'secret', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">Secret</span>
                </label>
                {variables.length > 1 && (
                  <button
                    onClick={() => removeVariable(index)}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addVariable}
              className="w-full py-2 px-4 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center justify-center"
            >
              <FaPlus className="mr-2" /> Add Variable
            </button>
          </div>
        </div>

        {/* Format Selection and Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Output Format</label>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File Name</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="config"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={handleSubmit}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Generate Config
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
          <button
            onClick={handleDownload}
            disabled={!generatedConfig}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download
          </button>
        </div>

        {/* Generated Config */}
        {generatedConfig && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-700">
                Generated {formats.find(f => f.value === format).label} Config
              </h3>
              <button
                onClick={handleCopy}
                className={`py-1 px-3 rounded-md transition-colors flex items-center ${
                  copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <FaCopy className="mr-2" /> {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="p-4 bg-gray-50 rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap break-all max-h-64 overflow-auto">
              {generatedConfig}
            </pre>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">History (Last 5)</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>
                    {entry.format.toUpperCase()} - {entry.output.slice(0, 30)}... ({entry.timestamp.toLocaleTimeString()})
                  </span>
                  <button
                    onClick={() => restoreFromHistory(entry)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Instructions */}
        {!generatedConfig && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">How to Use</h3>
            <p className="text-sm text-blue-600">
              Enter key-value pairs and select an output format to generate environment configuration files.
              Mark sensitive data as "Secret" to mask values in the output.
            </p>
            <p className="text-sm text-blue-600 mt-2">Supported formats: .env, JSON, YAML, INI</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnvironmentConfigGenerator;