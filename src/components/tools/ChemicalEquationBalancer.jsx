"use client";
import { useState, useCallback } from "react";
import { FaBalanceScale, FaSync, FaDownload } from "react-icons/fa";

// Function to parse a chemical equation into reactants and products
const parseEquation = (equation) => {
  if (!equation.includes("=")) {
    return { error: "Missing equals sign '='. Use 'Reactant1 + Reactant2 = Product1 + Product2'." };
  }

  try {
    const [reactantsSide, productsSide] = equation.split("=").map((side) => side.trim());
    const reactants = reactantsSide.split("+").map((compound) => compound.trim());
    const products = productsSide.split("+").map((compound) => compound.trim());

    if (!reactants.length || !products.length || reactants.some((r) => !r) || products.some((p) => !p)) {
      return { error: "Invalid equation. Ensure both sides have valid compounds." };
    }

    return { reactants, products };
  } catch {
    return { error: "Error parsing the equation." };
  }
};

// Simple element parser (e.g., H2O -> { H: 2, O: 1 })
const parseCompound = (compound) => {
  const elements = {};
  const regex = /([A-Z][a-z]?)(\d*)/g;
  let match;

  while ((match = regex.exec(compound)) !== null) {
    const element = match[1];
    const count = match[2] ? parseInt(match[2], 10) : 1;
    elements[element] = (elements[element] || 0) + count;
  }

  return elements;
};

// Basic balancing algorithm (simplified)
const balanceEquation = (equation) => {
  const parsed = parseEquation(equation);
  if (parsed.error) return { error: parsed.error };

  const { reactants, products } = parsed;

  // Parse elements in each compound
  const reactantElements = reactants.map(parseCompound);
  const productElements = products.map(parseCompound);

  // Aggregate total elements on each side
  const totalReactants = {};
  const totalProducts = {};
  
  reactantElements.forEach((elements) => {
    Object.entries(elements).forEach(([elem, count]) => {
      totalReactants[elem] = (totalReactants[elem] || 0) + count;
    });
  });
  
  productElements.forEach((elements) => {
    Object.entries(elements).forEach(([elem, count]) => {
      totalProducts[elem] = (totalProducts[elem] || 0) + count;
    });
  });

  // Simple balancing (assumes integer coefficients)
  const coefficients = Array(reactants.length + products.length).fill(1);
  let balanced = false;

  for (let i = 0; i < 10 && !balanced; i++) { // Limit iterations
    balanced = true;
    Object.keys(totalReactants).forEach((elem) => {
      const rCount = totalReactants[elem] * coefficients.slice(0, reactants.length).reduce((a, b) => a * b, 1);
      const pCount = totalProducts[elem] * coefficients.slice(reactants.length).reduce((a, b) => a * b, 1);
      if (rCount !== pCount) {
        balanced = false;
        if (rCount < pCount) coefficients[0]++;
        else coefficients[reactants.length]++;
      }
    });
  }

  if (!balanced) {
    return { error: "Unable to balance with simple integer coefficients." };
  }

  return { coefficients, reactants, products };
};

const ChemicalEquationBalancer = () => {
  const [inputEquation, setInputEquation] = useState("");
  const [balancedEquation, setBalancedEquation] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  const handleBalance = useCallback(() => {
    setErrorMessage("");
    setIsProcessing(true);

    setTimeout(() => { // Simulate processing delay
      const { coefficients, reactants, products, error } = balanceEquation(inputEquation);

      if (error) {
        setErrorMessage(error);
        setBalancedEquation("");
      } else {
        const balanced = `${reactants
          .map((compound, i) => `${coefficients[i] > 1 ? coefficients[i] : ""}${compound}`)
          .join(" + ")} = ${products
          .map((compound, i) => `${coefficients[i + reactants.length] > 1 ? coefficients[i + reactants.length] : ""}${compound}`)
          .join(" + ")}`;

        setBalancedEquation(balanced);
        setHistory((prev) => [balanced, ...prev.slice(0, 9)]); // Limit to 10 entries
      }
      setIsProcessing(false);
    }, 500);
  }, [inputEquation]);

  const handleClear = () => {
    setInputEquation("");
    setBalancedEquation("");
    setErrorMessage("");
    setShowSteps(false);
  };

  const downloadResult = () => {
    if (balancedEquation) {
      const blob = new Blob([balancedEquation], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `balanced-equation-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Chemical Equation Balancer</h2>

        {/* Input Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Chemical Equation
          </label>
          <input
            type="text"
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="e.g., H2 + O2 = H2O"
            value={inputEquation}
            onChange={(e) => setInputEquation(e.target.value)}
            disabled={isProcessing}
          />
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {errorMessage}
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={handleBalance}
            disabled={!inputEquation || isProcessing}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            ) : (
              <FaBalanceScale className="mr-2" />
            )}
            {isProcessing ? "Balancing..." : "Balance"}
          </button>
          <button
            onClick={handleClear}
            disabled={isProcessing}
            className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Clear
          </button>
          <button
            onClick={downloadResult}
            disabled={!balancedEquation || isProcessing}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download
          </button>
        </div>

        {/* Balanced Equation */}
        {balancedEquation && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <strong className="text-gray-700">Balanced Equation:</strong>
            <p className="mt-1 text-gray-800">{balancedEquation}</p>
            <label className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={showSteps}
                onChange={() => setShowSteps(!showSteps)}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Show Balancing Steps</span>
            </label>
            {showSteps && (
              <div className="mt-2 text-sm text-gray-600">
                <p>1. Parsed equation into reactants and products.</p>
                <p>2. Counted elements on both sides.</p>
                <p>3. Adjusted coefficients to balance (simplified method).</p>
              </div>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">History (Last 10):</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 max-h-40 overflow-y-auto">
              {history.map((eq, index) => (
                <li key={index} className="py-1">{eq}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Balances simple chemical equations</li>
            <li>Shows balancing steps (simplified)</li>
            <li>History of balanced equations</li>
            <li>Download balanced equation as text</li>
            <li>Error handling and feedback</li>
          </ul>
        </div>

        {/* Note */}
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-700 text-sm">
            <strong>Note:</strong> This uses a simplified balancing algorithm. For complex equations, consider a full algebraic solver.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChemicalEquationBalancer;