'use client'
import React, { useState } from 'react';

// Grade to GPA mapping (standard 4.0 scale)
const gradeToGPA = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'D-': 0.7,
  'F': 0.0
};

const GPACalculator = () => {
  const [courses, setCourses] = useState([{ grade: '', credits: '' }]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Handle input change for a specific course
  const handleCourseChange = (index, field, value) => {
    const updatedCourses = [...courses];
    updatedCourses[index][field] = value;
    setCourses(updatedCourses);
  };

  // Add a new course input
  const addCourse = () => {
    setCourses([...courses, { grade: '', credits: '' }]);
  };

  // Remove a course input
  const removeCourse = (index) => {
    if (courses.length > 1) {
      const updatedCourses = courses.filter((_, i) => i !== index);
      setCourses(updatedCourses);
    }
  };

  // Calculate GPA
  const calculateGPA = () => {
    setError('');
    setResult(null);

    if (courses.some(course => !course.grade || !course.credits)) {
      setError('Please fill in all grade and credit fields');
      return;
    }

    const validGrades = Object.keys(gradeToGPA);
    const courseData = courses.map(course => ({
      grade: course.grade.toUpperCase(),
      credits: parseFloat(course.credits)
    }));

    if (courseData.some(course => !validGrades.includes(course.grade))) {
      setError('Invalid grade entered. Use: A+, A, A-, B+, B, B-, C+, C, C-, D+, D, D-, F');
      return;
    }
    if (courseData.some(course => isNaN(course.credits) || course.credits <= 0)) {
      setError('Credits must be positive numbers');
      return;
    }

    const totalCredits = courseData.reduce((sum, course) => sum + course.credits, 0);
    const totalGradePoints = courseData.reduce((sum, course) => sum + (gradeToGPA[course.grade] * course.credits), 0);
    const gpa = totalGradePoints / totalCredits;

    return {
      courses: courseData,
      totalCredits: totalCredits.toFixed(2),
      totalGradePoints: totalGradePoints.toFixed(2),
      gpa: gpa.toFixed(2)
    };
  };

  const calculate = () => {
    const calcResult = calculateGPA();
    if (calcResult && calcResult.error) {
      setError(calcResult.error);
      return;
    }
    setResult(calcResult);
  };

  const reset = () => {
    setCourses([{ grade: '', credits: '' }]);
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          GPA Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            {courses.map((course, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={course.grade}
                  onChange={(e) => handleCourseChange(index, 'grade', e.target.value)}
                  className="w-24 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Grade (e.g., A)"
                />
                <input
                  type="number"
                  step="0.1"
                  value={course.credits}
                  onChange={(e) => handleCourseChange(index, 'credits', e.target.value)}
                  className="w-24 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Credits"
                  min="0"
                />
                {courses.length > 1 && (
                  <button
                    onClick={() => removeCourse(index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addCourse}
              className="w-full bg-blue-200 text-blue-800 py-2 rounded-lg hover:bg-blue-300 transition-all font-semibold"
            >
              Add Course
            </button>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all font-semibold"
            >
              Calculate GPA
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
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">GPA Results:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center text-xl">GPA: {result.gpa}</p>
              <p className="text-center">Total Credits: {result.totalCredits}</p>
              <p className="text-center">Total Grade Points: {result.totalGradePoints}</p>

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    {result.courses.map((course, index) => (
                      <li key={index}>
                        Course {index + 1}: Grade {course.grade} ({gradeToGPA[course.grade]}) × Credits {course.credits} = { (gradeToGPA[course.grade] * course.credits).toFixed(2) } grade points
                      </li>
                    ))}
                    <li>Total Credits = Sum of all credits = {result.totalCredits}</li>
                    <li>Total Grade Points = Sum of (Grade Points × Credits) = {result.totalGradePoints}</li>
                    <li>GPA = Total Grade Points / Total Credits = {result.totalGradePoints} / {result.totalCredits} = {result.gpa}</li>
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

export default GPACalculator;