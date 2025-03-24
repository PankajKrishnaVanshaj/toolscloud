"use client";
import React, { useState, useCallback } from "react";
import { FaPlus, FaTrash, FaSync, FaChartLine } from "react-icons/fa";

const InternalRateOfReturnCalculator = () => {
  const [cashFlows, setCashFlows] = useState([-1000, 300, 400, 500]);
  const [irr, setIrr] = useState(null);
  const [npv, setNpv] = useState(null);
  const [discountRate, setDiscountRate] = useState(5); // For NPV calculation
  const [error, setError] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate IRR using Newton-Raphson method
  const calculateIRR = useCallback((flows) => {
    const maxIterations = 1000;
    const precision = 0.0000001;
    let guess = 0.1;

    const npvFunc = (rate) =>
      flows.reduce((sum, flow, index) => sum + flow / Math.pow(1 + rate, index), 0);

    const derivative = (rate) =>
      flows.reduce((sum, flow, index) => {
        if (index === 0) return sum;
        return sum - (index * flow) / Math.pow(1 + rate, index + 1);
      }, 0);

    for (let i = 0; i < maxIterations; i++) {
      const npvValue = npvFunc(guess);
      const derivValue = derivative(guess);

      if (Math.abs(derivValue) < precision) return null;

      const newGuess = guess - npvValue / derivValue;

      if (Math.abs(newGuess - guess) < precision) {
        return newGuess * 100;
      }

      guess = newGuess;
    }
    return null;
  }, []);

  // Calculate NPV
  const calculateNPV = (flows, rate) => {
    return flows.reduce(
      (sum, flow, index) => sum + flow / Math.pow(1 + rate / 100, index),
      0
    );
  };

  const handleCalculate = useCallback(() => {
    if (cashFlows.length < 2) {
      setError("Please enter at least two cash flows.");
      setIrr(null);
      setNpv(null);
      return;
    }

    setIsCalculating(true);
    const flows = cashFlows.map(Number);
    const calculatedIRR = calculateIRR(flows);
    const calculatedNPV = calculateNPV(flows, discountRate);

    if (calculatedIRR === null) {
      setError("Unable to calculate IRR. Try adjusting your cash flows.");
      setIrr(null);
    } else {
      setIrr(calculatedIRR.toFixed(2));
      setError("");
    }
    setNpv(calculatedNPV.toFixed(2));
    setIsCalculating(false);
  }, [cashFlows, discountRate, calculateIRR]);

  const handleCashFlowChange = (index, value) => {
    const newCashFlows = [...cashFlows];
    newCashFlows[index] = value === "" ? "" : Number(value);
    setCashFlows(newCashFlows);
  };

  const addCashFlow = () => setCashFlows([...cashFlows, 0]);

  const removeCashFlow = (index) => {
    if (cashFlows.length > 1) {
      setCashFlows(cashFlows.filter((_, i) => i !== index));
    }
  };

  const reset = () => {
    setCashFlows([-1000]);
    setIrr(null);
    setNpv(null);
    setDiscountRate(5);
    setError("");
    setIsCalculating(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Internal Rate of Return Calculator
        </h1>

        <div className="space-y-6">
          {/* Cash Flow Inputs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cash Flows (Negative for investment, Positive for returns)
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cashFlows.map((flow, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="number"
                    value={flow}
                    onChange={(e) => handleCashFlowChange(index, e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder={`Year ${index} cash flow`}
                    disabled={isCalculating}
                  />
                  {cashFlows.length > 1 && (
                    <button
                      onClick={() => removeCashFlow(index)}
                      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-red-300"
                      disabled={isCalculating}
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addCashFlow}
              className="mt-2 flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 transition-colors"
              disabled={isCalculating}
            >
              <FaPlus className="mr-2" /> Add Cash Flow
            </button>
          </div>

          {/* Discount Rate for NPV */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Rate for NPV ({discountRate}%)
            </label>
            <input
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={discountRate}
              onChange={(e) => setDiscountRate(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              disabled={isCalculating}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleCalculate}
              disabled={isCalculating}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isCalculating ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              ) : (
                <FaChartLine className="mr-2" />
              )}
              {isCalculating ? "Calculating..." : "Calculate"}
            </button>
            <button
              onClick={reset}
              disabled={isCalculating}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results */}
          {(irr !== null || npv !== null) && (
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              {irr !== null && (
                <div>
                  <h2 className="text-lg font-semibold text-blue-600">IRR: {irr}%</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Rate where NPV equals zero
                  </p>
                </div>
              )}
              {npv !== null && (
                <div className="mt-2">
                  <h2 className="text-lg font-semibold text-green-600">
                    NPV: ${npv}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Net Present Value at {discountRate}% discount rate
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-600 text-center bg-red-50 p-2 rounded-md">
              {error}
            </p>
          )}

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Calculate IRR using Newton-Raphson method</li>
              <li>Compute NPV with adjustable discount rate</li>
              <li>Dynamic cash flow input management</li>
              <li>Real-time feedback during calculation</li>
            </ul>
          </div>

          {/* Instructions */}
          <p className="text-xs text-gray-500 mt-4">
            Note: Enter cash flows chronologically. IRR may not converge for all inputs.
            NPV is calculated based on the specified discount rate.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InternalRateOfReturnCalculator;