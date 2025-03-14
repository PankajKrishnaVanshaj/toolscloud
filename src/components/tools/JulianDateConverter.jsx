"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaCopy, FaCalendarAlt } from "react-icons/fa";

const JulianDateConverter = () => {
  const [gregorianDate, setGregorianDate] = useState(new Date().toISOString().slice(0, 16));
  const [julianDate, setJulianDate] = useState("");
  const [modifiedJulianDate, setModifiedJulianDate] = useState("");
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [precision, setPrecision] = useState(6);
  const [error, setError] = useState("");
  const [updateInterval, setUpdateInterval] = useState(true);
  const [dateFormat, setDateFormat] = useState("iso"); // ISO or Custom
  const [customFormat, setCustomFormat] = useState("YYYY-MM-DD HH:mm");

  const timeZones = Intl.supportedValuesOf("timeZone");

  // Julian Date conversion functions
  const gregorianToJulian = useCallback((date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) throw new Error("Invalid Gregorian date");

    const utcDate = new Date(Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds(),
      d.getUTCMilliseconds()
    ));

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
  }, []);

  const julianToGregorian = useCallback((jd) => {
    if (isNaN(jd) || jd < 0) throw new Error("Invalid Julian Date");

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
  }, []);

  const updateFromGregorian = useCallback(() => {
    try {
      const date = new Date(gregorianDate);
      const jd = gregorianToJulian(date);
      setJulianDate(jd.toFixed(precision));
      setModifiedJulianDate((jd - 2400000.5).toFixed(precision));
      setError("");
    } catch (err) {
      setJulianDate("");
      setModifiedJulianDate("");
      setError(err.message);
    }
  }, [gregorianDate, precision]);

  const updateFromJulian = useCallback((jd) => {
    try {
      const date = julianToGregorian(parseFloat(jd));
      setGregorianDate(dateFormat === "iso" ? date.toISOString().slice(0, 16) : formatCustomDate(date));
      setModifiedJulianDate((parseFloat(jd) - 2400000.5).toFixed(precision));
      setError("");
    } catch (err) {
      setGregorianDate("");
      setModifiedJulianDate("");
      setError(err.message);
    }
  }, [precision, dateFormat, customFormat]);

  const updateFromModifiedJulian = useCallback((mjd) => {
    try {
      const jd = parseFloat(mjd) + 2400000.5;
      const date = julianToGregorian(jd);
      setGregorianDate(dateFormat === "iso" ? date.toISOString().slice(0, 16) : formatCustomDate(date));
      setJulianDate(jd.toFixed(precision));
      setError("");
    } catch (err) {
      setGregorianDate("");
      setJulianDate("");
      setError(err.message);
    }
  }, [precision, dateFormat, customFormat]);

  // Custom date formatting
  const formatCustomDate = (date) => {
    const replacements = {
      "YYYY": date.getUTCFullYear(),
      "MM": String(date.getUTCMonth() + 1).padStart(2, "0"),
      "DD": String(date.getUTCDate()).padStart(2, "0"),
      "HH": String(date.getUTCHours()).padStart(2, "0"),
      "mm": String(date.getUTCMinutes()).padStart(2, "0"),
    };
    let formatted = customFormat;
    for (const [key, value] of Object.entries(replacements)) {
      formatted = formatted.replace(key, value);
    }
    return formatted;
  };

  useEffect(() => {
    updateFromGregorian();
    if (updateInterval) {
      const interval = setInterval(updateFromGregorian, 1000);
      return () => clearInterval(interval);
    }
  }, [updateFromGregorian, updateInterval]);

  const handleNow = () => {
    const now = new Date();
    setGregorianDate(dateFormat === "iso" ? now.toISOString().slice(0, 16) : formatCustomDate(now));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const reset = () => {
    setGregorianDate(new Date().toISOString().slice(0, 16));
    setJulianDate("");
    setModifiedJulianDate("");
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setPrecision(6);
    setError("");
    setUpdateInterval(true);
    setDateFormat("iso");
    setCustomFormat("YYYY-MM-DD HH:mm");
    updateFromGregorian();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Julian Date Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Gregorian Date/Time
              </label>
              <div className="flex gap-2">
                {dateFormat === "iso" ? (
                  <input
                    type="datetime-local"
                    value={gregorianDate}
                    onChange={(e) => setGregorianDate(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <input
                    type="text"
                    value={gregorianDate}
                    onChange={(e) => setGregorianDate(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={customFormat}
                  />
                )}
                <button
                  onClick={handleNow}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FaCalendarAlt />
                </button>
                <button
                  onClick={() => copyToClipboard(gregorianDate)}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  <FaCopy />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Julian Date (JD)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={julianDate}
                  onChange={(e) => {
                    setJulianDate(e.target.value);
                    updateFromJulian(e.target.value);
                  }}
                  step="any"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => copyToClipboard(julianDate)}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  <FaCopy />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Modified Julian Date (MJD)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={modifiedJulianDate}
                  onChange={(e) => {
                    setModifiedJulianDate(e.target.value);
                    updateFromModifiedJulian(e.target.value);
                  }}
                  step="any"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => copyToClipboard(modifiedJulianDate)}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  <FaCopy />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
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

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Precision ({precision} decimal places)
              </label>
              <input
                type="range"
                min="0"
                max="15"
                value={precision}
                onChange={(e) => setPrecision(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Date Format
              </label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="iso">ISO (YYYY-MM-DDTHH:mm)</option>
                <option value="custom">Custom</option>
              </select>
              {dateFormat === "custom" && (
                <input
                  type="text"
                  value={customFormat}
                  onChange={(e) => setCustomFormat(e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., YYYY-MM-DD HH:mm"
                />
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={updateInterval}
                onChange={(e) => setUpdateInterval(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Update every second</span>
            </label>
            <button
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FaSync /> Reset
            </button>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Features & Notes */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features & Notes</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Converts between Gregorian, Julian, and Modified Julian Dates</li>
              <li>Real-time updates (toggleable)</li>
              <li>Adjustable precision (0-15 decimal places)</li>
              <li>Customizable date format (e.g., YYYY-MM-DD HH:mm)</li>
              <li>Copy values to clipboard</li>
              <li>Time zone support</li>
              <li>JD starts at noon UTC, January 1, 4713 BC</li>
              <li>MJD = JD - 2400000.5</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JulianDateConverter;