"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaChartBar, FaDownload } from "react-icons/fa";

const ROICalculator = () => {
  const [investment, setInvestment] = useState(10000);
  const [revenue, setRevenue] = useState(15000);
  const [costs, setCosts] = useState(2000);
  const [timePeriod, setTimePeriod] = useState(12); // in months
  const [currency, setCurrency] = useState("USD");
  const [taxRate, setTaxRate] = useState(0); // in percentage
  const [results, setResults] = useState(null);
  const [showChart, setShowChart] = useState(false);

  const calculateROI = useCallback(() => {
    const netProfitBeforeTax = revenue - investment - costs;
    const taxAmount = (netProfitBeforeTax * taxRate) / 100;
    const netProfit = netProfitBeforeTax - taxAmount;
    const roi = investment > 0 ? (netProfit / investment) * 100 : 0;
    const annualizedROI =
      timePeriod > 0 && investment > 0
        ? (Math.pow(1 + roi / 100, 12 / timePeriod) - 1) * 100
        : roi;

    setResults({
      netProfitBeforeTax: netProfitBeforeTax.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      netProfit: netProfit.toFixed(2),
      roi: roi.toFixed(2),
      annualizedROI: annualizedROI.toFixed(2),
    });
  }, [investment, revenue, costs, timePeriod, taxRate]);

  useEffect(() => {
    if (investment > 0) {
      calculateROI();
    } else {
      setResults(null);
    }
  }, [investment, revenue, costs, timePeriod, taxRate, calculateROI]);

  // Reset all inputs
  const reset = () => {
    setInvestment(10000);
    setRevenue(15000);
    setCosts(2000);
    setTimePeriod(12);
    setTaxRate(0);
    setCurrency("USD");
    setShowChart(false);
  };

  // Download results as CSV
  const downloadCSV = () => {
    if (!results) return;
    const csvContent = [
      "Field,Value",
      `Initial Investment (${currency}),${investment}`,
      `Revenue (${currency}),${revenue}`,
      `Costs (${currency}),${costs}`,
      `Time Period (months),${timePeriod}`,
      `Tax Rate (%),${taxRate}`,
      `Net Profit Before Tax (${currency}),${results.netProfitBeforeTax}`,
      `Tax Amount (${currency}),${results.taxAmount}`,
      `Net Profit (${currency}),${results.netProfit}`,
      `ROI (%),${results.roi}`,
      `Annualized ROI (%),${results.annualizedROI}`,
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `roi-results-${Date.now()}.csv`;
    link.click();
  };

  // Simple chart rendering (bar representation)
  const renderChart = () => {
    if (!results) return null;
    const maxValue = Math.max(
      investment,
      revenue,
      costs,
      Number(results.netProfitBeforeTax),
      Number(results.netProfit)
    );
    const barStyle = (value) => ({
      width: `${(value / maxValue) * 100}%`,
      height: "20px",
      marginBottom: "8px",
    });

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Visual Breakdown</h3>
        <div className="space-y-2 text-sm">
          {[
            { label: "Investment", value: investment, color: "bg-blue-500" },
            { label: "Revenue", value: revenue, color: "bg-green-500" },
            { label: "Costs", value: costs, color: "bg-red-500" },
            { label: "Net Profit Before Tax", value: results.netProfitBeforeTax, color: "bg-yellow-500" },
            { label: "Net Profit", value: results.netProfit, color: "bg-purple-500" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-32 text-gray-700">{label}:</span>
              <div className={`${color} rounded`} style={barStyle(value)}></div>
              <span className="text-gray-600">
                {currency} {Number(value).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          ROI Calculator
        </h1>

        {/* Input Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial Investment ({currency})
            </label>
            <input
              type="number"
              value={investment}
              onChange={(e) => setInvestment(Math.max(0, Number(e.target.value)))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Revenue Generated ({currency})
            </label>
            <input
              type="number"
              value={revenue}
              onChange={(e) => setRevenue(Math.max(0, Number(e.target.value)))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Costs ({currency})
            </label>
            <input
              type="number"
              value={costs}
              onChange={(e) => setCosts(Math.max(0, Number(e.target.value)))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Period (months)
            </label>
            <input
              type="number"
              value={timePeriod}
              onChange={(e) => setTimePeriod(Math.max(0, Number(e.target.value)))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax Rate (%)
            </label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(Math.max(0, Math.min(100, Number(e.target.value))))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
              step="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={() => setShowChart(!showChart)}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FaChartBar className="mr-2" /> {showChart ? "Hide" : "Show"} Chart
          </button>
          <button
            onClick={downloadCSV}
            disabled={!results}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download CSV
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Results */}
        {results && investment > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-center">Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <p>
                <span className="font-medium">Net Profit Before Tax:</span>{" "}
                <span
                  className={results.netProfitBeforeTax >= 0 ? "text-green-600" : "text-red-600"}
                >
                  {currency} {Number(results.netProfitBeforeTax).toLocaleString()}
                </span>
              </p>
              <p>
                <span className="font-medium">Tax Amount:</span>{" "}
                <span className="text-gray-600">
                  {currency} {Number(results.taxAmount).toLocaleString()}
                </span>
              </p>
              <p>
                <span className="font-medium">Net Profit:</span>{" "}
                <span className={results.netProfit >= 0 ? "text-green-600" : "text-red-600"}>
                  {currency} {Number(results.netProfit).toLocaleString()}
                </span>
              </p>
              <p>
                <span className="font-medium">ROI:</span>{" "}
                <span className={results.roi >= 0 ? "text-green-600" : "text-red-600"}>
                  {results.roi}%
                </span>
              </p>
              {timePeriod > 0 && (
                <p>
                  <span className="font-medium">Annualized ROI:</span>{" "}
                  <span className={results.annualizedROI >= 0 ? "text-green-600" : "text-red-600"}>
                    {results.annualizedROI}%
                  </span>
                </p>
              )}
            </div>
          </div>
        )}

        {investment <= 0 && (
          <p className="text-center text-red-600">Please enter a valid investment amount</p>
        )}

        {/* Chart */}
        {showChart && renderChart()}

        {/* Notes */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate ROI and Annualized ROI</li>
            <li>Include tax rate in calculations</li>
            <li>Multiple currency support</li>
            <li>Visual chart breakdown</li>
            <li>Download results as CSV</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: ROI = (Net Profit / Investment) × 100. Annualized ROI adjusts for time period.
        </p>
      </div>
    </div>
  );
};

export default ROICalculator;