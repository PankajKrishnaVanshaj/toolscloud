"use client";
import React, { useState, useCallback } from "react";
import { FaCalendarAlt, FaSync, FaInfoCircle } from "react-icons/fa";

const ChronologicalAgeCalculator = () => {
  const [birthDate, setBirthDate] = useState("");
  const [referenceDate, setReferenceDate] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [unitPreference, setUnitPreference] = useState("years"); // New: Display unit preference
  const [includeMilestones, setIncludeMilestones] = useState(false); // New: Show milestones

  // Calculate chronological age
  const calculateAge = useCallback((birth, ref) => {
    const birthDateObj = new Date(birth);
    const refDateObj = ref ? new Date(ref) : new Date("2025-03-14"); // Updated to match current date per instructions

    if (isNaN(birthDateObj.getTime()) || (ref && isNaN(refDateObj.getTime()))) {
      return { error: "Invalid date format. Use YYYY-MM-DD" };
    }
    if (birthDateObj > refDateObj) {
      return { error: "Birth date cannot be after reference date" };
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
    const totalMonths = (years * 12) + months + days / 30.44; // Approximate months
    const totalYears = totalDays / 365.25; // Accounting for leap years
    const totalHours = totalDays * 24;

    // Milestone calculations (example milestones)
    const milestones = includeMilestones
      ? {
          halfCentury: years >= 50 ? "Passed 50 years!" : `${50 - years} years to 50`,
          century: years >= 100 ? "Passed 100 years!" : `${100 - years} years to 100`,
          thousandWeeks: totalWeeks >= 1000 ? "Passed 1000 weeks!" : `${1000 - totalWeeks} weeks to 1000`,
        }
      : null;

    return {
      birthDate: birthDateObj.toISOString().split("T")[0],
      referenceDate: refDateObj.toISOString().split("T")[0],
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalMonths: totalMonths.toFixed(2),
      totalYears: totalYears.toFixed(2),
      totalHours,
      milestones,
    };
  }, [includeMilestones]);

  // Handle calculation
  const calculate = () => {
    setError("");
    setResult(null);

    if (!birthDate) {
      setError("Please enter your birth date");
      return;
    }

    const calcResult = calculateAge(birthDate, referenceDate);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
  };

  // Reset form
  const reset = () => {
    setBirthDate("");
    setReferenceDate("");
    setResult(null);
    setError("");
    setShowDetails(false);
    setUnitPreference("years");
    setIncludeMilestones(false);
  };

  // Render age based on unit preference
  const renderAge = (result) => {
    switch (unitPreference) {
      case "years":
        return `${result.years} years, ${result.months} months, ${result.days} days`;
      case "months":
        return `${result.totalMonths} months`;
      case "days":
        return `${result.totalDays} days`;
      case "weeks":
        return `${result.totalWeeks} weeks`;
      case "hours":
        return `${result.totalHours} hours`;
      default:
        return `${result.years} years, ${result.months} months, ${result.days} days`;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Chronological Age Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <label className="w-32 text-sm font-medium text-gray-700">Birth Date:</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                max="2025-03-14"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <label className="w-32 text-sm font-medium text-gray-700">Reference Date:</label>
              <input
                type="date"
                value={referenceDate}
                onChange={(e) => setReferenceDate(e.target.value)}
                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                max="2025-03-14"
                placeholder="Defaults to today (2025-03-14)"
              />
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Unit
              </label>
              <select
                value={unitPreference}
                onChange={(e) => setUnitPreference(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="years">Years, Months, Days</option>
                <option value="months">Total Months</option>
                <option value="days">Total Days</option>
                <option value="weeks">Total Weeks</option>
                <option value="hours">Total Hours</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeMilestones}
                  onChange={(e) => setIncludeMilestones(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Show Milestones</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaCalendarAlt className="mr-2" /> Calculate Age
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200 text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Your Age:</h2>
            <div className="mt-2 space-y-4">
              <p className="text-center text-xl font-medium text-blue-700">
                {renderAge(result)}
              </p>
              <p className="text-center text-sm text-gray-600">
                As of: {result.referenceDate}
              </p>

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-blue-600 hover:underline flex items-center justify-center mx-auto"
                >
                  <FaInfoCircle className="mr-1" />
                  {showDetails ? "Hide Details" : "Show Details"}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm text-gray-600 space-y-2">
                  <p className="font-semibold">Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    <li>Birth Date: {result.birthDate}</li>
                    <li>Reference Date: {result.referenceDate}</li>
                    <li>Years: {result.years}</li>
                    <li>Months: {result.months}</li>
                    <li>Days: {result.days}</li>
                    <li>Total Days: {result.totalDays}</li>
                    <li>Total Weeks: {result.totalWeeks}</li>
                    <li>Total Months: {result.totalMonths}</li>
                    <li>Total Years: {result.totalYears}</li>
                    <li>Total Hours: {result.totalHours}</li>
                  </ul>
                  {result.milestones && (
                    <div>
                      <p className="font-semibold mt-2">Milestones:</p>
                      <ul className="list-disc list-inside">
                        <li>Half Century: {result.milestones.halfCentury}</li>
                        <li>Century: {result.milestones.century}</li>
                        <li>1000 Weeks: {result.milestones.thousandWeeks}</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
            <li>Calculate age in multiple units (years, months, days, weeks, hours)</li>
            <li>Optional reference date (defaults to today)</li>
            <li>Detailed breakdown of age calculation</li>
            <li>Milestone tracking (e.g., 50 years, 1000 weeks)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChronologicalAgeCalculator;