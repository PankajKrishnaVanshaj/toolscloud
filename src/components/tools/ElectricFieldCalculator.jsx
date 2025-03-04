'use client'
import React, { useState, useEffect, useRef } from 'react';

const ElectricFieldCalculator = () => {
  const [charges, setCharges] = useState([
    { x: -50, y: 0, q: 1e-6 }, // Example: 1 μC at (-50, 0)
    { x: 50, y: 0, q: -1e-6 }, // Example: -1 μC at (50, 0)
  ]);
  const [point, setPoint] = useState({ x: 0, y: 0 }); // Point to calculate field at
  const canvasRef = useRef(null);

  const canvasWidth = 600;
  const canvasHeight = 400;
  const k = 8.9875517923e9; // Coulomb's constant (N·m²/C²)
  const scale = 5; // Scale factor for visualization

  useEffect(() => {
    drawField();
  }, [charges, point]);

  const calculateElectricField = (x, y) => {
    let Ex = 0;
    let Ey = 0;

    charges.forEach(charge => {
      const dx = x - charge.x;
      const dy = y - charge.y;
      const r = Math.sqrt(dx * dx + dy * dy);
      if (r === 0) return; // Avoid division by zero

      const magnitude = (k * Math.abs(charge.q)) / (r * r);
      const angle = Math.atan2(dy, dx);
      Ex += magnitude * Math.cos(angle) * (charge.q > 0 ? 1 : -1);
      Ey += magnitude * Math.sin(angle) * (charge.q > 0 ? 1 : -1);
    });

    return { Ex, Ey, magnitude: Math.sqrt(Ex * Ex + Ey * Ey) };
  };

  const drawField = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    // Draw grid
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvasWidth; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y < canvasHeight; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }

    // Draw charges
    charges.forEach(charge => {
      const x = centerX + charge.x * scale;
      const y = centerY - charge.y * scale;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = charge.q > 0 ? 'red' : 'blue';
      ctx.fill();
      ctx.strokeStyle = 'black';
      ctx.stroke();
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.fillText(`${(charge.q * 1e6).toFixed(1)} μC`, x + 12, y);
    });

    // Draw test point and field vector
    const testX = centerX + point.x * scale;
    const testY = centerY - point.y * scale;
    ctx.beginPath();
    ctx.arc(testX, testY, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'green';
    ctx.fill();

    const field = calculateElectricField(point.x, point.y);
    if (field.magnitude > 0) {
      const vectorLength = Math.min(field.magnitude / 1e5, 50); // Cap vector length
      const endX = testX + vectorLength * (field.Ex / field.magnitude) * scale;
      const endY = testY - vectorLength * (field.Ey / field.magnitude) * scale;
      ctx.beginPath();
      ctx.moveTo(testX, testY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = 'purple';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  const addCharge = () => {
    setCharges([...charges, { x: 0, y: 0, q: 1e-6 }]);
  };

  const updateCharge = (index, field, value) => {
    setCharges(prev => {
      const newCharges = [...prev];
      newCharges[index] = { ...newCharges[index], [field]: parseFloat(value) || 0 };
      return newCharges;
    });
  };

  const removeCharge = (index) => {
    setCharges(prev => prev.filter((_, i) => i !== index));
  };

  const formatNumber = (num, digits = 2) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Electric Field Calculator
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
              Red: Positive Charge | Blue: Negative Charge | Green: Test Point | Purple: Field Vector
            </p>
          </div>

          {/* Test Point */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Point X (m)
              </label>
              <input
                type="number"
                step="10"
                value={point.x}
                onChange={(e) => setPoint({ ...point, x: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Point Y (m)
              </label>
              <input
                type="number"
                step="10"
                value={point.y}
                onChange={(e) => setPoint({ ...point, y: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Charges */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Charges</h2>
            {charges.map((charge, index) => (
              <div key={index} className="border p-4 rounded-md mb-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <label className="block text-sm text-gray-700">X (m)</label>
                    <input
                      type="number"
                      step="10"
                      value={charge.x}
                      onChange={(e) => updateCharge(index, 'x', e.target.value)}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Y (m)</label>
                    <input
                      type="number"
                      step="10"
                      value={charge.y}
                      onChange={(e) => updateCharge(index, 'y', e.target.value)}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700">Charge (μC)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={charge.q * 1e6}
                      onChange={(e) => updateCharge(index, 'q', (parseFloat(e.target.value) || 0) * 1e-6)}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => removeCharge(index)}
                      className="w-full px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addCharge}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Add Charge
            </button>
          </div>

          {/* Results */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Electric Field at ({point.x}, {point.y}):</h2>
            {(() => {
              const field = calculateElectricField(point.x, point.y);
              return (
                <>
                  <p>Ex: {formatNumber(field.Ex)} N/C</p>
                  <p>Ey: {formatNumber(field.Ey)} N/C</p>
                  <p>Magnitude: {formatNumber(field.magnitude)} N/C</p>
                  <p>Direction: {formatNumber(Math.atan2(field.Ey, field.Ex) * 180 / Math.PI)}°</p>
                </>
              );
            })()}
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Calculates electric field using Coulomb's Law:</p>
                <p>E = k * |q| / r² (vector sum for multiple charges)</p>
                <p>Features:</p>
                <ul className="list-disc list-inside">
                  <li>Multiple point charges</li>
                  <li>2D visualization</li>
                  <li>Field vector at test point</li>
                  <li>Units in meters and microcoulombs</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectricFieldCalculator;