'use client'
import React, { useState } from 'react';

const MarginCalculator = () => {
  const [mode, setMode] = useState('costRevenue'); // costRevenue, costMargin, revenueMargin
  const [cost, setCost] = useState('');
  const [revenue, setRevenue] = useState('');
  const [margin, setMargin] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Calculate margin based on mode
  const calculateMargin = () => {
    setError('');
    setResult(null);

    const costNum = parseFloat(cost);
    const revenueNum = parseFloat(revenue);
    const marginNum = parseFloat(margin);

    if (mode === 'costRevenue') {
      if (isNaN(costNum) || isNaN(revenueNum)) {
        return { error: 'Please enter valid cost and revenue' };
      }
      if (costNum < 0 || revenueNum < 0) {
        return { error: 'Cost and revenue must be non-negative' };
      }
      if (revenueNum === 0) {
        return { error: 'Revenue cannot be zero' };
      }
      const profit = revenueNum - costNum;
      const marginPercent = (profit / revenueNum) * 100;
      return {
        cost: costNum.toFixed(2),
        revenue: revenueNum.toFixed(2),
        profit: profit.toFixed(2),
        margin: marginPercent.toFixed(2),
        type: 'costRevenue'
      };
    } else if (mode === 'costMargin') {
      if (isNaN(costNum) || isNaN(marginNum)) {
        return { error: 'Please enter valid cost and margin' };
      }
      if (costNum < 0 || marginNum < -100) {
        return { error: 'Cost must be non-negative, margin must be at least -100%' };
      }
      if (marginNum === 100) {
        return { error: 'Margin cannot be 100% (revenue would be infinite)' };
      }
      const revenue = costNum / (1 - marginNum / 100);
      const profit = revenue - costNum;
      return {
        cost: costNum.toFixed(2),
        revenue: revenue.toFixed(2),
        profit: profit.toFixed(2),
        margin: marginNum.toFixed(2),
        type: 'costMargin'
      };
    } else if (mode === 'revenueMargin') {
      if (isNaN(revenueNum) || isNaN(marginNum)) {
        return { error: 'Please enter valid revenue and margin' };
      }
      if (revenueNum <= 0) {
        return { error: 'Revenue must be positive' };
      }
      if (marginNum < -100) {
        return { error: 'Margin must be at least -100%' };
      }
      const cost = revenueNum * (1 - marginNum / 100);
      const profit = revenueNum - cost;
      return {
        cost: cost.toFixed(2),
        revenue: revenueNum.toFixed(2),
        profit: profit.toFixed(2),
        margin: marginNum.toFixed(2),
        type: 'revenueMargin'
      };
    }
    return null;
  };

  const calculate = () => {
    if ((mode === 'costRevenue' && (!cost || !revenue)) ||
        (mode === 'costMargin' && (!cost || !margin)) ||
        (mode === 'revenueMargin' && (!revenue || !margin))) {
      setError('Please fill in all required fields');
      return;
    }

    const calcResult = calculateMargin();
    if (calcResult && calcResult.error) {
      setError(calcResult.error);
      return;
    }
    setResult(calcResult);
  };

  const reset = () => {
    setMode('costRevenue');
    setCost('');
    setRevenue('');
    setMargin('');
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Margin Calculator
        </h1>

        {/* Mode Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            onClick={() => setMode('costRevenue')}
            className={`px-3 py-1 rounded-lg ${mode === 'costRevenue' ? 'bg-lime-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Cost & Revenue
          </button>
          <button
            onClick={() => setMode('costMargin')}
            className={`px-3 py-1 rounded-lg ${mode === 'costMargin' ? 'bg-lime-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Cost & Margin
          </button>
          <button
            onClick={() => setMode('revenueMargin')}
            className={`px-3 py-1 rounded-lg ${mode === 'revenueMargin' ? 'bg-lime-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Revenue & Margin
          </button>
        </div>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            {(mode === 'costRevenue' || mode === 'costMargin') && (
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Cost ($):</label>
                <input
                  type="number"
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
                  placeholder="e.g., 80"
                />
              </div>
            )}
            {(mode === 'costRevenue' || mode === 'revenueMargin') && (
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Revenue ($):</label>
                <input
                  type="number"
                  step="0.01"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
                  placeholder="e.g., 100"
                />
              </div>
            )}
            {(mode === 'costMargin' || mode === 'revenueMargin') && (
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Margin (%):</label>
                <input
                  type="number"
                  step="0.01"
                  value={margin}
                  onChange={(e) => setMargin(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
                  placeholder="e.g., 20"
                />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-lime-600 text-white py-2 rounded-lg hover:bg-lime-700 transition-all font-semibold"
            >
              Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-all font-semibold"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-lime-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Margin Results:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center">Cost: ${result.cost}</p>
              <p className="text-center">Revenue: ${result.revenue}</p>
              <p className="text-center">Profit: ${result.profit}</p>
              <p className="text-center">Margin: {result.margin}%</p>

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-lime-600 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    {result.type === 'costRevenue' && (
                      <>
                        <li>Profit = Revenue - Cost = {result.revenue} - {result.cost} = ${result.profit}</li>
                        <li>Margin = (Profit / Revenue) × 100 = ({result.profit} / {result.revenue}) × 100 = {result.margin}%</li>
                      </>
                    )}
                    {result.type === 'costMargin' && (
                      <>
                        <li>Revenue = Cost / (1 - Margin/100) = {result.cost} / (1 - {result.margin}/100) = ${result.revenue}</li>
                        <li>Profit = Revenue - Cost = {result.revenue} - {result.cost} = ${result.profit}</li>
                        <li>Margin = {result.margin}% (given)</li>
                      </>
                    )}
                    {result.type === 'revenueMargin' && (
                      <>
                        <li>Cost = Revenue × (1 - Margin/100) = {result.revenue} × (1 - {result.margin}/100) = ${result.cost}</li>
                        <li>Profit = Revenue - Cost = {result.revenue} - {result.cost} = ${result.profit}</li>
                        <li>Margin = {result.margin}% (given)</li>
                      </>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarginCalculator;