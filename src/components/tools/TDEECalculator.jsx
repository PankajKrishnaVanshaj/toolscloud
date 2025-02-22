'use client'
import React, { useState } from 'react';

const TDEECalculator = () => {
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
  const calculateTDEE = (w, h, a, g, activity) => {
    const weightNum = parseFloat(w);
    const heightNum = parseFloat(h);
    const ageNum = parseInt(a);

    if (isNaN(weightNum) || isNaN(heightNum) || isNaN(ageNum)) {
      return { error: 'Please enter valid numbers for weight, height, and age' };
    }
    if (weightNum <= 0 || heightNum <= 0 || ageNum <= 0) {
      return { error: 'Weight, height, and age must be positive' };
    }

    // BMR = 10W + 6.25H - 5A + S (S = 5 for male, -161 for female)
    const bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + (g === 'male' ? 5 : -161);
    if (!isFinite(bmr) || bmr <= 0) {
      return { error: 'Invalid calculation - check your inputs' };
    }

    // TDEE = BMR * Activity Multiplier
    const tdee = bmr * activityMultipliers[activity];

    return {
      weight: weightNum.toFixed(1),
      height: heightNum.toFixed(1),
      age: ageNum,
      gender: g,
      activity: activity,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      activityMultiplier: activityMultipliers[activity]
    };
  };

  const calculate = () => {
    setError('');
    setResult(null);

    if (!weight || !height || !age) {
      setError('Please fill in all required fields');
      return;
    }

    const calcResult = calculateTDEE(weight, height, age, gender, activityLevel);
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          TDEE Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Weight (kg):</label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., 70"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Height (cm):</label>
              <input
                type="number"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., 170"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Age (years):</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., 30"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Gender:</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Activity Level:</label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="sedentary">Sedentary (little/no exercise)</option>
              <option value="light">Light (1-3 days/week)</option>
              <option value="moderate">Moderate (3-5 days/week)</option>
              <option value="active">Active (6-7 days/week)</option>
              <option value="veryActive">Very Active (hard exercise & job)</option>
            </select>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-all font-semibold"
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
          <div className="mt-6 p-4 bg-teal-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">TDEE Results:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center text-xl">TDEE: {result.tdee} kcal/day</p>
              <p className="text-center">BMR: {result.bmr} kcal/day</p>

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-teal-600 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Details (Mifflin-St Jeor):</p>
                  <ul className="list-disc list-inside">
                    <li>Weight: {result.weight} kg</li>
                    <li>Height: {result.height} cm</li>
                    <li>Age: {result.age} years</li>
                    <li>Gender: {result.gender}</li>
                    <li>BMR = 10W + 6.25H - 5A + {result.gender === 'male' ? '5' : '-161'}</li>
                    <li>BMR = 10 × {result.weight} + 6.25 × {result.height} - 5 × {result.age} + {result.gender === 'male' ? '5' : '-161'} = {result.bmr}</li>
                    <li>Activity Multiplier: {result.activityMultiplier} ({result.activity})</li>
                    <li>TDEE = BMR × Multiplier = {result.bmr} × {result.activityMultiplier} = {result.tdee}</li>
                  </ul>
                  <p className="mt-2">Activity Multipliers:</p>
                  <ul className="list-disc list-inside">
                    <li>Sedentary: 1.2</li>
                    <li>Light: 1.375</li>
                    <li>Moderate: 1.55</li>
                    <li>Active: 1.725</li>
                    <li>Very Active: 1.9</li>
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

export default TDEECalculator;