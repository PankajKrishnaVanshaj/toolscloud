'use client'
import React, { useState } from 'react';

// Standard grading scale (customizable)
const gradeScale = [
  { min: 90, letter: 'A' },
  { min: 80, letter: 'B' },
  { min: 70, letter: 'C' },
  { min: 60, letter: 'D' },
  { min: 0,  letter: 'F' }
];

const GradeCalculator = () => {
  const [grades, setGrades] = useState([{ score: '', weight: '' }]); // Array of {score, weight}
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Handle input change for a specific grade
  const handleGradeChange = (index, field, value) => {
    const updatedGrades = [...grades];
    updatedGrades[index][field] = value;
    setGrades(updatedGrades);
  };

  // Add a new grade input
  const addGrade = () => {
    setGrades([...grades, { score: '', weight: '' }]);
  };

  // Remove a grade input
  const removeGrade = (index) => {
    if (grades.length > 1) {
      const updatedGrades = grades.filter((_, i) => i !== index);
      setGrades(updatedGrades);
    }
  };

  // Calculate overall grade
  const calculateGrade = () => {
    setError('');
    setResult(null);

    if (grades.some(grade => grade.score === '' || grade.weight === '')) {
      setError('Please fill in all score and weight fields');
      return;
    }

    const gradeData = grades.map(grade => ({
      score: parseFloat(grade.score),
      weight: parseFloat(grade.weight)
    }));

    if (gradeData.some(grade => isNaN(grade.score) || isNaN(grade.weight))) {
      setError('Please enter valid numbers for scores and weights');
      return;
    }
    if (gradeData.some(grade => grade.score < 0 || grade.score > 100 || grade.weight < 0)) {
      setError('Scores must be 0-100, weights must be non-negative');
      return;
    }

    const totalWeight = gradeData.reduce((sum, grade) => sum + grade.weight, 0);
    if (totalWeight <= 0) {
      setError('Total weight must be positive');
      return;
    }

    const weightedScore = gradeData.reduce((sum, grade) => sum + (grade.score * grade.weight), 0);
    const overallPercentage = weightedScore / totalWeight;

    // Determine letter grade
    const letterGrade = gradeScale.find(grade => overallPercentage >= grade.min)?.letter || 'F';

    return {
      grades: gradeData,
      totalWeight: totalWeight.toFixed(2),
      weightedScore: weightedScore.toFixed(2),
      overallPercentage: overallPercentage.toFixed(2),
      letterGrade
    };
  };

  const calculate = () => {
    const calcResult = calculateGrade();
    if (calcResult && calcResult.error) {
      setError(calcResult.error);
      return;
    }
    setResult(calcResult);
  };

  const reset = () => {
    setGrades([{ score: '', weight: '' }]);
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Grade Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            {grades.map((grade, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={grade.score}
                  onChange={(e) => handleGradeChange(index, 'score', e.target.value)}
                  className="w-24 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Score (%)"
                  min="0"
                  max="100"
                />
                <input
                  type="number"
                  step="0.01"
                  value={grade.weight}
                  onChange={(e) => handleGradeChange(index, 'weight', e.target.value)}
                  className="w-24 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Weight (%)"
                  min="0"
                />
                {grades.length > 1 && (
                  <button
                    onClick={() => removeGrade(index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addGrade}
              className="w-full bg-indigo-200 text-indigo-800 py-2 rounded-lg hover:bg-indigo-300 transition-all font-semibold"
            >
              Add Assignment/Exam
            </button>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-all font-semibold"
            >
              Calculate Grade
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
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Grade Results:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center text-xl">Overall Grade: {result.overallPercentage}% ({result.letterGrade})</p>
              <p className="text-center">Total Weight: {result.totalWeight}%</p>
              <p className="text-center">Weighted Score: {result.weightedScore}</p>

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    {result.grades.map((grade, index) => (
                      <li key={index}>
                        Assignment/Exam {index + 1}: Score {grade.score}% × Weight {grade.weight}% = {(grade.score * grade.weight / 100 * 100).toFixed(2)} points
                      </li>
                    ))}
                    <li>Total Weight = Sum of all weights = {result.totalWeight}%</li>
                    <li>Weighted Score = Sum of (Score × Weight) = {result.weightedScore}</li>
                    <li>Overall Grade = Weighted Score / Total Weight = {result.weightedScore} / {result.totalWeight} = {result.overallPercentage}%</li>
                    <li>Letter Grade: {result.letterGrade} (based on scale: A \u2265 90, B \u2265 80, C \u2265 70, D \u2265 60, F \u003C 60)</li>
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

export default GradeCalculator;