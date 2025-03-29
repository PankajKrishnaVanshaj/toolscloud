"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaDownload, FaSync } from "react-icons/fa";

const DepreciationCalculator = () => {
  const [cost, setCost] = useState(10000);
  const [salvageValue, setSalvageValue] = useState(1000);
  const [usefulLife, setUsefulLife] = useState(5);
  const [method, setMethod] = useState("straight-line");
  const [results, setResults] = useState(null);
  const [showChart, setShowChart] = useState(false);

  const calculateDepreciation = useCallback(() => {
    if (cost <= 0 || salvageValue < 0 || usefulLife <= 0 || salvageValue >= cost) {
      setResults(null);
      return;
    }

    const schedules = {};

    // Straight-Line Method
    const straightLineAnnual = (cost - salvageValue) / usefulLife;
    schedules["straight-line"] = Array.from({ length: usefulLife }, (_, year) => ({
      year: year + 1,
      beginningValue: cost - straightLineAnnual * year,
      depreciation: straightLineAnnual,
      endingValue: Math.max(cost - straightLineAnnual * (year + 1), salvageValue),
    }));

    // Double Declining Balance Method
    const ddbRate = (2 / usefulLife) * 100;
    let ddbBookValue = cost;
    schedules["double-declining"] = [];
    for (let year = 1; year <= usefulLife; year++) {
      const depreciation =
        year === 1
          ? ddbBookValue * (ddbRate / 100)
          : Math.min(ddbBookValue * (ddbRate / 100), ddbBookValue - salvageValue);
      const endingValue = Math.max(ddbBookValue - depreciation, salvageValue);
      schedules["double-declining"].push({
        year,
        beginningValue: ddbBookValue,
        depreciation,
        endingValue,
      });
      ddbBookValue = endingValue;
      if (ddbBookValue <= salvageValue) break;
    }

    // Sum-of-the-Years'-Digits Method
    const sumOfYears = (usefulLife * (usefulLife + 1)) / 2;
    schedules["sum-of-years"] = [];
    let sydBookValue = cost;
    for (let year = 1; year <= usefulLife; year++) {
      const remainingYears = usefulLife - (year - 1);
      const depreciation = ((cost - salvageValue) * remainingYears) / sumOfYears;
      const endingValue = Math.max(sydBookValue - depreciation, salvageValue);
      schedules["sum-of-years"].push({
        year,
        beginningValue: sydBookValue,
        depreciation,
        endingValue,
      });
      sydBookValue = endingValue;
    }

    setResults({
      "straight-line": { annual: straightLineAnnual, schedule: schedules["straight-line"] },
      "double-declining": { rate: ddbRate, schedule: schedules["double-declining"] },
      "sum-of-years": { schedule: schedules["sum-of-years"] },
    });
  }, [cost, salvageValue, usefulLife]);

  useEffect(() => {
    calculateDepreciation();
  }, [cost, salvageValue, usefulLife, calculateDepreciation]);

  const reset = () => {
    setCost(10000);
    setSalvageValue(1000);
    setUsefulLife(5);
    setMethod("straight-line");
    setShowChart(false);
  };

  const downloadCSV = () => {
    if (!results || !results[method]) return;
    const schedule = results[method].schedule;
    const csvContent = [
      "Year,Beginning Value,Depreciation,Ending Value",
      ...schedule.map((row) =>
        `${row.year},${row.beginningValue.toFixed(2)},${row.depreciation.toFixed(2)},${row.endingValue.toFixed(2)}`
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${method}-depreciation-${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Depreciation Calculator
        </h1>

        {/* Input Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial Cost ($)
            </label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salvage Value ($)
            </label>
            <input
              type="number"
              value={salvageValue}
              onChange={(e) => setSalvageValue(Number(e.target.value))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Useful Life (years)
            </label>
            <input
              type="number"
              value={usefulLife}
              onChange={(e) => setUsefulLife(Number(e.target.value))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Depreciation Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="straight-line">Straight-Line</option>
              <option value="double-declining">Double Declining Balance</option>
              <option value="sum-of-years">Sum-of-the-Years'-Digits</option>
            </select>
          </div>
        </div>

        {/* Results Section */}
        {results && results[method] ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {method === "straight-line"
                  ? "Straight-Line Method"
                  : method === "double-declining"
                  ? "Double Declining Balance Method"
                  : "Sum-of-the-Years'-Digits Method"}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowChart(!showChart)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {showChart ? "Hide Chart" : "Show Chart"}
                </button>
                <button
                  onClick={downloadCSV}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <FaDownload className="mr-2" /> Download CSV
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                >
                  <FaSync className="mr-2" /> Reset
                </button>
              </div>
            </div>

            {/* Method-Specific Info */}
            {method === "straight-line" && (
              <p className="mb-2">
                Annual Depreciation: ${results["straight-line"].annual.toFixed(2)}
              </p>
            )}
            {method === "double-declining" && (
              <p className="mb-2">
                Depreciation Rate: ${results["double-declining"].rate.toFixed(2)}%
              </p>
            )}

            {/* Depreciation Schedule */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse bg-white rounded-lg shadow-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 border text-left">Year</th>
                    <th className="p-3 border text-left">Beginning Value</th>
                    <th className="p-3 border text-left">Depreciation</th>
                    <th className="p-3 border text-left">Ending Value</th>
                  </tr>
                </thead>
                <tbody>
                  {results[method].schedule.map((row) => (
                    <tr key={row.year} className="hover:bg-gray-50">
                      <td className="p-3 border">{row.year}</td>
                      <td className="p-3 border">${row.beginningValue.toFixed(2)}</td>
                      <td className="p-3 border">${row.depreciation.toFixed(2)}</td>
                      <td className="p-3 border">${row.endingValue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Simple Chart */}
            {showChart && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-md font-semibold mb-2">Depreciation Trend</h3>
                <div className="flex items-end gap-2 h-64">
                  {results[method].schedule.map((row) => (
                    <div
                      key={row.year}
                      className="flex-1 bg-blue-500 rounded-t"
                      style={{
                        height: `${(row.endingValue / cost) * 100}%`,
                      }}
                      title={`Year ${row.year}: $${row.endingValue.toFixed(2)}`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  {results[method].schedule.map((row) => (
                    <span key={row.year}>Year {row.year}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-red-600">
            Please enter valid values (Cost &gt; Salvage Value ≥ 0, Useful Life &gt; 0)
          </p>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Methods: Straight-Line, Double Declining Balance, Sum-of-the-Years'-Digits</li>
            <li>Real-time calculation updates</li>
            <li>Depreciation schedule with downloadable CSV</li>
            <li>Visual chart toggle</li>
            <li>Reset functionality</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: This calculator provides estimates. Actual depreciation may vary based on tax laws
          and accounting standards.
        </p>
      </div>
    </div>
  );
};

export default DepreciationCalculator;