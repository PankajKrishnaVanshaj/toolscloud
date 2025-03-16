"use client";
import { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaHistory, FaDownload } from "react-icons/fa";

// Comprehensive atomic weights list (unchanged from your original)
const atomicWeights = {
  H: 1.008,
  He: 4.0026,
  Li: 6.94,
  Be: 9.0122,
  B: 10.81,
  C: 12.011,
  N: 14.007,
  O: 15.999,
  F: 18.998,
  Ne: 20.180,
  Na: 22.990,
  Mg: 24.305,
  Al: 26.982,
  Si: 28.085,
  P: 30.974,
  S: 32.06,
  Cl: 35.45,
  Ar: 39.948,
  K: 39.098,
  Ca: 40.078,
  Sc: 44.955,
  Ti: 47.867,
  V: 50.942,
  Cr: 51.996,
  Mn: 54.938,
  Fe: 55.845,
  Co: 58.933,
  Ni: 58.693,
  Cu: 63.546,
  Zn: 65.38,
  Ga: 69.723,
  Ge: 72.63,
  As: 74.922,
  Se: 78.971,
  Br: 79.904,
  Kr: 83.798,
  Rb: 85.468,
  Sr: 87.62,
  Y: 88.906,
  Zr: 91.224,
  Nb: 92.906,
  Mo: 95.95,
  Tc: 98,
  Ru: 101.07,
  Rh: 102.91,
  Pd: 106.42,
  Ag: 107.87,
  Cd: 112.41,
  In: 114.82,
  Sn: 118.71,
  Sb: 121.76,
  Te: 127.60,
  I: 126.90,
  Xe: 131.29,
  Cs: 132.91,
  Ba: 137.33,
  La: 138.91,
  Ce: 140.12,
  Pr: 140.91,
  Nd: 144.24,
  Pm: 145,
  Sm: 150.36,
  Eu: 151.96,
  Gd: 157.25,
  Tb: 158.93,
  Dy: 162.50,
  Ho: 164.93,
  Er: 167.26,
  Tm: 168.93,
  Yb: 173.05,
  Lu: 174.97,
  Hf: 178.49,
  Ta: 180.95,
  W: 183.84,
  Re: 186.21,
  Os: 190.23,
  Ir: 192.22,
  Pt: 195.08,
  Au: 196.97,
  Hg: 200.59,
  Tl: 204.38,
  Pb: 207.2,
  Bi: 208.98,
  Po: 209,
  At: 210,
  Rn: 222,
  Fr: 223,
  Ra: 226,
  Ac: 227,
  Th: 232.04,
  Pa: 231.04,
  U: 238.03,
};

// Enhanced molecular weight calculator with parentheses support
const calculateMolecularWeight = (formula) => {
  try {
    const parseFormula = (str) => {
      const elementRegex = /([A-Z][a-z]?)(\d*)|\(|\)/g;
      let molecularWeight = 0;
      let stack = [0];
      let currentWeight = 0;
      let match;

      while ((match = elementRegex.exec(str)) !== null) {
        const token = match[0];
        if (token === "(") {
          stack.push(currentWeight);
          currentWeight = 0;
        } else if (token === ")") {
          const multiplierMatch = elementRegex.exec(str);
          const multiplier = multiplierMatch && !isNaN(multiplierMatch[0]) ? parseInt(multiplierMatch[0], 10) : 1;
          currentWeight *= multiplier;
          molecularWeight = stack.pop() + currentWeight;
          currentWeight = molecularWeight;
        } else {
          const element = token.match(/([A-Z][a-z]?)/)[0];
          const count = token.match(/\d+$/) ? parseInt(token.match(/\d+$/)[0], 10) : 1;
          if (atomicWeights[element]) {
            currentWeight += atomicWeights[element] * count;
          } else {
            throw new Error(`Unknown element: ${element}`);
          }
        }
      }
      return molecularWeight + currentWeight - stack[0];
    };

    const result = parseFormula(formula.replace(/\s/g, ""));
    return result.toFixed(2);
  } catch (error) {
    return error.message;
  }
};

const MolecularWeightCalculator = () => {
  const [formula, setFormula] = useState("");
  const [result, setResult] = useState("");
  const [mass, setMass] = useState("");
  const [moles, setMoles] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleCalculate = useCallback(() => {
    const weight = calculateMolecularWeight(formula);
    setResult(weight);
    if (!isNaN(weight)) {
      setHistory((prev) => [
        { formula, weight: `${weight} g/mol`, timestamp: new Date().toLocaleString() },
        ...prev.slice(0, 9), // Keep last 10 entries
      ]);
    }
  }, [formula]);

  const calculateMoles = useCallback(() => {
    const weight = parseFloat(result);
    const massValue = parseFloat(mass);
    if (!isNaN(weight) && !isNaN(massValue) && weight > 0) {
      const molesValue = (massValue / weight).toFixed(4);
      setMoles(molesValue);
    } else {
      setMoles("Invalid input");
    }
  }, [result, mass]);

  const reset = () => {
    setFormula("");
    setResult("");
    setMass("");
    setMoles("");
  };

  const downloadHistory = () => {
    const csvContent = [
      "Formula,Molecular Weight,Timestamp",
      ...history.map((entry) => `${entry.formula},${entry.weight},${entry.timestamp}`),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `molecular_weight_history_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Molecular Weight Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chemical Formula
            </label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g., H2O, CO2, C6H12O6, (NH4)2SO4"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
            />
          </div>

          {/* Mass to Moles Conversion */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mass (g)
              </label>
              <input
                type="number"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter mass in grams"
                value={mass}
                onChange={(e) => setMass(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moles
              </label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg bg-gray-100"
                value={moles}
                readOnly
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleCalculate}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate Weight
            </button>
            <button
              onClick={calculateMoles}
              disabled={!result || isNaN(result)}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate Moles
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Result */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <span className="text-gray-800 font-medium">Molecular Weight:</span>{" "}
            <strong className="text-gray-900">
              {result ? (isNaN(result) ? result : `${result} g/mol`) : "N/A"}
            </strong>
          </div>

          {/* History */}
          <div className="mt-6">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <FaHistory className="mr-2" /> {showHistory ? "Hide" : "Show"} History
            </button>
            {showHistory && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-700">Calculation History</h3>
                  {history.length > 0 && (
                    <button
                      onClick={downloadHistory}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <FaDownload className="mr-1" /> Export CSV
                    </button>
                  )}
                </div>
                {history.length > 0 ? (
                  <ul className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
                    {history.map((entry, index) => (
                      <li key={index}>
                        <span className="font-medium">{entry.formula}</span>: {entry.weight} (
                        {entry.timestamp})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No calculations yet</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate molecular weight from chemical formulas</li>
            <li>Support for parentheses (e.g., (NH4)2SO4)</li>
            <li>Convert mass to moles</li>
            <li>History tracking with export to CSV</li>
            <li>Error handling for unknown elements</li>
          </ul>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">How to Use</h3>
          <p className="text-sm text-gray-600">
            Enter a chemical formula (e.g., H2O, CO2, (NH4)2SO4). Use standard element symbols and numbers for atom counts. Optionally, input a mass to calculate moles.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MolecularWeightCalculator;