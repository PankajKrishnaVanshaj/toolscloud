"use client";
import React, { useState, useCallback } from "react";
import { FaPlus, FaTrash, FaDownload, FaSync } from "react-icons/fa";

const WorkHoursCalculator = () => {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [breakDuration, setBreakDuration] = useState("00:00");
  const [hourlyRate, setHourlyRate] = useState("");
  const [overtimeRate, setOvertimeRate] = useState("");
  const [overtimeThreshold, setOvertimeThreshold] = useState("8");
  const [multiDayEntries, setMultiDayEntries] = useState([{ start: "", end: "", break: "00:00" }]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [currency, setCurrency] = useState("$"); // New: Currency selection
  const [taxRate, setTaxRate] = useState(""); // New: Tax rate for net pay

  // Parse time to minutes
  const parseTime = (timeStr) => {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Format minutes to HH:MM
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  // Calculate hours and pay
  const calculateHours = useCallback(() => {
    setError("");
    setResult(null);

    let totalMinutes = 0;
    const entries =
      multiDayEntries.length > 1
        ? multiDayEntries
        : [{ start: startTime, end: endTime, break: breakDuration }];

    for (const entry of entries) {
      const start = parseTime(entry.start);
      const end = parseTime(entry.end);
      const breakMins = parseTime(entry.break);

      if (start === null || end === null || breakMins === null) {
        setError("Please enter valid times for all fields");
        return;
      }
      if (end <= start) {
        setError("End time must be after start time");
        return;
      }

      totalMinutes += end - start - breakMins;
    }

    if (totalMinutes < 0) {
      setError("Total time cannot be negative");
      return;
    }

    const totalHours = totalMinutes / 60;
    const regularHours = Math.min(totalHours, Number(overtimeThreshold) || 8);
    const overtimeHours = Math.max(0, totalHours - (Number(overtimeThreshold) || 8));
    const regularPay = hourlyRate ? regularHours * Number(hourlyRate) : null;
    const overtimePay = overtimeRate && overtimeHours ? overtimeHours * Number(overtimeRate) : null;
    const grossPay = regularPay && overtimePay ? regularPay + overtimePay : regularPay || null;
    const taxAmount = grossPay && taxRate ? (grossPay * Number(taxRate)) / 100 : null;
    const netPay = taxAmount !== null ? grossPay - taxAmount : null;

    setResult({
      totalHours,
      totalTimeFormatted: formatTime(totalMinutes),
      regularHours,
      overtimeHours,
      regularPay,
      overtimePay,
      grossPay,
      taxAmount,
      netPay,
      entries: entries.map((entry) => ({
        start: entry.start,
        end: entry.end,
        break: entry.break,
        duration: formatTime(parseTime(entry.end) - parseTime(entry.start) - parseTime(entry.break)),
      })),
    });
  }, [
    startTime,
    endTime,
    breakDuration,
    hourlyRate,
    overtimeRate,
    overtimeThreshold,
    multiDayEntries,
    taxRate,
  ]);

  // Add a new day entry
  const addDay = () => {
    setMultiDayEntries([...multiDayEntries, { start: "", end: "", break: "00:00" }]);
  };

  // Remove a day entry
  const removeDay = (index) => {
    if (multiDayEntries.length > 1) {
      setMultiDayEntries(multiDayEntries.filter((_, i) => i !== index));
    }
  };

  // Update a day entry
  const updateDay = (index, field, value) => {
    const newEntries = [...multiDayEntries];
    newEntries[index][field] = value;
    setMultiDayEntries(newEntries);
  };

  // Reset all fields
  const reset = () => {
    setStartTime("");
    setEndTime("");
    setBreakDuration("00:00");
    setHourlyRate("");
    setOvertimeRate("");
    setOvertimeThreshold("8");
    setMultiDayEntries([{ start: "", end: "", break: "00:00" }]);
    setResult(null);
    setError("");
    setCurrency("$");
    setTaxRate("");
  };

  // Download results as text file
  const downloadResults = () => {
    if (!result) return;
    const textContent = `
Work Hours Calculation Results
-----------------------------
Total Hours: ${result.totalHours.toFixed(2)} (${result.totalTimeFormatted})
Regular Hours: ${result.regularHours.toFixed(2)}
Overtime Hours: ${result.overtimeHours.toFixed(2)}
${result.regularPay ? `Regular Pay: ${currency}${result.regularPay.toFixed(2)}` : ""}
${result.overtimePay ? `Overtime Pay: ${currency}${result.overtimePay.toFixed(2)}` : ""}
${result.grossPay ? `Gross Pay: ${currency}${result.grossPay.toFixed(2)}` : ""}
${result.taxAmount ? `Tax (${taxRate}%): ${currency}${result.taxAmount.toFixed(2)}` : ""}
${result.netPay ? `Net Pay: ${currency}${result.netPay.toFixed(2)}` : ""}
${
  multiDayEntries.length > 1
    ? `
Daily Breakdown:
${result.entries
  .map(
    (e, i) =>
      `Day ${i + 1}: Start: ${e.start}, End: ${e.end}, Break: ${e.break}, Duration: ${e.duration}`
  )
  .join("\n")}`
    : ""
}
    `.trim();
    const blob = new Blob([textContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `work-hours-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Work Hours Calculator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="space-y-4">
            {multiDayEntries.map((entry, index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end bg-gray-50 p-4 rounded-lg"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="time"
                    value={index === 0 ? startTime : entry.start}
                    onChange={(e) =>
                      index === 0 ? setStartTime(e.target.value) : updateDay(index, "start", e.target.value)
                    }
                    className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="time"
                    value={index === 0 ? endTime : entry.end}
                    onChange={(e) =>
                      index === 0 ? setEndTime(e.target.value) : updateDay(index, "end", e.target.value)
                    }
                    className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Break (HH:MM)</label>
                  <input
                    type="time"
                    value={index === 0 ? breakDuration : entry.break}
                    onChange={(e) =>
                      index === 0
                        ? setBreakDuration(e.target.value)
                        : updateDay(index, "break", e.target.value)
                    }
                    className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {multiDayEntries.length > 1 && (
                  <button
                    onClick={() => removeDay(index)}
                    className="mt-1 p-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addDay}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <FaPlus /> Add Day
            </button>
          </div>

          {/* Rate Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Hourly Rate</label>
              <div className="mt-1 flex items-center">
                <span className="p-2 bg-gray-200 rounded-l-md">{currency}</span>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="20.00"
                  className="w-full p-2 border rounded-r-md focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Overtime Rate</label>
              <div className="mt-1 flex items-center">
                <span className="p-2 bg-gray-200 rounded-l-md">{currency}</span>
                <input
                  type="number"
                  value={overtimeRate}
                  onChange={(e) => setOvertimeRate(e.target.value)}
                  placeholder="30.00"
                  className="w-full p-2 border rounded-r-md focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Overtime Threshold</label>
              <input
                type="number"
                value={overtimeThreshold}
                onChange={(e) => setOvertimeThreshold(e.target.value)}
                placeholder="8"
                className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                step="0.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder="10"
                className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="mt-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="$">$ (USD)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
                <option value="¥">¥ (JPY)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateHours}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Calculate
            </button>
            <button
              onClick={downloadResults}
              disabled={!result}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results Section */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">Results</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p>Total Hours: {result.totalHours.toFixed(2)} ({result.totalTimeFormatted})</p>
                  <p>Regular Hours: {result.regularHours.toFixed(2)}</p>
                  <p>Overtime Hours: {result.overtimeHours.toFixed(2)}</p>
                </div>
                <div>
                  {result.regularPay && (
                    <p>Regular Pay: {currency}{result.regularPay.toFixed(2)}</p>
                  )}
                  {result.overtimePay && (
                    <p>Overtime Pay: {currency}{result.overtimePay.toFixed(2)}</p>
                  )}
                  {result.grossPay && (
                    <p>Gross Pay: {currency}{result.grossPay.toFixed(2)}</p>
                  )}
                  {result.taxAmount && (
                    <p>Tax ({taxRate}%): {currency}{result.taxAmount.toFixed(2)}</p>
                  )}
                  {result.netPay && (
                    <p className="font-semibold">Net Pay: {currency}{result.netPay.toFixed(2)}</p>
                  )}
                </div>
                {multiDayEntries.length > 1 && (
                  <div className="col-span-full">
                    <h3 className="font-medium mt-2">Daily Breakdown</h3>
                    <ul className="list-disc list-inside text-sm">
                      {result.entries.map((entry, index) => (
                        <li key={index}>
                          Day {index + 1}: Start: {entry.start}, End: {entry.end}, Break: {entry.break}, Duration: {entry.duration}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Features Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Multi-day work hour tracking</li>
              <li>Break time deduction</li>
              <li>Overtime calculation with custom threshold</li>
              <li>Pay calculation with tax deduction</li>
              <li>Multiple currency support</li>
              <li>Download results as text file</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkHoursCalculator;