"use client";
import React, { useState, useCallback } from "react";
import { FaChartLine, FaDownload, FaSync } from "react-icons/fa";
import { Line } from "react-chartjs-2"; // For chart visualization
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ExchangeRateForecaster = () => {
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [targetCurrency, setTargetCurrency] = useState("EUR");
  const [forecastDays, setForecastDays] = useState(7);
  const [forecast, setForecast] = useState(null);
  const [volatility, setVolatility] = useState(0.005); // New: volatility factor
  const [isLoading, setIsLoading] = useState(false);

  // Extended mock historical data with more currencies
  const mockRates = {
    "USD-EUR": { current: 0.85, trend: 0.001, volatility: 0.005 },
    "USD-GBP": { current: 0.73, trend: 0.0008, volatility: 0.004 },
    "USD-JPY": { current: 110.5, trend: -0.02, volatility: 0.1 },
    "USD-CAD": { current: 1.25, trend: 0.002, volatility: 0.006 },
    "EUR-USD": { current: 1.18, trend: -0.0012, volatility: 0.005 },
    "EUR-GBP": { current: 0.86, trend: 0.0005, volatility: 0.004 },
    "EUR-JPY": { current: 130.2, trend: -0.015, volatility: 0.1 },
    "GBP-USD": { current: 1.37, trend: -0.0008, volatility: 0.004 },
    "JPY-USD": { current: 0.009, trend: 0.00002, volatility: 0.0001 },
  };

  const currencies = ["USD", "EUR", "GBP", "JPY", "CAD"];

  // Generate forecast with volatility
  const generateForecast = useCallback(() => {
    if (baseCurrency === targetCurrency) return;

    setIsLoading(true);
    const pair = `${baseCurrency}-${targetCurrency}`;
    const data = mockRates[pair] || { current: 1, trend: 0, volatility: 0.005 };

    const forecastData = [];
    let currentRate = data.current;

    for (let i = 1; i <= forecastDays; i++) {
      const randomFactor = (Math.random() - 0.5) * volatility; // Add random noise
      currentRate += data.trend + randomFactor;
      forecastData.push({
        day: i,
        rate: Math.max(0, currentRate.toFixed(4)), // Ensure rate doesn't go negative
      });
    }

    setForecast({
      pair,
      current: data.current,
      data: forecastData,
    });
    setIsLoading(false);
  }, [baseCurrency, targetCurrency, forecastDays, volatility]);

  // Chart data preparation
  const chartData = forecast
    ? {
        labels: forecast.data.map((entry) => `Day ${entry.day}`),
        datasets: [
          {
            label: `${forecast.pair} Forecast`,
            data: forecast.data.map((entry) => entry.rate),
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            fill: true,
            tension: 0.3,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Exchange Rate Forecast" },
    },
    scales: {
      y: { beginAtZero: false, title: { display: true, text: "Rate" } },
      x: { title: { display: true, text: "Days" } },
    },
  };

  // Download forecast data as CSV
  const downloadCSV = () => {
    if (!forecast) return;
    const csvContent = [
      "Day,Rate",
      ...forecast.data.map((entry) => `${entry.day},${entry.rate}`),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${forecast.pair}-forecast-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Reset function
  const reset = () => {
    setBaseCurrency("USD");
    setTargetCurrency("EUR");
    setForecastDays(7);
    setVolatility(0.005);
    setForecast(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Exchange Rate Forecaster
        </h1>

        {/* Input Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
              Forecast Days (1-30)
            </label>
            <input
              type="number"
              value={forecastDays}
              onChange={(e) =>
                setForecastDays(Math.min(30, Math.max(1, Number(e.target.value))))
              }
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="1"
              max="30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Volatility ({volatility.toFixed(3)})
            </label>
            <input
              type="range"
              min="0"
              max="0.02"
              step="0.001"
              value={volatility}
              onChange={(e) => setVolatility(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={generateForecast}
            disabled={baseCurrency === targetCurrency || isLoading}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            ) : (
              <FaChartLine className="mr-2" />
            )}
            {isLoading ? "Generating..." : "Generate Forecast"}
          </button>
          <button
            onClick={downloadCSV}
            disabled={!forecast || isLoading}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download CSV
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Forecast Results */}
        {forecast && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3 text-center">
                {forecast.pair} Forecast
              </h2>
              <p className="text-sm text-gray-600 mb-2">
                Current Rate: {forecast.current}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="max-h-48 overflow-y-auto">
                  {forecast.data.map((entry) => (
                    <p key={entry.day} className="text-sm">
                      Day {entry.day}: {entry.rate}{" "}
                      <span
                        className={`ml-2 ${
                          entry.rate > forecast.current ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        ({entry.rate > forecast.current ? "↑" : "↓"})
                      </span>
                    </p>
                  ))}
                </div>
                <div className="h-64">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Forecast Placeholder */}
        {!forecast && !isLoading && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaChartLine className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Generate a forecast to see results</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Forecast exchange rates for multiple currency pairs</li>
            <li>Customizable forecast period (1-30 days)</li>
            <li>Adjustable volatility factor</li>
            <li>Interactive chart visualization</li>
            <li>Download forecast data as CSV</li>
          </ul>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: This is a simplified simulation using mock data with linear trends and random
          volatility. Real exchange rate forecasts require advanced models and live data.
        </p>
      </div>
    </div>
  );
};

export default ExchangeRateForecaster;