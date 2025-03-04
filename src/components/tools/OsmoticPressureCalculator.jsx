'use client'
import React, { useState } from 'react';

const OsmoticPressureCalculator = () => {
  const [concentration, setConcentration] = useState('');
  const [concUnit, setConcUnit] = useState('M'); // M (mol/L), mM, μM
  const [temperature, setTemperature] = useState('');
  const [tempUnit, setTempUnit] = useState('K'); // K, °C
  const [vanthoff, setVanthoff] = useState(1); // van 't Hoff factor
  const [result, setResult] = useState(null);
  const [pressureUnit, setPressureUnit] = useState('atm'); // atm, kPa, bar
  const [error, setError] = useState('');

  // Constants
  const R = 0.08206; // Gas constant in L·atm/(mol·K)

  // Conversion factors
  const concConversions = { M: 1, mM: 1e-3, μM: 1e-6 };
  const pressureConversions = { atm: 1, kPa: 101.325, bar: 1.01325 };

  // Preset examples
  const presets = [
    { name: '0.9% NaCl (saline)', conc: 0.154, concUnit: 'M', temp: 310, tempUnit: 'K', i: 2 },
    { name: '0.1 M Glucose', conc: 0.1, concUnit: 'M', temp: 298, tempUnit: 'K', i: 1 },
    { name: '0.05 M CaCl₂', conc: 0.05, concUnit: 'M', temp: 298, tempUnit: 'K', i: 3 },
  ];

  const calculateOsmoticPressure = () => {
    setError('');
    setResult(null);

    if (!concentration || !temperature || isNaN(concentration) || isNaN(temperature) || isNaN(vanthoff)) {
      setError('Please enter valid numeric values');
      return;
    }

    const C = parseFloat(concentration);
    const T = parseFloat(temperature);
    const i = parseFloat(vanthoff);

    if (C <= 0 || T <= -273.15 || i <= 0) {
      setError('Concentration and van \'t Hoff factor must be positive, temperature must be above absolute zero');
      return;
    }

    try {
      // Convert concentration to mol/L
      let concInM = C * concConversions[concUnit];

      // Convert temperature to Kelvin
      let tempInK = tempUnit === 'K' ? T : T + 273.15;

      // Calculate osmotic pressure in atm (π = iCRT)
      const pressureAtm = i * concInM * R * tempInK;

      // Convert to selected pressure unit
      const pressure = pressureAtm * pressureConversions[pressureUnit];

      setResult({
        pressure,
        unit: pressureUnit,
        osmolarity: i * concInM // mol/L
      });
    } catch (err) {
      setError('Calculation error: ' + err.message);
    }
  };

  const formatNumber = (num, digits = 3) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Osmotic Pressure Calculator
        </h1>

        <div className="space-y-6">
          {/* Concentration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Concentration
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={concentration}
                onChange={(e) => setConcentration(e.target.value)}
                placeholder="e.g., 0.1"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={concUnit}
                onChange={(e) => setConcUnit(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="M">M (mol/L)</option>
                <option value="mM">mM</option>
                <option value="μM">μM</option>
              </select>
            </div>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperature
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="e.g., 298"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={tempUnit}
                onChange={(e) => setTempUnit(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="K">Kelvin (K)</option>
                <option value="°C">Celsius (°C)</option>
              </select>
            </div>
          </div>

          {/* van 't Hoff Factor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              van 't Hoff Factor (i)
            </label>
            <input
              type="number"
              min="1"
              value={vanthoff}
              onChange={(e) => setVanthoff(Math.max(1, parseFloat(e.target.value) || 1))}
              placeholder="e.g., 1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Number of particles per solute molecule (e.g., 2 for NaCl)
            </p>
          </div>

          {/* Pressure Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pressure Unit
            </label>
            <select
              value={pressureUnit}
              onChange={(e) => setPressureUnit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="atm">atm</option>
              <option value="kPa">kPa</option>
              <option value="bar">bar</option>
            </select>
          </div>

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Presets
            </label>
            <div className="flex gap-2 flex-wrap">
              {presets.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setConcentration(preset.conc);
                    setConcUnit(preset.concUnit);
                    setTemperature(preset.temp);
                    setTempUnit(preset.tempUnit);
                    setVanthoff(preset.i);
                  }}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateOsmoticPressure}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate
          </button>

          {/* Result */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <p>Osmotic Pressure: {formatNumber(result.pressure)} {result.unit}</p>
              <p>Osmolarity: {formatNumber(result.osmolarity)} osM</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Calculates osmotic pressure using the van 't Hoff equation:</p>
                <p>π = iCRT</p>
                <ul className="list-disc list-inside">
                  <li>i = van 't Hoff factor (particles per molecule)</li>
                  <li>C = concentration (mol/L)</li>
                  <li>R = gas constant (0.08206 L·atm/(mol·K))</li>
                  <li>T = temperature (K)</li>
                </ul>
                <p>Also calculates osmolarity (i × C).</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OsmoticPressureCalculator;