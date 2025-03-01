"use client";
import React, { useState } from 'react';
import { faker } from '@faker-js/faker'; // For random data generation

const RandomDomainGenerator = () => {
  const [tldType, setTldType] = useState('predefined'); // TLD type: predefined or custom
  const [predefinedTld, setPredefinedTld] = useState('com'); // Selected predefined TLD
  const [customTld, setCustomTld] = useState(''); // User-defined custom TLD
  const [domainLength, setDomainLength] = useState(10); // Length of domain name (excluding TLD)
  const [batchSize, setBatchSize] = useState(5); // Number of domains to generate
  const [domains, setDomains] = useState([]); // Generated domains
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]); // History of batches

  // Common predefined TLDs
  const tldOptions = [
    'com', 'org', 'net', 'edu', 'gov', 'io', 'co', 'tech', 'app', 'blog'
  ];

  // Validate custom TLD
  const validateCustomTld = (tld) => {
    if (!tld) return false;
    const tldRegex = /^[a-zA-Z]{2,63}$/; // TLD must be 2-63 letters
    return tldRegex.test(tld);
  };

  // Get the effective TLD based on type
  const getEffectiveTld = () => {
    return tldType === 'predefined' ? predefinedTld : customTld.toLowerCase();
  };

  // Generate a single domain name
  const generateDomain = () => {
    try {
      const effectiveTld = getEffectiveTld();
      if (tldType === 'custom' && !validateCustomTld(customTld)) {
        throw new Error('Invalid custom TLD: Use 2-63 letters only');
      }
      const name = faker.string.alphanumeric({
        length: domainLength,
        casing: 'lower',
      }).replace(/[^a-z0-9]/g, ''); // Ensure valid domain characters
      return `${name}.${effectiveTld}`;
    } catch (err) {
      throw new Error(`Domain generation failed: ${err.message}`);
    }
  };

  // Generate a batch of domains
  const generateBatch = () => {
    try {
      const newDomains = Array.from({ length: batchSize }, generateDomain);
      setDomains(newDomains);
      setHistory((prev) => [
        { 
          domains: newDomains, 
          tld: getEffectiveTld(), 
          length: domainLength, 
          tldType, 
          timestamp: new Date() 
        },
        ...prev.slice(0, 9), // Limit to 10 batches
      ]);
      setError('');
    } catch (err) {
      setError(`Generation failed: ${err.message}`);
    }
  };

  // Copy domains to clipboard
  const handleCopy = () => {
    if (domains.length > 0) {
      navigator.clipboard.writeText(domains.join('\n'));
      setError('Domains copied to clipboard!');
      setTimeout(() => setError(''), 2000);
    }
  };

  // Download domains as a text file
  const handleDownload = () => {
    if (domains.length > 0) {
      const effectiveTld = getEffectiveTld();
      const blob = new Blob([domains.join('\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `domains_${effectiveTld}_${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Download as CSV
  const handleDownloadCsv = () => {
    if (domains.length > 0) {
      const effectiveTld = getEffectiveTld();
      const csvContent = 'Domain\n' + domains.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `domains_${effectiveTld}_${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Reset
  const handleReset = () => {
    setDomains([]);
    setError('');
    setCustomTld('');
  };

  // Load from history
  const loadFromHistory = (entry) => {
    setDomains(entry.domains);
    setTldType(entry.tldType);
    setDomainLength(entry.length);
    if (entry.tldType === 'predefined') {
      setPredefinedTld(entry.tld);
    } else {
      setCustomTld(entry.tld);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
        Random Domain Generator
      </h2>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              TLD Type
            </label>
            <select
              value={tldType}
              onChange={(e) => setTldType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="predefined">Predefined TLD</option>
              <option value="custom">Custom TLD</option>
            </select>
          </div>
          {tldType === 'predefined' ? (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Predefined TLD
              </label>
              <select
                value={predefinedTld}
                onChange={(e) => setPredefinedTld(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {tldOptions.map((option) => (
                  <option key={option} value={option}>
                    .{option}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom TLD (2-63 letters)
              </label>
              <input
                type="text"
                value={customTld}
                onChange={(e) => setCustomTld(e.target.value.toLowerCase())}
                placeholder="e.g., xyz"
                className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  customTld && !validateCustomTld(customTld) ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
          )}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain Length (excluding TLD)
            </label>
            <input
              type="number"
              value={domainLength}
              onChange={(e) => setDomainLength(Math.min(63, Math.max(1, e.target.value)))}
              min={1}
              max={63}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch Size
            </label>
            <input
              type="number"
              value={batchSize}
              onChange={(e) => setBatchSize(Math.min(100, Math.max(1, e.target.value)))}
              min={1}
              max={100}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={generateBatch}
            disabled={tldType === 'custom' && !validateCustomTld(customTld)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Generate Batch
          </button>
          <button
            onClick={handleCopy}
            disabled={domains.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Copy
          </button>
          <button
            onClick={handleDownload}
            disabled={domains.length === 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Download TXT
          </button>
          <button
            onClick={handleDownloadCsv}
            disabled={domains.length === 0}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Download CSV
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Output */}
      {domains.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Generated Domains ({domains.length})
          </h3>
          <div className="w-full p-3 bg-white border border-gray-300 rounded-lg font-mono text-sm overflow-y-auto max-h-64">
            {domains.map((domain, index) => (
              <div key={index} className="py-1">
                {domain}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div
          className={`mb-4 text-sm p-3 rounded-md ${
            error.includes('copied') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {error}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Batch History</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((entry, index) => (
              <div
                key={index}
                onClick={() => loadFromHistory(entry)}
                className="p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
              >
                <p className="text-sm font-medium text-gray-800">
                  .{entry.tld} Batch ({entry.domains.length}, {entry.length} chars) - {entry.timestamp.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {entry.domains[0]}...
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RandomDomainGenerator;