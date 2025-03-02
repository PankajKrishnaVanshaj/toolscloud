'use client';

import React, { useState } from 'react';

const AngularVelocityConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('rad_s');
  const [radius, setRadius] = useState('');
  const [radiusUnit, setRadiusUnit] = useState('m');

  // Conversion factors to radians per second (rad/s)
  const conversionFactors = {
    rad_s: 1,          // Radians per second
    deg_s: Math.PI / 180,  // Degrees per second
    rpm: 2 * Math.PI / 60, // Revolutions per minute
    rps: 2 * Math.PI,     // Revolutions per second
    rad_min: 1 / 60,     // Radians per minute
    deg_min: Math.PI / (180 * 60), // Degrees per minute
    rad_h: 1 / 3600,    // Radians per hour
    deg_h: Math.PI / (180 * 3600)  // Degrees per hour
  };

  // Display names for units
  const unitDisplayNames = {
    rad_s: 'rad/s',
    deg_s: 'deg/s',
    rpm: 'rpm',
    rps: 'rps',
    rad_min: 'rad/min',
    deg_min: 'deg/min',
    rad_h: 'rad/h',
    deg_h: 'deg/h'
  };

  // Radius conversion factors to meters (m)
  const radiusConversion = {
    m: 1,
    cm: 1e-2,
    mm: 1e-3,
    km: 1e3,
    in: 0.0254,
    ft: 0.3048
  };

  const radiusDisplayNames = {
    m: 'm',
    cm: 'cm',
    mm: 'mm',
    km: 'km',
    in: 'in',
    ft: 'ft'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInRadS = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInRadS / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateLinearVelocity = () => {
    if (!value || !radius || isNaN(value) || isNaN(radius)) return null;
    
    const angularVelocityInRadS = value * conversionFactors[unit];
    const radiusInMeters = radius * radiusConversion[radiusUnit];
    
    // Linear velocity (v) = ω × r (m/s = rad/s × m)
    const linearVelocity = angularVelocityInRadS * radiusInMeters;
    return linearVelocity;
  };

  const results = convertValue(value, unit);
  const linearVelocity = calculateLinearVelocity();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Angular Velocity Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Angular Velocity
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

            {/* Radius Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Radius (for Linear Velocity)
              </label>
              <input
                type="number"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                placeholder="Enter radius"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={radiusUnit}
                onChange={(e) => setRadiusUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(radiusConversion).map((u) => (
                  <option key={u} value={u}>{radiusDisplayNames[u]}</option>
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
              
              {linearVelocity && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Linear Velocity:</h2>
                  <p>m/s: {linearVelocity.toExponential(4)}</p>
                  <p>km/h: {(linearVelocity * 3.6).toExponential(4)}</p>
                  <p>mph: {(linearVelocity * 2.23694).toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    v = ω × r
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
              <li>1 rad/s = (180/π) deg/s ≈ 57.2958 deg/s</li>
              <li>1 rpm = (2π/60) rad/s ≈ 0.10472 rad/s</li>
              <li>1 rps = 2π rad/s ≈ 6.2832 rad/s</li>
              <li>1 rad/s = 3600 rad/h</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default AngularVelocityConverter;