"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaDownload } from "react-icons/fa";

// Expanded periodic table data (atomic masses in u)
const periodicTable = {
  H: { mass: 1.00794, isotopes: { "H-1": 1.007825, "H-2": 2.014102, "H-3": 3.016049 } },
  He: { mass: 4.002602, isotopes: { "He-3": 3.016029, "He-4": 4.002602 } },
  Li: { mass: 6.941, isotopes: { "Li-6": 6.015122, "Li-7": 7.016004 } },
  C: { mass: 12.0107, isotopes: { "C-12": 12.0, "C-13": 13.003355, "C-14": 14.003242 } },
  N: { mass: 14.0067, isotopes: { "N-14": 14.003074, "N-15": 15.000109 } },
  O: { mass: 15.9994, isotopes: { "O-16": 15.994915, "O-17": 16.999132, "O-18": 17.999160 } },
  Na: { mass: 22.989769, isotopes: { "Na-23": 22.989769 } },
  Cl: { mass: 35.453, isotopes: { "Cl-35": 34.968853, "Cl-37": 36.965903 } },
  // Add more elements as needed
};

const AtomicMassCalculator = () => {
  const [formula, setFormula] = useState("");
  const [isotopes, setIsotopes] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [precision, setPrecision] = useState(4);
  const [unit, setUnit] = useState("u"); // Unified atomic mass unit or g/mol

  const parseFormula = (input) => {
    const regex = /([A-Z][a-z]?)(\d*)/g;
    const elements = {};
    let match;

    while ((match = regex.exec(input)) !== null) {
      const element = match[1];
      const count = match[2] ? parseInt(match[2]) : 1;
      if (!periodicTable[element]) {
        throw new Error(`Unknown element: ${element}`);
      }
      elements[element] = (elements[element] || 0) + count;
    }

    if (Object.keys(elements).length === 0) {
      throw new Error("Invalid formula: No valid elements found");
    }
    return elements;
  };

  const calculateMass = useCallback(() => {
    setError("");
    setResult(null);

    if (!formula.trim()) {
      setError("Please enter a chemical formula");
      return;
    }

    try {
      const elements = parseFormula(formula);
      let totalMass = 0;
      const breakdown = {};
      const avogadro = 6.02214076e23; // Avogadro's number for g/mol conversion

      Object.entries(elements).forEach(([element, count]) => {
        let mass;
        if (isotopes[element]) {
          const isotope = isotopes[element];
          if (!periodicTable[element].isotopes[isotope]) {
            throw new Error(`Unknown isotope: ${isotope}`);
          }
          mass = periodicTable[element].isotopes[isotope];
        } else {
          mass = periodicTable[element].mass;
        }
        const elementMass = mass * count * (unit === "g/mol" ? 1 : 1); // Base mass in u
        totalMass += elementMass;
        breakdown[element] = { count, mass: elementMass, unitMass: mass };
      });

      // Convert to g/mol if selected
      if (unit === "g/mol") {
        totalMass = totalMass / avogadro * 1e23; // Approximate molar mass
        Object.entries(breakdown).forEach(([_, data]) => {
          data.mass = data.mass / avogadro * 1e23;
          data.unitMass = data.unitMass / avogadro * 1e23;
        });
      }

      setResult({
        totalMass,
        breakdown,
      });
    } catch (err) {
      setError(err.message);
    }
  }, [formula, isotopes, unit]);

  const handleIsotopeChange = (element, value) => {
    setIsotopes((prev) => ({
      ...prev,
      [element]: value || undefined,
    }));
  };

  const formatNumber = (num) => {
    return num.toLocaleString("en-US", { maximumFractionDigits: precision });
  };

  const downloadResult = () => {
    if (!result) return;
    const text = [
      `Chemical Formula: ${formula}`,
      `Total Atomic Mass: ${formatNumber(result.totalMass)} ${unit}`,
      "Breakdown:",
      ...Object.entries(result.breakdown).map(
        ([element, data]) =>
          `${element}: ${data.count} × ${formatNumber(data.unitMass)} ${unit} = ${formatNumber(
            data.mass
          )} ${unit}`
      ),
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `atomic-mass-${formula}-${Date.now()}.txt`;
    link.click();
  };

  const reset = () => {
    setFormula("");
    setIsotopes({});
    setResult(null);
    setError("");
    setPrecision(4);
    setUnit("u");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Atomic Mass Calculator
        </h1>

        <div className="space-y-6">
          {/* Formula Input and Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chemical Formula
              </label>
              <input
                type="text"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="e.g., H2O, CO2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="u">u (Atomic Mass Unit)</option>
                <option value="g/mol">g/mol (Molar Mass)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precision (decimal places)
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
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateMass}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate
            </button>
            <button
              onClick={downloadResult}
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

          {/* Result */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <p className="text-gray-700">
                Total Atomic Mass: <span className="font-bold">{formatNumber(result.totalMass)}</span> {unit}
              </p>
              <h3 className="font-medium mt-2">Breakdown:</h3>
              <ul className="space-y-2">
                {Object.entries(result.breakdown).map(([element, data]) => (
                  <li key={element} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <span>
                      {element}: {data.count} × {formatNumber(data.unitMass)} {unit} ={" "}
                      {formatNumber(data.mass)} {unit}
                    </span>
                    <select
                      value={isotopes[element] || ""}
                      onChange={(e) => handleIsotopeChange(element, e.target.value)}
                      className="w-full sm:w-auto px-2 py-1 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Average</option>
                      {Object.keys(periodicTable[element].isotopes).map((iso) => (
                        <option key={iso} value={iso}>
                          {iso}
                        </option>
                      ))}
                    </select>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Features and Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Calculate atomic mass from chemical formulas</li>
              <li>Support for specific isotopes</li>
              <li>Unit conversion (u or g/mol)</li>
              <li>Adjustable precision</li>
              <li>Detailed breakdown with isotope selection</li>
              <li>Download results as text file</li>
            </ul>
            <p className="text-sm text-blue-600 mt-2">
              Note: Expand `periodicTable` for more elements and isotopes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtomicMassCalculator;