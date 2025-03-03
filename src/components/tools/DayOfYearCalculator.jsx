'use client';

import React, { useState } from 'react';

const DayOfYearCalculator = () => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [dayOfYear, setDayOfYear] = useState('');
  const [yearForReverse, setYearForReverse] = useState(new Date().getFullYear().toString());
  const [reverseDay, setReverseDay] = useState('');
  const [result, setResult] = useState(null);
  const [reverseResult, setReverseResult] = useState(null);
  const [error, setError] = useState('');

  const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };

  const calculateDayOfYear = (inputDate) => {
    try {
      const d = new Date(inputDate);
      if (isNaN(d.getTime())) throw new Error('Invalid date');
      
      const year = d.getFullYear();
      const startOfYear = new Date(year, 0, 1);
      const diffMs = d - startOfYear;
      const day = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
      
      const weekNumber = Math.ceil((day + startOfYear.getDay()) / 7);
      const totalDays = isLeapYear(year) ? 366 : 365;

      return {
        dayOfYear: day,
        weekNumber,
        totalDays,
        isLeapYear: isLeapYear(year),
        formattedDate: d.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
      };
    } catch (err) {
      setError(`Invalid date: ${err.message}`);
      return null;
    }
  };

  const calculateDateFromDay = (year, day) => {
    try {
      const y = parseInt(year, 10);
      if (isNaN(y) || y < 1) throw new Error('Invalid year');
      const d = parseInt(day, 10);
      if (isNaN(d) || d < 1 || d > (isLeapYear(y) ? 366 : 365)) {
        throw new Error(`Day must be between 1 and ${isLeapYear(y) ? 366 : 365}`);
      }

      const startOfYear = new Date(y, 0, 1);
      const targetDate = new Date(startOfYear);
      targetDate.setDate(startOfYear.getDate() + d - 1);

      const weekNumber = Math.ceil((d + startOfYear.getDay()) / 7);

      return {
        date: targetDate.toISOString().slice(0, 10),
        formattedDate: targetDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        weekNumber,
        isLeapYear: isLeapYear(y),
      };
    } catch (err) {
      setError(`Invalid input: ${err.message}`);
      return null;
    }
  };

  const handleDateChange = (value) => {
    setDate(value);
    setError('');
    const calcResult = calculateDayOfYear(value);
    setResult(calcResult);
  };

  const handleReverseChange = () => {
    setError('');
    const calcResult = calculateDateFromDay(yearForReverse, reverseDay);
    setReverseResult(calcResult);
  };

  const handleNow = () => {
    const today = new Date().toISOString().slice(0, 10);
    setDate(today);
    handleDateChange(today);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Day of Year Calculator
        </h1>

        <div className="grid gap-6">
          {/* Day of Year Calculation */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleNow}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Today
                </button>
              </div>
            </div>

            {result && (
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Results:</h2>
                <div className="space-y-2 text-sm">
                  <p><strong>Date:</strong> {result.formattedDate}</p>
                  <p><strong>Day of Year:</strong> {result.dayOfYear} / {result.totalDays}</p>
                  <p><strong>Week Number:</strong> {result.weekNumber}</p>
                  <p><strong>Leap Year:</strong> {result.isLeapYear ? 'Yes' : 'No'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Reverse Calculation */}
          <div className="grid gap-4">
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <input
                  type="number"
                  value={yearForReverse}
                  onChange={(e) => setYearForReverse(e.target.value)}
                  placeholder="e.g., 2025"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day of Year
                </label>
                <input
                  type="number"
                  value={reverseDay}
                  onChange={(e) => setReverseDay(e.target.value)}
                  placeholder="1-366"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={handleReverseChange}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Calculate Date
            </button>

            {reverseResult && (
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Reverse Calculation:</h2>
                <div className="space-y-2 text-sm">
                  <p><strong>Date:</strong> {reverseResult.formattedDate}</p>
                  <p><strong>ISO Date:</strong> {reverseResult.date}</p>
                  <p><strong>Week Number:</strong> {reverseResult.weekNumber}</p>
                  <p><strong>Leap Year:</strong> {reverseResult.isLeapYear ? 'Yes' : 'No'}</p>
                </div>
              </div>
            )}
          </div>

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
              <li>Calculate day of year (1-366) from a date</li>
              <li>Reverse calculate date from day of year</li>
              <li>Displays week number and leap year status</li>
              <li>Supports all dates with proper leap year handling</li>
              <li>Use "Today" for current date calculation</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default DayOfYearCalculator;