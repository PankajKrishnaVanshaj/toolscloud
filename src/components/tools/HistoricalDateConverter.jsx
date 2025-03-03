'use client';

import React, { useState } from 'react';

// Julian to Gregorian conversion utility
const julianToGregorian = (julianDate) => {
  const JDN = Math.floor(julianDate.getTime() / (1000 * 60 * 60 * 24)) + 2440588; // Julian Day Number
  const f = JDN + 1401 + Math.floor((Math.floor((4 * JDN + 274277) / 146097) * 3) / 4) - 38;
  const e = 4 * f + 3;
  const g = Math.floor((e % 1461) / 4);
  const h = 5 * g + 2;
  const D = Math.floor((h % 153) / 5) + 1;
  const M = Math.floor((h / 153 + 2) % 12) + 1;
  const Y = Math.floor(e / 1461) - 4716 + Math.floor((12 + 2 - M) / 12);
  return new Date(Y, M - 1, D);
};

// Gregorian to Julian conversion utility
const gregorianToJulian = (gregorianDate) => {
  const JDN = Math.floor(gregorianDate.getTime() / (1000 * 60 * 60 * 24)) + 2440588;
  const a = Math.floor((14 - gregorianDate.getMonth()) / 12);
  const y = gregorianDate.getFullYear() + 4800 - a;
  const m = gregorianDate.getMonth() + 12 * a - 3;
  const JD = gregorianDate.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  return new Date((JD - 2440588) * (1000 * 60 * 60 * 24));
};

// Roman date conversion (simplified, using AUC - Ab Urbe Condita)
const toRomanDate = (gregorianDate) => {
  const aucYear = gregorianDate.getFullYear() + 753; // AUC starts from 753 BC
  return `${aucYear} AUC`;
};

const HistoricalDateConverter = () => {
  const [gregorianDate, setGregorianDate] = useState(new Date().toISOString().slice(0, 10));
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [calendar, setCalendar] = useState('gregorian');
  const [convertedDate, setConvertedDate] = useState('');
  const [eraNotation, setEraNotation] = useState('AD/BC');
  const [error, setError] = useState('');

  const timeZones = Intl.supportedValuesOf('timeZone');

  const calendars = {
    gregorian: 'Gregorian (Modern)',
    julian: 'Julian',
    roman: 'Roman (AUC)',
  };

  const convertDate = (inputDate) => {
    try {
      const date = new Date(inputDate);
      if (isNaN(date.getTime())) throw new Error('Invalid date');

      let result;
      switch (calendar) {
        case 'gregorian':
          result = formatDate(date, 'gregorian');
          break;
        case 'julian':
          result = formatDate(gregorianToJulian(date), 'julian');
          break;
        case 'roman':
          result = toRomanDate(date);
          break;
        default:
          result = 'Unsupported calendar';
      }
      setConvertedDate(result);
      setError('');
    } catch (err) {
      setConvertedDate('');
      setError(`Error: ${err.message}`);
    }
  };

  const formatDate = (date, type) => {
    const options = {
      timeZone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    let formatted = new Intl.DateTimeFormat('en-US', options).format(date);
    const year = date.getFullYear();
    if (eraNotation === 'AD/BC') {
      formatted = year < 0 ? `${formatted.replace('-', '')} BC` : `${formatted} AD`;
    } else if (eraNotation === 'CE/BCE') {
      formatted = year < 0 ? `${formatted.replace('-', '')} BCE` : `${formatted} CE`;
    }
    return `${formatted} (${type})`;
  };

  const handleGregorianInput = (value) => {
    setGregorianDate(value);
    convertDate(value);
  };

  const handleNow = () => {
    const now = new Date().toISOString().slice(0, 10);
    setGregorianDate(now);
    convertDate(now);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Historical Date Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gregorian Date
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={gregorianDate}
                  onChange={(e) => handleGregorianInput(e.target.value)}
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
                  Target Calendar
                </label>
                <select
                  value={calendar}
                  onChange={(e) => {
                    setCalendar(e.target.value);
                    convertDate(gregorianDate);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(calendars).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Zone
                </label>
                <select
                  value={timeZone}
                  onChange={(e) => {
                    setTimeZone(e.target.value);
                    convertDate(gregorianDate);
                  }}
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
                Era Notation
              </label>
              <select
                value={eraNotation}
                onChange={(e) => {
                  setEraNotation(e.target.value);
                  convertDate(gregorianDate);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="AD/BC">AD/BC</option>
                <option value="CE/BCE">CE/BCE</option>
              </select>
            </div>
          </div>

          {/* Results Section */}
          {convertedDate && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Converted Date:</h2>
              <p className="text-sm">{convertedDate}</p>
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
              <li>Converts between Gregorian and historical calendars</li>
              <li>Julian calendar (pre-1582 in many regions)</li>
              <li>Roman AUC (Ab Urbe Condita - from founding of Rome, 753 BC)</li>
              <li>Supports AD/BC or CE/BCE notation</li>
              <li>Time zone adjustments</li>
              <li>Note: Roman date is simplified (year only)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default HistoricalDateConverter;