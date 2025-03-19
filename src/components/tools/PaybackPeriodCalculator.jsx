"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaChartLine } from "react-icons/fa";

const PaybackPeriodCalculator = () => {
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [cashFlows, setCashFlows] = useState([2500]); // Array for variable cash flows
  const [discountRate, setDiscountRate] = useState(0); // For discounted payback
  const [result, setResult] = useState(null);
  const [showChart, setShowChart] = useState(false);

  // Calculate payback period (simple and discounted)
  const calculatePaybackPeriod = useCallback(() => {
    if (initialInvestment <= 0 || cashFlows.some((cf) => cf <= 0)) {
      setResult({
        simple: null,
        discounted: null,
        error: "Please enter positive values for investment and cash flows.",
      });
      return;
    }

    // Simple Payback
    let cumulativeCashFlow = 0;
    let simpleYears = 0;
    for (let i = 0; i < cashFlows.length; i++) {
      cumulativeCashFlow += cashFlows[i];
      if (cumulativeCashFlow >= initialInvestment) {
        const remaining = initialInvestment - (cumulativeCashFlow - cashFlows[i]);
        const months = Math.ceil((remaining / cashFlows[i]) * 12);
        simpleYears = i;
        setResult((prev) => ({
          ...prev,
          simple: { years: simpleYears, months, totalMonths: simpleYears * 12 + months },
          error: null,
        }));
        break;
      }
    }

    // Discounted Payback (if discount rate > 0)
    if (discountRate > 0) {
      let discountedCumulative = 0;
      let discountedYears = 0;
      for (let i = 0; i < cashFlows.length; i++) {
        const discountedCF = cashFlows[i] / Math.pow(1 + discountRate / 100, i + 1);
        discountedCumulative += discountedCF;
        if (discountedCumulative >= initialInvestment) {
          const remaining =
            initialInvestment - (discountedCumulative - discountedCF);
          const months = Math.ceil((remaining / discountedCF) * 12);
          discountedYears = i;
          setResult((prev) => ({
            ...prev,
            discounted: {
              years: discountedYears,
              months,
              totalMonths: discountedYears * 12 + months,
            },
          }));
          break;
        }
      }
    }
  }, [initialInvestment, cashFlows, discountRate]);

  useEffect(() => {
    calculatePaybackPeriod();
  }, [initialInvestment, cashFlows, discountRate, calculatePaybackPeriod]);

  // Add or remove cash flow years
  const addCashFlow = () => setCashFlows((prev) => [...prev, 0]);
  const removeCashFlow = (index) =>
    setCashFlows((prev) => prev.filter((_, i) => i !== index));
  const updateCashFlow = (index, value) =>
    setCashFlows((prev) => prev.map((cf, i) => (i === index ? Number(value) : cf)));

  // Reset to default values
  const reset = () => {
    setInitialInvestment(10000);
    setCashFlows([2500]);
    setDiscountRate(0);
    setShowChart(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Payback Period Calculator
        </h1>

        {/* Input Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial Investment ($)
            </label>
            <input
              type="number"
              value={initialInvestment}
              onChange={(e) => setInitialInvestment(Number(e.target.value))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Rate (%)
            </label>
            <input
              type="number"
              value={discountRate}
              onChange={(e) => setDiscountRate(Number(e.target.value))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </div>

        {/* Cash Flows */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Annual Cash Flows ($)</h3>
          {cashFlows.map((cf, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="number"
                value={cf}
                onChange={(e) => updateCashFlow(index, e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                min="0"
                step="100"
                placeholder={`Year ${index + 1}`}
              />
              {cashFlows.length > 1 && (
                <button
                  onClick={() => removeCashFlow(index)}
                  className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addCashFlow}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add Year
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center">Results</h2>
            {result.error ? (
              <p className="text-red-600 text-center">{result.error}</p>
            ) : (
              <div className="space-y-4 text-center">
                <div>
                  <p className="font-medium">Simple Payback Period:</p>
                  <span className="font-bold text-green-600">
                    {result.simple.years} years
                    {result.simple.months > 0 && ` and ${result.simple.months} months`}
                  </span>
                  <p className="text-sm text-gray-600">
                    ({result.simple.totalMonths} months)
                  </p>
                </div>
                {result.discounted && (
                  <div>
                    <p className="font-medium">Discounted Payback Period:</p>
                    <span className="font-bold text-blue-600">
                      {result.discounted.years} years
                      {result.discounted.months > 0 && ` and ${result.discounted.months} months`}
                    </span>
                    <p className="text-sm text-gray-600">
                      ({result.discounted.totalMonths} months)
                    </p>
                  </div>
                )}
                <p>
                  Initial Investment: $
                  <span className="font-medium">{Number(initialInvestment).toLocaleString()}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
          <button
            onClick={() => setShowChart(!showChart)}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FaChartLine className="mr-2" /> {showChart ? "Hide" : "Show"} Chart
          </button>
        </div>

        {/* Cumulative Cash Flow Chart */}
        {showChart && result && !result.error && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Cumulative Cash Flow</h3>
            <div className="overflow-x-auto">
              <div className="h-64 flex items-end gap-2 min-w-max">
                {cashFlows.map((cf, index) => {
                  const cumulative = cashFlows
                    .slice(0, index + 1)
                    .reduce((sum, val) => sum + val, 0);
                  const discountedCumulative =
                    discountRate > 0
                      ? cashFlows
                          .slice(0, index + 1)
                          .reduce(
                            (sum, val, i) => sum + val / Math.pow(1 + discountRate / 100, i + 1),
                            0
                          )
                      : null;
                  const height = (cumulative / initialInvestment) * 100;
                  const discountedHeight =
                    discountedCumulative !== null
                      ? (discountedCumulative / initialInvestment) * 100
                      : null;

                  return (
                    <div key={index} className="flex-1 text-center">
                      <div className="relative w-12">
                        <div
                          className="bg-green-500 opacity-75"
                          style={{ height: `${Math.min(height, 100)}%` }}
                        />
                        {discountedHeight !== null && (
                          <div
                            className="bg-blue-500 opacity-75 absolute top-0 left-0 w-full"
                            style={{ height: `${Math.min(discountedHeight, 100)}%` }}
                          />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Year {index + 1}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Green: Simple | Blue: Discounted (if applicable)
            </p>
          </div>
        )}

        {/* Notes */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate simple and discounted payback periods</li>
            <li>Support for variable annual cash flows</li>
            <li>Discount rate for time value of money</li>
            <li>Cumulative cash flow visualization</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaybackPeriodCalculator;