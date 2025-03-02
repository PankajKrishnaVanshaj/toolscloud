'use client';

import React, { useState } from 'react';

const ThermalExpansionConverter = () => {
  const [length, setLength] = useState('');
  const [lengthUnit, setLengthUnit] = useState('m');
  const [tempChange, setTempChange] = useState('');
  const [tempUnit, setTempUnit] = useState('C');
  const [material, setMaterial] = useState('aluminum');

  // Linear thermal expansion coefficients (in 1/K or 1/°C, since ΔT is the same in K or °C)
  const materialCoefficients = {
    aluminum: 23.1e-6,
    steel: 13.0e-6,
    copper: 17.0e-6,
    glass: 8.5e-6,
    concrete: 12.0e-6,
    wood: 5.0e-6
  };

  // Length conversion to meters
  const lengthConversion = {
    m: 1,
    cm: 0.01,
    mm: 0.001,
    in: 0.0254,
    ft: 0.3048
  };

  // Display names
  const lengthDisplayNames = {
    m: 'm',
    cm: 'cm',
    mm: 'mm',
    in: 'in',
    ft: 'ft'
  };

  const calculateExpansion = () => {
    if (!length || !tempChange || isNaN(length) || isNaN(tempChange)) return null;

    const lengthInMeters = length * lengthConversion[lengthUnit];
    const coefficient = materialCoefficients[material];
    
    // Linear expansion: ΔL = L₀ × α × ΔT
    const linearExpansion = lengthInMeters * coefficient * tempChange;
    
    // Area expansion (approximate for small changes): γ ≈ 2α
    const areaExpansionCoefficient = 2 * coefficient;
    const areaExpansion = lengthInMeters * lengthInMeters * areaExpansionCoefficient * tempChange;
    
    // Volume expansion (approximate for small changes): β ≈ 3α
    const volumeExpansionCoefficient = 3 * coefficient;
    const volumeExpansion = lengthInMeters ** 3 * volumeExpansionCoefficient * tempChange;

    return { linearExpansion, areaExpansion, volumeExpansion };
  };

  const results = calculateExpansion();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Thermal Expansion Calculator
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Length
              </label>
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder="Enter length"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={lengthUnit}
                onChange={(e) => setLengthUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(lengthConversion).map((u) => (
                  <option key={u} value={u}>{lengthDisplayNames[u]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature Change
              </label>
              <input
                type="number"
                value={tempChange}
                onChange={(e) => setTempChange(e.target.value)}
                placeholder="Enter ΔT"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={tempUnit}
                onChange={(e) => setTempUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="C">°C</option>
                <option value="K">K</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material
              </label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(materialCoefficients).map((m) => (
                  <option key={m} value={m}>
                    {m.charAt(0).toUpperCase() + m.slice(1)} (α = {materialCoefficients[m].toExponential(1)} /K)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Section */}
          {results && (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Linear Expansion:</h2>
                <p>m: {results.linearExpansion.toExponential(4)}</p>
                <p>mm: {(results.linearExpansion * 1000).toExponential(4)}</p>
                <p>in: {(results.linearExpansion / 0.0254).toExponential(4)}</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Area Expansion:</h2>
                <p>m²: {results.areaExpansion.toExponential(4)}</p>
                <p>cm²: {(results.areaExpansion * 1e4).toExponential(4)}</p>
                <p>in²: {(results.areaExpansion / 6.4516e-4).toExponential(4)}</p>
              </div>

              <div className="p-4 bg-green-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Volume Expansion:</h2>
                <p>m³: {results.volumeExpansion.toExponential(4)}</p>
                <p>cm³: {(results.volumeExpansion * 1e6).toExponential(4)}</p>
                <p>in³: {(results.volumeExpansion / 1.6387e-5).toExponential(4)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Formulas & Notes</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Linear: ΔL = L₀ × α × ΔT</li>
              <li>Area: ΔA ≈ A₀ × 2α × ΔT</li>
              <li>Volume: ΔV ≈ V₀ × 3α × ΔT</li>
              <li>ΔT in °C = ΔT in K for differences</li>
              <li>Approximations valid for small expansions</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default ThermalExpansionConverter;