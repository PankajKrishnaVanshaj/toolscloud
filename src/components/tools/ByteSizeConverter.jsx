"use client";

import React, { useState } from 'react';

const ByteSizeConverter = () => {
  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState('B');
  const [toUnit, setToUnit] = useState('KB');
  const [notation, setNotation] = useState('decimal'); // 'decimal' (1000) or 'binary' (1024)
  const [result, setResult] = useState('');
  const [error, setError] = useState(null);

  const units = [
    { symbol: 'B', name: 'Bytes' },
    { symbol: 'KB', name: notation === 'decimal' ? 'Kilobytes' : 'Kibibytes' },
    { symbol: 'MB', name: notation === 'decimal' ? 'Megabytes' : 'Mebibytes' },
    { symbol: 'GB', name: notation === 'decimal' ? 'Gigabytes' : 'Gibibytes' },
    { symbol: 'TB', name: notation === 'decimal' ? 'Terabytes' : 'Tebibytes' },
    { symbol: 'PB', name: notation === 'decimal' ? 'Petabytes' : 'Pebibytes' }
  ];

  const convertSize = () => {
    setError(null);
    setResult('');

    if (!value.trim() || isNaN(value) || Number(value) < 0) {
      setError('Please enter a valid positive number');
      return;
    }

    const numValue = Number(value);
    const base = notation === 'decimal' ? 1000 : 1024;

    // Convert to bytes first
    const fromIndex = units.findIndex(u => u.symbol === fromUnit);
    const bytes = numValue * Math.pow(base, fromIndex);

    // Convert from bytes to target unit
    const toIndex = units.findIndex(u => u.symbol === toUnit);
    const convertedValue = bytes / Math.pow(base, toIndex);

    // Format result with appropriate precision
    const precision = convertedValue < 1 ? 4 : convertedValue < 10 ? 2 : 1;
    setResult(convertedValue.toFixed(precision));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    convertSize();
  };

  const handleNotationChange = (newNotation) => {
    setNotation(newNotation);
    setFromUnit('B'); // Reset units to avoid confusion
    setToUnit('KB');
    if (value) convertSize(); // Recalculate if there's a value
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Byte Size Converter</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter value"
                min="0"
                step="any"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Unit
              </label>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {units.map(unit => (
                  <option key={unit.symbol} value={unit.symbol}>
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Unit
              </label>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {units.map(unit => (
                  <option key={unit.symbol} value={unit.symbol}>
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notation
              </label>
              <select
                value={notation}
                onChange={(e) => handleNotationChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="decimal">Decimal (1000)</option>
                <option value="binary">Binary (1024)</option>
              </select>
            </div>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Convert
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-700 mb-2">Result</h3>
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-lg text-gray-800">
                {value} {fromUnit} = {result} {toUnit}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                ({notation === 'decimal' ? 'Base-10' : 'Base-2'} notation)
              </p>
            </div>
          </div>
        )}

        {/* Conversion Table */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-700 mb-2">Unit Reference</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Unit</th>
                  <th className="px-4 py-2">{notation === 'decimal' ? 'Decimal' : 'Binary'} Name</th>
                  <th className="px-4 py-2">Value in Bytes</th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit, index) => (
                  <tr key={unit.symbol} className="border-b">
                    <td className="px-4 py-2">{unit.symbol}</td>
                    <td className="px-4 py-2">{unit.name}</td>
                    <td className="px-4 py-2">
                      {notation === 'decimal' 
                        ? (1000 ** index).toLocaleString() 
                        : (1024 ** index).toLocaleString()} B
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Decimal uses multiples of 1000 (KB, MB, etc.). Binary uses multiples of 1024 (KiB, MiB, etc.).
          </p>
        </div>
      </div>
    </div>
  );
};

export default ByteSizeConverter;