'use client';

import React, { useState, useEffect } from 'react';

const SecondsToTimeConverter = () => {
  const [seconds, setSeconds] = useState('');
  const [format, setFormat] = useState('readable'); // readable, HMS, DHMS
  const [customFormat, setCustomFormat] = useState('');
  const [output, setOutput] = useState('');
  const [includeNegative, setIncludeNegative] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(false);

  const convertSeconds = (secs) => {
    if (!secs || isNaN(secs)) return 'Invalid input';
    
    const absSeconds = Math.abs(parseFloat(secs));
    const sign = secs < 0 && includeNegative ? '-' : '';
    
    switch (format) {
      case 'readable':
        return customFormat ? formatCustom(absSeconds) : formatReadable(absSeconds, sign);
      case 'HMS':
        return formatHMS(absSeconds, sign);
      case 'DHMS':
        return formatDHMS(absSeconds, sign);
      default:
        return 'Invalid format';
    }
  };

  const formatReadable = (secs, sign) => {
    const years = Math.floor(secs / (365 * 24 * 60 * 60));
    const days = Math.floor((secs % (365 * 24 * 60 * 60)) / (24 * 60 * 60));
    const hours = Math.floor((secs % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((secs % (60 * 60)) / 60);
    const seconds = Math.floor(secs % 60);
    const milliseconds = Math.round((secs % 1) * 1000);

    const parts = [];
    if (years) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
    if (days) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    if (hours) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    if (minutes) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
    if (seconds || !parts.length) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
    if (milliseconds) parts.push(`${milliseconds} millisecond${milliseconds !== 1 ? 's' : ''}`);

    return sign + parts.join(', ');
  };

  const formatHMS = (secs, sign) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = Math.floor(secs % 60);
    const milliseconds = Math.round((secs % 1) * 1000);
    
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}${milliseconds ? `.${milliseconds.toString().padStart(3, '0')}` : ''}`;
  };

  const formatDHMS = (secs, sign) => {
    const days = Math.floor(secs / 86400);
    const hours = Math.floor((secs % 86400) / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = Math.floor(secs % 60);
    const milliseconds = Math.round((secs % 1) * 1000);
    
    return `${sign}${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s${milliseconds ? ` ${milliseconds}ms` : ''}`;
  };

  const formatCustom = (secs) => {
    const years = Math.floor(secs / (365 * 24 * 60 * 60));
    const days = Math.floor((secs % (365 * 24 * 60 * 60)) / (24 * 60 * 60));
    const hours = Math.floor((secs % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((secs % (60 * 60)) / 60);
    const seconds = Math.floor(secs % 60);
    const milliseconds = Math.round((secs % 1) * 1000);

    let result = customFormat;
    result = result.replace('{y}', years);
    result = result.replace('{d}', days);
    result = result.replace('{h}', hours.toString().padStart(2, '0'));
    result = result.replace('{m}', minutes.toString().padStart(2, '0'));
    result = result.replace('{s}', seconds.toString().padStart(2, '0'));
    result = result.replace('{ms}', milliseconds.toString().padStart(3, '0'));
    return result;
  };

  const handleInputChange = (value) => {
    setSeconds(value);
    setOutput(convertSeconds(value));
  };

  useEffect(() => {
    if (autoUpdate && seconds) {
      const interval = setInterval(() => {
        const newSeconds = parseFloat(seconds) + 1;
        setSeconds(newSeconds.toString());
        setOutput(convertSeconds(newSeconds));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [seconds, autoUpdate, format, customFormat, includeNegative]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Seconds to Time Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seconds
              </label>
              <input
                type="number"
                step="any"
                value={seconds}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Enter seconds (e.g., 3661.5)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="readable">Readable (e.g., 1 hour, 1 minute)</option>
                <option value="HMS">HMS (e.g., 01:01:01)</option>
                <option value="DHMS">DHMS (e.g., 0d 01h 01m 01s)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Format (for Readable)
              </label>
              <input
                type="text"
                value={customFormat}
                onChange={(e) => setCustomFormat(e.target.value)}
                placeholder="e.g., {h}h {m}m {s}s"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use: {`{y}`} (years), {`{d}`} (days), {`{h}`} (hours), {`{m}`} (minutes), {`{s}`} (seconds), {`{ms}`} (milliseconds)
              </p>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeNegative}
                  onChange={(e) => setIncludeNegative(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Show Negative Sign
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoUpdate}
                  onChange={(e) => setAutoUpdate(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Auto Increment
              </label>
            </div>
          </div>

          {/* Output Section */}
          {seconds && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Converted Time:</h2>
              <p className="text-sm">{output}</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Converts seconds to readable, HMS, or DHMS formats</li>
              <li>Supports negative values and decimal seconds</li>
              <li>Custom format with placeholders</li>
              <li>Auto-increment option for real-time updates</li>
              <li>Examples: 3661.5 → "1 hour, 1 minute, 1 second, 500 milliseconds"</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default SecondsToTimeConverter;