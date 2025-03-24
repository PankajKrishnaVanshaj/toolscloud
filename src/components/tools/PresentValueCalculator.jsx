"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const PresentValueCalculator = () => {
  const [futureValue, setFutureValue] = useState(10000);
  const [discountRate, setDiscountRate] = useState(5);
  const [years, setYears] = useState(10);
  const [compounding, setCompounding] = useState("annual"); // Annual, Semi-annual, Quarterly, Monthly
  const [presentValue, setPresentValue] = useState(null);
  const [showChart, setShowChart] = useState(false);

  // Calculate Present Value with compounding
  const calculatePresentValue = useCallback(() => {
    const rate = discountRate / 100;
    let periodsPerYear = 1;
    switch (compounding) {
      case "semi-annual":
        periodsPerYear = 2;
        break;
      case "quarterly":
        periodsPerYear = 4;
        break;
      case "monthly":
        periodsPerYear = 12;
        break;
      default:
        periodsPerYear = 1;
    }
    const totalPeriods = years * periodsPerYear;
    const effectiveRate = rate / periodsPerYear;
    const pv = futureValue / Math.pow(1 + effectiveRate, totalPeriods);
    setPresentValue(pv.toFixed(2));
  }, [futureValue, discountRate, years, compounding]);

  useEffect(() => {
    calculatePresentValue();
  }, [futureValue, discountRate, years, compounding, calculatePresentValue]);

  // Reset inputs
  const reset = () => {
    setFutureValue(10000);
    setDiscountRate(5);
    setYears(10);
    setCompounding("annual");
    setShowChart(false);
  };

  // Download result as text
  const downloadResult = () => {
    const resultText = `
Present Value Calculation Result
-------------------------------
Future Value: $${Number(futureValue).toLocaleString()}
Discount Rate: ${discountRate}%
Years: ${years}
Compounding: ${compounding}
Present Value: $${Number(presentValue).toLocaleString()}
-------------------------------
Generated on: ${new Date().toLocaleString()}
    `;
    const blob = new Blob([resultText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `present-value-result-${Date.now()}.txt`;
    link.click();
  };

  // Generate simple discount timeline for chart
  const generateChartData = () => {
    const data = [];
    const rate = discountRate / 100;
    const periodsPerYear = {
      annual: 1,
      "semi-annual": 2,
      quarterly: 4,
      monthly: 12,
    }[compounding];
    const totalPeriods = years * periodsPerYear;
    const effectiveRate = rate / periodsPerYear;

    for (let i = 0; i <= totalPeriods; i++) {
      const value = futureValue / Math.pow(1 + effectiveRate, i);
      data.push({ period: i / periodsPerYear, value: value.toFixed(2) });
    }
    return data;
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Present Value Calculator
        </h1>

        {/* Input Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Future Value ($)
            </label>
            <input
              type="number"
              value={futureValue}
              onChange={(e) => setFutureValue(Math.max(0, Number(e.target.value)))}
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
              onChange={(e) =>
                setDiscountRate(Math.max(0, Math.min(100, Number(e.target.value))))
              }
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Years
            </label>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(Math.max(0, Number(e.target.value)))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Compounding
            </label>
            <select
              value={compounding}
              onChange={(e) => setCompounding(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="annual">Annual</option>
              <option value="semi-annual">Semi-annual</option>
              <option value="quarterly">Quarterly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {/* Result Section */}
        {presentValue && (
          <div className="bg-gray-50 p-4 rounded-lg text-center mb-6">
            <h2 className="text-lg font-semibold mb-2">Present Value</h2>
            <p className="text-2xl font-bold text-green-600">
              ${Number(presentValue).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              The current worth of ${Number(futureValue).toLocaleString()} in {years} years
              at a {discountRate}% discount rate with {compounding} compounding
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={() => setShowChart(!showChart)}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {showChart ? "Hide" : "Show"} Chart
          </button>
          <button
            onClick={downloadResult}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download Result
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Chart Section */}
        {showChart && presentValue && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 overflow-x-auto">
            <h3 className="text-lg font-semibold mb-2">Discount Timeline</h3>
            <div className="flex gap-2">
              {generateChartData().map((data, index) => (
                <div
                  key={index}
                  className="flex-1 text-center"
                  style={{ minWidth: "60px" }}
                >
                  <div
                    className="bg-blue-200 rounded"
                    style={{
                      height: `${(data.value / futureValue) * 100}px`,
                      minHeight: "20px",
                    }}
                  ></div>
                  <p className="text-xs text-gray-600 mt-1">
                    {data.period.toFixed(1)} yr
                  </p>
                  <p className="text-xs text-gray-800 font-medium">
                    ${Number(data.value).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes and Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Adjustable future value, discount rate, and years</li>
            <li>Multiple compounding options</li>
            <li>Real-time calculation</li>
            <li>Visual discount timeline chart</li>
            <li>Downloadable result</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Note: Uses the formula PV = FV / (1 + r/n)^(n*t), where n is compounding periods
          per year. Does not account for inflation or taxes.
        </p>
      </div>
    </div>
  );
};

export default PresentValueCalculator;