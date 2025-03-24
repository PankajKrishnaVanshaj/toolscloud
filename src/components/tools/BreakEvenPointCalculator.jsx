"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaChartLine } from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"; // For graphical representation

const BreakEvenPointCalculator = () => {
  const [fixedCosts, setFixedCosts] = useState(10000);
  const [variableCostPerUnit, setVariableCostPerUnit] = useState(20);
  const [sellingPricePerUnit, setSellingPricePerUnit] = useState(50);
  const [targetProfit, setTargetProfit] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [showGraph, setShowGraph] = useState(false);

  const calculateBreakEven = useCallback(() => {
    if (sellingPricePerUnit <= variableCostPerUnit) {
      setError("Selling price must be greater than variable cost per unit");
      setResults(null);
      return;
    }

    const contributionMargin = sellingPricePerUnit - variableCostPerUnit;
    const breakEvenUnits = Math.ceil(fixedCosts / contributionMargin);
    const breakEvenSales = breakEvenUnits * sellingPricePerUnit;
    const unitsForProfit = Math.ceil((fixedCosts + targetProfit) / contributionMargin);
    const salesForProfit = unitsForProfit * sellingPricePerUnit;

    // Generate data for graph
    const graphData = [];
    const maxUnits = Math.max(breakEvenUnits, unitsForProfit) * 1.5;
    for (let units = 0; units <= maxUnits; units += Math.ceil(maxUnits / 20)) {
      const totalRevenue = units * sellingPricePerUnit;
      const totalCost = fixedCosts + units * variableCostPerUnit;
      graphData.push({
        units,
        Revenue: totalRevenue,
        Cost: totalCost,
        Profit: totalRevenue - totalCost,
      });
    }

    setResults({
      breakEvenUnits,
      breakEvenSales,
      contributionMargin,
      unitsForProfit,
      salesForProfit,
      graphData,
    });
    setError("");
  }, [fixedCosts, variableCostPerUnit, sellingPricePerUnit, targetProfit]);

  useEffect(() => {
    calculateBreakEven();
  }, [calculateBreakEven]);

  const reset = () => {
    setFixedCosts(10000);
    setVariableCostPerUnit(20);
    setSellingPricePerUnit(50);
    setTargetProfit(0);
    setShowGraph(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Break-Even Point Calculator
        </h1>

        {/* Input Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[
            {
              label: "Fixed Costs ($)",
              value: fixedCosts,
              setter: setFixedCosts,
              step: 100,
            },
            {
              label: "Variable Cost per Unit ($)",
              value: variableCostPerUnit,
              setter: setVariableCostPerUnit,
              step: 1,
            },
            {
              label: "Selling Price per Unit ($)",
              value: sellingPricePerUnit,
              setter: setSellingPricePerUnit,
              step: 1,
            },
            {
              label: "Target Profit ($)",
              value: targetProfit,
              setter: setTargetProfit,
              step: 100,
            },
          ].map(({ label, value, setter, step }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setter(Math.max(0, Number(e.target.value)))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                min="0"
                step={step}
              />
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        {/* Results */}
        {results && !error && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Results</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p>
                    Break-Even Point (Units):{" "}
                    <span className="font-bold text-green-600">
                      {results.breakEvenUnits.toLocaleString()}
                    </span>
                  </p>
                  <p>
                    Break-Even Sales ($):{" "}
                    <span className="font-bold text-green-600">
                      {results.breakEvenSales.toLocaleString()}
                    </span>
                  </p>
                  <p>
                    Contribution Margin per Unit ($):{" "}
                    <span className="font-medium">
                      {results.contributionMargin.toLocaleString()}
                    </span>
                  </p>
                </div>
                <div>
                  <p>
                    Units for Target Profit:{" "}
                    <span className="font-bold text-blue-600">
                      {results.unitsForProfit.toLocaleString()}
                    </span>
                  </p>
                  <p>
                    Sales for Target Profit ($):{" "}
                    <span className="font-bold text-blue-600">
                      {results.salesForProfit.toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Graph Toggle and Display */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowGraph(!showGraph)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaChartLine className="mr-2" />
                {showGraph ? "Hide Graph" : "Show Graph"}
              </button>
            </div>

            {showGraph && (
              <div className="bg-gray-50 p-4 rounded-md">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={results.graphData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="units"
                      label={{ value: "Units", position: "insideBottomRight", offset: -5 }}
                    />
                    <YAxis
                      label={{ value: "Amount ($)", angle: -90, position: "insideLeft" }}
                    />
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Revenue"
                      stroke="#8884d8"
                      name="Revenue"
                    />
                    <Line type="monotone" dataKey="Cost" stroke="#82ca9d" name="Cost" />
                    <Line type="monotone" dataKey="Profit" stroke="#ff7300" name="Profit" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center mt-6">
          <button
            onClick={reset}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Notes */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: This calculator assumes constant costs and prices. Actual results may vary
          due to market conditions and other factors.
        </p>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate break-even point in units and sales</li>
            <li>Target profit calculation</li>
            <li>Interactive graph showing revenue, cost, and profit</li>
            <li>Real-time updates with input changes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BreakEvenPointCalculator;