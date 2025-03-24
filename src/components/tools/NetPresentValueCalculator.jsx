"use client";
import React, { useState, useCallback, useEffect } from "react";
import { FaPlus, FaMinus, FaSync, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the result

const NetPresentValueCalculator = () => {
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [discountRate, setDiscountRate] = useState(5);
  const [cashFlows, setCashFlows] = useState([5000, 5000, 5000]);
  const [npv, setNpv] = useState(null);
  const [irr, setIrr] = useState(null); // Internal Rate of Return
  const [showChart, setShowChart] = useState(false);
  const calculatorRef = React.useRef(null);

  // Calculate NPV and IRR
  const calculateResults = useCallback(() => {
    if (!initialInvestment || cashFlows.length === 0) {
      setNpv(null);
      setIrr(null);
      return;
    }

    const rate = discountRate / 100;
    let totalPV = 0;

    // NPV Calculation
    cashFlows.forEach((cashFlow, index) => {
      totalPV += cashFlow / Math.pow(1 + rate, index + 1);
    });
    const npvResult = totalPV - initialInvestment;
    setNpv(npvResult);

    // IRR Calculation (approximation using Newton-Raphson method)
    const calculateIRR = () => {
      let irrGuess = 0.1; // Initial guess
      const maxIterations = 100;
      const tolerance = 0.0001;

      for (let i = 0; i < maxIterations; i++) {
        let npvAtGuess = -initialInvestment;
        cashFlows.forEach((cf, idx) => {
          npvAtGuess += cf / Math.pow(1 + irrGuess, idx + 1);
        });

        let derivative = 0;
        cashFlows.forEach((cf, idx) => {
          derivative -= (idx + 1) * cf / Math.pow(1 + irrGuess, idx + 2);
        });

        const newGuess = irrGuess - npvAtGuess / derivative;
        if (Math.abs(newGuess - irrGuess) < tolerance) {
          return newGuess * 100; // Convert to percentage
        }
        irrGuess = newGuess;
      }
      return null; // Return null if IRR doesn't converge
    };

    const irrResult = calculateIRR();
    setIrr(irrResult);
  }, [initialInvestment, discountRate, cashFlows]);

  // Auto-calculate on mount with default values
  useEffect(() => {
    calculateResults();
  }, [calculateResults]);

  // Handle cash flow changes
  const handleCashFlowChange = (index, value) => {
    const newCashFlows = [...cashFlows];
    newCashFlows[index] = Number(value) || 0;
    setCashFlows(newCashFlows);
  };

  const addYear = () => setCashFlows([...cashFlows, 0]);
  const removeYear = () => {
    if (cashFlows.length > 1) setCashFlows(cashFlows.slice(0, -1));
  };

  // Reset to default values
  const reset = () => {
    setInitialInvestment(10000);
    setDiscountRate(5);
    setCashFlows([5000, 5000, 5000]);
    setShowChart(false);
    calculateResults();
  };

  // Download as PNG
  const downloadResult = () => {
    if (calculatorRef.current) {
      html2canvas(calculatorRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `npv-calculation-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  // Simple chart representation
  const renderChart = () => {
    const maxValue = Math.max(initialInvestment, ...cashFlows);
    const scale = 100 / maxValue;

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Cash Flow Timeline</h3>
        <div className="flex items-end gap-2 h-32">
          <div className="flex-1 text-center">
            <div
              className="bg-red-400 w-full"
              style={{ height: `${initialInvestment * scale}%` }}
            />
            <span className="text-xs text-gray-600">Initial</span>
          </div>
          {cashFlows.map((flow, index) => (
            <div key={index} className="flex-1 text-center">
              <div
                className="bg-green-400 w-full"
                style={{ height: `${flow * scale}%` }}
              />
              <span className="text-xs text-gray-600">Year {index + 1}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div
        ref={calculatorRef}
        className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Net Present Value Calculator
        </h1>

        <div className="space-y-6">
          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Investment ($)
              </label>
              <input
                type="number"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(Number(e.target.value) || 0)}
                onBlur={calculateResults}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Rate (%)
              </label>
              <input
                type="number"
                value={discountRate}
                onChange={(e) => setDiscountRate(Number(e.target.value) || 0)}
                onBlur={calculateResults}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.1"
              />
            </div>
          </div>

          {/* Cash Flows */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cash Flows by Year ($)
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {cashFlows.map((flow, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 min-w-[60px]">
                    Year {index + 1}:
                  </span>
                  <input
                    type="number"
                    value={flow}
                    onChange={(e) => handleCashFlowChange(index, e.target.value)}
                    onBlur={calculateResults}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={addYear}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <FaPlus className="mr-2" /> Add Year
              </button>
              <button
                onClick={removeYear}
                disabled={cashFlows.length <= 1}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <FaMinus className="mr-2" /> Remove Year
              </button>
            </div>
          </div>

          {/* Results */}
          {(npv !== null || irr !== null) && (
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <h2 className="text-lg font-semibold mb-2">Results</h2>
              {npv !== null && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">Net Present Value (NPV)</p>
                  <p className={`text-xl ${npv >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ${npv.toFixed(2).toLocaleString()}
                  </p>
                </div>
              )}
              {irr !== null && (
                <div>
                  <p className="text-sm text-gray-600">Internal Rate of Return (IRR)</p>
                  <p className="text-xl text-blue-600">{irr.toFixed(2)}%</p>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {npv >= 0
                  ? "Positive NPV: Investment is potentially profitable"
                  : "Negative NPV: Investment may not be profitable"}
              </p>
            </div>
          )}

          {/* Chart Toggle and Display */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowChart(!showChart)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {showChart ? "Hide Chart" : "Show Chart"}
            </button>
          </div>
          {showChart && renderChart()}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={downloadResult}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Result
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate NPV and IRR</li>
            <li>Dynamic cash flow years (add/remove)</li>
            <li>Visual cash flow timeline chart</li>
            <li>Download results as PNG</li>
            <li>Real-time calculations</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Note: NPV discounts future cash flows to present value. IRR is the rate where NPV = 0.
        </p>
      </div>
    </div>
  );
};

export default NetPresentValueCalculator;