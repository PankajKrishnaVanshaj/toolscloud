'use client'
import React, { useState } from 'react';

const PHCalculator = () => {
  const [inputType, setInputType] = useState('pH'); // pH, pOH, H+, OH-
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Constants
  const Kw = 1e-14; // Water dissociation constant at 25°C

  const calculatePH = () => {
    setError('');
    setResult(null);

    if (!inputValue || isNaN(inputValue)) {
      setError('Please enter a valid number');
      return;
    }

    const value = parseFloat(inputValue);
    let pH, pOH, hCon, ohCon;

    try {
      switch (inputType) {
        case 'pH':
          if (value < 0 || value > 14) {
            setError('pH should be between 0 and 14');
            return;
          }
          pH = value;
          hCon = Math.pow(10, -pH);
          pOH = 14 - pH;
          ohCon = Math.pow(10, -pOH);
          break;

        case 'pOH':
          if (value < 0 || value > 14) {
            setError('pOH should be between 0 and 14');
            return;
          }
          pOH = value;
          ohCon = Math.pow(10, -pOH);
          pH = 14 - pOH;
          hCon = Math.pow(10, -pH);
          break;

        case 'H+':
          if (value <= 0 || value > 1) {
            setError('[H⁺] should be between 0 and 1 mol/L');
            return;
          }
          hCon = value;
          pH = -Math.log10(hCon);
          pOH = 14 - pH;
          ohCon = Math.pow(10, -pOH);
          break;

        case 'OH-':
          if (value <= 0 || value > 1) {
            setError('[OH⁻] should be between 0 and 1 mol/L');
            return;
          }
          ohCon = value;
          pOH = -Math.log10(ohCon);
          pH = 14 - pOH;
          hCon = Math.pow(10, -pH);
          break;

        default:
          throw new Error('Invalid input type');
      }

      setResult({
        pH,
        pOH,
        hCon,
        ohCon,
      });
    } catch (err) {
      setError('Calculation error: ' + err.message);
    }
  };

  const formatNumber = (num, isConcentration = false) => {
    if (isConcentration && (num < 1e-6 || num > 1e6)) {
      return num.toExponential(2);
    }
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          pH Calculator
        </h1>

        <div className="space-y-6">
          {/* Input Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Input Type
            </label>
            <select
              value={inputType}
              onChange={(e) => {
                setInputType(e.target.value);
                setInputValue('');
                setResult(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pH">pH</option>
              <option value="pOH">pOH</option>
              <option value="H+">[H⁺] (mol/L)</option>
              <option value="OH-">[OH⁻] (mol/L)</option>
            </select>
          </div>

          {/* Input Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Value
            </label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Enter ${inputType}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {inputType === 'pH' || inputType === 'pOH' ? 'Range: 0-14' : 'Range: >0, ≤1'}
            </p>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculatePH}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <p>pH: {formatNumber(result.pH)}</p>
              <p>pOH: {formatNumber(result.pOH)}</p>
              <p>[H⁺]: {formatNumber(result.hCon, true)} mol/L</p>
              <p>[OH⁻]: {formatNumber(result.ohCon, true)} mol/L</p>
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
                  setInputType('pH');
                  setInputValue(7);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Neutral (pH 7)
              </button>
              <button
                onClick={() => {
                  setInputType('pH');
                  setInputValue(2);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Acidic (pH 2)
              </button>
              <button
                onClick={() => {
                  setInputType('pOH');
                  setInputValue(3);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Basic (pOH 3)
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Calculates pH-related properties using:</p>
                <ul className="list-disc list-inside">
                  <li>pH = -log₁₀[H⁺]</li>
                  <li>pOH = -log₁₀[OH⁻]</li>
                  <li>pH + pOH = 14 (at 25°C)</li>
                  <li>Kw = [H⁺][OH⁻] = 10⁻¹⁴</li>
                </ul>
                <p>Assumes standard conditions (25°C).</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PHCalculator;