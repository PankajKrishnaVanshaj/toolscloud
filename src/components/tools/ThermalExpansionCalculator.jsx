'use client'
import React, { useState } from 'react';

const ThermalExpansionCalculator = () => {
  const [initialLength, setInitialLength] = useState('');
  const [initialTemp, setInitialTemp] = useState('');
  const [finalTemp, setFinalTemp] = useState('');
  const [material, setMaterial] = useState('custom');
  const [customAlpha, setCustomAlpha] = useState('');
  const [unit, setUnit] = useState('m'); // Length unit: m, cm, mm
  const [tempUnit, setTempUnit] = useState('C'); // Temperature unit: C, K, F
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Material coefficients of linear thermal expansion (per °C)
  const materials = {
    aluminum: 23.1e-6,
    copper: 16.5e-6,
    steel: 12.0e-6,
    glass: 8.5e-6,
    custom: 0,
  };

  const unitConversions = {
    m: 1,
    cm: 0.01,
    mm: 0.001,
  };

  const calculateExpansion = () => {
    setError('');
    setResult(null);

    if (!initialLength || !initialTemp || !finalTemp) {
      setError('Please fill in all required fields');
      return;
    }

    const L0 = parseFloat(initialLength);
    const T0 = parseFloat(initialTemp);
    const T1 = parseFloat(finalTemp);
    let alpha = material === 'custom' ? parseFloat(customAlpha) : materials[material];

    if (isNaN(L0) || isNaN(T0) || isNaN(T1) || (material === 'custom' && isNaN(alpha))) {
      setError('Please enter valid numbers');
      return;
    }

    if (L0 <= 0) {
      setError('Initial length must be positive');
      return;
    }

    if (material === 'custom' && alpha <= 0) {
      setError('Thermal expansion coefficient must be positive');
      return;
    }

    try {
      // Convert temperatures to Celsius if needed
      let deltaT;
      switch (tempUnit) {
        case 'C':
          deltaT = T1 - T0;
          break;
        case 'K':
          deltaT = T1 - T0; // ΔT is the same in K and °C
          break;
        case 'F':
          deltaT = ((T1 - 32) * 5/9) - ((T0 - 32) * 5/9);
          break;
        default:
          throw new Error('Invalid temperature unit');
      }

      // Linear expansion: ΔL = L0 * α * ΔT
      const deltaL = L0 * alpha * deltaT;
      const finalLength = L0 + deltaL;

      // Area expansion: ΔA/A0 ≈ 2 * α * ΔT
      const initialArea = L0 * L0; // Assuming square
      const deltaA = initialArea * 2 * alpha * deltaT;
      const finalArea = initialArea + deltaA;

      // Volume expansion: ΔV/V0 ≈ 3 * α * ΔT
      const initialVolume = L0 * L0 * L0; // Assuming cube
      const deltaV = initialVolume * 3 * alpha * deltaT;
      const finalVolume = initialVolume + deltaV;

      setResult({
        deltaL,
        finalLength,
        deltaA,
        finalArea,
        deltaV,
        finalVolume,
        unit,
        deltaT,
      });
    } catch (err) {
      setError('Calculation error: ' + err.message);
    }
  };

  const formatNumber = (num, digits = 6) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  const convertToDisplayUnit = (value) => {
    return value / unitConversions[unit];
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Thermal Expansion Calculator
        </h1>

        <div className="space-y-6">
          {/* Inputs */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Length ({unit})
              </label>
              <input
                type="number"
                value={initialLength}
                onChange={(e) => setInitialLength(e.target.value)}
                placeholder={`e.g., 1 ${unit}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Temperature ({tempUnit})
                </label>
                <input
                  type="number"
                  value={initialTemp}
                  onChange={(e) => setInitialTemp(e.target.value)}
                  placeholder={`e.g., 20 ${tempUnit}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Final Temperature ({tempUnit})
                </label>
                <input
                  type="number"
                  value={finalTemp}
                  onChange={(e) => setFinalTemp(e.target.value)}
                  placeholder={`e.g., 100 ${tempUnit}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Material Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Material
            </label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="aluminum">Aluminum (23.1 × 10⁻⁶ /°C)</option>
              <option value="copper">Copper (16.5 × 10⁻⁶ /°C)</option>
              <option value="steel">Steel (12.0 × 10⁻⁶ /°C)</option>
              <option value="glass">Glass (8.5 × 10⁻⁶ /°C)</option>
              <option value="custom">Custom</option>
            </select>
            {material === 'custom' && (
              <input
                type="number"
                value={customAlpha}
                onChange={(e) => setCustomAlpha(e.target.value)}
                placeholder="Enter α (e.g., 23e-6)"
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {/* Units */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Length Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="m">Meters (m)</option>
                <option value="cm">Centimeters (cm)</option>
                <option value="mm">Millimeters (mm)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature Unit
              </label>
              <select
                value={tempUnit}
                onChange={(e) => setTempUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="C">Celsius (°C)</option>
                <option value="K">Kelvin (K)</option>
                <option value="F">Fahrenheit (°F)</option>
              </select>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateExpansion}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate Expansion
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md space-y-2">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <p>ΔT: {formatNumber(result.deltaT)} °C</p>
              <p>Linear Expansion (ΔL): {formatNumber(convertToDisplayUnit(result.deltaL))} {unit}</p>
              <p>Final Length: {formatNumber(convertToDisplayUnit(result.finalLength))} {unit}</p>
              <p>Area Expansion (ΔA): {formatNumber(convertToDisplayUnit(result.deltaA) * convertToDisplayUnit(1))} {unit}²</p>
              <p>Final Area: {formatNumber(convertToDisplayUnit(result.finalArea) * convertToDisplayUnit(1))} {unit}²</p>
              <p>Volume Expansion (ΔV): {formatNumber(convertToDisplayUnit(result.deltaV) * convertToDisplayUnit(1) * convertToDisplayUnit(1))} {unit}³</p>
              <p>Final Volume: {formatNumber(convertToDisplayUnit(result.finalVolume) * convertToDisplayUnit(1) * convertToDisplayUnit(1))} {unit}³</p>
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
                <p>Calculates thermal expansion for solids.</p>
                <p>Formulas:</p>
                <ul className="list-disc list-inside">
                  <li>Linear: ΔL = L₀ * α * ΔT</li>
                  <li>Area: ΔA/A₀ ≈ 2 * α * ΔT</li>
                  <li>Volume: ΔV/V₀ ≈ 3 * α * ΔT</li>
                </ul>
                <p>Where α is the coefficient of linear expansion.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThermalExpansionCalculator;