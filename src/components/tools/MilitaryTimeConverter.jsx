'use client';

import React, { useState, useEffect } from 'react';

const MilitaryTimeConverter = () => {
  const [militaryTime, setMilitaryTime] = useState('');
  const [standardTime, setStandardTime] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [bulkInput, setBulkInput] = useState('');
  const [bulkOutput, setBulkOutput] = useState([]);
  const [error, setError] = useState('');
  const [realTimeUpdate, setRealTimeUpdate] = useState(false);

  // Time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  const parseMilitaryTime = (time) => {
    const regex = /^([0-1]?[0-9]|2[0-3])([0-5][0-9])$/; // HHMM format
    if (!regex.test(time)) throw new Error('Invalid military time format (HHMM)');
    const hours = parseInt(time.slice(0, 2));
    const minutes = parseInt(time.slice(2, 4));
    return { hours, minutes };
  };

  const convertToStandard = (military) => {
    try {
      const { hours, minutes } = parseMilitaryTime(military);
      const period = hours >= 12 ? 'PM' : 'AM';
      const standardHours = hours % 12 || 12; // Convert 0 to 12 for midnight
      return `${standardHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (err) {
      setError(err.message);
      return '';
    }
  };

  const convertToMilitary = (standard) => {
    try {
      const regex = /^(\d{1,2}):([0-5][0-9])\s*(AM|PM)$/i;
      if (!regex.test(standard)) throw new Error('Invalid standard time format (e.g., 1:30 PM)');
      const [, hoursStr, minutes, period] = standard.match(regex);
      let hours = parseInt(hoursStr);
      if (hours > 12) throw new Error('Hours must be 1-12 for standard time');
      if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
      if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
      return `${hours.toString().padStart(2, '0')}${minutes}`;
    } catch (err) {
      setError(err.message);
      return '';
    }
  };

  const handleMilitaryInput = (value) => {
    setMilitaryTime(value);
    setError('');
    const standard = convertToStandard(value);
    setStandardTime(standard);
  };

  const handleStandardInput = (value) => {
    setStandardTime(value);
    setError('');
    const military = convertToMilitary(value);
    setMilitaryTime(military);
  };

  const handleNow = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    setMilitaryTime(`${hours}${minutes}`);
    setStandardTime(convertToStandard(`${hours}${minutes}`));
    setDate(now.toISOString().slice(0, 10));
    setError('');
  };

  const handleBulkConvert = () => {
    setError('');
    const times = bulkInput.split('\n').map(line => line.trim()).filter(Boolean);
    const results = times.map(time => {
      if (/^\d{4}$/.test(time)) {
        return `${time} → ${convertToStandard(time)}`;
      } else if (/^\d{1,2}:[0-5][0-9]\s*(AM|PM)$/i.test(time)) {
        return `${time} → ${convertToMilitary(time)}`;
      }
      return `${time} → Invalid format`;
    });
    setBulkOutput(results);
  };

  useEffect(() => {
    if (realTimeUpdate) {
      const interval = setInterval(handleNow, 1000);
      return () => clearInterval(interval);
    }
  }, [realTimeUpdate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Military Time Converter
        </h1>

        <div className="grid gap-6">
          {/* Single Conversion Section */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Military Time (HHMM)
              </label>
              <input
                type="text"
                value={militaryTime}
                onChange={(e) => handleMilitaryInput(e.target.value)}
                placeholder="e.g., 1430"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={4}
              />
            </div>

            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Standard Time (12-hour)
              </label>
              <input
                type="text"
                value={standardTime}
                onChange={(e) => handleStandardInput(e.target.value)}
                placeholder="e.g., 2:30 PM"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Date (optional)
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-between items-center">
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
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={realTimeUpdate}
                    onChange={(e) => setRealTimeUpdate(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm">Real-time</span>
                </label>
              </div>
            </div>
          </div>

          {/* Bulk Conversion Section */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Bulk Conversion (one per line)
              </label>
              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="1430&#10;2:30 PM&#10;0900"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />
            </div>
            <button
              onClick={handleBulkConvert}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Convert Bulk
            </button>
            {bulkOutput.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Bulk Results:</h2>
                <ul className="list-disc list-inside text-sm">
                  {bulkOutput.map((result, index) => (
                    <li key={index}>{result}</li>
                  ))}
                </ul>
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
              <li>Convert between military (24-hour) and standard (12-hour) time</li>
              <li>Military format: HHMM (e.g., 1430)</li>
              <li>Standard format: H:MM AM/PM (e.g., 2:30 PM)</li>
              <li>Optional date and time zone support</li>
              <li>Bulk conversion (one time per line)</li>
              <li>Real-time update option</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default MilitaryTimeConverter;