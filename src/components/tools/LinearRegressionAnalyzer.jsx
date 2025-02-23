'use client';
import React, { useState, useCallback, useMemo } from 'react';

const LinearRegressionAnalyzer = () => {
  const [data, setData] = useState(''); // Input data as comma-separated x,y pairs
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Perform linear regression using least squares method
  const performLinearRegression = useCallback(() => {
    const steps = ['Performing linear regression:'];
    
    // Parse input data
    const pairs = data.split(',')
      .map(item => item.trim())
      .filter(item => item !== '')
      .map((item, index, arr) => index % 2 === 0 && index + 1 < arr.length ? [parseFloat(item), parseFloat(arr[index + 1])] : null)
      .filter(item => item !== null && !isNaN(item[0]) && !isNaN(item[1]));

    if (pairs.length < 2) {
      return { error: 'At least two valid x,y pairs are required (e.g., "1,2, 3,4")' };
    }

    steps.push(`Data points: ${pairs.map(p => `(${p[0]}, ${p[1]})`).join(', ')}`);

    // Calculate sums for least squares formulas
    const n = pairs.length;
    const sumX = pairs.reduce((sum, [x]) => sum + x, 0);
    const sumY = pairs.reduce((sum, [, y]) => sum + y, 0);
    const sumXY = pairs.reduce((sum, [x, y]) => sum + x * y, 0);
    const sumX2 = pairs.reduce((sum, [x]) => sum + x * x, 0);

    steps.push(`n = ${n}`);
    steps.push(`Σx = ${sumX.toFixed(2)}`);
    steps.push(`Σy = ${sumY.toFixed(2)}`);
    steps.push(`Σxy = ${sumXY.toFixed(2)}`);
    steps.push(`Σx² = ${sumX2.toFixed(2)}`);

    // Calculate slope (m) and intercept (b)
    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / n;

    steps.push(`Slope (m) = (n * Σxy - Σx * Σy) / (n * Σx² - (Σx)²)`);
    steps.push(`= (${n} * ${sumXY.toFixed(2)} - ${sumX.toFixed(2)} * ${sumY.toFixed(2)}) / (${n} * ${sumX2.toFixed(2)} - (${sumX.toFixed(2)})²)`);
    steps.push(`= ${(n * sumXY - sumX * sumY).toFixed(2)} / ${(n * sumX2 - sumX * sumX).toFixed(2)} = ${m.toFixed(4)}`);

    steps.push(`Intercept (b) = (Σy - m * Σx) / n`);
    steps.push(`= (${sumY.toFixed(2)} - ${m.toFixed(4)} * ${sumX.toFixed(2)}) / ${n}`);
    steps.push(`= ${(sumY - m * sumX).toFixed(2)} / ${n} = ${b.toFixed(4)}`);

    // Calculate R² (coefficient of determination)
    const meanY = sumY / n;
    const ssTot = pairs.reduce((sum, [, y]) => sum + (y - meanY) ** 2, 0);
    const ssRes = pairs.reduce((sum, [x, y]) => sum + (y - (m * x + b)) ** 2, 0);
    const rSquared = 1 - (ssRes / ssTot);

    steps.push(`Mean y = Σy / n = ${meanY.toFixed(2)}`);
    steps.push(`SS_tot = Σ(y - mean_y)² = ${ssTot.toFixed(2)}`);
    steps.push(`SS_res = Σ(y - (mx + b))² = ${ssRes.toFixed(2)}`);
    steps.push(`R² = 1 - SS_res / SS_tot = 1 - ${ssRes.toFixed(2)} / ${ssTot.toFixed(2)} = ${rSquared.toFixed(4)}`);

    return {
      slope: m.toFixed(4),
      intercept: b.toFixed(4),
      rSquared: rSquared.toFixed(4),
      steps,
    };
  }, [data]);

  // Handle input changes
  const handleDataChange = (e) => {
    const value = e.target.value;
    setData(value);
    setResult(null);
    
    const pairs = value.split(',')
      .map(item => item.trim())
      .filter(item => item !== '')
      .map((item, index, arr) => index % 2 === 0 && index + 1 < arr.length ? [parseFloat(item), parseFloat(arr[index + 1])] : null)
      .filter(item => item !== null);

    if (!value) {
      setErrors((prev) => ({ ...prev, data: 'Data points are required' }));
    } else if (pairs.some(p => p === null || isNaN(p[0]) || isNaN(p[1]))) {
      setErrors((prev) => ({ ...prev, data: 'Invalid format (use e.g., "1,2, 3,4")' }));
    } else {
      setErrors((prev) => ({ ...prev, data: '' }));
    }
  };

  // Check if input is valid
  const isValid = useMemo(() => {
    const pairs = data.split(',')
      .map(item => item.trim())
      .filter(item => item !== '')
      .map((item, index, arr) => index % 2 === 0 && index + 1 < arr.length ? [parseFloat(item), parseFloat(arr[index + 1])] : null)
      .filter(item => item !== null);
    
    return pairs.length >= 2 && pairs.every(p => !isNaN(p[0]) && !isNaN(p[1])) && !errors.data;
  }, [data, errors]);

  // Perform regression
  const analyze = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please provide valid data points (at least 2 pairs)',
      }));
      return;
    }

    const regResult = performLinearRegression();
    if (regResult.error) {
      setErrors({ general: regResult.error });
    } else {
      setResult(regResult);
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
          Linear Regression Analyzer
        </h1>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Data Points:</label>
            <div className="flex-1">
              <input
                type="text"
                value={data}
                onChange={handleDataChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1,2, 3,4, 5,6"
                aria-label="Data points (x,y pairs)"
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">Regression Line:</h2>
            <p className="text-center text-xl">y = {result.slope}x + {result.intercept}</p>
            <p className="text-center text-sm mt-2">R² = {result.rSquared}</p>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-2 text-sm text-blue-600 hover:underline"
            >
              {showSteps ? 'Hide Steps' : 'Show Steps'}
            </button>
            {showSteps && (
              <ul className="mt-2 text-sm list-disc list-inside transition-opacity max-h-40 overflow-y-auto">
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

export default LinearRegressionAnalyzer;