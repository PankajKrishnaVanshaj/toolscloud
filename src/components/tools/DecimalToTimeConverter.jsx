'use client';

import React, { useState } from 'react';

const DecimalToTimeConverter = () => {
  const [decimalValue, setDecimalValue] = useState('');
  const [timeValue, setTimeValue] = useState('');
  const [unit, setUnit] = useState('hours'); // hours, minutes, seconds
  const [precision, setPrecision] = useState(2); // decimal places for display
  const [includeSeconds, setIncludeSeconds] = useState(true);
  const [error, setError] = useState('');

  const convertDecimalToTime = (decimal, inputUnit) => {
    if (!decimal || isNaN(decimal)) return '';
    setError('');

    let totalSeconds;
    switch (inputUnit) {
      case 'hours':
        totalSeconds = decimal * 3600;
        break;
      case 'minutes':
        totalSeconds = decimal * 60;
        break;
      case 'seconds':
        totalSeconds = decimal;
        break;
      default:
        return '';
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    if (includeSeconds) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
  };

  const convertTimeToDecimal = (time, outputUnit) => {
    if (!time) return '';
    setError('');

    const parts = time.split(':');
    if (parts.length < 2 || parts.length > 3) {
      setError('Invalid time format. Use HH:MM or HH:MM:SS');
      return '';
    }

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parts[2] ? parseInt(parts[2], 10) : 0;

    if (isNaN(hours) || isNaN(minutes) || (parts[2] && isNaN(seconds))) {
      setError('Invalid time format');
      return '';
    }

    if (hours < 0 || minutes < 0 || seconds < 0 || minutes >= 60 || seconds >= 60) {
      setError('Time components must be positive and within valid ranges (0-59 for minutes/seconds)');
      return '';
    }

    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    let decimal;
    switch (outputUnit) {
      case 'hours':
        decimal = totalSeconds / 3600;
        break;
      case 'minutes':
        decimal = totalSeconds / 60;
        break;
      case 'seconds':
        decimal = totalSeconds;
        break;
      default:
        return '';
    }

    return decimal.toFixed(precision);
  };

  const handleDecimalChange = (value) => {
    setDecimalValue(value);
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      setTimeValue(convertDecimalToTime(parsedValue, unit));
    } else {
      setTimeValue('');
      setError('Please enter a valid decimal number');
    }
  };

  const handleTimeChange = (value) => {
    setTimeValue(value);
    setDecimalValue(convertTimeToDecimal(value, unit));
  };

  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
    if (decimalValue) {
      const parsedValue = parseFloat(decimalValue);
      setTimeValue(convertDecimalToTime(parsedValue, newUnit));
    } else if (timeValue) {
      setDecimalValue(convertTimeToDecimal(timeValue, newUnit));
    }
  };

  const handlePrecisionChange = (newPrecision) => {
    setPrecision(newPrecision);
    if (timeValue) {
      setDecimalValue(convertTimeToDecimal(timeValue, unit));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Decimal to Time Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Decimal Value
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={decimalValue}
                  onChange={(e) => handleDecimalChange(e.target.value)}
                  placeholder={`Enter decimal ${unit}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="any"
                />
                <select
                  value={unit}
                  onChange={(e) => handleUnitChange(e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hours">Hours</option>
                  <option value="minutes">Minutes</option>
                  <option value="seconds">Seconds</option>
                </select>
              </div>
            </div>

            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Time Format (HH:MM:SS)
              </label>
              <input
                type="text"
                value={timeValue}
                onChange={(e) => handleTimeChange(e.target.value)}
                placeholder="e.g., 02:30:00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Precision (Decimal Places)
              </label>
              <input
                type="number"
                value={precision}
                onChange={(e) => handlePrecisionChange(parseInt(e.target.value, 10))}
                min="0"
                max="6"
                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeSeconds}
                onChange={(e) => {
                  setIncludeSeconds(e.target.checked);
                  if (decimalValue) {
                    setTimeValue(convertDecimalToTime(parseFloat(decimalValue), unit));
                  }
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Include Seconds
              </label>
            </div>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Results Section */}
          {(decimalValue || timeValue) && !error && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Conversion Result:</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Decimal ({unit}):</span> {decimalValue}
                </p>
                <p>
                  <span className="font-medium">Time:</span> {timeValue}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Convert decimal hours/minutes/seconds to time format</li>
              <li>Reverse conversion from time to decimal</li>
              <li>Supports hours, minutes, or seconds as input units</li>
              <li>Adjustable precision for decimal output</li>
              <li>Optional seconds in time format</li>
              <li>Example: 2.5 hours = 02:30:00</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default DecimalToTimeConverter;