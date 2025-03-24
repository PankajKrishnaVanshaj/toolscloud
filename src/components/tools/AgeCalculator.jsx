"use client";
import React, { useState, useCallback } from "react";
import { FaBirthdayCake, FaSync, FaCalculator } from "react-icons/fa";

const AgeCalculator = () => {
  const [birthDate, setBirthDate] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [unitPreference, setUnitPreference] = useState("years");

  // Calculate age details
  const calculateAge = useCallback((birth) => {
    const today = new Date();
    const birthDateObj = new Date(birth);

    if (isNaN(birthDateObj.getTime())) {
      return { error: "Invalid date format" };
    }
    if (birthDateObj > today) {
      return { error: "Birth date cannot be in the future" };
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
    const totalMonths = years * 12 + months;
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;

    // Calculate next birthday
    let nextBirthday = new Date(
      today.getFullYear(),
      birthDateObj.getMonth(),
      birthDateObj.getDate()
    );
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    const daysUntilBirthday = Math.floor(
      (nextBirthday - today) / (1000 * 60 * 60 * 24)
    );

    return {
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalMonths,
      totalHours,
      totalMinutes,
      birthDate: birthDateObj.toDateString(),
      nextBirthday: nextBirthday.toDateString(),
      daysUntilBirthday,
      zodiac: getZodiacSign(birthDateObj),
    };
  }, []);

  // Get Zodiac Sign
  const getZodiacSign = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Pisces";
    return "Unknown";
  };

  const calculate = () => {
    setError("");
    setResult(null);

    if (!birthDate) {
      setError("Please enter your birth date");
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
    setBirthDate("");
    setResult(null);
    setError("");
    setShowDetails(false);
    setUnitPreference("years");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6">
          Age Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <label className="w-full sm:w-32 text-gray-700">Birth Date:</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white border-gray-300"
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Unit Preference */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <label className="w-full sm:w-32 text-gray-700">Display Unit:</label>
            <select
              value={unitPreference}
              onChange={(e) => setUnitPreference(e.target.value)}
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white border-gray-300"
            >
              <option value="years">Years</option>
              <option value="months">Months</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
            </select>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition-all font-semibold flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-all font-semibold flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
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
          <div className="mt-6 p-4 rounded-lg bg-pink-50">
            <h2 className="text-lg font-semibold text-center text-gray-700">
              Your Age:
            </h2>
            <div className="mt-2 space-y-2">
              <p className="text-center text-xl">
                {unitPreference === "years" &&
                  `${result.years} years, ${result.months} months, ${result.days} days`}
                {unitPreference === "months" && `${result.totalMonths} months`}
                {unitPreference === "days" && `${result.totalDays} days`}
                {unitPreference === "weeks" && `${result.totalWeeks} weeks`}
              </p>
              <p className="text-center">
                <FaBirthdayCake className="inline mr-2" /> Born on: {result.birthDate}
              </p>

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-pink-600 hover:underline"
                >
                  {showDetails ? "Hide Details" : "Show Details"}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2 text-gray-700">
                  <p>Age Breakdown:</p>
                  <ul className="list-disc list-inside">
                    <li>Total Days Lived: {result.totalDays}</li>
                    <li>Total Weeks Lived: {result.totalWeeks}</li>
                    <li>Total Hours Lived: {result.totalHours}</li>
                    <li>Total Minutes Lived: {result.totalMinutes}</li>
                    <li>Next Birthday: {result.nextBirthday}</li>
                    <li>Days Until Birthday: {result.daysUntilBirthday}</li>
                    <li>Zodiac Sign: {result.zodiac}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 rounded-lg border bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-sm text-blue-600">
            <li>Calculate age in multiple units</li>
            <li>Show detailed breakdown (days, weeks, hours, minutes)</li>
            <li>Next birthday and days until birthday</li>
            <li>Zodiac sign calculation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AgeCalculator;