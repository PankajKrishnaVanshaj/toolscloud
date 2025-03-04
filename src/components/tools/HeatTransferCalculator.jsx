'use client'
import React, { useState } from 'react';

const HeatTransferCalculator = () => {
  const [mode, setMode] = useState('conduction'); // conduction, convection, radiation
  const [inputs, setInputs] = useState({
    conduction: { k: 0.026, A: 1, dT: 10, L: 0.1 },
    convection: { h: 10, A: 1, dT: 20 },
    radiation: { e: 0.9, A: 1, T1: 300, T2: 280 },
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Constants
  const sigma = 5.670374e-8; // Stefan-Boltzmann constant (W/m²K⁴)

  const calculateHeatTransfer = () => {
    setError('');
    setResult(null);

    const currentInputs = inputs[mode];
    let Q;

    try {
      switch (mode) {
        case 'conduction':
          // Q = k * A * ΔT / L
          const { k, A: Ac, dT: dTc, L } = currentInputs;
          if (k <= 0 || Ac <= 0 || L <= 0) {
            throw new Error('Invalid input: k, A, and L must be positive');
          }
          Q = (k * Ac * dTc) / L;
          setResult({
            mode: 'Conduction',
            Q,
            unit: 'W',
            equation: 'Q = k * A * ΔT / L',
            params: `k=${k} W/m·K, A=${Ac} m², ΔT=${dTc} K, L=${L} m`,
          });
          break;

        case 'convection':
          // Q = h * A * ΔT
          const { h, A: Av, dT: dTv } = currentInputs;
          if (h <= 0 || Av <= 0) {
            throw new Error('Invalid input: h and A must be positive');
          }
          Q = h * Av * dTv;
          setResult({
            mode: 'Convection',
            Q,
            unit: 'W',
            equation: 'Q = h * A * ΔT',
            params: `h=${h} W/m²·K, A=${Av} m², ΔT=${dTv} K`,
          });
          break;

        case 'radiation':
          // Q = ε * σ * A * (T₁⁴ - T₂⁴)
          const { e, A: Ar, T1, T2 } = currentInputs;
          if (e < 0 || e > 1 || Ar <= 0 || T1 < 0 || T2 < 0) {
            throw new Error('Invalid input: ε must be 0-1, A positive, T ≥ 0 K');
          }
          Q = e * sigma * Ar * (Math.pow(T1, 4) - Math.pow(T2, 4));
          setResult({
            mode: 'Radiation',
            Q,
            unit: 'W',
            equation: 'Q = ε * σ * A * (T₁⁴ - T₂⁴)',
            params: `ε=${e}, A=${Ar} m², T₁=${T1} K, T₂=${T2} K`,
          });
          break;

        default:
          throw new Error('Unknown mode');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [field]: parseFloat(value) || 0,
      },
    }));
  };

  const formatNumber = (num, digits = 2) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Heat Transfer Calculator
        </h1>

        <div className="space-y-6">
          {/* Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Heat Transfer Mode
            </label>
            <select
              value={mode}
              onChange={(e) => {
                setMode(e.target.value);
                setResult(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="conduction">Conduction</option>
              <option value="convection">Convection</option>
              <option value="radiation">Radiation</option>
            </select>
          </div>

          {/* Inputs based on mode */}
          {mode === 'conduction' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thermal Conductivity (k, W/m·K)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={inputs.conduction.k}
                  onChange={(e) => handleInputChange('k', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area (A, m²)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.conduction.A}
                  onChange={(e) => handleInputChange('A', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature Difference (ΔT, K)
                </label>
                <input
                  type="number"
                  value={inputs.conduction.dT}
                  onChange={(e) => handleInputChange('dT', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thickness (L, m)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.conduction.L}
                  onChange={(e) => handleInputChange('L', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {mode === 'convection' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Convective Coefficient (h, W/m²·K)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.convection.h}
                  onChange={(e) => handleInputChange('h', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area (A, m²)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.convection.A}
                  onChange={(e) => handleInputChange('A', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature Difference (ΔT, K)
                </label>
                <input
                  type="number"
                  value={inputs.convection.dT}
                  onChange={(e) => handleInputChange('dT', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {mode === 'radiation' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emissivity (ε, 0-1)
                </label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={inputs.radiation.e}
                  onChange={(e) => handleInputChange('e', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area (A, m²)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.radiation.A}
                  onChange={(e) => handleInputChange('A', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature 1 (T₁, K)
                </label>
                <input
                  type="number"
                  value={inputs.radiation.T1}
                  onChange={(e) => handleInputChange('T1', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature 2 (T₂, K)
                </label>
                <input
                  type="number"
                  value={inputs.radiation.T2}
                  onChange={(e) => handleInputChange('T2', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Calculate Button */}
          <button
            onClick={calculateHeatTransfer}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">{result.mode} Heat Transfer:</h2>
              <p>Rate: {formatNumber(result.Q)} {result.unit}</p>
              <p className="text-sm text-gray-600 mt-2">{result.equation}</p>
              <p className="text-sm text-gray-600">Parameters: {result.params}</p>
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
                <p>Calculates heat transfer rates:</p>
                <ul className="list-disc list-inside">
                  <li>Conduction: Q = k * A * ΔT / L</li>
                  <li>Convection: Q = h * A * ΔT</li>
                  <li>Radiation: Q = ε * σ * A * (T₁⁴ - T₂⁴)</li>
                </ul>
                <p>Inputs must be in SI units (W, m, K).</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatTransferCalculator;