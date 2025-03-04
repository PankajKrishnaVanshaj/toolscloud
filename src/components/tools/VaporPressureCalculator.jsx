'use client'
import React, { useState } from 'react';

const VaporPressureCalculator = () => {
  const [substance, setSubstance] = useState('water');
  const [temperature, setTemperature] = useState('');
  const [unit, setUnit] = useState('C'); // C (Celsius) or K (Kelvin)
  const [pressureUnit, setPressureUnit] = useState('mmHg'); // mmHg, atm, kPa
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Antoine coefficients (A, B, C) for different substances
  // Source: NIST Chemistry WebBook, valid for specific temperature ranges
  const substances = {
    water: { A: 8.07131, B: 1730.63, C: 233.426, range: [1, 100] }, // °C
    ethanol: { A: 8.20417, B: 1642.89, C: 230.3, range: [-57, 80] }, // °C
    benzene: { A: 6.90565, B: 1211.033, C: 220.79, range: [6, 81] }, // °C
  };

  // Conversion factors
  const pressureConversions = {
    mmHg: 1,
    atm: 1 / 760,
    kPa: 101.325 / 760,
  };

  const calculateVaporPressure = () => {
    setError('');
    setResult(null);

    if (!temperature || isNaN(temperature)) {
      setError('Please enter a valid temperature');
      return;
    }

    const temp = parseFloat(temperature);
    const coeffs = substances[substance];
    let tempInCelsius = unit === 'K' ? temp - 273.15 : temp;

    // Validate temperature range
    if (tempInCelsius < coeffs.range[0] || tempInCelsius > coeffs.range[1]) {
      setError(`Temperature must be between ${coeffs.range[0]}°C and ${coeffs.range[1]}°C for ${substance}`);
      return;
    }

    try {
      // Antoine equation: log₁₀(P) = A - (B / (T + C))
      const logP = coeffs.A - (coeffs.B / (tempInCelsius + coeffs.C));
      const pressureMmHg = Math.pow(10, logP);

      // Convert to desired unit
      const pressure = pressureMmHg * pressureConversions[pressureUnit];

      setResult({
        pressure,
        unit: pressureUnit,
        temp: tempInCelsius,
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
          Vapor Pressure Calculator
        </h1>

        <div className="space-y-6">
          {/* Substance Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Substance
            </label>
            <select
              value={substance}
              onChange={(e) => setSubstance(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(substances).map((sub) => (
                <option key={sub} value={sub}>
                  {sub.charAt(0).toUpperCase() + sub.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Temperature Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperature
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="Enter temperature"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="C">°C</option>
                <option value="K">K</option>
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Valid range for {substance}: {substances[substance].range[0]}°C to {substances[substance].range[1]}°C
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
              <option value="mmHg">mmHg</option>
              <option value="atm">atm</option>
              <option value="kPa">kPa</option>
            </select>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateVaporPressure}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate Vapor Pressure
          </button>

          {/* Result */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Vapor Pressure:</h2>
              <p>
                {formatNumber(result.pressure)} {result.unit} at {formatNumber(result.temp)}°C
              </p>
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
                <p>Calculates vapor pressure using the Antoine equation:</p>
                <p>log₁₀(P) = A - (B / (T + C))</p>
                <p>Where:</p>
                <ul className="list-disc list-inside">
                  <li>P = vapor pressure (mmHg)</li>
                  <li>T = temperature (°C)</li>
                  <li>A, B, C = substance-specific constants</li>
                </ul>
                <p>Data from NIST Chemistry WebBook.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaporPressureCalculator;

