'use client';

import React, { useState } from 'react';

const DigitalStorageConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('B');
  const [notation, setNotation] = useState('binary'); // binary (1024) or decimal (1000)

  // Conversion factors to bytes
  const conversionFactors = {
    // Binary (1024-based) units
    B: { binary: 1, decimal: 1 },                // Bytes
    KB: { binary: 1024, decimal: 1000 },         // Kilobytes
    MB: { binary: 1024**2, decimal: 1000**2 },   // Megabytes
    GB: { binary: 1024**3, decimal: 1000**3 },   // Gigabytes
    TB: { binary: 1024**4, decimal: 1000**4 },   // Terabytes
    PB: { binary: 1024**5, decimal: 1000**5 },   // Petabytes
    EB: { binary: 1024**6, decimal: 1000**6 },   // Exabytes
    // Bits
    b: { binary: 1/8, decimal: 1/8 },           // Bits
    Kb: { binary: 1024/8, decimal: 1000/8 },    // Kilobits
    Mb: { binary: (1024**2)/8, decimal: (1000**2)/8 }, // Megabits
    Gb: { binary: (1024**3)/8, decimal: (1000**3)/8 }, // Gigabits
  };

  const unitDisplayNames = {
    B: 'B',
    KB: 'KB',
    MB: 'MB',
    GB: 'GB',
    TB: 'TB',
    PB: 'PB',
    EB: 'EB',
    b: 'b',
    Kb: 'Kb',
    Mb: 'Mb',
    Gb: 'Gb'
  };

  const convertValue = (inputValue, fromUnit, notationType) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInBytes = inputValue * conversionFactors[fromUnit][notationType];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInBytes / conversionFactors[unit][notationType];
      return acc;
    }, {});
  };

  const formatSize = (size) => {
    if (size >= 1e12) return `${(size / 1e12).toFixed(2)}T`;
    if (size >= 1e9) return `${(size / 1e9).toFixed(2)}G`;
    if (size >= 1e6) return `${(size / 1e6).toFixed(2)}M`;
    if (size >= 1e3) return `${(size / 1e3).toFixed(2)}K`;
    return `${size.toFixed(2)}`;
  };

  const results = convertValue(value, unit, notation);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Digital Storage Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter value"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(conversionFactors).map((u) => (
                  <option key={u} value={u}>{unitDisplayNames[u]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notation
              </label>
              <select
                value={notation}
                onChange={(e) => setNotation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="binary">Binary (1024)</option>
                <option value="decimal">Decimal (1000)</option>
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
                    <p key={unit}>
                      {unitDisplayNames[unit]}: {formatSize(val)} {notation === 'binary' ? 'i' : ''}
                    </p>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Summary:</h2>
                <p>Bytes: {results.B.toLocaleString()}</p>
                <p>Bits: {(results.B * 8).toLocaleString()}</p>
                <p className="mt-2 text-sm text-gray-600">
                  Base: {notation === 'binary' ? '1024 (KiB, MiB, etc.)' : '1000 (KB, MB, etc.)'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Conversion References</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Binary: 1 KB = 1024 B, 1 MB = 1024 KB, etc.</li>
              <li>Decimal: 1 KB = 1000 B, 1 MB = 1000 KB, etc.</li>
              <li>1 Byte = 8 Bits</li>
              <li>Binary notation often uses "i" (KiB, MiB)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default DigitalStorageConverter;