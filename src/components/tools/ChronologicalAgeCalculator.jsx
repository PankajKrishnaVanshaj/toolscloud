'use client'
import React, { useState } from 'react';

const ChronologicalAgeCalculator = () => {
  const [birthDate, setBirthDate] = useState('');
  const [referenceDate, setReferenceDate] = useState(''); // Optional, defaults to today
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Calculate chronological age
  const calculateAge = (birth, ref) => {
    const birthDateObj = new Date(birth);
    const refDateObj = ref ? new Date(ref) : new Date('2025-02-22'); // Default to today per instructions

    if (isNaN(birthDateObj.getTime()) || (ref && isNaN(refDateObj.getTime()))) {
      return { error: 'Invalid date format. Use YYYY-MM-DD' };
    }
    if (birthDateObj > refDateObj) {
      return { error: 'Birth date cannot be after reference date' };
    }

    let years = refDateObj.getFullYear() - birthDateObj.getFullYear();
    let months = refDateObj.getMonth() - birthDateObj.getMonth();
    let days = refDateObj.getDate() - birthDateObj.getDate();

    if (days < 0) {
      months--;
      days += new Date(refDateObj.getFullYear(), refDateObj.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = Math.floor((refDateObj - birthDateObj) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = (years * 12) + months + (days / 30.44); // Approximate, using average days per month

    return {
      birthDate: birthDateObj.toISOString().split('T')[0],
      referenceDate: refDateObj.toISOString().split('T')[0],
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalMonths: totalMonths.toFixed(2)
    };
  };

  const calculate = () => {
    setError('');
    setResult(null);

    if (!birthDate) {
      setError('Please enter your birth date');
      return;
    }

    const calcResult = calculateAge(birthDate, referenceDate);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
  };

  const reset = () => {
    setBirthDate('');
    setReferenceDate('');
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Chronological Age Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Birth Date:</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                max="2025-02-22" // Limit to today per instructions
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Reference Date (optional):</label>
              <input
                type="date"
                value={referenceDate}
                onChange={(e) => setReferenceDate(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                max="2025-02-22" // Limit to today per instructions
                placeholder="Defaults to today (2025-02-22)"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-all font-semibold"
            >
              Calculate Age
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
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Your Age:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center text-xl">
                {result.years} years, {result.months} months, {result.days} days
              </p>
              <p className="text-center">As of: {result.referenceDate}</p>

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-yellow-600 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    <li>Birth Date: {result.birthDate}</li>
                    <li>Reference Date: {result.referenceDate}</li>
                    <li>Years: {result.years}</li>
                    <li>Months: {result.months}</li>
                    <li>Days: {result.days}</li>
                    <li>Total Days: {result.totalDays}</li>
                    <li>Total Weeks: {result.totalWeeks}</li>
                    <li>Total Months (approx.): {result.totalMonths}</li>
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

export default ChronologicalAgeCalculator;