'use client'
import React, { useState } from 'react';

const TimeDurationCalculator = () => {
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Calculate time duration
  const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return { error: 'Invalid date/time format' };
    }
    if (startDate > endDate) {
      return { error: 'End date/time must be after start date/time' };
    }

    const diffMs = endDate - startDate; // Difference in milliseconds

    const totalSeconds = Math.floor(diffMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);

    const years = Math.floor(totalDays / 365.25); // Account for leap years
    const remainingDaysAfterYears = totalDays % 365.25;
    const months = Math.floor(remainingDaysAfterYears / 30.44); // Average days in a month
    const days = Math.floor(remainingDaysAfterYears % 30.44);

    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;
    const seconds = totalSeconds % 60;

    return {
      years,
      months,
      days,
      hours,
      minutes,
      seconds,
      totalDays,
      totalHours,
      totalMinutes,
      totalSeconds,
      totalWeeks: Math.floor(totalDays / 7),
      start: startDate.toLocaleString(),
      end: endDate.toLocaleString()
    };
  };

  const calculate = () => {
    setError('');
    setResult(null);

    if (!startDateTime || !endDateTime) {
      setError('Please enter both start and end date/time');
      return;
    }

    const calcResult = calculateDuration(startDateTime, endDateTime);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
  };

  const reset = () => {
    setStartDateTime('');
    setEndDateTime('');
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Time Duration Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Start Date/Time:</label>
              <input
                type="datetime-local"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                max={new Date().toISOString().slice(0, 16)} // Prevent future dates
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">End Date/Time:</label>
              <input
                type="datetime-local"
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                max={new Date().toISOString().slice(0, 16)} // Prevent future dates
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-all font-semibold"
            >
              Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-all font-semibold"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Duration:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center text-xl">
                {result.years > 0 ? `${result.years} years, ` : ''}{result.months > 0 ? `${result.months} months, ` : ''}{result.days} days, {result.hours} hours, {result.minutes} minutes, {result.seconds} seconds
              </p>
              <p className="text-center text-sm">From: {result.start}</p>
              <p className="text-center text-sm">To: {result.end}</p>
              
              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-yellow-600 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
              
              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Total Duration Breakdown:</p>
                  <ul className="list-disc list-inside">
                    <li>Total Days: {result.totalDays}</li>
                    <li>Total Weeks: {result.totalWeeks}</li>
                    <li>Total Hours: {result.totalHours}</li>
                    <li>Total Minutes: {result.totalMinutes}</li>
                    <li>Total Seconds: {result.totalSeconds}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeDurationCalculator;