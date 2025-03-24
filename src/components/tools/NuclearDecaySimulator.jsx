"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaPlay, FaPause, FaSync, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; 

const NuclearDecaySimulator = () => {
  const [initialAmount, setInitialAmount] = useState(100);
  const [inputMode, setInputMode] = useState("halfLife");
  const [halfLife, setHalfLife] = useState(10);
  const [decayConstant, setDecayConstant] = useState(0.0693);
  const [timeMax, setTimeMax] = useState(50);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [timeStep, setTimeStep] = useState(0.1); // Animation speed
  const [showHalfLifeLine, setShowHalfLifeLine] = useState(true);
  const [graphType, setGraphType] = useState("exponential"); // exponential or logarithmic
  const canvasRef = useRef(null);

  const canvasWidth = 800; // Increased for better resolution
  const canvasHeight = 400;

  // Sync half-life and decay constant
  useEffect(() => {
    if (inputMode === "halfLife") {
      setDecayConstant(Math.log(2) / halfLife);
    } else {
      setHalfLife(Math.log(2) / decayConstant);
    }
  }, [inputMode, halfLife, decayConstant]);

  // Animation logic
  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setCurrentTime((t) => {
          if (t >= timeMax) {
            setIsAnimating(false);
            return timeMax;
          }
          return t + timeStep;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isAnimating, timeMax, timeStep]);

  // Draw graph on change
  useEffect(() => {
    drawDecayGraph();
  }, [
    initialAmount,
    decayConstant,
    timeMax,
    currentTime,
    showHalfLifeLine,
    graphType,
  ]);

  const calculateRemaining = (t) => {
    return initialAmount * Math.exp(-decayConstant * t);
  };

  const drawDecayGraph = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const margin = 60;
    const scaleX = (canvasWidth - 2 * margin) / timeMax;
    const scaleY =
      graphType === "exponential"
        ? (canvasHeight - 2 * margin) / initialAmount
        : (canvasHeight - 2 * margin) / Math.log(initialAmount + 1);

    // Draw axes
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
    ctx.strokeStyle = "#333";
    ctx.stroke();

    // Label axes
    ctx.font = "14px Arial";
    ctx.fillStyle = "#333";
    ctx.fillText("Time (t)", canvasWidth - margin + 15, canvasHeight - margin + 5);
    ctx.fillText(
      graphType === "exponential" ? "N(t)" : "ln(N(t))",
      margin - 50,
      margin - 10
    );

    // Draw grid
    ctx.beginPath();
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;
    for (let x = margin; x <= canvasWidth - margin; x += scaleX * 5) {
      ctx.moveTo(x, canvasHeight - margin);
      ctx.lineTo(x, margin);
    }
    for (
      let y = canvasHeight - margin;
      y >= margin;
      y -= scaleY * (graphType === "exponential" ? 10 : 1)
    ) {
      ctx.moveTo(margin, y);
      ctx.lineTo(canvasWidth - margin, y);
    }
    ctx.stroke();

    // Draw decay curve
    ctx.beginPath();
    ctx.strokeStyle = "#1e90ff";
    ctx.lineWidth = 2;
    for (let t = 0; t <= Math.min(currentTime, timeMax); t += 0.1) {
      const x = margin + t * scaleX;
      const remaining = calculateRemaining(t);
      const y =
        graphType === "exponential"
          ? canvasHeight - margin - remaining * scaleY
          : canvasHeight - margin - Math.log(remaining + 1) * scaleY;
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw half-life line
    if (showHalfLifeLine) {
      const halfAmount = initialAmount / 2;
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = "#ff4500";
      ctx.moveTo(
        margin,
        graphType === "exponential"
          ? canvasHeight - margin - halfAmount * scaleY
          : canvasHeight - margin - Math.log(halfAmount + 1) * scaleY
      );
      ctx.lineTo(
        margin + halfLife * scaleX,
        graphType === "exponential"
          ? canvasHeight - margin - halfAmount * scaleY
          : canvasHeight - margin - Math.log(halfAmount + 1) * scaleY
      );
      ctx.lineTo(margin + halfLife * scaleX, canvasHeight - margin);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw current point
    if (currentTime > 0 && currentTime <= timeMax) {
      const currentAmount = calculateRemaining(currentTime);
      ctx.beginPath();
      ctx.arc(
        margin + currentTime * scaleX,
        graphType === "exponential"
          ? canvasHeight - margin - currentAmount * scaleY
          : canvasHeight - margin - Math.log(currentAmount + 1) * scaleY,
        5,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "#32cd32";
      ctx.fill();
    }
  }, [
    initialAmount,
    decayConstant,
    timeMax,
    currentTime,
    showHalfLifeLine,
    graphType,
  ]);

  const formatNumber = (num, digits = 2) =>
    num.toLocaleString("en-US", { maximumFractionDigits: digits });

  // Download graph
  const downloadGraph = () => {
    if (canvasRef.current) {
      html2canvas(canvasRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `decay-graph-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Nuclear Decay Simulator
        </h1>

        <div className="space-y-6">
          {/* Canvas */}
          <div>
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="w-full border border-gray-300 rounded-lg shadow-sm"
            />
            <p className="text-sm text-gray-600 mt-2">
              Blue: Decay Curve | Red: Half-Life | Green: Current Point
            </p>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Amount (N₀)
              </label>
              <input
                type="number"
                min="1"
                value={initialAmount}
                onChange={(e) =>
                  setInitialAmount(Math.max(1, parseFloat(e.target.value) || 1))
                }
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
                {inputMode === "halfLife" ? "Half-Life (t½)" : "Decay Constant (λ)"}
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={inputMode === "halfLife" ? halfLife : decayConstant}
                onChange={(e) => {
                  const value = Math.max(0.01, parseFloat(e.target.value) || 0.01);
                  if (inputMode === "halfLife") setHalfLife(value);
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
                onChange={(e) =>
                  setTimeMax(Math.max(1, parseFloat(e.target.value) || 1))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Step
              </label>
              <input
                type="number"
                min="0.01"
                max="1"
                step="0.01"
                value={timeStep}
                onChange={(e) =>
                  setTimeStep(Math.max(0.01, Math.min(1, parseFloat(e.target.value) || 0.01)))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Graph Type
              </label>
              <select
                value={graphType}
                onChange={(e) => setGraphType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="exponential">Exponential</option>
                <option value="logarithmic">Logarithmic</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showHalfLifeLine}
                  onChange={(e) => setShowHalfLifeLine(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Show Half-Life Line</span>
              </label>
            </div>
          </div>

          {/* Animation Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center transition-colors"
            >
              {isAnimating ? <FaPause className="mr-2" /> : <FaPlay className="mr-2" />}
              {isAnimating ? "Pause" : "Start"}
            </button>
            <button
              onClick={() => {
                setIsAnimating(false);
                setCurrentTime(0);
              }}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center justify-center transition-colors"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={downloadGraph}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center transition-colors"
            >
              <FaDownload className="mr-2" /> Download Graph
            </button>
          </div>

          {/* Results */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Decay Properties</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <p>Initial Amount: {formatNumber(initialAmount)} nuclei</p>
              <p>Half-Life: {formatNumber(halfLife)} time units</p>
              <p>Decay Constant: {formatNumber(decayConstant)} /time unit</p>
              <p>Current Time: {formatNumber(currentTime)} time units</p>
              <p>Remaining: {formatNumber(calculateRemaining(currentTime))} nuclei</p>
              <p>
                Decay Rate: {formatNumber(decayConstant * calculateRemaining(currentTime))}{" "}
                nuclei/time unit
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Exponential and logarithmic graph views</li>
              <li>Adjustable time step for animation speed</li>
              <li>Toggle half-life line visibility</li>
              <li>Real-time decay simulation</li>
              <li>Download graph as PNG</li>
            </ul>
          </div>

          {/* About */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Simulates radioactive decay using:</p>
                <p>N(t) = N₀ e⁻ᵞᵗ</p>
                <p>t½ = ln(2)/λ</p>
                <p>Decay Rate = λN(t)</p>
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