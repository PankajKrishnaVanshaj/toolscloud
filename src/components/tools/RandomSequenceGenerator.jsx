"use client";
import React, { useState } from 'react';
import { faker } from '@faker-js/faker'; // For random data generation

const RandomSequenceGenerator = () => {
  const [sequenceType, setSequenceType] = useState('numeric'); // Sequence type: numeric, alpha, alphanumeric, custom
  const [sequenceLength, setSequenceLength] = useState(10); // Length of each sequence
  const [batchSize, setBatchSize] = useState(5); // Number of sequences to generate
  const [customPattern, setCustomPattern] = useState(''); // Custom pattern for sequences
  const [sequences, setSequences] = useState([]); // Generated sequences
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]); // History of batches

  // Generate a single sequence based on type
  const generateSequence = () => {
    try {
      switch (sequenceType) {
        case 'numeric':
          return faker.string.numeric({ length: sequenceLength });
        case 'alpha':
          return faker.string.alpha({ length: sequenceLength });
        case 'alphanumeric':
          return faker.string.alphanumeric({ length: sequenceLength });
        case 'custom':
          if (!customPattern) throw new Error('Custom pattern is required');
          return generateCustomSequence(customPattern);
        default:
          throw new Error('Invalid sequence type');
      }
    } catch (err) {
      throw new Error(`Sequence generation failed: ${err.message}`);
    }
  };

  // Generate sequence from custom pattern (e.g., "A###-X##" -> "A123-X45")
  const generateCustomSequence = (pattern) => {
    let result = '';
    for (const char of pattern) {
      if (char === '#') {
        result += faker.string.numeric({ length: 1 });
      } else if (char === 'A') {
        result += faker.string.alpha({ length: 1, casing: 'upper' });
      } else if (char === 'a') {
        result += faker.string.alpha({ length: 1, casing: 'lower' });
      } else {
        result += char; // Literal character
      }
    }
    return result;
  };

  // Generate a batch of sequences
  const generateBatch = () => {
    try {
      const newSequences = Array.from({ length: batchSize }, generateSequence);
      setSequences(newSequences);
      setHistory((prev) => [
        { sequences: newSequences, type: sequenceType, pattern: customPattern, timestamp: new Date() },
        ...prev.slice(0, 9), // Limit to 10 batches
      ]);
      setError('');
    } catch (err) {
      setError(`Generation failed: ${err.message}`);
    }
  };

  // Copy sequences to clipboard
  const handleCopy = () => {
    if (sequences.length > 0) {
      navigator.clipboard.writeText(sequences.join('\n'));
      setError('Sequences copied to clipboard!');
      setTimeout(() => setError(''), 2000);
    }
  };

  // Download sequences as a text file
  const handleDownload = () => {
    if (sequences.length > 0) {
      const blob = new Blob([sequences.join('\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sequences_${sequenceType}_${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Download as CSV
  const handleDownloadCsv = () => {
    if (sequences.length > 0) {
      const csvContent = 'Sequence\n' + sequences.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sequences_${sequenceType}_${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Reset
  const handleReset = () => {
    setSequences([]);
    setError('');
  };

  // Load from history
  const loadFromHistory = (entry) => {
    setSequences(entry.sequences);
    setSequenceType(entry.type);
    if (entry.type === 'custom') setCustomPattern(entry.pattern);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
        Random Sequence Generator
      </h2>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sequence Type
            </label>
            <select
              value={sequenceType}
              onChange={(e) => setSequenceType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="numeric">Numeric</option>
              <option value="alpha">Alphabetic</option>
              <option value="alphanumeric">Alphanumeric</option>
              <option value="custom">Custom Pattern</option>
            </select>
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
          {sequenceType !== 'custom' && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sequence Length
              </label>
              <input
                type="number"
                value={sequenceLength}
                onChange={(e) => setSequenceLength(Math.min(50, Math.max(1, e.target.value)))}
                min={1}
                max={50}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {sequenceType === 'custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Pattern (# for number, A for uppercase, a for lowercase)
            </label>
            <input
              type="text"
              value={customPattern}
              onChange={(e) => setCustomPattern(e.target.value)}
              placeholder="e.g., A###-aa"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={generateBatch}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate Batch
          </button>
          <button
            onClick={handleCopy}
            disabled={sequences.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Copy
          </button>
          <button
            onClick={handleDownload}
            disabled={sequences.length === 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Download TXT
          </button>
          <button
            onClick={handleDownloadCsv}
            disabled={sequences.length === 0}
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
      {sequences.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Generated Sequences ({sequences.length})
          </h3>
          <div className="w-full p-3 bg-white border border-gray-300 rounded-lg font-mono text-sm overflow-y-auto max-h-64">
            {sequences.map((sequence, index) => (
              <div key={index} className="py-1">
                {sequence}
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
                  {entry.type} Batch ({entry.sequences.length}) - {entry.timestamp.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {entry.sequences[0]}{entry.type === 'custom' ? ` (Pattern: ${entry.pattern})` : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RandomSequenceGenerator;