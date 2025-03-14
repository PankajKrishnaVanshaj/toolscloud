"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaPlus, FaTrash, FaSync, FaDownload } from "react-icons/fa";
import { CSVLink } from "react-csv"; // For exporting data

const TimeCardCalculator = () => {
  const [entries, setEntries] = useState([{ date: "", start: "", end: "", breakMins: "" }]);
  const [hourlyRate, setHourlyRate] = useState(15.0);
  const [overtimeThreshold, setOvertimeThreshold] = useState(40);
  const [overtimeMultiplier, setOvertimeMultiplier] = useState(1.5);
  const [taxRate, setTaxRate] = useState(0); // New: Tax percentage
  const [results, setResults] = useState({
    totalHours: 0,
    regularHours: 0,
    overtimeHours: 0,
    totalPay: 0,
    regularPay: 0,
    overtimePay: 0,
    netPay: 0,
  });
  const [currency, setCurrency] = useState("USD"); // New: Currency selection

  // Calculate hours for an entry
  const calculateHours = useCallback((start, end, breakMins) => {
    if (!start || !end) return 0;
    const startDate = new Date(`2000-01-01T${start}`);
    let endDate = new Date(`2000-01-01T${end}`);
    if (endDate < startDate) endDate.setDate(endDate.getDate() + 1); // Handle overnight shifts
    const diffMs = endDate - startDate - (breakMins * 60 * 1000 || 0);
    return Math.max(diffMs / (1000 * 60 * 60), 0); // Convert to hours, ensure non-negative
  }, []);

  // Calculate all results
  const calculateResults = useCallback(() => {
    let totalHours = 0;
    entries.forEach((entry) => {
      totalHours += calculateHours(entry.start, entry.end, entry.breakMins);
    });

    const regularHours = Math.min(totalHours, overtimeThreshold);
    const overtimeHours = Math.max(totalHours - overtimeThreshold, 0);
    const regularPay = regularHours * hourlyRate;
    const overtimePay = overtimeHours * hourlyRate * overtimeMultiplier;
    const totalPay = regularPay + overtimePay;
    const taxAmount = totalPay * (taxRate / 100);
    const netPay = totalPay - taxAmount;

    setResults({
      totalHours,
      regularHours,
      overtimeHours,
      totalPay,
      regularPay,
      overtimePay,
      netPay,
    });
  }, [entries, hourlyRate, overtimeThreshold, overtimeMultiplier, taxRate]);

  useEffect(() => {
    calculateResults();
  }, [calculateResults]);

  // Add a new entry
  const addEntry = () => {
    setEntries([...entries, { date: "", start: "", end: "", breakMins: "" }]);
  };

  // Remove an entry
  const removeEntry = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  // Update an entry field
  const updateEntry = (index, field, value) => {
    const newEntries = [...entries];
    newEntries[index][field] = value;
    setEntries(newEntries);
  };

  // Reset everything
  const reset = () => {
    setEntries([{ date: "", start: "", end: "", breakMins: "" }]);
    setHourlyRate(15.0);
    setOvertimeThreshold(40);
    setOvertimeMultiplier(1.5);
    setTaxRate(0);
    setCurrency("USD");
  };

  // Prepare CSV data
  const csvData = [
    ["Date", "Start Time", "End Time", "Break (mins)", "Hours Worked"],
    ...entries.map((entry) => [
      entry.date,
      entry.start,
      entry.end,
      entry.breakMins,
      calculateHours(entry.start, entry.end, entry.breakMins).toFixed(2),
    ]),
    [],
    [
      "Total Hours",
      "Regular Hours",
      "Overtime Hours",
      "Total Pay",
      "Regular Pay",
      "Overtime Pay",
      "Tax Rate",
      "Net Pay",
    ],
    [
      results.totalHours.toFixed(2),
      results.regularHours.toFixed(2),
      results.overtimeHours.toFixed(2),
      results.totalPay.toFixed(2),
      results.regularPay.toFixed(2),
      results.overtimePay.toFixed(2),
      `${taxRate}%`,
      results.netPay.toFixed(2),
    ],
  ];

  // Currency symbol mapping
  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };

  const formatCurrency = (amount) =>
    `${currencySymbols[currency] || "$"}${amount.toFixed(2)}`;

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Time Card Calculator
        </h1>

        <div className="space-y-6">
          {/* Settings Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hourly Rate
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  {currencySymbols[currency] || "$"}
                </span>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Overtime Threshold (hrs)
              </label>
              <input
                type="number"
                value={overtimeThreshold}
                onChange={(e) => setOvertimeThreshold(parseInt(e.target.value) || 0)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Overtime Multiplier
              </label>
              <input
                type="number"
                value={overtimeMultiplier}
                onChange={(e) => setOvertimeMultiplier(parseFloat(e.target.value) || 1)}
                min="1"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
          </div>

          {/* Time Entries */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Time Entries</h2>
            <div className="space-y-4 max-h-[50vh] overflow-y-auto">
              {entries.map((entry, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="date"
                      value={entry.date}
                      onChange={(e) => updateEntry(index, "date", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={entry.start}
                      onChange={(e) => updateEntry(index, "start", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={entry.end}
                      onChange={(e) => updateEntry(index, "end", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Break (mins)
                    </label>
                    <input
                      type="number"
                      value={entry.breakMins}
                      onChange={(e) => updateEntry(index, "breakMins", e.target.value)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => removeEntry(index)}
                    disabled={entries.length === 1}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addEntry}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center"
            >
              <FaPlus className="mr-2" /> Add Entry
            </button>
          </div>

          {/* Results Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p>
                  <span className="font-medium">Total Hours:</span>{" "}
                  {results.totalHours.toFixed(2)}
                </p>
                <p>
                  <span className="font-medium">Regular Hours:</span>{" "}
                  {results.regularHours.toFixed(2)}
                </p>
                <p>
                  <span className="font-medium">Overtime Hours:</span>{" "}
                  {results.overtimeHours.toFixed(2)}
                </p>
              </div>
              <div>
                <p>
                  <span className="font-medium">Total Pay:</span>{" "}
                  {formatCurrency(results.totalPay)}
                </p>
                <p>
                  <span className="font-medium">Regular Pay:</span>{" "}
                  {formatCurrency(results.regularPay)}
                </p>
                <p>
                  <span className="font-medium">Overtime Pay:</span>{" "}
                  {formatCurrency(results.overtimePay)}
                </p>
                <p>
                  <span className="font-medium">Net Pay (after {taxRate}% tax):</span>{" "}
                  {formatCurrency(results.netPay)}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <CSVLink
              data={csvData}
              filename={`timecard-${Date.now()}.csv`}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center text-center"
            >
              <FaDownload className="mr-2" /> Export to CSV
            </CSVLink>
          </div>

          {/* Features Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Calculate hours across multiple days with overnight shift support</li>
              <li>Customizable hourly rate, overtime rules, and tax rate</li>
              <li>Multiple currency options</li>
              <li>Break time accounting</li>
              <li>Net pay calculation with tax deduction</li>
              <li>Export results to CSV</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeCardCalculator;