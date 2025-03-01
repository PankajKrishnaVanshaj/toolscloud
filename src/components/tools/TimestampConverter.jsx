"use client";

import React, { useState } from 'react';

const TimestampConverter = () => {
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState('timestampToDate'); // 'timestampToDate' or 'dateToTimestamp'
  const [timezone, setTimezone] = useState('UTC');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Asia/Tokyo',
    'Australia/Sydney'
  ];

  const convertTimestampToDate = (timestamp) => {
    const num = Number(timestamp);
    if (isNaN(num)) {
      throw new Error('Invalid timestamp: Must be a number');
    }

    // Detect if timestamp is in seconds or milliseconds
    const date = new Date(num < 1e12 ? num * 1000 : num); // Assume seconds if < 1 trillion, else milliseconds
    const options = {
      timeZone: timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };

    return date.toLocaleString('en-US', options) + ` (${timezone})`;
  };

  const convertDateToTimestamp = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }

    // Adjust for timezone
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    return Math.floor(utcDate.getTime() / 1000); // Return in seconds
  };

  const processInput = () => {
    setError(null);
    setOutput('');
    setCopied(false);

    if (!inputValue.trim()) {
      setError('Please enter a value');
      return;
    }

    try {
      const result = mode === 'timestampToDate'
        ? convertTimestampToDate(inputValue)
        : convertDateToTimestamp(inputValue);
      setOutput(result.toString());
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    processInput();
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Timestamp Converter</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {mode === 'timestampToDate' ? 'UNIX Timestamp' : 'Date/Time'}
            </label>
            <input
              type={mode === 'timestampToDate' ? 'number' : 'datetime-local'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={mode === 'timestampToDate' ? 'e.g., 1638316800' : ''}
              step={mode === 'timestampToDate' ? '1' : '1'}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mode
              </label>
              <select
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value);
                  setInputValue('');
                  setOutput('');
                  setError(null);
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="timestampToDate">Timestamp to Date</option>
                <option value="dateToTimestamp">Date to Timestamp</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timezones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Convert
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Output */}
        {output && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">
                {mode === 'timestampToDate' ? 'Converted Date' : 'UNIX Timestamp (seconds)'}
              </h3>
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
              {output}
            </pre>
          </div>
        )}

        {/* Notes */}
        <div className="mt-4 text-sm text-gray-600">
          <p>
            Convert between UNIX timestamps and human-readable dates.
          </p>
          <ul className="list-disc pl-5 mt-1">
            <li>Timestamp to Date: Enter seconds or milliseconds</li>
            <li>Date to Timestamp: Returns seconds since Unix epoch (1970-01-01)</li>
            <li>Supports multiple timezones</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TimestampConverter;