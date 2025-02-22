'use client'
import React, { useState } from 'react';

const ConfidenceIntervalCalculator = () => {
  const [sampleSize, setSampleSize] = useState('');
  const [sampleMean, setSampleMean] = useState('');
  const [stdDev, setStdDev] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState('95'); // Default 95%
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Z-scores for common confidence levels (two-tailed)
  const zScores = {
    '90': 1.645,
    '95': 1.96,
    '99': 2.576
  };

  // Calculate confidence interval
  const calculateConfidenceInterval = (n, mean, s, confidence) => {
    const sampleSizeNum = parseInt(n);
    const meanNum = parseFloat(mean);
    const stdDevNum = parseFloat(s);
    const z = zScores[confidence];

    if (isNaN(sampleSizeNum) || isNaN(meanNum) || isNaN(stdDevNum)) {
      return { error: 'Please enter valid numbers' };
    }
    if (sampleSizeNum <= 0 || stdDevNum < 0) {
      return { error: 'Sample size must be positive, standard deviation cannot be negative' };
    }
    if (sampleSizeNum < 2) {
      return { error: 'Sample size must be at least 2' };
    }

    // Standard Error = s / √n
    const standardError = stdDevNum / Math.sqrt(sampleSizeNum);
    // Margin of Error = z * SE
    const marginOfError = z * standardError;
    // Confidence Interval = mean ± margin of error
    const lowerBound = meanNum - marginOfError;
    const upperBound = meanNum + marginOfError;

    return {
      sampleSize: sampleSizeNum,
      mean: meanNum.toFixed(2),
      stdDev: stdDevNum.toFixed(2),
      confidenceLevel: parseInt(confidence),
      zScore: z,
      standardError: standardError.toFixed(4),
      marginOfError: marginOfError.toFixed(4),
      lowerBound: lowerBound.toFixed(2),
      upperBound: upperBound.toFixed(2)
    };
  };

  const calculate = () => {
    setError('');
    setResult(null);

    if (!sampleSize || !sampleMean || !stdDev) {
      setError('Please fill in all required fields');
      return;
    }

    const calcResult = calculateConfidenceInterval(sampleSize, sampleMean, stdDev, confidenceLevel);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
  };

  const reset = () => {
    setSampleSize('');
    setSampleMean('');
    setStdDev('');
    setConfidenceLevel('95');
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Confidence Interval Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Sample Size (n):</label>
              <input
                type="number"
                value={sampleSize}
                onChange={(e) => setSampleSize(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 30"
                min="2"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Sample Mean (x̄):</label>
              <input
                type="number"
                step="0.01"
                value={sampleMean}
                onChange={(e) => setSampleMean(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 50"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Std Dev (s):</label>
              <input
                type="number"
                step="0.01"
                value={stdDev}
                onChange={(e) => setStdDev(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 5"
                min="0"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Confidence Level:</label>
              <select
                value={confidenceLevel}
                onChange={(e) => setConfidenceLevel(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="90">90%</option>
                <option value="95">95%</option>
                <option value="99">99%</option>
              </select>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-all font-semibold"
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
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">
              Confidence Interval ({result.confidenceLevel}%):
            </h2>
            <div className="mt-2 space-y-2">
              <p className="text-center text-xl">
                [{result.lowerBound}, {result.upperBound}]
              </p>
              <p className="text-center">
                Margin of Error: ±{result.marginOfError}
              </p>

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    <li>Sample Size (n): {result.sampleSize}</li>
                    <li>Sample Mean (x̄): {result.mean}</li>
                    <li>Standard Deviation (s): {result.stdDev}</li>
                    <li>Z-score for {result.confidenceLevel}%: {result.zScore}</li>
                    <li>Standard Error (SE) = s / √n = {result.stdDev} / √{result.sampleSize} = {result.standardError}</li>
                    <li>Margin of Error (ME) = z × SE = {result.zScore} × {result.standardError} = {result.marginOfError}</li>
                    <li>Lower Bound = x̄ - ME = {result.mean} - {result.marginOfError} = {result.lowerBound}</li>
                    <li>Upper Bound = x̄ + ME = {result.mean} + {result.marginOfError} = {result.upperBound}</li>
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

export default ConfidenceIntervalCalculator;