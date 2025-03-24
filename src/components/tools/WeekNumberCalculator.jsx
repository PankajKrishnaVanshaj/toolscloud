"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCalendarAlt, FaSync, FaDownload } from "react-icons/fa";

const WeekNumberCalculator = () => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [weekNumber, setWeekNumber] = useState(null);
  const [standard, setStandard] = useState("ISO");
  const [year, setYear] = useState(new Date().getFullYear());
  const [weekDetails, setWeekDetails] = useState({ start: "", end: "" });
  const [error, setError] = useState("");
  const [showYearCalendar, setShowYearCalendar] = useState(true);
  const [weekDays, setWeekDays] = useState([]);

  // Calculate week number
  const calculateWeekNumber = useCallback((inputDate, useISO = true) => {
    const dateObj = new Date(inputDate);
    if (isNaN(dateObj.getTime())) {
      setError("Invalid date");
      return null;
    }

    if (useISO) {
      dateObj.setHours(0, 0, 0, 0);
      const jan1 = new Date(dateObj.getFullYear(), 0, 1);
      const daysOffset = (jan1.getDay() + 6) % 7;
      const firstMonday = new Date(jan1);
      firstMonday.setDate(jan1.getDate() - daysOffset);

      const diffMs = dateObj - firstMonday;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const weekNum = Math.floor(diffDays / 7) + 1;

      if (weekNum < 1) {
        return calculateWeekNumber(new Date(dateObj.getFullYear() - 1, 11, 31), true);
      } else if (weekNum > 52 && dateObj.getMonth() === 11) {
        const nextYearFirstMonday = new Date(dateObj.getFullYear() + 1, 0, 1);
        nextYearFirstMonday.setDate(nextYearFirstMonday.getDate() - ((nextYearFirstMonday.getDay() + 6) % 7));
        if (dateObj >= nextYearFirstMonday) return 1;
      }
      return weekNum;
    } else {
      dateObj.setHours(0, 0, 0, 0);
      const jan1 = new Date(dateObj.getFullYear(), 0, 1);
      const daysOffset = jan1.getDay();
      const firstSunday = new Date(jan1);
      firstSunday.setDate(jan1.getDate() - daysOffset);

      const diffMs = dateObj - firstSunday;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      return Math.floor(diffDays / 7) + 1;
    }
  }, []);

  // Calculate week details including daily breakdown
  const calculateWeekDetails = useCallback((inputDate, useISO) => {
    const dateObj = new Date(inputDate);
    const day = dateObj.getDay();
    const diffToStart = useISO ? (day + 6) % 7 : day;
    const startDate = new Date(dateObj);
    startDate.setDate(dateObj.getDate() - diffToStart);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + i);
      days.push(dayDate.toISOString().slice(0, 10));
    }

    return { start: startDate.toISOString().slice(0, 10), end: endDate.toISOString().slice(0, 10), days };
  }, []);

  // Update calculation
  const updateCalculation = useCallback(() => {
    setError("");
    const weekNum = calculateWeekNumber(date, standard === "ISO");
    if (weekNum !== null) {
      setWeekNumber(weekNum);
      const details = calculateWeekDetails(date, standard === "ISO");
      setWeekDetails({ start: details.start, end: details.end });
      setWeekDays(details.days);
      setYear(new Date(date).getFullYear());
    } else {
      setWeekNumber(null);
      setWeekDetails({ start: "", end: "" });
      setWeekDays([]);
    }
  }, [date, standard, calculateWeekNumber, calculateWeekDetails]);

  useEffect(() => {
    updateCalculation();
  }, [updateCalculation]);

  // Generate year weeks
  const generateYearWeeks = useCallback(() => {
    const weeks = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    let current = new Date(startDate);
    current.setDate(current.getDate() - (standard === "ISO" ? (current.getDay() + 6) % 7 : current.getDay()));

    while (current <= endDate || weeks.length < 53) {
      const weekNum = calculateWeekNumber(current, standard === "ISO");
      const weekStart = new Date(current);
      const weekEnd = new Date(current);
      weekEnd.setDate(weekStart.getDate() + 6);
      weeks.push({
        week: weekNum,
        start: weekStart.toISOString().slice(0, 10),
        end: weekEnd.toISOString().slice(0, 10),
      });
      current.setDate(current.getDate() + 7);
    }
    return weeks;
  }, [year, standard, calculateWeekNumber]);

  // Handlers
  const handleNow = () => setDate(new Date().toISOString().slice(0, 10));
  const reset = () => {
    setDate(new Date().toISOString().slice(0, 10));
    setStandard("ISO");
    setYear(new Date().getFullYear());
    setShowYearCalendar(true);
  };
  const downloadCSV = () => {
    const weeks = generateYearWeeks();
    const csvContent = [
      "Week Number,Start Date,End Date",
      ...weeks.map((w) => `${w.week},${w.start},${w.end}`),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `weeks_${year}_${standard}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Week Number Calculator
        </h1>

        {/* Input Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleNow}
                className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaCalendarAlt />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Standard</label>
            <select
              value={standard}
              onChange={(e) => setStandard(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="ISO">ISO 8601 (Mon start)</option>
              <option value="US">US (Sun start)</option>
            </select>
          </div>
        </div>

        {/* Results Section */}
        {weekNumber && (
          <div className="p-4 bg-gray-50 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">Week Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Week Number:</span> {weekNumber}</p>
                <p><span className="font-medium">Year:</span> {year}</p>
                <p><span className="font-medium">Start:</span> {weekDetails.start}</p>
                <p><span className="font-medium">End:</span> {weekDetails.end}</p>
              </div>
              <div className="text-sm">
                <p className="font-medium mb-1">Days:</p>
                <ul className="list-disc list-inside">
                  {weekDays.map((day, idx) => (
                    <li key={idx}>{new Date(day).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Error Section */}
        {error && (
          <div className="p-4 bg-red-50 rounded-lg mb-6 text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* Year Calendar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-700">Weeks in {year}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setYear((prev) => prev - 1)}
                className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Previous
              </button>
              <button
                onClick={() => setYear((prev) => prev + 1)}
                className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Next
              </button>
              <button
                onClick={() => setShowYearCalendar((prev) => !prev)}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {showYearCalendar ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          {showYearCalendar && (
            <div className="max-h-64 overflow-y-auto bg-gray-50 rounded-lg p-4">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-200">
                  <tr>
                    <th className="p-2">Week</th>
                    <th className="p-2">Start</th>
                    <th className="p-2">End</th>
                  </tr>
                </thead>
                <tbody>
                  {generateYearWeeks().map((week, index) => (
                    <tr
                      key={index}
                      className={week.week === weekNumber && week.start === weekDetails.start ? "bg-blue-100" : ""}
                    >
                      <td className="p-2 text-center">{week.week}</td>
                      <td className="p-2">{week.start}</td>
                      <td className="p-2">{week.end}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
          <button
            onClick={downloadCSV}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download CSV
          </button>
        </div>

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports ISO 8601 and US week numbering</li>
            <li>Shows week start/end dates and daily breakdown</li>
            <li>Interactive year calendar with navigation</li>
            <li>Download year weeks as CSV</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WeekNumberCalculator;