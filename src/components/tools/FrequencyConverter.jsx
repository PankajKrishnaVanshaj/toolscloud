'use client';

import React, { useState } from 'react';

const FrequencyConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('Hz');
  const [speed, setSpeed] = useState('299792458'); // Default: speed of light in m/s
  const [speedUnit, setSpeedUnit] = useState('m_s');

  // Conversion factors to Hertz (Hz)
  const conversionFactors = {
    Hz: 1,           // Hertz
    kHz: 1e3,        // Kilohertz
    MHz: 1e6,        // Megahertz
    GHz: 1e9,        // Gigahertz
    THz: 1e12,       // Terahertz
    rpm: 1/60,       // Revolutions per minute
    rps: 1,          // Revolutions per second
    rad_s: 1/(2*Math.PI), // Radians per second
    deg_s: 1/360     // Degrees per second
  };

  // Display names for frequency units
  const unitDisplayNames = {
    Hz: 'Hz',
    kHz: 'kHz',
    MHz: 'MHz',
    GHz: 'GHz',
    THz: 'THz',
    rpm: 'rpm',
    rps: 'rps',
    rad_s: 'rad/s',
    deg_s: 'deg/s'
  };

  // Speed conversion factors to meters per second (m/s)
  const speedConversion = {
    m_s: 1,         // Meters per second
    km_h: 1000/3600, // Kilometers per hour
    ft_s: 0.3048,   // Feet per second
    mi_h: 0.44704,  // Miles per hour
    c: 299792458    // Speed of light
  };

  const speedDisplayNames = {
    m_s: 'm/s',
    km_h: 'km/h',
    ft_s: 'ft/s',
    mi_h: 'mi/h',
    c: 'c (speed of light)'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInHz = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInHz / conversionFactors[unit];
      return acc;
    }, {});
  };

  const calculateWavelength = () => {
    if (!value || !speed || isNaN(value) || isNaN(speed)) return null;
    
    const frequencyInHz = value * conversionFactors[unit];
    const speedInMetersPerSecond = speed * speedConversion[speedUnit];
    
    // Wavelength (λ) = speed / frequency
    const wavelength = speedInMetersPerSecond / frequencyInHz;
    return wavelength;
  };

  const results = convertValue(value, unit);
  const wavelength = calculateWavelength();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Frequency Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter frequency"
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

            {/* Speed Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Propagation Speed
              </label>
              <input
                type="number"
                value={speed}
                onChange={(e) => setSpeed(e.target.value)}
                placeholder="Enter speed"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={speedUnit}
                onChange={(e) => setSpeedUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(speedConversion).map((u) => (
                  <option key={u} value={u}>{speedDisplayNames[u]}</option>
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
              
              {wavelength && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Wavelength:</h2>
                  <p>Meters (m): {wavelength.toExponential(4)}</p>
                  <p>Centimeters (cm): {(wavelength * 100).toExponential(4)}</p>
                  <p>Millimeters (mm): {(wavelength * 1000).toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    λ = speed / frequency
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
              <li>1 Hz = 2π rad/s</li>
              <li>1 rpm = 1/60 Hz</li>
              <li>1 kHz = 10³ Hz</li>
              <li>1 MHz = 10⁶ Hz</li>
              <li>1 GHz = 10⁹ Hz</li>
              <li>1 THz = 10¹² Hz</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default FrequencyConverter;