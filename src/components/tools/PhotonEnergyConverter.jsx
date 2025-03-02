'use client';

import React, { useState } from 'react';

const PhotonEnergyConverter = () => {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('eV');

  // Physical constants
  const h = 4.135667696e-15;  // Planck's constant in eV·s
  const c = 299792458;        // Speed of light in m/s
  const hc = h * c * 1e9;     // h*c in eV·nm (converted to nanometers)

  // Conversion functions
  const convertFromEV = (ev) => ({
    eV: ev,
    J: ev * 1.60217662e-19,
    Hz: ev / h,
    nm: hc / ev
  });

  const convertFromJoules = (j) => ({
    eV: j / 1.60217662e-19,
    J: j,
    Hz: j / (h * 1.60217662e-19),
    nm: hc / (j / 1.60217662e-19)
  });

  const convertFromHz = (hz) => ({
    eV: h * hz,
    J: h * hz * 1.60217662e-19,
    Hz: hz,
    nm: hc / (h * hz)
  });

  const convertFromNm = (nm) => ({
    eV: hc / nm,
    J: (hc / nm) * 1.60217662e-19,
    Hz: (hc / nm) / h,
    nm: nm
  });

  const convertValue = (inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    
    const val = parseFloat(inputValue);
    switch (fromUnit) {
      case 'eV': return convertFromEV(val);
      case 'J': return convertFromJoules(val);
      case 'Hz': return convertFromHz(val);
      case 'nm': return convertFromNm(val);
      default: return {};
    }
  };

  const results = convertValue(value, unit);

  // Unit display names
  const unitDisplayNames = {
    eV: 'eV',
    J: 'J',
    Hz: 'Hz',
    nm: 'nm'
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Photon Energy Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Value
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
                <option value="eV">Electronvolts (eV)</option>
                <option value="J">Joules (J)</option>
                <option value="Hz">Frequency (Hz)</option>
                <option value="nm">Wavelength (nm)</option>
              </select>
            </div>
          </div>

          {/* Results Section */}
          {value && Object.keys(results).length > 0 && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Conversions:</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>Energy: {results.eV.toExponential(4)} eV</p>
                <p>Energy: {results.J.toExponential(4)} J</p>
                <p>Frequency: {results.Hz.toExponential(4)} Hz</p>
                <p>Wavelength: {results.nm.toExponential(4)} nm</p>
              </div>
            </div>
          )}

          {/* Additional Info */}
          {value && Object.keys(results).length > 0 && (
            <div className="p-4 bg-blue-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Photon Properties:</h2>
              <div className="text-sm">
                <p>Photon energy: E = hν = hc/λ</p>
                <p>Wavelength range: {
                  results.nm < 400 ? 'Ultraviolet' :
                  results.nm < 700 ? 'Visible' :
                  'Infrared'
                }</p>
                {results.nm >= 400 && results.nm <= 700 && (
                  <p className="mt-1">Color approximation: {
                    results.nm < 450 ? 'Violet' :
                    results.nm < 500 ? 'Blue' :
                    results.nm < 570 ? 'Green' :
                    results.nm < 590 ? 'Yellow' :
                    results.nm < 620 ? 'Orange' : 'Red'
                  }</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Constants & Formulas</summary>
            <ul className="list-disc list-inside mt-2">
              <li>h = 4.135667696 × 10⁻¹⁵ eV·s</li>
              <li>c = 299792458 m/s</li>
              <li>1 eV = 1.60217662 × 10⁻¹⁹ J</li>
              <li>E = hν (energy-frequency)</li>
              <li>E = hc/λ (energy-wavelength)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default PhotonEnergyConverter;