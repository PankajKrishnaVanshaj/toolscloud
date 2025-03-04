'use client';
import React, { useState } from 'react';

const IdealGasLawCalculator = () => {
  const [calculateFor, setCalculateFor] = useState('P'); // P, V, n, T
  const [pressure, setPressure] = useState('');
  const [pressureUnit, setPressureUnit] = useState('atm');
  const [volume, setVolume] = useState('');
  const [volumeUnit, setVolumeUnit] = useState('L');
  const [moles, setMoles] = useState('');
  const [temperature, setTemperature] = useState('');
  const [tempUnit, setTempUnit] = useState('K');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Constants
  const R = {
    'atm': 0.08206,    // L·atm/(mol·K)
    'Pa': 8.314,       // J/(mol·K) = Pa·m³/(mol·K)
    'kPa': 8.314,      // Adjusted later
  };

  // Unit conversion factors (to base units: Pa, m³, K)
  const pressureUnits = {
    'Pa': 1,
    'kPa': 1e3,
    'atm': 101325,
  };

  const volumeUnits = {
    'L': 0.001,   // Convert to m³
    'mL': 1e-6,
    'm³': 1,
  };

  const calculateIdealGas = () => {
    setError('');
    setResult(null);

    // Convert inputs to base units (Pa, m³, mol, K)
    const P = pressure ? parseFloat(pressure) * pressureUnits[pressureUnit] : null;
    const V = volume ? parseFloat(volume) * volumeUnits[volumeUnit] : null;
    const n = moles ? parseFloat(moles) : null;
    const T = temperature 
      ? tempUnit === 'C' 
        ? parseFloat(temperature) + 273.15 
        : parseFloat(temperature) 
      : null;

    // Validation
    const inputs = { P, V, n, T };
    const required = calculateFor === 'P' ? ['V', 'n', 'T'] :
                    calculateFor === 'V' ? ['P', 'n', 'T'] :
                    calculateFor === 'n' ? ['P', 'V', 'T'] :
                    ['P', 'V', 'n'];

    for (let key of required) {
      if (inputs[key] === null || isNaN(inputs[key])) {
        setError(`Please enter a valid ${key === 'P' ? 'pressure' : key === 'V' ? 'volume' : key === 'n' ? 'moles' : 'temperature'}`);
        return;
      }
      if (inputs[key] <= 0) {
        setError(`${key === 'P' ? 'Pressure' : key === 'V' ? 'Volume' : key === 'n' ? 'Moles' : 'Temperature'} must be positive${key === 'T' && tempUnit === 'C' ? ' (in Kelvin)' : ''}`);
        return;
      }
    }

    if (calculateFor === 'T' && tempUnit === 'C' && T <= 0) {
      setError('Temperature must be above -273.15°C');
      return;
    }

    try {
      let calculatedValue;
      const R_value = pressureUnit === 'atm' ? R.atm : R.Pa / (pressureUnit === 'kPa' ? 1e3 : 1);

      switch (calculateFor) {
        case 'P':
          calculatedValue = (n * R_value * T) / V; // Result in input pressure unit
          calculatedValue *= (pressureUnits.atm / pressureUnits[pressureUnit]); // Convert from atm to chosen unit if needed
          setResult({
            P: calculatedValue,
            V: parseFloat(volume),
            n: parseFloat(moles),
            T: parseFloat(temperature),
            units: { P: pressureUnit, V: volumeUnit, T: tempUnit },
          });
          break;

        case 'V':
          calculatedValue = (n * R_value * T) / (P / pressureUnits.atm); // Result in L if atm, adjust later
          calculatedValue /= volumeUnits[volumeUnit]; // Convert to chosen volume unit
          setResult({
            P: parseFloat(pressure),
            V: calculatedValue,
            n: parseFloat(moles),
            T: parseFloat(temperature),
            units: { P: pressureUnit, V: volumeUnit, T: tempUnit },
          });
          break;

        case 'n':
          calculatedValue = (P * V) / (R_value * T);
          calculatedValue *= (pressureUnits.atm / pressureUnits[pressureUnit]); // Adjust if not atm
          setResult({
            P: parseFloat(pressure),
            V: parseFloat(volume),
            n: calculatedValue,
            T: parseFloat(temperature),
            units: { P: pressureUnit, V: volumeUnit, T: tempUnit },
          });
          break;

        case 'T':
          calculatedValue = (P * V) / (n * R_value);
          calculatedValue *= (pressureUnits.atm / pressureUnits[pressureUnit]); // Adjust if not atm
          if (tempUnit === 'C') calculatedValue -= 273.15;
          setResult({
            P: parseFloat(pressure),
            V: parseFloat(volume),
            n: parseFloat(moles),
            T: calculatedValue,
            units: { P: pressureUnit, V: volumeUnit, T: tempUnit },
          });
          break;

        default:
          throw new Error('Invalid calculation type');
      }
    } catch (err) {
      setError('Calculation error: ' + err.message);
    }
  };

  const formatNumber = (num, digits = 2) => {
    if (num < 1e-6 || num > 1e6) {
      return num.toExponential(digits);
    }
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  const resetInputs = () => {
    setPressure('');
    setVolume('');
    setMoles('');
    setTemperature('');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Ideal Gas Law Calculator
        </h1>

        <div className="space-y-6">
          {/* Calculate For */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calculate For
            </label>
            <select
              value={calculateFor}
              onChange={(e) => {
                setCalculateFor(e.target.value);
                resetInputs();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="P">Pressure (P)</option>
              <option value="V">Volume (V)</option>
              <option value="n">Moles (n)</option>
              <option value="T">Temperature (T)</option>
            </select>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            {calculateFor !== 'P' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pressure
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={pressure}
                    onChange={(e) => setPressure(e.target.value)}
                    placeholder="e.g., 1"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={pressureUnit}
                    onChange={(e) => setPressureUnit(e.target.value)}
                    className="w-24 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pa">Pa</option>
                    <option value="kPa">kPa</option>
                    <option value="atm">atm</option>
                  </select>
                </div>
              </div>
            )}
            {calculateFor !== 'V' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Volume
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    placeholder="e.g., 1"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={volumeUnit}
                    onChange={(e) => setVolumeUnit(e.target.value)}
                    className="w-24 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="L">L</option>
                    <option value="mL">mL</option>
                    <option value="m³">m³</option>
                  </select>
                </div>
              </div>
            )}
            {calculateFor !== 'n' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moles (n)
                </label>
                <input
                  type="number"
                  value={moles}
                  onChange={(e) => setMoles(e.target.value)}
                  placeholder="e.g., 1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            {calculateFor !== 'T' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    placeholder="e.g., 298"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={tempUnit}
                    onChange={(e) => setTempUnit(e.target.value)}
                    className="w-24 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="K">K</option>
                    <option value="C">°C</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateIdealGas}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <p>Pressure: {formatNumber(result.P)} {result.units.P}</p>
              <p>Volume: {formatNumber(result.V)} {result.units.V}</p>
              <p>Moles: {formatNumber(result.n)} mol</p>
              <p>Temperature: {formatNumber(result.T)} {result.units.T}</p>
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
                  setCalculateFor('P');
                  setVolume(22.4);
                  setVolumeUnit('L');
                  setMoles(1);
                  setTemperature(273);
                  setTempUnit('K');
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                STP (1 mol)
              </button>
              <button
                onClick={() => {
                  setCalculateFor('V');
                  setPressure(1);
                  setPressureUnit('atm');
                  setMoles(0.5);
                  setTemperature(298);
                  setTempUnit('K');
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                0.5 mol, 25°C
              </button>
              <button
                onClick={() => {
                  setCalculateFor('T');
                  setPressure(101325);
                  setPressureUnit('Pa');
                  setVolume(0.024);
                  setVolumeUnit('m³');
                  setMoles(1);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                1 mol, 24 L
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Uses the Ideal Gas Law: PV = nRT</p>
                <ul className="list-disc list-inside">
                  <li>P = Pressure</li>
                  <li>V = Volume</li>
                  <li>n = Moles</li>
                  <li>R = Gas constant (varies by pressure unit)</li>
                  <li>T = Temperature</li>
                </ul>
                <p>R = 0.08206 L·atm/(mol·K) or 8.314 Pa·m³/(mol·K)</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdealGasLawCalculator;