'use client'
import React, { useState } from 'react';

const AgeCalculator = () => {
  const [birthDate, setBirthDate] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Calculate age details
  const calculateAge = (birth) => {
    const today = new Date();
    const birthDateObj = new Date(birth);

    if (isNaN(birthDateObj.getTime())) {
      return { error: 'Invalid date format' };
    }
    if (birthDateObj > today) {
      return { error: 'Birth date cannot be in the future' };
    }

    let years = today.getFullYear() - birthDateObj.getFullYear();
    let months = today.getMonth() - birthDateObj.getMonth();
    let days = today.getDate() - birthDateObj.getDate();

    if (days < 0) {
      months--;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = Math.floor((today - birthDateObj) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;

    return {
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalHours,
      birthDate: birthDateObj.toDateString(),
      nextBirthday: new Date(today.getFullYear(), birthDateObj.getMonth(), birthDateObj.getDate() > today.getDate() ? birthDateObj.getDate() : birthDateObj.getDate() + 1).toDateString()
    };
  };

  const calculate = () => {
    setError('');
    setResult(null);

    if (!birthDate) {
      setError('Please enter your birth date');
      return;
    }

    const calcResult = calculateAge(birthDate);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
  };

  const reset = () => {
    setBirthDate('');
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Age Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Birth Date:</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              max={new Date().toISOString().split('T')[0]} // Prevent future dates
            />
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition-all font-semibold"
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
          <div className="mt-6 p-4 bg-pink-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Your Age:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center text-xl">
                {result.years} years, {result.months} months, {result.days} days
              </p>
              <p className="text-center">Born on: {result.birthDate}</p>
              
              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-pink-600 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
              
              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Age Breakdown:</p>
                  <ul className="list-disc list-inside">
                    <li>Total Days Lived: {result.totalDays}</li>
                    <li>Total Weeks Lived: {result.totalWeeks}</li>
                    <li>Total Hours Lived: {result.totalHours}</li>
                    <li>Next Birthday: {result.nextBirthday}</li>
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

export default AgeCalculator;