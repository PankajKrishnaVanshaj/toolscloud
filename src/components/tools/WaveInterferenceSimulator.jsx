'use client'
import React, { useState, useEffect, useRef } from 'react';

const WaveInterferenceSimulator = () => {
  const [wave1, setWave1] = useState({ amplitude: 1, frequency: 1, phase: 0 }); // Wave 1 properties
  const [wave2, setWave2] = useState({ amplitude: 1, frequency: 1.2, phase: 0 }); // Wave 2 properties
  const [time, setTime] = useState(0); // Time for animation
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef(null);

  const canvasWidth = 800;
  const canvasHeight = 400;

  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setTime(t => t + 0.05);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isAnimating]);

  useEffect(() => {
    drawWaves();
  }, [wave1, wave2, time]);

  const calculateWave = (x, wave, t) => {
    const omega = 2 * Math.PI * wave.frequency; // Angular frequency
    return wave.amplitude * Math.sin(omega * t + (x / 50) - wave.phase);
  };

  const drawWaves = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const centerY = canvasHeight / 2;
    const scaleY = 50; // Vertical scale for visibility

    // Draw Wave 1
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvasWidth; x++) {
      const y = centerY - calculateWave(x, wave1, time) * scaleY;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw Wave 2
    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvasWidth; x++) {
      const y = centerY - calculateWave(x, wave2, time) * scaleY;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw resultant wave (superposition)
    ctx.beginPath();
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 2;
    for (let x = 0; x < canvasWidth; x++) {
      const y1 = calculateWave(x, wave1, time);
      const y2 = calculateWave(x, wave2, time);
      const y = centerY - (y1 + y2) * scaleY;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw zero line
    ctx.beginPath();
    ctx.strokeStyle = 'gray';
    ctx.setLineDash([5, 5]);
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvasWidth, centerY);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const handleWaveChange = (waveNum, field, value) => {
    const parsedValue = parseFloat(value) || 0;
    if (waveNum === 1) {
      setWave1(prev => ({ ...prev, [field]: parsedValue }));
    } else {
      setWave2(prev => ({ ...prev, [field]: parsedValue }));
    }
  };

  const formatNumber = (num, digits = 2) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Wave Interference Simulator
        </h1>

        <div className="space-y-6">
          {/* Canvas */}
          <div>
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="w-full border border-gray-300 rounded-md"
            />
            <p className="text-sm text-gray-600 mt-2">
              Red: Wave 1 | Blue: Wave 2 | Green: Resultant Wave
            </p>
          </div>

          {/* Controls */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Wave 1 Controls */}
            <div className="border p-4 rounded-md">
              <h3 className="font-semibold mb-2">Wave 1</h3>
              <div className="grid gap-2">
                <div>
                  <label className="block text-sm text-gray-700">Amplitude</label>
                  <input
                    type="number"
                    step="0.1"
                    value={wave1.amplitude}
                    onChange={(e) => handleWaveChange(1, 'amplitude', e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Frequency (Hz)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={wave1.frequency}
                    onChange={(e) => handleWaveChange(1, 'frequency', e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Phase (rad)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={wave1.phase}
                    onChange={(e) => handleWaveChange(1, 'phase', e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
              </div>
            </div>

            {/* Wave 2 Controls */}
            <div className="border p-4 rounded-md">
              <h3 className="font-semibold mb-2">Wave 2</h3>
              <div className="grid gap-2">
                <div>
                  <label className="block text-sm text-gray-700">Amplitude</label>
                  <input
                    type="number"
                    step="0.1"
                    value={wave2.amplitude}
                    onChange={(e) => handleWaveChange(2, 'amplitude', e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Frequency (Hz)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={wave2.frequency}
                    onChange={(e) => handleWaveChange(2, 'frequency', e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Phase (rad)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={wave2.phase}
                    onChange={(e) => handleWaveChange(2, 'phase', e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Animation Controls */}
          <div className="flex gap-4">
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {isAnimating ? 'Pause' : 'Animate'}
            </button>
            <button
              onClick={() => setTime(0)}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Reset Time
            </button>
          </div>

          {/* Results */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Wave Properties:</h2>
            <p>Wave 1: A = {formatNumber(wave1.amplitude)}, f = {formatNumber(wave1.frequency)} Hz, φ = {formatNumber(wave1.phase)} rad</p>
            <p>Wave 2: A = {formatNumber(wave2.amplitude)}, f = {formatNumber(wave2.frequency)} Hz, φ = {formatNumber(wave2.phase)} rad</p>
            <p>Time: {formatNumber(time)} s</p>
          </div>

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Presets
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setWave1({ amplitude: 1, frequency: 1, phase: 0 });
                  setWave2({ amplitude: 1, frequency: 1, phase: 0 });
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                In Phase
              </button>
              <button
                onClick={() => {
                  setWave1({ amplitude: 1, frequency: 1, phase: 0 });
                  setWave2({ amplitude: 1, frequency: 1, phase: Math.PI });
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Out of Phase
              </button>
              <button
                onClick={() => {
                  setWave1({ amplitude: 1, frequency: 1, phase: 0 });
                  setWave2({ amplitude: 1, frequency: 1.5, phase: 0 });
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Beat Pattern
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Simulates interference of two waves:</p>
                <p>y = A sin(ωt + kx - φ)</p>
                <p>Resultant = y₁ + y₂</p>
                <p>Features:</p>
                <ul className="list-disc list-inside">
                  <li>Visualizes individual and combined waves</li>
                  <li>Adjustable amplitude, frequency, and phase</li>
                  <li>Shows constructive and destructive interference</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaveInterferenceSimulator;