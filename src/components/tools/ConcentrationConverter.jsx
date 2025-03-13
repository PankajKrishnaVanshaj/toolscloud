"use client";
import React, { useState, useCallback } from "react";
import { FaSync } from "react-icons/fa";

const ConcentrationConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("M");
  const [volume, setVolume] = useState("");
  const [volumeUnit, setVolumeUnit] = useState("L");
  const [solventMass, setSolventMass] = useState("");
  const [solventMassUnit, setSolventMassUnit] = useState("kg");
  const [molarMass, setMolarMass] = useState(""); // New: Molar mass of solute in g/mol
  const [density, setDensity] = useState("1"); // Density of solution in g/mL, default water

  // Conversion factors (base unit: moles per liter, M)
  const conversionFactors = {
    M: 1, // Molarity (mol/L)
    m: null, // Molality (mol/kg) - requires solvent mass
    ppm: 1e-6, // Parts per million (assuming 1 L water ≈ 1 kg)
    ppb: 1e-9, // Parts per billion
    mg_L: null, // mg/L (requires molar mass)
    g_L: null, // g/L (requires molar mass)
    percent: null, // Mass percent (requires molar mass and solution mass)
  };

  const unitDisplayNames = {
    M: "M (mol/L)",
    m: "m (mol/kg)",
    ppm: "ppm",
    ppb: "ppb",
    mg_L: "mg/L",
    g_L: "g/L",
    percent: "% (w/w)",
  };

  const volumeConversion = {
    L: 1,
    mL: 1e-3,
    cm3: 1e-3,
    gal: 3.78541,
    qt: 0.946353,
  };

  const volumeDisplayNames = {
    L: "L",
    mL: "mL",
    cm3: "cm³",
    gal: "gal",
    qt: "qt",
  };

  const massConversion = {
    kg: 1,
    g: 1e-3,
    mg: 1e-6,
    lb: 0.453592,
  };

  const massDisplayNames = {
    kg: "kg",
    g: "g",
    mg: "mg",
    lb: "lb",
  };

  const convertValue = useCallback(() => {
    if (!value || isNaN(value)) return {};

    const volumeInLiters = volume * volumeConversion[volumeUnit];
    const solventMassKg = solventMass ? solventMass * massConversion[solventMassUnit] : null;
    const molarMassG = molarMass ? parseFloat(molarMass) : null;
    const densityGPerML = parseFloat(density);
    const solutionMassKg = volumeInLiters * densityGPerML * 1e-3; // Convert g to kg

    let valueInMolarity = parseFloat(value);

    // Convert input to molarity (M)
    if (unit === "m" && solventMassKg) {
      valueInMolarity = (valueInMolarity * solventMassKg) / volumeInLiters;
    } else if (unit === "m") {
      return { error: "Solvent mass required for molality conversion" };
    } else if (unit === "mg_L" && molarMassG) {
      valueInMolarity = (valueInMolarity * 1e-3) / molarMassG; // mg/L to mol/L
    } else if (unit === "g_L" && molarMassG) {
      valueInMolarity = valueInMolarity / molarMassG; // g/L to mol/L
    } else if (unit === "percent" && molarMassG && solventMassKg) {
      const soluteMassKg = (valueInMolarity / 100) * (solventMassKg + solutionMassKg);
      valueInMolarity = (soluteMassKg * 1e3) / (molarMassG * volumeInLiters);
    } else if (unit === "percent") {
      return { error: "Molar mass and solvent mass required for percent conversion" };
    } else {
      valueInMolarity *= conversionFactors[unit];
    }

    const results = {};
    Object.keys(conversionFactors).forEach((toUnit) => {
      if (toUnit === "m" && solventMassKg) {
        results[toUnit] = (valueInMolarity * volumeInLiters) / solventMassKg;
      } else if (toUnit === "mg_L" && molarMassG) {
        results[toUnit] = valueInMolarity * molarMassG * 1e3; // mol/L to mg/L
      } else if (toUnit === "g_L" && molarMassG) {
        results[toUnit] = valueInMolarity * molarMassG; // mol/L to g/L
      } else if (toUnit === "percent" && molarMassG && solventMassKg) {
        const soluteMassKg = valueInMolarity * molarMassG * volumeInLiters * 1e-3;
        results[toUnit] = (soluteMassKg / (solventMassKg + solutionMassKg)) * 100;
      } else if (conversionFactors[toUnit] !== null) {
        results[toUnit] = valueInMolarity / conversionFactors[toUnit];
      }
    });

    return results;
  }, [value, unit, volume, volumeUnit, solventMass, solventMassUnit, molarMass, density]);

  const calculateMoles = useCallback(() => {
    if (!value || !volume || isNaN(value) || isNaN(volume)) return null;
    const volumeInLiters = volume * volumeConversion[volumeUnit];
    let molarity = parseFloat(value);

    if (unit === "m" && solventMass) {
      const solventMassKg = solventMass * massConversion[solventMassUnit];
      molarity = (molarity * solventMassKg) / volumeInLiters;
    } else if (unit === "mg_L" && molarMass) {
      molarity = (molarity * 1e-3) / parseFloat(molarMass);
    } else if (unit === "g_L" && molarMass) {
      molarity = molarity / parseFloat(molarMass);
    } else if (unit === "percent" && molarMass && solventMass) {
      const solventMassKg = solventMass * massConversion[solventMassUnit];
      const solutionMassKg = volumeInLiters * parseFloat(density) * 1e-3;
      const soluteMassKg = (molarity / 100) * (solventMassKg + solutionMassKg);
      molarity = (soluteMassKg * 1e3) / (parseFloat(molarMass) * volumeInLiters);
    } else {
      molarity *= conversionFactors[unit];
    }

    return molarity * volumeInLiters;
  }, [value, unit, volume, volumeUnit, solventMass, solventMassUnit, molarMass, density]);

  const reset = () => {
    setValue("");
    setUnit("M");
    setVolume("");
    setVolumeUnit("L");
    setSolventMass("");
    setSolventMassUnit("kg");
    setMolarMass("");
    setDensity("1");
  };

  const results = convertValue();
  const moles = calculateMoles();

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Concentration Converter
        </h1>

        {/* Input Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Concentration
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter value"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full mt-2 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(conversionFactors).map((u) => (
                <option key={u} value={u}>
                  {unitDisplayNames[u]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Volume
            </label>
            <input
              type="number"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              placeholder="Enter volume"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={volumeUnit}
              onChange={(e) => setVolumeUnit(e.target.value)}
              className="w-full mt-2 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(volumeConversion).map((u) => (
                <option key={u} value={u}>
                  {volumeDisplayNames[u]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Solvent Mass
            </label>
            <input
              type="number"
              value={solventMass}
              onChange={(e) => setSolventMass(e.target.value)}
              placeholder="For molality"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={solventMassUnit}
              onChange={(e) => setSolventMassUnit(e.target.value)}
              className="w-full mt-2 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(massConversion).map((u) => (
                <option key={u} value={u}>
                  {massDisplayNames[u]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Molar Mass (g/mol)
            </label>
            <input
              type="number"
              value={molarMass}
              onChange={(e) => setMolarMass(e.target.value)}
              placeholder="e.g., 18 for H₂O"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Density (g/mL)
            </label>
            <input
              type="number"
              value={density}
              onChange={(e) => setDensity(e.target.value)}
              placeholder="Default: 1 (water)"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center mb-6">
          <button
            onClick={reset}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Results Section */}
        {value && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Conversions</h2>
              {results.error ? (
                <p className="text-red-600">{results.error}</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  {Object.entries(results).map(
                    ([unit, val]) =>
                      val !== undefined && (
                        <p key={unit}>
                          {unitDisplayNames[unit]}:{" "}
                          {val.toLocaleString("en-US", {
                            maximumFractionDigits: 4,
                            notation: "scientific",
                          })}
                        </p>
                      )
                  )}
                </div>
              )}
            </div>

            {moles && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-700 mb-2">Total Solute</h2>
                <p className="text-sm text-blue-600">
                  Moles:{" "}
                  {moles.toLocaleString("en-US", {
                    maximumFractionDigits: 4,
                    notation: "scientific",
                  })}
                </p>
                <p className="mt-2 text-xs text-blue-500">n = C × V</p>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Notes</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports M, m, ppm, ppb, mg/L, g/L, and % (w/w)</li>
            <li>Molar mass required for mg/L, g/L, and % conversions</li>
            <li>Adjustable volume and solvent mass units</li>
            <li>Density affects mass-based conversions</li>
            <li>Assumes dilute aqueous solutions for ppm/ppb</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConcentrationConverter;