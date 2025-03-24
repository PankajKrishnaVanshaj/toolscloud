"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaSync, FaCalendarAlt } from "react-icons/fa";

const FiscalYearCalculator = () => {
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [fiscalStartMonth, setFiscalStartMonth] = useState(4); // Default to April
  const [fiscalYearFormat, setFiscalYearFormat] = useState("single");
  const [customFormat, setCustomFormat] = useState("FY{year}");
  const [includeQuarters, setIncludeQuarters] = useState(true);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const calculateFiscalYear = useCallback(() => {
    const date = new Date(startDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    let fiscalYearStart, fiscalYearEnd, fiscalYear;
    if (month >= fiscalStartMonth) {
      fiscalYearStart = new Date(year, fiscalStartMonth - 1, 1);
      fiscalYearEnd = new Date(year + 1, fiscalStartMonth - 1, 0);
      fiscalYear = year;
    } else {
      fiscalYearStart = new Date(year - 1, fiscalStartMonth - 1, 1);
      fiscalYearEnd = new Date(year, fiscalStartMonth - 1, 0);
      fiscalYear = year - 1;
    }

    const fiscalQuarter = Math.ceil(((month - fiscalStartMonth + 12) % 12 + 1) / 3) || 4;
    const daysInFiscalYear = Math.ceil(
      (fiscalYearEnd - fiscalYearStart) / (1000 * 60 * 60 * 24)
    ) + 1;

    let fiscalYearString;
    switch (fiscalYearFormat) {
      case "single":
        fiscalYearString = `FY${fiscalYear + 1}`;
        break;
      case "split":
        fiscalYearString = `FY${fiscalYear}-${(fiscalYear + 1) % 100}`;
        break;
      case "custom":
        fiscalYearString = customFormat
          .replace("{year}", fiscalYear + 1)
          .replace("{startYear}", fiscalYear)
          .replace("{endYear}", fiscalYear + 1);
        break;
      default:
        fiscalYearString = `FY${fiscalYear + 1}`;
    }

    const quarterDates = includeQuarters
      ? [
          {
            quarter: "Q1",
            start: fiscalYearStart.toISOString().slice(0, 10),
            end: new Date(fiscalYearStart.getFullYear(), fiscalYearStart.getMonth() + 3, 0)
              .toISOString()
              .slice(0, 10),
          },
          {
            quarter: "Q2",
            start: new Date(fiscalYearStart.getFullYear(), fiscalYearStart.getMonth() + 3, 1)
              .toISOString()
              .slice(0, 10),
            end: new Date(fiscalYearStart.getFullYear(), fiscalYearStart.getMonth() + 6, 0)
              .toISOString()
              .slice(0, 10),
          },
          {
            quarter: "Q3",
            start: new Date(fiscalYearStart.getFullYear(), fiscalYearStart.getMonth() + 6, 1)
              .toISOString()
              .slice(0, 10),
            end: new Date(fiscalYearStart.getFullYear(), fiscalYearStart.getMonth() + 9, 0)
              .toISOString()
              .slice(0, 10),
          },
          {
            quarter: "Q4",
            start: new Date(fiscalYearStart.getFullYear(), fiscalYearStart.getMonth() + 9, 1)
              .toISOString()
              .slice(0, 10),
            end: fiscalYearEnd.toISOString().slice(0, 10),
          },
        ]
      : [];

    const newResult = {
      fiscalYear: fiscalYearString,
      startDate: fiscalYearStart.toISOString().slice(0, 10),
      endDate: fiscalYearEnd.toISOString().slice(0, 10),
      quarter: `Q${fiscalQuarter}`,
      daysInFiscalYear,
      quarters: quarterDates,
    };

    setResult(newResult);
    setHistory((prev) => [...prev, newResult].slice(-10)); // Keep last 10 calculations
  }, [startDate, fiscalStartMonth, fiscalYearFormat, customFormat, includeQuarters]);

  const handleCalculate = () => {
    try {
      calculateFiscalYear();
    } catch (err) {
      setResult(null);
      console.error("Calculation error:", err);
    }
  };

  const handleExport = (format = "json") => {
    if (!result) return;

    let content, type, extension;
    if (format === "json") {
      content = JSON.stringify(result, null, 2);
      type = "application/json";
      extension = "json";
    } else if (format === "csv") {
      const csvRows = [
        "Fiscal Year,Start Date,End Date,Quarter,Days in Fiscal Year",
        `${result.fiscalYear},${result.startDate},${result.endDate},${result.quarter},${result.daysInFiscalYear}`,
      ];
      if (result.quarters.length) {
        csvRows.push("\nQuarter,Start Date,End Date");
        result.quarters.forEach((q) =>
          csvRows.push(`${q.quarter},${q.start},${q.end}`)
        );
      }
      content = csvRows.join("\n");
      type = "text/csv";
      extension = "csv";
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fiscal_year_${startDate}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setStartDate(new Date().toISOString().slice(0, 10));
    setFiscalStartMonth(4);
    setFiscalYearFormat("single");
    setCustomFormat("FY{year}");
    setIncludeQuarters(true);
    setResult(null);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Fiscal Year Calculator
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fiscal Year Start Month
              </label>
              <select
                value={fiscalStartMonth}
                onChange={(e) => setFiscalStartMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fiscal Year Format
              </label>
              <select
                value={fiscalYearFormat}
                onChange={(e) => setFiscalYearFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="single">Single Year (e.g., FY2025)</option>
                <option value="split">Split Year (e.g., FY2024-25)</option>
                <option value="custom">Custom Format</option>
              </select>
            </div>

            {fiscalYearFormat === "custom" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Format
                </label>
                <input
                  type="text"
                  value={customFormat}
                  onChange={(e) => setCustomFormat(e.target.value)}
                  placeholder="e.g., FY{year}, {startYear}-{endYear}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {"{year}"} for end year, {"{startYear}"} for start year, {"{endYear}"} for
                  end year
                </p>
              </div>
            )}

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeQuarters}
                  onChange={(e) => setIncludeQuarters(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Include Quarter Details</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleCalculate}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaCalendarAlt className="mr-2" /> Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results Section */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Fiscal Year Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Fiscal Year:</span> {result.fiscalYear}
                </p>
                <p>
                  <span className="font-medium">Start Date:</span> {result.startDate}
                </p>
                <p>
                  <span className="font-medium">End Date:</span> {result.endDate}
                </p>
                <p>
                  <span className="font-medium">Quarter:</span> {result.quarter}
                </p>
                <p>
                  <span className="font-medium">Days in Fiscal Year:</span>{" "}
                  {result.daysInFiscalYear}
                </p>
              </div>
              {includeQuarters && result.quarters.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-md font-semibold text-gray-700 mb-2">Quarter Breakdown</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                    {result.quarters.map((q, index) => (
                      <div key={index} className="p-2 bg-white rounded-md shadow-sm">
                        <p>
                          <span className="font-medium">{q.quarter}:</span>
                        </p>
                        <p>Start: {q.start}</p>
                        <p>End: {q.end}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleExport("json")}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Export JSON
                </button>
                <button
                  onClick={() => handleExport("csv")}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Export CSV
                </button>
              </div>
            </div>
          )}

          {/* History Section */}
          {history.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-700 mb-2">Calculation History</h3>
              <ul className="space-y-2 text-sm text-blue-600 max-h-48 overflow-y-auto">
                {history.slice().reverse().map((item, index) => (
                  <li
                    key={index}
                    className="p-2 bg-white rounded-md shadow-sm hover:bg-blue-100 transition-colors"
                  >
                    {item.fiscalYear} ({item.startDate} - {item.endDate})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Features Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Flexible fiscal year start month</li>
              <li>Multiple format options (Single, Split, Custom)</li>
              <li>Quarter calculation with detailed breakdown</li>
              <li>Export results as JSON or CSV</li>
              <li>Calculation history tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiscalYearCalculator;