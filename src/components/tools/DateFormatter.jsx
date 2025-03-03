'use client';

import React, { useState, useEffect } from 'react';

const DateFormatter = () => {
  const [inputDate, setInputDate] = useState(new Date().toISOString().slice(0, 16));
  const [locale, setLocale] = useState('en-US');
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [customPattern, setCustomPattern] = useState('');
  const [formattedDate, setFormattedDate] = useState('');
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [templateName, setTemplateName] = useState('');
  const [options, setOptions] = useState({
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  });

  // Supported locales (partial list, can be expanded)
  const locales = [
    'en-US', 'en-GB', 'fr-FR', 'es-ES', 'de-DE', 'it-IT', 'ja-JP', 'zh-CN', 'ru-RU', 'ar-SA'
  ];
  const timeZones = Intl.supportedValuesOf('timeZone');

  const formatDate = (date) => {
    try {
      if (customPattern) {
        return formatWithCustomPattern(date, customPattern);
      }
      const formatter = new Intl.DateTimeFormat(locale, { ...options, timeZone });
      return formatter.format(date);
    } catch (err) {
      return `Error: ${err.message}`;
    }
  };

  const formatWithCustomPattern = (date, pattern) => {
    const replacements = {
      'YYYY': date.getFullYear(),
      'YY': String(date.getFullYear()).slice(-2),
      'MMMM': new Intl.DateTimeFormat(locale, { month: 'long', timeZone }).format(date),
      'MMM': new Intl.DateTimeFormat(locale, { month: 'short', timeZone }).format(date),
      'MM': String(date.getMonth() + 1).padStart(2, '0'),
      'M': date.getMonth() + 1,
      'DD': String(date.getDate()).padStart(2, '0'),
      'D': date.getDate(),
      'HH': String(date.getHours()).padStart(2, '0'),
      'H': date.getHours(),
      'hh': String(date.getHours() % 12 || 12).padStart(2, '0'),
      'h': date.getHours() % 12 || 12,
      'mm': String(date.getMinutes()).padStart(2, '0'),
      'm': date.getMinutes(),
      'ss': String(date.getSeconds()).padStart(2, '0'),
      's': date.getSeconds(),
      'SSS': String(date.getMilliseconds()).padStart(3, '0'),
      'A': date.getHours() < 12 ? 'AM' : 'PM',
      'Z': new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: 'short' }).format(date).split(' ').pop(),
    };

    let result = pattern;
    for (const [key, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(key, 'g'), value);
    }
    return result;
  };

  useEffect(() => {
    const date = new Date(inputDate);
    setFormattedDate(formatDate(date));
  }, [inputDate, locale, timeZone, customPattern, options]);

  const handleNow = () => {
    setInputDate(new Date().toISOString().slice(0, 16));
  };

  const saveTemplate = () => {
    if (!templateName || !customPattern) return;
    setSavedTemplates(prev => [
      ...prev,
      { name: templateName, pattern: customPattern }
    ]);
    setTemplateName('');
  };

  const applyTemplate = (pattern) => {
    setCustomPattern(pattern);
  };

  const handleOptionChange = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }));
    setCustomPattern(''); // Clear custom pattern when using options
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Date Formatter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date/Time
                </label>
                <input
                  type="datetime-local"
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleNow}
                className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Now
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Locale
                </label>
                <select
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {locales.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
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
                Custom Pattern (optional)
              </label>
              <input
                type="text"
                value={customPattern}
                onChange={(e) => setCustomPattern(e.target.value)}
                placeholder="e.g., YYYY-MM-DD hh:mm:ss A Z"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Format Options */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Format Options</h2>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <label>Year:</label>
                <select
                  value={options.year}
                  onChange={(e) => handleOptionChange('year', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded-md"
                >
                  <option value="numeric">Numeric</option>
                  <option value="2-digit">2-digit</option>
                  <option value={undefined}>None</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label>Month:</label>
                <select
                  value={options.month}
                  onChange={(e) => handleOptionChange('month', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded-md"
                >
                  <option value="long">Long</option>
                  <option value="short">Short</option>
                  <option value="numeric">Numeric</option>
                  <option value="2-digit">2-digit</option>
                  <option value={undefined}>None</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label>Day:</label>
                <select
                  value={options.day}
                  onChange={(e) => handleOptionChange('day', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded-md"
                >
                  <option value="numeric">Numeric</option>
                  <option value="2-digit">2-digit</option>
                  <option value={undefined}>None</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label>Hour:</label>
                <select
                  value={options.hour}
                  onChange={(e) => handleOptionChange('hour', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded-md"
                >
                  <option value="2-digit">2-digit</option>
                  <option value="numeric">Numeric</option>
                  <option value={undefined}>None</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label>Minute:</label>
                <select
                  value={options.minute}
                  onChange={(e) => handleOptionChange('minute', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded-md"
                >
                  <option value="2-digit">2-digit</option>
                  <option value="numeric">Numeric</option>
                  <option value={undefined}>None</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label>Second:</label>
                <select
                  value={options.second}
                  onChange={(e) => handleOptionChange('second', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded-md"
                >
                  <option value="2-digit">2-digit</option>
                  <option value="numeric">Numeric</option>
                  <option value={undefined}>None</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label>Hour Format:</label>
                <select
                  value={options.hour12}
                  onChange={(e) => handleOptionChange('hour12', e.target.value === 'true')}
                  className="px-2 py-1 border border-gray-300 rounded-md"
                >
                  <option value="true">12-hour</option>
                  <option value="false">24-hour</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label>Time Zone Name:</label>
                <select
                  value={options.timeZoneName}
                  onChange={(e) => handleOptionChange('timeZoneName', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded-md"
                >
                  <option value="short">Short</option>
                  <option value="long">Long</option>
                  <option value={undefined}>None</option>
                </select>
              </div>
            </div>
          </div>

          {/* Result Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Formatted Date:</h2>
            <p className="text-sm">{formattedDate}</p>
          </div>

          {/* Template Section */}
          <div className="grid gap-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Template Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={saveTemplate}
                disabled={!templateName || !customPattern}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300"
              >
                Save Template
              </button>
            </div>
            {savedTemplates.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Saved Templates:</h2>
                <div className="space-y-2 text-sm">
                  {savedTemplates.map((template, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{template.name}: {template.pattern}</span>
                      <button
                        onClick={() => applyTemplate(template.pattern)}
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Custom Pattern Guide</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Supports multiple locales and time zones</li>
              <li>Custom pattern support (e.g., YYYY-MM-DD hh:mm:ss A Z)</li>
              <li>Save and apply templates</li>
              <li>Pattern options: YYYY, YY, MMMM, MMM, MM, M, DD, D, HH, H, hh, h, mm, m, ss, s, SSS, A, Z</li>
              <li>Use "Now" for current date</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default DateFormatter;