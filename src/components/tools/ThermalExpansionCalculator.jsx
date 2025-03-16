"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const ThermalExpansionCalculator = () => {
  const [initialLength, setInitialLength] = useState("");
  const [initialTemp, setInitialTemp] = useState("");
  const [finalTemp, setFinalTemp] = useState("");
  const [material, setMaterial] = useState("custom");
  const [customAlpha, setCustomAlpha] = useState("");
  const [unit, setUnit] = useState("m");
  const [tempUnit, setTempUnit] = useState("C");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [precision, setPrecision] = useState(6); // Decimal precision
  const [calculationMode, setCalculationMode] = useState("linear"); // Linear, Area, Volume

  // Material coefficients (per °C)
  const materials = {
    aluminum: 23.1e-6,
    copper: 16.5e-6,
    steel: 12.0e-6,
    glass: 8.5e-6,
    brass: 18.0e-6,
    iron: 11.8e-6,
    custom: 0,
  };

  const unitConversions = {
    m: 1,
    cm: 0.01,
    mm: 0.001,
    in: 0.0254, // Added inches
  };

  // Optimized calculation function
  const calculateExpansion = useCallback(() => {
    setError("");
    setResult(null);

    if (!initialLength || !initialTemp || !finalTemp) {
      setError("Please fill in all required fields");
      return;
    }

    const L0 = parseFloat(initialLength);
    const T0 = parseFloat(initialTemp);
    const T1 = parseFloat(finalTemp);
    let alpha = material === "custom" ? parseFloat(customAlpha) : materials[material];

    if (
      isNaN(L0) ||
      isNaN(T0) ||
      isNaN(T1) ||
      (material === "custom" && isNaN(alpha))
    ) {
      setError("Please enter valid numbers");
      return;
    }

    if (L0 <= 0) {
      setError("Initial length must be positive");
      return;
    }

    if (material === "custom" && alpha <= 0) {
      setError("Thermal expansion coefficient must be positive");
      return;
    }

    try {
      // Convert temperatures to Celsius
      let deltaT;
      switch (tempUnit) {
        case "C":
          deltaT = T1 - T0;
          break;
        case "K":
          deltaT = T1 - T0;
          break;
        case "F":
          deltaT = ((T1 - 32) * 5) / 9 - ((T0 - 32) * 5) / 9;
          break;
        default:
          throw new Error("Invalid temperature unit");
      }

      // Calculations
      const deltaL = L0 * alpha * deltaT;
      const finalLength = L0 + deltaL;

      const initialArea = L0 * L0;
      const deltaA = initialArea * 2 * alpha * deltaT;
      const finalArea = initialArea + deltaA;

      const initialVolume = L0 * L0 * L0;
      const deltaV = initialVolume * 3 * alpha * deltaT;
      const finalVolume = initialVolume + deltaV;

      setResult({
        deltaL,
        finalLength,
        deltaA,
        finalArea,
        deltaV,
        finalVolume,
        unit,
        deltaT,
        initialArea,
        initialVolume,
      });
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [
    initialLength,
    initialTemp,
    finalTemp,
    material,
    customAlpha,
    tempUnit,
    unit,
  ]);

  // Format number with precision
  const formatNumber = (num) => num.toLocaleString("en-US", { maximumFractionDigits: precision });

  // Convert to display unit
  const convertToDisplayUnit = (value) => value / unitConversions[unit];

  // Reset all fields
  const reset = () => {
    setInitialLength("");
    setInitialTemp("");
    setFinalTemp("");
    setMaterial("custom");
    setCustomAlpha("");
    setUnit("m");
    setTempUnit("C");
    setResult(null);
    setError("");
    setPrecision(6);
    setCalculationMode("linear");
  };

  // Download results as text
  const downloadResults = () => {
    if (!result) return;
    const text = `
Thermal Expansion Results:
Initial Length: ${initialLength} ${unit}
Initial Temperature: ${initialTemp} ${tempUnit}
Final Temperature: ${finalTemp} ${tempUnit}
Material: ${material === "custom" ? "Custom (α = ${customAlpha})" : material}
ΔT: ${formatNumber(result.deltaT)} °C

Linear Expansion:
ΔL: ${formatNumber(convertToDisplayUnit(result.deltaL))} ${unit}
Final Length: ${formatNumber(convertToDisplayUnit(result.finalLength))} ${unit}

Area Expansion:
ΔA: ${formatNumber(convertToDisplayUnit(result.deltaA) * convertToDisplayUnit(1))} ${unit}²
Final Area: ${formatNumber(convertToDisplayUnit(result.finalArea) * convertToDisplayUnit(1))} ${unit}²

Volume Expansion:
ΔV: ${formatNumber(convertToDisplayUnit(result.deltaV) * convertToDisplayUnit(1) * convertToDisplayUnit(1))} ${unit}³
Final Volume: ${formatNumber(convertToDisplayUnit(result.finalVolume) * convertToDisplayUnit(1) * convertToDisplayUnit(1))} ${unit}³
    `.trim();
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `thermal-expansion-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Thermal Expansion Calculator
        </h1>

        <div className="space-y-6">
          {/* Inputs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Length ({unit})
              </label>
              <input
                type="number"
                value={initialLength}
                onChange={(e) => setInitialLength(e.target.value)}
                placeholder={`e.g., 1 ${unit}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Temp ({tempUnit})
                </label>
                <input
                  type="number"
                  value={initialTemp}
                  onChange={(e) => setInitialTemp(e.target.value)}
                  placeholder={`e.g., 20 ${tempUnit}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Final Temp ({tempUnit})
                </label>
                <input
                  type="number"
                  value={finalTemp}
                  onChange={(e) => setFinalTemp(e.target.value)}
                  placeholder={`e.g., 100 ${tempUnit}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Material and Units */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material
              </label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(materials).map(([key, value]) => (
                  <option key={key} value={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}{" "}
                    {key !== "custom" && `(${value.toExponential(1)} /°C)`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Length Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="m">Meters (m)</option>
                <option value="cm">Centimeters (cm)</option>
                <option value="mm">Millimeters (mm)</option>
                <option value="in">Inches (in)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temp Unit
              </label>
              <select
                value={tempUnit}
                onChange={(e) => setTempUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="C">Celsius (°C)</option>
                <option value="K">Kelvin (K)</option>
                <option value="F">Fahrenheit (°F)</option>
              </select>
            </div>
          </div>

          {/* Custom Alpha and Settings */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {material === "custom" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom α (per °C)
                </label>
                <input
                  type="number"
                  value={customAlpha}
                  onChange={(e) => setCustomAlpha(e.target.value)}
                  placeholder="e.g., 23e-6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decimal Precision
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={precision}
                onChange={(e) => setPrecision(Math.max(0, Math.min(10, e.target.value)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calculation Mode
              </label>
              <select
                value={calculationMode}
                onChange={(e) => setCalculationMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="linear">Linear</option>
                <option value="area">Area</option>
                <option value="volume">Volume</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateExpansion}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Calculate
            </button>
            <button
              onClick={downloadResults}
              disabled={!result}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
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
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <h2 className="text-lg font-semibold text-gray-800">Results:</h2>
              <p>ΔT: {formatNumber(result.deltaT)} °C</p>
              {(calculationMode === "linear" || calculationMode === "all") && (
                <>
                  <p>
                    Linear Expansion (ΔL):{" "}
                    {formatNumber(convertToDisplayUnit(result.deltaL))} {unit}
                  </p>
                  <p>
                    Final Length:{" "}
                    {formatNumber(convertToDisplayUnit(result.finalLength))} {unit}
                  </p>
                </>
              )}
              {(calculationMode === "area" || calculationMode === "all") && (
                <>
                  <p>
                    Area Expansion (ΔA):{" "}
                    {formatNumber(
                      convertToDisplayUnit(result.deltaA) * convertToDisplayUnit(1)
                    )}{" "}
                    {unit}²
                  </p>
                  <p>
                    Final Area:{" "}
                    {formatNumber(
                      convertToDisplayUnit(result.finalArea) * convertToDisplayUnit(1)
                    )}{" "}
                    {unit}²
                  </p>
                </>
              )}
              {(calculationMode === "volume" || calculationMode === "all") && (
                <>
                  <p>
                    Volume Expansion (ΔV):{" "}
                    {formatNumber(
                      convertToDisplayUnit(result.deltaV) *
                        convertToDisplayUnit(1) *
                        convertToDisplayUnit(1)
                    )}{" "}
                    {unit}³
                  </p>
                  <p>
                    Final Volume:{" "}
                    {formatNumber(
                      convertToDisplayUnit(result.finalVolume) *
                        convertToDisplayUnit(1) *
                        convertToDisplayUnit(1)
                    )}{" "}
                    {unit}³
                  </p>
                </>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Features and Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Supports multiple materials and custom α</li>
              <li>Units: m, cm, mm, in; °C, K, °F</li>
              <li>Linear, area, and volume expansion calculations</li>
              <li>Adjustable decimal precision</li>
              <li>Download results as text</li>
            </ul>
          </div>

          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">Formulas</summary>
              <div className="mt-2 space-y-2">
                <p>Linear: ΔL = L₀ * α * ΔT</p>
                <p>Area: ΔA/A₀ ≈ 2 * α * ΔT</p>
                <p>Volume: ΔV/V₀ ≈ 3 * α * ΔT</p>
                <p>Where α is the coefficient of linear expansion per °C.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThermalExpansionCalculator;