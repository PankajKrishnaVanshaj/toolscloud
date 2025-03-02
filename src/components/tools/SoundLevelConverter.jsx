'use client';

import React, { useState } from 'react';

const SoundLevelConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('dB_SPL');
  const [secondValue, setSecondValue] = useState('');
  const [showCombined, setShowCombined] = useState(false);

  // Conversion factors relative to dB SPL (Sound Pressure Level)
  const conversionFactors = {
    dB_SPL: 1,          // Decibels (Sound Pressure Level)
    dB_A: 1,            // A-weighted decibels (approximate, actual varies with frequency)
    dB_B: 1,            // B-weighted decibels (approximate)
    dB_C: 1,            // C-weighted decibels (approximate)
    dB_Z: 1,            // Z-weighted decibels (unweighted)
    Pa: (value) => 2e-5 * Math.pow(10, value / 20),  // Pascals (reference: 20 μPa)
    uPa: (value) => 20 * Math.pow(10, value / 20),   // Micropascals
    dB_SIL: 1,          // Sound Intensity Level (approximate)
    W_m2: (value) => 1e-12 * Math.pow(10, value / 10)  // Watts per square meter
  };

  // Display names for units
  const unitDisplayNames = {
    dB_SPL: 'dB SPL',
    dB_A: 'dB(A)',
    dB_B: 'dB(B)',
    dB_C: 'dB(C)',
    dB_Z: 'dB(Z)',
    Pa: 'Pa',
    uPa: 'μPa',
    dB_SIL: 'dB SIL',
    W_m2: 'W/m²'
  };

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};

    let valueInDbSPL;
    if (typeof conversionFactors[fromUnit] === 'function') {
      // For units that need inverse conversion (Pa, μPa, W/m²)
      valueInDbSPL = fromUnit === 'Pa' ? 20 * Math.log10(inputValue / 2e-5) :
                      fromUnit === 'uPa' ? 20 * Math.log10(inputValue / 20) :
                      fromUnit === 'W_m2' ? 10 * Math.log10(inputValue / 1e-12) :
                      inputValue;
    } else {
      valueInDbSPL = inputValue * conversionFactors[fromUnit];
    }

    const results = {};
    Object.keys(conversionFactors).forEach((unit) => {
      if (typeof conversionFactors[unit] === 'function') {
        results[unit] = conversionFactors[unit](valueInDbSPL);
      } else {
        results[unit] = valueInDbSPL / conversionFactors[unit];
      }
    });
    return results;
  };

  const calculateCombinedLevel = () => {
    if (!value || !secondValue || isNaN(value) || isNaN(secondValue)) return null;
    
    // Convert both to intensity (W/m²) first
    const intensity1 = conversionFactors.W_m2(convertValue(value, unit).dB_SPL);
    const intensity2 = conversionFactors.W_m2(convertValue(secondValue, unit).dB_SPL);
    
    // Add intensities and convert back to dB
    const totalIntensity = intensity1 + intensity2;
    return 10 * Math.log10(totalIntensity / 1e-12);
  };

  const results = convertValue(value, unit);
  const combinedLevel = calculateCombinedLevel();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Sound Level Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sound Level 1
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

            {/* Second Sound Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sound Level 2 (Optional)
              </label>
              <input
                type="number"
                value={secondValue}
                onChange={(e) => setSecondValue(e.target.value)}
                placeholder="Enter second value"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setShowCombined(!showCombined)}
                className="mt-2 w-full px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {showCombined ? 'Hide' : 'Show'} Combined Level
              </button>
            </div>
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Conversions:</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>{unitDisplayNames[unit]}: {val.toFixed(4)}</p>
                  ))}
                </div>
              </div>

              {showCombined && secondValue && combinedLevel && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Combined Level:</h2>
                  <p>dB SPL: {combinedLevel.toFixed(2)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Combined using intensity addition
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
              <li>Reference pressure: 20 μPa = 0 dB SPL</li>
              <li>Reference intensity: 10⁻¹² W/m² = 0 dB SIL</li>
              <li>dB(A), dB(B), dB(C) are frequency-weighted scales</li>
              <li>Lp = 20 log₁₀(P/P₀) for pressure</li>
              <li>LI = 10 log₁₀(I/I₀) for intensity</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default SoundLevelConverter;