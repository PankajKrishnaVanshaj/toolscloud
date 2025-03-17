"use client";
import React, { useState, useCallback } from "react";
import { FaPlus, FaTrash, FaSync, FaDownload } from "react-icons/fa";

// Customizable grading scales
const gradingScales = {
  standard: [
    { min: 90, letter: "A" },
    { min: 80, letter: "B" },
    { min: 70, letter: "C" },
    { min: 60, letter: "D" },
    { min: 0, letter: "F" },
  ],
  plusMinus: [
    { min: 93, letter: "A" },
    { min: 90, letter: "A-" },
    { min: 87, letter: "B+" },
    { min: 83, letter: "B" },
    { min: 80, letter: "B-" },
    { min: 77, letter: "C+" },
    { min: 73, letter: "C" },
    { min: 70, letter: "C-" },
    { min: 67, letter: "D+" },
    { min: 63, letter: "D" },
    { min: 60, letter: "D-" },
    { min: 0, letter: "F" },
  ],
};

const GradeCalculator = () => {
  const [grades, setGrades] = useState([{ name: "", score: "", weight: "" }]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [gradingScale, setGradingScale] = useState("standard");
  const [normalizeWeights, setNormalizeWeights] = useState(true);

  // Handle input change
  const handleGradeChange = useCallback((index, field, value) => {
    const updatedGrades = [...grades];
    updatedGrades[index][field] = value;
    setGrades(updatedGrades);
  }, [grades]);

  // Add a new grade input
  const addGrade = () => {
    setGrades([...grades, { name: "", score: "", weight: "" }]);
  };

  // Remove a grade input
  const removeGrade = (index) => {
    if (grades.length > 1) {
      setGrades(grades.filter((_, i) => i !== index));
    }
  };

  // Calculate overall grade
  const calculateGrade = useCallback(() => {
    setError("");
    setResult(null);

    if (grades.some((grade) => grade.score === "" || grade.weight === "")) {
      setError("Please fill in all score and weight fields");
      return;
    }

    const gradeData = grades.map((grade) => ({
      name: grade.name || `Assignment ${grades.indexOf(grade) + 1}`,
      score: parseFloat(grade.score),
      weight: parseFloat(grade.weight),
    }));

    if (gradeData.some((grade) => isNaN(grade.score) || isNaN(grade.weight))) {
      setError("Please enter valid numbers for scores and weights");
      return;
    }
    if (gradeData.some((grade) => grade.score < 0 || grade.score > 100 || grade.weight < 0)) {
      setError("Scores must be 0-100, weights must be non-negative");
      return;
    }

    let totalWeight = gradeData.reduce((sum, grade) => sum + grade.weight, 0);
    if (totalWeight <= 0) {
      setError("Total weight must be positive");
      return;
    }

    // Normalize weights to sum to 100% if selected
    if (normalizeWeights) {
      gradeData.forEach((grade) => {
        grade.weight = (grade.weight / totalWeight) * 100;
      });
      totalWeight = 100;
    }

    const weightedScore = gradeData.reduce((sum, grade) => sum + grade.score * (grade.weight / 100), 0);
    const overallPercentage = (weightedScore / (normalizeWeights ? 1 : totalWeight / 100)) * 100;

    // Determine letter grade
    const selectedScale = gradingScales[gradingScale];
    const letterGrade = selectedScale.find((grade) => overallPercentage >= grade.min)?.letter || "F";

    return {
      grades: gradeData,
      totalWeight: totalWeight.toFixed(2),
      weightedScore: weightedScore.toFixed(2),
      overallPercentage: overallPercentage.toFixed(2),
      letterGrade,
    };
  }, [grades, gradingScale, normalizeWeights]);

  const calculate = () => {
    const calcResult = calculateGrade();
    if (calcResult && calcResult.error) {
      setError(calcResult.error);
      return;
    }
    setResult(calcResult);
  };

  const reset = () => {
    setGrades([{ name: "", score: "", weight: "" }]);
    setResult(null);
    setError("");
    setShowDetails(false);
    setGradingScale("standard");
    setNormalizeWeights(true);
  };

  // Download results as text
  const downloadResults = () => {
    if (!result) return;
    const text = `
Grade Calculation Results
------------------------
Overall Grade: ${result.overallPercentage}% (${result.letterGrade})
Total Weight: ${result.totalWeight}%
Weighted Score: ${result.weightedScore}

Details:
${result.grades
  .map(
    (grade, i) =>
      `${grade.name}: ${grade.score}% × ${grade.weight}% = ${(grade.score * grade.weight / 100).toFixed(2)} points`
  )
  .join("\n")}
------------------------
Grading Scale: ${gradingScale}
    `;
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `grade-results-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Grade Calculator
        </h1>

        {/* Settings */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grading Scale
              </label>
              <select
                value={gradingScale}
                onChange={(e) => setGradingScale(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="standard">Standard (A-F)</option>
                <option value="plusMinus">Plus/Minus (A+ to F)</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={normalizeWeights}
                  onChange={(e) => setNormalizeWeights(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Normalize Weights to 100%</span>
              </label>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          {grades.map((grade, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={grade.name}
                onChange={(e) => handleGradeChange(index, "name", e.target.value)}
                className="w-full sm:w-1/3 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder={`Assignment ${index + 1}`}
              />
              <input
                type="number"
                step="0.01"
                value={grade.score}
                onChange={(e) => handleGradeChange(index, "score", e.target.value)}
                className="w-full sm:w-1/3 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Score (%)"
                min="0"
                max="100"
              />
              <div className="flex items-center gap-2 w-full sm:w-1/3">
                <input
                  type="number"
                  step="0.01"
                  value={grade.weight}
                  onChange={(e) => handleGradeChange(index, "weight", e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Weight (%)"
                  min="0"
                />
                {grades.length > 1 && (
                  <button
                    onClick={() => removeGrade(index)}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            onClick={addGrade}
            className="w-full py-2 px-4 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center justify-center"
          >
            <FaPlus className="mr-2" /> Add Assignment/Exam
          </button>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={calculate}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Calculate Grade
          </button>
          <button
            onClick={downloadResults}
            disabled={!result}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download Results
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Grade Results</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center text-xl font-bold">
                {result.overallPercentage}% ({result.letterGrade})
              </p>
              <p className="text-center text-sm">Total Weight: {result.totalWeight}%</p>
              <p className="text-center text-sm">Weighted Score: {result.weightedScore}</p>

              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showDetails ? "Hide Details" : "Show Details"}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    {result.grades.map((grade, index) => (
                      <li key={index}>
                        {grade.name}: {grade.score}% × {grade.weight}% ={" "}
                        {(grade.score * grade.weight / 100).toFixed(2)} points
                      </li>
                    ))}
                    <li>Total Weight = {result.totalWeight}%</li>
                    <li>Weighted Score = {result.weightedScore}</li>
                    <li>
                      Overall Grade = {result.weightedScore} / {result.totalWeight} × 100 ={" "}
                      {result.overallPercentage}%
                    </li>
                    <li>Letter Grade: {result.letterGrade}</li>
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
            <li>Customizable grading scales (Standard or Plus/Minus)</li>
            <li>Optional weight normalization to 100%</li>
            <li>Named assignments/exams</li>
            <li>Detailed calculation breakdown</li>
            <li>Download results as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GradeCalculator;