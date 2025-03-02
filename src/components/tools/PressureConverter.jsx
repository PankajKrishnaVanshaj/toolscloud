'use client';

import React, { useState } from 'react';

const PressureConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('Pa');
  const [altitude, setAltitude] = useState('');
  const [temperature, setTemperature] = useState(''); // in Celsius

  // Conversion factors to Pascal (Pa)
  const conversionFactors = {
    Pa: 1,             // Pascal
    kPa: 1e3,          // Kilopascal
    MPa: 1e6,          // Megapascal
    bar: 1e5,          // Bar
    mbar: 1e2,         // Millibar
    atm: 101325,       // Atmosphere
    mmHg: 133.322,     // Millimeter of mercury
    inHg: 3386.39,     // Inch of mercury
    psi: 6894.76,      // Pounds per square inch
    torr: 133.322      // Torr
  };

  // Display names for units
  const unitDisplayNames = {
    Pa: 'Pa',
    kPa: 'kPa',
    MPa: 'MPa',
    bar: 'bar',
    mbar: 'mbar',
    atm: 'atm',
    mmHg: 'mmHg',
    inHg: 'inHg',
    psi: 'psi',
    torr: 'torr'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInPa = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInPa / conversionFactors[unit];
      return acc;
    }, {});
  };

  // Calculate atmospheric pressure based on altitude (in meters) and temperature (in Celsius)
  const calculateAltitudePressure = () => {
    if (!altitude || !temperature || isNaN(altitude) || isNaN(temperature)) return null;
    
    // Barometric formula: P = P0 * exp(-Mgh/(RT))
    const P0 = 101325; // Sea level pressure in Pa
    const M = 0.0289644; // Molar mass of air (kg/mol)
    const g = 9.80665; // Gravity (m/s²)
    const R = 8.31447; // Gas constant (J/(mol·K))
    const T = parseFloat(temperature) + 273.15; // Convert to Kelvin
    const h = parseFloat(altitude);
    
    const pressureAtAltitude = P0 * Math.exp(-M * g * h / (R * T));
    return pressureAtAltitude;
  };

  const results = convertValue(value, unit);
  const altitudePressure = calculateAltitudePressure();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Pressure Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pressure
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter pressure"
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

            {/* Altitude and Temperature Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Altitude (m)
              </label>
              <input
                type="number"
                value={altitude}
                onChange={(e) => setAltitude(e.target.value)}
                placeholder="Enter altitude"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label className="block text-sm font-medium text-gray-700 mt-2 mb-1">
                Temperature (°C)
              </label>
              <input
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="Enter temperature"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
              
              {altitudePressure && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Pressure at Altitude:</h2>
                  <p>Pa: {altitudePressure.toExponential(4)}</p>
                  <p>atm: {(altitudePressure / conversionFactors.atm).toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Using barometric formula
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
              <li>1 atm = 101325 Pa</li>
              <li>1 bar = 10⁵ Pa</li>
              <li>1 psi = 6894.76 Pa</li>
              <li>1 mmHg = 1 torr = 133.322 Pa</li>
              <li>1 inHg = 3386.39 Pa</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default PressureConverter;