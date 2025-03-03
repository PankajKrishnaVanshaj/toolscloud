'use client';

import React, { useState, useEffect } from 'react';

const WeekNumberCalculator = () => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [weekNumber, setWeekNumber] = useState(null);
  const [standard, setStandard] = useState('ISO'); // ISO 8601 or US
  const [year, setYear] = useState(new Date().getFullYear());
  const [weekDetails, setWeekDetails] = useState({ start: '', end: '' });
  const [error, setError] = useState('');

  // Calculate week number based on standard
  const calculateWeekNumber = (inputDate, useISO = true) => {
    const dateObj = new Date(inputDate);
    if (isNaN(dateObj.getTime())) {
      setError('Invalid date');
      return null;
    }

    if (useISO) {
      // ISO 8601: Week starts on Monday, week 1 is the first week with 4+ days in the year
      dateObj.setHours(0, 0, 0, 0);
      const jan1 = new Date(dateObj.getFullYear(), 0, 1);
      const daysOffset = (jan1.getDay() + 6) % 7; // Adjust to Monday-based (0 = Mon)
      const firstMonday = new Date(jan1);
      firstMonday.setDate(jan1.getDate() - daysOffset);

      const diffMs = dateObj - firstMonday;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const weekNum = Math.floor(diffDays / 7) + 1;

      // Adjust for year boundaries
      if (weekNum < 1) {
        return calculateWeekNumber(new Date(dateObj.getFullYear() - 1, 11, 31), true);
      } else if (weekNum > 52 && dateObj.getMonth() === 11) {
        const nextYearFirstMonday = new Date(dateObj.getFullYear() + 1, 0, 1);
        nextYearFirstMonday.setDate(nextYearFirstMonday.getDate() - ((nextYearFirstMonday.getDay() + 6) % 7));
        if (dateObj >= nextYearFirstMonday) return 1;
      }

      return weekNum;
    } else {
      // US standard: Week starts on Sunday, week 1 is Jan 1st week
      dateObj.setHours(0, 0, 0, 0);
      const jan1 = new Date(dateObj.getFullYear(), 0, 1);
      const daysOffset = jan1.getDay(); // Sunday-based (0 = Sun)
      const firstSunday = new Date(jan1);
      firstSunday.setDate(jan1.getDate() - daysOffset);

      const diffMs = dateObj - firstSunday;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      return Math.floor(diffDays / 7) + 1;
    }
  };

  // Calculate week start and end dates
  const calculateWeekDetails = (inputDate, useISO) => {
    const dateObj = new Date(inputDate);
    const day = dateObj.getDay();
    const diffToStart = useISO ? (day + 6) % 7 : day; // Monday or Sunday start
    const startDate = new Date(dateObj);
    startDate.setDate(dateObj.getDate() - diffToStart);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return {
      start: startDate.toISOString().slice(0, 10),
      end: endDate.toISOString().slice(0, 10),
    };
  };

  const updateCalculation = () => {
    setError('');
    const weekNum = calculateWeekNumber(date, standard === 'ISO');
    if (weekNum !== null) {
      setWeekNumber(weekNum);
      setWeekDetails(calculateWeekDetails(date, standard === 'ISO'));
      setYear(new Date(date).getFullYear());
    } else {
      setWeekNumber(null);
      setWeekDetails({ start: '', end: '' });
    }
  };

  useEffect(() => {
    updateCalculation();
  }, [date, standard]);

  const handleNow = () => {
    setDate(new Date().toISOString().slice(0, 10));
  };

  const generateYearWeeks = () => {
    const weeks = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    let current = new Date(startDate);
    current.setDate(current.getDate() - ((standard === 'ISO' ? (current.getDay() + 6) % 7 : current.getDay())));

    while (current <= endDate || weeks.length < 52) {
      const weekNum = calculateWeekNumber(current, standard === 'ISO');
      const weekStart = new Date(current);
      const weekEnd = new Date(current);
      weekEnd.setDate(weekStart.getDate() + 6);
      weeks.push({
        week: weekNum,
        start: weekStart.toISOString().slice(0, 10),
        end: weekEnd.toISOString().slice(0, 10),
      });
      current.setDate(current.getDate() + 7);
    }
    return weeks;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Week Number Calculator
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleNow}
                className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Now
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Week Number Standard
              </label>
              <select
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ISO">ISO 8601 (Monday start)</option>
                <option value="US">US (Sunday start)</option>
              </select>
            </div>
          </div>

          {/* Results Section */}
          {weekNumber && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Week Details</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Week Number:</span> {weekNumber}</p>
                <p><span className="font-medium">Year:</span> {year}</p>
                <p><span className="font-medium">Start Date:</span> {weekDetails.start}</p>
                <p><span className="font-medium">End Date:</span> {weekDetails.end}</p>
              </div>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Year Calendar */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Weeks in {year}</h2>
            <div className="max-h-64 overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2">Week</th>
                    <th className="p-2">Start</th>
                    <th className="p-2">End</th>
                  </tr>
                </thead>
                <tbody>
                  {generateYearWeeks().map((week, index) => (
                    <tr key={index} className={week.week === weekNumber ? 'bg-blue-100' : ''}>
                      <td className="p-2 text-center">{week.week}</td>
                      <td className="p-2">{week.start}</td>
                      <td className="p-2">{week.end}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Standards</summary>
            <ul className="list-disc list-inside mt-2">
              <li>ISO 8601: Week 1 has 4+ days in new year, Monday start</li>
              <li>US: Week 1 starts Jan 1, Sunday start</li>
              <li>Shows week start/end dates</li>
              <li>Full year week calendar</li>
              <li>Use "Now" for current week</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default WeekNumberCalculator;