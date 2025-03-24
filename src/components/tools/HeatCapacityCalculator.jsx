"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaDownload } from "react-icons/fa";

const HeatCapacityCalculator = () => {
  const [material, setMaterial] = useState("custom");
  const [specificHeat, setSpecificHeat] = useState("");
  const [mass, setMass] = useState("");
  const [massUnit, setMassUnit] = useState("kg");
  const [tempChange, setTempChange] = useState("");
  const [tempUnit, setTempUnit] = useState("K"); // K or °C
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  // Specific heat capacities in J/(kg·K)
  const materials = {
    water: 4186,
    aluminum: 897,
    copper: 385,
    iron: 450,
    air: 1005,
    gold: 129,
    silver: 235,
    custom: null,
  };

  // Unit conversions
  const massConversions = {
    kg: 1,
    g: 0.001,
    mg: 0.000001,
    t: 1000, // metric tonnes
  };

  // Calculate heat capacity and transfer
  const calculateHeatCapacity = useCallback(() => {
    setError("");
    setResult(null);

    if (
      (material === "custom" && (!specificHeat || isNaN(specificHeat))) ||
      !mass ||
      isNaN(mass) ||
      !tempChange ||
      isNaN(tempChange)
    ) {
      setError("Please enter valid numeric values for all fields");
      return;
    }

    try {
      let c = material === "custom" ? parseFloat(specificHeat) : materials[material];
      const m = parseFloat(mass) * massConversions[massUnit];
      let dT = parseFloat(tempChange);

      if (c <= 0 || m <= 0) {
        setError("Specific heat and mass must be positive");
        return;
      }

      const heatCapacity = m * c;
      const heatTransfer = heatCapacity * dT;

      const newResult = {
        heatCapacity,
        heatTransfer,
        specificHeat: c,
        massInKg: m,
        tempChange: dT,
        tempUnit,
        massUnit,
        material,
      };

      setResult(newResult);
      setHistory((prev) => [...prev, newResult].slice(-5)); // Keep last 5 calculations
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [material, specificHeat, mass, massUnit, tempChange, tempUnit]);

  // Format numbers for display
  const formatNumber = (num, digits = 2) =>
    num.toLocaleString("en-US", { maximumFractionDigits: digits });

  // Reset form
  const reset = () => {
    setMaterial("custom");
    setSpecificHeat("");
    setMass("");
    setMassUnit("kg");
    setTempChange("");
    setTempUnit("K");
    setResult(null);
    setError("");
  };

  // Download results as text
  const downloadResults = () => {
    if (!result) return;
    const text = `
Heat Capacity Calculator Results
-------------------------------
Material: ${result.material.charAt(0).toUpperCase() + result.material.slice(1)}
Specific Heat: ${formatNumber(result.specificHeat)} J/(kg·K)
Mass: ${formatNumber(result.massInKg)} kg (${formatNumber(
      result.massInKg / massConversions[result.massUnit]
    )} ${result.massUnit})
Temperature Change: ${formatNumber(result.tempChange)} ${result.tempUnit}
Heat Capacity: ${formatNumber(result.heatCapacity)} J/K
Heat Transfer: ${formatNumber(result.heatTransfer)} J
${result.heatTransfer > 0 ? "Heat absorbed" : "Heat released"}
    `.trim();
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `heat-capacity-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Heat Capacity Calculator
        </h1>

        <div className="space-y-6">
          {/* Material Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Material
            </label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(materials).map((mat) => (
                <option key={mat} value={mat}>
                  {mat.charAt(0).toUpperCase() + mat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Specific Heat */}
          {material === "custom" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specific Heat (J/(kg·K))
              </label>
              <input
                type="number"
                value={specificHeat}
                onChange={(e) => setSpecificHeat(e.target.value)}
                placeholder="e.g., 4186"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Mass Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mass
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={mass}
                onChange={(e) => setMass(e.target.value)}
                placeholder="e.g., 1"
                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={massUnit}
                onChange={(e) => setMassUnit(e.target.value)}
                className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(massConversions).map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Temperature Change */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperature Change (ΔT)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={tempChange}
                onChange={(e) => setTempChange(e.target.value)}
                placeholder="e.g., 10"
                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={tempUnit}
                onChange={(e) => setTempUnit(e.target.value)}
                className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="K">K</option>
                <option value="°C">°C</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateHeatCapacity}
              className="flex-1 flex items-center justify-center p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FaCalculator className="mr-2" /> Calculate
            </button>
            <button
              onClick={downloadResults}
              disabled={!result}
              className="flex-1 flex items-center justify-center p-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <FaDownload className="mr-2" /> Download
            </button>
            <button
              onClick={reset}
              className="flex-1 flex items-center justify-center p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <h2 className="text-lg font-semibold text-gray-800">Results:</h2>
              <p>Specific Heat: {formatNumber(result.specificHeat)} J/(kg·K)</p>
              <p>
                Mass: {formatNumber(result.massInKg)} kg (
                {formatNumber(result.massInKg / massConversions[result.massUnit])}{" "}
                {result.massUnit})
              </p>
              <p>Heat Capacity: {formatNumber(result.heatCapacity)} J/K</p>
              <p>Heat Transfer: {formatNumber(result.heatTransfer)} J</p>
              <p className="text-sm text-gray-600">
                {result.heatTransfer > 0 ? "Heat absorbed" : "Heat released"}
              </p>
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
              <ul className="text-sm text-blue-600 space-y-1 max-h-40 overflow-y-auto">
                {history.slice().reverse().map((entry, index) => (
                  <li key={index}>
                    {entry.material.charAt(0).toUpperCase() + entry.material.slice(1)}: Q ={" "}
                    {formatNumber(entry.heatTransfer)} J
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Info */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Calculates heat capacity and heat transfer.</p>
                <p>Formulas:</p>
                <ul className="list-disc list-inside">
                  <li>Heat Capacity (C) = m × c</li>
                  <li>Heat Transfer (Q) = m × c × ΔT</li>
                </ul>
                <p>Where:</p>
                <ul className="list-disc list-inside">
                  <li>m = mass</li>
                  <li>c = specific heat capacity</li>
                  <li>ΔT = temperature change</li>
                </ul>
                <p>Note: ΔT can be in K or °C (relative scale).</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatCapacityCalculator;