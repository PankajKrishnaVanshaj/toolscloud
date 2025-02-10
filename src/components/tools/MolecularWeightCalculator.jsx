"use client";

import { useState } from "react";

// Atomic weights for common elements
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
  Fe: 55.845,
  Cu: 63.546,
  Zn: 65.38,
  Ag: 107.87,
  Au: 196.97,
  Pb: 207.2,
};

// Function to parse chemical formula and calculate molecular weight
const calculateMolecularWeight = (formula) => {
  const elementRegex = /([A-Z][a-z]?)(\d*)/g;
  let molecularWeight = 0;
  let match;

  while ((match = elementRegex.exec(formula)) !== null) {
    const element = match[1];
    const count = match[2] ? parseInt(match[2], 10) : 1;

    if (atomicWeights[element]) {
      molecularWeight += atomicWeights[element] * count;
    } else {
      return `Unknown element: ${element}`;
    }
  }

  return molecularWeight.toFixed(2);
};

const MolecularWeightCalculator = () => {
  const [formula, setFormula] = useState("");
  const [result, setResult] = useState("");

  const handleCalculate = () => {
    setResult(calculateMolecularWeight(formula));
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">

      {/* Formula Input */}
      <input
        type="text"
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        placeholder="Enter chemical formula (e.g., H2O, CO2, C6H12O6)"
        value={formula}
        onChange={(e) => setFormula(e.target.value)}
      />

      {/* Calculate Button */}
      <button
        onClick={handleCalculate}
        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Calculate
      </button>

      {/* Result */}
      <div className="mt-4 p-3 border rounded-lg bg-gray-100">
        Molecular Weight: <strong>{result ? result + " g/mol" : "N/A"}</strong>
      </div>
    </div>
  );
};

export default MolecularWeightCalculator;
