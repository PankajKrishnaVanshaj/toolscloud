// components/NetWorthCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

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

  const calculateNetWorth = () => {
    const totalAssets = Object.values(assets).reduce((sum, value) => sum + Number(value), 0);
    const totalLiabilities = Object.values(liabilities).reduce((sum, value) => sum + Number(value), 0);
    const result = totalAssets - totalLiabilities;
    setNetWorth(result);
  };

  useEffect(() => {
    calculateNetWorth();
  }, [assets, liabilities]);

  const handleAssetChange = (e) => {
    const { name, value } = e.target;
    setAssets(prev => ({
      ...prev,
      [name]: value === '' ? 0 : Number(value),
    }));
  };

  const handleLiabilityChange = (e) => {
    const { name, value } = e.target;
    setLiabilities(prev => ({
      ...prev,
      [name]: value === '' ? 0 : Number(value),
    }));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Net Worth Calculator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assets Section */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-green-600">Assets</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Cash & Savings ($)</label>
              <input
                type="number"
                name="cash"
                value={assets.cash}
                onChange={handleAssetChange}
                min="0"
                className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Investments ($)</label>
              <input
                type="number"
                name="investments"
                value={assets.investments}
                onChange={handleAssetChange}
                min="0"
                className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Property ($)</label>
              <input
                type="number"
                name="property"
                value={assets.property}
                onChange={handleAssetChange}
                min="0"
                className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Vehicles ($)</label>
              <input
                type="number"
                name="vehicles"
                value={assets.vehicles}
                onChange={handleAssetChange}
                min="0"
                className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Other Assets ($)</label>
              <input
                type="number"
                name="otherAssets"
                value={assets.otherAssets}
                onChange={handleAssetChange}
                min="0"
                className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Liabilities Section */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-red-600">Liabilities</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Mortgage ($)</label>
              <input
                type="number"
                name="mortgage"
                value={liabilities.mortgage}
                onChange={handleLiabilityChange}
                min="0"
                className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Loans ($)</label>
              <input
                type="number"
                name="loans"
                value={liabilities.loans}
                onChange={handleLiabilityChange}
                min="0"
                className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Credit Card Debt ($)</label>
              <input
                type="number"
                name="creditCard"
                value={liabilities.creditCard}
                onChange={handleLiabilityChange}
                min="0"
                className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Other Debts ($)</label>
              <input
                type="number"
                name="otherDebts"
                value={liabilities.otherDebts}
                onChange={handleLiabilityChange}
                min="0"
                className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="mt-6 bg-gray-50 p-4 rounded-md text-center">
        <h2 className="text-lg font-semibold mb-2">Your Net Worth</h2>
        <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          ${netWorth.toLocaleString()}
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Total Assets: ${Object.values(assets).reduce((sum, value) => sum + Number(value), 0).toLocaleString()} | 
          Total Liabilities: ${Object.values(liabilities).reduce((sum, value) => sum + Number(value), 0).toLocaleString()}
        </p>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: This is a basic calculator. For accurate financial planning, consult a professional.
      </p>
    </div>
  );
};

export default NetWorthCalculator;