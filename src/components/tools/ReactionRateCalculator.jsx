'use client'
import React, { useState } from 'react';

const ReactionRateCalculator = () => {
  const [reactionType, setReactionType] = useState('rate'); // rate, constant
  const [order, setOrder] = useState(0); // 0, 1, 2 (reaction order)
  const [initialConc, setInitialConc] = useState(''); // mol/L
  const [finalConc, setFinalConc] = useState(''); // mol/L
  const [time, setTime] = useState(''); // seconds
  const [temperature, setTemperature] = useState(''); // Kelvin
  const [activationEnergy, setActivationEnergy] = useState(''); // kJ/mol
  const [preExpFactor, setPreExpFactor] = useState(''); // Pre-exponential factor (A)
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Constants
  const R = 8.314; // Gas constant (J/(mol·K))

  const calculateRate = () => {
    setError('');
    setResult(null);

    const c0 = parseFloat(initialConc);
    const cf = parseFloat(finalConc);
    const t = parseFloat(time);

    if (isNaN(c0) || isNaN(cf) || isNaN(t) || t <= 0) {
      setError('Please enter valid concentration and time values (time > 0)');
      return;
    }

    try {
      let rate, rateConstant;

      switch (order) {
        case 0:
          // Rate = k, k = -Δ[A]/Δt
          rate = (c0 - cf) / t;
          rateConstant = rate;
          break;
        case 1:
          // Rate = k[A], k = (1/t) * ln([A]₀/[A])
          rateConstant = (1 / t) * Math.log(c0 / cf);
          rate = rateConstant * cf; // Rate at final concentration
          break;
        case 2:
          // Rate = k[A]², k = (1/t) * (1/[A] - 1/[A]₀)
          rateConstant = (1 / t) * ((1 / cf) - (1 / c0));
          rate = rateConstant * cf * cf; // Rate at final concentration
          break;
        default:
          throw new Error('Unsupported reaction order');
      }

      setResult({
        rate: rate > 0 ? rate : 0, // Avoid negative rates due to input error
        rateConstant: rateConstant > 0 ? rateConstant : 0,
        order,
      });
    } catch (err) {
      setError('Calculation error: ' + err.message);
    }
  };

  const calculateRateConstant = () => {
    setError('');
    setResult(null);

    const T = parseFloat(temperature);
    const Ea = parseFloat(activationEnergy) * 1000; // Convert kJ/mol to J/mol
    const A = parseFloat(preExpFactor);

    if (isNaN(T) || isNaN(Ea) || isNaN(A) || T <= 0 || A <= 0) {
      setError('Please enter valid temperature, activation energy, and pre-exponential factor');
      return;
    }

    try {
      // Arrhenius equation: k = A * e^(-Ea/(RT))
      const k = A * Math.exp(-Ea / (R * T));
      setResult({
        rateConstant: k,
        temperature: T,
        activationEnergy: Ea / 1000, // Back to kJ/mol
        preExpFactor: A,
      });
    } catch (err) {
      setError('Calculation error: ' + err.message);
    }
  };

  const handleCalculate = () => {
    if (reactionType === 'rate') {
      calculateRate();
    } else {
      calculateRateConstant();
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
          Reaction Rate Calculator
        </h1>

        <div className="space-y-6">
          {/* Calculation Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calculation Type
            </label>
            <select
              value={reactionType}
              onChange={(e) => {
                setReactionType(e.target.value);
                setResult(null);
                setInitialConc('');
                setFinalConc('');
                setTime('');
                setTemperature('');
                setActivationEnergy('');
                setPreExpFactor('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="rate">Reaction Rate</option>
              <option value="constant">Rate Constant (Arrhenius)</option>
            </select>
          </div>

          {/* Inputs */}
          {reactionType === 'rate' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reaction Order
                </label>
                <select
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Zero Order</option>
                  <option value={1}>First Order</option>
                  <option value={2}>Second Order</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Concentration (mol/L)
                </label>
                <input
                  type="number"
                  value={initialConc}
                  onChange={(e) => setInitialConc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Final Concentration (mol/L)
                </label>
                <input
                  type="number"
                  value={finalConc}
                  onChange={(e) => setFinalConc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time (seconds)
                </label>
                <input
                  type="number"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature (K)
                </label>
                <input
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activation Energy (kJ/mol)
                </label>
                <input
                  type="number"
                  value={activationEnergy}
                  onChange={(e) => setActivationEnergy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pre-exponential Factor (A)
                </label>
                <input
                  type="number"
                  value={preExpFactor}
                  onChange={(e) => setPreExpFactor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              {reactionType === 'rate' ? (
                <>
                  <p>Rate: {formatNumber(result.rate)} mol/(L·s)</p>
                  <p>Rate Constant (k): {formatNumber(result.rateConstant)} {order === 0 ? 'mol/(L·s)' : order === 1 ? 's⁻¹' : 'L/(mol·s)'}</p>
                  <p>Order: {result.order}</p>
                </>
              ) : (
                <>
                  <p>Rate Constant (k): {formatNumber(result.rateConstant)} s⁻¹</p>
                  <p>Temperature: {formatNumber(result.temperature)} K</p>
                  <p>Activation Energy: {formatNumber(result.activationEnergy)} kJ/mol</p>
                  <p>Pre-exponential Factor: {formatNumber(result.preExpFactor)} s⁻¹</p>
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
                <p>Calculates reaction rates and constants:</p>
                <ul className="list-disc list-inside">
                  <li>Zero Order: Rate = k</li>
                  <li>First Order: Rate = k[A]</li>
                  <li>Second Order: Rate = k[A]²</li>
                  <li>Arrhenius: k = A * e^(-Ea/(RT))</li>
                </ul>
                <p>Assumes simple unimolecular or bimolecular reactions.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReactionRateCalculator;