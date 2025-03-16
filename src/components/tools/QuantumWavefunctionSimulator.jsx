"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaPlay, FaPause, FaSync, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the canvas

const QuantumWavefunctionSimulator = () => {
  const [n, setN] = useState(1); // Quantum number
  const [L, setL] = useState(1); // Well width in nm
  const [time, setTime] = useState(0); // Time in femtoseconds
  const [isAnimating, setIsAnimating] = useState(false);
  const [speed, setSpeed] = useState(1); // Animation speed multiplier
  const [showComponents, setShowComponents] = useState({
    probability: true,
    real: true,
    imag: true,
  });
  const canvasRef = useRef(null);

  // Constants
  const hbar = 1.0545718e-34; // Reduced Planck constant (J·s)
  const m = 9.1093837e-31; // Electron mass (kg)
  const nmToM = 1e-9; // nm to meters conversion
  const fsToS = 1e-15; // fs to seconds conversion

  // Animation control
  useEffect(() => {
    let interval;
    if (isAnimating) {
      interval = setInterval(() => {
        setTime((t) => t + 0.1 * speed);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isAnimating, speed]);

  // Draw wavefunction when parameters change
  useEffect(() => {
    drawWavefunction();
  }, [n, L, time, showComponents]);

  const calculateEnergy = useCallback(() => {
    const Lm = L * nmToM;
    return (n * n * Math.PI * Math.PI * hbar * hbar) / (2 * m * Lm * Lm);
  }, [n, L]);

  const psi = useCallback((x) => {
    const Lm = L * nmToM;
    return Math.sqrt(2 / Lm) * Math.sin((n * Math.PI * x) / Lm);
  }, [n, L]);

  const timeEvolution = useCallback(
    (x, t) => {
      const E = calculateEnergy();
      const omega = E / hbar;
      const real = psi(x) * Math.cos(omega * t);
      const imag = psi(x) * Math.sin(omega * t);
      return { real, imag };
    },
    [psi, calculateEnergy]
  );

  const probabilityDensity = useCallback(
    (x, t) => {
      const { real, imag } = timeEvolution(x, t);
      return real * real + imag * imag;
    },
    [timeEvolution]
  );

  const drawWavefunction = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw potential well
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(50, height - 50);
    ctx.moveTo(width - 50, 50);
    ctx.lineTo(width - 50, height - 50);
    ctx.stroke();

    const Lm = L * nmToM;
    const ts = time * fsToS;
    const scaleX = (width - 100) / Lm;
    const scaleY = (height - 100) / 0.5; // Arbitrary scale for visibility

    // Draw probability density
    if (showComponents.probability) {
      ctx.beginPath();
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 1.5;
      for (let x = 0; x <= Lm; x += Lm / 200) {
        const prob = probabilityDensity(x, ts);
        const canvasX = 50 + x * scaleX;
        const canvasY = height - 50 - prob * scaleY;
        x === 0 ? ctx.moveTo(canvasX, canvasY) : ctx.lineTo(canvasX, canvasY);
      }
      ctx.stroke();
    }

    // Draw real part
    if (showComponents.real) {
      ctx.beginPath();
      ctx.strokeStyle = "red";
      ctx.lineWidth = 1.5;
      for (let x = 0; x <= Lm; x += Lm / 200) {
        const { real } = timeEvolution(x, ts);
        const canvasX = 50 + x * scaleX;
        const canvasY = height - 50 - real * scaleY;
        x === 0 ? ctx.moveTo(canvasX, canvasY) : ctx.lineTo(canvasX, canvasY);
      }
      ctx.stroke();
    }

    // Draw imaginary part
    if (showComponents.imag) {
      ctx.beginPath();
      ctx.strokeStyle = "green";
      ctx.lineWidth = 1.5;
      for (let x = 0; x <= Lm; x += Lm / 200) {
        const { imag } = timeEvolution(x, ts);
        const canvasX = 50 + x * scaleX;
        const canvasY = height - 50 - imag * scaleY;
        x === 0 ? ctx.moveTo(canvasX, canvasY) : ctx.lineTo(canvasX, canvasY);
      }
      ctx.stroke();
    }
  };

  // Download canvas as PNG
  const downloadWavefunction = () => {
    if (canvasRef.current) {
      html2canvas(canvasRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `wavefunction-n${n}-L${L}-t${time.toFixed(1)}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  const formatNumber = (num, digits = 2) =>
    num.toLocaleString("en-US", { maximumFractionDigits: digits });

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Quantum Wavefunction Simulator
        </h1>

        <div className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Animation Speed ({speed}x)
              </label>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          {/* Component Visibility */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Show Components</h3>
            <div className="flex gap-4">
              {[
                { key: "probability", label: "Probability (Blue)", color: "blue" },
                { key: "real", label: "Real Part (Red)", color: "red" },
                { key: "imag", label: "Imaginary (Green)", color: "green" },
              ].map(({ key, label, color }) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showComponents[key]}
                    onChange={() =>
                      setShowComponents((prev) => ({
                        ...prev,
                        [key]: !prev[key],
                      }))
                    }
                    className="mr-2 accent-blue-500"
                  />
                  <span className="text-sm text-gray-700" style={{ color }}>
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Animation Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              {isAnimating ? <FaPause className="mr-2" /> : <FaPlay className="mr-2" />}
              {isAnimating ? "Pause" : "Animate"}
            </button>
            <button
              onClick={() => setTime(0)}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset Time
            </button>
            <button
              onClick={downloadWavefunction}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>

          {/* Canvas */}
          <div>
            <canvas
              ref={canvasRef}
              width={800}
              height={400}
              className="w-full border border-gray-300 rounded-md shadow-md"
            />
          </div>

          {/* Results */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">Properties</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
              <dt>Energy:</dt>
              <dd>{formatNumber(calculateEnergy() / 1e-19)} × 10⁻¹⁹ J</dd>
              <dt>Time:</dt>
              <dd>{formatNumber(time)} fs</dd>
              <dt>Well Width:</dt>
              <dd>{formatNumber(L)} nm</dd>
              <dt>Quantum Number:</dt>
              <dd>n = {n}</dd>
            </dl>
          </div>

          {/* About Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <details>
              <summary className="cursor-pointer font-semibold text-blue-700">
                About the Simulator
              </summary>
              <div className="mt-2 text-sm text-blue-600 space-y-2">
                <p>Simulates a particle in a 1D infinite potential well.</p>
                <p>Wavefunction: ψ(x) = √(2/L) sin(nπx/L)</p>
                <p>Energy: E = n²π²ℏ²/(2mL²)</p>
                <p>Time evolution: Ψ(x,t) = ψ(x)e^(-iEt/ℏ)</p>
                <p>Visualizes probability density |Ψ|² and real/imaginary parts.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumWavefunctionSimulator;