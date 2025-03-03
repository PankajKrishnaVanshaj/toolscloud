'use client';

import React, { useState, useEffect } from 'react';

const RelativeTimeFormatter = () => {
  const [inputTime, setInputTime] = useState(new Date().toISOString().slice(0, 16));
  const [language, setLanguage] = useState('en');
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [customFormat, setCustomFormat] = useState('');
  const [relativeTime, setRelativeTime] = useState('');
  const [absoluteTime, setAbsoluteTime] = useState('');
  const [updateInterval, setUpdateInterval] = useState(true);

  // Supported languages
  const languages = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    ja: 'Japanese',
    zh: 'Chinese (Simplified)',
  };

  // Time zones (partial list, can be expanded)
  const timeZones = Intl.supportedValuesOf('timeZone');

  const formatRelativeTime = (date) => {
    const now = new Date();
    const inputDate = new Date(date);
    const diffMs = now - inputDate;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    const formatter = new Intl.RelativeTimeFormat(language, { numeric: 'auto' });

    if (Math.abs(diffYears) >= 1) {
      return formatter.format(-diffYears, 'year');
    } else if (Math.abs(diffMonths) >= 1) {
      return formatter.format(-diffMonths, 'month');
    } else if (Math.abs(diffWeeks) >= 1) {
      return formatter.format(-diffWeeks, 'week');
    } else if (Math.abs(diffDays) >= 1) {
      return formatter.format(-diffDays, 'day');
    } else if (Math.abs(diffHours) >= 1) {
      return formatter.format(-diffHours, 'hour');
    } else if (Math.abs(diffMinutes) >= 1) {
      return formatter.format(-diffMinutes, 'minute');
    } else {
      return formatter.format(-diffSeconds, 'second');
    }
  };

  const formatAbsoluteTime = (date) => {
    const options = {
      timeZone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    };
    return new Intl.DateTimeFormat(language, options).format(new Date(date));
  };

  const updateTime = () => {
    try {
      const date = new Date(inputTime);
      setRelativeTime(customFormat || formatRelativeTime(date));
      setAbsoluteTime(formatAbsoluteTime(date));
    } catch (err) {
      setRelativeTime('Invalid date');
      setAbsoluteTime('Invalid date');
    }
  };

  useEffect(() => {
    updateTime();
    if (updateInterval) {
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [inputTime, language, timeZone, customFormat, updateInterval]);

  const handleNow = () => {
    setInputTime(new Date().toISOString().slice(0, 16));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Relative Time Formatter
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
                  value={inputTime}
                  onChange={(e) => setInputTime(e.target.value)}
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
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(languages).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Format (optional)
              </label>
              <input
                type="text"
                value={customFormat}
                onChange={(e) => setCustomFormat(e.target.value)}
                placeholder="e.g., 'Just now' or leave blank for auto"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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

          {/* Results Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Formatted Time:</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Relative:</span> {relativeTime}
              </p>
              <p>
                <span className="font-medium">Absolute:</span> {absoluteTime}
              </p>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Tips</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Supports multiple languages via Intl.RelativeTimeFormat</li>
              <li>Real-time updates (toggleable)</li>
              <li>Time zone adjustments</li>
              <li>Custom format override</li>
              <li>Use "Now" button for current time</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default RelativeTimeFormatter;