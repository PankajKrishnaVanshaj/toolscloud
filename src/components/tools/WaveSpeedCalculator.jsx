"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaInfoCircle } from "react-icons/fa";

const WaveSpeedCalculator = () => {
  const [waveType, setWaveType] = useState("transverse");
  const [medium, setMedium] = useState("string");
  const [tension, setTension] = useState("");
  const [massDensity, setMassDensity] = useState("");
  const [bulkModulus, setBulkModulus] = useState("");
  const [density, setDensity] = useState("");
  const [youngsModulus, setYoungsModulus] = useState(""); // For solids with shear
  const [shearModulus, setShearModulus] = useState(""); // For solids with shear
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [unitSystem, setUnitSystem] = useState("SI"); // SI or Imperial

  // Calculate wave speed
  const calculateWaveSpeed = useCallback(() => {
    setError("");
    setResult(null);

    let speed;
    try {
      if (waveType === "transverse" && medium === "string") {
        const T = parseFloat(tension);
        const mu = parseFloat(massDensity);
        if (isNaN(T) || isNaN(mu) || T <= 0 || mu <= 0) {
          setError("Please enter valid positive values for tension and mass density");
          return;
        }
        speed = Math.sqrt(T / mu); // v = √(T/μ)
      } else if (waveType === "longitudinal") {
        const B = parseFloat(bulkModulus);
        const rho = parseFloat(density);
        if (isNaN(B) || isNaN(rho) || B <= 0 || rho <= 0) {
          setError("Please enter valid positive values for bulk modulus and density");
          return;
        }
        speed = Math.sqrt(B / rho); // v = √(B/ρ)
      } else if (waveType === "transverse" && medium === "solid") {
        const G = parseFloat(shearModulus);
        const rho = parseFloat(density);
        if (isNaN(G) || isNaN(rho) || G <= 0 || rho <= 0) {
          setError("Please enter valid positive values for shear modulus and density");
          return;
        }
        speed = Math.sqrt(G / rho); // v = √(G/ρ) for transverse waves in solids
      } else if (waveType === "longitudinal" && medium === "solid" && youngsModulus) {
        const E = parseFloat(youngsModulus);
        const rho = parseFloat(density);
        if (isNaN(E) || isNaN(rho) || E <= 0 || rho <= 0) {
          setError("Please enter valid positive values for Young's modulus and density");
          return;
        }
        speed = Math.sqrt(E / rho); // v = √(E/ρ) simplified for solids
      } else {
        setError("Invalid combination of wave type and medium");
        return;
      }

      // Convert to Imperial units if selected
      if (unitSystem === "Imperial") {
        speed *= 3.28084; // m/s to ft/s
      }

      setResult({ speed, waveType, medium, unit: unitSystem === "SI" ? "m/s" : "ft/s" });
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [
    waveType,
    medium,
    tension,
    massDensity,
    bulkModulus,
    density,
    youngsModulus,
    shearModulus,
    unitSystem,
  ]);

  // Format number with units
  const formatNumber = (num, unit, digits = 2) => {
    return `${num.toLocaleString("en-US", { maximumFractionDigits: digits })} ${unit}`;
  };

  // Reset all inputs
  const reset = () => {
    setWaveType("transverse");
    setMedium("string");
    setTension("");
    setMassDensity("");
    setBulkModulus("");
    setDensity("");
    setYoungsModulus("");
    setShearModulus("");
    setResult(null);
    setError("");
    setUnitSystem("SI");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Wave Speed Calculator
        </h1>

        <div className="space-y-6">
          {/* Wave Type and Medium */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wave Type</label>
              <select
                value={waveType}
                onChange={(e) => {
                  setWaveType(e.target.value);
                  setMedium(e.target.value === "transverse" ? "string" : "fluid");
                  setResult(null);
                }}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="transverse">Transverse</option>
                <option value="longitudinal">Longitudinal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medium</label>
              <select
                value={medium}
                onChange={(e) => {
                  setMedium(e.target.value);
                  setResult(null);
                }}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {waveType === "transverse" ? (
                  <>
                    <option value="string">String</option>
                    <option value="solid">Solid</option>
                  </>
                ) : (
                  <>
                    <option value="fluid">Fluid</option>
                    <option value="solid">Solid</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Unit System */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit System</label>
            <select
              value={unitSystem}
              onChange={(e) => setUnitSystem(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="SI">SI (m/s)</option>
              <option value="Imperial">Imperial (ft/s)</option>
            </select>
          </div>

          {/* Dynamic Inputs */}
          {waveType === "transverse" && medium === "string" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tension ({unitSystem === "SI" ? "N" : "lbf"})
                </label>
                <input
                  type="number"
                  value={tension}
                  onChange={(e) => setTension(e.target.value)}
                  placeholder="e.g., 100"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Linear Mass Density ({unitSystem === "SI" ? "kg/m" : "lb/ft"})
                </label>
                <input
                  type="number"
                  value={massDensity}
                  onChange={(e) => setMassDensity(e.target.value)}
                  placeholder="e.g., 0.01"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          ) : waveType === "transverse" && medium === "solid" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shear Modulus ({unitSystem === "SI" ? "Pa" : "psi"})
                </label>
                <input
                  type="number"
                  value={shearModulus}
                  onChange={(e) => setShearModulus(e.target.value)}
                  placeholder="e.g., 7.9e10 for steel"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Density ({unitSystem === "SI" ? "kg/m³" : "lb/ft³"})
                </label>
                <input
                  type="number"
                  value={density}
                  onChange={(e) => setDensity(e.target.value)}
                  placeholder="e.g., 7850 for steel"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bulk Modulus ({unitSystem === "SI" ? "Pa" : "psi"})
                </label>
                <input
                  type="number"
                  value={bulkModulus}
                  onChange={(e) => setBulkModulus(e.target.value)}
                  placeholder="e.g., 2.2e9 for water"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {medium === "solid" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Young's Modulus ({unitSystem === "SI" ? "Pa" : "psi"}) (Optional)
                  </label>
                  <input
                    type="number"
                    value={youngsModulus}
                    onChange={(e) => setYoungsModulus(e.target.value)}
                    placeholder="e.g., 2e11 for steel"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Density ({unitSystem === "SI" ? "kg/m³" : "lb/ft³"})
                </label>
                <input
                  type="number"
                  value={density}
                  onChange={(e) => setDensity(e.target.value)}
                  placeholder="e.g., 1000 for water"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateWaveSpeed}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h2 className="text-lg font-semibold text-green-700 mb-2">Wave Speed:</h2>
              <p className="text-green-600">{formatNumber(result.speed, result.unit)}</p>
              <p className="text-sm text-green-600 mt-2">
                Wave Type: {result.waveType} | Medium: {result.medium}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Presets</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setWaveType("transverse");
                  setMedium("string");
                  setTension(100);
                  setMassDensity(0.01);
                }}
                className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm"
              >
                String
              </button>
              <button
                onClick={() => {
                  setWaveType("longitudinal");
                  setMedium("fluid");
                  setBulkModulus(2.2e9);
                  setDensity(1000);
                }}
                className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm"
              >
                Water
              </button>
              <button
                onClick={() => {
                  setWaveType("longitudinal");
                  setMedium("solid");
                  setBulkModulus(1.6e11);
                  setYoungsModulus(2e11);
                  setDensity(7850);
                }}
                className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm"
              >
                Steel (Longitudinal)
              </button>
              <button
                onClick={() => {
                  setWaveType("transverse");
                  setMedium("solid");
                  setShearModulus(7.9e10);
                  setDensity(7850);
                }}
                className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm"
              >
                Steel (Transverse)
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
              <FaInfoCircle className="mr-2" /> About
            </h3>
            <div className="text-sm text-blue-600 space-y-1">
              <p>Calculates wave speed based on medium properties:</p>
              <ul className="list-disc list-inside">
                <li>Transverse (String): v = √(T/μ)</li>
                <li>Transverse (Solid): v = √(G/ρ)</li>
                <li>Longitudinal (Fluid): v = √(B/ρ)</li>
                <li>Longitudinal (Solid): v = √(B/ρ) or √(E/ρ)</li>
              </ul>
              <p>
                T = tension, μ = mass density, B = bulk modulus, G = shear modulus, E = Young's
                modulus, ρ = density
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaveSpeedCalculator;