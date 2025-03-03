'use client';

import React, { useState } from 'react';

const LeapYearChecker = () => {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [bulkYears, setBulkYears] = useState('');
  const [result, setResult] = useState('');
  const [bulkResults, setBulkResults] = useState([]);
  const [upcomingLeapYears, setUpcomingLeapYears] = useState([]);

  const isLeapYear = (year) => {
    const numYear = parseInt(year);
    if (isNaN(numYear) || numYear < 1) return null;
    return (numYear % 4 === 0 && numYear % 100 !== 0) || (numYear % 400 === 0);
  };

  const checkSingleYear = () => {
    const leap = isLeapYear(year);
    if (leap === null) {
      setResult('Please enter a valid year (positive integer)');
    } else {
      setResult(`${year} is ${leap ? '' : 'not '}a leap year`);
    }
  };

  const checkBulkYears = () => {
    const years = bulkYears.split(/[\n, ]+/).map(y => y.trim()).filter(y => y);
    const results = years.map(y => {
      const leap = isLeapYear(y);
      return {
        year: y,
        isValid: leap !== null,
        isLeap: leap,
      };
    });
    setBulkResults(results);
  };

  const getUpcomingLeapYears = () => {
    const currentYear = new Date().getFullYear();
    const upcoming = [];
    let yearToCheck = currentYear;
    while (upcoming.length < 10) {
      if (isLeapYear(yearToCheck)) {
        upcoming.push(yearToCheck);
      }
      yearToCheck++;
    }
    setUpcomingLeapYears(upcoming);
  };

  const handleYearChange = (e) => {
    setYear(e.target.value);
    setResult('');
  };

  const handleBulkChange = (e) => {
    setBulkYears(e.target.value);
    setBulkResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Leap Year Checker
        </h1>

        <div className="grid gap-6">
          {/* Single Year Check */}
          <div className="grid gap-4">
            <h2 className="text-lg font-semibold">Single Year Check</h2>
            <div className="flex gap-2">
              <input
                type="number"
                value={year}
                onChange={handleYearChange}
                placeholder="Enter a year"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={checkSingleYear}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Check
              </button>
            </div>
            {result && (
              <p className={`text-sm ${result.includes('not') || result.includes('valid') ? 'text-red-600' : 'text-green-600'}`}>
                {result}
              </p>
            )}
          </div>

          {/* Bulk Year Check */}
          <div className="grid gap-4">
            <h2 className="text-lg font-semibold">Bulk Year Check</h2>
            <textarea
              value={bulkYears}
              onChange={handleBulkChange}
              placeholder="Enter years (comma, space, or newline separated)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
            />
            <button
              onClick={checkBulkYears}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Check Bulk
            </button>
            {bulkResults.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-md max-h-40 overflow-auto">
                <h3 className="text-sm font-medium mb-2">Results:</h3>
                <ul className="list-disc list-inside text-sm">
                  {bulkResults.map((res, index) => (
                    <li key={index} className={res.isValid ? (res.isLeap ? 'text-green-600' : 'text-gray-600') : 'text-red-600'}>
                      {res.year}: {res.isValid ? (res.isLeap ? 'Leap Year' : 'Not a Leap Year') : 'Invalid'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Upcoming Leap Years */}
          <div className="grid gap-4">
            <h2 className="text-lg font-semibold">Upcoming Leap Years</h2>
            <button
              onClick={getUpcomingLeapYears}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Show Next 10 Leap Years
            </button>
            {upcomingLeapYears.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium mb-2">Next 10 Leap Years:</h3>
                <ul className="grid grid-cols-2 gap-2 text-sm text-green-600">
                  {upcomingLeapYears.map((yr, index) => (
                    <li key={index}>{yr}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Leap Year Rules & Features</summary>
            <div className="mt-2">
              <p>A year is a leap year if:</p>
              <ul className="list-disc list-inside">
                <li>It is divisible by 4 AND</li>
                <li>It is NOT divisible by 100, OR it is divisible by 400</li>
              </ul>
              <p className="mt-2">Features:</p>
              <ul className="list-disc list-inside">
                <li>Check single years</li>
                <li>Bulk check multiple years (separate by comma, space, or newline)</li>
                <li>View upcoming leap years</li>
                <li>Input validation for positive integers</li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default LeapYearChecker;