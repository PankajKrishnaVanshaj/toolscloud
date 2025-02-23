'use client';
import React, { useState, useCallback, useMemo } from 'react';

const PermutationGenerator = () => {
  const [items, setItems] = useState(''); // Comma-separated input
  const [count, setCount] = useState('all'); // 'all' or specific number
  const [numPerms, setNumPerms] = useState(''); // Number of permutations if not 'all'
  const [allowRepetition, setAllowRepetition] = useState(false); // With or without repetition
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Generate permutations without repetition
  const generatePermutationsNoRep = (arr) => {
    const result = [];
    const used = new Array(arr.length).fill(false);

    const permute = (current) => {
      if (current.length === arr.length) {
        result.push([...current]);
        return;
      }
      for (let i = 0; i < arr.length; i++) {
        if (!used[i]) {
          used[i] = true;
          current.push(arr[i]);
          permute(current);
          current.pop();
          used[i] = false;
        }
      }
    };

    permute([]);
    return result;
  };

  // Generate permutations with repetition
  const generatePermutationsWithRep = (arr, n) => {
    const result = [];
    const permute = (current) => {
      if (current.length === n) {
        result.push([...current]);
        return;
      }
      for (let i = 0; i < arr.length; i++) {
        current.push(arr[i]);
        permute(current);
        current.pop();
      }
    };

    permute([]);
    return result;
  };

  // Main generation logic
  const generatePermutations = useCallback(() => {
    const steps = ['Generating permutations:'];
    const itemList = items.split(',').map(item => item.trim()).filter(item => item !== '');
    
    if (itemList.length === 0) {
      return { error: 'Please enter at least one item' };
    }

    let permutations;
    if (allowRepetition) {
      const n = count === 'all' ? itemList.length : parseInt(numPerms);
      if (isNaN(n) || n <= 0) {
        return { error: 'Number of items in each permutation must be a positive integer' };
      }
      permutations = generatePermutationsWithRep(itemList, n);
      steps.push(`Generating all possible permutations with repetition for ${n} positions from ${itemList.length} items`);
      steps.push(`Total possible: ${itemList.length}^${n} = ${Math.pow(itemList.length, n)}`);
    } else {
      permutations = generatePermutationsNoRep(itemList);
      steps.push(`Generating all permutations without repetition of ${itemList.length} items`);
      steps.push(`Total possible: ${itemList.length}! = ${factorial(itemList.length)}`);
    }

    // Limit to first few for steps
    const exampleCount = Math.min(3, permutations.length);
    for (let i = 0; i < exampleCount; i++) {
      steps.push(`Permutation ${i + 1}: ${permutations[i].join(', ')}`);
    }
    if (permutations.length > exampleCount) {
      steps.push(`...and ${permutations.length - exampleCount} more`);
    }

    // Apply count limit
    const finalPermutations = count === 'all' ? permutations : permutations.slice(0, parseInt(numPerms));
    return { permutations: finalPermutations, steps };
  }, [items, count, numPerms, allowRepetition]);

  // Factorial helper
  const factorial = (n) => {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
  };

  // Handle input changes
  const handleItemsChange = (e) => {
    const value = e.target.value;
    setItems(value);
    setResult(null);
    setErrors((prev) => ({ ...prev, items: value ? '' : 'Items are required' }));
  };

  const handleNumPermsChange = (e) => {
    const value = e.target.value;
    setNumPerms(value);
    setResult(null);
    if (value && (isNaN(parseInt(value)) || parseInt(value) <= 0)) {
      setErrors((prev) => ({ ...prev, numPerms: 'Must be a positive integer' }));
    } else {
      setErrors((prev) => ({ ...prev, numPerms: '' }));
    }
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    const itemList = items.split(',').map(item => item.trim()).filter(item => item !== '');
    if (itemList.length === 0) return false;

    if (count === 'specific') {
      return (
        numPerms && !isNaN(parseInt(numPerms)) && parseInt(numPerms) > 0 &&
        Object.values(errors).every(err => !err)
      );
    }
    return Object.values(errors).every(err => !err);
  }, [items, count, numPerms, errors]);

  // Generate permutations
  const generate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please provide valid inputs',
      }));
      return;
    }

    const genResult = generatePermutations();
    if (genResult.error) {
      setErrors({ general: genResult.error });
    } else {
      setResult(genResult);
    }
  };

  // Reset state
  const reset = () => {
    setItems('');
    setCount('all');
    setNumPerms('');
    setAllowRepetition(false);
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Permutation Generator
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
                aria-label="Items for permutation"
              />
              {errors.items && <p className="text-red-600 text-sm mt-1">{errors.items}</p>}
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
                  value={numPerms}
                  onChange={handleNumPermsChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3"
                  aria-label="Number of permutations"
                />
                {errors.numPerms && <p className="text-red-600 text-sm mt-1">{errors.numPerms}</p>}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Repetition:</label>
            <div className="flex-1">
              <input
                type="checkbox"
                checked={allowRepetition}
                onChange={(e) => setAllowRepetition(e.target.checked)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                aria-label="Allow repetition"
              />
              <span className="ml-2">Allow repetition</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={generate}
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">Permutations:</h2>
            <ul className="mt-2 text-center text-sm space-y-1 max-h-40 overflow-y-auto">
              {result.permutations.map((perm, i) => (
                <li key={i}>{perm.join(', ')}</li>
              ))}
            </ul>
            <p className="text-center mt-2">Total: {result.permutations.length}</p>
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

export default PermutationGenerator;