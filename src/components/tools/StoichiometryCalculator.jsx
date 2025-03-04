'use client'
import React, { useState } from 'react';

const StoichiometryCalculator = () => {
  const [equation, setEquation] = useState(''); // e.g., "H2 + O2 -> H2O"
  const [reactantAmount, setReactantAmount] = useState(''); // Amount in moles
  const [selectedReactant, setSelectedReactant] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Simplified chemical formula parser (handles basic formulas without parentheses)
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

  const balanceEquation = (eq) => {
    const [reactantsStr, productsStr] = eq.split('->').map(s => s.trim());
    const reactants = reactantsStr.split('+').map(s => s.trim());
    const products = productsStr.split('+').map(s => s.trim());

    const reactantElements = reactants.map(parseFormula);
    const productElements = products.map(parseFormula);

    // Simple balancing (assumes 2 reactants and 1-2 products for now)
    let coeffs = [1, 1, 1, 1]; // [reactant1, reactant2, product1, product2]
    const totalReactants = {};
    const totalProducts = {};

    // Count total elements on each side
    const updateTotals = () => {
      Object.keys(totalReactants).forEach(k => delete totalReactants[k]);
      Object.keys(totalProducts).forEach(k => delete totalProducts[k]);

      reactantElements.forEach((el, i) => {
        Object.entries(el).forEach(([elem, count]) => {
          totalReactants[elem] = (totalReactants[elem] || 0) + count * coeffs[i];
        });
      });
      productElements.forEach((el, i) => {
        Object.entries(el).forEach(([elem, count]) => {
          totalProducts[elem] = (totalProducts[elem] || 0) + count * coeffs[i + reactants.length];
        });
      });
    };

    // Basic balancing logic (trial and error up to coeff 10)
    for (let i = 1; i <= 10 && !isBalanced(); i++) {
      for (let j = 1; j <= 10 && !isBalanced(); j++) {
        coeffs = [i, j, 1, 1];
        updateTotals();
        if (!isBalanced()) {
          coeffs[2] = Math.max(...Object.keys(totalReactants).map(e => 
            totalReactants[e] / (productElements[0][e] || 1)
          ));
          updateTotals();
        }
      }
    }

    function isBalanced() {
      updateTotals();
      return Object.keys(totalReactants).every(e => 
        totalReactants[e] === (totalProducts[e] || 0)
      ) && Object.keys(totalProducts).every(e => 
        totalProducts[e] === (totalReactants[e] || 0)
      );
    }

    if (!isBalanced()) {
      throw new Error('Unable to balance equation with simple coefficients');
    }

    return { reactants, products, coefficients: coeffs };
  };

  const calculateStoichiometry = () => {
    setError('');
    setResult(null);

    if (!equation.trim()) {
      setError('Please enter a chemical equation');
      return;
    }
    if (!reactantAmount || isNaN(reactantAmount) || reactantAmount <= 0) {
      setError('Please enter a valid positive amount in moles');
      return;
    }
    if (!selectedReactant) {
      setError('Please select a reactant');
      return;
    }

    try {
      const { reactants, products, coefficients } = balanceEquation(equation);
      const amount = parseFloat(reactantAmount);
      const reactantIndex = reactants.indexOf(selectedReactant);

      if (reactantIndex === -1) {
        setError('Selected reactant not found in equation');
        return;
      }

      const refCoeff = coefficients[reactantIndex];
      const moleRatios = coefficients.map(coeff => coeff / refCoeff);
      const moles = moleRatios.map(ratio => ratio * amount);

      setResult({
        balancedEquation: `${coefficients[0]}${reactants[0]}${reactants[1] ? ` + ${coefficients[1]}${reactants[1]}` : ''} -> ${coefficients[2]}${products[0]}${products[1] ? ` + ${coefficients[3]}${products[1]}` : ''}`,
        reactants,
        products,
        moles: {
          reactants: reactants.map((r, i) => ({ formula: r, moles: moles[i] })),
          products: products.map((p, i) => ({ formula: p, moles: moles[i + reactants.length] })),
        },
      });
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  const formatNumber = (num, digits = 2) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Reactant Selection and Amount */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Reactant
              </label>
              <select
                value={selectedReactant}
                onChange={(e) => setSelectedReactant(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                {equation.split('->')[0]?.split('+').map(r => r.trim()).filter(Boolean).map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (moles)
              </label>
              <input
                type="number"
                value={reactantAmount}
                onChange={(e) => setReactantAmount(e.target.value)}
                placeholder="e.g., 2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateStoichiometry}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <p>Balanced Equation: {result.balancedEquation}</p>
              <h3 className="font-semibold mt-2">Reactants:</h3>
              {result.moles.reactants.map((r, i) => (
                <p key={i}>{r.formula}: {formatNumber(r.moles)} moles</p>
              ))}
              <h3 className="font-semibold mt-2">Products:</h3>
              {result.moles.products.map((p, i) => (
                <p key={i}>{p.formula}: {formatNumber(p.moles)} moles</p>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Presets
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setEquation('H2 + O2 -> H2O')}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Water Formation
              </button>
              <button
                onClick={() => setEquation('CH4 + O2 -> CO2 + H2O')}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Methane Combustion
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Balances chemical equations and calculates molar ratios.</p>
                <p>Limitations:</p>
                <ul className="list-disc list-inside">
                  <li>Supports simple equations (up to 2 reactants/products)</li>
                  <li>No parentheses or complex ions</li>
                  <li>Basic balancing up to coefficient 10</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoichiometryCalculator;