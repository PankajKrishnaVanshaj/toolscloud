'use client';

import React, { useState } from 'react';

const DataRateConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('bps');
  const [fileSize, setFileSize] = useState('');
  const [fileSizeUnit, setFileSizeUnit] = useState('B');

  // Conversion factors to bits per second (bps)
  const conversionFactors = {
    bps: 1,           // bits per second
    Bps: 8,           // Bytes per second
    kbps: 1e3,        // kilobits per second
    kBps: 8e3,        // kiloBytes per second
    Mbps: 1e6,        // Megabits per second
    MBps: 8e6,        // MegaBytes per second
    Gbps: 1e9,        // Gigabits per second
    GBps: 8e9,        // GigaBytes per second
    Tbps: 1e12,       // Terabits per second
    TBps: 8e12        // TeraBytes per second
  };

  // File size conversion factors to Bytes (B)
  const sizeConversion = {
    B: 1,            // Bytes
    kB: 1e3,         // kilobytes
    MB: 1e6,         // Megabytes
    GB: 1e9,         // Gigabytes
    TB: 1e12         // Terabytes
  };

  const unitDisplayNames = {
    bps: 'b/s',
    Bps: 'B/s',
    kbps: 'kb/s',
    kBps: 'kB/s',
    Mbps: 'Mb/s',
    MBps: 'MB/s',
    Gbps: 'Gb/s',
    GBps: 'GB/s',
    Tbps: 'Tb/s',
    TBps: 'TB/s'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInBps = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInBps / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateTransferTime = () => {
    if (!value || !fileSize || isNaN(value) || isNaN(fileSize)) return null;
    
    const dataRateInBps = value * conversionFactors[unit];
    const fileSizeInBytes = fileSize * sizeConversion[fileSizeUnit];
    const fileSizeInBits = fileSizeInBytes * 8;
    
    // Time in seconds = file size (bits) / data rate (bits per second)
    const timeInSeconds = fileSizeInBits / dataRateInBps;
    return timeInSeconds;
  };

  const formatTime = (seconds) => {
    if (!seconds) return '';
    if (seconds < 60) return `${seconds.toFixed(2)} seconds`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(2)} minutes`;
    if (seconds < 86400) return `${(seconds / 3600).toFixed(2)} hours`;
    return `${(seconds / 86400).toFixed(2)} days`;
  };

  const results = convertValue(value, unit);
  const transferTime = calculateTransferTime();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Data Rate Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Rate
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter value"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(conversionFactors).map((u) => (
                  <option key={u} value={u}>{unitDisplayNames[u]}</option>
                ))}
              </select>
            </div>

            {/* File Size Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Size (for Transfer Time)
              </label>
              <input
                type="number"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                placeholder="Enter file size"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={fileSizeUnit}
                onChange={(e) => setFileSizeUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(sizeConversion).map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Conversions:</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>{unitDisplayNames[unit]}: {val.toExponential(4)}</p>
                  ))}
                </div>
              </div>
              
              {transferTime && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Transfer Time:</h2>
                  <p>{formatTime(transferTime)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Time = File Size / Data Rate
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Conversion References</summary>
            <ul className="list-disc list-inside mt-2">
              <li>1 B/s = 8 b/s</li>
              <li>1 kb/s = 10³ b/s</li>
              <li>1 Mb/s = 10⁶ b/s</li>
              <li>1 Gb/s = 10⁹ b/s</li>
              <li>1 Tb/s = 10¹² b/s</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default DataRateConverter;