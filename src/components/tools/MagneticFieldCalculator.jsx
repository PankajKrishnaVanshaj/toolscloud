'use client'
import React, { useState, useEffect, useRef } from 'react';

const MagneticFieldCalculator = () => {
  const [config, setConfig] = useState('wire'); // wire, solenoid, loop
  const [current, setCurrent] = useState(1); // Amperes
  const [distance, setDistance] = useState(0.01); // Meters
  const [turns, setTurns] = useState(100); // For solenoid
  const [length, setLength] = useState(0.1); // Meters, for solenoid
  const [radius, setRadius] = useState(0.05); // Meters, for loop
  const [result, setResult] = useState(null);
  const canvasRef = useRef(null);

  const canvasWidth = 400;
  const canvasHeight = 300;

  // Constants
  const μ0 = 4 * Math.PI * 1e-7; // Permeability of free space (H/m)

  useEffect(() => {
    calculateMagneticField();
    drawVisualization();
  }, [config, current, distance, turns, length, radius]);

  const calculateMagneticField = () => {
    const I = parseFloat(current);
    const r = parseFloat(distance);
    const N = parseInt(turns);
    const L = parseFloat(length);
    const R = parseFloat(radius);

    if (isNaN(I) || I <= 0 || isNaN(r) || r <= 0 || 
        (config === 'solenoid' && (isNaN(N) || N <= 0 || isNaN(L) || L <= 0)) || 
        (config === 'loop' && (isNaN(R) || R <= 0))) {
      setResult({ error: 'Please enter valid positive values' });
      return;
    }

    let B, formula;
    try {
      switch (config) {
        case 'wire':
          // B = μ₀I / (2πr)
          B = (μ0 * I) / (2 * Math.PI * r);
          formula = 'B = μ₀I / (2πr)';
          break;
        case 'solenoid':
          // B = μ₀NI / L
          B = (μ0 * N * I) / L;
          formula = 'B = μ₀NI / L';
          break;
        case 'loop':
          // B = μ₀I / (2R) (at center)
          B = (μ0 * I) / (2 * R);
          formula = 'B = μ₀I / (2R)';
          break;
        default:
          throw new Error('Unknown configuration');
      }

      setResult({
        B, // Tesla
        B_mT: B * 1000, // milliTesla
        B_G: B * 10000, // Gauss
        formula,
        error: null,
      });
    } catch (err) {
      setResult({ error: 'Calculation error: ' + err.message });
    }
  };

  const drawVisualization = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;

    switch (config) {
      case 'wire':
        // Draw straight wire (vertical)
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, canvasHeight);
        ctx.stroke();
        // Magnetic field circles
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'blue';
        for (let r = 20; r <= 60; r += 20) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        break;
      case 'solenoid':
        // Draw solenoid (simplified as a rectangle with loops)
        ctx.beginPath();
        ctx.rect(centerX - 50, centerY - 50, 100, 100);
        ctx.stroke();
        for (let y = centerY - 40; y <= centerY + 40; y += 20) {
          ctx.beginPath();
          ctx.arc(centerX, y, 10, 0, Math.PI, true);
          ctx.stroke();
        }
        // Field lines inside
        ctx.strokeStyle = 'blue';
        for (let x = centerX - 30; x <= centerX + 30; x += 20) {
          ctx.beginPath();
          ctx.moveTo(x, centerY - 40);
          ctx.lineTo(x, centerY + 40);
          ctx.stroke();
        }
        break;
      case 'loop':
        // Draw circular loop
        ctx.beginPath();
        ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
        ctx.stroke();
        // Field lines through center
        ctx.strokeStyle = 'blue';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 60);
        ctx.lineTo(centerX, centerY + 60);
        ctx.stroke();
        break;
    }
  };

  const formatNumber = (num, digits = 4) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Magnetic Field Calculator
        </h1>

        <div className="space-y-6">
          {/* Configuration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Configuration
            </label>
            <select
              value={config}
              onChange={(e) => setConfig(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="wire">Straight Wire</option>
              <option value="solenoid">Solenoid</option>
              <option value="loop">Circular Loop</option>
            </select>
          </div>

          {/* Inputs */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current (A)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distance from Source (m)
              </label>
              <input
                type="number"
                min="0.001"
                step="0.001"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {config === 'solenoid' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Turns
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={turns}
                    onChange={(e) => setTurns(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Length (m)
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
            {config === 'loop' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Radius (m)
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Visualization */}
          <div>
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="w-full border border-gray-300 rounded-md"
            />
            <p className="text-sm text-gray-600 mt-2">
              Black: Conductor | Blue: Magnetic Field Lines
            </p>
          </div>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Magnetic Field Strength:</h2>
              {result.error ? (
                <p className="text-red-700">{result.error}</p>
              ) : (
                <>
                  <p>{formatNumber(result.B)} T (Tesla)</p>
                  <p>{formatNumber(result.B_mT)} mT (milliTesla)</p>
                  <p>{formatNumber(result.B_G)} G (Gauss)</p>
                  <p className="text-sm text-gray-600 mt-2">Formula: {result.formula}</p>
                </>
              )}
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
                  setConfig('wire');
                  setCurrent(1);
                  setDistance(0.01);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Wire (1A, 1cm)
              </button>
              <button
                onClick={() => {
                  setConfig('solenoid');
                  setCurrent(2);
                  setTurns(100);
                  setLength(0.1);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Solenoid (2A)
              </button>
              <button
                onClick={() => {
                  setConfig('loop');
                  setCurrent(1);
                  setRadius(0.05);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Loop (1A, 5cm)
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Calculates magnetic field strength using Biot-Savart Law derivations:</p>
                <ul className="list-disc list-inside">
                  <li>Wire: B = μ₀I / (2πr)</li>
                  <li>Solenoid: B = μ₀NI / L</li>
                  <li>Loop: B = μ₀I / (2R) (at center)</li>
                </ul>
                <p>μ₀ = 4π × 10⁻⁷ H/m (permeability of free space)</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagneticFieldCalculator;