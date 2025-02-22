'use client'
import React, { useState } from 'react';

const BMICalculator = () => {
  const [weight, setWeight] = useState(''); // in kg
  const [height, setHeight] = useState(''); // in cm
  const [unit, setUnit] = useState('metric'); // 'metric' or 'imperial'
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Calculate BMI and category
  const calculateBMI = (w, h) => {
    let weightInKg = w;
    let heightInMeters = h / 100; // Convert cm to meters by default

    if (unit === 'imperial') {
      // Convert pounds to kg and inches to meters
      weightInKg = w * 0.453592;
      heightInMeters = h * 0.0254;
    }

    const bmi = weightInKg / (heightInMeters * heightInMeters);
    if (!isFinite(bmi) || bmi <= 0) {
      return { error: 'Invalid calculation - check your inputs' };
    }

    // Determine BMI category
    let category = '';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal weight';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';

    return {
      bmi: bmi.toFixed(1),
      category,
      weightUsed: weightInKg.toFixed(2),
      heightUsed: heightInMeters.toFixed(2)
    };
  };

  const calculate = () => {
    setError('');
    setResult(null);

    const w = parseFloat(weight);
    const h = parseFloat(height);

    // Validation
    if (isNaN(w) || isNaN(h)) {
      setError('Please enter valid numbers');
      return;
    }
    if (w <= 0 || h <= 0) {
      setError('Weight and height must be positive');
      return;
    }

    const calcResult = calculateBMI(w, h);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
  };

  const reset = () => {
    setWeight('');
    setHeight('');
    setUnit('metric');
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          BMI Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="flex justify-center gap-4 mb-4">
            <button
              onClick={() => setUnit('metric')}
              className={`px-4 py-2 rounded-lg ${unit === 'metric' ? 'bg-cyan-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              Metric (kg, cm)
            </button>
            <button
              onClick={() => setUnit('imperial')}
              className={`px-4 py-2 rounded-lg ${unit === 'imperial' ? 'bg-cyan-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              Imperial (lb, in)
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="w-24 text-gray-700">Weight ({unit === 'metric' ? 'kg' : 'lb'}):</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder={`e.g., ${unit === 'metric' ? '70' : '154'}`}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-24 text-gray-700">Height ({unit === 'metric' ? 'cm' : 'in'}):</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder={`e.g., ${unit === 'metric' ? '170' : '67'}`}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-700 transition-all font-semibold"
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
          <div className="mt-6 p-4 bg-cyan-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">BMI Results:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center text-xl">BMI: {result.bmi}</p>
              <p className="text-center">Category: {result.category}</p>
              
              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-cyan-600 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
              
              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    <li>Weight used: {result.weightUsed} kg</li>
                    <li>Height used: {result.heightUsed} m</li>
                    <li>Formula: BMI = weight (kg) / (height (m))²</li>
                    <li>BMI = {result.weightUsed} / ({result.heightUsed} × {result.heightUsed}) = {result.bmi}</li>
                  </ul>
                  <p className="mt-2">Categories:</p>
                  <ul className="list-disc list-inside">
                    <li>Underweight: &lt; 18.5</li>
                    <li>Normal weight: 18.5 - 24.9</li>
                    <li>Overweight: 25 - 29.9</li>
                    <li>Obese: ≥ 30</li>
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

export default BMICalculator;