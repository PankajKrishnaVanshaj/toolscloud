'use client';

import React, { useState, useEffect } from 'react';

const TimeZoneOffsetCalculator = () => {
  const [baseTimeZone, setBaseTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [compareTimeZone, setCompareTimeZone] = useState('UTC');
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [baseTime, setBaseTime] = useState('');
  const [compareTime, setCompareTime] = useState('');
  const [offsetDifference, setOffsetDifference] = useState('');
  const [isDSTBase, setIsDSTBase] = useState(false);
  const [isDSTCompare, setIsDSTCompare] = useState(false);
  const [updateLive, setUpdateLive] = useState(true);

  // Available time zones
  const timeZones = ['UTC', ...Intl.supportedValuesOf('timeZone')];

  const getOffset = (date, timeZone) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'longOffset',
    });
    const parts = formatter.formatToParts(date);
    const offsetPart = parts.find(part => part.type === 'timeZoneName');
    return offsetPart ? offsetPart.value : 'UTC±00:00';
  };

  const isDaylightSaving = (date, timeZone) => {
    const jan = new Date(date.getFullYear(), 0, 1); // January
    const jul = new Date(date.getFullYear(), 6, 1); // July
    const janOffset = getOffset(jan, timeZone);
    const julOffset = getOffset(jul, timeZone);
    const currentOffset = getOffset(date, timeZone);
    return currentOffset !== janOffset || currentOffset !== julOffset;
  };

  const calculateTimes = () => {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) {
      setBaseTime('Invalid date');
      setCompareTime('Invalid date');
      setOffsetDifference('N/A');
      return;
    }

    const baseFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: baseTimeZone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const compareFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: compareTimeZone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    setBaseTime(baseFormatter.format(date));
    setCompareTime(compareFormatter.format(date));

    const baseOffset = getOffset(date, baseTimeZone);
    const compareOffset = getOffset(date, compareTimeZone);

    const baseMinutes = parseOffsetToMinutes(baseOffset);
    const compareMinutes = parseOffsetToMinutes(compareOffset);
    const diffMinutes = compareMinutes - baseMinutes;

    setOffsetDifference(formatOffsetDifference(diffMinutes));
    setIsDSTBase(isDaylightSaving(date, baseTimeZone));
    setIsDSTCompare(isDaylightSaving(date, compareTimeZone));
  };

  const parseOffsetToMinutes = (offset) => {
    const match = offset.match(/([+-])(\d{2}):(\d{2})/);
    if (!match) return 0;
    const sign = match[1] === '+' ? 1 : -1;
    const hours = parseInt(match[2], 10);
    const minutes = parseInt(match[3], 10);
    return sign * (hours * 60 + minutes);
  };

  const formatOffsetDifference = (minutes) => {
    const sign = minutes >= 0 ? '+' : '-';
    const absMinutes = Math.abs(minutes);
    const hours = Math.floor(absMinutes / 60);
    const remainingMinutes = absMinutes % 60;
    return `${sign}${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`;
  };

  useEffect(() => {
    calculateTimes();
    if (updateLive) {
      const interval = setInterval(calculateTimes, 1000);
      return () => clearInterval(interval);
    }
  }, [dateTime, baseTimeZone, compareTimeZone, updateLive]);

  const handleNow = () => {
    setDateTime(new Date().toISOString().slice(0, 16));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Time Zone Offset Calculator
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date/Time
              </label>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleNow}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Now
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Time Zone
                </label>
                <select
                  value={baseTimeZone}
                  onChange={(e) => setBaseTimeZone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeZones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compare Time Zone
                </label>
                <select
                  value={compareTimeZone}
                  onChange={(e) => setCompareTimeZone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeZones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={updateLive}
                onChange={(e) => setUpdateLive(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Update Live
              </label>
            </div>
          </div>

          {/* Results Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Time Zone Information</h2>
            <div className="grid gap-4 text-sm">
              <div>
                <p>
                  <span className="font-medium">{baseTimeZone}:</span> {baseTime} 
                  <span className="ml-2 text-gray-600">({getOffset(new Date(dateTime), baseTimeZone)})</span>
                  {isDSTBase && <span className="ml-2 text-green-600">(DST)</span>}
                </p>
              </div>
              <div>
                <p>
                  <span className="font-medium">{compareTimeZone}:</span> {compareTime} 
                  <span className="ml-2 text-gray-600">({getOffset(new Date(dateTime), compareTimeZone)})</span>
                  {isDSTCompare && <span className="ml-2 text-green-600">(DST)</span>}
                </p>
              </div>
              <div>
                <p>
                  <span className="font-medium">Offset Difference:</span> {offsetDifference}
                  {offsetDifference.startsWith('-') ? ` (${baseTimeZone} is behind)` : ` (${baseTimeZone} is ahead)`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Calculate time zone offsets and differences</li>
              <li>Shows current time in selected zones</li>
              <li>Detects Daylight Saving Time (DST)</li>
              <li>Live updates (toggleable)</li>
              <li>Custom date/time input</li>
              <li>Use "Now" for current time</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TimeZoneOffsetCalculator;