'use client'
import React, { useState } from 'react';

const HalfLifeCalculator = () => {
  const [mode, setMode] = useState('halfLife'); // halfLife, decayConstant, remaining, time
  const [halfLife, setHalfLife] = useState(''); // in seconds
  const [decayConstant, setDecayConstant] = useState(''); // in 1/seconds
  const [initialAmount, setInitialAmount] = useState(''); // in arbitrary units (e.g., grams)
  const [time, setTime] = useState(''); // in seconds
  const [finalAmount, setFinalAmount] = useState(''); // in same units as initial
  const [unit, setUnit] = useState('s'); // s, min, h, d, y
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Unit conversion factors to seconds
  const timeUnits = {
    s: 1,
    min: 60,
    h: 3600,
    d: 86400,
    y: 31557600, // 365.25 days
  };

  const calculate = () => {
    setError('');
    setResult(null);

    const toSeconds = (value) => parseFloat(value) * timeUnits[unit];
    const fromSeconds = (value) => value / timeUnits[unit];

    try {
      if (mode === 'halfLife') {
        // Calculate half-life from decay constant
        if (!decayConstant || isNaN(decayConstant) || decayConstant <= 0) {
          throw new Error('Please enter a valid decay constant');
        }
        const lambda = parseFloat(decayConstant) / timeUnits[unit]; // Convert to s^-1
        const t12 = Math.log(2) / lambda;
        setResult({
          halfLife: fromSeconds(t12),
          decayConstant: lambda * timeUnits[unit],
        });
      } else if (mode === 'decayConstant') {
        // Calculate decay constant from half-life
        if (!halfLife || isNaN(halfLife) || halfLife <= 0) {
          throw new Error('Please enter a valid half-life');
        }
        const t12 = toSeconds(halfLife);
        const lambda = Math.log(2) / t12;
        setResult({
          halfLife: fromSeconds(t12),
          decayConstant: lambda * timeUnits[unit],
        });
      } else if (mode === 'remaining') {
        // Calculate remaining amount after time
        if (!halfLife || !initialAmount || !time || isNaN(halfLife) || isNaN(initialAmount) || isNaN(time) || halfLife <= 0 || initialAmount <= 0 || time < 0) {
          throw new Error('Please enter valid half-life, initial amount, and time');
        }
        const t12 = toSeconds(halfLife);
        const t = toSeconds(time);
        const N0 = parseFloat(initialAmount);
        const lambda = Math.log(2) / t12;
        const N = N0 * Math.exp(-lambda * t);
        setResult({
          remaining: N,
          halfLife: fromSeconds(t12),
          time: fromSeconds(t),
          initialAmount: N0,
        });
      } else if (mode === 'time') {
        // Calculate time to reach final amount
        if (!halfLife || !initialAmount || !finalAmount || isNaN(halfLife) || isNaN(initialAmount) || isNaN(finalAmount) || halfLife <= 0 || initialAmount <= 0 || finalAmount <= 0 || finalAmount > initialAmount) {
          throw new Error('Please enter valid half-life, initial amount, and final amount (final ≤ initial)');
        }
        const t12 = toSeconds(halfLife);
        const N0 = parseFloat(initialAmount);
        const N = parseFloat(finalAmount);
        const lambda = Math.log(2) / t12;
        const t = -Math.log(N / N0) / lambda;
        setResult({
          time: fromSeconds(t),
          halfLife: fromSeconds(t12),
          initialAmount: N0,
          finalAmount: N,
        });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const formatNumber = (num, digits = 4) => {
    if (num < 1e-6 || num > 1e6) {
      return num.toExponential(digits);
    }
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Half-Life Calculator
        </h1>

        <div className="space-y-6">
          {/* Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calculation Mode
            </label>
            <select
              value={mode}
              onChange={(e) => {
                setMode(e.target.value);
                setResult(null);
                setHalfLife('');
                setDecayConstant('');
                setInitialAmount('');
                setTime('');
                setFinalAmount('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="halfLife">Half-Life from Decay Constant</option>
              <option value="decayConstant">Decay Constant from Half-Life</option>
              <option value="remaining">Remaining Amount</option>
              <option value="time">Time to Reach Amount</option>
            </select>
          </div>

          {/* Unit Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="s">Seconds</option>
              <option value="min">Minutes</option>
              <option value="h">Hours</option>
              <option value="d">Days</option>
              <option value="y">Years</option>
            </select>
          </div>

          {/* Inputs */}
          {mode === 'halfLife' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decay Constant (1/{unit})
              </label>
              <input
                type="number"
                value={decayConstant}
                onChange={(e) => setDecayConstant(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          {mode === 'decayConstant' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Half-Life ({unit})
              </label>
              <input
                type="number"
                value={halfLife}
                onChange={(e) => setHalfLife(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          {mode === 'remaining' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Half-Life ({unit})
                </label>
                <input
                  type="number"
                  value={halfLife}
                  onChange={(e) => setHalfLife(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Amount
                </label>
                <input
                  type="number"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time ({unit})
                </label>
                <input
                  type="number"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
          {mode === 'time' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Half-Life ({unit})
                </label>
                <input
                  type="number"
                  value={halfLife}
                  onChange={(e) => setHalfLife(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Amount
                </label>
                <input
                  type="number"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Final Amount
                </label>
                <input
                  type="number"
                  value={finalAmount}
                  onChange={(e) => setFinalAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* Calculate Button */}
          <button
            onClick={calculate}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              {mode === 'halfLife' && (
                <>
                  <p>Half-Life: {formatNumber(result.halfLife)} {unit}</p>
                  <p>Decay Constant: {formatNumber(result.decayConstant)} 1/{unit}</p>
                </>
              )}
              {mode === 'decayConstant' && (
                <>
                  <p>Half-Life: {formatNumber(result.halfLife)} {unit}</p>
                  <p>Decay Constant: {formatNumber(result.decayConstant)} 1/{unit}</p>
                </>
              )}
              {mode === 'remaining' && (
                <>
                  <p>Remaining Amount: {formatNumber(result.remaining)}</p>
                  <p>Initial Amount: {formatNumber(result.initialAmount)}</p>
                  <p>Time: {formatNumber(result.time)} {unit}</p>
                  <p>Half-Life: {formatNumber(result.halfLife)} {unit}</p>
                </>
              )}
              {mode === 'time' && (
                <>
                  <p>Time: {formatNumber(result.time)} {unit}</p>
                  <p>Initial Amount: {formatNumber(result.initialAmount)}</p>
                  <p>Final Amount: {formatNumber(result.finalAmount)}</p>
                  <p>Half-Life: {formatNumber(result.halfLife)} {unit}</p>
                </>
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
                <p>Calculates radioactive decay properties:</p>
                <ul className="list-disc list-inside">
                  <li>t₁/₂ = ln(2)/λ (half-life from decay constant)</li>
                  <li>λ = ln(2)/t₁/₂ (decay constant from half-life)</li>
                  <li>N = N₀e^(-λt) (remaining amount)</li>
                  <li>t = -ln(N/N₀)/λ (time to reach amount)</li>
                </ul>
                <p>Supports various time units.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HalfLifeCalculator;