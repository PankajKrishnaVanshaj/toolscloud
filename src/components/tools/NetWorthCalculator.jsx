"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaDownload, FaChartPie } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the result

const NetWorthCalculator = () => {
  const [assets, setAssets] = useState({
    cash: 0,
    investments: 0,
    property: 0,
    vehicles: 0,
    otherAssets: 0,
  });

  const [liabilities, setLiabilities] = useState({
    mortgage: 0,
    loans: 0,
    creditCard: 0,
    otherDebts: 0,
  });

  const [netWorth, setNetWorth] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [showBreakdown, setShowBreakdown] = useState(false);
  const resultRef = React.useRef(null);

  // Calculate net worth
  const calculateNetWorth = useCallback(() => {
    const totalAssets = Object.values(assets).reduce((sum, value) => sum + Number(value), 0);
    const totalLiabilities = Object.values(liabilities).reduce(
      (sum, value) => sum + Number(value),
      0
    );
    setNetWorth(totalAssets - totalLiabilities);
  }, [assets, liabilities]);

  useEffect(() => {
    calculateNetWorth();
  }, [assets, liabilities, calculateNetWorth]);

  // Handle input changes
  const handleAssetChange = (e) => {
    const { name, value } = e.target;
    setAssets((prev) => ({
      ...prev,
      [name]: value === "" ? 0 : Math.max(0, Number(value)),
    }));
  };

  const handleLiabilityChange = (e) => {
    const { name, value } = e.target;
    setLiabilities((prev) => ({
      ...prev,
      [name]: value === "" ? 0 : Math.max(0, Number(value)),
    }));
  };

  // Reset all values
  const reset = () => {
    setAssets({ cash: 0, investments: 0, property: 0, vehicles: 0, otherAssets: 0 });
    setLiabilities({ mortgage: 0, loans: 0, creditCard: 0, otherDebts: 0 });
    setCurrency("USD");
    setShowBreakdown(false);
  };

  // Download result as image
  const downloadResult = () => {
    if (resultRef.current) {
      html2canvas(resultRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `net-worth-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  // Currency formatting
  const formatCurrency = (value) => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    });
    return formatter.format(value);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Net Worth Calculator
        </h1>

        {/* Currency Selector */}
        <div className="mb-6 flex justify-center">
          <div className="w-40">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assets Section */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-green-600">Assets</h2>
            <div className="space-y-4">
              {Object.keys(assets).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  <input
                    type="number"
                    name={key}
                    value={assets[key]}
                    onChange={handleAssetChange}
                    min="0"
                    step="0.01"
                    className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Liabilities Section */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-red-600">Liabilities</h2>
            <div className="space-y-4">
              {Object.keys(liabilities).map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  <input
                    type="number"
                    name={key}
                    value={liabilities[key]}
                    onChange={handleLiabilityChange}
                    min="0"
                    step="0.01"
                    className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-red-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Result */}
        <div ref={resultRef} className="mt-6 bg-gray-50 p-4 rounded-lg text-center">
          <h2 className="text-lg font-semibold mb-2">Your Net Worth</h2>
          <p
            className={`text-2xl sm:text-3xl font-bold ${
              netWorth >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatCurrency(netWorth)}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Total Assets: {formatCurrency(Object.values(assets).reduce((sum, value) => sum + Number(value), 0))} | Total Liabilities:{" "}
            {formatCurrency(Object.values(liabilities).reduce((sum, value) => sum + Number(value), 0))}
          </p>

          {/* Breakdown Toggle */}
          <button
            onClick={() => setShowBreakdown((prev) => !prev)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto"
          >
            <FaChartPie className="mr-2" /> {showBreakdown ? "Hide" : "Show"} Breakdown
          </button>

          {showBreakdown && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <h3 className="font-semibold text-green-600">Assets Breakdown</h3>
                <ul className="mt-2 space-y-1">
                  {Object.entries(assets).map(([key, value]) => (
                    <li key={key}>
                      {key.replace(/([A-Z])/g, " $1").trim()}: {formatCurrency(value)}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-red-600">Liabilities Breakdown</h3>
                <ul className="mt-2 space-y-1">
                  {Object.entries(liabilities).map(([key, value]) => (
                    <li key={key}>
                      {key.replace(/([A-Z])/g, " $1").trim()}: {formatCurrency(value)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
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

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate net worth in real-time</li>
            <li>Support for multiple currencies (USD, EUR, GBP, JPY)</li>
            <li>Detailed assets and liabilities breakdown</li>
            <li>Download result as PNG</li>
            <li>Decimal input support for precise calculations</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: This is a basic calculator. For accurate financial planning, consult a professional.
        </p>
      </div>
    </div>
  );
};

export default NetWorthCalculator;