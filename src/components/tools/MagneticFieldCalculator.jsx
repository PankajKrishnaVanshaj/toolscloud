"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaInfoCircle } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the visualization

const MagneticFieldCalculator = () => {
  const [config, setConfig] = useState("wire");
  const [current, setCurrent] = useState(1);
  const [distance, setDistance] = useState(0.01);
  const [turns, setTurns] = useState(100);
  const [length, setLength] = useState(0.1);
  const [radius, setRadius] = useState(0.05);
  const [result, setResult] = useState(null);
  const [unit, setUnit] = useState("T"); // T, mT, G
  const [showFieldLines, setShowFieldLines] = useState(true);
  const canvasRef = useRef(null);

  const canvasWidth = 400;
  const canvasHeight = 300;
  const μ0 = 4 * Math.PI * 1e-7; // Permeability of free space (H/m)

  // Recalculate and redraw when inputs change
  useEffect(() => {
    calculateMagneticField();
    drawVisualization();
  }, [config, current, distance, turns, length, radius, showFieldLines]);

  // Calculate magnetic field
  const calculateMagneticField = useCallback(() => {
    const I = parseFloat(current);
    const r = parseFloat(distance);
    const N = parseInt(turns);
    const L = parseFloat(length);
    const R = parseFloat(radius);

    if (
      isNaN(I) ||
      I <= 0 ||
      isNaN(r) ||
      r <= 0 ||
      (config === "solenoid" && (isNaN(N) || N <= 0 || isNaN(L) || L <= 0)) ||
      (config === "loop" && (isNaN(R) || R <= 0))
    ) {
      setResult({ error: "Please enter valid positive values" });
      return;
    }

    let B, formula;
    try {
      switch (config) {
        case "wire":
          B = (μ0 * I) / (2 * Math.PI * r);
          formula = "B = μ₀I / (2πr)";
          break;
        case "solenoid":
          B = (μ0 * N * I) / L;
          formula = "B = μ₀NI / L";
          break;
        case "loop":
          B = (μ0 * I) / (2 * R);
          formula = "B = μ₀I / (2R)";
          break;
        default:
          throw new Error("Unknown configuration");
      }

      setResult({
        B, // Tesla
        B_mT: B * 1000, // milliTesla
        B_G: B * 10000, // Gauss
        formula,
        error: null,
      });
    } catch (err) {
      setResult({ error: "Calculation error: " + err.message });
    }
  }, [config, current, distance, turns, length, radius]);

  // Draw visualization
  const drawVisualization = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    switch (config) {
      case "wire":
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, canvasHeight);
        ctx.stroke();
        if (showFieldLines) {
          ctx.setLineDash([5, 5]);
          ctx.strokeStyle = "blue";
          for (let r = 20; r <= 80; r += 20) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
            ctx.stroke();
          }
          ctx.setLineDash([]);
        }
        break;
      case "solenoid":
        ctx.beginPath();
        ctx.rect(centerX - 60, centerY - 60, 120, 120);
        ctx.stroke();
        for (let y = centerY - 50; y <= centerY + 50; y += 20) {
          ctx.beginPath();
          ctx.arc(centerX, y, 12, 0, Math.PI, true);
          ctx.stroke();
        }
        if (showFieldLines) {
          ctx.strokeStyle = "blue";
          for (let x = centerX - 40; x <= centerX + 40; x += 20) {
            ctx.beginPath();
            ctx.moveTo(x, centerY - 50);
            ctx.lineTo(x, centerY + 50);
            ctx.stroke();
          }
        }
        break;
      case "loop":
        ctx.beginPath();
        ctx.arc(centerX, centerY, 60, 0, 2 * Math.PI);
        ctx.stroke();
        if (showFieldLines) {
          ctx.strokeStyle = "blue";
          ctx.beginPath();
          ctx.moveTo(centerX, centerY - 70);
          ctx.lineTo(centerX, centerY + 70);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(centerX - 40, centerY, 20, -Math.PI / 2, Math.PI / 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(centerX + 40, centerY, 20, Math.PI / 2, -Math.PI / 2);
          ctx.stroke();
        }
        break;
    }
  }, [config, showFieldLines]);

  // Format number based on selected unit
  const formatResult = () => {
    if (!result || result.error) return null;
    switch (unit) {
      case "T":
        return `${formatNumber(result.B)} T (Tesla)`;
      case "mT":
        return `${formatNumber(result.B_mT)} mT (milliTesla)`;
      case "G":
        return `${formatNumber(result.B_G)} G (Gauss)`;
      default:
        return `${formatNumber(result.B)} T`;
    }
  };

  const formatNumber = (num, digits = 6) => {
    return num.toLocaleString("en-US", { maximumFractionDigits: digits });
  };

  // Download visualization
  const downloadVisualization = () => {
    if (canvasRef.current) {
      html2canvas(canvasRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `magnetic-field-${config}-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  // Reset to default values
  const reset = () => {
    setConfig("wire");
    setCurrent(1);
    setDistance(0.01);
    setTurns(100);
    setLength(0.1);
    setRadius(0.05);
    setUnit("T");
    setShowFieldLines(true);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Magnetic Field Calculator
        </h1>

        <div className="space-y-6">
          {/* Configuration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Configuration
            </label>
            <select
              value={config}
              onChange={(e) => setConfig(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="wire">Straight Wire</option>
              <option value="solenoid">Solenoid</option>
              <option value="loop">Circular Loop</option>
            </select>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current (A)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distance from Source (m)
              </label>
              <input
                type="number"
                min="0.001"
                step="0.001"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {config === "solenoid" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Turns
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={turns}
                    onChange={(e) => setTurns(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Length (m)
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
            {config === "loop" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Radius (m)
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Visualization */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showFieldLines}
                  onChange={(e) => setShowFieldLines(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Show Field Lines</span>
              </label>
              <button
                onClick={downloadVisualization}
                className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="w-full border border-gray-300 rounded-md"
            />
            <p className="text-sm text-gray-600 mt-2">
              Black: Conductor | Blue: Magnetic Field Lines
            </p>
          </div>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Magnetic Field Strength:
              </h2>
              {result.error ? (
                <p className="text-red-600">{result.error}</p>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <p className="text-gray-700">{formatResult()}</p>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="p-1 border rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="T">Tesla (T)</option>
                      <option value="mT">milliTesla (mT)</option>
                      <option value="G">Gauss (G)</option>
                    </select>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Formula: {result.formula}</p>
                </>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Presets
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setConfig("wire");
                    setCurrent(1);
                    setDistance(0.01);
                  }}
                  className="flex-1 py-1 px-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  Wire (1A, 1cm)
                </button>
                <button
                  onClick={() => {
                    setConfig("solenoid");
                    setCurrent(2);
                    setTurns(100);
                    setLength(0.1);
                  }}
                  className="flex-1 py-1 px-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  Solenoid (2A)
                </button>
                <button
                  onClick={() => {
                    setConfig("loop");
                    setCurrent(1);
                    setRadius(0.05);
                  }}
                  className="flex-1 py-1 px-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  Loop (1A, 5cm)
                </button>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <details>
              <summary className="cursor-pointer font-semibold text-blue-700 flex items-center">
                <FaInfoCircle className="mr-2" /> About
              </summary>
              <div className="mt-2 text-sm text-blue-600 space-y-2">
                <p>Calculates magnetic field strength using Biot-Savart Law derivations:</p>
                <ul className="list-disc list-inside">
                  <li>Wire: B = μ₀I / (2πr)</li>
                  <li>Solenoid: B = μ₀NI / L</li>
                  <li>Loop: B = μ₀I / (2R) (at center)</li>
                </ul>
                <p>μ₀ = 4π × 10⁻⁷ H/m (permeability of free space)</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagneticFieldCalculator;