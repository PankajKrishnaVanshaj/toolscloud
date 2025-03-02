'use client';

import React, { useState } from 'react';

const AccelerationConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('m_s2');
  const [time, setTime] = useState('');
  const [timeUnit, setTimeUnit] = useState('s');

  // Conversion factors to meters per second squared (m/s²)
  const conversionFactors = {
    m_s2: 1,           // Meters per second squared
    cm_s2: 0.01,       // Centimeters per second squared
    ft_s2: 0.3048,     // Feet per second squared
    in_s2: 0.0254,     // Inches per second squared
    km_h2: 7.716e-5,   // Kilometers per hour squared
    mi_h2: 0.0001242,  // Miles per hour squared
    g: 9.80665,        // Standard gravity
    Gal: 0.01          // Gal (cm/s²)
  };

  // Display names for units
  const unitDisplayNames = {
    m_s2: 'm/s²',
    cm_s2: 'cm/s²',
    ft_s2: 'ft/s²',
    in_s2: 'in/s²',
    km_h2: 'km/h²',
    mi_h2: 'mi/h²',
    g: 'g',
    Gal: 'Gal'
  };

  // Time conversion factors to seconds
  const timeConversion = {
    s: 1,
    ms: 0.001,
    min: 60,
    h: 3600
  };

  const timeDisplayNames = {
    s: 'seconds (s)',
    ms: 'milliseconds (ms)',
    min: 'minutes (min)',
    h: 'hours (h)'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInMs2 = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInMs2 / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateDistance = () => {
    if (!value || !time || isNaN(value) || isNaN(time)) return null;
    
    const accelerationInMs2 = value * conversionFactors[unit];
    const timeInSeconds = time * timeConversion[timeUnit];
    
    // Distance = (1/2) × a × t² (assuming initial velocity = 0)
    const distance = 0.5 * accelerationInMs2 * timeInSeconds * timeInSeconds;
    return distance;
  };

  const results = convertValue(value, unit);
  const distance = calculateDistance();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Acceleration Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Acceleration
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

            {/* Time Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time (for Distance)
              </label>
              <input
                type="number"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Enter time"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={timeUnit}
                onChange={(e) => setTimeUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(timeConversion).map((u) => (
                  <option key={u} value={u}>{timeDisplayNames[u]}</option>
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
              
              {distance && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Distance Traveled:</h2>
                  <p>Meters (m): {distance.toExponential(4)}</p>
                  <p>Feet (ft): {(distance / 0.3048).toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    d = ½ × a × t² (v₀ = 0)
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
              <li>1 m/s² = 100 cm/s²</li>
              <li>1 m/s² = 3.28084 ft/s²</li>
              <li>1 g = 9.80665 m/s²</li>
              <li>1 Gal = 0.01 m/s²</li>
              <li>1 km/h² ≈ 7.716 × 10⁻⁵ m/s²</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default AccelerationConverter;