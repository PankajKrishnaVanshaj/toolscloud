'use client';

import React, { useState, useEffect } from 'react';

const TimeZoneAbbreviationResolver = () => {
  const [abbreviation, setAbbreviation] = useState('');
  const [resolvedZones, setResolvedZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [offset, setOffset] = useState('');
  const [dstStatus, setDstStatus] = useState('');
  const [error, setError] = useState('');
  const [updateTime, setUpdateTime] = useState(true);

  // Common time zone abbreviations mapping (not exhaustive, can be expanded)
  const abbreviationMap = {
    EST: ['Eastern Standard Time', ['America/New_York', 'America/Detroit', 'America/Indiana/Indianapolis']],
    EDT: ['Eastern Daylight Time', ['America/New_York', 'America/Detroit', 'America/Indiana/Indianapolis']],
    CST: ['Central Standard Time', ['America/Chicago', 'America/Indiana/Knox', 'America/Menominee']],
    CDT: ['Central Daylight Time', ['America/Chicago', 'America/Indiana/Knox', 'America/Menominee']],
    MST: ['Mountain Standard Time', ['America/Denver', 'America/Boise']],
    MDT: ['Mountain Daylight Time', ['America/Denver', 'America/Boise']],
    PST: ['Pacific Standard Time', ['America/Los_Angeles', 'America/Santa_Isabel']],
    PDT: ['Pacific Daylight Time', ['America/Los_Angeles', 'America/Santa_Isabel']],
    UTC: ['Coordinated Universal Time', ['UTC']],
    GMT: ['Greenwich Mean Time', ['Europe/London', 'Africa/Accra']],
    BST: ['British Summer Time', ['Europe/London']],
    CET: ['Central European Time', ['Europe/Paris', 'Europe/Berlin']],
    CEST: ['Central European Summer Time', ['Europe/Paris', 'Europe/Berlin']],
    // Add more as needed
  };

  const resolveAbbreviation = (abbr) => {
    const upperAbbr = abbr.toUpperCase();
    const resolved = abbreviationMap[upperAbbr];
    if (!resolved) {
      setError(`Unknown abbreviation: ${abbr}`);
      setResolvedZones([]);
      setSelectedZone('');
      setCurrentTime('');
      setOffset('');
      setDstStatus('');
      return;
    }
    setError('');
    setResolvedZones(resolved[1]);
    setSelectedZone(resolved[1][0]); // Default to first zone
    return resolved;
  };

  const updateTimeInfo = (zone) => {
    if (!zone) return;
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: zone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZoneName: 'long',
      });
      const formattedTime = formatter.format(now);
      setCurrentTime(formattedTime);

      const offsetValue = now.toLocaleString('en-US', { timeZone: zone, timeZoneName: 'short' }).split(' ').pop();
      const offsetHours = parseInt(offsetValue.slice(3, 6), 10);
      const offsetMinutes = parseInt(offsetValue.slice(6), 10) || 0;
      const totalOffset = offsetHours + (offsetMinutes / 60) * (offsetHours < 0 ? -1 : 1);
      setOffset(`UTC${totalOffset >= 0 ? '+' : ''}${totalOffset}`);

      // Check DST (simplified, assumes DST if offset differs from standard)
      const january = new Date(now.getFullYear(), 0, 1); // January (typically no DST)
      const januaryOffset = january.toLocaleString('en-US', { timeZone: zone, timeZoneName: 'short' }).split(' ').pop();
      setDstStatus(offsetValue !== januaryOffset ? 'In DST' : 'Not in DST');
    } catch (err) {
      setError(`Error processing time zone: ${err.message}`);
    }
  };

  useEffect(() => {
    if (selectedZone && updateTime) {
      updateTimeInfo(selectedZone);
      const interval = setInterval(() => updateTimeInfo(selectedZone), 1000);
      return () => clearInterval(interval);
    }
  }, [selectedZone, updateTime]);

  const handleInput = (value) => {
    setAbbreviation(value);
    resolveAbbreviation(value);
  };

  const handleZoneChange = (zone) => {
    setSelectedZone(zone);
    updateTimeInfo(zone);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Time Zone Abbreviation Resolver
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Zone Abbreviation
              </label>
              <input
                type="text"
                value={abbreviation}
                onChange={(e) => handleInput(e.target.value)}
                placeholder="e.g., EST, PDT, UTC"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {resolvedZones.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Time Zone
                </label>
                <select
                  value={selectedZone}
                  onChange={(e) => handleZoneChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {resolvedZones.map((zone) => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={updateTime}
                onChange={(e) => setUpdateTime(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Update time every second
              </label>
            </div>
          </div>

          {/* Results Section */}
          {selectedZone && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Resolved Information:</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Full Name:</span>{' '}
                  {abbreviationMap[abbreviation.toUpperCase()]?.[0] || 'Unknown'}
                </p>
                <p>
                  <span className="font-medium">Current Time:</span> {currentTime}
                </p>
                <p>
                  <span className="font-medium">UTC Offset:</span> {offset}
                </p>
                <p>
                  <span className="font-medium">DST Status:</span> {dstStatus}
                </p>
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
            <summary className="cursor-pointer font-medium">Features & Notes</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Resolves common time zone abbreviations</li>
              <li>Shows full name, current time, offset, and DST status</li>
              <li>Real-time updates (toggleable)</li>
              <li>Supports multiple zones per abbreviation</li>
              <li>Note: Some abbreviations may be ambiguous</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TimeZoneAbbreviationResolver;