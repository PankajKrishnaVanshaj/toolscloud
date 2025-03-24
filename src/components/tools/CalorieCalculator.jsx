"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaDownload } from "react-icons/fa";

const CalorieCalculator = () => {
  const [weight, setWeight] = useState(""); // in kg or lbs
  const [height, setHeight] = useState(""); // in cm or inches
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [activityLevel, setActivityLevel] = useState("sedentary");
  const [unitSystem, setUnitSystem] = useState("metric"); // metric or imperial
  const [goal, setGoal] = useState("maintain"); // maintain, lose, gain
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  // Activity level multipliers
  const activityMultipliers = {
    sedentary: 1.2, // Little or no exercise
    light: 1.375, // Light exercise 1-3 days/week
    moderate: 1.55, // Moderate exercise 3-5 days/week
    active: 1.725, // Hard exercise 6-7 days/week
    veryActive: 1.9, // Very hard exercise & physical job
  };

  // Goal adjustments (caloric surplus/deficit)
  const goalAdjustments = {
    maintain: 0,
    lose: -500, // 0.5 kg / 1 lb deficit
    gain: 500, // 0.5 kg / 1 lb surplus
  };

  // Calculate BMR and TDEE using Mifflin-St Jeor Equation
  const calculateCalories = useCallback(
    (w, h, a, g, activity, units, goalType) => {
      let weightInKg = units === "metric" ? w : w * 0.453592;
      let heightInCm = units === "metric" ? h : h * 2.54;

      // BMR = 10W + 6.25H - 5A + S (S = 5 for male, -161 for female)
      const bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * a + (g === "male" ? 5 : -161);
      if (!isFinite(bmr) || bmr <= 0) {
        return { error: "Invalid calculation - check your inputs" };
      }

      // Total Daily Energy Expenditure (TDEE) = BMR * Activity Multiplier
      const tdee = bmr * activityMultipliers[activity];
      const adjustedTdee = tdee + goalAdjustments[goalType];

      return {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        adjustedTdee: Math.round(adjustedTdee),
        activityMultiplier: activityMultipliers[activity],
        goalAdjustment: goalAdjustments[goalType],
      };
    },
    []
  );

  const calculate = () => {
    setError("");
    setResult(null);

    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);

    // Validation
    if (isNaN(w) || isNaN(h) || isNaN(a)) {
      setError("Please enter valid numbers");
      return;
    }
    if (w <= 0 || h <= 0 || a <= 0) {
      setError("Weight, height, and age must be positive");
      return;
    }

    const calcResult = calculateCalories(w, h, a, gender, activityLevel, unitSystem, goal);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
  };

  const reset = () => {
    setWeight("");
    setHeight("");
    setAge("");
    setGender("male");
    setActivityLevel("sedentary");
    setUnitSystem("metric");
    setGoal("maintain");
    setResult(null);
    setError("");
    setShowDetails(false);
  };

  const downloadResult = () => {
    if (!result) return;
    const text = `
Calorie Calculator Result:
- BMR: ${result.bmr} kcal
- TDEE (Maintenance): ${result.tdee} kcal
- Adjusted TDEE (${goal}): ${result.adjustedTdee} kcal
- Weight: ${weight} ${unitSystem === "metric" ? "kg" : "lbs"}
- Height: ${height} ${unitSystem === "metric" ? "cm" : "in"}
- Age: ${age} years
- Gender: ${gender}
- Activity Level: ${activityLevel}
- Goal: ${goal}
    `;
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `calorie-result-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Calorie Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit System
              </label>
              <select
                value={unitSystem}
                onChange={(e) => setUnitSystem(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500"
              >
                <option value="metric">Metric (kg, cm)</option>
                <option value="imperial">Imperial (lbs, in)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight ({unitSystem === "metric" ? "kg" : "lbs"})
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500"
                placeholder={`e.g., ${unitSystem === "metric" ? "70" : "154"}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height ({unitSystem === "metric" ? "cm" : "in"})
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500"
                placeholder={`e.g., ${unitSystem === "metric" ? "170" : "67"}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age (years)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., 30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Activity Level
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500"
              >
                <option value="sedentary">Sedentary (little/no exercise)</option>
                <option value="light">Light (1-3 days/week)</option>
                <option value="moderate">Moderate (3-5 days/week)</option>
                <option value="active">Active (6-7 days/week)</option>
                <option value="veryActive">Very Active (hard exercise & job)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500"
              >
                <option value="maintain">Maintain Weight</option>
                <option value="lose">Lose Weight (-500 kcal)</option>
                <option value="gain">Gain Weight (+500 kcal)</option>
              </select>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              className="flex-1 py-2 px-4 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            {result && (
              <button
                onClick={downloadResult}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            )}
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">Calorie Needs</h2>
            <div className="mt-2 space-y-2 text-center">
              <p className="text-xl">
                {goal === "maintain" ? "Daily Calories" : "Adjusted Calories"}:{" "}
                {result.adjustedTdee} kcal
              </p>
              <p>Maintenance (TDEE): {result.tdee} kcal</p>
              <p>Basal Metabolic Rate (BMR): {result.bmr} kcal</p>

              {/* Details Toggle */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-orange-600 hover:underline"
              >
                {showDetails ? "Hide Details" : "Show Details"}
              </button>

              {showDetails && (
                <div className="text-sm space-y-2 mt-2">
                  <p>Calculation Details (Mifflin-St Jeor Equation):</p>
                  <ul className="list-disc list-inside">
                    <li>
                      BMR = 10 × weight + 6.25 × height - 5 × age +{" "}
                      {gender === "male" ? "5" : "-161"}
                    </li>
                    <li>
                      BMR = 10 ×{" "}
                      {unitSystem === "metric" ? weight : (weight * 0.453592).toFixed(1)} + 6.25 ×{" "}
                      {unitSystem === "metric" ? height : (height * 2.54).toFixed(1)} - 5 × {age} +{" "}
                      {gender === "male" ? "5" : "-161"} = {result.bmr}
                    </li>
                    <li>
                      TDEE = BMR × Activity Multiplier ({activityMultipliers[activityLevel]})
                    </li>
                    <li>
                      TDEE = {result.bmr} × {activityMultipliers[activityLevel]} = {result.tdee}
                    </li>
                    <li>
                      Adjusted TDEE = TDEE + Goal Adjustment ({goalAdjustments[goal]})
                    </li>
                    <li>
                      Adjusted TDEE = {result.tdee} + {goalAdjustments[goal]} ={" "}
                      {result.adjustedTdee}
                    </li>
                  </ul>
                  <p className="mt-2">Activity Levels & Goals:</p>
                  <ul className="list-disc list-inside">
                    <li>Sedentary: ×1.2</li>
                    <li>Light: ×1.375</li>
                    <li>Moderate: ×1.55</li>
                    <li>Active: ×1.725</li>
                    <li>Very Active: ×1.9</li>
                    <li>
                      Goal: {goal} ({goalAdjustments[goal]} kcal)
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Metric and Imperial unit support</li>
            <li>Weight loss/gain goals with caloric adjustments</li>
            <li>Detailed BMR and TDEE calculations</li>
            <li>Downloadable results</li>
            <li>Interactive details toggle</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CalorieCalculator;