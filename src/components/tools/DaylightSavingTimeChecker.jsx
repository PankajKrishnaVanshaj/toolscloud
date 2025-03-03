'use client';

import React, { useState, useEffect } from 'react';

const DaylightSavingTimeChecker = () => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [dstInfo, setDstInfo] = useState(null);
  const [error, setError] = useState('');

  // Time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  const checkDST = (inputDate, tz) => {
    try {
      const dateObj = new Date(inputDate);
      if (isNaN(dateObj.getTime())) throw new Error('Invalid date');

      // Get the year for finding transitions
      const year = dateObj.getFullYear();

      // Create dates for January and July to determine standard vs DST offset
      const jan = new Date(year, 0, 1);
      const jul = new Date(year, 6, 1);
      const janOffset = jan.getTimezoneOffset();
      const julOffset = jul.getTimezoneOffset();
      const currentOffset = dateObj.getTimezoneOffset();

      // Determine if DST is observed in this time zone
      const observesDST = janOffset !== julOffset;
      const isDST = observesDST && currentOffset === Math.min(janOffset, julOffset);

      // Find transition dates (approximate)
      let springForward = null;
      let fallBack = null;
      if (observesDST) {
        const start = new Date(year, 0, 1);
        const end = new Date(year + 1, 0, 1);
        
        for (let d = start; d < end; d.setDate(d.getDate() + 1)) {
          const nextDay = new Date(d);
          nextDay.setDate(nextDay.getDate() + 1);
          const offsetChange = d.getTimezoneOffset() - nextDay.getTimezoneOffset();
          
          if (offsetChange > 0 && !springForward) {
            springForward = new Date(d);
          } else if (offsetChange < 0 && !fallBack) {
            fallBack = new Date(d);
          }
        }
      }

      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZoneName: 'long',
      });

      return {
        isDST,
        observesDST,
        offset: -currentOffset / 60, // Convert minutes to hours
        standardOffset: -Math.max(janOffset, julOffset) / 60,
        dstOffset: -Math.min(janOffset, julOffset) / 60,
        springForward: springForward ? formatter.format(springForward) : null,
        fallBack: fallBack ? formatter.format(fallBack) : null,
        formattedDate: formatter.format(dateObj),
      };
    } catch (err) {
      setError(`Error: ${err.message}`);
      return null;
    }
  };

  const updateDSTInfo = () => {
    const info = checkDST(date, timeZone);
    setDstInfo(info);
    setError('');
  };

  useEffect(() => {
    updateDSTInfo();
  }, [date, timeZone]);

  const handleNow = () => {
    setDate(new Date().toISOString().slice(0, 10));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Daylight Saving Time Checker
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Zone
              </label>
              <select
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timeZones.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Section */}
          {dstInfo && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">DST Information:</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Date:</span> {dstInfo.formattedDate}
                </p>
                <p>
                  <span className="font-medium">DST Active:</span>{' '}
                  {dstInfo.isDST ? 'Yes' : 'No'}
                </p>
                <p>
                  <span className="font-medium">Observes DST:</span>{' '}
                  {dstInfo.observesDST ? 'Yes' : 'No'}
                </p>
                <p>
                  <span className="font-medium">Current Offset:</span>{' '}
                  {dstInfo.offset >= 0 ? '+' : ''}{dstInfo.offset} hours
                </p>
                {dstInfo.observesDST && (
                  <>
                    <p>
                      <span className="font-medium">Standard Offset:</span>{' '}
                      {dstInfo.standardOffset >= 0 ? '+' : ''}{dstInfo.standardOffset} hours
                    </p>
                    <p>
                      <span className="font-medium">DST Offset:</span>{' '}
                      {dstInfo.dstOffset >= 0 ? '+' : ''}{dstInfo.dstOffset} hours
                    </p>
                    <p>
                      <span className="font-medium">Spring Forward:</span>{' '}
                      {dstInfo.springForward || 'N/A'}
                    </p>
                    <p>
                      <span className="font-medium">Fall Back:</span>{' '}
                      {dstInfo.fallBack || 'N/A'}
                    </p>
                  </>
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
            <summary className="cursor-pointer font-medium">Features & Notes</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Checks DST status for any date and time zone</li>
              <li>Shows transition dates for the selected year</li>
              <li>Displays current, standard, and DST offsets</li>
              <li>Use "Today" for current date</li>
              <li>Transition dates are approximate and based on offset changes</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default DaylightSavingTimeChecker;