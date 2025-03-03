'use client';

import React, { useState } from 'react';

const WorkHoursCalculator = () => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [breakDuration, setBreakDuration] = useState('00:00');
  const [hourlyRate, setHourlyRate] = useState('');
  const [overtimeRate, setOvertimeRate] = useState('');
  const [overtimeThreshold, setOvertimeThreshold] = useState('8'); // Hours
  const [multiDayEntries, setMultiDayEntries] = useState([{ start: '', end: '', break: '00:00' }]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const parseTime = (timeStr) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const calculateHours = () => {
    setError('');
    setResult(null);

    let totalMinutes = 0;
    const entries = multiDayEntries.length > 1 ? multiDayEntries : [{ start: startTime, end: endTime, break: breakDuration }];

    for (const entry of entries) {
      const start = parseTime(entry.start);
      const end = parseTime(entry.end);
      const breakMins = parseTime(entry.break);

      if (start === null || end === null) {
        setError('Please enter valid start and end times');
        return;
      }
      if (breakMins === null) {
        setError('Please enter a valid break duration');
        return;
      }
      if (end <= start) {
        setError('End time must be after start time');
        return;
      }

      totalMinutes += (end - start) - breakMins;
    }

    if (totalMinutes < 0) {
      setError('Total time cannot be negative');
      return;
    }

    const regularHours = Math.min(totalMinutes / 60, Number(overtimeThreshold) || 8);
    const overtimeHours = Math.max(0, (totalMinutes / 60) - (Number(overtimeThreshold) || 8));
    const regularPay = hourlyRate ? regularHours * Number(hourlyRate) : null;
    const overtimePay = overtimeRate && overtimeHours ? overtimeHours * Number(overtimeRate) : null;
    const totalPay = regularPay && overtimePay ? regularPay + overtimePay : (regularPay || null);

    setResult({
      totalHours: totalMinutes / 60,
      totalTimeFormatted: formatTime(totalMinutes),
      regularHours,
      overtimeHours,
      regularPay,
      overtimePay,
      totalPay,
      entries: entries.map(entry => ({
        start: entry.start,
        end: entry.end,
        break: entry.break,
        duration: formatTime((parseTime(entry.end) - parseTime(entry.start) - parseTime(entry.break)))
      })),
    });
  };

  const addDay = () => {
    setMultiDayEntries([...multiDayEntries, { start: '', end: '', break: '00:00' }]);
  };

  const removeDay = (index) => {
    if (multiDayEntries.length > 1) {
      setMultiDayEntries(multiDayEntries.filter((_, i) => i !== index));
    }
  };

  const updateDay = (index, field, value) => {
    const newEntries = [...multiDayEntries];
    newEntries[index][field] = value;
    setMultiDayEntries(newEntries);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Work Hours Calculator
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            {multiDayEntries.map((entry, index) => (
              <div key={index} className="grid gap-2 md:grid-cols-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="time"
                    value={index === 0 ? startTime : entry.start}
                    onChange={(e) => index === 0 ? setStartTime(e.target.value) : updateDay(index, 'start', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="time"
                    value={index === 0 ? endTime : entry.end}
                    onChange={(e) => index === 0 ? setEndTime(e.target.value) : updateDay(index, 'end', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Break (HH:MM)</label>
                  <input
                    type="time"
                    value={index === 0 ? breakDuration : entry.break}
                    onChange={(e) => index === 0 ? setBreakDuration(e.target.value) : updateDay(index, 'break', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {multiDayEntries.length > 1 && (
                  <div className="flex items-end">
                    <button
                      onClick={() => removeDay(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={addDay}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Add Day
            </button>
          </div>

          {/* Rate Section */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Hourly Rate ($)</label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="e.g., 20"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Overtime Rate ($)</label>
              <input
                type="number"
                value={overtimeRate}
                onChange={(e) => setOvertimeRate(e.target.value)}
                placeholder="e.g., 30"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Overtime Threshold (hours)</label>
              <input
                type="number"
                value={overtimeThreshold}
                onChange={(e) => setOvertimeThreshold(e.target.value)}
                placeholder="e.g., 8"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={calculateHours}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate
          </button>

          {/* Results Section */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <div className="space-y-2 text-sm">
                <p>Total Hours: {result.totalHours.toFixed(2)} ({result.totalTimeFormatted})</p>
                <p>Regular Hours: {result.regularHours.toFixed(2)}</p>
                <p>Overtime Hours: {result.overtimeHours.toFixed(2)}</p>
                {result.regularPay && <p>Regular Pay: ${result.regularPay.toFixed(2)}</p>}
                {result.overtimePay && <p>Overtime Pay: ${result.overtimePay.toFixed(2)}</p>}
                {result.totalPay && <p>Total Pay: ${result.totalPay.toFixed(2)}</p>}
                {multiDayEntries.length > 1 && (
                  <div>
                    <h3 className="font-medium mt-2">Daily Breakdown:</h3>
                    <ul className="list-disc list-inside">
                      {result.entries.map((entry, index) => (
                        <li key={index}>
                          Start: {entry.start}, End: {entry.end}, Break: {entry.break}, Duration: {entry.duration}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
              <li>Calculate hours between start and end times</li>
              <li>Support for breaks (HH:MM)</li>
              <li>Multi-day entries</li>
              <li>Overtime calculation with custom threshold</li>
              <li>Pay calculation with hourly and overtime rates</li>
              <li>Enter times in 24-hour format (e.g., 08:00, 17:30)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default WorkHoursCalculator;