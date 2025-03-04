'use client'
import React, { useState, useEffect, useRef } from 'react';

const QuantumWavefunctionSimulator = () => {
  const [n, setN] = useState(1); // Quantum number
  const [L, setL] = useState(1); // Well width in nm
  const [time, setTime] = useState(0); // Time in femtoseconds
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef(null);

  // Constants
  const hbar = 1.0545718e-34; // Reduced Planck constant (J·s)
  const m = 9.1093837e-31; // Electron mass (kg)
  const nmToM = 1e-9; // nm to meters conversion
  const fsToS = 1e-15; // fs to seconds conversion

  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setTime(t => t + 0.1);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isAnimating]);

  useEffect(() => {
    drawWavefunction();
  }, [n, L, time]);

  const calculateEnergy = () => {
    const Lm = L * nmToM;
    return (n * n * Math.PI * Math.PI * hbar * hbar) / (2 * m * Lm * Lm);
  };

  const psi = (x) => {
    const Lm = L * nmToM;
    return Math.sqrt(2 / Lm) * Math.sin(n * Math.PI * x / Lm);
  };

  const timeEvolution = (x, t) => {
    const E = calculateEnergy();
    const omega = E / hbar;
    const real = psi(x) * Math.cos(omega * t);
    const imag = psi(x) * Math.sin(omega * t);
    return { real, imag };
  };

  const probabilityDensity = (x, t) => {
    const { real, imag } = timeEvolution(x, t);
    return real * real + imag * imag;
  };

  const drawWavefunction = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw potential well
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(50, height - 50);
    ctx.moveTo(width - 50, 50);
    ctx.lineTo(width - 50, height - 50);
    ctx.stroke();

    // Draw probability density
    const Lm = L * nmToM;
    const ts = time * fsToS;
    const scaleX = (width - 100) / Lm;
    const scaleY = (height - 100) / 0.5; // Arbitrary scale for visibility

    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 1;
    for (let x = 0; x <= Lm; x += Lm / 200) {
      const prob = probabilityDensity(x, ts);
      const canvasX = 50 + x * scaleX;
      const canvasY = height - 50 - prob * scaleY;
      if (x === 0) {
        ctx.moveTo(canvasX, canvasY);
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    }
    ctx.stroke();

    // Draw real part
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    for (let x = 0; x <= Lm; x += Lm / 200) {
      const { real } = timeEvolution(x, ts);
      const canvasX = 50 + x * scaleX;
      const canvasY = height - 50 - real * scaleY;
      if (x === 0) {
        ctx.moveTo(canvasX, canvasY);
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    }
    ctx.stroke();

    // Draw imaginary part
    ctx.beginPath();
    ctx.strokeStyle = 'green';
    for (let x = 0; x <= Lm; x += Lm / 200) {
      const { imag } = timeEvolution(x, ts);
      const canvasX = 50 + x * scaleX;
      const canvasY = height - 50 - imag * scaleY;
      if (x === 0) {
        ctx.moveTo(canvasX, canvasY);
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    }
    ctx.stroke();
  };

  const formatNumber = (num, digits = 2) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Quantum Wavefunction Simulator
        </h1>

        <div className="space-y-6">
          {/* Controls */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantum Number (n)
              </label>
              <input
                type="number"
                min="1"
                value={n}
                onChange={(e) => setN(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Well Width (nm)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={L}
                onChange={(e) => setL(Math.max(0.1, parseFloat(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Animation Control */}
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

          {/* Canvas */}
          <div>
            <canvas
              ref={canvasRef}
              width={600}
              height={300}
              className="w-full border border-gray-300 rounded-md"
            />
            <p className="text-sm text-gray-600 mt-2">
              Blue: Probability Density | Red: Real Part | Green: Imaginary Part
            </p>
          </div>

          {/* Results */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Properties:</h2>
            <p>Energy: {formatNumber(calculateEnergy() / 1e-19)} × 10⁻¹⁹ J</p>
            <p>Time: {formatNumber(time)} fs</p>
            <p>Well Width: {formatNumber(L)} nm</p>
            <p>Quantum Number: n = {n}</p>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Simulates a particle in a 1D infinite potential well.</p>
                <p>Wavefunction: ψ(x) = √(2/L) sin(nπx/L)</p>
                <p>Energy: E = n²π²ℏ²/(2mL²)</p>
                <p>Time evolution: Ψ(x,t) = ψ(x)e^(-iEt/ℏ)</p>
                <p>Shows probability density |Ψ|² and real/imaginary components.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumWavefunctionSimulator;