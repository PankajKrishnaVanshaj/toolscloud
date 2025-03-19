"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCalculator, FaSync, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading results

const BusinessValuationCalculator = () => {
  const [inputs, setInputs] = useState({
    revenue: 0,
    revenueMultiple: 2,
    ebitda: 0,
    ebitdaMultiple: 5,
    netProfit: 0,
    netProfitMultiple: 4,
    industry: "general",
  });
  const [results, setResults] = useState(null);
  const [currency, setCurrency] = useState("USD");
  const calculatorRef = React.useRef(null);

  const industryMultiples = {
    general: { revenue: 2, ebitda: 5, netProfit: 4 },
    tech: { revenue: 3, ebitda: 8, netProfit: 6 },
    manufacturing: { revenue: 1.5, ebitda: 4, netProfit: 3 },
    retail: { revenue: 1, ebitda: 3, netProfit: 2.5 },
    healthcare: { revenue: 2.5, ebitda: 6, netProfit: 5 },
  };

  const calculateValuation = useCallback(() => {
    const { revenue, revenueMultiple, ebitda, ebitdaMultiple, netProfit, netProfitMultiple } =
      inputs;
    const revenueValue = revenue * revenueMultiple;
    const ebitdaValue = ebitda * ebitdaMultiple;
    const netProfitValue = netProfit * netProfitMultiple;
    const averageValue = (revenueValue + ebitdaValue + netProfitValue) / 3;

    setResults({
      revenueBased: revenueValue,
      ebitdaBased: ebitdaValue,
      netProfitBased: netProfitValue,
      average: averageValue,
    });
  }, [inputs]);

  useEffect(() => {
    if (inputs.revenue > 0 || inputs.ebitda > 0 || inputs.netProfit > 0) {
      calculateValuation();
    } else {
      setResults(null);
    }
  }, [inputs, calculateValuation]);

  const handleInputChange = (field) => (e) => {
    setInputs((prev) => ({ ...prev, [field]: Number(e.target.value) }));
  };

  const handleIndustryChange = (e) => {
    const industry = e.target.value;
    const multiples = industryMultiples[industry];
    setInputs((prev) => ({
      ...prev,
      industry,
      revenueMultiple: multiples.revenue,
      ebitdaMultiple: multiples.ebitda,
      netProfitMultiple: multiples.netProfit,
    }));
  };

  const reset = () => {
    setInputs({
      revenue: 0,
      revenueMultiple: 2,
      ebitda: 0,
      ebitdaMultiple: 5,
      netProfit: 0,
      netProfitMultiple: 4,
      industry: "general",
    });
    setCurrency("USD");
    setResults(null);
  };

  const downloadResults = () => {
    if (calculatorRef.current && results) {
      html2canvas(calculatorRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `valuation-report-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(value);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div
        ref={calculatorRef}
        className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Business Valuation Calculator
        </h1>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {[
            { label: "Annual Revenue", key: "revenue", min: 0 },
            { label: "Revenue Multiple", key: "revenueMultiple", min: 0.1, max: 10, step: 0.1 },
            { label: "Annual EBITDA", key: "ebitda", min: 0 },
            { label: "EBITDA Multiple", key: "ebitdaMultiple", min: 1, max: 20, step: 0.1 },
            { label: "Annual Net Profit", key: "netProfit", min: 0 },
            {
              label: "Net Profit Multiple",
              key: "netProfitMultiple",
              min: 1,
              max: 15,
              step: 0.1,
            },
          ].map(({ label, key, min, max, step = 1 }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {key.includes("revenue") || key.includes("ebitda") || key.includes("profit") && !key.includes("Multiple") ? `(${currency})` : ""}
              </label>
              <input
                type="number"
                value={inputs[key]}
                onChange={handleInputChange(key)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                min={min}
                max={max}
                step={step}
                placeholder={`e.g., ${key.includes("Multiple") ? "2" : "500000"}`}
              />
            </div>
          ))}
        </div>

        {/* Additional Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
            <select
              value={inputs.industry}
              onChange={handleIndustryChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="general">General</option>
              <option value="tech">Technology</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="retail">Retail</option>
              <option value="healthcare">Healthcare</option>
            </select>
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

        {/* Results */}
        {results && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-3 text-center">Valuation Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <p>
                Revenue-Based:{" "}
                <span className="font-bold text-blue-600">
                  {formatCurrency(results.revenueBased)}
                </span>
              </p>
              <p>
                EBITDA-Based:{" "}
                <span className="font-bold text-blue-600">
                  {formatCurrency(results.ebitdaBased)}
                </span>
              </p>
              <p>
                Net Profit-Based:{" "}
                <span className="font-bold text-blue-600">
                  {formatCurrency(results.netProfitBased)}
                </span>
              </p>
              <p className="sm:col-span-3 text-center">
                Average Valuation:{" "}
                <span className="font-bold text-green-600">
                  {formatCurrency(results.average)}
                </span>
              </p>
            </div>
          </div>
        )}

        {!results && (
          <p className="text-center text-gray-500 mb-6">
            Enter revenue, EBITDA, or net profit to see valuation estimates.
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={calculateValuation}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Calculate
          </button>
          <button
            onClick={downloadResults}
            disabled={!results}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download Results
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Features */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Valuation based on Revenue, EBITDA, and Net Profit</li>
            <li>Industry-specific multiples</li>
            <li>Multiple currency support</li>
            <li>Downloadable results as PNG</li>
            <li>Real-time calculations</li>
          </ul>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: This is a simplified tool. Actual business valuation involves detailed analysis
          and should be performed by a professional.
        </p>
      </div>
    </div>
  );
};

export default BusinessValuationCalculator;