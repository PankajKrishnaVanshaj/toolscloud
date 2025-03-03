'use client';

import React, { useState, useEffect } from 'react';

const JulianDateConverter = () => {
  const [gregorianDate, setGregorianDate] = useState(new Date().toISOString().slice(0, 16));
  const [julianDate, setJulianDate] = useState('');
  const [modifiedJulianDate, setModifiedJulianDate] = useState('');
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [precision, setPrecision] = useState(6); // Decimal places
  const [error, setError] = useState('');
  const [updateInterval, setUpdateInterval] = useState(true);

  // Time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  // Julian Date conversion functions
  const gregorianToJulian = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      throw new Error('Invalid Gregorian date');
    }

    // Convert to UTC
    const utcDate = new Date(Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds(),
      d.getUTCMilliseconds()
    ));

    // Algorithm from "Astronomical Algorithms" by Jean Meeus
    let year = utcDate.getUTCFullYear();
    let month = utcDate.getUTCMonth() + 1;
    let day = utcDate.getUTCDate();
    const hour = utcDate.getUTCHours() + utcDate.getUTCMinutes() / 60 + utcDate.getUTCSeconds() / 3600 + utcDate.getUTCMilliseconds() / 3600000;

    if (month <= 2) {
      year -= 1;
      month += 12;
    }

    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);

    const JD = Math.floor(365.25 * (year + 4716)) +
               Math.floor(30.6001 * (month + 1)) +
               day + hour / 24 + B - 1524.5;

    return JD;
  };

  const julianToGregorian = (jd) => {
    if (isNaN(jd) || jd < 0) {
      throw new Error('Invalid Julian Date');
    }

    // Algorithm from "Astronomical Algorithms" by Jean Meeus
    const Z = Math.floor(jd + 0.5);
    const F = jd + 0.5 - Z;
    let A = Z;
    if (Z >= 2299161) {
      const alpha = Math.floor((Z - 1867216.25) / 36524.25);
      A = Z + 1 + alpha - Math.floor(alpha / 4);
    }
    const B = A + 1524;
    const C = Math.floor((B - 122.1) / 365.25);
    const D = Math.floor(365.25 * C);
    const E = Math.floor((B - D) / 30.6001);

    const day = B - D - Math.floor(30.6001 * E) + F;
    const month = E < 14 ? E - 1 : E - 13;
    const year = month > 2 ? C - 4716 : C - 4715;

    const totalHours = (day - Math.floor(day)) * 24;
    const hours = Math.floor(totalHours);
    const totalMinutes = (totalHours - hours) * 60;
    const minutes = Math.floor(totalMinutes);
    const totalSeconds = (totalMinutes - minutes) * 60;
    const seconds = Math.floor(totalSeconds);
    const milliseconds = Math.round((totalSeconds - seconds) * 1000);

    return new Date(Date.UTC(year, month - 1, Math.floor(day), hours, minutes, seconds, milliseconds));
  };

  const updateFromGregorian = () => {
    try {
      const date = new Date(gregorianDate);
      const jd = gregorianToJulian(date);
      setJulianDate(jd.toFixed(precision));
      setModifiedJulianDate((jd - 2400000.5).toFixed(precision));
      setError('');
    } catch (err) {
      setJulianDate('');
      setModifiedJulianDate('');
      setError(err.message);
    }
  };

  const updateFromJulian = (jd) => {
    try {
      const date = julianToGregorian(parseFloat(jd));
      setGregorianDate(date.toISOString().slice(0, 16));
      setModifiedJulianDate((parseFloat(jd) - 2400000.5).toFixed(precision));
      setError('');
    } catch (err) {
      setGregorianDate('');
      setModifiedJulianDate('');
      setError(err.message);
    }
  };

  const updateFromModifiedJulian = (mjd) => {
    try {
      const jd = parseFloat(mjd) + 2400000.5;
      const date = julianToGregorian(jd);
      setGregorianDate(date.toISOString().slice(0, 16));
      setJulianDate(jd.toFixed(precision));
      setError('');
    } catch (err) {
      setGregorianDate('');
      setJulianDate('');
      setError(err.message);
    }
  };

  useEffect(() => {
    updateFromGregorian();
    if (updateInterval) {
      const interval = setInterval(updateFromGregorian, 1000);
      return () => clearInterval(interval);
    }
  }, [gregorianDate, timeZone, precision, updateInterval]);

  const handleNow = () => {
    setGregorianDate(new Date().toISOString().slice(0, 16));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Julian Date Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gregorian Date/Time
              </label>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={gregorianDate}
                  onChange={(e) => setGregorianDate(e.target.value)}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Julian Date (JD)
              </label>
              <input
                type="number"
                value={julianDate}
                onChange={(e) => {
                  setJulianDate(e.target.value);
                  updateFromJulian(e.target.value);
                }}
                step="any"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modified Julian Date (MJD)
              </label>
              <input
                type="number"
                value={modifiedJulianDate}
                onChange={(e) => {
                  setModifiedJulianDate(e.target.value);
                  updateFromModifiedJulian(e.target.value);
                }}
                step="any"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-2 md:grid-cols-2">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precision (decimal places)
                </label>
                <input
                  type="number"
                  value={precision}
                  onChange={(e) => setPrecision(Math.max(0, Math.min(15, parseInt(e.target.value) || 0)))}
                  min="0"
                  max="15"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={updateInterval}
                onChange={(e) => setUpdateInterval(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Update every second
              </label>
            </div>
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
            <summary className="cursor-pointer font-medium">Features & Notes</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Converts between Gregorian and Julian Dates</li>
              <li>Supports Modified Julian Date (MJD = JD - 2400000.5)</li>
              <li>Real-time updates (toggleable)</li>
              <li>Adjustable precision (0-15 decimal places)</li>
              <li>Time zone support</li>
              <li>JD starts at noon UTC, January 1, 4713 BC</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default JulianDateConverter;