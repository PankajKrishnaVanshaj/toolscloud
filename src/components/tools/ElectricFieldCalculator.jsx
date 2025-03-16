"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaPlus, FaTrash, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the visualization

const ElectricFieldCalculator = () => {
  const [charges, setCharges] = useState([
    { x: -50, y: 0, q: 1e-6 }, // 1 μC at (-50, 0)
    { x: 50, y: 0, q: -1e-6 }, // -1 μC at (50, 0)
  ]);
  const [point, setPoint] = useState({ x: 0, y: 0 });
  const [showFieldLines, setShowFieldLines] = useState(false);
  const [gridSize, setGridSize] = useState(50);
  const [scale, setScale] = useState(5);
  const canvasRef = useRef(null);

  const canvasWidth = 800; // Increased for better visibility
  const canvasHeight = 500;
  const k = 8.9875517923e9; // Coulomb's constant (N·m²/C²)

  useEffect(() => {
    drawField();
  }, [charges, point, showFieldLines, gridSize, scale]);

  const calculateElectricField = useCallback((x, y) => {
    let Ex = 0;
    let Ey = 0;

    charges.forEach((charge) => {
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
  }, [charges]);

  const drawField = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    // Draw grid
    ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvasWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y < canvasHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }

    // Draw field lines (simplified)
    if (showFieldLines) {
      ctx.strokeStyle = "rgba(128, 0, 128, 0.3)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 16; i++) {
        charges.forEach((charge) => {
          let x = charge.x;
          let y = charge.y;
          const angleStep = (Math.PI * 2) / 16;
          let currentAngle = i * angleStep;
          ctx.beginPath();
          ctx.moveTo(centerX + x * scale, centerY - y * scale);

          for (let step = 0; step < 50; step++) {
            const field = calculateElectricField(x, y);
            if (!field.magnitude) break;
            const direction = charge.q > 0 ? 1 : -1;
            x += (direction * field.Ex / field.magnitude) * 2;
            y += (direction * field.Ey / field.magnitude) * 2;
            ctx.lineTo(centerX + x * scale, centerY - y * scale);
          }
          ctx.stroke();
        });
      }
    }

    // Draw charges
    charges.forEach((charge) => {
      const x = centerX + charge.x * scale;
      const y = centerY - charge.y * scale;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = charge.q > 0 ? "red" : "blue";
      ctx.fill();
      ctx.strokeStyle = "black";
      ctx.stroke();
      ctx.fillStyle = "black";
      ctx.font = "12px Arial";
      ctx.fillText(`${(charge.q * 1e6).toFixed(1)} μC`, x + 12, y);
    });

    // Draw test point and field vector
    const testX = centerX + point.x * scale;
    const testY = centerY - point.y * scale;
    ctx.beginPath();
    ctx.arc(testX, testY, 5, 0, Math.PI * 2);
    ctx.fillStyle = "green";
    ctx.fill();

    const field = calculateElectricField(point.x, point.y);
    if (field.magnitude > 0) {
      const vectorLength = Math.min(field.magnitude / 1e5, 50);
      const endX = testX + vectorLength * (field.Ex / field.magnitude) * scale;
      const endY = testY - vectorLength * (field.Ey / field.magnitude) * scale;
      ctx.beginPath();
      ctx.moveTo(testX, testY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = "purple";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Arrowhead
      const angle = Math.atan2(endY - testY, endX - testX);
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - 10 * Math.cos(angle - Math.PI / 6),
        endY - 10 * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - 10 * Math.cos(angle + Math.PI / 6),
        endY - 10 * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
    }
  };

  const addCharge = () => {
    setCharges([...charges, { x: 0, y: 0, q: 1e-6 }]);
  };

  const updateCharge = (index, field, value) => {
    setCharges((prev) => {
      const newCharges = [...prev];
      newCharges[index] = {
        ...newCharges[index],
        [field]: field === "q" ? (parseFloat(value) || 0) * 1e-6 : parseFloat(value) || 0,
      };
      return newCharges;
    });
  };

  const removeCharge = (index) => {
    setCharges((prev) => prev.filter((_, i) => i !== index));
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    html2canvas(canvas).then((canvas) => {
      const link = document.createElement("a");
      link.download = `electric-field-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  const formatNumber = (num, digits = 2) =>
    num.toLocaleString("en-US", { maximumFractionDigits: digits });

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Electric Field Calculator
        </h1>

        <div className="space-y-6">
          {/* Canvas and Controls */}
          <div className="space-y-4">
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="w-full border border-gray-300 rounded-md"
            />
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showFieldLines}
                  onChange={(e) => setShowFieldLines(e.target.checked)}
                  className="accent-blue-500"
                />
                <span className="text-sm text-gray-700">Show Field Lines</span>
              </div>
              <div className="flex gap-4">
                <div>
                  <label className="block text-sm text-gray-700">Grid Size (px)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={gridSize}
                    onChange={(e) => setGridSize(Math.max(10, Math.min(100, e.target.value)))}
                    className="w-20 px-2 py-1 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700">Scale</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    value={scale}
                    onChange={(e) => setScale(Math.max(1, Math.min(10, e.target.value)))}
                    className="w-20 px-2 py-1 border rounded-md"
                  />
                </div>
              </div>
              <button
                onClick={downloadCanvas}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Red: Positive | Blue: Negative | Green: Test Point | Purple: Field Vector
            </p>
          </div>

          {/* Test Point */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {["x", "y"].map((coord) => (
              <div key={coord}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Point {coord.toUpperCase()} (m)
                </label>
                <input
                  type="number"
                  step="10"
                  value={point[coord]}
                  onChange={(e) =>
                    setPoint({ ...point, [coord]: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          {/* Charges */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Charges</h2>
            <div className="space-y-4">
              {charges.map((charge, index) => (
                <div
                  key={index}
                  className="border p-4 rounded-md grid grid-cols-1 sm:grid-cols-4 gap-4"
                >
                  {["x", "y", "q"].map((field) => (
                    <div key={field}>
                      <label className="block text-sm text-gray-700">
                        {field === "q" ? "Charge (μC)" : `${field.toUpperCase()} (m)`}
                      </label>
                      <input
                        type="number"
                        step={field === "q" ? "0.1" : "10"}
                        value={field === "q" ? charge[field] * 1e6 : charge[field]}
                        onChange={(e) => updateCharge(index, field, e.target.value)}
                        className="w-full px-2 py-1 border rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                  <div className="flex items-end">
                    <button
                      onClick={() => removeCharge(index)}
                      className="w-full px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center justify-center"
                    >
                      <FaTrash className="mr-2" /> Remove
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={addCharge}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center justify-center"
              >
                <FaPlus className="mr-2" /> Add Charge
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">
              Electric Field at ({point.x}, {point.y}):
            </h2>
            {(() => {
              const field = calculateElectricField(point.x, point.y);
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <p>Ex: {formatNumber(field.Ex)} N/C</p>
                  <p>Ey: {formatNumber(field.Ey)} N/C</p>
                  <p>Magnitude: {formatNumber(field.magnitude)} N/C</p>
                  <p>
                    Direction: {formatNumber((Math.atan2(field.Ey, field.Ex) * 180) / Math.PI)}°
                  </p>
                </div>
              );
            })()}
          </div>

          {/* Features and Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Multiple point charges with adjustable positions and magnitudes</li>
              <li>2D visualization with field vector and optional field lines</li>
              <li>Customizable grid size and scale</li>
              <li>Download visualization as PNG</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectricFieldCalculator;