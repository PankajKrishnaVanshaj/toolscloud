'use client';

import React, { useState } from 'react';

const SpeedConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('m_s');
  const [distance, setDistance] = useState('');
  const [distanceUnit, setDistanceUnit] = useState('m');
  const [time, setTime] = useState('');
  const [timeUnit, setTimeUnit] = useState('s');

  // Conversion factors to meters per second (m/s)
  const conversionFactors = {
    m_s: 1,           // Meters per second
    km_h: 0.277778,   // Kilometers per hour
    mi_h: 0.44704,    // Miles per hour (mph)
    ft_s: 0.3048,     // Feet per second
    kn: 0.514444,     // Knots
    cm_s: 0.01,       // Centimeters per second
    mm_s: 0.001,      // Millimeters per second
    mi_s: 1609.34,    // Miles per second
    mach: 343         // Mach (speed of sound in air at sea level, approx 343 m/s)
  };

  const unitDisplayNames = {
    m_s: 'm/s',
    km_h: 'km/h',
    mi_h: 'mi/h',
    ft_s: 'ft/s',
    kn: 'kn',
    cm_s: 'cm/s',
    mm_s: 'mm/s',
    mi_s: 'mi/s',
    mach: 'Mach'
  };

  // Distance conversion factors to meters (m)
  const distanceConversion = {
    m: 1,
    km: 1000,
    mi: 1609.34,
    ft: 0.3048,
    yd: 0.9144,
    cm: 0.01,
    mm: 0.001
  };

  // Time conversion factors to seconds (s)
  const timeConversion = {
    s: 1,
    min: 60,
    h: 3600,
    d: 86400
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInMs = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInMs / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateDistanceTime = () => {
    if (!distance || !time || isNaN(distance) || isNaN(time)) return null;
    
    const distanceInMeters = distance * distanceConversion[distanceUnit];
    const timeInSeconds = time * timeConversion[timeUnit];
    
    // Speed = Distance / Time
    const calculatedSpeed = distanceInMeters / timeInSeconds;
    return calculatedSpeed;
  };

  const results = convertValue(value, unit);
  const calculatedSpeed = calculateDistanceTime();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Speed Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Speed
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter speed"
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

            {/* Distance Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distance
              </label>
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="Enter distance"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(distanceConversion).map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            {/* Time Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
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
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Section */}
          {(value || (distance && time)) && (
            <div className="grid gap-4 md:grid-cols-2">
              {value && (
                <div className="p-4 bg-gray-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Speed Conversions:</h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(results).map(([unit, val]) => (
                      <p key={unit}>{unitDisplayNames[unit]}: {val.toExponential(4)}</p>
                    ))}
                  </div>
                </div>
              )}
              
              {calculatedSpeed && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Calculated Speed:</h2>
                  <p>m/s: {calculatedSpeed.toExponential(4)}</p>
                  <p>km/h: {(calculatedSpeed * 3.6).toExponential(4)}</p>
                  <p>mi/h: {(calculatedSpeed * 2.23694).toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    v = d / t
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
              <li>1 m/s = 3.6 km/h</li>
              <li>1 m/s = 2.23694 mi/h</li>
              <li>1 mi/h = 1.60934 km/h</li>
              <li>1 kn = 1.852 km/h</li>
              <li>1 Mach ≈ 343 m/s (at sea level)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default SpeedConverter;