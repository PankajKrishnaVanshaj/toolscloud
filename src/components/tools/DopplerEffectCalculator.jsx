'use client'
import React, { useState } from 'react';

const DopplerEffectCalculator = () => {
  const [waveType, setWaveType] = useState('sound'); // sound or light
  const [sourceFreq, setSourceFreq] = useState(''); // Hz
  const [sourceVel, setSourceVel] = useState(''); // m/s
  const [observerVel, setObserverVel] = useState(''); // m/s
  const [mediumVel, setMediumVel] = useState(343); // m/s (speed of sound in air by default)
  const [direction, setDirection] = useState('towards'); // towards or away
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Constants
  const c = 299792458; // Speed of light in m/s

  // Preset examples
  const presets = [
    { name: 'Car Horn', type: 'sound', freq: 440, sVel: 20, oVel: 0, mVel: 343 },
    { name: 'Train', type: 'sound', freq: 300, sVel: 30, oVel: 0, mVel: 343 },
    { name: 'Redshift', type: 'light', freq: 5e14, sVel: 1e6, oVel: 0 },
  ];

  const calculateDopplerEffect = () => {
    setError('');
    setResult(null);

    if (!sourceFreq || isNaN(sourceFreq) || sourceFreq <= 0) {
      setError('Please enter a valid source frequency');
      return;
    }

    const f0 = parseFloat(sourceFreq);
    const vs = parseFloat(sourceVel) || 0;
    const vo = parseFloat(observerVel) || 0;
    let v = parseFloat(mediumVel) || 343;

    if (waveType === 'sound' && v <= 0) {
      setError('Medium velocity must be positive for sound');
      return;
    }

    try {
      let observedFreq;
      
      if (waveType === 'sound') {
        // Sound Doppler effect: f = f0 * (v ± vo)/(v ± vs)
        const sign = direction === 'towards' ? 1 : -1;
        const numerator = v + sign * vo;
        const denominator = v - sign * vs;

        if (denominator === 0) {
          setError('Source velocity cannot equal medium velocity');
          return;
        }

        observedFreq = f0 * (numerator / denominator);
      } else {
        // Light Doppler effect (relativistic): f = f0 * sqrt((1 - v/c)/(1 + v/c))
        const relVel = (vs - vo) / c; // Relative velocity
        const sign = direction === 'towards' ? -1 : 1;
        const beta = sign * relVel;

        if (Math.abs(beta) >= 1) {
          setError('Relative velocity must be less than speed of light');
          return;
        }

        observedFreq = f0 * Math.sqrt((1 - beta) / (1 + beta));
      }

      const freqShift = observedFreq - f0;
      const wavelength = waveType === 'sound' ? v / observedFreq : c / observedFreq;

      setResult({
        observedFreq,
        freqShift,
        wavelength,
      });
    } catch (err) {
      setError('Calculation error: ' + err.message);
    }
  };

  const formatNumber = (num, digits = 2) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Doppler Effect Calculator
        </h1>

        <div className="space-y-6">
          {/* Wave Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wave Type
            </label>
            <select
              value={waveType}
              onChange={(e) => {
                setWaveType(e.target.value);
                setResult(null);
                setMediumVel(e.target.value === 'sound' ? 343 : c);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sound">Sound</option>
              <option value="light">Light</option>
            </select>
          </div>

          {/* Inputs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source Frequency (Hz)
            </label>
            <input
              type="number"
              value={sourceFreq}
              onChange={(e) => setSourceFreq(e.target.value)}
              placeholder="e.g., 440"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source Velocity (m/s)
            </label>
            <input
              type="number"
              value={sourceVel}
              onChange={(e) => setSourceVel(e.target.value)}
              placeholder="e.g., 20"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observer Velocity (m/s)
            </label>
            <input
              type="number"
              value={observerVel}
              onChange={(e) => setObserverVel(e.target.value)}
              placeholder="e.g., 0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {waveType === 'sound' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medium Velocity (m/s)
              </label>
              <input
                type="number"
                value={mediumVel}
                onChange={(e) => setMediumVel(e.target.value)}
                placeholder="e.g., 343"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Direction
            </label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="towards">Source towards Observer</option>
              <option value="away">Source away from Observer</option>
            </select>
          </div>

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
                    setWaveType(preset.type);
                    setSourceFreq(preset.freq.toString());
                    setSourceVel(preset.sVel.toString());
                    setObserverVel(preset.oVel.toString());
                    setMediumVel(preset.mVel || c);
                    setDirection('towards');
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
            onClick={calculateDopplerEffect}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate
          </button>

          {/* Result */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <p>Observed Frequency: {formatNumber(result.observedFreq)} Hz</p>
              <p>Frequency Shift: {formatNumber(result.freqShift)} Hz</p>
              <p>Wavelength: {formatNumber(result.wavelength * (waveType === 'sound' ? 1 : 1e9))} {waveType === 'sound' ? 'm' : 'nm'}</p>
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
                <p>Calculates the Doppler effect for sound and light waves.</p>
                <p>Formulas:</p>
                <ul className="list-disc list-inside">
                  <li>Sound: f = f₀ * (v ± vₒ)/(v ± vₛ)</li>
                  <li>Light: f = f₀ * √((1 - β)/(1 + β)), where β = v/c</li>
                </ul>
                <p>Positive velocities are towards each other; negative away.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DopplerEffectCalculator;