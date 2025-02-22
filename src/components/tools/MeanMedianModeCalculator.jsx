'use client'
import React, { useState } from 'react';

const MeanMedianModeCalculator = () => {
  const [numbers, setNumbers] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Calculate mean, median, and mode
  const calculateStats = (input) => {
    // Split input by commas, spaces, or newlines and filter out empty strings
    const numArray = input.split(/[\s,\n]+/)
      .map(num => num.trim())
      .filter(num => num !== '')
      .map(num => parseFloat(num));

    if (numArray.length === 0 || numArray.some(isNaN)) {
      return { error: 'Please enter valid numbers separated by commas, spaces, or newlines' };
    }

    // Mean
    const mean = numArray.reduce((sum, num) => sum + num, 0) / numArray.length;

    // Median
    const sortedArray = [...numArray].sort((a, b) => a - b);
    const mid = Math.floor(sortedArray.length / 2);
    const median = sortedArray.length % 2 === 0
      ? (sortedArray[mid - 1] + sortedArray[mid]) / 2
      : sortedArray[mid];

    // Mode
    const frequency = {};
    numArray.forEach(num => {
      frequency[num] = (frequency[num] || 0) + 1;
    });
    let maxFreq = 0;
    let modes = [];
    for (const [num, count] of Object.entries(frequency)) {
      if (count > maxFreq) {
        maxFreq = count;
        modes = [parseFloat(num)];
      } else if (count === maxFreq) {
        modes.push(parseFloat(num));
      }
    }
    const mode = modes.length === numArray.length ? 'No mode' : modes.join(', ');

    return {
      mean: mean.toFixed(2),
      median: median.toFixed(2),
      mode,
      numbers: numArray,
      sortedNumbers: sortedArray
    };
  };

  const calculate = () => {
    setError('');
    setResult(null);

    if (!numbers.trim()) {
      setError('Please enter numbers to calculate');
      return;
    }

    const calcResult = calculateStats(numbers);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
  };

  const reset = () => {
    setNumbers('');
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Mean, Median, Mode Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">Enter Numbers:</label>
            <textarea
              value={numbers}
              onChange={(e) => setNumbers(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 h-24 resize-y"
              placeholder="e.g., 1, 2, 3, 4, 5 or 1 2 3 4 5 or one per line"
            />
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-all font-semibold"
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
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Results:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center text-xl">Mean: {result.mean}</p>
              <p className="text-center text-xl">Median: {result.median}</p>
              <p className="text-center text-xl">Mode: {result.mode}</p>

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-yellow-600 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    <li>Numbers: {result.numbers.join(', ')}</li>
                    <li>Mean = (Sum) / Count = ({result.numbers.reduce((sum, num) => sum + num, 0)}) / {result.numbers.length} = {result.mean}</li>
                    <li>Sorted: {result.sortedNumbers.join(', ')}</li>
                    <li>Median = {result.numbers.length % 2 === 0 
                      ? `Average of middle (${result.sortedNumbers[Math.floor(result.numbers.length / 2) - 1]} + ${result.sortedNumbers[Math.floor(result.numbers.length / 2)]}) / 2 = ${result.median}`
                      : `Middle value = ${result.median}`}</li>
                    <li>Mode = Most frequent: {result.mode === 'No mode' ? 'All appear once' : result.mode}</li>
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

export default MeanMedianModeCalculator;