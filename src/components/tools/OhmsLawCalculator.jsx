'use client'
import React, { useState } from 'react';

const OhmsLawCalculator = () => {
  const [calculate, setCalculate] = useState('voltage'); // voltage, current, resistance
  const [voltage, setVoltage] = useState(''); // Volts
  const [current, setCurrent] = useState(''); // Amperes
  const [resistance, setResistance] = useState(''); // Ohms
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const calculateOhmsLaw = () => {
    setError('');
    setResult(null);

    let V, I, R;

    switch (calculate) {
      case 'voltage':
        I = parseFloat(current);
        R = parseFloat(resistance);
        if (isNaN(I) || isNaN(R) || I < 0 || R < 0) {
          setError('Please enter valid positive values for current and resistance');
          return;
        }
        V = I * R;
        setResult({ voltage: V, current: I, resistance: R });
        break;

      case 'current':
        V = parseFloat(voltage);
        R = parseFloat(resistance);
        if (isNaN(V) || isNaN(R) || V < 0 || R <= 0) {
          setError('Please enter valid positive values for voltage and resistance (R > 0)');
          return;
        }
        I = V / R;
        setResult({ voltage: V, current: I, resistance: R });
        break;

      case 'resistance':
        V = parseFloat(voltage);
        I = parseFloat(current);
        if (isNaN(V) || isNaN(I) || V < 0 || I <= 0) {
          setError('Please enter valid positive values for voltage and current (I > 0)');
          return;
        }
        R = V / I;
        setResult({ voltage: V, current: I, resistance: R });
        break;

      default:
        setError('Invalid calculation type');
        return;
    }
  };

  const formatNumber = (num, digits = 2) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  const resetInputs = () => {
    setVoltage('');
    setCurrent('');
    setResistance('');
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Ohm's Law Calculator
        </h1>

        <div className="space-y-6">
          {/* Calculate Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calculate
            </label>
            <select
              value={calculate}
              onChange={(e) => {
                setCalculate(e.target.value);
                resetInputs();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="voltage">Voltage (V)</option>
              <option value="current">Current (I)</option>
              <option value="resistance">Resistance (R)</option>
            </select>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            {calculate !== 'voltage' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Voltage (V)
                </label>
                <input
                  type="number"
                  value={voltage}
                  onChange={(e) => setVoltage(e.target.value)}
                  placeholder="Enter voltage in volts"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            {calculate !== 'current' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current (A)
                </label>
                <input
                  type="number"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  placeholder="Enter current in amperes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            {calculate !== 'resistance' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resistance (Ω)
                </label>
                <input
                  type="number"
                  value={resistance}
                  onChange={(e) => setResistance(e.target.value)}
                  placeholder="Enter resistance in ohms"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={calculateOhmsLaw}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Calculate
            </button>
            <button
              onClick={resetInputs}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Reset
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <p>Voltage: {formatNumber(result.voltage)} V</p>
              <p>Current: {formatNumber(result.current)} A</p>
              <p>Resistance: {formatNumber(result.resistance)} Ω</p>
              <p className="text-sm text-gray-600 mt-2">
                V = I × R
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
                  setCalculate('voltage');
                  setCurrent(2);
                  setResistance(5);
                  setVoltage('');
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                V = 2A × 5Ω
              </button>
              <button
                onClick={() => {
                  setCalculate('current');
                  setVoltage(10);
                  setResistance(2);
                  setCurrent('');
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                I = 10V / 2Ω
              </button>
              <button
                onClick={() => {
                  setCalculate('resistance');
                  setVoltage(12);
                  setCurrent(3);
                  setResistance('');
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                R = 12V / 3A
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Calculates electrical properties using Ohm's Law:</p>
                <p>V = I × R</p>
                <p>Where:</p>
                <ul className="list-disc list-inside">
                  <li>V = Voltage (Volts)</li>
                  <li>I = Current (Amperes)</li>
                  <li>R = Resistance (Ohms)</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OhmsLawCalculator;