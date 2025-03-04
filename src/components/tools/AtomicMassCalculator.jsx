'use client'
import React, { useState } from 'react';

// Simplified periodic table data (atomic masses in u)
const periodicTable = {
  H: { mass: 1.00794, isotopes: { 'H-1': 1.007825, 'H-2': 2.014102 } },
  He: { mass: 4.002602, isotopes: { 'He-4': 4.002602 } },
  C: { mass: 12.0107, isotopes: { 'C-12': 12.0, 'C-13': 13.003355 } },
  N: { mass: 14.0067, isotopes: { 'N-14': 14.003074, 'N-15': 15.000109 } },
  O: { mass: 15.9994, isotopes: { 'O-16': 15.994915, 'O-18': 17.999160 } },
  // Add more elements as needed
};

const AtomicMassCalculator = () => {
  const [formula, setFormula] = useState('');
  const [isotopes, setIsotopes] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const parseFormula = (input) => {
    const regex = /([A-Z][a-z]?)(\d*)/g;
    const elements = {};
    let match;

    while ((match = regex.exec(input)) !== null) {
      const element = match[1];
      const count = match[2] ? parseInt(match[2]) : 1;
      if (!periodicTable[element]) {
        throw new Error(`Unknown element: ${element}`);
      }
      elements[element] = (elements[element] || 0) + count;
    }

    return elements;
  };

  const calculateMass = () => {
    setError('');
    setResult(null);

    if (!formula.trim()) {
      setError('Please enter a chemical formula');
      return;
    }

    try {
      const elements = parseFormula(formula);
      let totalMass = 0;
      const breakdown = {};

      Object.entries(elements).forEach(([element, count]) => {
        let mass;
        if (isotopes[element]) {
          const isotope = isotopes[element];
          if (!periodicTable[element].isotopes[isotope]) {
            throw new Error(`Unknown isotope: ${isotope}`);
          }
          mass = periodicTable[element].isotopes[isotope];
        } else {
          mass = periodicTable[element].mass;
        }
        const elementMass = mass * count;
        totalMass += elementMass;
        breakdown[element] = { count, mass: elementMass, unitMass: mass };
      });

      setResult({
        totalMass,
        breakdown,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleIsotopeChange = (element, value) => {
    setIsotopes(prev => ({
      ...prev,
      [element]: value || undefined,
    }));
  };

  const formatNumber = (num, digits = 4) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Atomic Mass Calculator
        </h1>

        <div className="space-y-6">
          {/* Formula Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chemical Formula
            </label>
            <input
              type="text"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              placeholder="e.g., H2O, CO2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Use standard notation (e.g., H2O for water)</p>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateMass}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate Atomic Mass
          </button>

          {/* Result */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md space-y-2">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <p>Total Atomic Mass: {formatNumber(result.totalMass)} u</p>
              <h3 className="font-medium mt-2">Breakdown:</h3>
              <ul className="list-disc list-inside">
                {Object.entries(result.breakdown).map(([element, data]) => (
                  <li key={element}>
                    {element}: {data.count} × {formatNumber(data.unitMass)} u = {formatNumber(data.mass)} u
                    <select
                      value={isotopes[element] || ''}
                      onChange={(e) => handleIsotopeChange(element, e.target.value)}
                      className="ml-2 px-1 py-0.5 border rounded text-sm"
                    >
                      <option value="">Average</option>
                      {Object.keys(periodicTable[element].isotopes).map(iso => (
                        <option key={iso} value={iso}>{iso}</option>
                      ))}
                    </select>
                  </li>
                ))}
              </ul>
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
                <p>Calculates the atomic mass of molecules based on elemental composition.</p>
                <p>Features:</p>
                <ul className="list-disc list-inside">
                  <li>Supports basic chemical formulas</li>
                  <li>Isotope-specific calculations</li>
                  <li>Detailed breakdown of contributions</li>
                </ul>
                <p>Atomic masses are in unified atomic mass units (u).</p>
                <p>Note: Limited periodic table data included. Expand `periodicTable` for more elements.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtomicMassCalculator;