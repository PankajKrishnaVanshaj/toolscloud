"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaPlay, FaPause, FaSync, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the canvas

const WaveInterferenceSimulator = () => {
  const [wave1, setWave1] = useState({ amplitude: 1, frequency: 1, phase: 0 });
  const [wave2, setWave2] = useState({ amplitude: 1, frequency: 1.2, phase: 0 });
  const [time, setTime] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [speed, setSpeed] = useState(0.05); // Animation speed
  const [showIndividual, setShowIndividual] = useState(true); // Toggle individual waves
  const [showResultant, setShowResultant] = useState(true); // Toggle resultant wave
  const canvasRef = useRef(null);

  const canvasWidth = 800;
  const canvasHeight = 400;

  // Animation control
  useEffect(() => {
    let interval;
    if (isAnimating) {
      interval = setInterval(() => {
        setTime((t) => t + speed);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isAnimating, speed]);

  // Draw waves on canvas
  const drawWaves = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const centerY = canvasHeight / 2;
    const scaleY = 50;

    // Draw individual waves
    if (showIndividual) {
      // Wave 1
      ctx.beginPath();
      ctx.strokeStyle = "red";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvasWidth; x++) {
        const y =
          centerY -
          wave1.amplitude *
            Math.sin(2 * Math.PI * wave1.frequency * time + x / 50 - wave1.phase) *
            scaleY;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Wave 2
      ctx.beginPath();
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvasWidth; x++) {
        const y =
          centerY -
          wave2.amplitude *
            Math.sin(2 * Math.PI * wave2.frequency * time + x / 50 - wave2.phase) *
            scaleY;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Draw resultant wave
    if (showResultant) {
      ctx.beginPath();
      ctx.strokeStyle = "green";
      ctx.lineWidth = 2;
      for (let x = 0; x < canvasWidth; x++) {
        const y1 =
          wave1.amplitude *
          Math.sin(2 * Math.PI * wave1.frequency * time + x / 50 - wave1.phase);
        const y2 =
          wave2.amplitude *
          Math.sin(2 * Math.PI * wave2.frequency * time + x / 50 - wave2.phase);
        const y = centerY - (y1 + y2) * scaleY;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Draw zero line
    ctx.beginPath();
    ctx.strokeStyle = "gray";
    ctx.setLineDash([5, 5]);
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvasWidth, centerY);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [wave1, wave2, time, showIndividual, showResultant]);

  useEffect(() => {
    drawWaves();
  }, [drawWaves]);

  // Handle wave parameter changes
  const handleWaveChange = (waveNum, field, value) => {
    const parsedValue = parseFloat(value) || 0;
    if (waveNum === 1) {
      setWave1((prev) => ({ ...prev, [field]: parsedValue }));
    } else {
      setWave2((prev) => ({ ...prev, [field]: parsedValue }));
    }
  };

  // Download canvas as image
  const downloadCanvas = () => {
    if (canvasRef.current) {
      html2canvas(canvasRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `wave-interference-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  // Reset simulation
  const reset = () => {
    setWave1({ amplitude: 1, frequency: 1, phase: 0 });
    setWave2({ amplitude: 1, frequency: 1.2, phase: 0 });
    setTime(0);
    setSpeed(0.05);
    setIsAnimating(false);
    setShowIndividual(true);
    setShowResultant(true);
  };

  const formatNumber = (num, digits = 2) =>
    num.toLocaleString("en-US", { maximumFractionDigits: digits });

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Wave Interference Simulator
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
              Red: Wave 1 | Blue: Wave 2 | Green: Resultant Wave
            </p>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { num: 1, wave: wave1, title: "Wave 1", color: "text-red-600" },
              { num: 2, wave: wave2, title: "Wave 2", color: "text-blue-600" },
            ].map(({ num, wave, title, color }) => (
              <div key={num} className="border p-4 rounded-lg shadow-sm">
                <h3 className={`font-semibold mb-2 ${color}`}>{title}</h3>
                {["amplitude", "frequency", "phase"].map((field) => (
                  <div key={field} className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {field} ({field === "phase" ? "rad" : field === "frequency" ? "Hz" : ""})
                    </label>
                    <input
                      type="range"
                      min={field === "amplitude" ? 0 : field === "frequency" ? 0.1 : -Math.PI}
                      max={field === "amplitude" ? 2 : field === "frequency" ? 5 : Math.PI}
                      step="0.1"
                      value={wave[field]}
                      onChange={(e) => handleWaveChange(num, field, e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-sm text-gray-600">
                      {formatNumber(wave[field])}
                      {field === "phase" ? " rad" : field === "frequency" ? " Hz" : ""}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Animation and Display Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Animation Speed
              </label>
              <input
                type="range"
                min="0.01"
                max="0.2"
                step="0.01"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-sm text-gray-600">{formatNumber(speed)} s/step</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showIndividual}
                  onChange={(e) => setShowIndividual(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Show Individual Waves</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showResultant}
                  onChange={(e) => setShowResultant(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Show Resultant Wave</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              {isAnimating ? <FaPause className="mr-2" /> : <FaPlay className="mr-2" />}
              {isAnimating ? "Pause" : "Play"}
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={downloadCanvas}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>

          {/* Wave Properties */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Wave Properties</h2>
            <p>
              Wave 1: A = {formatNumber(wave1.amplitude)}, f = {formatNumber(wave1.frequency)}{" "}
              Hz, φ = {formatNumber(wave1.phase)} rad
            </p>
            <p>
              Wave 2: A = {formatNumber(wave2.amplitude)}, f = {formatNumber(wave2.frequency)}{" "}
              Hz, φ = {formatNumber(wave2.phase)} rad
            </p>
            <p>Time: {formatNumber(time)} s</p>
          </div>

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Presets</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "In Phase", w1: { amplitude: 1, frequency: 1, phase: 0 }, w2: { amplitude: 1, frequency: 1, phase: 0 } },
                { label: "Out of Phase", w1: { amplitude: 1, frequency: 1, phase: 0 }, w2: { amplitude: 1, frequency: 1, phase: Math.PI } },
                { label: "Beat Pattern", w1: { amplitude: 1, frequency: 1, phase: 0 }, w2: { amplitude: 1, frequency: 1.5, phase: 0 } },
                { label: "High Frequency", w1: { amplitude: 1, frequency: 3, phase: 0 }, w2: { amplitude: 1, frequency: 3.2, phase: 0 } },
              ].map((preset, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setWave1(preset.w1);
                    setWave2(preset.w2);
                  }}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* About */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">About</h3>
            <p className="text-sm text-blue-600">
              This simulator visualizes the interference of two sinusoidal waves:
            </p>
            <p className="text-sm text-blue-600">y = A sin(ωt + kx - φ)</p>
            <p className="text-sm text-blue-600">Resultant = y₁ + y₂</p>
            <ul className="list-disc list-inside text-blue-600 text-sm mt-2 space-y-1">
              <li>Adjust amplitude, frequency, and phase</li>
              <li>Toggle individual and resultant waves</li>
              <li>Control animation speed</li>
              <li>Download simulation snapshot</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaveInterferenceSimulator;