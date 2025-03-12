"use client";

import React, { useState, useCallback } from 'react';
import { FaCopy, FaDownload, FaSync, FaClock } from 'react-icons/fa';

const TimestampConverter = () => {
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState('timestampToDate');
  const [timezone, setTimezone] = useState('UTC');
  const [output, setOutput] = useState({ formatted: '', raw: '' });
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [formatOptions, setFormatOptions] = useState({
    includeSeconds: true,
    use24Hour: false,
    showTimezone: true,
    unit: 'seconds', // 'seconds' or 'milliseconds'
  });

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Asia/Tokyo',
    'Australia/Sydney',
    'Asia/Dubai',
    'Europe/Paris',
  ];

  const convertTimestampToDate = useCallback((timestamp) => {
    const num = Number(timestamp);
    if (isNaN(num)) throw new Error('Invalid timestamp: Must be a number');

    const adjustedTimestamp = formatOptions.unit === 'seconds' ? num * 1000 : num;
    const date = new Date(adjustedTimestamp);
    if (isNaN(date.getTime())) throw new Error('Invalid timestamp value');

    const options = {
      timeZone: timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: formatOptions.includeSeconds ? '2-digit' : undefined,
      hour12: !formatOptions.use24Hour,
    };

    const formatted = date.toLocaleString('en-US', options) + 
      (formatOptions.showTimezone ? ` (${timezone})` : '');
    return { formatted, raw: date.getTime() };
  }, [timezone, formatOptions]);

  const convertDateToTimestamp = useCallback((dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) throw new Error('Invalid date format');

    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    const timestamp = utcDate.getTime();
    const raw = formatOptions.unit === 'seconds' ? Math.floor(timestamp / 1000) : timestamp;
    return { formatted: raw.toString(), raw };
  }, [timezone, formatOptions]);

  const processInput = () => {
    setError(null);
    setOutput({ formatted: '', raw: '' });
    setCopied(false);

    if (!inputValue.trim()) {
      setError('Please enter a value');
      return;
    }

    try {
      const result = mode === 'timestampToDate'
        ? convertTimestampToDate(inputValue)
        : convertDateToTimestamp(inputValue);
      setOutput(result);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    processInput();
  };

  const handleCopy = () => {
    if (output.formatted) {
      navigator.clipboard.writeText(output.formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (output.formatted) {
      const blob = new Blob([output.formatted], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `timestamp-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setInputValue('');
    setOutput({ formatted: '', raw: '' });
    setError(null);
    setCopied(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <FaClock className="mr-2" /> Timestamp Converter
        </h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {mode === 'timestampToDate' ? 'UNIX Timestamp' : 'Date/Time'}
            </label>
            <input
              type={mode === 'timestampToDate' ? 'number' : 'datetime-local'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder={mode === 'timestampToDate' ? `e.g., ${formatOptions.unit === 'seconds' ? '1638316800' : '1638316800000'}` : ''}
              step="1"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
              <select
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value);
                  handleReset();
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="timestampToDate">Timestamp to Date</option>
                <option value="dateToTimestamp">Date to Timestamp</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {timezones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Format Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Format Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formatOptions.includeSeconds}
                  onChange={(e) => setFormatOptions(prev => ({ ...prev, includeSeconds: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Include Seconds</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formatOptions.use24Hour}
                  onChange={(e) => setFormatOptions(prev => ({ ...prev, use24Hour: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">24-Hour Format</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formatOptions.showTimezone}
                  onChange={(e) => setFormatOptions(prev => ({ ...prev, showTimezone: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Show Timezone</span>
              </label>
              <div>
                <select
                  value={formatOptions.unit}
                  onChange={(e) => setFormatOptions(prev => ({ ...prev, unit: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="seconds">Seconds</option>
                  <option value="milliseconds">Milliseconds</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!inputValue.trim()}
            >
              Convert
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Output */}
        {output.formatted && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-700">
                {mode === 'timestampToDate' ? 'Converted Date' : `UNIX Timestamp (${formatOptions.unit})`}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className={`py-2 px-4 rounded-lg transition-colors flex items-center ${
                    copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <FaCopy className="mr-2" /> {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleDownload}
                  className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
            <pre className="p-4 bg-white rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap break-all border border-gray-200">
              {output.formatted}
            </pre>
          </div>
        )}

        {/* Features List */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert timestamps to dates and vice versa</li>
            <li>Support for seconds and milliseconds</li>
            <li>Multiple timezone options</li>
            <li>Customizable date format (seconds, 24-hour, timezone)</li>
            <li>Copy and download results</li>
            <li>Responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TimestampConverter;