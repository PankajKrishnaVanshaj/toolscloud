// components/StockProfitCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const StockProfitCalculator = () => {
  const [buyPrice, setBuyPrice] = useState(0);
  const [sellPrice, setSellPrice] = useState(0);
  const [shares, setShares] = useState(0);
  const [buyFee, setBuyFee] = useState(0);
  const [sellFee, setSellFee] = useState(0);
  const [results, setResults] = useState(null);

  const calculateProfit = () => {
    const totalBuyCost = (buyPrice * shares) + Number(buyFee);
    const totalSellValue = (sellPrice * shares) - Number(sellFee);
    const profit = totalSellValue - totalBuyCost;
    const profitPercentage = totalBuyCost > 0 ? (profit / totalBuyCost) * 100 : 0;

    setResults({
      totalBuyCost: totalBuyCost.toFixed(2),
      totalSellValue: totalSellValue.toFixed(2),
      profit: profit.toFixed(2),
      profitPercentage: profitPercentage.toFixed(2),
    });
  };

  useEffect(() => {
    if (buyPrice > 0 && sellPrice > 0 && shares > 0) {
      calculateProfit();
    } else {
      setResults(null);
    }
  }, [buyPrice, sellPrice, shares, buyFee, sellFee]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Stock Profit Calculator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buy Price per Share ($)
          </label>
          <input
            type="number"
            value={buyPrice}
            onChange={(e) => setBuyPrice(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sell Price per Share ($)
          </label>
          <input
            type="number"
            value={sellPrice}
            onChange={(e) => setSellPrice(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Shares
          </label>
          <input
            type="number"
            value={shares}
            onChange={(e) => setShares(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
            min="0"
            step="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buy Commission/Fee ($)
          </label>
          <input
            type="number"
            value={buyFee}
            onChange={(e) => setBuyFee(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sell Commission/Fee ($)
          </label>
          <input
            type="number"
            value={sellFee}
            onChange={(e) => setSellFee(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {results && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Results</h2>
          <div className="space-y-2">
            <p>
              Total Buy Cost: 
              <span className="font-medium">
                ${Number(results.totalBuyCost).toLocaleString()}
              </span>
            </p>
            <p>
              Total Sell Value: 
              <span className="font-medium">
                ${Number(results.totalSellValue).toLocaleString()}
              </span>
            </p>
            <p>
              Profit/Loss: 
              <span className={`font-bold ${results.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {results.profit >= 0 ? '+' : ''}${Number(results.profit).toLocaleString()}
              </span>
            </p>
            <p>
              Profit Percentage: 
              <span className={`font-bold ${results.profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {results.profitPercentage >= 0 ? '+' : ''}{results.profitPercentage}%
              </span>
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Note: This calculator provides basic profit/loss estimates and does not account 
        for taxes, dividends, or other factors. Consult a financial advisor for detailed analysis.
      </p>
    </div>
  );
};

export default StockProfitCalculator;