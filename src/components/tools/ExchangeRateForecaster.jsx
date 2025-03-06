// components/ExchangeRateForecaster.js
'use client';

import React, { useState } from 'react';

const ExchangeRateForecaster = () => {
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('EUR');
  const [forecastDays, setForecastDays] = useState(7);
  const [forecast, setForecast] = useState(null);

  // Mock historical data (in reality, this would come from an API)
  const mockRates = {
    'USD-EUR': { current: 0.85, trend: 0.001 }, // Current rate and daily change
    'USD-GBP': { current: 0.73, trend: 0.0008 },
    'USD-JPY': { current: 110.5, trend: -0.02 },
    'EUR-USD': { current: 1.18, trend: -0.0012 },
    'EUR-GBP': { current: 0.86, trend: 0.0005 },
    'EUR-JPY': { current: 130.2, trend: -0.015 },
  };

  const currencies = ['USD', 'EUR', 'GBP', 'JPY'];

  const generateForecast = () => {
    const pair = `${baseCurrency}-${targetCurrency}`;
    const data = mockRates[pair] || { current: 1, trend: 0 }; // Default to 1:1 if pair not found
    
    const forecastData = [];
    let currentRate = data.current;
    
    for (let i = 1; i <= forecastDays; i++) {
      currentRate += data.trend; // Simple linear trend
      forecastData.push({
        day: i,
        rate: currentRate.toFixed(4),
      });
    }

    setForecast({
      pair,
      current: data.current,
      data: forecastData,
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Exchange Rate Forecaster</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Base Currency
          </label>
          <select
            value={baseCurrency}
            onChange={(e) => setBaseCurrency(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Currency
          </label>
          <select
            value={targetCurrency}
            onChange={(e) => setTargetCurrency(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Forecast Days
          </label>
          <input
            type="number"
            value={forecastDays}
            onChange={(e) => setForecastDays(Math.min(30, Math.max(1, Number(e.target.value))))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="1"
            max="30"
          />
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={generateForecast}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Generate Forecast
        </button>
      </div>

      {forecast && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-3 text-center">
            {forecast.pair} Forecast
          </h2>
          <p className="text-sm text-gray-600 mb-2">
            Current Rate: {forecast.current}
          </p>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {forecast.data.map((entry) => (
              <p key={entry.day} className="text-sm">
                Day {entry.day}: {entry.rate} 
                <span className={`ml-2 ${entry.rate > forecast.current ? 'text-green-600' : 'text-red-600'}`}>
                  ({entry.rate > forecast.current ? '↑' : '↓'})
                </span>
              </p>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: This is a simplified forecast using mock data and linear trends. 
        Real exchange rates are influenced by complex factors and require professional analysis.
      </p>
    </div>
  );
};

export default ExchangeRateForecaster;