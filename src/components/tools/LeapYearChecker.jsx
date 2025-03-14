"use client";
import React, { useState, useCallback } from "react";
import { FaCheck, FaTimes, FaDownload, FaSync } from "react-icons/fa";

const LeapYearChecker = () => {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [bulkYears, setBulkYears] = useState("");
  const [result, setResult] = useState("");
  const [bulkResults, setBulkResults] = useState([]);
  const [upcomingLeapYears, setUpcomingLeapYears] = useState([]);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [rangeResults, setRangeResults] = useState([]);

  const isLeapYear = useCallback((year) => {
    const numYear = parseInt(year);
    if (isNaN(numYear) || numYear < 1) return null;
    return (numYear % 4 === 0 && numYear % 100 !== 0) || (numYear % 400 === 0);
  }, []);

  // Single Year Check
  const checkSingleYear = () => {
    const leap = isLeapYear(year);
    setResult(
      leap === null
        ? "Please enter a valid year (positive integer)"
        : `${year} is ${leap ? "" : "not "}a leap year`
    );
  };

  // Bulk Year Check
  const checkBulkYears = () => {
    const years = bulkYears
      .split(/[\n, ]+/)
      .map((y) => y.trim())
      .filter((y) => y);
    const results = years.map((y) => ({
      year: y,
      isValid: isLeapYear(y) !== null,
      isLeap: isLeapYear(y),
    }));
    setBulkResults(results);
  };

  // Range Check
  const checkRangeYears = () => {
    const start = parseInt(rangeStart);
    const end = parseInt(rangeEnd);
    if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
      setRangeResults([{ error: "Please enter a valid range (start ≤ end, positive integers)" }]);
      return;
    }
    const results = [];
    for (let y = start; y <= end; y++) {
      const leap = isLeapYear(y);
      if (leap) results.push(y);
    }
    setRangeResults(results);
  };

  // Upcoming Leap Years
  const getUpcomingLeapYears = () => {
    const currentYear = new Date().getFullYear();
    const upcoming = [];
    let yearToCheck = currentYear;
    while (upcoming.length < 10) {
      if (isLeapYear(yearToCheck)) {
        upcoming.push(yearToCheck);
      }
      yearToCheck++;
    }
    setUpcomingLeapYears(upcoming);
  };

  // Download Results as CSV
  const downloadCSV = (data, filename) => {
    const csvContent = "data:text/csv;charset=utf-8," + data.map(row => row.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportBulkResults = () => {
    const headers = ["Year", "Is Leap Year"];
    const rows = bulkResults.map(res => [res.year, res.isValid && res.isLeap ? "Yes" : "No"]);
    downloadCSV([headers, ...rows], "bulk-leap-years");
  };

  const exportRangeResults = () => {
    const headers = ["Leap Years in Range"];
    const rows = rangeResults.length > 0 && !rangeResults[0].error ? rangeResults.map(y => [y]) : [["No leap years found"]];
    downloadCSV([headers, ...rows], "range-leap-years");
  };

  // Reset All
  const resetAll = () => {
    setYear(new Date().getFullYear().toString());
    setBulkYears("");
    setRangeStart("");
    setRangeEnd("");
    setResult("");
    setBulkResults([]);
    setRangeResults([]);
    setUpcomingLeapYears([]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Leap Year Checker
        </h1>

        <div className="grid gap-8">
          {/* Single Year Check */}
          <div className="grid gap-4">
            <h2 className="text-lg font-semibold text-gray-700">Single Year Check</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Enter a year"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={checkSingleYear}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Check
              </button>
            </div>
            {result && (
              <p
                className={`text-sm flex items-center gap-2 ${
                  result.includes("not") || result.includes("valid")
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {result.includes("valid") ? <FaTimes /> : result.includes("not") ? <FaTimes /> : <FaCheck />}
                {result}
              </p>
            )}
          </div>

          {/* Bulk Year Check */}
          <div className="grid gap-4">
            <h2 className="text-lg font-semibold text-gray-700">Bulk Year Check</h2>
            <textarea
              value={bulkYears}
              onChange={(e) => setBulkYears(e.target.value)}
              placeholder="Enter years (comma, space, or newline separated)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-y"
            />
            <div className="flex gap-2">
              <button
                onClick={checkBulkYears}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Check Bulk
              </button>
              {bulkResults.length > 0 && (
                <button
                  onClick={exportBulkResults}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Export CSV
                </button>
              )}
            </div>
            {bulkResults.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-md max-h-48 overflow-auto">
                <h3 className="text-sm font-medium mb-2">Results:</h3>
                <ul className="list-none text-sm space-y-1">
                  {bulkResults.map((res, index) => (
                    <li
                      key={index}
                      className={`flex items-center gap-2 ${
                        res.isValid ? (res.isLeap ? "text-green-600" : "text-gray-600") : "text-red-600"
                      }`}
                    >
                      {res.isValid ? (res.isLeap ? <FaCheck /> : <FaTimes />) : <FaTimes />}
                      {res.year}: {res.isValid ? (res.isLeap ? "Leap Year" : "Not a Leap Year") : "Invalid"}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Range Check */}
          <div className="grid gap-4">
            <h2 className="text-lg font-semibold text-gray-700">Range Check</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="number"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                placeholder="Start Year"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                placeholder="End Year"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={checkRangeYears}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Check Range
              </button>
              {rangeResults.length > 0 && !rangeResults[0]?.error && (
                <button
                  onClick={exportRangeResults}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Export CSV
                </button>
              )}
            </div>
            {rangeResults.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-md max-h-48 overflow-auto">
                <h3 className="text-sm font-medium mb-2">Leap Years in Range:</h3>
                {rangeResults[0]?.error ? (
                  <p className="text-sm text-red-600">{rangeResults[0].error}</p>
                ) : (
                  <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-green-600">
                    {rangeResults.map((yr, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <FaCheck /> {yr}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Upcoming Leap Years */}
          <div className="grid gap-4">
            <h2 className="text-lg font-semibold text-gray-700">Upcoming Leap Years</h2>
            <button
              onClick={getUpcomingLeapYears}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Show Next 10 Leap Years
            </button>
            {upcomingLeapYears.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium mb-2">Next 10 Leap Years:</h3>
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-green-600">
                  {upcomingLeapYears.map((yr, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <FaCheck /> {yr}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={resetAll}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
          >
            <FaSync className="mr-2" /> Reset All
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Rules</h3>
          <details className="text-sm text-blue-600">
            <summary className="cursor-pointer font-medium">Show Details</summary>
            <div className="mt-2">
              <p>A year is a leap year if:</p>
              <ul className="list-disc list-inside">
                <li>It is divisible by 4 AND</li>
                <li>It is NOT divisible by 100, OR it is divisible by 400</li>
              </ul>
              <p className="mt-2">Features:</p>
              <ul className="list-disc list-inside">
                <li>Check single years with instant feedback</li>
                <li>Bulk check multiple years (comma, space, or newline separated)</li>
                <li>Range check for leap years between two years</li>
                <li>View upcoming leap years</li>
                <li>Export bulk and range results as CSV</li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default LeapYearChecker;