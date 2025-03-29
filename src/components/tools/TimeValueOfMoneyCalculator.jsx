"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaChartLine } from "react-icons/fa";

const TimeValueOfMoneyCalculator = () => {
  const [presentValue, setPresentValue] = useState(1000);
  const [futureValue, setFutureValue] = useState("");
  const [interestRate, setInterestRate] = useState(5);
  const [periods, setPeriods] = useState(10);
  const [calculateType, setCalculateType] = useState("FV");
  const [compounding, setCompounding] = useState("annual");
  const [result, setResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const getCompoundingFactor = () => {
    switch (compounding) {
      case "daily": return 365;
      case "monthly": return 12;
      case "quarterly": return 4;
      case "semi-annual": return 2;
      case "annual": default: return 1;
    }
  };

  const calculateTVM = useCallback(() => {
    const rate = interestRate / 100;
    const nper = getCompoundingFactor();
    const totalPeriods = periods * nper;
    const effectiveRate = rate / nper;
    let calculatedResult;

    switch (calculateType) {
      case "FV":
        calculatedResult = presentValue * Math.pow(1 + effectiveRate, totalPeriods);
        setFutureValue(calculatedResult.toFixed(2));
        break;
      case "PV":
        calculatedResult = futureValue / Math.pow(1 + effectiveRate, totalPeriods);
        setPresentValue(calculatedResult.toFixed(2));
        break;
      case "Rate":
        calculatedResult =
          nper * (Math.pow(futureValue / presentValue, 1 / totalPeriods) - 1) * 100;
        setInterestRate(calculatedResult.toFixed(2));
        break;
      case "Periods":
        calculatedResult =
          Math.log(futureValue / presentValue) / (nper * Math.log(1 + effectiveRate));
        setPeriods(Math.round(calculatedResult));
        break;
      default:
        break;
    }

    // Always set result to the calculated value
    setResult(calculatedResult ? calculatedResult.toFixed(calculateType === "Periods" ? 0 : 2) : null);
  }, [presentValue, futureValue, interestRate, periods, calculateType, compounding]);

  useEffect(() => {
    // Adjusted validation based on calculateType
    const isValid =
      presentValue > 0 &&
      interestRate >= 0 &&
      periods > 0 &&
      (calculateType === "FV" || // FV doesn't need futureValue as input
        (calculateType === "PV" && futureValue > 0) ||
        (calculateType === "Rate" && futureValue > 0) ||
        (calculateType === "Periods" && futureValue > 0));

    if (isValid) {
      calculateTVM();
    } else {
      setResult(null);
    }
  }, [presentValue, futureValue, interestRate, periods, calculateType, compounding, calculateTVM]);

  const reset = () => {
    setPresentValue(1000);
    setFutureValue("");
    setInterestRate(5);
    setPeriods(10);
    setCalculateType("FV");
    setCompounding("annual");
    setResult(null);
    setShowDetails(false);
  };

  const getBreakdown = () => {
    const breakdown = [];
    const nper = getCompoundingFactor();
    const ratePerPeriod = interestRate / 100 / nper;
    let currentValue = Number(presentValue);

    for (let i = 1; i <= periods * nper; i++) {
      currentValue = currentValue * (1 + ratePerPeriod);
      if (i % nper === 0) {
        breakdown.push({
          year: i / nper,
          value: currentValue.toFixed(2),
        });
      }
    }
    return breakdown;
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Time Value of Money Calculator
        </h1>

        <div className="space-y-6">
          {/* Calculate Type and Compounding */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Calculate</label>
              <select
                value={calculateType}
                onChange={(e) => setCalculateType(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="FV">Future Value</option>
                <option value="PV">Present Value</option>
                <option value="Rate">Interest Rate</option>
                <option value="Periods">Number of Periods</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compounding Frequency
              </label>
              <select
                value={compounding}
                onChange={(e) => setCompounding(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="semi-annual">Semi-Annual</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                label: "Present Value ($)",
                value: presentValue,
                setter: setPresentValue,
                disabled: calculateType === "PV",
              },
              {
                label: "Future Value ($)",
                value: futureValue,
                setter: setFutureValue,
                disabled: calculateType === "FV",
              },
              {
                label: "Annual Interest Rate (%)",
                value: interestRate,
                setter: setInterestRate,
                disabled: calculateType === "Rate",
                step: "0.01",
              },
              {
                label: "Number of Periods (years)",
                value: periods,
                setter: setPeriods,
                disabled: calculateType === "Periods",
                min: 1,
              },
            ].map(({ label, value, setter, disabled, step = "0.01", min = 0 }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setter(Number(e.target.value))}
                  disabled={disabled}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  min={min}
                  step={step}
                />
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaChartLine className="mr-2" /> {showDetails ? "Hide" : "Show"} Breakdown
            </button>
          </div>

          {/* Result */}
          {result !== null && (
            <div className="bg-gray-50 p-4 rounded-md text-center">
              <h2 className="text-lg font-semibold mb-2">Result</h2>
              <p className="text-xl font-bold text-green-600">
                {calculateType === "FV" && `Future Value: $${Number(result).toLocaleString()}`}
                {calculateType === "PV" && `Present Value: $${Number(result).toLocaleString()}`}
                {calculateType === "Rate" && `Interest Rate: ${result}%`}
                {calculateType === "Periods" && `Periods: ${result} years`}
              </p>
            </div>
          )}

          {/* Detailed Breakdown */}
          {showDetails && result && calculateType === "FV" && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-700 mb-2">
                Compound Interest Breakdown
              </h3>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm text-blue-600">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="p-2 text-left">Year</th>
                      <th className="p-2 text-right">Value ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getBreakdown().map(({ year, value }) => (
                      <tr key={year} className="border-b">
                        <td className="p-2">{year}</td>
                        <td className="p-2 text-right">{Number(value).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate FV, PV, Interest Rate, or Periods</li>
            <li>Adjustable compounding frequency (daily to annual)</li>
            <li>Real-time calculations</li>
            <li>Detailed compound interest breakdown</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: Results assume compound interest with the selected frequency.
        </p>
      </div>
    </div>
  );
};

export default TimeValueOfMoneyCalculator;