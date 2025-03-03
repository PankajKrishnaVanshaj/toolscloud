'use client';

import React, { useState } from 'react';

const TimeBatchConverter = () => {
  const [inputTimes, setInputTimes] = useState('');
  const [outputFormat, setOutputFormat] = useState('iso');
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  // Time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  // Output format options
  const formats = {
    iso: 'ISO 8601',
    unix: 'Unix Timestamp (seconds)',
    unixMs: 'Unix Timestamp (milliseconds)',
    human: 'Human-Readable',
  };

  const parseTime = (input) => {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // Try parsing as number (Unix timestamp)
    if (/^\d+$/.test(trimmed)) {
      const num = parseInt(trimmed);
      return new Date(num * (trimmed.length > 10 ? 1 : 1000)); // Assume seconds if > 10 digits, else ms
    }

    // Try parsing as ISO or human-readable date
    const date = new Date(trimmed);
    return isNaN(date.getTime()) ? null : date;
  };

  const convertTime = (date) => {
    if (!date) return 'Invalid';

    switch (outputFormat) {
      case 'iso':
        return date.toISOString();
      case 'unix':
        return Math.floor(date.getTime() / 1000);
      case 'unixMs':
        return date.getTime();
      case 'human':
        return new Intl.DateTimeFormat('en-US', {
          timeZone,
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short',
          hour12: true,
        }).format(date);
      default:
        return '';
    }
  };

  const handleConvert = () => {
    setError('');
    setResults([]);

    const times = inputTimes.split('\n').filter(line => line.trim());
    if (times.length === 0) {
      setError('No valid timestamps provided');
      return;
    }

    const converted = times.map((time, index) => {
      const date = parseTime(time);
      return {
        original: time,
        converted: date ? convertTime(date) : 'Invalid',
        index: index + 1,
      };
    });

    setResults(converted);

    if (converted.every(result => result.converted === 'Invalid')) {
      setError('All timestamps failed to parse');
    }
  };

  const handleCSVImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setInputTimes(text.split(',').join('\n')); // Assume comma-separated for simplicity
    };
    reader.readAsText(file);
  };

  const handleCSVExport = () => {
    if (results.length === 0) return;

    const csv = [
      'Index,Original,Converted',
      ...results.map(r => `${r.index},"${r.original}","${r.converted}"`),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'time_batch_conversion.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInputTimes('');
    setResults([]);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Time Batch Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Timestamps (one per line)
              </label>
              <textarea
                value={inputTimes}
                onChange={(e) => setInputTimes(e.target.value)}
                placeholder="e.g.,&#10;2025-03-02T12:00:00Z&#10;1614772800&#10;March 2, 2025 12:00 PM"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-y"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Output Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(formats).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Zone
                </label>
                <select
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeZones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleConvert}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Convert
              </button>
              <label className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer">
                Import CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVImport}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleCSVExport}
                disabled={results.length === 0}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-purple-300"
              >
                Export CSV
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Results Section */}
          {results.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Converted Times:</h2>
              <div className="space-y-2 text-sm max-h-64 overflow-auto">
                {results.map((result) => (
                  <div key={result.index} className="flex gap-2">
                    <span className="font-medium">#{result.index}:</span>
                    <span>{result.original}</span>
                    <span>→</span>
                    <span className={result.converted === 'Invalid' ? 'text-red-600' : ''}>
                      {result.converted}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Batch convert multiple timestamps</li>
              <li>Supports ISO 8601, Unix timestamps, and human-readable formats</li>
              <li>Time zone adjustments</li>
              <li>CSV import (comma-separated) and export</li>
              <li>Enter one timestamp per line</li>
              <li>Examples: 2025-03-02T12:00:00Z, 1614772800, March 2, 2025 12:00 PM</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TimeBatchConverter;