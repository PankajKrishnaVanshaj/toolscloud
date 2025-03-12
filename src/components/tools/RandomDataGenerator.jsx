"use client";

import React, { useState, useCallback } from 'react';
import { FaCopy, FaDownload, FaSync, FaPlus } from 'react-icons/fa';

const RandomDataGenerator = () => {
  const [dataConfigs, setDataConfigs] = useState([
    { dataType: 'name', quantity: 1, format: 'plain' }
  ]);
  const [generatedData, setGeneratedData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const dataTypes = [
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'text', label: 'Text' },
    { value: 'phone', label: 'Phone' },
    { value: 'address', label: 'Address' },
    { value: 'uuid', label: 'UUID' }
  ];

  const formats = [
    { value: 'plain', label: 'Plain Text' },
    { value: 'json', label: 'JSON' },
    { value: 'csv', label: 'CSV' },
    { value: 'sql', label: 'SQL Insert' }
  ];

  const generateRandomData = useCallback(async () => {
    setLoading(true);
    const results = [];

    for (const config of dataConfigs) {
      const { dataType, quantity, format } = config;
      const data = [];
      for (let i = 0; i < Math.min(quantity, 1000); i++) {
        switch (dataType) {
          case 'name': data.push(generateRandomName()); break;
          case 'email': data.push(generateRandomEmail()); break;
          case 'number': data.push(generateRandomNumber()); break;
          case 'date': data.push(generateRandomDate()); break;
          case 'text': data.push(generateRandomText()); break;
          case 'phone': data.push(generateRandomPhone()); break;
          case 'address': data.push(generateRandomAddress()); break;
          case 'uuid': data.push(generateUUID()); break;
          default: break;
        }
      }

      let output;
      switch (format) {
        case 'plain':
          output = data.join('\n');
          break;
        case 'json':
          output = JSON.stringify(data, null, 2);
          break;
        case 'csv':
          output = `"${dataType}"\n` + data.map(item => `"${item}"`).join('\n');
          break;
        case 'sql':
          output = `INSERT INTO ${dataType}s (${dataType}) VALUES\n` +
            data.map(item => `('${item}')`).join(',\n') + ';';
          break;
        default:
          output = data.join('\n');
      }
      results.push({ dataType, format, output });
    }

    setGeneratedData(results);
    setCopied(false);
    setLoading(false);
  }, [dataConfigs]);

  // Data Generation Functions
  const generateRandomName = () => {
    const firstNames = ['John', 'Jane', 'Alex', 'Emily', 'Chris', 'Sara', 'Michael', 'Sophie'];
    const lastNames = ['Smith', 'Doe', 'Johnson', 'Brown', 'Lee', 'Wilson', 'Taylor', 'Davis'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  };

  const generateRandomEmail = () => {
    const name = generateRandomName().toLowerCase().replace(' ', '.');
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.org'];
    return `${name}@${domains[Math.floor(Math.random() * domains.length)]}`;
  };

  const generateRandomNumber = () => Math.floor(Math.random() * 1000000);

  const generateRandomDate = () => {
    const start = new Date(2000, 0, 1);
    const end = new Date();
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
  };

  const generateRandomText = () => {
    const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do'];
    const length = Math.floor(Math.random() * 15) + 5;
    return Array.from({ length }, () => words[Math.floor(Math.random() * words.length)]).join(' ');
  };

  const generateRandomPhone = () => {
    const area = Math.floor(Math.random() * 900) + 100;
    const prefix = Math.floor(Math.random() * 900) + 100;
    const line = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `(${area}) ${prefix}-${line}`;
  };

  const generateRandomAddress = () => {
    const streets = ['Main', 'Oak', 'Pine', 'Cedar', 'Elm'];
    const types = ['St', 'Ave', 'Blvd', 'Rd', 'Ln'];
    const number = Math.floor(Math.random() * 9999) + 1;
    return `${number} ${streets[Math.floor(Math.random() * streets.length)]} ${types[Math.floor(Math.random() * types.length)]}`;
  };

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  };

  const handleAddConfig = () => {
    setDataConfigs([...dataConfigs, { dataType: 'name', quantity: 1, format: 'plain' }]);
  };

  const handleRemoveConfig = (index) => {
    setDataConfigs(dataConfigs.filter((_, i) => i !== index));
  };

  const handleConfigChange = (index, field, value) => {
    const updatedConfigs = [...dataConfigs];
    updatedConfigs[index][field] = field === 'quantity' ? Math.max(1, Math.min(1000, parseInt(value) || 1)) : value;
    setDataConfigs(updatedConfigs);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateRandomData();
  };

  const handleCopy = (data) => {
    navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob(generatedData.map(d => [d.output, '\n\n']).flat(), { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `random-data-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setDataConfigs([{ dataType: 'name', quantity: 1, format: 'plain' }]);
    setGeneratedData(null);
    setCopied(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Random Data Generator</h2>

        {/* Configuration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {dataConfigs.map((config, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Type</label>
                <select
                  value={config.dataType}
                  onChange={(e) => handleConfigChange(index, 'dataType', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {dataTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (1-1000)</label>
                <input
                  type="number"
                  value={config.quantity}
                  onChange={(e) => handleConfigChange(index, 'quantity', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1" max="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                <select
                  value={config.format}
                  onChange={(e) => handleConfigChange(index, 'format', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {formats.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              {dataConfigs.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveConfig(index)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleAddConfig}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaPlus className="mr-2" /> Add Config
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
            >
              {loading ? <span className="animate-spin mr-2">⏳</span> : null}
              {loading ? 'Generating...' : 'Generate Data'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </form>

        {/* Generated Data */}
        {generatedData && (
          <div className="mt-8 space-y-6">
            {generatedData.map((result, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-700">
                    {result.dataType} ({result.format.toUpperCase()})
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(result.output)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      <FaCopy className="inline mr-1" /> {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      <FaDownload className="inline mr-1" /> Download All
                    </button>
                  </div>
                </div>
                <pre className="p-4 bg-white rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap break-all max-h-64 overflow-y-auto border border-gray-200">
                  {result.output}
                </pre>
              </div>
            ))}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Generate multiple data types simultaneously</li>
            <li>New types: Phone, Address, UUID</li>
            <li>Formats: Plain, JSON, CSV, SQL Insert</li>
            <li>Customizable quantity per type (1-1000)</li>
            <li>Copy individual outputs or download all</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RandomDataGenerator;