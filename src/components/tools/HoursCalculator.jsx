'use client'
import React, { useState } from 'react';

const HoursCalculator = () => {
  const [entries, setEntries] = useState([{ startTime: '', endTime: '' }]); // Array of {startTime, endTime} in HH:MM format
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Parse time string (HH:MM) to minutes since midnight
  const parseTimeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }
    return hours * 60 + minutes;
  };

  // Convert total minutes to hours and minutes
  const minutesToHoursMinutes = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes, totalHours: (totalMinutes / 60).toFixed(2) };
  };

  // Calculate total hours
  const calculateHours = () => {
    setError('');
    setResult(null);

    if (entries.some(entry => !entry.startTime || !entry.endTime)) {
      setError('Please fill in all start and end times');
      return;
    }

    const timeData = entries.map(entry => ({
      startMinutes: parseTimeToMinutes(entry.startTime),
      endMinutes: parseTimeToMinutes(entry.endTime)
    }));

    if (timeData.some(data => data.startMinutes === null || data.endMinutes === null)) {
      setError('Please enter valid times in HH:MM format (e.g., 09:00)');
      return;
    }

    let totalMinutes = 0;
    const breakdown = timeData.map((data, index) => {
      let diffMinutes = data.endMinutes - data.startMinutes;
      if (diffMinutes < 0) diffMinutes += 1440; // Handle crossing midnight
      totalMinutes += diffMinutes;
      const { hours, minutes } = minutesToHoursMinutes(diffMinutes);
      return {
        entry: index + 1,
        startTime: entries[index].startTime,
        endTime: entries[index].endTime,
        hours,
        minutes,
        totalMinutes: diffMinutes
      };
    });

    const { hours, minutes, totalHours } = minutesToHoursMinutes(totalMinutes);

    return {
      breakdown,
      totalHours,
      totalMinutes,
      totalTime: `${hours}h ${minutes}m`
    };
  };

  const calculate = () => {
    const calcResult = calculateHours();
    if (calcResult && calcResult.error) {
      setError(calcResult.error);
      return;
    }
    setResult(calcResult);
  };

  // Handle input change for a specific entry
  const handleEntryChange = (index, field, value) => {
    const updatedEntries = [...entries];
    updatedEntries[index][field] = value;
    setEntries(updatedEntries);
  };

  // Add a new time entry
  const addEntry = () => {
    setEntries([...entries, { startTime: '', endTime: '' }]);
  };

  // Remove a time entry
  const removeEntry = (index) => {
    if (entries.length > 1) {
      const updatedEntries = entries.filter((_, i) => i !== index);
      setEntries(updatedEntries);
    }
  };

  const reset = () => {
    setEntries([{ startTime: '', endTime: '' }]);
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Hours Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={entry.startTime}
                  onChange={(e) => handleEntryChange(index, 'startTime', e.target.value)}
                  className="w-24 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Start (HH:MM)"
                />
                <input
                  type="text"
                  value={entry.endTime}
                  onChange={(e) => handleEntryChange(index, 'endTime', e.target.value)}
                  className="w-24 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="End (HH:MM)"
                />
                {entries.length > 1 && (
                  <button
                    onClick={() => removeEntry(index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addEntry}
              className="w-full bg-teal-200 text-teal-800 py-2 rounded-lg hover:bg-teal-300 transition-all font-semibold"
            >
              Add Time Entry
            </button>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-all font-semibold"
            >
              Calculate Hours
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
          <div className="mt-6 p-4 bg-teal-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Hours Worked:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center text-xl">Total Time: {result.totalTime}</p>
              <p className="text-center">Total Hours: {result.totalHours}</p>
              <p className="text-center">Total Minutes: {result.totalMinutes}</p>

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-teal-600 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Breakdown:</p>
                  <ul className="list-disc list-inside">
                    {result.breakdown.map((entry) => (
                      <li key={entry.entry}>
                        Entry {entry.entry}: {entry.startTime} - {entry.endTime} = {entry.hours}h {entry.minutes}m ({entry.totalMinutes} minutes)
                      </li>
                    ))}
                    <li>Total Minutes = Sum of all entries = {result.totalMinutes}</li>
                    <li>Total Hours = Total Minutes / 60 = {result.totalHours}</li>
                    <li>Total Time = {result.totalTime}</li>
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

export default HoursCalculator;