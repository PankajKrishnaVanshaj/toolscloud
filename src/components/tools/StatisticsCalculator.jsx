'use client';
import React, { useState, useCallback, useMemo } from 'react';

const StatisticsCalculator = () => {
  const [data, setData] = useState('');
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState('');
  const [showSteps, setShowSteps] = useState(false);

  // Calculate statistics from dataset
  const calculateStats = useCallback((input) => {
    const steps = [];
    const numbers = input.split(',').map(num => parseFloat(num.trim())).filter(num => !isNaN(num));

    if (numbers.length === 0) {
      return { error: 'Please enter a valid list of numbers (e.g., 1, 2, 3)' };
    }

    steps.push(`Dataset: ${numbers.join(', ')}`);

    // Mean
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    steps.push(`Mean = (${numbers.join(' + ')}) / ${numbers.length} = ${mean.toFixed(2)}`);

    // Median
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    steps.push(`Median: Sorted = ${sorted.join(', ')}, Middle = ${median.toFixed(2)}`);

    // Mode
    const frequency = {};
    numbers.forEach(num => { frequency[num] = (frequency[num] || 0) + 1; });
    let maxFreq = 0;
    let modes = [];
    for (const num in frequency) {
      if (frequency[num] > maxFreq) {
        maxFreq = frequency[num];
        modes = [parseFloat(num)];
      } else if (frequency[num] === maxFreq) {
        modes.push(parseFloat(num));
      }
    }
    const modeText = modes.length === numbers.length ? 'No mode' : modes.join(', ');
    steps.push(`Mode: Frequencies = ${JSON.stringify(frequency)}, Mode(s) = ${modeText}`);

    // Variance (population)
    const variancePop = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
    steps.push(`Population Variance = Σ(x - mean)² / n = ${variancePop.toFixed(2)}`);

    // Variance (sample)
    const varianceSample = numbers.length > 1 ? numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / (numbers.length - 1) : 0;
    steps.push(`Sample Variance = Σ(x - mean)² / (n-1) = ${varianceSample.toFixed(2)}`);

    // Standard Deviation (population)
    const stdDevPop = Math.sqrt(variancePop);
    steps.push(`Population Std Dev = √(${variancePop.toFixed(2)}) = ${stdDevPop.toFixed(2)}`);

    // Standard Deviation (sample)
    const stdDevSample = Math.sqrt(varianceSample);
    steps.push(`Sample Std Dev = √(${varianceSample.toFixed(2)}) = ${stdDevSample.toFixed(2)}`);

    return {
      mean: mean.toFixed(2),
      median: median.toFixed(2),
      mode: modeText,
      variancePop: variancePop.toFixed(2),
      varianceSample: varianceSample.toFixed(2),
      stdDevPop: stdDevPop.toFixed(2),
      stdDevSample: stdDevSample.toFixed(2),
      steps,
    };
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setData(value);
    setResult(null); // Reset result on change

    if (value && !value.split(',').every(num => !isNaN(parseFloat(num.trim())) || num.trim() === '')) {
      setErrors('Please enter comma-separated numbers (e.g., 1, 2, 3)');
    } else {
      setErrors('');
    }
  };

  // Check if input is valid
  const isValid = useMemo(() => {
    return data && data.split(',').every(num => !isNaN(parseFloat(num.trim())) && num.trim() !== '') && !errors;
  }, [data, errors]);

  // Perform calculation
  const calculate = () => {
    setErrors('');
    setResult(null);

    if (!isValid) {
      setErrors('Please enter a valid list of numbers (e.g., 1, 2, 3)');
      return;
    }

    const calcResult = calculateStats(data);
    if (calcResult.error) {
      setErrors(calcResult.error);
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setData('');
    setErrors('');
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Statistics Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Data:</label>
            <div className="flex-1">
              <input
                type="text"
                value={data}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1, 2, 3, 4"
                aria-label="Comma-separated numbers"
              />
              {errors && <p className="text-red-600 text-sm mt-1">{errors}</p>}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={calculate}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
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

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg transition-all">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Results:</h2>
            <div className="text-center text-xl space-y-2">
              <p>Mean: {result.mean}</p>
              <p>Median: {result.median}</p>
              <p>Mode: {result.mode}</p>
              <p>Variance (Population): {result.variancePop}</p>
              <p>Variance (Sample): {result.varianceSample}</p>
              <p>Std Dev (Population): {result.stdDevPop}</p>
              <p>Std Dev (Sample): {result.stdDevSample}</p>
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

export default StatisticsCalculator;