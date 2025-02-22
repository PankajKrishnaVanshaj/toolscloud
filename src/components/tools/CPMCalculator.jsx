'use client'
import React, { useState } from 'react';

const CPMCalculator = () => {
  const [mode, setMode] = useState('cpm'); // cpm, cost, impressions
  const [cost, setCost] = useState('');
  const [impressions, setImpressions] = useState('');
  const [cpm, setCpm] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Calculate CPM based on mode
  const calculateCPM = () => {
    setError('');
    setResult(null);

    const costNum = parseFloat(cost);
    const impressionsNum = parseFloat(impressions);
    const cpmNum = parseFloat(cpm);

    if (mode === 'cpm') {
      if (isNaN(costNum) || isNaN(impressionsNum)) {
        return { error: 'Please enter valid cost and impressions' };
      }
      if (costNum < 0 || impressionsNum <= 0) {
        return { error: 'Cost must be non-negative, impressions must be positive' };
      }
      const cpmCalc = (costNum / impressionsNum) * 1000;
      return {
        cost: costNum.toFixed(2),
        impressions: impressionsNum.toFixed(0),
        cpm: cpmCalc.toFixed(2),
        type: 'cpm'
      };
    } else if (mode === 'cost') {
      if (isNaN(cpmNum) || isNaN(impressionsNum)) {
        return { error: 'Please enter valid CPM and impressions' };
      }
      if (cpmNum < 0 || impressionsNum <= 0) {
        return { error: 'CPM must be non-negative, impressions must be positive' };
      }
      const costCalc = (cpmNum * impressionsNum) / 1000;
      return {
        cost: costCalc.toFixed(2),
        impressions: impressionsNum.toFixed(0),
        cpm: cpmNum.toFixed(2),
        type: 'cost'
      };
    } else if (mode === 'impressions') {
      if (isNaN(costNum) || isNaN(cpmNum)) {
        return { error: 'Please enter valid cost and CPM' };
      }
      if (costNum < 0 || cpmNum <= 0) {
        return { error: 'Cost must be non-negative, CPM must be positive' };
      }
      const impressionsCalc = (costNum / cpmNum) * 1000;
      return {
        cost: costNum.toFixed(2),
        impressions: impressionsCalc.toFixed(0),
        cpm: cpmNum.toFixed(2),
        type: 'impressions'
      };
    }
    return null;
  };

  const calculate = () => {
    if ((mode === 'cpm' && (!cost || !impressions)) ||
        (mode === 'cost' && (!cpm || !impressions)) ||
        (mode === 'impressions' && (!cost || !cpm))) {
      setError('Please fill in all required fields');
      return;
    }

    const calcResult = calculateCPM();
    if (calcResult && calcResult.error) {
      setError(calcResult.error);
      return;
    }
    setResult(calcResult);
  };

  const reset = () => {
    setMode('cpm');
    setCost('');
    setImpressions('');
    setCpm('');
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          CPM Calculator
        </h1>

        {/* Mode Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            onClick={() => setMode('cpm')}
            className={`px-3 py-1 rounded-lg ${mode === 'cpm' ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Calculate CPM
          </button>
          <button
            onClick={() => setMode('cost')}
            className={`px-3 py-1 rounded-lg ${mode === 'cost' ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Calculate Cost
          </button>
          <button
            onClick={() => setMode('impressions')}
            className={`px-3 py-1 rounded-lg ${mode === 'impressions' ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Calculate Impressions
          </button>
        </div>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            {(mode === 'cpm' || mode === 'impressions') && (
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Cost ($):</label>
                <input
                  type="number"
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 500"
                />
              </div>
            )}
            {(mode === 'cpm' || mode === 'cost') && (
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Impressions:</label>
                <input
                  type="number"
                  value={impressions}
                  onChange={(e) => setImpressions(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 100000"
                  min="1"
                />
              </div>
            )}
            {(mode === 'cost' || mode === 'impressions') && (
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">CPM ($):</label>
                <input
                  type="number"
                  step="0.01"
                  value={cpm}
                  onChange={(e) => setCpm(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 5"
                />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-all font-semibold"
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
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">CPM Results:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center">Cost: ${result.cost}</p>
              <p className="text-center">Impressions: {result.impressions}</p>
              <p className="text-center">CPM: ${result.cpm}</p>

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-green-600 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    {result.type === 'cpm' && (
                      <>
                        <li>Cost: ${result.cost}</li>
                        <li>Impressions: {result.impressions}</li>
                        <li>CPM = (Cost / Impressions) × 1000 = ({result.cost} / {result.impressions}) × 1000 = ${result.cpm}</li>
                      </>
                    )}
                    {result.type === 'cost' && (
                      <>
                        <li>CPM: ${result.cpm}</li>
                        <li>Impressions: {result.impressions}</li>
                        <li>Cost = (CPM × Impressions) / 1000 = ({result.cpm} × {result.impressions}) / 1000 = ${result.cost}</li>
                      </>
                    )}
                    {result.type === 'impressions' && (
                      <>
                        <li>Cost: ${result.cost}</li>
                        <li>CPM: ${result.cpm}</li>
                        <li>Impressions = (Cost / CPM) × 1000 = ({result.cost} / {result.cpm}) × 1000 = {result.impressions}</li>
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

export default CPMCalculator;