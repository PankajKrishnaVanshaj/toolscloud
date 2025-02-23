'use client';
import React, { useState, useCallback, useMemo } from 'react';

const DivisibilityTester = () => {
  const [number, setNumber] = useState('');
  const [divisor, setDivisor] = useState('');
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Divisibility rules for common numbers
  const divisibilityRules = {
    2: "A number is divisible by 2 if its last digit is even (0, 2, 4, 6, 8).",
    3: "A number is divisible by 3 if the sum of its digits is divisible by 3.",
    4: "A number is divisible by 4 if the last two digits form a number divisible by 4.",
    5: "A number is divisible by 5 if its last digit is 0 or 5.",
    6: "A number is divisible by 6 if it is divisible by both 2 and 3.",
    9: "A number is divisible by 9 if the sum of its digits is divisible by 9.",
    10: "A number is divisible by 10 if its last digit is 0."
  };

  // Test divisibility
  const testDivisibility = useCallback(() => {
    const num = parseInt(number);
    const div = parseInt(divisor);
    const steps = [`Testing if ${num} is divisible by ${div}:`];

    // Validation
    if (isNaN(num) || num < 0) {
      return { error: 'Number must be a non-negative integer' };
    }
    if (isNaN(div) || div <= 0) {
      return { error: 'Divisor must be a positive integer' };
    }

    // Basic divisibility check
    const isDivisible = num % div === 0;
    const quotient = Math.floor(num / div);
    const remainder = num % div;
    steps.push(`${num} ÷ ${div} = ${quotient} remainder ${remainder}`);
    steps.push(`Since remainder is ${remainder}, ${num} is ${isDivisible ? '' : 'not '}divisible by ${div}.`);

    // Add divisibility rule if available
    if (divisibilityRules[div]) {
      steps.push(`Rule for ${div}: ${divisibilityRules[div]}`);
      const numStr = num.toString();

      switch (div) {
        case 2:
          const lastDigit = numStr.slice(-1);
          steps.push(`Last digit is ${lastDigit}, which is ${parseInt(lastDigit) % 2 === 0 ? 'even' : 'odd'}.`);
          break;
        case 3:
        case 9:
          const digitSum = numStr.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
          steps.push(`Sum of digits: ${numStr.split('').join(' + ')} = ${digitSum}`);
          steps.push(`${digitSum} % ${div} = ${digitSum % div}, so it is ${digitSum % div === 0 ? '' : 'not '}divisible by ${div}.`);
          break;
        case 4:
          const lastTwoDigits = numStr.length > 1 ? numStr.slice(-2) : numStr;
          steps.push(`Last two digits: ${lastTwoDigits}`);
          steps.push(`${lastTwoDigits} % 4 = ${parseInt(lastTwoDigits) % 4}`);
          break;
        case 5:
          const lastDigit5 = numStr.slice(-1);
          steps.push(`Last digit is ${lastDigit5}, which ${lastDigit5 === '0' || lastDigit5 === '5' ? 'is' : 'is not'} 0 or 5.`);
          break;
        case 6:
          const lastDigit6 = numStr.slice(-1);
          const digitSum6 = numStr.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
          steps.push(`Check for 2: Last digit ${lastDigit6} is ${parseInt(lastDigit6) % 2 === 0 ? 'even' : 'odd'}.`);
          steps.push(`Check for 3: Sum of digits = ${digitSum6}, ${digitSum6} % 3 = ${digitSum6 % 3}.`);
          break;
        case 10:
          const lastDigit10 = numStr.slice(-1);
          steps.push(`Last digit is ${lastDigit10}, which ${lastDigit10 === '0' ? 'is' : 'is not'} 0.`);
          break;
        default:
          break;
      }
    }

    return { isDivisible, steps };
  }, [number, divisor]);

  // Handle input changes
  const handleNumberChange = (e) => {
    const value = e.target.value;
    setNumber(value);
    setResult(null);
    if (value && (isNaN(parseInt(value)) || parseInt(value) < 0)) {
      setErrors((prev) => ({ ...prev, number: 'Must be a non-negative integer' }));
    } else {
      setErrors((prev) => ({ ...prev, number: '' }));
    }
  };

  const handleDivisorChange = (e) => {
    const value = e.target.value;
    setDivisor(value);
    setResult(null);
    if (value && (isNaN(parseInt(value)) || parseInt(value) <= 0)) {
      setErrors((prev) => ({ ...prev, divisor: 'Must be a positive integer' }));
    } else {
      setErrors((prev) => ({ ...prev, divisor: '' }));
    }
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    return (
      number && !isNaN(parseInt(number)) && parseInt(number) >= 0 &&
      divisor && !isNaN(parseInt(divisor)) && parseInt(divisor) > 0 &&
      Object.values(errors).every(err => !err)
    );
  }, [number, divisor, errors]);

  // Test divisibility
  const test = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please provide valid inputs',
      }));
      return;
    }

    const testResult = testDivisibility();
    if (testResult.error) {
      setErrors({ general: testResult.error });
    } else {
      setResult(testResult);
    }
  };

  // Reset state
  const reset = () => {
    setNumber('');
    setDivisor('');
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Divisibility Tester
        </h1>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Number:</label>
            <div className="flex-1">
              <input
                type="number"
                step="1"
                value={number}
                onChange={handleNumberChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 15"
                aria-label="Number to test"
              />
              {errors.number && <p className="text-red-600 text-sm mt-1">{errors.number}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Divisor:</label>
            <div className="flex-1">
              <input
                type="number"
                step="1"
                value={divisor}
                onChange={handleDivisorChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 3"
                aria-label="Divisor"
              />
              {errors.divisor && <p className="text-red-600 text-sm mt-1">{errors.divisor}</p>}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={test}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
          >
            Test
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
            <p className="text-center text-xl">
              {number} is {result.isDivisible ? '' : 'not '}divisible by {divisor}.
            </p>
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

export default DivisibilityTester;