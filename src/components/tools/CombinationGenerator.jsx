'use client';
import React, { useState, useCallback, useMemo } from 'react';

const CombinationGenerator = () => {
  const [items, setItems] = useState(''); // Comma-separated input
  const [k, setK] = useState(''); // Number of items in each combination
  const [count, setCount] = useState('all'); // 'all' or specific number
  const [numCombs, setNumCombs] = useState(''); // Number of combinations if not 'all'
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Generate combinations
  const generateCombinations = useCallback((arr, k) => {
    const result = [];

    const combine = (start, current) => {
      if (current.length === k) {
        result.push([...current]);
        return;
      }
      for (let i = start; i < arr.length; i++) {
        current.push(arr[i]);
        combine(i + 1, current);
        current.pop();
      }
    };

    combine(0, []);
    return result;
  }, []);

  // Calculate binomial coefficient (nCk)
  const binomialCoefficient = (n, k) => {
    if (k > n) return 0;
    let res = 1;
    for (let i = 0; i < k; i++) {
      res *= (n - i) / (i + 1);
    }
    return Math.round(res); // Avoid floating-point precision issues
  };

  // Main generation logic
  const generate = useCallback(() => {
    const steps = ['Generating combinations:'];
    const itemList = items.split(',').map(item => item.trim()).filter(item => item !== '');
    const kVal = parseInt(k);

    if (itemList.length === 0) {
      return { error: 'Please enter at least one item' };
    }
    if (isNaN(kVal) || kVal <= 0 || kVal > itemList.length) {
      return { error: `k must be a positive integer between 1 and ${itemList.length}` };
    }

    const combinations = generateCombinations(itemList, kVal);
    const totalPossible = binomialCoefficient(itemList.length, kVal);
    steps.push(`Generating combinations of ${kVal} items from ${itemList.length} items`);
    steps.push(`Total possible: C(${itemList.length}, ${kVal}) = ${totalPossible}`);

    // Limit to first few for steps
    const exampleCount = Math.min(3, combinations.length);
    for (let i = 0; i < exampleCount; i++) {
      steps.push(`Combination ${i + 1}: ${combinations[i].join(', ')}`);
    }
    if (combinations.length > exampleCount) {
      steps.push(`...and ${combinations.length - exampleCount} more`);
    }

    // Apply count limit
    const finalCombinations = count === 'all' ? combinations : combinations.slice(0, parseInt(numCombs));
    return { combinations: finalCombinations, steps };
  }, [items, k, count, numCombs]);

  // Handle input changes
  const handleItemsChange = (e) => {
    const value = e.target.value;
    setItems(value);
    setResult(null);
    setErrors((prev) => ({ ...prev, items: value ? '' : 'Items are required' }));
  };

  const handleKChange = (e) => {
    const value = e.target.value;
    setK(value);
    setResult(null);
    const itemList = items.split(',').map(item => item.trim()).filter(item => item !== '');
    if (value && (isNaN(parseInt(value)) || parseInt(value) <= 0 || parseInt(value) > itemList.length)) {
      setErrors((prev) => ({ ...prev, k: `Must be between 1 and ${itemList.length}` }));
    } else {
      setErrors((prev) => ({ ...prev, k: '' }));
    }
  };

  const handleNumCombsChange = (e) => {
    const value = e.target.value;
    setNumCombs(value);
    setResult(null);
    if (value && (isNaN(parseInt(value)) || parseInt(value) <= 0)) {
      setErrors((prev) => ({ ...prev, numCombs: 'Must be a positive integer' }));
    } else {
      setErrors((prev) => ({ ...prev, numCombs: '' }));
    }
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    const itemList = items.split(',').map(item => item.trim()).filter(item => item !== '');
    if (itemList.length === 0) return false;

    const kVal = parseInt(k);
    if (isNaN(kVal) || kVal <= 0 || kVal > itemList.length) return false;

    if (count === 'specific') {
      return (
        numCombs && !isNaN(parseInt(numCombs)) && parseInt(numCombs) > 0 &&
        Object.values(errors).every(err => !err)
      );
    }
    return Object.values(errors).every(err => !err);
  }, [items, k, count, numCombs, errors]);

  // Generate combinations
  const calculate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please provide valid inputs',
      }));
      return;
    }

    const genResult = generate();
    if (genResult.error) {
      setErrors({ general: genResult.error });
    } else {
      setResult(genResult);
    }
  };

  // Reset state
  const reset = () => {
    setItems('');
    setK('');
    setCount('all');
    setNumCombs('');
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Combination Generator
        </h1>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Items:</label>
            <div className="flex-1">
              <input
                type="text"
                value={items}
                onChange={handleItemsChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1, 2, 3 or A, B, C"
                aria-label="Items for combination"
              />
              {errors.items && <p className="text-red-600 text-sm mt-1">{errors.items}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Choose (k):</label>
            <div className="flex-1">
              <input
                type="number"
                step="1"
                value={k}
                onChange={handleKChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2"
                aria-label="Number of items to choose"
              />
              {errors.k && <p className="text-red-600 text-sm mt-1">{errors.k}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Count:</label>
            <div className="flex-1 flex gap-2">
              <button
                onClick={() => setCount('all')}
                className={`flex-1 py-2 rounded-lg transition-colors ${count === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                All
              </button>
              <button
                onClick={() => setCount('specific')}
                className={`flex-1 py-2 rounded-lg transition-colors ${count === 'specific' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Specific
              </button>
            </div>
          </div>

          {count === 'specific' && (
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Number:</label>
              <div className="flex-1">
                <input
                  type="number"
                  step="1"
                  value={numCombs}
                  onChange={handleNumCombsChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3"
                  aria-label="Number of combinations"
                />
                {errors.numCombs && <p className="text-red-600 text-sm mt-1">{errors.numCombs}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={calculate}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
          >
            Generate
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">Combinations:</h2>
            <ul className="mt-2 text-center text-sm space-y-1 max-h-40 overflow-y-auto">
              {result.combinations.map((comb, i) => (
                <li key={i}>{comb.join(', ')}</li>
              ))}
            </ul>
            <p className="text-center mt-2">Total: {result.combinations.length}</p>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-2 text-sm text-blue-600 hover:underline"
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

export default CombinationGenerator;