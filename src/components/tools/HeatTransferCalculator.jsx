"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading results

const HeatTransferCalculator = () => {
  const [mode, setMode] = useState("conduction");
  const [inputs, setInputs] = useState({
    conduction: { k: 0.026, A: 1, dT: 10, L: 0.1 },
    convection: { h: 10, A: 1, dT: 20 },
    radiation: { e: 0.9, A: 1, T1: 300, T2: 280 },
  });
  const [unitSystem, setUnitSystem] = useState("SI"); // SI or Imperial
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const calculatorRef = React.useRef(null);

  // Constants
  const sigma = 5.670374e-8; // Stefan-Boltzmann constant (W/m²K⁴)

  const convertUnits = (value, fromUnit, toUnit, type) => {
    if (fromUnit === toUnit) return value;
    const conversions = {
      length: { m: 1, ft: 3.28084 },
      area: { 'm²': 1, 'ft²': 10.7639 },
      tempDiff: { K: 1, F: 5 / 9 },
      temp: { K: (v) => v - 273.15, C: (v) => v, F: (v) => (v - 273.15) * 9 / 5 + 32 },
      conductivity: { "W/m·K": 1, "BTU/h·ft·F": 0.577789 },
      convection: { "W/m²·K": 1, "BTU/h·ft²·F": 0.17611 },
      power: { W: 1, "BTU/h": 0.293071 },
    };
    if (type === "temp") {
      return unitSystem === "SI" ? value : conversions.temp[toUnit](value);
    }
    return value * conversions[type][fromUnit] / conversions[type][toUnit];
  };

  const calculateHeatTransfer = useCallback(() => {
    setError("");
    setResult(null);

    const currentInputs = inputs[mode];
    let Q;

    try {
      switch (mode) {
        case "conduction":
          const { k, A: Ac, dT: dTc, L } = currentInputs;
          if (k <= 0 || Ac <= 0 || L <= 0) throw new Error("k, A, and L must be positive");
          Q = (k * Ac * dTc) / L;
          if (unitSystem === "Imperial") {
            Q = convertUnits(Q, "W", "BTU/h", "power");
          }
          setResult({
            mode: "Conduction",
            Q,
            unit: unitSystem === "SI" ? "W" : "BTU/h",
            equation: "Q = k * A * ΔT / L",
            params: `k=${k} ${unitSystem === "SI" ? "W/m·K" : "BTU/h·ft·F"}, A=${Ac} ${
              unitSystem === "SI" ? "m²" : "ft²"
            }, ΔT=${dTc} ${unitSystem === "SI" ? "K" : "F"}, L=${L} ${
              unitSystem === "SI" ? "m" : "ft"
            }`,
          });
          break;

        case "convection":
          const { h, A: Av, dT: dTv } = currentInputs;
          if (h <= 0 || Av <= 0) throw new Error("h and A must be positive");
          Q = h * Av * dTv;
          if (unitSystem === "Imperial") {
            Q = convertUnits(Q, "W", "BTU/h", "power");
          }
          setResult({
            mode: "Convection",
            Q,
            unit: unitSystem === "SI" ? "W" : "BTU/h",
            equation: "Q = h * A * ΔT",
            params: `h=${h} ${unitSystem === "SI" ? "W/m²·K" : "BTU/h·ft²·F"}, A=${Av} ${
              unitSystem === "SI" ? "m²" : "ft²"
            }, ΔT=${dTv} ${unitSystem === "SI" ? "K" : "F"}`,
          });
          break;

        case "radiation":
          const { e, A: Ar, T1, T2 } = currentInputs;
          if (e < 0 || e > 1 || Ar <= 0 || T1 < 0 || T2 < 0)
            throw new Error("ε must be 0-1, A positive, T ≥ 0");
          Q = e * sigma * Ar * (Math.pow(T1, 4) - Math.pow(T2, 4));
          if (unitSystem === "Imperial") {
            Q = convertUnits(Q, "W", "BTU/h", "power");
          }
          setResult({
            mode: "Radiation",
            Q,
            unit: unitSystem === "SI" ? "W" : "BTU/h",
            equation: "Q = ε * σ * A * (T₁⁴ - T₂⁴)",
            params: `ε=${e}, A=${Ar} ${unitSystem === "SI" ? "m²" : "ft²"}, T₁=${T1} ${
              unitSystem === "SI" ? "K" : "F"
            }, T₂=${T2} ${unitSystem === "SI" ? "K" : "F"}`,
          });
          break;

        default:
          throw new Error("Unknown mode");
      }
      setHistory((prev) => [...prev, result].slice(-5)); // Keep last 5 results
    } catch (err) {
      setError(err.message);
    }
  }, [mode, inputs, unitSystem, result]);

  const handleInputChange = (field, value) => {
    setInputs((prev) => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [field]: parseFloat(value) || 0,
      },
    }));
  };

  const resetInputs = () => {
    setInputs({
      conduction: { k: 0.026, A: 1, dT: 10, L: 0.1 },
      convection: { h: 10, A: 1, dT: 20 },
      radiation: { e: 0.9, A: 1, T1: 300, T2: 280 },
    });
    setResult(null);
    setError("");
  };

  const downloadResult = () => {
    if (calculatorRef.current && result) {
      html2canvas(calculatorRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `heat-transfer-result-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  const formatNumber = (num, digits = 2) =>
    num.toLocaleString("en-US", { maximumFractionDigits: digits });

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div
        ref={calculatorRef}
        className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Heat Transfer Calculator
        </h1>

        <div className="space-y-6">
          {/* Mode and Unit Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heat Transfer Mode
              </label>
              <select
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value);
                  setResult(null);
                }}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="conduction">Conduction</option>
                <option value="convection">Convection</option>
                <option value="radiation">Radiation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit System
              </label>
              <select
                value={unitSystem}
                onChange={(e) => {
                  setUnitSystem(e.target.value);
                  setResult(null);
                }}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="SI">SI (W, m, K)</option>
                <option value="Imperial">Imperial (BTU/h, ft, F)</option>
              </select>
            </div>
          </div>

          {/* Inputs */}
          {mode === "conduction" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Thermal Conductivity (k)", field: "k", step: "0.001" },
                { label: "Area (A)", field: "A", step: "0.1" },
                { label: "Temperature Difference (ΔT)", field: "dT", step: "1" },
                { label: "Thickness (L)", field: "L", step: "0.01" },
              ].map(({ label, field, step }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} (
                    {unitSystem === "SI"
                      ? field === "k"
                        ? "W/m·K"
                        : field === "A"
                        ? "m²"
                        : field === "dT"
                        ? "K"
                        : "m"
                      : field === "k"
                      ? "BTU/h·ft·F"
                      : field === "A"
                      ? "ft²"
                      : field === "dT"
                      ? "F"
                      : "ft"}
                    )
                  </label>
                  <input
                    type="number"
                    step={step}
                    value={inputs.conduction[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          )}

          {mode === "convection" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Convective Coefficient (h)", field: "h", step: "0.1" },
                { label: "Area (A)", field: "A", step: "0.1" },
                { label: "Temperature Difference (ΔT)", field: "dT", step: "1" },
              ].map(({ label, field, step }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} (
                    {unitSystem === "SI"
                      ? field === "h"
                        ? "W/m²·K"
                        : field === "A"
                        ? "m²"
                        : "K"
                      : field === "h"
                      ? "BTU/h·ft²·F"
                      : field === "A"
                      ? "ft²"
                      : "F"}
                    )
                  </label>
                  <input
                    type="number"
                    step={step}
                    value={inputs.convection[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          )}

          {mode === "radiation" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Emissivity (ε, 0-1)", field: "e", step: "0.1", min: "0", max: "1" },
                { label: "Area (A)", field: "A", step: "0.1" },
                { label: "Temperature 1 (T₁)", field: "T1", step: "1" },
                { label: "Temperature 2 (T₂)", field: "T2", step: "1" },
              ].map(({ label, field, step, min, max }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} (
                    {unitSystem === "SI"
                      ? field === "A"
                        ? "m²"
                        : field === "e"
                        ? ""
                        : "K"
                      : field === "A"
                      ? "ft²"
                      : field === "e"
                      ? ""
                      : "F"}
                    )
                  </label>
                  <input
                    type="number"
                    step={step}
                    min={min}
                    max={max}
                    value={inputs.radiation[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateHeatTransfer}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate
            </button>
            <button
              onClick={resetInputs}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={downloadResult}
              disabled={!result}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">{result.mode} Heat Transfer:</h2>
              <p className="text-xl">
                Rate: {formatNumber(result.Q)} {result.unit}
              </p>
              <p className="text-sm text-gray-600 mt-2">{result.equation}</p>
              <p className="text-sm text-gray-600">Parameters: {result.params}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-700 mb-2">Calculation History</h3>
              <ul className="text-sm text-blue-600 space-y-1 max-h-32 overflow-y-auto">
                {history.slice().reverse().map((item, index) => (
                  <li key={index}>
                    {item.mode}: {formatNumber(item.Q)} {item.unit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Features */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Supports Conduction, Convection, and Radiation</li>
              <li>SI and Imperial unit systems</li>
              <li>Calculation history (last 5 results)</li>
              <li>Download results as PNG</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatTransferCalculator;