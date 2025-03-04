'use client'
import React, { useState } from 'react';

const DilutionCalculator = () => {
  const [initialConcentration, setInitialConcentration] = useState('');
  const [initialVolume, setInitialVolume] = useState('');
  const [finalConcentration, setFinalConcentration] = useState('');
  const [finalVolume, setFinalVolume] = useState('');
  const [concUnit, setConcUnit] = useState('M'); // Molarity (M), mM, μM
  const [volUnit, setVolUnit] = useState('L'); // Liters (L), mL
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Unit conversion factors to base units (M for concentration, L for volume)
  const concUnits = {
    M: 1,
    mM: 1e-3,
    μM: 1e-6,
  };

  const volUnits = {
    L: 1,
    mL: 1e-3,
  };

  const calculateDilution = () => {
    setError('');
    setResult(null);

    const inputs = [
      initialConcentration,
      initialVolume,
      finalConcentration,
      finalVolume,
    ];

    const filledInputs = inputs.filter(v => v !== '').map(parseFloat);
    if (filledInputs.length < 3) {
      setError('Please provide at least 3 values to calculate the fourth');
      return;
    }

    if (filledInputs.some(v => isNaN(v) || v <= 0)) {
      setError('All values must be positive numbers');
      return;
    }

    try {
      // Convert to base units
      const c1 = initialConcentration ? parseFloat(initialConcentration) * concUnits[concUnit] : null;
      const v1 = initialVolume ? parseFloat(initialVolume) * volUnits[volUnit] : null;
      const c2 = finalConcentration ? parseFloat(finalConcentration) * concUnits[concUnit] : null;
      const v2 = finalVolume ? parseFloat(finalVolume) * volUnits[volUnit] : null;

      let calculatedValue, description;

      // C₁V₁ = C₂V₂
      if (!initialConcentration) {
        calculatedValue = (c2 * v2) / v1;
        description = 'Initial Concentration (C₁)';
      } else if (!initialVolume) {
        calculatedValue = (c2 * v2) / c1;
        description = 'Initial Volume (V₁)';
      } else if (!finalConcentration) {
        calculatedValue = (c1 * v1) / v2;
        description = 'Final Concentration (C₂)';
      } else {
        calculatedValue = (c1 * v1) / c2;
        description = 'Final Volume (V₂)';
      }

      // Convert result back to chosen units
      const resultInChosenUnits = 
        description.includes('Concentration') 
          ? calculatedValue / concUnits[concUnit]
          : calculatedValue / volUnits[volUnit];

      setResult({
        value: resultInChosenUnits,
        description,
        dilutionFactor: c1 && c2 ? c1 / c2 : null,
      });
    } catch (err) {
      setError('Calculation error: ' + err.message);
    }
  };

  const formatNumber = (num, digits = 4) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Dilution Calculator
        </h1>

        <div className="space-y-6">
          {/* Concentration Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Concentration Unit
            </label>
            <select
              value={concUnit}
              onChange={(e) => setConcUnit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="M">M (Molarity)</option>
              <option value="mM">mM (Millimolar)</option>
              <option value="μM">μM (Micromolar)</option>
            </select>
          </div>

          {/* Volume Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Volume Unit
            </label>
            <select
              value={volUnit}
              onChange={(e) => setVolUnit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="L">L (Liters)</option>
              <option value="mL">mL (Milliliters)</option>
            </select>
          </div>

          {/* Inputs */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Concentration (C₁)
              </label>
              <input
                type="number"
                value={initialConcentration}
                onChange={(e) => setInitialConcentration(e.target.value)}
                placeholder={`e.g., 1 (${concUnit})`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Volume (V₁)
              </label>
              <input
                type="number"
                value={initialVolume}
                onChange={(e) => setInitialVolume(e.target.value)}
                placeholder={`e.g., 100 (${volUnit})`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Final Concentration (C₂)
              </label>
              <input
                type="number"
                value={finalConcentration}
                onChange={(e) => setFinalConcentration(e.target.value)}
                placeholder={`e.g., 0.1 (${concUnit})`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Final Volume (V₂)
              </label>
              <input
                type="number"
                value={finalVolume}
                onChange={(e) => setFinalVolume(e.target.value)}
                placeholder={`e.g., 1000 (${volUnit})`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateDilution}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Result:</h2>
              <p>
                {result.description}: {formatNumber(result.value)} {result.description.includes('Concentration') ? concUnit : volUnit}
              </p>
              {result.dilutionFactor && (
                <p>Dilution Factor: {formatNumber(result.dilutionFactor)}x</p>
              )}
              <p className="text-sm text-gray-600 mt-2">
                To dilute: Add {result.description === 'Final Volume (V₂)' ? formatNumber(result.value - (initialVolume || 0)) : 'calculated'} {volUnit} of solvent
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
                  setInitialConcentration('1');
                  setInitialVolume('10');
                  setFinalConcentration('0.1');
                  setFinalVolume('');
                  setConcUnit('M');
                  setVolUnit('mL');
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                1M to 0.1M
              </button>
              <button
                onClick={() => {
                  setInitialConcentration('100');
                  setInitialVolume('');
                  setFinalConcentration('10');
                  setFinalVolume('100');
                  setConcUnit('mM');
                  setVolUnit('mL');
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                100mM to 10mM
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Calculates dilution parameters using:</p>
                <p>C₁V₁ = C₂V₂</p>
                <p>Where:</p>
                <ul className="list-disc list-inside">
                  <li>C₁, C₂: Initial and final concentrations</li>
                  <li>V₁, V₂: Initial and final volumes</li>
                </ul>
                <p>Leave one field blank to calculate it.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DilutionCalculator;