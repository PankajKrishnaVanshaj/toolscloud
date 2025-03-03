'use client';

import React, { useState } from 'react';

const UnixTimeBatchConverter = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState([]);
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [direction, setDirection] = useState('unixToDate'); // 'unixToDate' or 'dateToUnix'
  const [formatOptions, setFormatOptions] = useState({
    date: true,
    time: true,
    seconds: true,
    milliseconds: false,
    timeZoneName: 'short',
  });
  const [error, setError] = useState('');

  // Time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  const parseInput = (text) => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  };

  const convertUnixToDate = (unix) => {
    const num = parseInt(unix, 10);
    if (isNaN(num)) return 'Invalid Unix timestamp';
    const date = new Date(num * (unix.length >= 13 ? 1 : 1000)); // Handle milliseconds vs seconds
    const options = {
      timeZone,
      year: formatOptions.date ? 'numeric' : undefined,
      month: formatOptions.date ? 'long' : undefined,
      day: formatOptions.date ? 'numeric' : undefined,
      hour: formatOptions.time ? '2-digit' : undefined,
      minute: formatOptions.time ? '2-digit' : undefined,
      second: formatOptions.seconds ? '2-digit' : undefined,
      fractionalSecondDigits: formatOptions.milliseconds ? 3 : undefined,
      timeZoneName: formatOptions.timeZoneName !== 'none' ? formatOptions.timeZoneName : undefined,
      hour12: true,
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const convertDateToUnix = (dateStr) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) throw new Error('Invalid date');
      return Math.floor(date.getTime() / 1000).toString(); // Seconds
    } catch {
      return 'Invalid date format';
    }
  };

  const handleConvert = () => {
    setError('');
    const lines = parseInput(input);
    if (lines.length === 0) {
      setError('No valid input provided');
      setOutput([]);
      return;
    }

    const results = lines.map(line => {
      if (direction === 'unixToDate') {
        return convertUnixToDate(line);
      } else {
        return convertDateToUnix(line);
      }
    });
    setOutput(results);
  };

  const handleNow = () => {
    const now = Math.floor(Date.now() / 1000);
    setInput(direction === 'unixToDate' ? now.toString() : new Date().toLocaleString('en-US', { timeZone }));
    handleConvert();
  };

  const handleFormatChange = (key, value) => {
    setFormatOptions(prev => ({ ...prev, [key]: value }));
    if (input) handleConvert(); // Reconvert with new format
  };

  const exportToCSV = () => {
    const csvContent = [
      direction === 'unixToDate' ? 'Unix Timestamp,Human-Readable' : 'Human-Readable,Unix Timestamp',
      ...parseInput(input).map((line, i) => `"${line}","${output[i] || ''}"`),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'unix_time_batch.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').map(line => line.split(',')[0].replace(/^"|"$/g, ''));
      setInput(lines.join('\n'));
      handleConvert();
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Unix Time Batch Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="unixToDate"
                  checked={direction === 'unixToDate'}
                  onChange={() => setDirection('unixToDate')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                Unix to Date
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="dateToUnix"
                  checked={direction === 'dateToUnix'}
                  onChange={() => setDirection('dateToUnix')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                Date to Unix
              </label>
            </div>

            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Input ({direction === 'unixToDate' ? 'Unix Timestamps' : 'Dates'}, one per line)
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={direction === 'unixToDate' ? '1617235200\n1617321600' : 'March 31, 2021, 8:00 PM\nApril 1, 2021, 8:00 PM'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-y"
              />
            </div>

            <div className="flex justify-between items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Zone
                </label>
                <select
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeZones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleNow}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Now
                </button>
                <button
                  onClick={handleConvert}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Convert
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <button
                onClick={exportToCSV}
                disabled={output.length === 0}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-purple-300"
              >
                Export CSV
              </button>
            </div>
          </div>

          {/* Format Options */}
          {direction === 'unixToDate' && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Format Options</h2>
              <div className="grid gap-2 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formatOptions.date}
                    onChange={(e) => handleFormatChange('date', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Include Date
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formatOptions.time}
                    onChange={(e) => handleFormatChange('time', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Include Time
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formatOptions.seconds}
                    onChange={(e) => handleFormatChange('seconds', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Include Seconds
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formatOptions.milliseconds}
                    onChange={(e) => handleFormatChange('milliseconds', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Include Milliseconds
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Time Zone Display:</label>
                  <select
                    value={formatOptions.timeZoneName}
                    onChange={(e) => handleFormatChange('timeZoneName', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="none">None</option>
                    <option value="short">Short (e.g., EST)</option>
                    <option value="long">Long (e.g., Eastern Standard Time)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Output Section */}
          {output.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Converted Output:</h2>
              <textarea
                value={output.join('\n')}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 h-32 resize-y"
              />
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
              <li>Batch convert Unix timestamps to dates or vice versa</li>
              <li>Supports seconds and milliseconds</li>
              <li>Time zone adjustments</li>
              <li>Customizable date/time format</li>
              <li>Import/export CSV files</li>
              <li>One entry per line</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default UnixTimeBatchConverter;