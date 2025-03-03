'use client';

import React, { useState, useEffect } from 'react';

const TimeZoneDSTAdjuster = () => {
  const [inputDateTime, setInputDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [sourceTimeZone, setSourceTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [targetTimeZone, setTargetTimeZone] = useState('UTC');
  const [adjustedTime, setAdjustedTime] = useState('');
  const [dstInfo, setDstInfo] = useState(null);
  const [error, setError] = useState('');

  // Available time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  const getDSTInfo = (date, timeZone) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'long',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
    });

    const january = new Date(date.getFullYear(), 0, 1); // January 1st
    const july = new Date(date.getFullYear(), 6, 1); // July 1st
    const dateCheck = new Date(date);

    const janOffset = january.getTimezoneOffset();
    const julOffset = july.getTimezoneOffset();
    const currentOffset = dateCheck.getTimezoneOffset();

    const isDST = currentOffset !== Math.max(janOffset, julOffset);
    const dstSavings = Math.abs(janOffset - julOffset) / 60; // in hours
    const offsetHours = -currentOffset / 60;

    return {
      isDST,
      dstSavings: dstSavings > 0 ? dstSavings : 0,
      offset: offsetHours >= 0 ? `+${offsetHours}` : `${offsetHours}`,
      name: formatter.format(dateCheck).split(', ').pop(),
    };
  };

  const adjustTime = () => {
    try {
      const date = new Date(inputDateTime);
      if (isNaN(date.getTime())) throw new Error('Invalid date/time');

      // Format source time
      const sourceOptions = {
        timeZone: sourceTimeZone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
        hour12: true,
      };
      const sourceTime = new Intl.DateTimeFormat('en-US', sourceOptions).format(date);

      // Format target time
      const targetOptions = {
        timeZone: targetTimeZone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
        hour12: true,
      };
      const targetTime = new Intl.DateTimeFormat('en-US', targetOptions).format(date);

      setAdjustedTime({
        source: sourceTime,
        target: targetTime,
      });

      // Get DST info for both time zones
      setDstInfo({
        source: getDSTInfo(date, sourceTimeZone),
        target: getDSTInfo(date, targetTimeZone),
      });

      setError('');
    } catch (err) {
      setError(`Error: ${err.message}`);
      setAdjustedTime('');
      setDstInfo(null);
    }
  };

  useEffect(() => {
    adjustTime();
  }, [inputDateTime, sourceTimeZone, targetTimeZone]);

  const handleNow = () => {
    setInputDateTime(new Date().toISOString().slice(0, 16));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Time Zone & DST Adjuster
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
                  value={inputDateTime}
                  onChange={(e) => setInputDateTime(e.target.value)}
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
                  Source Time Zone
                </label>
                <select
                  value={sourceTimeZone}
                  onChange={(e) => setSourceTimeZone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeZones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Time Zone
                </label>
                <select
                  value={targetTimeZone}
                  onChange={(e) => setTargetTimeZone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeZones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {adjustedTime && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Source Time</h2>
                <p className="text-sm">{adjustedTime.source}</p>
                {dstInfo?.source && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>DST: {dstInfo.source.isDST ? 'Active' : 'Inactive'}</p>
                    <p>DST Savings: {dstInfo.source.dstSavings} hour(s)</p>
                    <p>Offset: UTC{dstInfo.source.offset}</p>
                    <p>Time Zone: {dstInfo.source.name}</p>
                  </div>
                )}
              </div>
              <div className="p-4 bg-blue-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Target Time</h2>
                <p className="text-sm">{adjustedTime.target}</p>
                {dstInfo?.target && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>DST: {dstInfo.target.isDST ? 'Active' : 'Inactive'}</p>
                    <p>DST Savings: {dstInfo.target.dstSavings} hour(s)</p>
                    <p>Offset: UTC{dstInfo.target.offset}</p>
                    <p>Time Zone: {dstInfo.target.name}</p>
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
              <li>Adjusts time across time zones</li>
              <li>Shows DST status and savings</li>
              <li>Displays time zone offset and full name</li>
              <li>Use "Now" for current time</li>
              <li>Real-time updates on input change</li>
              <li>Supports all IANA time zones</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TimeZoneDSTAdjuster;