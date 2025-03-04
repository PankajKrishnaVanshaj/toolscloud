'use client'
import React, { useState, useEffect, useRef } from 'react';

const NuclearDecaySimulator = () => {
  const [initialAmount, setInitialAmount] = useState(100); // Initial number of nuclei
  const [inputMode, setInputMode] = useState('halfLife'); // halfLife or decayConstant
  const [halfLife, setHalfLife] = useState(10); // Half-life in arbitrary time units
  const [decayConstant, setDecayConstant] = useState(0.0693); // λ in 1/time units
  const [timeMax, setTimeMax] = useState(50); // Max time for simulation
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const canvasRef = useRef(null);

  const canvasWidth = 600;
  const canvasHeight = 300;

  useEffect(() => {
    if (inputMode === 'halfLife') {
      setDecayConstant(Math.log(2) / halfLife);
    } else {
      setHalfLife(Math.log(2) / decayConstant);
    }
  }, [inputMode, halfLife, decayConstant]);

  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setCurrentTime(t => {
          if (t >= timeMax) {
            setIsAnimating(false);
            return timeMax;
          }
          return t + 0.1;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isAnimating, timeMax]);

  useEffect(() => {
    drawDecayGraph();
  }, [initialAmount, decayConstant, timeMax, currentTime]);

  const calculateRemaining = (t) => {
    return initialAmount * Math.exp(-decayConstant * t);
  };

  const drawDecayGraph = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw axes
    const margin = 50;
    ctx.beginPath();
    ctx.moveTo(margin, canvasHeight - margin);
    ctx.lineTo(canvasWidth - margin, canvasHeight - margin); // X-axis
    ctx.lineTo(canvasWidth - margin - 10, canvasHeight - margin - 5);
    ctx.moveTo(canvasWidth - margin, canvasHeight - margin);
    ctx.lineTo(canvasWidth - margin - 10, canvasHeight - margin + 5);
    ctx.moveTo(margin, canvasHeight - margin);
    ctx.lineTo(margin, margin); // Y-axis
    ctx.lineTo(margin - 5, margin + 10);
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin + 5, margin + 10);
    ctx.strokeStyle = 'black';
    ctx.stroke();

    // Label axes
    ctx.font = '12px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText('Time', canvasWidth - margin + 10, canvasHeight - margin + 5);
    ctx.fillText('N(t)', margin - 30, margin - 5);

    // Draw decay curve
    const scaleX = (canvasWidth - 2 * margin) / timeMax;
    const scaleY = (canvasHeight - 2 * margin) / initialAmount;

    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    for (let t = 0; t <= Math.min(currentTime, timeMax); t += 0.1) {
      const x = margin + t * scaleX;
      const y = canvasHeight - margin - calculateRemaining(t) * scaleY;
      if (t === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw half-life line
    const halfAmount = initialAmount / 2;
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'red';
    ctx.moveTo(margin, canvasHeight - margin - halfAmount * scaleY);
    ctx.lineTo(margin + halfLife * scaleX, canvasHeight - margin - halfAmount * scaleY);
    ctx.lineTo(margin + halfLife * scaleX, canvasHeight - margin);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw current point
    if (currentTime > 0 && currentTime <= timeMax) {
      const currentAmount = calculateRemaining(currentTime);
      ctx.beginPath();
      ctx.arc(
        margin + currentTime * scaleX,
        canvasHeight - margin - currentAmount * scaleY,
        5,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = 'green';
      ctx.fill();
    }
  };

  const formatNumber = (num, digits = 2) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Nuclear Decay Simulator
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
              Blue: Decay Curve | Red: Half-Life | Green: Current Point
            </p>
          </div>

          {/* Controls */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Amount (N₀)
              </label>
              <input
                type="number"
                min="1"
                value={initialAmount}
                onChange={(e) => setInitialAmount(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Mode
              </label>
              <select
                value={inputMode}
                onChange={(e) => setInputMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="halfLife">Half-Life</option>
                <option value="decayConstant">Decay Constant</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {inputMode === 'halfLife' ? 'Half-Life (t½)' : 'Decay Constant (λ)'}
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={inputMode === 'halfLife' ? halfLife : decayConstant}
                onChange={(e) => {
                  const value = Math.max(0.01, parseFloat(e.target.value) || 0.01);
                  if (inputMode === 'halfLife') setHalfLife(value);
                  else setDecayConstant(value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Simulation Time
              </label>
              <input
                type="number"
                min="1"
                value={timeMax}
                onChange={(e) => setTimeMax(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Animation Controls */}
          <div className="flex gap-4">
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {isAnimating ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={() => {
                setIsAnimating(false);
                setCurrentTime(0);
              }}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Reset
            </button>
          </div>

          {/* Results */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Decay Properties:</h2>
            <p>Initial Amount: {formatNumber(initialAmount)}</p>
            <p>Half-Life: {formatNumber(halfLife)} time units</p>
            <p>Decay Constant: {formatNumber(decayConstant)} /time unit</p>
            <p>Current Time: {formatNumber(currentTime)} time units</p>
            <p>Remaining: {formatNumber(calculateRemaining(currentTime))} nuclei</p>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Simulates radioactive decay using:</p>
                <p>N(t) = N₀ e^(-λt)</p>
                <p>t½ = ln(2)/λ</p>
                <p>Features:</p>
                <ul className="list-disc list-inside">
                  <li>Exponential decay visualization</li>
                  <li>Half-life and decay constant conversion</li>
                  <li>Time animation</li>
                </ul>
                <p>Time units are arbitrary for simulation purposes.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuclearDecaySimulator;