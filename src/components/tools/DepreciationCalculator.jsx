// components/DepreciationCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const DepreciationCalculator = () => {
  const [cost, setCost] = useState(10000);
  const [salvageValue, setSalvageValue] = useState(1000);
  const [usefulLife, setUsefulLife] = useState(5);
  const [results, setResults] = useState(null);

  const calculateDepreciation = () => {
    if (cost <= 0 || salvageValue < 0 || usefulLife <= 0 || salvageValue >= cost) {
      setResults(null);
      return;
    }

    // Straight-Line Method
    const straightLineAnnual = (cost - salvageValue) / usefulLife;
    const straightLineSchedule = Array.from({ length: usefulLife }, (_, year) => ({
      year: year + 1,
      beginningValue: cost - (straightLineAnnual * year),
      depreciation: straightLineAnnual,
      endingValue: Math.max(cost - (straightLineAnnual * (year + 1)), salvageValue),
    }));

    // Double Declining Balance Method
    const ddbRate = (2 / usefulLife) * 100;
    const ddbSchedule = [];
    let bookValue = cost;
    for (let year = 1; year <= usefulLife; year++) {
      const depreciation = year === 1 
        ? (bookValue * (ddbRate / 100))
        : Math.min(bookValue * (ddbRate / 100), bookValue - salvageValue);
      const endingValue = Math.max(bookValue - depreciation, salvageValue);
      ddbSchedule.push({
        year,
        beginningValue: bookValue,
        depreciation,
        endingValue,
      });
      bookValue = endingValue;
      if (bookValue <= salvageValue) break;
    }

    setResults({
      straightLine: {
        annual: straightLineAnnual,
        schedule: straightLineSchedule,
      },
      doubleDeclining: {
        rate: ddbRate,
        schedule: ddbSchedule,
      },
    });
  };

  useEffect(() => {
    calculateDepreciation();
  }, [cost, salvageValue, usefulLife]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Depreciation Calculator</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
      </div>

      {results ? (
        <div className="space-y-6">
          {/* Straight-Line Method */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Straight-Line Method</h2>
            <p className="mb-2">Annual Depreciation: ${results.straightLine.annual.toFixed(2)}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Year</th>
                    <th className="p-2 border">Beginning Value</th>
                    <th className="p-2 border">Depreciation</th>
                    <th className="p-2 border">Ending Value</th>
                  </tr>
                </thead>
                <tbody>
                  {results.straightLine.schedule.map((row) => (
                    <tr key={row.year}>
                      <td className="p-2 border text-center">{row.year}</td>
                      <td className="p-2 border">${row.beginningValue.toFixed(2)}</td>
                      <td className="p-2 border">${row.depreciation.toFixed(2)}</td>
                      <td className="p-2 border">${row.endingValue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Double Declining Balance Method */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Double Declining Balance Method</h2>
            <p className="mb-2">Depreciation Rate: {results.doubleDeclining.rate.toFixed(2)}%</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Year</th>
                    <th className="p-2 border">Beginning Value</th>
                    <th className="p-2 border">Depreciation</th>
                    <th className="p-2 border">Ending Value</th>
                  </tr>
                </thead>
                <tbody>
                  {results.doubleDeclining.schedule.map((row) => (
                    <tr key={row.year}>
                      <td className="p-2 border text-center">{row.year}</td>
                      <td className="p-2 border">${row.beginningValue.toFixed(2)}</td>
                      <td className="p-2 border">${row.depreciation.toFixed(2)}</td>
                      <td className="p-2 border">${row.endingValue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-red-600">
          Please enter valid values ({`Cost > Salvage Value ≥ 0, Useful Life > 0`})
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Note: This calculator provides estimates using Straight-Line and Double Declining Balance methods.
        Actual depreciation may vary based on tax laws and accounting standards.
      </p>
    </div>
  );
};

export default DepreciationCalculator;