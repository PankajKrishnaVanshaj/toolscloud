'use client';

import React, { useState, useEffect } from 'react';

const TimeCardCalculator = () => {
  const [entries, setEntries] = useState([{ date: '', start: '', end: '', breakMins: '' }]);
  const [hourlyRate, setHourlyRate] = useState(15.00);
  const [overtimeThreshold, setOvertimeThreshold] = useState(40);
  const [overtimeMultiplier, setOvertimeMultiplier] = useState(1.5);
  const [results, setResults] = useState({
    totalHours: 0,
    regularHours: 0,
    overtimeHours: 0,
    totalPay: 0,
    regularPay: 0,
    overtimePay: 0,
  });

  const calculateHours = (start, end, breakMins) => {
    if (!start || !end) return 0;
    const startDate = new Date(`2000-01-01T${start}`);
    let endDate = new Date(`2000-01-01T${end}`);
    if (endDate < startDate) endDate.setDate(endDate.getDate() + 1); // Handle overnight shifts
    const diffMs = endDate - startDate - (breakMins * 60 * 1000 || 0);
    return Math.max(diffMs / (1000 * 60 * 60), 0); // Convert to hours, ensure non-negative
  };

  const calculateResults = () => {
    let totalHours = 0;
    entries.forEach(entry => {
      totalHours += calculateHours(entry.start, entry.end, entry.breakMins);
    });

    const regularHours = Math.min(totalHours, overtimeThreshold);
    const overtimeHours = Math.max(totalHours - overtimeThreshold, 0);
    const regularPay = regularHours * hourlyRate;
    const overtimePay = overtimeHours * hourlyRate * overtimeMultiplier;
    const totalPay = regularPay + overtimePay;

    setResults({
      totalHours,
      regularHours,
      overtimeHours,
      totalPay,
      regularPay,
      overtimePay,
    });
  };

  useEffect(() => {
    calculateResults();
  }, [entries, hourlyRate, overtimeThreshold, overtimeMultiplier]);

  const addEntry = () => {
    setEntries([...entries, { date: '', start: '', end: '', breakMins: '' }]);
  };

  const removeEntry = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index, field, value) => {
    const newEntries = [...entries];
    newEntries[index][field] = value;
    setEntries(newEntries);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Time Card Calculator
        </h1>

        <div className="grid gap-6">
          {/* Settings Section */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hourly Rate ($)
              </label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Overtime Threshold (hours)
              </label>
              <input
                type="number"
                value={overtimeThreshold}
                onChange={(e) => setOvertimeThreshold(parseInt(e.target.value) || 0)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Overtime Multiplier
              </label>
              <input
                type="number"
                value={overtimeMultiplier}
                onChange={(e) => setOvertimeMultiplier(parseFloat(e.target.value) || 1)}
                min="1"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Time Entries */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Time Entries</h2>
            {entries.map((entry, index) => (
              <div key={index} className="grid gap-4 md:grid-cols-5 items-end mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={entry.date}
                    onChange={(e) => updateEntry(index, 'date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="time"
                    value={entry.start}
                    onChange={(e) => updateEntry(index, 'start', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="time"
                    value={entry.end}
                    onChange={(e) => updateEntry(index, 'end', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Break (minutes)</label>
                  <input
                    type="number"
                    value={entry.breakMins}
                    onChange={(e) => updateEntry(index, 'breakMins', e.target.value)}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => removeEntry(index)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  disabled={entries.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={addEntry}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Add Entry
            </button>
          </div>

          {/* Results Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Results</h2>
            <div className="grid gap-2 text-sm md:grid-cols-2">
              <div>
                <p><span className="font-medium">Total Hours:</span> {results.totalHours.toFixed(2)}</p>
                <p><span className="font-medium">Regular Hours:</span> {results.regularHours.toFixed(2)}</p>
                <p><span className="font-medium">Overtime Hours:</span> {results.overtimeHours.toFixed(2)}</p>
              </div>
              <div>
                <p><span className="font-medium">Total Pay:</span> ${results.totalPay.toFixed(2)}</p>
                <p><span className="font-medium">Regular Pay:</span> ${results.regularPay.toFixed(2)}</p>
                <p><span className="font-medium">Overtime Pay:</span> ${results.overtimePay.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Calculate hours worked across multiple days</li>
              <li>Supports overnight shifts</li>
              <li>Accounts for break times</li>
              <li>Overtime calculation with customizable threshold and multiplier</li>
              <li>Pay calculation based on hourly rate</li>
              <li>Add/remove entries as needed</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TimeCardCalculator;