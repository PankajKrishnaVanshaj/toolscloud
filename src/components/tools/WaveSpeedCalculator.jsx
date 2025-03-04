'use client'
import React, { useState } from 'react';

const WaveSpeedCalculator = () => {
  const [waveType, setWaveType] = useState('transverse'); // transverse, longitudinal
  const [medium, setMedium] = useState('string'); // string, fluid, solid
  const [tension, setTension] = useState(''); // N (for transverse string)
  const [massDensity, setMassDensity] = useState(''); // kg/m (for transverse string)
  const [bulkModulus, setBulkModulus] = useState(''); // Pa (for longitudinal fluid/solid)
  const [density, setDensity] = useState(''); // kg/m³ (for longitudinal fluid/solid)
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const calculateWaveSpeed = () => {
    setError('');
    setResult(null);

    let speed;
    try {
      if (waveType === 'transverse' && medium === 'string') {
        const T = parseFloat(tension);
        const mu = parseFloat(massDensity);

        if (isNaN(T) || isNaN(mu) || T <= 0 || mu <= 0) {
          setError('Please enter valid positive values for tension and mass density');
          return;
        }

        // v = √(T/μ) for transverse wave on a string
        speed = Math.sqrt(T / mu);
      } else if (waveType === 'longitudinal') {
        const B = parseFloat(bulkModulus);
        const rho = parseFloat(density);

        if (isNaN(B) || isNaN(rho) || B <= 0 || rho <= 0) {
          setError('Please enter valid positive values for bulk modulus and density');
          return;
        }

        // v = √(B/ρ) for longitudinal wave in fluid or solid
        speed = Math.sqrt(B / rho);
      } else {
        setError('Invalid combination of wave type and medium');
        return;
      }

      setResult({
        speed,
        waveType,
        medium,
      });
    } catch (err) {
      setError('Calculation error: ' + err.message);
    }
  };

  const formatNumber = (num, digits = 2) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Wave Speed Calculator
        </h1>

        <div className="space-y-6">
          {/* Wave Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wave Type
            </label>
            <select
              value={waveType}
              onChange={(e) => {
                setWaveType(e.target.value);
                setMedium(e.target.value === 'transverse' ? 'string' : 'fluid');
                setResult(null);
                setTension('');
                setMassDensity('');
                setBulkModulus('');
                setDensity('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="transverse">Transverse</option>
              <option value="longitudinal">Longitudinal</option>
            </select>
          </div>

          {/* Medium */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medium
            </label>
            <select
              value={medium}
              onChange={(e) => {
                setMedium(e.target.value);
                setResult(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {waveType === 'transverse' ? (
                <option value="string">String</option>
              ) : (
                <>
                  <option value="fluid">Fluid</option>
                  <option value="solid">Solid</option>
                </>
              )}
            </select>
          </div>

          {/* Inputs based on wave type and medium */}
          {waveType === 'transverse' && medium === 'string' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tension (N)
                </label>
                <input
                  type="number"
                  value={tension}
                  onChange={(e) => setTension(e.target.value)}
                  placeholder="e.g., 100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Linear Mass Density (kg/m)
                </label>
                <input
                  type="number"
                  value={massDensity}
                  onChange={(e) => setMassDensity(e.target.value)}
                  placeholder="e.g., 0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bulk Modulus (Pa)
                </label>
                <input
                  type="number"
                  value={bulkModulus}
                  onChange={(e) => setBulkModulus(e.target.value)}
                  placeholder="e.g., 2.2e9 for water"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Density (kg/m³)
                </label>
                <input
                  type="number"
                  value={density}
                  onChange={(e) => setDensity(e.target.value)}
                  placeholder="e.g., 1000 for water"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* Calculate Button */}
          <button
            onClick={calculateWaveSpeed}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Wave Speed:</h2>
              <p>{formatNumber(result.speed)} m/s</p>
              <p>{formatNumber(result.speed * 3.6)} km/h</p>
              <p>{formatNumber(result.speed * 2.23694)} mph</p>
              <p className="text-sm text-gray-600 mt-2">
                Wave Type: {result.waveType} | Medium: {result.medium}
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
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  setWaveType('transverse');
                  setMedium('string');
                  setTension(100);
                  setMassDensity(0.01);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                String (T=100N, μ=0.01kg/m)
              </button>
              <button
                onClick={() => {
                  setWaveType('longitudinal');
                  setMedium('fluid');
                  setBulkModulus(2.2e9);
                  setDensity(1000);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Water
              </button>
              <button
                onClick={() => {
                  setWaveType('longitudinal');
                  setMedium('solid');
                  setBulkModulus(1.6e11);
                  setDensity(7850);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Steel
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Calculates wave speed based on medium properties:</p>
                <ul className="list-disc list-inside">
                  <li>Transverse (String): v = √(T/μ)</li>
                  <li>Longitudinal (Fluid/Solid): v = √(B/ρ)</li>
                </ul>
                <p>T = tension, μ = mass density, B = bulk modulus, ρ = density</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaveSpeedCalculator;