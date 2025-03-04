'use client'
import React, { useState } from 'react';

const GasVolumeCalculator = () => {
  const [pressure, setPressure] = useState(1); // Default: 1 atm
  const [pressureUnit, setPressureUnit] = useState('atm');
  const [temperature, setTemperature] = useState(273.15); // Default: 0°C in K
  const [tempUnit, setTempUnit] = useState('K');
  const [moles, setMoles] = useState(1); // Default: 1 mole
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Constants
  const R = 0.08205736; // Gas constant in L·atm/(mol·K)
  const R_SI = 8.314462618; // Gas constant in J/(mol·K) = Pa·m³/(mol·K)

  // Unit conversion factors
  const pressureUnits = {
    atm: 1,
    Pa: 101325,
    kPa: 101.325,
    bar: 1.01325,
  };

  const volumeUnits = {
    L: 1,
    mL: 1000,
    'm³': 0.001,
    'cm³': 1000,
  };

  const tempConversions = {
    K: (t) => t,
    C: (t) => t + 273.15,
    F: (t) => (t - 32) * (5 / 9) + 273.15,
  };

  const calculateVolume = () => {
    setError('');
    setResult(null);

    const P = parseFloat(pressure);
    const T = parseFloat(temperature);
    const n = parseFloat(moles);

    if (isNaN(P) || isNaN(T) || isNaN(n) || P <= 0 || T <= 0 || n <= 0) {
      setError('Please enter valid positive values for pressure, temperature, and moles');
      return;
    }

    try {
      // Convert to SI units for calculation
      const P_SI = P / pressureUnits[pressureUnit]; // Convert to atm
      const T_K = tempConversions[tempUnit](T); // Convert to Kelvin

      if (T_K <= 0) {
        setError('Temperature in Kelvin must be positive');
        return;
      }

      // Ideal Gas Law: V = nRT/P
      const volume_L = (n * R * T_K) / P_SI; // Volume in liters

      setResult({
        volume_L,
        pressure: P_SI,
        temperature: T_K,
        moles: n,
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
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Gas Volume Calculator
        </h1>

        <div className="space-y-6">
          {/* Pressure */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pressure
              </label>
              <input
                type="number"
                value={pressure}
                onChange={(e) => setPressure(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                value={pressureUnit}
                onChange={(e) => setPressureUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(pressureUnits).map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Temperature */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature
              </label>
              <input
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                value={tempUnit}
                onChange={(e) => setTempUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(tempConversions).map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Moles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Moles of Gas
            </label>
            <input
              type="number"
              value={moles}
              onChange={(e) => setMoles(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateVolume}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate Volume
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Gas Volume:</h2>
              <p>{formatNumber(result.volume_L)} L</p>
              <p>{formatNumber(result.volume_L * volumeUnits['mL'])} mL</p>
              <p>{formatNumber(result.volume_L * volumeUnits['m³'])} m³</p>
              <p>{formatNumber(result.volume_L * volumeUnits['cm³'])} cm³</p>
              <p className="text-sm text-gray-600 mt-2">
                Conditions: {formatNumber(result.pressure)} atm,{' '}
                {formatNumber(result.temperature)} K, {formatNumber(result.moles)} mol
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Presets
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPressure(1);
                  setPressureUnit('atm');
                  setTemperature(0);
                  setTempUnit('C');
                  setMoles(1);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                STP (0°C, 1 atm)
              </button>
              <button
                onClick={() => {
                  setPressure(1);
                  setPressureUnit('atm');
                  setTemperature(25);
                  setTempUnit('C');
                  setMoles(1);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Room Temp (25°C)
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Calculates gas volume using the Ideal Gas Law:</p>
                <p>PV = nRT</p>
                <p>Where:</p>
                <ul className="list-disc list-inside">
                  <li>P = Pressure</li>
                  <li>V = Volume</li>
                  <li>n = Number of moles</li>
                  <li>R = Gas constant (0.08206 L·atm/(mol·K))</li>
                  <li>T = Temperature in Kelvin</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GasVolumeCalculator;