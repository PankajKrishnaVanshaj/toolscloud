'use client';
import React, { useState, useCallback, useMemo } from 'react';

const SetOperationsTool = () => {
  const [setA, setSetA] = useState(''); // Comma-separated input for Set A
  const [setB, setSetB] = useState(''); // Comma-separated input for Set B
  const [operation, setOperation] = useState('union'); // union, intersection, differenceA, differenceB, symmetric
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Perform set operation
  const performSetOperation = useCallback(() => {
    const steps = [`Performing ${operation} operation:`];
    
    // Parse inputs into arrays and remove duplicates using Set
    const arrayA = setA.split(',').map(item => item.trim()).filter(item => item !== '');
    const arrayB = setB.split(',').map(item => item.trim()).filter(item => item !== '');
    
    if (arrayA.length === 0 || arrayB.length === 0) {
      return { error: 'Both sets must contain at least one element' };
    }

    const A = new Set(arrayA);
    const B = new Set(arrayB);
    
    steps.push(`Set A = {${Array.from(A).join(', ')}}`);
    steps.push(`Set B = {${Array.from(B).join(', ')}}`);

    let resultSet;
    switch (operation) {
      case 'union':
        resultSet = new Set([...A, ...B]);
        steps.push(`Union (A ∪ B): Combine all elements from A and B`);
        break;
      case 'intersection':
        resultSet = new Set([...A].filter(x => B.has(x)));
        steps.push(`Intersection (A ∩ B): Elements common to both A and B`);
        break;
      case 'differenceA':
        resultSet = new Set([...A].filter(x => !B.has(x)));
        steps.push(`Difference (A - B): Elements in A but not in B`);
        break;
      case 'differenceB':
        resultSet = new Set([...B].filter(x => !A.has(x)));
        steps.push(`Difference (B - A): Elements in B but not in A`);
        break;
      case 'symmetric':
        const union = new Set([...A, ...B]);
        const intersection = new Set([...A].filter(x => B.has(x)));
        resultSet = new Set([...union].filter(x => !intersection.has(x)));
        steps.push(`Symmetric Difference (A △ B): Elements in A or B but not both`);
        steps.push(`= (A ∪ B) - (A ∩ B)`);
        break;
      default:
        return { error: 'Invalid operation' };
    }

    steps.push(`Result: {${Array.from(resultSet).join(', ')}}`);
    return { result: Array.from(resultSet), steps };
  }, [setA, setB, operation]);

  // Handle input changes
  const handleSetChange = (setKey) => (e) => {
    const value = e.target.value;
    if (setKey === 'A') {
      setSetA(value);
      setErrors((prev) => ({ ...prev, setA: value ? '' : 'Set A is required' }));
    } else {
      setSetB(value);
      setErrors((prev) => ({ ...prev, setB: value ? '' : 'Set B is required' }));
    }
    setResult(null);
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    const arrayA = setA.split(',').map(item => item.trim()).filter(item => item !== '');
    const arrayB = setB.split(',').map(item => item.trim()).filter(item => item !== '');
    return (
      arrayA.length > 0 && arrayB.length > 0 &&
      Object.values(errors).every(err => !err)
    );
  }, [setA, setB, errors]);

  // Perform operation
  const calculate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please provide valid inputs for both sets',
      }));
      return;
    }

    const calcResult = performSetOperation();
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setSetA('');
    setSetB('');
    setOperation('union');
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Set Operations Tool
        </h1>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Set A:</label>
            <div className="flex-1">
              <input
                type="text"
                value={setA}
                onChange={handleSetChange('A')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1, 2, 3"
                aria-label="Set A"
              />
              {errors.setA && <p className="text-red-600 text-sm mt-1">{errors.setA}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Set B:</label>
            <div className="flex-1">
              <input
                type="text"
                value={setB}
                onChange={handleSetChange('B')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2, 3, 4"
                aria-label="Set B"
              />
              {errors.setB && <p className="text-red-600 text-sm mt-1">{errors.setB}</p>}
            </div>
          </div>

          {/* Operation Selection */}
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { key: 'union', label: 'Union (A ∪ B)' },
              { key: 'intersection', label: 'Intersection (A ∩ B)' },
              { key: 'differenceA', label: 'Difference (A - B)' },
              { key: 'differenceB', label: 'Difference (B - A)' },
              { key: 'symmetric', label: 'Symmetric Diff (A △ B)' },
            ].map((op) => (
              <button
                key={op.key}
                onClick={() => setOperation(op.key)}
                className={`px-3 py-1 rounded-lg transition-colors ${operation === op.key ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {op.label}
              </button>
            ))}
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

        {/* General Error */}
        {errors.general && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg transition-all">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Result:</h2>
            <p className="text-center text-xl">{`{${result.result.join(', ')}}`}</p>
            <p className="text-center mt-2">Size: {result.result.length}</p>
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

export default SetOperationsTool;