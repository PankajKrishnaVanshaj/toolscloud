'use client'
import React, { useState } from 'react';

const CapacitanceCalculator = () => {
  const [type, setType] = useState('parallel'); // parallel, cylindrical, spherical
  const [params, setParams] = useState({
    area: '', // m² for parallel
    distance: '', // m for parallel
    radius1: '', // m for cylindrical/spherical
    radius2: '', // m for cylindrical/spherical
    length: '', // m for cylindrical
  });
  const [unitScale, setUnitScale] = useState('m'); // m, cm, mm
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Constants
  const ε0 = 8.854187817e-12; // Permittivity of free space (F/m)

  const unitConversions = {
    m: 1,
    cm: 0.01,
    mm: 0.001,
  };

  const calculateCapacitance = () => {
    setError('');
    setResult(null);

    const scale = unitConversions[unitScale];
    const scaledParams = {
      area: parseFloat(params.area) * scale * scale || 0,
      distance: parseFloat(params.distance) * scale || 0,
      radius1: parseFloat(params.radius1) * scale || 0,
      radius2: parseFloat(params.radius2) * scale || 0,
      length: parseFloat(params.length) * scale || 0,
    };

    try {
      let capacitance;
      switch (type) {
        case 'parallel':
          if (!scaledParams.area || !scaledParams.distance || scaledParams.distance <= 0) {
            throw new Error('Invalid area or distance');
          }
          capacitance = (ε0 * scaledParams.area) / scaledParams.distance;
          break;
          
        case 'cylindrical':
          if (!scaledParams.radius1 || !scaledParams.radius2 || !scaledParams.length ||
              scaledParams.radius1 <= 0 || scaledParams.radius2 <= scaledParams.radius1) {
            throw new Error('Invalid radii or length');
          }
          capacitance = (2 * Math.PI * ε0 * scaledParams.length) / 
            Math.log(scaledParams.radius2 / scaledParams.radius1);
          break;

        case 'spherical':
          if (!scaledParams.radius1 || !scaledParams.radius2 || 
              scaledParams.radius1 <= 0 || scaledParams.radius2 <= scaledParams.radius1) {
            throw new Error('Invalid radii');
          }
          capacitance = (4 * Math.PI * ε0 * scaledParams.radius1 * scaledParams.radius2) / 
            (scaledParams.radius2 - scaledParams.radius1);
          break;

        default:
          throw new Error('Unknown capacitor type');
      }

      setResult({
        farads: capacitance,
        picofarads: capacitance * 1e12,
        nanofarads: capacitance * 1e9,
        microfarads: capacitance * 1e6,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleParamChange = (field, value) => {
    setParams(prev => ({ ...prev, [field]: value }));
  };

  const formatNumber = (num, digits = 4) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  const presets = {
    parallel: { area: '1', distance: '0.01' },
    cylindrical: { radius1: '0.01', radius2: '0.02', length: '1' },
    spherical: { radius1: '0.05', radius2: '0.06' },
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Capacitance Calculator
        </h1>

        <div className="space-y-6">
          {/* Capacitor Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacitor Type
            </label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setParams(presets[e.target.value]);
                setResult(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="parallel">Parallel Plate</option>
              <option value="cylindrical">Cylindrical</option>
              <option value="spherical">Spherical</option>
            </select>
          </div>

          {/* Unit Scale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Units
            </label>
            <select
              value={unitScale}
              onChange={(e) => setUnitScale(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="m">Meters (m)</option>
              <option value="cm">Centimeters (cm)</option>
              <option value="mm">Millimeters (mm)</option>
            </select>
          </div>

          {/* Parameters */}
          <div className="space-y-4">
            {type === 'parallel' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Plate Area ({unitScale}²)
                  </label>
                  <input
                    type="number"
                    value={params.area}
                    onChange={(e) => handleParamChange('area', e.target.value)}
                    placeholder="e.g., 1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Plate Separation ({unitScale})
                  </label>
                  <input
                    type="number"
                    value={params.distance}
                    onChange={(e) => handleParamChange('distance', e.target.value)}
                    placeholder="e.g., 0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
            {type === 'cylindrical' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Inner Radius ({unitScale})
                  </label>
                  <input
                    type="number"
                    value={params.radius1}
                    onChange={(e) => handleParamChange('radius1', e.target.value)}
                    placeholder="e.g., 0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Outer Radius ({unitScale})
                  </label>
                  <input
                    type="number"
                    value={params.radius2}
                    onChange={(e) => handleParamChange('radius2', e.target.value)}
                    placeholder="e.g., 0.02"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Length ({unitScale})
                  </label>
                  <input
                    type="number"
                    value={params.length}
                    onChange={(e) => handleParamChange('length', e.target.value)}
                    placeholder="e.g., 1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
            {type === 'spherical' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Inner Radius ({unitScale})
                  </label>
                  <input
                    type="number"
                    value={params.radius1}
                    onChange={(e) => handleParamChange('radius1', e.target.value)}
                    placeholder="e.g., 0.05"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Outer Radius ({unitScale})
                  </label>
                  <input
                    type="number"
                    value={params.radius2}
                    onChange={(e) => handleParamChange('radius2', e.target.value)}
                    placeholder="e.g., 0.06"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateCapacitance}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate
          </button>

          {/* Result */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Capacitance:</h2>
              <p>{formatNumber(result.farads)} F</p>
              <p>{formatNumber(result.microfarads)} μF</p>
              <p>{formatNumber(result.nanofarads)} nF</p>
              <p>{formatNumber(result.picofarads)} pF</p>
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
              <summary className="cursor-pointer font-medium">Formulas & Info</summary>
              <div className="mt-2 space-y-2">
                <p>Calculates capacitance for different geometries:</p>
                <ul className="list-disc list-inside">
                  <li>Parallel: C = ε₀A/d</li>
                  <li>Cylindrical: C = 2πε₀L/ln(r₂/r₁)</li>
                  <li>Spherical: C = 4πε₀r₁r₂/(r₂-r₁)</li>
                </ul>
                <p>ε₀ = {ε0} F/m (vacuum permittivity)</p>
                <p>Assumes vacuum dielectric; for other materials, multiply by relative permittivity (εᵣ).</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapacitanceCalculator;