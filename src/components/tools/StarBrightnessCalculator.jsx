'use client'
import React, { useState } from 'react';

const StarBrightnessCalculator = () => {
  const [inputType, setInputType] = useState('apparent'); // apparent, absolute, luminosity
  const [apparentMag, setApparentMag] = useState(''); // m
  const [distance, setDistance] = useState(''); // Parsecs
  const [absoluteMag, setAbsoluteMag] = useState(''); // M
  const [luminosity, setLuminosity] = useState(''); // Solar luminosities
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Constants
  const SOLAR_LUMINOSITY = 3.828e26; // Watts
  const SOLAR_ABSOLUTE_MAG = 4.83; // Sun's absolute magnitude

  const calculateBrightness = () => {
    setError('');
    setResult(null);

    const d = parseFloat(distance);
    if (isNaN(d) || d <= 0) {
      setError('Please enter a valid positive distance in parsecs');
      return;
    }

    try {
      let m, M, L;

      switch (inputType) {
        case 'apparent':
          const mVal = parseFloat(apparentMag);
          if (isNaN(mVal)) {
            setError('Please enter a valid apparent magnitude');
            return;
          }
          // M = m - 5 log₁₀(d) + 5
          M = mVal - 5 * Math.log10(d) + 5;
          // L/L☉ = 10^((M☉ - M) / 2.5)
          L = Math.pow(10, (SOLAR_ABSOLUTE_MAG - M) / 2.5);
          m = mVal;
          break;

        case 'absolute':
          const MVal = parseFloat(absoluteMag);
          if (isNaN(MVal)) {
            setError('Please enter a valid absolute magnitude');
            return;
          }
          // m = M + 5 log₁₀(d) - 5
          m = MVal + 5 * Math.log10(d) - 5;
          L = Math.pow(10, (SOLAR_ABSOLUTE_MAG - MVal) / 2.5);
          M = MVal;
          break;

        case 'luminosity':
          const LVal = parseFloat(luminosity);
          if (isNaN(LVal) || LVal <= 0) {
            setError('Please enter a valid positive luminosity');
            return;
          }
          // M = M☉ - 2.5 log₁₀(L/L☉)
          M = SOLAR_ABSOLUTE_MAG - 2.5 * Math.log10(LVal);
          m = M + 5 * Math.log10(d) - 5;
          L = LVal;
          break;

        default:
          throw new Error('Invalid input type');
      }

      setResult({
        apparentMag: m,
        absoluteMag: M,
        luminosity: L * SOLAR_LUMINOSITY, // In Watts
        luminositySolar: L, // In solar luminosities
        distance: d,
      });
    } catch (err) {
      setError('Calculation error: ' + err.message);
    }
  };

  const formatNumber = (num, digits = 2) => {
    if (Math.abs(num) < 1e-6 || Math.abs(num) > 1e6) {
      return num.toExponential(digits);
    }
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Star Brightness Calculator
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
                setApparentMag('');
                setAbsoluteMag('');
                setLuminosity('');
                setResult(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="apparent">Apparent Magnitude (m)</option>
              <option value="absolute">Absolute Magnitude (M)</option>
              <option value="luminosity">Luminosity (L☉)</option>
            </select>
          </div>

          {/* Distance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Distance (parsecs)
            </label>
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="e.g., 10"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Specific Input */}
          {inputType === 'apparent' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apparent Magnitude (m)
              </label>
              <input
                type="number"
                value={apparentMag}
                onChange={(e) => setApparentMag(e.target.value)}
                placeholder="e.g., -1.46"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          {inputType === 'absolute' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Absolute Magnitude (M)
              </label>
              <input
                type="number"
                value={absoluteMag}
                onChange={(e) => setAbsoluteMag(e.target.value)}
                placeholder="e.g., 4.83"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          {inputType === 'luminosity' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Luminosity (Solar Luminosities, L☉)
              </label>
              <input
                type="number"
                value={luminosity}
                onChange={(e) => setLuminosity(e.target.value)}
                placeholder="e.g., 1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Calculate Button */}
          <button
            onClick={calculateBrightness}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Brightness Properties:</h2>
              <p>Apparent Magnitude (m): {formatNumber(result.apparentMag)}</p>
              <p>Absolute Magnitude (M): {formatNumber(result.absoluteMag)}</p>
              <p>Luminosity: {formatNumber(result.luminositySolar)} L☉</p>
              <p>Luminosity: {formatNumber(result.luminosity)} W</p>
              <p>Distance: {formatNumber(result.distance)} parsecs</p>
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
                  setInputType('apparent');
                  setApparentMag(-1.46);
                  setDistance(8.6 / 3.262); // Sirius, ~8.6 ly to parsecs
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Sirius
              </button>
              <button
                onClick={() => {
                  setInputType('absolute');
                  setAbsoluteMag(4.83);
                  setDistance(1 / 206265); // Sun, 1 AU in parsecs
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Sun
              </button>
              <button
                onClick={() => {
                  setInputType('luminosity');
                  setLuminosity(100000);
                  setDistance(50);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Supergiant
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Calculates star brightness properties:</p>
                <ul className="list-disc list-inside">
                  <li>m = M + 5 log₁₀(d) - 5</li>
                  <li>L/L☉ = 10^((M☉ - M) / 2.5)</li>
                  <li>M☉ = 4.83, L☉ = 3.828×10²⁶ W</li>
                </ul>
                <p>m: Apparent magnitude (observed)</p>
                <p>M: Absolute magnitude (at 10 pc)</p>
                <p>L: Luminosity (intrinsic brightness)</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StarBrightnessCalculator;