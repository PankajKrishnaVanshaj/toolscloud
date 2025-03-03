'use client';

import React, { useState } from 'react';

const DateRangeGenerator = () => {
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 16));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 16));
  const [step, setStep] = useState(1);
  const [stepUnit, setStepUnit] = useState('days');
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [format, setFormat] = useState('iso');
  const [dates, setDates] = useState([]);
  const [error, setError] = useState('');

  // Time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  // Step units
  const stepUnits = ['minutes', 'hours', 'days', 'weeks', 'months', 'years'];

  // Format options
  const formatOptions = {
    iso: 'ISO 8601',
    short: 'Short (MM/DD/YYYY)',
    long: 'Long (MMMM DD, YYYY)',
    custom: 'Custom',
  };

  const generateDates = () => {
    setError('');
    setDates([]);

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError('Invalid start or end date');
      return;
    }

    if (start > end) {
      setError('Start date must be before end date');
      return;
    }

    const result = [];
    let current = new Date(start);

    while (current <= end) {
      result.push(new Date(current));
      switch (stepUnit) {
        case 'minutes':
          current.setMinutes(current.getMinutes() + step);
          break;
        case 'hours':
          current.setHours(current.getHours() + step);
          break;
        case 'days':
          current.setDate(current.getDate() + step);
          break;
        case 'weeks':
          current.setDate(current.getDate() + step * 7);
          break;
        case 'months':
          current.setMonth(current.getMonth() + step);
          break;
        case 'years':
          current.setFullYear(current.getFullYear() + step);
          break;
        default:
          setError('Invalid step unit');
          return;
      }
    }

    setDates(result);
  };

  const formatDate = (date) => {
    const options = { timeZone };
    switch (format) {
      case 'iso':
        return date.toISOString();
      case 'short':
        return date.toLocaleDateString('en-US', { ...options, month: '2-digit', day: '2-digit', year: 'numeric' });
      case 'long':
        return date.toLocaleDateString('en-US', { ...options, month: 'long', day: 'numeric', year: 'numeric' });
      case 'custom':
        return date.toLocaleString('en-US', { ...options, year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
      default:
        return date.toISOString();
    }
  };

  const exportToCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Date\n" + 
      dates.map(date => formatDate(date)).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'date_range.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNow = (type) => {
    const now = new Date().toISOString().slice(0, 16);
    if (type === 'start') setStartDate(now);
    else setEndDate(now);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Date Range Generator
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date/Time
                </label>
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleNow('start')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Now
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date/Time
                </label>
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleNow('end')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Now
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Step Interval
                </label>
                <input
                  type="number"
                  value={step}
                  onChange={(e) => setStep(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Step Unit
                </label>
                <select
                  value={stepUnit}
                  onChange={(e) => setStepUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {stepUnits.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(formatOptions).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
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
                {timeZones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            <button
              onClick={generateDates}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Generate Dates
            </button>
          </div>

          {/* Results Section */}
          {dates.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Generated Dates ({dates.length}):</h2>
                <button
                  onClick={exportToCSV}
                  className="px-4 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Export to CSV
                </button>
              </div>
              <div className="max-h-64 overflow-auto">
                <ul className="list-disc list-inside text-sm">
                  {dates.map((date, index) => (
                    <li key={index}>{formatDate(date)}</li>
                  ))}
                </ul>
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
              <li>Generate date ranges with custom steps</li>
              <li>Supports multiple time intervals (minutes to years)</li>
              <li>Multiple format options (ISO, short, long, custom)</li>
              <li>Time zone adjustments</li>
              <li>Export results to CSV</li>
              <li>Use "Now" buttons for current timestamp</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default DateRangeGenerator;