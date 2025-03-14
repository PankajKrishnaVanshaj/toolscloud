"use client";
import React, { useState, useCallback } from "react";
import { FaCalendarAlt, FaSync, FaDownload } from "react-icons/fa";

const BusinessDaysCalculator = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [holidays, setHolidays] = useState("");
  const [workWeek, setWorkWeek] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });
  const [includeStartDate, setIncludeStartDate] = useState(true);
  const [result, setResult] = useState(null);
  const [detailedResults, setDetailedResults] = useState([]);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  // Parse holidays from textarea
  const parseHolidays = useCallback(() => {
    return holidays
      .split("\n")
      .map((date) => date.trim())
      .filter((date) => date)
      .map((date) => new Date(date))
      .filter((date) => !isNaN(date.getTime()));
  }, [holidays]);

  // Check if a date is a business day
  const isBusinessDay = useCallback(
    (date) => {
      const dayOfWeek = date.getDay();
      const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      if (!workWeek[days[dayOfWeek]]) return false;

      const holidayDates = parseHolidays();
      const dateString = date.toISOString().split("T")[0];
      return !holidayDates.some(
        (holiday) => holiday.toISOString().split("T")[0] === dateString
      );
    },
    [workWeek, parseHolidays]
  );

  // Calculate business days
  const calculateBusinessDays = useCallback(() => {
    setError("");
    setResult(null);
    setDetailedResults([]);

    if (!startDate || !endDate) {
      setError("Please enter both start and end dates");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError("Invalid date format");
      return;
    }

    if (start > end) {
      setError("Start date must be before or equal to end date");
      return;
    }

    let businessDays = 0;
    const details = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
      const isBusiness = isBusinessDay(currentDate);
      if (isBusiness && (includeStartDate || currentDate > start)) {
        businessDays++;
      }
      details.push({
        date: new Date(currentDate).toLocaleDateString(),
        isBusinessDay: isBusiness,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setResult(businessDays);
    setDetailedResults(details);
  }, [startDate, endDate, includeStartDate, isBusinessDay]);

  // Handle work week checkbox changes
  const handleWorkWeekChange = (day) => {
    setWorkWeek((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  // Set today's date
  const handleToday = (field) => {
    const today = new Date().toISOString().split("T")[0];
    if (field === "start") setStartDate(today);
    else setEndDate(today);
  };

  // Reset all fields
  const reset = () => {
    setStartDate("");
    setEndDate("");
    setHolidays("");
    setWorkWeek({
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    });
    setIncludeStartDate(true);
    setResult(null);
    setDetailedResults([]);
    setError("");
    setShowDetails(false);
  };

  // Download results as CSV
  const downloadCSV = () => {
    if (!detailedResults.length) return;

    const csvContent = [
      "Date,Is Business Day",
      ...detailedResults.map((item) => `${item.date},${item.isBusinessDay}`),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `business-days-${startDate}-to-${endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Business Days Calculator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {["start", "end"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {field} Date
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={field === "start" ? startDate : endDate}
                      onChange={(e) =>
                        field === "start"
                          ? setStartDate(e.target.value)
                          : setEndDate(e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleToday(field)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <FaCalendarAlt />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Holidays (one per line, e.g., 2025-01-01)
              </label>
              <textarea
                value={holidays}
                onChange={(e) => setHolidays(e.target.value)}
                placeholder="2025-01-01&#10;2025-12-25"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-y"
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Work Week</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                {Object.entries(workWeek).map(([day, enabled]) => (
                  <label key={day} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={() => handleWorkWeekChange(day)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="capitalize">{day}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeStartDate}
                onChange={(e) => setIncludeStartDate(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">Include Start Date in Count</label>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={calculateBusinessDays}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Calculate
              </button>
              <button
                onClick={reset}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Results Section */}
          {result !== null && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Result</h2>
              <p className="text-sm">
                Business Days: <span className="font-medium text-blue-600">{result}</span>
              </p>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="mt-2 px-4 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                {showDetails ? "Hide Details" : "Show Details"}
              </button>
              {showDetails && (
                <div className="mt-4 max-h-64 overflow-y-auto">
                  <table className="w-full text-sm text-gray-700">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-left">Business Day</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailedResults.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{item.date}</td>
                          <td className="p-2">
                            {item.isBusinessDay ? "Yes" : "No"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <button
                onClick={downloadCSV}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download CSV
              </button>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Features Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Calculate business days between dates</li>
              <li>Customizable work week and holidays</li>
              <li>Option to include/exclude start date</li>
              <li>Detailed day-by-day breakdown</li>
              <li>Download results as CSV</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDaysCalculator;