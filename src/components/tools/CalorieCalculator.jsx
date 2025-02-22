'use client'
import React, { useState } from 'react';

const CalorieCalculator = () => {
  const [weight, setWeight] = useState(''); // in kg
  const [height, setHeight] = useState(''); // in cm
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [activityLevel, setActivityLevel] = useState('sedentary');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Activity level multipliers
  const activityMultipliers = {
    sedentary: 1.2,     // Little or no exercise
    light: 1.375,       // Light exercise 1-3 days/week
    moderate: 1.55,     // Moderate exercise 3-5 days/week
    active: 1.725,      // Hard exercise 6-7 days/week
    veryActive: 1.9     // Very hard exercise & physical job
  };

  // Calculate BMR and TDEE using Mifflin-St Jeor Equation
  const calculateCalories = (w, h, a, g, activity) => {
    // BMR = 10W + 6.25H - 5A + S (S = 5 for male, -161 for female)
    const bmr = 10 * w + 6.25 * h - 5 * a + (g === 'male' ? 5 : -161);
    if (!isFinite(bmr) || bmr <= 0) {
      return { error: 'Invalid calculation - check your inputs' };
    }

    // Total Daily Energy Expenditure (TDEE) = BMR * Activity Multiplier
    const tdee = bmr * activityMultipliers[activity];

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      activityMultiplier: activityMultipliers[activity]
    };
  };

  const calculate = () => {
    setError('');
    setResult(null);

    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);

    // Validation
    if (isNaN(w) || isNaN(h) || isNaN(a)) {
      setError('Please enter valid numbers');
      return;
    }
    if (w <= 0 || h <= 0 || a <= 0) {
      setError('Weight, height, and age must be positive');
      return;
    }

    const calcResult = calculateCalories(w, h, a, gender, activityLevel);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
  };

  const reset = () => {
    setWeight('');
    setHeight('');
    setAge('');
    setGender('male');
    setActivityLevel('sedentary');
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Calorie Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="w-28 text-gray-700">Weight (kg):</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., 70"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-28 text-gray-700">Height (cm):</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., 170"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-28 text-gray-700">Age (years):</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., 30"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-28 text-gray-700">Gender:</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="w-28 text-gray-700">Activity Level:</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="sedentary">Sedentary (little/no exercise)</option>
                <option value="light">Light (1-3 days/week)</option>
                <option value="moderate">Moderate (3-5 days/week)</option>
                <option value="active">Active (6-7 days/week)</option>
                <option value="veryActive">Very Active (hard exercise & job)</option>
              </select>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-all font-semibold"
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
          <div className="mt-6 p-4 bg-orange-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Calorie Needs:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center text-xl">Daily Calories: {result.tdee} kcal</p>
              <p className="text-center">Basal Metabolic Rate (BMR): {result.bmr} kcal</p>
              
              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-orange-600 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
              
              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Details (Mifflin-St Jeor Equation):</p>
                  <ul className="list-disc list-inside">
                    <li>BMR = 10 × weight + 6.25 × height - 5 × age + {gender === 'male' ? '5' : '-161'}</li>
                    <li>BMR = 10 × {weight} + 6.25 × {height} - 5 × {age} + {gender === 'male' ? '5' : '-161'} = {result.bmr}</li>
                    <li>TDEE = BMR × Activity Multiplier ({activityMultipliers[activityLevel]})</li>
                    <li>TDEE = {result.bmr} × {activityMultipliers[activityLevel]} = {result.tdee}</li>
                  </ul>
                  <p className="mt-2">Activity Levels:</p>
                  <ul className="list-disc list-inside">
                    <li>Sedentary: ×1.2</li>
                    <li>Light: ×1.375</li>
                    <li>Moderate: ×1.55</li>
                    <li>Active: ×1.725</li>
                    <li>Very Active: ×1.9</li>
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

export default CalorieCalculator;