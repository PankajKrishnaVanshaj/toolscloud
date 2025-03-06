// components/CryptoProfitCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const CryptoProfitCalculator = () => {
  const [initialInvestment, setInitialInvestment] = useState(1000);
  const [buyPrice, setBuyPrice] = useState(1);
  const [sellPrice, setSellPrice] = useState(1.5);
  const [quantity, setQuantity] = useState(0);
  const [results, setResults] = useState(null);

  const calculateProfit = () => {
    const qty = initialInvestment / buyPrice;
    const totalValue = qty * sellPrice;
    const profit = totalValue - initialInvestment;
    const profitPercentage = ((sellPrice - buyPrice) / buyPrice) * 100;

    setQuantity(qty);
    setResults({
      totalValue: totalValue.toFixed(2),
      profit: profit.toFixed(2),
      profitPercentage: profitPercentage.toFixed(2),
    });
  };

  useEffect(() => {
    if (initialInvestment > 0 && buyPrice > 0 && sellPrice > 0) {
      calculateProfit();
    }
  }, [initialInvestment, buyPrice, sellPrice]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Crypto Profit Calculator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Initial Investment ($)
          </label>
          <input
            type="number"
            value={initialInvestment}
            onChange={(e) => setInitialInvestment(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buy Price ($)
          </label>
          <input
            type="number"
            value={buyPrice}
            onChange={(e) => setBuyPrice(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sell Price ($)
          </label>
          <input
            type="number"
            value={sellPrice}
            onChange={(e) => setSellPrice(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity Purchased
          </label>
          <input
            type="number"
            value={quantity.toFixed(6)}
            readOnly
            className="w-full p-2 border rounded-md bg-gray-100"
          />
        </div>
      </div>

      {results && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2 text-center">Results</h2>
          <div className="space-y-2 text-center">
            <p>
              Total Value: 
              <span className="font-bold text-green-600">
                ${Number(results.totalValue).toLocaleString()}
              </span>
            </p>
            <p>
              Profit/Loss: 
              <span className={`font-bold ${results.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Number(results.profit).toLocaleString()} 
                ({results.profitPercentage}%)
              </span>
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: This is a simplified calculator and does not account for trading fees, 
        taxes, or market volatility. Use for estimation purposes only.
      </p>
    </div>
  );
};

export default CryptoProfitCalculator;