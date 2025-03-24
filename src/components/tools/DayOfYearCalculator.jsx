"use client";
import React, { useState, useCallback } from "react";
import { FaCalendarAlt, FaSync, FaDownload } from "react-icons/fa";

const DayOfYearCalculator = () => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [dayOfYear, setDayOfYear] = useState("");
  const [yearForReverse, setYearForReverse] = useState(new Date().getFullYear().toString());
  const [reverseDay, setReverseDay] = useState("");
  const [result, setResult] = useState(null);
  const [reverseResult, setReverseResult] = useState(null);
  const [error, setError] = useState("");
  const [dateFormat, setDateFormat] = useState("en-US"); // For localization
  const [showDetails, setShowDetails] = useState(false);

  const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };

  const calculateDayOfYear = useCallback(
    (inputDate) => {
      try {
        const d = new Date(inputDate);
        if (isNaN(d.getTime())) throw new Error("Invalid date");

        const year = d.getFullYear();
        const startOfYear = new Date(year, 0, 1);
        const diffMs = d - startOfYear;
        const day = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

        const weekNumber = Math.ceil((day + startOfYear.getDay()) / 7);
        const totalDays = isLeapYear(year) ? 366 : 365;
        const remainingDays = totalDays - day;

        return {
          dayOfYear: day,
          weekNumber,
          totalDays,
          remainingDays,
          isLeapYear: isLeapYear(year),
          formattedDate: d.toLocaleDateString(dateFormat, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          isoDate: d.toISOString().slice(0, 10),
        };
      } catch (err) {
        setError(`Invalid date: ${err.message}`);
        return null;
      }
    },
    [dateFormat]
  );

  const calculateDateFromDay = useCallback(
    (year, day) => {
      try {
        const y = parseInt(year, 10);
        if (isNaN(y) || y < 1) throw new Error("Invalid year");
        const d = parseInt(day, 10);
        const maxDays = isLeapYear(y) ? 366 : 365;
        if (isNaN(d) || d < 1 || d > maxDays) {
          throw new Error(`Day must be between 1 and ${maxDays}`);
        }

        const startOfYear = new Date(y, 0, 1);
        const targetDate = new Date(startOfYear);
        targetDate.setDate(startOfYear.getDate() + d - 1);

        const weekNumber = Math.ceil((d + startOfYear.getDay()) / 7);
        const remainingDays = maxDays - d;

        return {
          date: targetDate.toISOString().slice(0, 10),
          formattedDate: targetDate.toLocaleDateString(dateFormat, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          weekNumber,
          remainingDays,
          isLeapYear: isLeapYear(y),
        };
      } catch (err) {
        setError(`Invalid input: ${err.message}`);
        return null;
      }
    },
    [dateFormat]
  );

  const handleDateChange = (value) => {
    setDate(value);
    setError("");
    const calcResult = calculateDayOfYear(value);
    setResult(calcResult);
  };

  const handleReverseChange = () => {
    setError("");
    const calcResult = calculateDateFromDay(yearForReverse, reverseDay);
    setReverseResult(calcResult);
  };

  const handleNow = () => {
    const today = new Date().toISOString().slice(0, 10);
    setDate(today);
    handleDateChange(today);
  };

  const reset = () => {
    const today = new Date().toISOString().slice(0, 10);
    setDate(today);
    setDayOfYear("");
    setYearForReverse(new Date().getFullYear().toString());
    setReverseDay("");
    setResult(null);
    setReverseResult(null);
    setError("");
    setDateFormat("en-US");
    handleDateChange(today);
  };

  const downloadResults = () => {
    const content = [
      "Day of Year Calculator Results",
      "-----------------------------",
      result
        ? [
            `Date: ${result.formattedDate}`,
            `Day of Year: ${result.dayOfYear} / ${result.totalDays}`,
            `Week Number: ${result.weekNumber}`,
            `Remaining Days: ${result.remainingDays}`,
            `Leap Year: ${result.isLeapYear ? "Yes" : "No"}`,
          ].join("\n")
        : "No forward calculation result",
      "",
      reverseResult
        ? [
            "Reverse Calculation:",
            `Date: ${reverseResult.formattedDate}`,
            `Week Number: ${reverseResult.weekNumber}`,
            `Remaining Days: ${reverseResult.remainingDays}`,
            `Leap Year: ${reverseResult.isLeapYear ? "Yes" : "No"}`,
          ].join("\n")
        : "No reverse calculation result",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `day-of-year-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Day of Year Calculator
        </h1>

        <div className="space-y-8">
          {/* Settings */}
          <div className="flex justify-between items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Format
              </label>
              <select
                value={dateFormat}
                onChange={(e) => {
                  setDateFormat(e.target.value);
                  if (result) handleDateChange(date);
                  if (reverseResult) handleReverseChange();
                }}
                className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="en-US">US (MM/DD/YYYY)</option>
                <option value="en-GB">UK (DD/MM/YYYY)</option>
                <option value="fr-FR">French (DD/MM/YYYY)</option>
                <option value="ja-JP">Japanese (YYYY/MM/DD)</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={reset}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
              <button
                onClick={downloadResults}
                disabled={!result && !reverseResult}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>
          </div>

          {/* Day of Year Calculation */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleNow}
                className="mt-6 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
              >
                <FaCalendarAlt className="mr-2" /> Today
              </button>
            </div>

            {result && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2 text-gray-700">Results:</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                  <p><strong>Date:</strong> {result.formattedDate}</p>
                  <p><strong>ISO Date:</strong> {result.isoDate}</p>
                  <p><strong>Day of Year:</strong> {result.dayOfYear} / {result.totalDays}</p>
                  <p><strong>Remaining Days:</strong> {result.remainingDays}</p>
                  <p><strong>Week Number:</strong> {result.weekNumber}</p>
                  <p><strong>Leap Year:</strong> {result.isLeapYear ? "Yes" : "No"}</p>
                </div>
              </div>
            )}
          </div>

          {/* Reverse Calculation */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <input
                  type="number"
                  value={yearForReverse}
                  onChange={(e) => setYearForReverse(e.target.value)}
                  placeholder="e.g., 2025"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day of Year
                </label>
                <input
                  type="number"
                  value={reverseDay}
                  onChange={(e) => setReverseDay(e.target.value)}
                  placeholder={`1-${isLeapYear(yearForReverse) ? 366 : 365}`}
                  min="1"
                  max={isLeapYear(yearForReverse) ? 366 : 365}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={handleReverseChange}
              disabled={!yearForReverse || !reverseDay}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Calculate Date
            </button>

            {reverseResult && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2 text-gray-700">Reverse Calculation:</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                  <p><strong>Date:</strong> {reverseResult.formattedDate}</p>
                  <p><strong>ISO Date:</strong> {reverseResult.date}</p>
                  <p><strong>Week Number:</strong> {reverseResult.weekNumber}</p>
                  <p><strong>Remaining Days:</strong> {reverseResult.remainingDays}</p>
                  <p><strong>Leap Year:</strong> {reverseResult.isLeapYear ? "Yes" : "No"}</p>
                </div>
              </div>
            )}
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Features & Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full text-left font-semibold text-blue-700 mb-2 focus:outline-none"
            >
              {showDetails ? "Hide" : "Show"} Features & Usage
            </button>
            {showDetails && (
              <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
                <li>Calculate day of year and remaining days from a date</li>
                <li>Reverse calculate date from day of year</li>
                <li>Supports multiple date formats (US, UK, French, Japanese)</li>
                <li>Displays week number and leap year status</li>
                <li>Download results as a text file</li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayOfYearCalculator;