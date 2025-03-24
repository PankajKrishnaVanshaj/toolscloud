"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCalculator } from "react-icons/fa";

const StoichiometryCalculator = () => {
  const [equation, setEquation] = useState("");
  const [reactantAmount, setReactantAmount] = useState("");
  const [selectedReactant, setSelectedReactant] = useState("");
  const [unit, setUnit] = useState("moles"); // New: moles or grams
  const [molarMasses, setMolarMasses] = useState({}); // New: molar masses for conversion
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Simplified chemical formula parser
  const parseFormula = (formula) => {
    const regex = /([A-Z][a-z]?)(\d*)/g;
    let match;
    const elements = {};
    while ((match = regex.exec(formula)) !== null) {
      const element = match[1];
      const count = match[2] ? parseInt(match[2]) : 1;
      elements[element] = (elements[element] || 0) + count;
    }
    return elements;
  };

  // Enhanced balancing logic
  const balanceEquation = useCallback((eq) => {
    const [reactantsStr, productsStr] = eq.split("->").map((s) => s.trim());
    const reactants = reactantsStr.split("+").map((s) => s.trim());
    const products = productsStr.split("+").map((s) => s.trim());

    const reactantElements = reactants.map(parseFormula);
    const productElements = products.map(parseFormula);

    let coeffs = Array(reactants.length + products.length).fill(1);
    const totalReactants = {};
    const totalProducts = {};

    const updateTotals = () => {
      Object.keys(totalReactants).forEach((k) => delete totalReactants[k]);
      Object.keys(totalProducts).forEach((k) => delete totalProducts[k]);

      reactantElements.forEach((el, i) => {
        Object.entries(el).forEach(([elem, count]) => {
          totalReactants[elem] = (totalReactants[elem] || 0) + count * coeffs[i];
        });
      });
      productElements.forEach((el, i) => {
        Object.entries(el).forEach(([elem, count]) => {
          totalProducts[elem] =
            (totalProducts[elem] || 0) + count * coeffs[i + reactants.length];
        });
      });
    };

    const isBalanced = () =>
      Object.keys(totalReactants).every(
        (e) => totalReactants[e] === (totalProducts[e] || 0)
      ) &&
      Object.keys(totalProducts).every(
        (e) => totalProducts[e] === (totalReactants[e] || 0)
      );

    // Improved balancing with LCM
    for (let attempts = 0; attempts < 100 && !isBalanced(); attempts++) {
      updateTotals();
      const imbalances = {};
      Object.keys(totalReactants).forEach((e) => {
        const diff = (totalReactants[e] || 0) - (totalProducts[e] || 0);
        if (diff !== 0) imbalances[e] = diff;
      });

      if (Object.keys(imbalances).length === 0) break;

      const adjustSide = (side, indexOffset, factor) => {
        Object.entries(imbalances).forEach(([elem, diff]) => {
          const index = side.findIndex((el) => el[elem]);
          if (index !== -1) {
            coeffs[index + indexOffset] = Math.max(
              1,
              Math.round(coeffs[index + indexOffset] + diff / (side[index][elem] || 1) * factor)
            );
          }
        });
      };

      adjustSide(reactantElements, 0, 1);
      adjustSide(productElements, reactants.length, -1);
    }

    updateTotals();
    if (!isBalanced()) {
      throw new Error("Unable to balance equation with reasonable coefficients");
    }

    return { reactants, products, coefficients: coeffs };
  }, []);

  // Calculate molar mass from formula
  const calculateMolarMass = (formula) => {
    const elements = parseFormula(formula);
    const molarMassData = {
      H: 1.008,
      O: 16.0,
      C: 12.01,
      N: 14.01,
      // Add more elements as needed
    };
    return Object.entries(elements).reduce(
      (sum, [elem, count]) => sum + (molarMassData[elem] || 0) * count,
      0
    );
  };

  const calculateStoichiometry = useCallback(() => {
    setError("");
    setResult(null);
    setIsProcessing(true);

    if (!equation.trim()) {
      setError("Please enter a chemical equation");
      setIsProcessing(false);
      return;
    }
    if (!reactantAmount || isNaN(reactantAmount) || reactantAmount <= 0) {
      setError("Please enter a valid positive amount");
      setIsProcessing(false);
      return;
    }
    if (!selectedReactant) {
      setError("Please select a reactant");
      setIsProcessing(false);
      return;
    }

    try {
      const { reactants, products, coefficients } = balanceEquation(equation);
      const reactantIndex = reactants.indexOf(selectedReactant);

      if (reactantIndex === -1) {
        setError("Selected reactant not found in equation");
        setIsProcessing(false);
        return;
      }

      const amount = parseFloat(reactantAmount);
      const refCoeff = coefficients[reactantIndex];
      const moleRatios = coefficients.map((coeff) => coeff / refCoeff);

      let moles = moleRatios.map((ratio) => ratio * amount);
      let masses = [];

      if (unit === "grams") {
        const refMolarMass = calculateMolarMass(selectedReactant);
        const molesFromGrams = amount / refMolarMass;
        moles = moleRatios.map((ratio) => ratio * molesFromGrams);
      }

      masses = [...reactants, ...products].map((formula, i) =>
        moles[i] * calculateMolarMass(formula)
      );

      setResult({
        balancedEquation: `${coefficients
          .slice(0, reactants.length)
          .map((c, i) => `${c === 1 ? "" : c}${reactants[i]}`)
          .join(" + ")} -> ${coefficients
          .slice(reactants.length)
          .map((c, i) => `${c === 1 ? "" : c}${products[i]}`)
          .join(" + ")}`,
        reactants,
        products,
        moles: {
          reactants: reactants.map((r, i) => ({ formula: r, moles: moles[i] })),
          products: products.map((p, i) => ({
            formula: p,
            moles: moles[i + reactants.length],
          })),
        },
        masses: {
          reactants: reactants.map((r, i) => ({ formula: r, grams: masses[i] })),
          products: products.map((p, i) => ({
            formula: p,
            grams: masses[i + reactants.length],
          })),
        },
      });
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  }, [equation, reactantAmount, selectedReactant, unit]);

  const formatNumber = (num, digits = 2) =>
    num.toLocaleString("en-US", { maximumFractionDigits: digits });

  const reset = () => {
    setEquation("");
    setReactantAmount("");
    setSelectedReactant("");
    setUnit("moles");
    setMolarMasses({});
    setResult(null);
    setError("");
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Stoichiometry Calculator
        </h1>

        <div className="space-y-6">
          {/* Equation Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chemical Equation (e.g., H2 + O2 -&gt; H2O)
            </label>
            <input
              type="text"
              value={equation}
              onChange={(e) => setEquation(e.target.value)}
              placeholder="Reactants -> Products"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              disabled={isProcessing}
            />
          </div>

          {/* Reactant Selection and Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Reactant
              </label>
              <select
                value={selectedReactant}
                onChange={(e) => setSelectedReactant(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                disabled={isProcessing}
              >
                <option value="">Select...</option>
                {equation
                  .split("->")[0]
                  ?.split("+")
                  .map((r) => r.trim())
                  .filter(Boolean)
                  .map((r, i) => (
                    <option key={i} value={r}>
                      {r}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                value={reactantAmount}
                onChange={(e) => setReactantAmount(e.target.value)}
                placeholder="e.g., 2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                disabled={isProcessing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                disabled={isProcessing}
              >
                <option value="moles">Moles</option>
                <option value="grams">Grams</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateStoichiometry}
              disabled={isProcessing}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" />
              {isProcessing ? "Calculating..." : "Calculate"}
            </button>
            <button
              onClick={reset}
              disabled={isProcessing}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">Results:</h2>
              <p className="mb-2">
                <strong>Balanced Equation:</strong> {result.balancedEquation}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Reactants:</h3>
                  {result.moles.reactants.map((r, i) => (
                    <p key={i}>
                      {r.formula}: {formatNumber(r.moles)} moles (
                      {formatNumber(result.masses.reactants[i].grams)} g)
                    </p>
                  ))}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Products:</h3>
                  {result.moles.products.map((p, i) => (
                    <p key={i}>
                      {p.formula}: {formatNumber(p.moles)} moles (
                      {formatNumber(result.masses.products[i].grams)} g)
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Presets</label>
            <div className="flex flex-wrap gap-2">
              {[
                { eq: "H2 + O2 -> H2O", label: "Water Formation" },
                { eq: "CH4 + O2 -> CO2 + H2O", label: "Methane Combustion" },
                { eq: "N2 + H2 -> NH3", label: "Ammonia Synthesis" },
              ].map((preset, i) => (
                <button
                  key={i}
                  onClick={() => setEquation(preset.eq)}
                  disabled={isProcessing}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Balances chemical equations automatically</li>
              <li>Calculates molar ratios and masses</li>
              <li>Supports moles and grams input</li>
              <li>Preset equations for quick testing</li>
            </ul>
          </div>

          {/* Limitations */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-sm text-yellow-700">
            <p>
              <strong>Limitations:</strong> Supports simple equations (up to 2-3 reactants/products). No parentheses, complex ions, or advanced balancing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoichiometryCalculator;