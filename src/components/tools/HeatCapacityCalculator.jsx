'use client'
import React, { useState } from 'react';

const HeatCapacityCalculator = () => {
  const [material, setMaterial] = useState('custom');
  const [specificHeat, setSpecificHeat] = useState(''); // J/(kg·K)
  const [mass, setMass] = useState(''); // kg
  const [massUnit, setMassUnit] = useState('kg');
  const [tempChange, setTempChange] = useState(''); // K or °C
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Specific heat capacities in J/(kg·K)
  const materials = {
    water: 4186,
    aluminum: 897,
    copper: 385,
    iron: 450,
    air: 1005,
    custom: null,
  };

  // Unit conversions
  const massConversions = {
    kg: 1,
    g: 0.001,
    mg: 0.000001,
  };

  const calculateHeatCapacity = () => {
    setError('');
    setResult(null);

    // Validation
    if ((material === 'custom' && (!specificHeat || isNaN(specificHeat))) ||
        !mass || isNaN(mass) || !tempChange || isNaN(tempChange)) {
      setError('Please enter valid numeric values for all fields');
      return;
    }

    try {
      let c = material === 'custom' ? parseFloat(specificHeat) : materials[material];
      const m = parseFloat(mass) * massConversions[massUnit];
      const dT = parseFloat(tempChange);

      if (c <= 0 || m <= 0) {
        setError('Specific heat and mass must be positive');
        return;
      }

      // Heat capacity C = m * c
      const heatCapacity = m * c;
      
      // Heat transfer Q = m * c * ΔT
      const heatTransfer = heatCapacity * dT;

      setResult({
        heatCapacity,
        heatTransfer,
        specificHeat: c,
        massInKg: m,
      });
    } catch (err) {
      setError('Calculation error: ' + err.message);
    }
  };

  const formatNumber = (num, digits = 2) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  const handleMaterialChange = (value) => {
    setMaterial(value);
    if (value !== 'custom') {
      setSpecificHeat('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Heat Capacity Calculator
        </h1>

        <div className="space-y-6">
          {/* Material Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Material
            </label>
            <select
              value={material}
              onChange={(e) => handleMaterialChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(materials).map(mat => (
                <option key={mat} value={mat}>
                  {mat.charAt(0).toUpperCase() + mat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Specific Heat */}
          {material === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specific Heat (J/(kg·K))
              </label>
              <input
                type="number"
                value={specificHeat}
                onChange={(e) => setSpecificHeat(e.target.value)}
                placeholder="e.g., 4186"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Mass Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mass
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={mass}
                onChange={(e) => setMass(e.target.value)}
                placeholder="e.g., 1"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={massUnit}
                onChange={(e) => setMassUnit(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="mg">mg</option>
              </select>
            </div>
          </div>

          {/* Temperature Change */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperature Change (ΔT in K or °C)
            </label>
            <input
              type="number"
              value={tempChange}
              onChange={(e) => setTempChange(e.target.value)}
              placeholder="e.g., 10"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateHeatCapacity}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md space-y-2">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <p>Specific Heat: {formatNumber(result.specificHeat)} J/(kg·K)</p>
              <p>Mass: {formatNumber(result.massInKg)} kg</p>
              <p>Heat Capacity: {formatNumber(result.heatCapacity)} J/K</p>
              <p>Heat Transfer: {formatNumber(result.heatTransfer)} J</p>
              {result.heatTransfer > 0 ? (
                <p className="text-sm text-gray-600">Heat absorbed</p>
              ) : (
                <p className="text-sm text-gray-600">Heat released</p>
              )}
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
                <p>Calculates heat capacity and heat transfer.</p>
                <p>Formulas:</p>
                <ul className="list-disc list-inside">
                  <li>Heat Capacity (C) = m * c</li>
                  <li>Heat Transfer (Q) = m * c * ΔT</li>
                </ul>
                <p>Where:</p>
                <ul className="list-disc list-inside">
                  <li>m = mass</li>
                  <li>c = specific heat capacity</li>
                  <li>ΔT = temperature change</li>
                </ul>
                <p>Note: ΔT can be in K or °C (relative scale).</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatCapacityCalculator;