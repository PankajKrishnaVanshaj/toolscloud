"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaDownload, FaChartBar } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading results

const ProfitMarginCalculator = () => {
  const [inputs, setInputs] = useState({
    revenue: "",
    costOfGoods: "",
    operatingExpenses: "",
    taxRate: "",
    otherIncome: "",
  });
  const [results, setResults] = useState({
    grossProfit: 0,
    grossMargin: 0,
    netProfit: 0,
    netMargin: 0,
    profitAfterTax: 0,
    profitAfterTaxMargin: 0,
  });
  const [currency, setCurrency] = useState("$");
  const [showChart, setShowChart] = useState(false);

  // Handle input changes
  const handleInputChange = (field) => (e) => {
    setInputs((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // Calculate margins
  const calculateMargins = useCallback(() => {
    const rev = parseFloat(inputs.revenue) || 0;
    const cog = parseFloat(inputs.costOfGoods) || 0;
    const exp = parseFloat(inputs.operatingExpenses) || 0;
    const tax = parseFloat(inputs.taxRate) || 0;
    const inc = parseFloat(inputs.otherIncome) || 0;

    const grossProfit = rev - cog;
    const grossMargin = rev > 0 ? (grossProfit / rev) * 100 : 0;
    const operatingProfit = grossProfit - exp + inc;
    const netProfit = operatingProfit;
    const netMargin = rev > 0 ? (netProfit / rev) * 100 : 0;
    const taxAmount = netProfit * (tax / 100);
    const profitAfterTax = netProfit - taxAmount;
    const profitAfterTaxMargin = rev > 0 ? (profitAfterTax / rev) * 100 : 0;

    setResults({
      grossProfit: grossProfit.toFixed(2),
      grossMargin: grossMargin.toFixed(2),
      netProfit: netProfit.toFixed(2),
      netMargin: netMargin.toFixed(2),
      profitAfterTax: profitAfterTax.toFixed(2),
      profitAfterTaxMargin: profitAfterTaxMargin.toFixed(2),
    });
  }, [inputs]);

  useEffect(() => {
    calculateMargins();
  }, [inputs, calculateMargins]);

  // Reset inputs
  const reset = () => {
    setInputs({
      revenue: "",
      costOfGoods: "",
      operatingExpenses: "",
      taxRate: "",
      otherIncome: "",
    });
    setShowChart(false);
  };

  // Download results as image
  const downloadResults = () => {
    const element = document.getElementById("results-section");
    if (element) {
      html2canvas(element).then((canvas) => {
        const link = document.createElement("a");
        link.download = `profit-margin-results-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Profit Margin Calculator
        </h1>

        {/* Input Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[
            { label: "Total Revenue", field: "revenue" },
            { label: "Cost of Goods Sold", field: "costOfGoods" },
            { label: "Operating Expenses (Optional)", field: "operatingExpenses" },
            { label: "Tax Rate (%) (Optional)", field: "taxRate", max: 100 },
            { label: "Other Income (Optional)", field: "otherIncome" },
          ].map(({ label, field, max }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {field !== "taxRate" && `(${currency})`}
              </label>
              <input
                type="number"
                value={inputs[field]}
                onChange={handleInputChange(field)}
                placeholder={`Enter ${label.toLowerCase()}`}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                min="0"
                max={max}
                step={field === "taxRate" ? "0.1" : "0.01"}
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="$">USD ($)</option>
              <option value="€">EUR (€)</option>
              <option value="£">GBP (£)</option>
              <option value="¥">JPY (¥)</option>
            </select>
          </div>
        </div>

        {/* Results Section */}
        <div id="results-section" className="bg-gray-50 p-4 rounded-md mb-6">
          <h2 className="text-lg font-semibold mb-2">Results</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Gross Profit", value: "grossProfit", color: "text-green-600" },
              { label: "Gross Margin", value: "grossMargin", unit: "%" },
              { label: "Net Profit", value: "netProfit", color: "text-green-600" },
              { label: "Net Margin", value: "netMargin", unit: "%" },
              {
                label: "Profit After Tax",
                value: "profitAfterTax",
                color: "text-green-600",
              },
              {
                label: "Profit After Tax Margin",
                value: "profitAfterTaxMargin",
                unit: "%",
              },
            ].map(({ label, value, color, unit }) => (
              <p key={value}>
                {label}:{" "}
                <span className={`font-bold ${color || ""}`}>
                  {unit ? "" : currency}
                  {Number(results[value]).toLocaleString()}
                  {unit || ""}
                </span>
              </p>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
          <button
            onClick={downloadResults}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download Results
          </button>
          <button
            onClick={() => setShowChart(!showChart)}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <FaChartBar className="mr-2" /> {showChart ? "Hide" : "Show"} Chart
          </button>
        </div>

        {/* Simple Chart (Bar Representation) */}
        {showChart && (
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-semibold mb-2">Profit Breakdown</h3>
            <div className="space-y-2">
              {[
                { label: "Revenue", value: parseFloat(inputs.revenue) || 0, color: "bg-blue-500" },
                {
                  label: "Gross Profit",
                  value: parseFloat(results.grossProfit),
                  color: "bg-green-500",
                },
                { label: "Net Profit", value: parseFloat(results.netProfit), color: "bg-teal-500" },
                {
                  label: "Profit After Tax",
                  value: parseFloat(results.profitAfterTax),
                  color: "bg-emerald-500",
                },
              ].map(({ label, value, color }) => {
                const maxWidth = Math.max(
                  parseFloat(inputs.revenue) || 0,
                  parseFloat(results.grossProfit),
                  parseFloat(results.netProfit),
                  parseFloat(results.profitAfterTax)
                );
                const width = maxWidth > 0 ? (value / maxWidth) * 100 : 0;
                return (
                  <div key={label} className="flex items-center gap-2">
                    <span className="w-32 text-sm text-gray-700">{label}</span>
                    <div className="flex-1 h-6 bg-gray-200 rounded">
                      <div
                        className={`${color} h-full rounded`}
                        style={{ width: `${width}%` }}
                      ></div>
                    </div>
                    <span className="w-24 text-sm text-gray-700">
                      {currency}
                      {Number(value).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="text-xs text-gray-500 bg-gray-50 p-4 rounded-md">
          <p>
            <strong>Formulas:</strong>
          </p>
          <ul className="list-disc list-inside">
            <li>Gross Profit = Revenue - COGS</li>
            <li>Gross Margin = (Gross Profit / Revenue) × 100</li>
            <li>Net Profit = Gross Profit - Operating Expenses + Other Income</li>
            <li>Net Margin = (Net Profit / Revenue) × 100</li>
            <li>Profit After Tax = Net Profit - (Net Profit × Tax Rate / 100)</li>
            <li>Profit After Tax Margin = (Profit After Tax / Revenue) × 100</li>
          </ul>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate Gross, Net, and After-Tax Profit Margins</li>
            <li>Support for Tax Rate and Other Income</li>
            <li>Currency selection</li>
            <li>Real-time calculations</li>
            <li>Download results as PNG</li>
            <li>Visual profit breakdown chart</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProfitMarginCalculator;