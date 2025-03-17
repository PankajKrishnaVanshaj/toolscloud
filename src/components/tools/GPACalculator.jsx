"use client";
import React, { useState, useCallback } from "react";
import { FaPlus, FaTrash, FaDownload, FaSync } from "react-icons/fa";

// Grade to GPA mapping (standard 4.0 scale)
const gradeToGPA = {
  "A+": 4.0, A: 4.0, "A-": 3.7,
  "B+": 3.3, B: 3.0, "B-": 2.7,
  "C+": 2.3, C: 2.0, "C-": 1.7,
  "D+": 1.3, D: 1.0, "D-": 0.7,
  F: 0.0,
};

const GPACalculator = () => {
  const [courses, setCourses] = useState([{ grade: "", credits: "", name: "" }]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [gradingScale, setGradingScale] = useState("4.0"); // New: Support for different scales
  const [cumulativeGPA, setCumulativeGPA] = useState({ gpa: "", credits: "" });

  // Handle input change for a specific course
  const handleCourseChange = useCallback((index, field, value) => {
    const updatedCourses = [...courses];
    updatedCourses[index][field] = value;
    setCourses(updatedCourses);
  }, [courses]);

  // Add a new course input
  const addCourse = () => {
    setCourses([...courses, { grade: "", credits: "", name: "" }]);
  };

  // Remove a course input
  const removeCourse = (index) => {
    if (courses.length > 1) {
      const updatedCourses = courses.filter((_, i) => i !== index);
      setCourses(updatedCourses);
    }
  };

  // Calculate GPA
  const calculateGPA = useCallback(() => {
    setError("");
    setResult(null);

    if (courses.some((course) => !course.grade || !course.credits)) {
      setError("Please fill in all grade and credit fields");
      return;
    }

    const validGrades = Object.keys(gradeToGPA);
    const courseData = courses.map((course) => ({
      name: course.name,
      grade: course.grade.toUpperCase(),
      credits: parseFloat(course.credits),
    }));

    if (courseData.some((course) => !validGrades.includes(course.grade))) {
      setError("Invalid grade entered. Use: A+, A, A-, B+, B, B-, C+, C, C-, D+, D, D-, F");
      return;
    }
    if (courseData.some((course) => isNaN(course.credits) || course.credits <= 0)) {
      setError("Credits must be positive numbers");
      return;
    }

    const totalCredits = courseData.reduce((sum, course) => sum + course.credits, 0);
    const totalGradePoints = courseData.reduce(
      (sum, course) => sum + gradeToGPA[course.grade] * course.credits,
      0
    );
    let gpa = totalGradePoints / totalCredits;

    // Adjust GPA based on grading scale (simplified for demo)
    if (gradingScale === "5.0") {
      gpa = (gpa / 4.0) * 5.0;
    } else if (gradingScale === "10.0") {
      gpa = (gpa / 4.0) * 10.0;
    }

    // Include cumulative GPA if provided
    let finalGPA = gpa;
    if (cumulativeGPA.gpa && cumulativeGPA.credits) {
      const prevGPA = parseFloat(cumulativeGPA.gpa);
      const prevCredits = parseFloat(cumulativeGPA.credits);
      if (!isNaN(prevGPA) && !isNaN(prevCredits) && prevCredits > 0) {
        const newTotalCredits = totalCredits + prevCredits;
        const newTotalGradePoints = totalGradePoints + prevGPA * prevCredits;
        finalGPA = newTotalGradePoints / newTotalCredits;
      }
    }

    return {
      courses: courseData,
      totalCredits: totalCredits.toFixed(2),
      totalGradePoints: totalGradePoints.toFixed(2),
      gpa: gpa.toFixed(2),
      finalGPA: finalGPA.toFixed(2),
    };
  }, [courses, gradingScale, cumulativeGPA]);

  const calculate = () => {
    const calcResult = calculateGPA();
    if (calcResult) {
      setResult(calcResult);
    }
  };

  // Reset everything
  const reset = () => {
    setCourses([{ grade: "", credits: "", name: "" }]);
    setResult(null);
    setError("");
    setShowDetails(false);
    setGradingScale("4.0");
    setCumulativeGPA({ gpa: "", credits: "" });
  };

  // Download results as text file
  const downloadResults = () => {
    if (!result) return;
    const text = `
GPA Calculation Results
-----------------------
Semester GPA: ${result.gpa}
Total Credits: ${result.totalCredits}
Total Grade Points: ${result.totalGradePoints}
${result.finalGPA !== result.gpa ? `Cumulative GPA: ${result.finalGPA}` : ""}
${showDetails ? `
Details:
${result.courses.map((course, index) => `Course ${index + 1} (${course.name || "Unnamed"}): Grade ${course.grade} (${gradeToGPA[course.grade]}) × Credits ${course.credits} = ${(gradeToGPA[course.grade] * course.credits).toFixed(2)} grade points`).join("\n")}
Total Credits = ${result.totalCredits}
Total Grade Points = ${result.totalGradePoints}
Semester GPA = ${result.totalGradePoints} / ${result.totalCredits} = ${result.gpa}
${result.finalGPA !== result.gpa ? `Cumulative GPA = (${result.totalGradePoints} + ${cumulativeGPA.gpa * cumulativeGPA.credits}) / (${result.totalCredits} + ${cumulativeGPA.credits}) = ${result.finalGPA}` : ""}` : ""}
    `.trim();
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `gpa-results-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          GPA Calculator
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
                <option value="4.0">4.0 Scale</option>
                <option value="5.0">5.0 Scale</option>
                <option value="10.0">10.0 Scale</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cumulative GPA (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={cumulativeGPA.gpa}
                  onChange={(e) => setCumulativeGPA({ ...cumulativeGPA, gpa: e.target.value })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="GPA"
                  min="0"
                />
                <input
                  type="number"
                  step="0.1"
                  value={cumulativeGPA.credits}
                  onChange={(e) => setCumulativeGPA({ ...cumulativeGPA, credits: e.target.value })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Credits"
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          {courses.map((course, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={course.name}
                onChange={(e) => handleCourseChange(index, "name", e.target.value)}
                className="w-full sm:w-1/3 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Course Name (optional)"
              />
              <input
                type="text"
                value={course.grade}
                onChange={(e) => handleCourseChange(index, "grade", e.target.value)}
                className="w-full sm:w-1/3 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Grade (e.g., A)"
              />
              <input
                type="number"
                step="0.1"
                value={course.credits}
                onChange={(e) => handleCourseChange(index, "credits", e.target.value)}
                className="w-full sm:w-1/3 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Credits"
                min="0"
              />
              {courses.length > 1 && (
                <button
                  onClick={() => removeCourse(index)}
                  className="p-2 text-red-600 hover:text-red-800 transition-colors"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addCourse}
            className="w-full py-2 px-4 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center justify-center"
          >
            <FaPlus className="mr-2" /> Add Course
          </button>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={calculate}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Calculate GPA
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">GPA Results</h2>
            <div className="mt-4 space-y-2 text-center">
              <p className="text-xl">Semester GPA: {result.gpa}</p>
              {result.finalGPA !== result.gpa && (
                <p className="text-xl">Cumulative GPA: {result.finalGPA}</p>
              )}
              <p>Total Credits: {result.totalCredits}</p>
              <p>Total Grade Points: {result.totalGradePoints}</p>

              {/* Details Toggle */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                {showDetails ? "Hide Details" : "Show Details"}
              </button>

              {showDetails && (
                <div className="mt-4 text-sm space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    {result.courses.map((course, index) => (
                      <li key={index}>
                        {course.name || `Course ${index + 1}`}: Grade {course.grade} (
                        {gradeToGPA[course.grade]}) × Credits {course.credits} ={" "}
                        {(gradeToGPA[course.grade] * course.credits).toFixed(2)} grade points
                      </li>
                    ))}
                    <li>Total Credits = {result.totalCredits}</li>
                    <li>Total Grade Points = {result.totalGradePoints}</li>
                    <li>
                      Semester GPA = {result.totalGradePoints} / {result.totalCredits} ={" "}
                      {result.gpa}
                    </li>
                    {result.finalGPA !== result.gpa && (
                      <li>
                        Cumulative GPA = ({result.totalGradePoints} +{" "}
                        {cumulativeGPA.gpa * cumulativeGPA.credits}) / ({result.totalCredits} +{" "}
                        {cumulativeGPA.credits}) = {result.finalGPA}
                      </li>
                    )}
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
            <li>Support for 4.0, 5.0, and 10.0 grading scales</li>
            <li>Course name input for better organization</li>
            <li>Cumulative GPA calculation</li>
            <li>Downloadable results as text file</li>
            <li>Detailed calculation breakdown</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GPACalculator;