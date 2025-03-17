"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaDownload } from "react-icons/fa";

const TDEECalculator = () => {
  const [weight, setWeight] = useState(""); // in kg or lbs
  const [height, setHeight] = useState(""); // in cm or inches
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [activityLevel, setActivityLevel] = useState("sedentary");
  const [unitSystem, setUnitSystem] = useState("metric"); // metric or imperial
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

  // Conversion factors
  const kgToLbs = 2.20462;
  const cmToInches = 0.393701;

  // Calculate BMR and TDEE using Mifflin-St Jeor Equation
  const calculateTDEE = useCallback(() => {
    setError("");
    setResult(null);

    if (!weight || !height || !age) {
      setError("Please fill in all required fields");
      return;
    }

    let weightNum = parseFloat(weight);
    let heightNum = parseFloat(height);
    const ageNum = parseInt(age);

    if (isNaN(weightNum) || isNaN(heightNum) || isNaN(ageNum)) {
      setError("Please enter valid numbers for weight, height, and age");
      return;
    }

    // Convert to metric if imperial is selected
    if (unitSystem === "imperial") {
      weightNum = weightNum / kgToLbs; // lbs to kg
      heightNum = heightNum * 2.54; // inches to cm
    }

    if (weightNum <= 0 || heightNum <= 0 || ageNum <= 0) {
      setError("Weight, height, and age must be positive");
      return;
    }

    // BMR = 10W + 6.25H - 5A + S (S = 5 for male, -161 for female)
    const bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + (gender === "male" ? 5 : -161);
    if (!isFinite(bmr) || bmr <= 0) {
      setError("Invalid calculation - check your inputs");
      return;
    }

    // TDEE = BMR * Activity Multiplier
    const tdee = bmr * activityMultipliers[activityLevel];

    setResult({
      weight: weightNum.toFixed(1),
      height: heightNum.toFixed(1),
      age: ageNum,
      gender,
      activity: activityLevel,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      activityMultiplier: activityMultipliers[activityLevel],
      unitSystem,
      inputWeight: parseFloat(weight).toFixed(1),
      inputHeight: parseFloat(height).toFixed(1),
    });
  }, [weight, height, age, gender, activityLevel, unitSystem]);

  // Reset form
  const reset = () => {
    setWeight("");
    setHeight("");
    setAge("");
    setGender("male");
    setActivityLevel("sedentary");
    setUnitSystem("metric");
    setResult(null);
    setError("");
    setShowDetails(false);
  };

  // Download result as text file
  const downloadResult = () => {
    if (!result) return;
    const text = `
TDEE Calculation Result (${new Date().toLocaleDateString()}):
- Weight: ${result.inputWeight} ${unitSystem === "metric" ? "kg" : "lbs"}
- Height: ${result.inputHeight} ${unitSystem === "metric" ? "cm" : "in"}
- Age: ${result.age} years
- Gender: ${result.gender}
- Activity Level: ${result.activity} (Multiplier: ${result.activityMultiplier})
- BMR: ${result.bmr} kcal/day
- TDEE: ${result.tdee} kcal/day
    `.trim();
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `tdee-result-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          TDEE Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit System
              </label>
              <select
                value={unitSystem}
                onChange={(e) => setUnitSystem(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="metric">Metric (kg, cm)</option>
                <option value="imperial">Imperial (lbs, in)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight ({unitSystem === "metric" ? "kg" : "lbs"})
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder={`e.g., ${unitSystem === "metric" ? "70" : "154"}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height ({unitSystem === "metric" ? "cm" : "in"})
              </label>
              <input
                type="number"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder={`e.g., ${unitSystem === "metric" ? "170" : "67"}`}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age (years)
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 30"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Level
            </label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="sedentary">Sedentary (little/no exercise)</option>
              <option value="light">Light (1-3 days/week)</option>
              <option value="moderate">Moderate (3-5 days/week)</option>
              <option value="active">Active (6-7 days/week)</option>
              <option value="veryActive">Very Active (hard exercise & job)</option>
            </select>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateTDEE}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
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
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-center border border-red-200">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-lg font-semibold text-gray-700 text-center">
              TDEE Results
            </h2>
            <div className="mt-4 space-y-4">
              <div className="text-center">
                <p className="text-xl font-bold text-blue-700">
                  TDEE: {result.tdee} kcal/day
                </p>
                <p className="text-gray-600">BMR: {result.bmr} kcal/day</p>
              </div>

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showDetails ? "Hide Details" : "Show Details"}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm text-gray-600 space-y-2">
                  <p>
                    <strong>Calculation Details (Mifflin-St Jeor):</strong>
                  </p>
                  <ul className="list-disc list-inside">
                    <li>
                      Weight: {result.inputWeight} {unitSystem === "metric" ? "kg" : "lbs"}{" "}
                      ({result.weight} kg)
                    </li>
                    <li>
                      Height: {result.inputHeight} {unitSystem === "metric" ? "cm" : "in"}{" "}
                      ({result.height} cm)
                    </li>
                    <li>Age: {result.age} years</li>
                    <li>Gender: {result.gender}</li>
                    <li>
                      BMR = 10W + 6.25H - 5A + {result.gender === "male" ? "5" : "-161"}
                    </li>
                    <li>
                      BMR = 10 × {result.weight} + 6.25 × {result.height} - 5 × {result.age} +{" "}
                      {result.gender === "male" ? "5" : "-161"} = {result.bmr}
                    </li>
                    <li>
                      Activity Multiplier: {result.activityMultiplier} ({result.activity})
                    </li>
                    <li>
                      TDEE = BMR × Multiplier = {result.bmr} × {result.activityMultiplier} ={" "}
                      {result.tdee}
                    </li>
                  </ul>
                  <p className="mt-2">
                    <strong>Activity Multipliers:</strong>
                  </p>
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

        {/* Features */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
            <li>Supports metric (kg, cm) and imperial (lbs, in) units</li>
            <li>Uses Mifflin-St Jeor equation for accurate BMR</li>
            <li>Detailed breakdown of calculations</li>
            <li>Download results as a text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TDEECalculator;