'use client';
import React, { useState, useEffect, useRef } from 'react';

const LightRefractionSimulator = () => {
  const [n1, setN1] = useState(1.0); // Refractive index of medium 1 (e.g., air)
  const [n2, setN2] = useState(1.5); // Refractive index of medium 2 (e.g., glass)
  const [angleIncident, setAngleIncident] = useState(30); // Angle of incidence in degrees
  const canvasRef = useRef(null);

  const canvasWidth = 600;
  const canvasHeight = 400;

  useEffect(() => {
    drawRefraction();
  }, [n1, n2, angleIncident]);

  const calculateRefraction = () => {
    const theta1 = (angleIncident * Math.PI) / 180; // Convert to radians
    const sinTheta2 = (n1 * Math.sin(theta1)) / n2;
    
    if (Math.abs(sinTheta2) > 1) {
      // Total internal reflection
      return { theta2: null, tir: true };
    }

    const theta2 = Math.asin(sinTheta2); // Refracted angle in radians
    return { theta2: (theta2 * 180) / Math.PI, tir: false }; // Convert back to degrees
  };

  const drawRefraction = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const rayLength = 150;

    // Draw interface between media
    ctx.fillStyle = 'rgba(200, 200, 255, 0.3)';
    ctx.fillRect(0, centerY, canvasWidth, centerY); // Medium 2 (bottom)
    ctx.fillStyle = 'rgba(255, 255, 200, 0.3)';
    ctx.fillRect(0, 0, canvasWidth, centerY); // Medium 1 (top)
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvasWidth, centerY);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw normal line
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 100);
    ctx.lineTo(centerX, centerY + 100);
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'gray';
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
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw reflected ray
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    const reflectX = centerX + rayLength * Math.sin(theta1Rad);
    const reflectY = centerY - rayLength * Math.cos(theta1Rad);
    ctx.lineTo(reflectX, reflectY);
    ctx.strokeStyle = 'orange';
    ctx.stroke();

    // Declare refractX and refractY in outer scope
    let refractX, refractY;
    
    // Draw refracted ray or indicate TIR
    if (tir) {
      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';
      ctx.fillText('Total Internal Reflection', centerX - 80, centerY + 50);
    } else {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      refractX = centerX + rayLength * Math.sin(theta2 * Math.PI / 180);
      refractY = centerY + rayLength * Math.cos(theta2 * Math.PI / 180);
      ctx.lineTo(refractX, refractY);
      ctx.strokeStyle = 'blue';
      ctx.stroke();
    }

    // Draw angle labels
    ctx.font = '14px Arial';
    ctx.fillStyle = 'red';
    ctx.fillText(`θ₁ = ${angleIncident}°`, incidentX + 10, incidentY);
    if (!tir && theta2 !== null) {
      ctx.fillStyle = 'blue';
      ctx.fillText(`θ₂ = ${theta2.toFixed(1)}°`, refractX + 10, refractY);
    }
  };

  const formatNumber = (num, digits = 2) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Light Refraction Simulator
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
              Red: Incident Ray | Orange: Reflected Ray | Blue: Refracted Ray
            </p>
          </div>

          {/* Controls */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Refractive Index (n₁)
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
                Refractive Index (n₂)
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
                Incident Angle (degrees)
              </label>
              <input
                type="number"
                min="0"
                max="90"
                value={angleIncident}
                onChange={(e) => setAngleIncident(Math.min(90, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Results */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Properties:</h2>
            <p>n₁: {formatNumber(n1)} (Medium 1)</p>
            <p>n₂: {formatNumber(n2)} (Medium 2)</p>
            <p>Incident Angle: {angleIncident}°</p>
            {(() => {
              const { theta2, tir } = calculateRefraction();
              return tir ? (
                <p>Total Internal Reflection</p>
              ) : (
                <p>Refracted Angle: {formatNumber(theta2)}°</p>
              );
            })()}
            <p>Critical Angle: {formatNumber((Math.asin(n2 / n1) * 180 / Math.PI) || 0)}° (if n₁ &gt; n₂)</p>
          </div>

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Presets
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setN1(1.0);
                  setN2(1.5);
                  setAngleIncident(30);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Air to Glass
              </button>
              <button
                onClick={() => {
                  setN1(1.5);
                  setN2(1.0);
                  setAngleIncident(45);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Glass to Air
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Simulates light refraction using Snell's Law:</p>
                <p>n₁ sin(θ₁) = n₂ sin(θ₂)</p>
                <p>Features:</p>
                <ul className="list-disc list-inside">
                  <li>Visualizes incident, reflected, and refracted rays</li>
                  <li>Detects total internal reflection</li>
                  <li>Adjustable refractive indices and angle</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LightRefractionSimulator;