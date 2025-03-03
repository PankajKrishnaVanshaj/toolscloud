'use client';

import React, { useState } from 'react';

const BusinessDaysCalculator = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [holidays, setHolidays] = useState('');
  const [workWeek, setWorkWeek] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const parseHolidays = () => {
    return holidays
      .split('\n')
      .map(date => date.trim())
      .filter(date => date)
      .map(date => new Date(date))
      .filter(date => !isNaN(date.getTime()));
  };

  const isBusinessDay = (date) => {
    const dayOfWeek = date.getDay();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    if (!workWeek[days[dayOfWeek]]) return false;

    const holidayDates = parseHolidays();
    const dateString = date.toISOString().split('T')[0];
    return !holidayDates.some(holiday => holiday.toISOString().split('T')[0] === dateString);
  };

  const calculateBusinessDays = () => {
    setError('');
    setResult(null);

    if (!startDate || !endDate) {
      setError('Please enter both start and end dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError('Invalid date format');
      return;
    }

    if (start > end) {
      setError('Start date must be before end date');
      return;
    }

    let businessDays = 0;
    let currentDate = new Date(start);

    while (currentDate <= end) {
      if (isBusinessDay(currentDate)) {
        businessDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setResult(businessDays);
  };

  const handleWorkWeekChange = (day) => {
    setWorkWeek(prev => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const handleToday = (field) => {
    const today = new Date().toISOString().split('T')[0];
    if (field === 'start') setStartDate(today);
    else setEndDate(today);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Business Days Calculator
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleToday('start')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Today
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleToday('end')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Today
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Holidays (one per line, e.g., 2025-01-01)
              </label>
              <textarea
                value={holidays}
                onChange={(e) => setHolidays(e.target.value)}
                placeholder="2025-01-01\n2025-12-25"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Work Week</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                {Object.entries(workWeek).map(([day, enabled]) => (
                  <label key={day} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={() => handleWorkWeekChange(day)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={calculateBusinessDays}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Calculate Business Days
            </button>
          </div>

          {/* Results Section */}
          {result !== null && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Result:</h2>
              <p className="text-sm">
                Business Days: <span className="font-medium">{result}</span>
              </p>
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
              <li>Calculates business days between two dates</li>
              <li>Customizable work week (e.g., exclude weekends)</li>
              <li>Supports holiday exclusions (one per line)</li>
              <li>Use "Today" buttons for current date</li>
              <li>Dates must be in YYYY-MM-DD format</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BusinessDaysCalculator;