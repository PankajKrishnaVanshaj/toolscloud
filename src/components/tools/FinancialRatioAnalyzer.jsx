// components/FinancialRatioAnalyzer.js
'use client';

import React, { useState } from 'react';

const FinancialRatioAnalyzer = () => {
  const [financialData, setFinancialData] = useState({
    revenue: '',
    costOfGoodsSold: '',
    netIncome: '',
    totalAssets: '',
    currentAssets: '',
    currentLiabilities: '',
    inventory: '',
    accountsReceivable: ''
  });
  const [ratios, setRatios] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFinancialData(prev => ({
      ...prev,
      [name]: value ? Number(value) : ''
    }));
  };

  const calculateRatios = () => {
    const {
      revenue,
      costOfGoodsSold,
      netIncome,
      totalAssets,
      currentAssets,
      currentLiabilities,
      inventory,
      accountsReceivable
    } = financialData;

    if (!revenue || !netIncome || !totalAssets) {
      alert('Please fill in at least Revenue, Net Income, and Total Assets to calculate basic ratios.');
      return;
    }

    const ratios = {
      grossProfitMargin: revenue && costOfGoodsSold ? 
        ((revenue - costOfGoodsSold) / revenue * 100).toFixed(2) : null,
      netProfitMargin: (netIncome / revenue * 100).toFixed(2),
      returnOnAssets: (netIncome / totalAssets * 100).toFixed(2),
      currentRatio: currentAssets && currentLiabilities ? 
        (currentAssets / currentLiabilities).toFixed(2) : null,
      inventoryTurnover: revenue && inventory ? 
        (revenue / inventory).toFixed(2) : null,
      receivablesTurnover: revenue && accountsReceivable ? 
        (revenue / accountsReceivable).toFixed(2) : null
    };

    setRatios(ratios);
  };

  const resetForm = () => {
    setFinancialData({
      revenue: '',
      costOfGoodsSold: '',
      netIncome: '',
      totalAssets: '',
      currentAssets: '',
      currentLiabilities: '',
      inventory: '',
      accountsReceivable: ''
    });
    setRatios(null);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Financial Ratio Analyzer</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {Object.entries(financialData).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              {key.replace(/([A-Z])/g, ' $1')} ($)
            </label>
            <input
              type="number"
              name={key}
              value={value}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
              placeholder="Enter amount"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={calculateRatios}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Calculate Ratios
        </button>
        <button
          onClick={resetForm}
          className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Reset
        </button>
      </div>

      {ratios && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-3 text-center">Financial Ratios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ratios.grossProfitMargin && (
              <p>Gross Profit Margin: <span className="font-bold">{ratios.grossProfitMargin}%</span></p>
            )}
            <p>Net Profit Margin: <span className="font-bold">{ratios.netProfitMargin}%</span></p>
            <p>Return on Assets: <span className="font-bold">{ratios.returnOnAssets}%</span></p>
            {ratios.currentRatio && (
              <p>Current Ratio: <span className="font-bold">{ratios.currentRatio}x</span></p>
            )}
            {ratios.inventoryTurnover && (
              <p>Inventory Turnover: <span className="font-bold">{ratios.inventoryTurnover}x</span></p>
            )}
            {ratios.receivablesTurnover && (
              <p>Receivables Turnover: <span className="font-bold">{ratios.receivablesTurnover}x</span></p>
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: Enter values in dollars. Some ratios require specific inputs to be calculated.
      </p>
    </div>
  );
};

export default FinancialRatioAnalyzer;