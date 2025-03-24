"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaDownload, FaSync } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the canvas

const LightRefractionSimulator = () => {
  const [n1, setN1] = useState(1.0); // Refractive index of medium 1
  const [n2, setN2] = useState(1.5); // Refractive index of medium 2
  const [angleIncident, setAngleIncident] = useState(30); // Angle of incidence in degrees
  const [rayLength, setRayLength] = useState(150); // Length of rays
  const [showLabels, setShowLabels] = useState(true); // Toggle angle labels
  const [showGrid, setShowGrid] = useState(false); // Toggle grid
  const canvasRef = useRef(null);

  const canvasWidth = 600;
  const canvasHeight = 400;

  useEffect(() => {
    drawRefraction();
  }, [n1, n2, angleIncident, rayLength, showLabels, showGrid]);

  const calculateRefraction = () => {
    const theta1 = (angleIncident * Math.PI) / 180; // Convert to radians
    const sinTheta2 = (n1 * Math.sin(theta1)) / n2;

    if (Math.abs(sinTheta2) > 1) {
      return { theta2: null, tir: true };
    }

    const theta2 = Math.asin(sinTheta2); // Refracted angle in radians
    return { theta2: (theta2 * 180) / Math.PI, tir: false }; // Convert back to degrees
  };

  const drawRefraction = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    // Draw grid if enabled
    if (showGrid) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= canvasWidth; x += 20) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
      }
      for (let y = 0; y <= canvasHeight; y += 20) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
      }
      ctx.stroke();
    }

    // Draw interface between media
    ctx.fillStyle = "rgba(200, 200, 255, 0.3)";
    ctx.fillRect(0, centerY, canvasWidth, centerY); // Medium 2 (bottom)
    ctx.fillStyle = "rgba(255, 255, 200, 0.3)";
    ctx.fillRect(0, 0, canvasWidth, centerY); // Medium 1 (top)
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvasWidth, centerY);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw normal line
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 100);
    ctx.lineTo(centerX, centerY + 100);
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "gray";
    ctx.stroke();
    ctx.setLineDash([]);

    const { theta2, tir } = calculateRefraction();
    const theta1Rad = (angleIncident * Math.PI) / 180;

    // Draw incident ray
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    const incidentX = centerX - rayLength * Math.sin(theta1Rad);
    const incidentY = centerY - rayLength * Math.cos(theta1Rad);
    ctx.lineTo(incidentX, incidentY);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw reflected ray
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    const reflectX = centerX + rayLength * Math.sin(theta1Rad);
    const reflectY = centerY - rayLength * Math.cos(theta1Rad);
    ctx.lineTo(reflectX, reflectY);
    ctx.strokeStyle = "orange";
    ctx.stroke();

    // Draw refracted ray or indicate TIR
    let refractX, refractY;
    if (tir) {
      ctx.fillStyle = "black";
      ctx.font = "16px Arial";
      ctx.fillText("Total Internal Reflection", centerX - 80, centerY + 50);
    } else {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      refractX = centerX + rayLength * Math.sin((theta2 * Math.PI) / 180);
      refractY = centerY + rayLength * Math.cos((theta2 * Math.PI) / 180);
      ctx.lineTo(refractX, refractY);
      ctx.strokeStyle = "blue";
      ctx.stroke();
    }

    // Draw angle labels if enabled
    if (showLabels) {
      ctx.font = "14px Arial";
      ctx.fillStyle = "red";
      ctx.fillText(`θ₁ = ${angleIncident}°`, incidentX + 10, incidentY);
      if (!tir && theta2 !== null) {
        ctx.fillStyle = "blue";
        ctx.fillText(`θ₂ = ${theta2.toFixed(1)}°`, refractX + 10, refractY);
      }
    }
  };

  const formatNumber = (num, digits = 2) =>
    num.toLocaleString("en-US", { maximumFractionDigits: digits });

  const reset = () => {
    setN1(1.0);
    setN2(1.5);
    setAngleIncident(30);
    setRayLength(150);
    setShowLabels(true);
    setShowGrid(false);
  };

  const downloadCanvas = () => {
    if (canvasRef.current) {
      html2canvas(canvasRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `refraction-simulation-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Light Refraction Simulator
        </h1>

        <div className="space-y-6">
          {/* Canvas */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="w-full border border-gray-300 rounded-md shadow-sm"
            />
            <p className="text-sm text-gray-600 mt-2">
              Red: Incident Ray | Orange: Reflected Ray | Blue: Refracted Ray
            </p>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                n₁ (Medium 1)
              </label>
              <input
                type="number"
                min="1"
                step="0.1"
                value={n1}
                onChange={(e) => setN1(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                n₂ (Medium 2)
              </label>
              <input
                type="number"
                min="1"
                step="0.1"
                value={n2}
                onChange={(e) => setN2(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Incident Angle (°)
              </label>
              <input
                type="range"
                min="0"
                max="90"
                value={angleIncident}
                onChange={(e) => setAngleIncident(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-sm text-gray-600">{angleIncident}°</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ray Length (px)
              </label>
              <input
                type="range"
                min="50"
                max="200"
                value={rayLength}
                onChange={(e) => setRayLength(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-sm text-gray-600">{rayLength}px</span>
            </div>
          </div>

          {/* Additional Options */}
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Show Angle Labels</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Show Grid</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={downloadCanvas}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>

          {/* Results */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">Properties</h2>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>n₁: {formatNumber(n1)} (Medium 1)</li>
              <li>n₂: {formatNumber(n2)} (Medium 2)</li>
              <li>Incident Angle: {angleIncident}°</li>
              {(() => {
                const { theta2, tir } = calculateRefraction();
                return tir ? (
                  <li>Total Internal Reflection</li>
                ) : (
                  <li>Refracted Angle: {formatNumber(theta2)}°</li>
                );
              })()}
              <li>
                Critical Angle:{" "}
                {n1 > n2
                  ? formatNumber((Math.asin(n2 / n1) * 180) / Math.PI)
                  : "N/A"}{" "}
                {n1 > n2 ? "°" : "(n₁ ≤ n₂)"}
              </li>
            </ul>
          </div>

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Presets</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Air to Glass", n1: 1.0, n2: 1.5, angle: 30 },
                { label: "Glass to Air", n1: 1.5, n2: 1.0, angle: 45 },
                { label: "Water to Glass", n1: 1.33, n2: 1.5, angle: 40 },
                { label: "Glass to Diamond", n1: 1.5, n2: 2.42, angle: 25 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setN1(preset.n1);
                    setN2(preset.n2);
                    setAngleIncident(preset.angle);
                  }}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">About</h3>
            <p className="text-sm text-blue-600">
              Simulates light refraction using Snell&apos;s Law: n₁ sin(θ₁) = n₂ sin(θ₂)
            </p>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1 mt-2">
              <li>Visualizes incident, reflected, and refracted rays</li>
              <li>Detects total internal reflection</li>
              <li>Adjustable parameters with sliders</li>
              <li>Downloadable simulation view</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LightRefractionSimulator;