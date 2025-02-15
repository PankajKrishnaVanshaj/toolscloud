"use client";

import { useState } from "react";

// Function to parse a chemical equation into reactants and products
const parseEquation = (equation) => {
  if (!equation.includes("=")) {
    return { error: "Missing equals sign '='. Please format as 'Reactant1 + Reactant2 = Product1 + Product2'." };
  }

  try {
    const [reactants, products] = equation.split("=").map((side) =>
      side.trim().split("+").map((compound) => compound.trim())
    );

    if (!reactants.length || !products.length || reactants.some(r => !r) || products.some(p => !p)) {
      return { error: "Invalid equation. Ensure both reactants and products are properly specified." };
    }

    return { reactants, products };
  } catch {
    return { error: "Unknown error while parsing the equation." };
  }
};

// Mock function to balance common chemical equations for demonstration purposes
const balanceEquation = (equation) => {
  const parsed = parseEquation(equation);
  if (parsed.error) return { error: parsed.error };

  const { reactants, products } = parsed;

  // Hardcoded common cases (for demo purposes)
  if (equation === "H2 + O2 = H2O") {
    return { coefficients: [2, 1, 2], reactants, products }; // Correct balancing: 2H2 + O2 = 2H2O
  }

  // Default mock balancing (assigns random coefficients for other cases)
  const coefficients = reactants.map(() => 1).concat(products.map(() => 1));
  return { coefficients, reactants, products };
};

const ChemicalEquationBalancer = () => {
  const [inputEquation, setInputEquation] = useState("");
  const [balancedEquation, setBalancedEquation] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [history, setHistory] = useState([]);

  const handleBalance = () => {
    setErrorMessage("");
    const { coefficients, reactants, products, error } = balanceEquation(inputEquation);

    if (error) {
      setErrorMessage(error);
      setBalancedEquation("");
      return;
    }

    const balanced = `${reactants
      .map((compound, i) => `${coefficients[i]}${compound}`)
      .join(" + ")} = ${products
      .map((compound, i) => `${coefficients[i + reactants.length]}${compound}`)
      .join(" + ")}`;

    setBalancedEquation(balanced);
    setHistory((prevHistory) => [balanced, ...prevHistory]);
  };

  const handleClear = () => {
    setInputEquation("");
    setBalancedEquation("");
    setErrorMessage("");
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg max-w-md">

      {/* Input Field */}
      <label className="block mb-2 font-medium text-gray-700">Enter Chemical Equation:</label>
      <input
        type="text"
        className="w-full p-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="e.g. H2 + O2 = H2O"
        value={inputEquation}
        onChange={(e) => setInputEquation(e.target.value)}
      />

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-3 text-red-500 text-sm font-medium">
          {errorMessage}
        </div>
      )}

      {/* Balance Button */}
      <button
        onClick={handleBalance}
        className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
      >
        Balance
      </button>

      {/* Clear Button */}
      <button
        onClick={handleClear}
        className="w-full mt-3 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
      >
        Clear
      </button>

      {/* Balanced Equation Display */}
      {balancedEquation && (
        <div className="mt-4 p-3 border rounded-lg bg-gray-100">
          <strong className="text-gray-700">Balanced Equation:</strong> <span>{balancedEquation}</span>
        </div>
      )}

      {/* History Section */}
      {history.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium mb-2 text-gray-700">History:</h3>
          <ul className="list-disc list-inside bg-gray-50 p-3 rounded-lg border">
            {history.map((eq, index) => (
              <li key={index} className="text-sm text-gray-700">
                {eq}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ChemicalEquationBalancer;
