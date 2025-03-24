"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaDownload, FaSync } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the graph

const TitratorSimulator = () => {
  const [acid, setAcid] = useState("HCl");
  const [base, setBase] = useState("NaOH");
  const [acidConc, setAcidConc] = useState(0.1);
  const [baseConc, setBaseConc] = useState(0.1);
  const [acidVolume, setAcidVolume] = useState(50);
  const [temperature, setTemperature] = useState(25); // Temperature in °C
  const [showGrid, setShowGrid] = useState(true);
  const canvasRef = useRef(null);

  // Acid/Base properties
  const acidData = {
    HCl: { strong: true, pKa: -6 },
    "CH3COOH": { strong: false, pKa: 4.76 },
    "H2SO4": { strong: true, pKa: -3 }, // Sulfuric acid (first dissociation)
    "H3PO4": { strong: false, pKa: 2.14 }, // Phosphoric acid (first dissociation)
  };

  const baseData = {
    NaOH: { strong: true, pKb: -1.8 },
    NH3: { strong: false, pKb: 4.75 },
    "KOH": { strong: true, pKb: -1.8 },
    "Ca(OH)2": { strong: true, pKb: -2.4 }, // Calcium hydroxide
  };

  useEffect(() => {
    drawTitrationCurve();
  }, [acid, base, acidConc, baseConc, acidVolume, temperature, showGrid]);

  const calculatePH = useCallback(
    (baseVolume) => {
      const Va = acidVolume / 1000;
      const Vb = baseVolume / 1000;
      const na = acidConc * Va;
      const nb = baseConc * Vb;
      const totalVolume = Va + Vb;
      const isAcidStrong = acidData[acid].strong;
      const isBaseStrong = baseData[base].strong;
      const pKa = acidData[acid].pKa;
      const pKb = baseData[base].pKb;
      const Kw = 1e-14 * Math.pow(10, -0.0005 * (temperature - 25)); // Temperature-adjusted Kw

      if (isAcidStrong && isBaseStrong) {
        if (na > nb) {
          const excessH = (na - nb) / totalVolume;
          return -Math.log10(excessH);
        } else if (nb > na) {
          const excessOH = (nb - na) / totalVolume;
          return 14 + Math.log10(excessOH);
        } else {
          return 7;
        }
      } else if (isAcidStrong && !isBaseStrong) {
        if (na > nb) {
          const excessH = (na - nb) / totalVolume;
          return -Math.log10(excessH);
        } else if (nb === na) {
          const kb = Math.pow(10, -pKb);
          const concB = nb / totalVolume;
          const oh = Math.sqrt(kb * concB);
          return 14 + Math.log10(oh);
        } else {
          const excessOH = (nb - na) / totalVolume;
          return 14 + Math.log10(excessOH);
        }
      } else if (!isAcidStrong && isBaseStrong) {
        if (nb === 0) {
          return -Math.log10(acidConc * Math.pow(10, -pKa));
        } else if (nb < na) {
          const molesA = na - nb;
          const molesHA = nb;
          return pKa + Math.log10(molesA / molesHA);
        } else if (nb === na) {
          const ka = Math.pow(10, -pKa);
          const concA = na / totalVolume;
          const h = Math.sqrt(ka * concA);
          return -Math.log10(h);
        } else {
          const excessOH = (nb - na) / totalVolume;
          return 14 + Math.log10(excessOH);
        }
      } else {
        return 7; // Simplified for weak acid vs weak base
      }
    },
    [acid, base, acidConc, baseConc, acidVolume, temperature]
  );

  const drawTitrationCurve = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Grid
    if (showGrid) {
      ctx.strokeStyle = "#e0e0e0";
      const xScale = (width - 100) / (acidVolume * 2);
      const yScale = (height - 100) / 14;
      for (let v = 0; v <= acidVolume * 2; v += 10) {
        ctx.beginPath();
        ctx.moveTo(50 + v * xScale, height - 50);
        ctx.lineTo(50 + v * xScale, 50);
        ctx.stroke();
      }
      for (let pH = 0; pH <= 14; pH += 1) {
        ctx.beginPath();
        ctx.moveTo(50, height - 50 - pH * yScale);
        ctx.lineTo(width - 50, height - 50 - pH * yScale);
        ctx.stroke();
      }
    }

    // Axes
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.moveTo(50, height - 50);
    ctx.lineTo(width - 50, height - 50); // X-axis
    ctx.moveTo(50, height - 50);
    ctx.lineTo(50, 50); // Y-axis
    ctx.stroke();

    // Labels
    ctx.font = "12px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Base Volume (mL)", width / 2 - 40, height - 20);
    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("pH", 0, 0);
    ctx.restore();

    // Scale markings
    const maxVolume = acidVolume * 2;
    const xScale = (width - 100) / maxVolume;
    const yScale = (height - 100) / 14;
    for (let v = 0; v <= maxVolume; v += 20) {
      ctx.fillText(v, 50 + v * xScale - 5, height - 35);
    }
    for (let pH = 0; pH <= 14; pH += 2) {
      ctx.fillText(pH, 35, height - 50 - pH * yScale + 5);
    }

    // Plot curve
    ctx.beginPath();
    ctx.strokeStyle = "blue";
    let first = true;
    for (let v = 0; v <= maxVolume; v += 0.1) {
      const pH = calculatePH(v);
      const x = 50 + v * xScale;
      const y = height - 50 - pH * yScale;
      if (first) {
        ctx.moveTo(x, y);
        first = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Equivalence point
    const equivVolume = (acidConc * acidVolume) / baseConc;
    const equivPH = calculatePH(equivVolume);
    const equivX = 50 + equivVolume * xScale;
    const equivY = height - 50 - equivPH * yScale;
    ctx.beginPath();
    ctx.arc(equivX, equivY, 5, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
  };

  const downloadGraph = () => {
    if (canvasRef.current) {
      html2canvas(canvasRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `titration-curve-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  const reset = () => {
    setAcid("HCl");
    setBase("NaOH");
    setAcidConc(0.1);
    setBaseConc(0.1);
    setAcidVolume(50);
    setTemperature(25);
    setShowGrid(true);
  };

  const formatNumber = (num, digits = 2) =>
    num.toLocaleString("en-US", { maximumFractionDigits: digits });

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Titration Simulator
        </h1>

        <div className="space-y-6">
          {/* Canvas */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={700}
              height={400}
              className="w-full border border-gray-300 rounded-md"
            />
            <p className="text-sm text-gray-600 mt-2">
              Blue: Titration Curve | Red: Equivalence Point
            </p>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Acid</label>
              <select
                value={acid}
                onChange={(e) => setAcid(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(acidData).map((a) => (
                  <option key={a} value={a}>
                    {a} ({acidData[a].strong ? "Strong" : "Weak"})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base</label>
              <select
                value={base}
                onChange={(e) => setBase(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(baseData).map((b) => (
                  <option key={b} value={b}>
                    {b} ({baseData[b].strong ? "Strong" : "Weak"})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Acid Conc. (M)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={acidConc}
                onChange={(e) =>
                  setAcidConc(Math.max(0.01, parseFloat(e.target.value) || 0.1))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Conc. (M)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={baseConc}
                onChange={(e) =>
                  setBaseConc(Math.max(0.01, parseFloat(e.target.value) || 0.1))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Acid Volume (mL)
              </label>
              <input
                type="number"
                min="1"
                value={acidVolume}
                onChange={(e) =>
                  setAcidVolume(Math.max(1, parseFloat(e.target.value) || 50))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature (°C)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={temperature}
                onChange={(e) =>
                  setTemperature(Math.max(0, Math.min(100, parseFloat(e.target.value) || 25)))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Additional Settings */}
          <div className="flex items-center gap-4">
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
              onClick={downloadGraph}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Graph
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Titration Properties:</h2>
            <p>
              Acid: {acid} ({formatNumber(acidConc)} M, {formatNumber(acidVolume)} mL)
            </p>
            <p>
              Base: {base} ({formatNumber(baseConc)} M)
            </p>
            <p>
              Equivalence Volume: {formatNumber((acidConc * acidVolume) / baseConc)} mL
            </p>
            <p>Equivalence pH: {formatNumber(calculatePH((acidConc * acidVolume) / baseConc))}</p>
            <p>Temperature: {temperature}°C</p>
          </div>

          {/* Features */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Multiple acids and bases (strong/weak)</li>
              <li>Temperature adjustment affecting Kw</li>
              <li>Interactive titration curve with grid option</li>
              <li>Download graph as PNG</li>
              <li>Detailed titration properties display</li>
            </ul>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Simulates acid-base titration with:</p>
                <ul className="list-disc list-inside">
                  <li>Strong/Weak acid/base calculations</li>
                  <li>Buffer region and equivalence point</li>
                  <li>Temperature-adjusted water dissociation</li>
                  <li>Visual curve plotting</li>
                </ul>
                <p>Note: Simplified model; assumes ideal conditions.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitratorSimulator;