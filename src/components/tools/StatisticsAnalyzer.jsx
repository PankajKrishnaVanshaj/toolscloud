'use client';
import React, { useState, useCallback, useMemo } from 'react';

const StatisticsAnalyzer = () => {
  const [data, setData] = useState(''); // Comma-separated numbers
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Analyze statistics
  const analyzeStats = useCallback(() => {
    const steps = ['Analyzing statistics:'];
    const numList = data.split(',').map(item => parseFloat(item.trim())).filter(num => !isNaN(num));

    if (numList.length === 0) {
      return { error: 'Please enter at least one valid number' };
    }

    // Sort for median and range
    const sortedList = [...numList].sort((a, b) => a - b);
    steps.push(`Dataset: ${numList.join(', ')}`);
    steps.push(`Sorted dataset: ${sortedList.join(', ')}`);

    // Mean
    const mean = numList.reduce((sum, val) => sum + val, 0) / numList.length;
    steps.push(`Mean: (${numList.join(' + ')}) / ${numList.length} = ${mean.toFixed(2)}`);

    // Median
    const mid = Math.floor(sortedList.length / 2);
    const median = sortedList.length % 2 === 0
      ? (sortedList[mid - 1] + sortedList[mid]) / 2
      : sortedList[mid];
    steps.push(`Median: ${sortedList.length % 2 === 0 
      ? `Average of middle terms (${sortedList[mid - 1]} + ${sortedList[mid]}) / 2 = ${median.toFixed(2)}` 
      : `Middle term = ${median.toFixed(2)}`}`);

    // Mode
    const frequency = {};
    numList.forEach(num => frequency[num] = (frequency[num] || 0) + 1);
    const maxFreq = Math.max(...Object.values(frequency));
    const mode = maxFreq > 1 
      ? Object.keys(frequency).filter(key => frequency[key] === maxFreq).map(Number)
      : 'No mode';
    steps.push(`Mode: ${maxFreq > 1 
      ? `Value(s) with highest frequency (${maxFreq}): ${mode.join(', ')}` 
      : 'All values appear once (no mode)'}`);

    // Standard Deviation
    const variance = numList.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numList.length;
    const stdDev = Math.sqrt(variance);
    steps.push(`Standard Deviation:`);
    steps.push(`1. Variance = Σ(x - mean)² / n = (${numList.map(val => `(${val} - ${mean.toFixed(2)})^2`).join(' + ')}) / ${numList.length} = ${variance.toFixed(2)}`);
    steps.push(`2. Std Dev = √${variance.toFixed(2)} = ${stdDev.toFixed(2)}`);

    // Range
    const range = sortedList[sortedList.length - 1] - sortedList[0];
    steps.push(`Range: ${sortedList[sortedList.length - 1]} - ${sortedList[0]} = ${range.toFixed(2)}`);

    return {
      stats: {
        mean: mean.toFixed(2),
        median: median.toFixed(2),
        mode: mode === 'No mode' ? mode : mode.join(', '),
        stdDev: stdDev.toFixed(2),
        range: range.toFixed(2),
      },
      steps,
    };
  }, [data]);

  // Handle input changes
  const handleDataChange = (e) => {
    const value = e.target.value;
    setData(value);
    setResult(null);
    setErrors((prev) => ({ ...prev, data: value ? '' : 'Data is required' }));
  };

  // Check if input is valid
  const isValid = useMemo(() => {
    const numList = data.split(',').map(item => parseFloat(item.trim())).filter(num => !isNaN(num));
    return numList.length > 0 && Object.values(errors).every(err => !err);
  }, [data, errors]);

  // Analyze data
  const analyze = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please provide valid numerical data',
      }));
      return;
    }

    const analysisResult = analyzeStats();
    if (analysisResult.error) {
      setErrors({ general: analysisResult.error });
    } else {
      setResult(analysisResult);
    }
  };

  // Reset state
  const reset = () => {
    setData('');
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Statistics Analyzer
        </h1>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Data:</label>
            <div className="flex-1">
              <input
                type="text"
                value={data}
                onChange={handleDataChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1, 2, 3, 4, 5"
                aria-label="Dataset"
              />
              {errors.data && <p className="text-red-600 text-sm mt-1">{errors.data}</p>}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={analyze}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
          >
            Analyze
          </button>
          <button
            onClick={reset}
            className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-all font-semibold"
          >
            Reset
          </button>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg transition-all">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Statistics:</h2>
            <div className="text-center text-sm space-y-2 mt-2">
              <p><strong>Mean:</strong> {result.stats.mean}</p>
              <p><strong>Median:</strong> {result.stats.median}</p>
              <p><strong>Mode:</strong> {result.stats.mode}</p>
              <p><strong>Standard Deviation:</strong> {result.stats.stdDev}</p>
              <p><strong>Range:</strong> {result.stats.range}</p>
            </div>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-4 text-sm text-blue-600 hover:underline"
            >
              {showSteps ? 'Hide Steps' : 'Show Steps'}
            </button>
            {showSteps && (
              <ul className="mt-2 text-sm list-disc list-inside transition-opacity">
                {result.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsAnalyzer;