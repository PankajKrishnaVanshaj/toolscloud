"use client";

import React, { useState } from 'react';

const RandomDataGenerator = () => {
  const [dataType, setDataType] = useState('name');
  const [quantity, setQuantity] = useState(1);
  const [format, setFormat] = useState('plain');
  const [generatedData, setGeneratedData] = useState([]);
  const [copied, setCopied] = useState(false);

  const dataTypes = [
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'text', label: 'Text' }
  ];

  const formats = [
    { value: 'plain', label: 'Plain Text' },
    { value: 'json', label: 'JSON' },
    { value: 'csv', label: 'CSV' }
  ];

  const generateRandomData = () => {
    const data = [];
    for (let i = 0; i < Math.min(quantity, 1000); i++) { // Cap at 1000 for performance
      switch (dataType) {
        case 'name':
          data.push(generateRandomName());
          break;
        case 'email':
          data.push(generateRandomEmail());
          break;
        case 'number':
          data.push(generateRandomNumber());
          break;
        case 'date':
          data.push(generateRandomDate());
          break;
        case 'text':
          data.push(generateRandomText());
          break;
        default:
          break;
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
      default:
        output = data.join('\n');
    }

    setGeneratedData(output);
    setCopied(false);
  };

  const generateRandomName = () => {
    const firstNames = ['John', 'Jane', 'Alex', 'Emily', 'Chris', 'Sara'];
    const lastNames = ['Smith', 'Doe', 'Johnson', 'Brown', 'Lee', 'Wilson'];
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${first} ${last}`;
  };

  const generateRandomEmail = () => {
    const domains = ['example.com', 'test.org', 'mail.net', 'domain.co'];
    const name = generateRandomName().toLowerCase().replace(' ', '.');
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${name}@${domain}`;
  };

  const generateRandomNumber = () => {
    return Math.floor(Math.random() * 10000);
  };

  const generateRandomDate = () => {
    const start = new Date(2000, 0, 1);
    const end = new Date();
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const generateRandomText = () => {
    const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit'];
    const length = Math.floor(Math.random() * 10) + 5; // 5-14 words
    let text = '';
    for (let i = 0; i < length; i++) {
      text += words[Math.floor(Math.random() * words.length)] + ' ';
    }
    return text.trim();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (quantity < 1 || quantity > 1000) {
      alert('Please enter a quantity between 1 and 1000');
      return;
    }
    generateRandomData();
  };

  const handleCopy = () => {
    if (generatedData) {
      navigator.clipboard.writeText(generatedData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Random Data Generator</h2>

        {/* Configuration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Type
              </label>
              <select
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {dataTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity (1-1000)
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="1000"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format
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
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate Data
          </button>
        </form>

        {/* Generated Data */}
        {generatedData && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Generated {dataType} Data ({format.toUpperCase()})</h3>
              <button
                onClick={handleCopy}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="p-4 bg-gray-50 rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap break-all max-h-96 overflow-y-auto">
              {generatedData}
            </pre>
          </div>
        )}

        {/* Notes */}
        {!generatedData && (
          <div className="mt-4 text-sm text-gray-600">
            <p>Select a data type, quantity, and format to generate random data for testing or development.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RandomDataGenerator;