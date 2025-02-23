'use client';
import React, { useState, useCallback, useMemo } from 'react';

const NumberBaseConverter = () => {
  const [number, setNumber] = useState('');
  const [fromBase, setFromBase] = useState(10); // Source base
  const [toBase, setToBase] = useState(2); // Target base
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Convert number between bases
  const convertBase = useCallback(() => {
    const steps = [`Converting ${number} from base ${fromBase} to base ${toBase}:`];

    // Validate input
    if (!number) {
      return { error: 'Please enter a number' };
    }

    // Check if input is valid for the source base
    const validChars = {
      2: '01',
      8: '01234567',
      10: '0123456789',
      16: '0123456789ABCDEFabcdef',
    };
    const allowed = validChars[fromBase];
    if (!number.split('').every(char => allowed.includes(char))) {
      return { error: `Invalid input for base ${fromBase}. Use only: ${allowed}` };
    }

    // Step 1: Convert to decimal (base 10)
    const decimal = parseInt(number, fromBase);
    if (isNaN(decimal)) {
      return { error: 'Invalid number format' };
    }
    steps.push(`Step 1: Convert ${number} (base ${fromBase}) to decimal (base 10):`);
    if (fromBase !== 10) {
      const digits = number.split('').reverse();
      let calc = '';
      digits.forEach((digit, i) => {
        const value = parseInt(digit, fromBase) * Math.pow(fromBase, i);
        calc += `${i > 0 ? ' + ' : ''}${digit} × ${fromBase}^${i} = ${value}`;
      });
      steps.push(`${calc} = ${decimal}`);
    } else {
      steps.push(`${number} is already in base 10: ${decimal}`);
    }

    // Step 2: Convert from decimal to target base
    steps.push(`Step 2: Convert ${decimal} (base 10) to base ${toBase}:`);
    let converted;
    if (toBase === 10) {
      converted = decimal.toString();
      steps.push(`${decimal} is already in base 10: ${converted}`);
    } else {
      converted = decimal.toString(toBase).toUpperCase();
      let remainderSteps = [];
      let temp = decimal;
      while (temp > 0) {
        const remainder = temp % toBase;
        remainderSteps.push(`${temp} ÷ ${toBase} = ${Math.floor(temp / toBase)} remainder ${remainder}`);
        temp = Math.floor(temp / toBase);
      }
      remainderSteps.reverse();
      steps.push(`Division method:`);
      remainderSteps.forEach(step => steps.push(step));
      steps.push(`Read remainders bottom-up: ${converted}`);
    }

    return { converted, steps };
  }, [number, fromBase, toBase]);

  // Handle input changes
  const handleNumberChange = (e) => {
    const value = e.target.value;
    setNumber(value);
    setResult(null);
    setErrors((prev) => ({ ...prev, number: value ? '' : 'Number is required' }));
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    if (!number) return false;
    const validChars = {
      2: /^[01]+$/,
      8: /^[0-7]+$/,
      10: /^[0-9]+$/,
      16: /^[0-9A-Fa-f]+$/,
    };
    return validChars[fromBase].test(number) && Object.values(errors).every(err => !err);
  }, [number, fromBase, errors]);

  // Perform conversion
  const convert = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please provide a valid number for the selected base',
      }));
      return;
    }

    const convResult = convertBase();
    if (convResult.error) {
      setErrors({ general: convResult.error });
    } else {
      setResult(convResult);
    }
  };

  // Reset state
  const reset = () => {
    setNumber('');
    setFromBase(10);
    setToBase(2);
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Number Base Converter
        </h1>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Number:</label>
            <div className="flex-1">
              <input
                type="text"
                value={number}
                onChange={handleNumberChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`e.g., ${fromBase === 2 ? '1010' : fromBase === 8 ? '12' : fromBase === 10 ? '10' : 'A'}`}
                aria-label="Number to convert"
              />
              {errors.number && <p className="text-red-600 text-sm mt-1">{errors.number}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">From Base:</label>
            <div className="flex-1 flex gap-2">
              {[2, 8, 10, 16].map(base => (
                <button
                  key={base}
                  onClick={() => setFromBase(base)}
                  className={`flex-1 py-2 rounded-lg transition-colors ${fromBase === base ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {base}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">To Base:</label>
            <div className="flex-1 flex gap-2">
              {[2, 8, 10, 16].map(base => (
                <button
                  key={base}
                  onClick={() => setToBase(base)}
                  className={`flex-1 py-2 rounded-lg transition-colors ${toBase === base ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {base}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={convert}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
          >
            Convert
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
            <p className="text-center text-xl">{result.converted}</p>
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

export default NumberBaseConverter;