'use client'
import React, { useState } from 'react';

const EntropyCalculator = () => {
  const [type, setType] = useState('shannon'); // shannon or thermodynamic
  const [probabilities, setProbabilities] = useState(''); // For Shannon entropy
  const [temperature, setTemperature] = useState(''); // Kelvin
  const [particles, setParticles] = useState(''); // Number of particles
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Constants
  const k = 1.380649e-23; // Boltzmann constant (J/K)

  // Preset examples
  const presets = [
    { name: 'Coin Flip', type: 'shannon', probs: '0.5, 0.5' },
    { name: '6-sided Die', type: 'shannon', probs: '0.1667, 0.1667, 0.1667, 0.1667, 0.1667, 0.1667' },
    { name: 'Gas at 300K', type: 'thermodynamic', temp: 300, particles: '6.022e23' },
  ];

  const calculateEntropy = () => {
    setError('');
    setResult(null);

    if (type === 'shannon') {
      calculateShannonEntropy();
    } else {
      calculateThermodynamicEntropy();
    }
  };

  const calculateShannonEntropy = () => {
    if (!probabilities.trim()) {
      setError('Please enter probabilities');
      return;
    }

    try {
      const probs = probabilities.split(',').map(p => parseFloat(p.trim()));
      
      // Validate probabilities
      if (probs.some(p => isNaN(p) || p < 0 || p > 1)) {
        setError('Probabilities must be numbers between 0 and 1');
        return;
      }
      
      const sum = probs.reduce((a, b) => a + b, 0);
      if (Math.abs(sum - 1) > 0.01) {
        setError('Probabilities must sum to approximately 1');
        return;
      }

      // Shannon entropy: H = -∑(p * log₂(p))
      const entropy = -probs
        .filter(p => p > 0) // Avoid log(0)
        .reduce((sum, p) => sum + p * Math.log2(p), 0);

      setResult({
        shannon: entropy,
        unit: 'bits'
      });
    } catch (err) {
      setError('Error calculating Shannon entropy: ' + err.message);
    }
  };

  const calculateThermodynamicEntropy = () => {
    if (!temperature || !particles || isNaN(temperature) || isNaN(particles)) {
      setError('Please enter valid temperature and particle count');
      return;
    }

    const T = parseFloat(temperature);
    const N = parseFloat(particles);

    if (T <= 0 || N <= 0) {
      setError('Temperature and particle count must be positive');
      return;
    }

    try {
      // Simplified thermodynamic entropy for ideal gas
      // S = Nk[ln(V/Nλ³) + 5/2] where λ is thermal de Broglie wavelength
      // For simplicity, assuming standard conditions and approximating
      const volume = 0.0224; // m³ (approximate volume for 1 mole at STP)
      const mass = 2.016e-27; // kg (hydrogen molecule mass as example)
      const h = 6.62607015e-34; // Planck constant (J·s)
      
      const lambda = h / Math.sqrt(2 * Math.PI * mass * k * T); // Thermal wavelength
      const term = volume / (N * Math.pow(lambda, 3));
      
      if (term <= 0) {
        setError('Invalid calculation parameters');
        return;
      }

      const entropy = N * k * (Math.log(term) + 5/2);

      setResult({
        thermodynamic: entropy,
        unit: 'J/K'
      });
    } catch (err) {
      setError('Error calculating thermodynamic entropy: ' + err.message);
    }
  };

  const formatNumber = (num, digits = 4) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Entropy Calculator
        </h1>

        <div className="space-y-6">
          {/* Entropy Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entropy Type
            </label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setProbabilities('');
                setTemperature('');
                setParticles('');
                setResult(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="shannon">Shannon (Information)</option>
              <option value="thermodynamic">Thermodynamic (Physical)</option>
            </select>
          </div>

          {/* Inputs based on type */}
          {type === 'shannon' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Probabilities (comma-separated)
              </label>
              <input
                type="text"
                value={probabilities}
                onChange={(e) => setProbabilities(e.target.value)}
                placeholder="e.g., 0.5, 0.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Must sum to ~1</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature (Kelvin)
                </label>
                <input
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="e.g., 300"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Particles
                </label>
                <input
                  type="number"
                  value={particles}
                  onChange={(e) => setParticles(e.target.value)}
                  placeholder="e.g., 6.022e23"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Presets
            </label>
            <div className="flex gap-2 flex-wrap">
              {presets.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setType(preset.type);
                    if (preset.type === 'shannon') {
                      setProbabilities(preset.probs);
                      setTemperature('');
                      setParticles('');
                    } else {
                      setTemperature(preset.temp);
                      setParticles(preset.particles);
                      setProbabilities('');
                    }
                  }}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateEntropy}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate Entropy
          </button>

          {/* Result */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Entropy:</h2>
              <p>
                {type === 'shannon' 
                  ? `${formatNumber(result.shannon)} ${result.unit}`
                  : `${formatNumber(result.thermodynamic)} ${result.unit}`}
              </p>
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
                <p>Calculates different types of entropy:</p>
                <ul className="list-disc list-inside">
                  <li>Shannon: H = -∑(p * log₂(p)) in bits</li>
                  <li>Thermodynamic: S = Nk[ln(V/Nλ³) + 5/2] in J/K</li>
                </ul>
                <p>Note: Thermodynamic calculation uses simplified ideal gas assumptions with hydrogen molecules.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntropyCalculator;