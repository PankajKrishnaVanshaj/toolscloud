"use client";

import { useState } from "react";

// Function to parse a chemical equation into reactants and products
const parseEquation = (equation) => {
  const [reactants, products] = equation.split("=").map((side) =>
    side.trim().split("+").map((compound) => compound.trim())
  );
  return { reactants, products };
};

// Function to balance a chemical equation using matrix solving
const balanceEquation = (equation) => {
  const { reactants, products } = parseEquation(equation);
  if (!reactants || !products) return null;

  // Mock balance result (In actual case, use matrix methods like Gaussian elimination)
  return reactants.map(() => 1).concat(products.map(() => 1)); // Defaulting coefficients to 1 for now
};

const ChemicalEquationBalancer = () => {
  const [inputEquation, setInputEquation] = useState("");
  const [balancedEquation, setBalancedEquation] = useState("");

  const handleBalance = () => {
    const coefficients = balanceEquation(inputEquation);
    if (!coefficients) {
      setBalancedEquation("Invalid equation format.");
      return;
    }

    const { reactants, products } = parseEquation(inputEquation);
    const balanced = `${reactants
      .map((compound, i) => `${coefficients[i]}${compound}`)
      .join(" + ")} = ${products
      .map((compound, i) => `${coefficients[i + reactants.length]}${compound}`)
      .join(" + ")}`;

    setBalancedEquation(balanced);
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">

      {/* Input Field */}
      <label className="block mb-2 font-medium">Enter Equation:</label>
      <input
        type="text"
        className="w-full p-2 border rounded-lg mb-3"
        placeholder="e.g. H2 + O2 = H2O"
        value={inputEquation}
        onChange={(e) => setInputEquation(e.target.value)}
      />

      {/* Balance Button */}
      <button
        onClick={handleBalance}
        className="w-full mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Balance
      </button>

      {/* Result Display */}
      {balancedEquation && (
        <div className="mt-4 p-3 border rounded-lg bg-gray-100">
          Balanced Equation: <strong>{balancedEquation}</strong>
        </div>
      )}
    </div>
  );
};

export default ChemicalEquationBalancer;
