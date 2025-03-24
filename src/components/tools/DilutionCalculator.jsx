"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaInfoCircle } from "react-icons/fa";

const DilutionCalculator = () => {
  const [initialConcentration, setInitialConcentration] = useState("");
  const [initialVolume, setInitialVolume] = useState("");
  const [finalConcentration, setFinalConcentration] = useState("");
  const [finalVolume, setFinalVolume] = useState("");
  const [concUnit, setConcUnit] = useState("M");
  const [volUnit, setVolUnit] = useState("mL");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [precision, setPrecision] = useState(4); // Decimal precision for results

  // Unit conversion factors to base units (M for concentration, L for volume)
  const concUnits = {
    M: 1,
    mM: 1e-3,
    μM: 1e-6,
    nM: 1e-9,
  };

  const volUnits = {
    L: 1,
    mL: 1e-3,
    μL: 1e-6,
  };

  const calculateDilution = useCallback(() => {
    setError("");
    setResult(null);

    const inputs = {
      c1: initialConcentration ? parseFloat(initialConcentration) : null,
      v1: initialVolume ? parseFloat(initialVolume) : null,
      c2: finalConcentration ? parseFloat(finalConcentration) : null,
      v2: finalVolume ? parseFloat(finalVolume) : null,
    };

    const filledInputs = Object.values(inputs).filter((v) => v !== null);
    if (filledInputs.length < 3) {
      setError("Please provide at least 3 values to calculate the fourth.");
      return;
    }

    if (filledInputs.some((v) => isNaN(v) || v <= 0)) {
      setError("All values must be positive numbers.");
      return;
    }

    try {
      // Convert to base units
      const c1 = inputs.c1 !== null ? inputs.c1 * concUnits[concUnit] : null;
      const v1 = inputs.v1 !== null ? inputs.v1 * volUnits[volUnit] : null;
      const c2 = inputs.c2 !== null ? inputs.c2 * concUnits[concUnit] : null;
      const v2 = inputs.v2 !== null ? inputs.v2 * volUnits[volUnit] : null;

      let calculatedValue, description, solventVolume;

      // C₁V₁ = C₂V₂
      if (c1 === null) {
        calculatedValue = (c2 * v2) / v1;
        description = "Initial Concentration (C₁)";
      } else if (v1 === null) {
        calculatedValue = (c2 * v2) / c1;
        description = "Initial Volume (V₁)";
      } else if (c2 === null) {
        calculatedValue = (c1 * v1) / v2;
        description = "Final Concentration (C₂)";
      } else {
        calculatedValue = (c1 * v1) / c2;
        description = "Final Volume (V₂)";
      }

      // Convert result back to chosen units
      const resultInChosenUnits =
        description.includes("Concentration")
          ? calculatedValue / concUnits[concUnit]
          : calculatedValue / volUnits[volUnit];

      // Calculate solvent volume if final volume is involved
      solventVolume =
        description === "Final Volume (V₂)" && v1
          ? calculatedValue - v1
          : v2 && v1
          ? v2 - v1
          : null;

      setResult({
        value: resultInChosenUnits,
        description,
        dilutionFactor: c1 && c2 ? c1 / c2 : null,
        solventVolume: solventVolume ? solventVolume / volUnits[volUnit] : null,
      });
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [
    initialConcentration,
    initialVolume,
    finalConcentration,
    finalVolume,
    concUnit,
    volUnit,
  ]);

  const formatNumber = (num, digits = precision) =>
    num.toLocaleString("en-US", { maximumFractionDigits: digits });

  const reset = () => {
    setInitialConcentration("");
    setInitialVolume("");
    setFinalConcentration("");
    setFinalVolume("");
    setConcUnit("M");
    setVolUnit("mL");
    setResult(null);
    setError("");
    setPrecision(4);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Dilution Calculator
        </h1>

        <div className="space-y-6">
          {/* Units Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Concentration Unit
              </label>
              <select
                value={concUnit}
                onChange={(e) => setConcUnit(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="M">M (Molarity)</option>
                <option value="mM">mM (Millimolar)</option>
                <option value="μM">μM (Micromolar)</option>
                <option value="nM">nM (Nanomolar)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Volume Unit
              </label>
              <select
                value={volUnit}
                onChange={(e) => setVolUnit(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="L">L (Liters)</option>
                <option value="mL">mL (Milliliters)</option>
                <option value="μL">μL (Microliters)</option>
              </select>
            </div>
          </div>

          {/* Precision Setting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Decimal Precision ({precision})
            </label>
            <input
              type="range"
              min="1"
              max="6"
              value={precision}
              onChange={(e) => setPrecision(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Initial Concentration (C₁)", value: initialConcentration, setter: setInitialConcentration },
              { label: "Initial Volume (V₁)", value: initialVolume, setter: setInitialVolume },
              { label: "Final Concentration (C₂)", value: finalConcentration, setter: setFinalConcentration },
              { label: "Final Volume (V₂)", value: finalVolume, setter: setFinalVolume },
            ].map(({ label, value, setter }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={`e.g., ${label.includes("Concentration") ? "1" : "100"} (${label.includes("Concentration") ? concUnit : volUnit})`}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  step="any"
                />
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateDilution}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate
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
              <h2 className="text-lg font-semibold text-green-700 mb-2">Result:</h2>
              <p>
                {result.description}: {formatNumber(result.value)} {result.description.includes("Concentration") ? concUnit : volUnit}
              </p>
              {result.dilutionFactor && (
                <p>Dilution Factor: {formatNumber(result.dilutionFactor)}x</p>
              )}
              {result.solventVolume !== null && (
                <p>
                  Add Solvent: {formatNumber(result.solventVolume)} {volUnit}
                </p>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Presets */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">Presets</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { c1: "1", v1: "10", c2: "0.1", v2: "", conc: "M", vol: "mL", label: "1M to 0.1M" },
                { c1: "100", v1: "", c2: "10", v2: "100", conc: "mM", vol: "mL", label: "100mM to 10mM" },
                { c1: "500", v1: "50", c2: "", v2: "200", conc: "μM", vol: "μL", label: "500μM to 200μL" },
              ].map((preset, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInitialConcentration(preset.c1);
                    setInitialVolume(preset.v1);
                    setFinalConcentration(preset.c2);
                    setFinalVolume(preset.v2);
                    setConcUnit(preset.conc);
                    setVolUnit(preset.vol);
                    setResult(null);
                    setError("");
                  }}
                  className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-sm transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <details className="group">
              <summary className="flex items-center cursor-pointer text-blue-700 font-semibold">
                <FaInfoCircle className="mr-2" /> About
                <span className="ml-2 group-open:rotate-180">▼</span>
              </summary>
              <div className="mt-2 text-sm text-blue-600 space-y-2">
                <p>Calculates dilution parameters using the formula:</p>
                <p className="font-mono">C₁V₁ = C₂V₂</p>
                <p>Where:</p>
                <ul className="list-disc list-inside">
                  <li>C₁, C₂: Initial and final concentrations</li>
                  <li>V₁, V₂: Initial and final volumes</li>
                </ul>
                <p>Leave one field blank to calculate it. Results include dilution factor and solvent volume when applicable.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DilutionCalculator;