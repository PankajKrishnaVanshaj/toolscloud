"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo } from "react-icons/fa";

const RandomDateGenerator = () => {
  const [dates, setDates] = useState([]);
  const [count, setCount] = useState(10);
  const [startDate, setStartDate] = useState("2020-01-01");
  const [endDate, setEndDate] = useState("2025-12-31");
  const [format, setFormat] = useState("YYYY-MM-DD");
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    separator: "\n",         // Output separator
    ensureUnique: false,     // Ensure unique dates
    includeTime: false,      // Include time in basic formats
  });

  // Helper function to format date
  const formatDate = (date, fmt) => {
    const pad = (num) => String(num).padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    let baseFormat = fmt;
    if (options.includeTime && !["ISO", "YYYY-MM-DD HH:mm:ss"].includes(fmt)) {
      baseFormat += " HH:mm:ss";
    }

    switch (baseFormat) {
      case "YYYY-MM-DD":
        return `${year}-${month}-${day}`;
      case "DD/MM/YYYY":
        return `${day}/${month}/${year}`;
      case "MM-DD-YYYY":
        return `${month}-${day}-${year}`;
      case "YYYY-MM-DD HH:mm:ss":
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      case "DD/MM/YYYY HH:mm:ss":
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
      case "MM-DD-YYYY HH:mm:ss":
        return `${month}-${day}-${year} ${hours}:${minutes}:${seconds}`;
      case "ISO":
        return date.toISOString();
      default:
        return `${year}-${month}-${day}`;
    }
  };

  // Generate random date between start and end
  const generateRandomDate = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) return null; // Invalid range
    const timeDiff = end.getTime() - start.getTime();
    const randomTime = start.getTime() + Math.random() * timeDiff;
    return new Date(randomTime);
  };

  // Generate dates with options
  const generateDates = useCallback(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      alert("Start date must be before end date!");
      return;
    }

    const maxPossibleDates = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const effectiveCount = options.ensureUnique ? Math.min(count, maxPossibleDates) : count;

    const newDatesSet = options.ensureUnique ? new Set() : null;
    const newDates = [];

    while (newDates.length < Math.min(effectiveCount, 1000)) {
      const randomDate = generateRandomDate();
      const formattedDate = formatDate(randomDate, format);
      if (options.ensureUnique) {
        if (!newDatesSet.has(formattedDate)) {
          newDatesSet.add(formattedDate);
          newDates.push(formattedDate);
        }
      } else {
        newDates.push(formattedDate);
      }
    }

    setDates(newDates);
    setHistory((prev) => [
      ...prev,
      { dates: newDates, count, startDate, endDate, format, options },
    ].slice(-5));
    setIsCopied(false);
  }, [count, startDate, endDate, format, options]);

  // Copy to clipboard
  const copyToClipboard = () => {
    const text = dates.join(options.separator);
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  // Download as text
  const downloadAsText = () => {
    const text = dates.join(options.separator);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dates-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Clear dates
  const clearDates = () => {
    setDates([]);
    setIsCopied(false);
  };

  // Restore from history
  const restoreFromHistory = (entry) => {
    setDates(entry.dates);
    setCount(entry.count);
    setStartDate(entry.startDate);
    setEndDate(entry.endDate);
    setFormat(entry.format);
    setOptions(entry.options);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">
          Advanced Random Date Generator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Dates (1-1000)
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD (2023-05-15)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (15/05/2023)</option>
                <option value="MM-DD-YYYY">MM-DD-YYYY (05-15-2023)</option>
                <option value="YYYY-MM-DD HH:mm:ss">YYYY-MM-DD HH:mm:ss (2023-05-15 14:30:45)</option>
                <option value="DD/MM/YYYY HH:mm:ss">DD/MM/YYYY HH:mm:ss (15/05/2023 14:30:45)</option>
                <option value="MM-DD-YYYY HH:mm:ss">MM-DD-YYYY HH:mm:ss (05-15-2023 14:30:45)</option>
                <option value="ISO">ISO (2023-05-15T14:30:45.000Z)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  const newStart = e.target.value;
                  setStartDate(newStart);
                  if (new Date(newStart) > new Date(endDate)) setEndDate(newStart);
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  const newEnd = e.target.value;
                  setEndDate(newEnd);
                  if (new Date(newEnd) < new Date(startDate)) setStartDate(newEnd);
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Advanced Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Advanced Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Output Separator:</label>
                <select
                  value={options.separator}
                  onChange={(e) => setOptions((prev) => ({ ...prev, separator: e.target.value }))}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="\n">Newline</option>
                  <option value=", ">Comma</option>
                  <option value=" ">Space</option>
                  <option value="; ">Semicolon</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.ensureUnique}
                  onChange={() => setOptions((prev) => ({ ...prev, ensureUnique: !prev.ensureUnique }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">Ensure Unique Dates</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeTime}
                  onChange={() => setOptions((prev) => ({ ...prev, includeTime: !prev.includeTime }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">Include Time (if not ISO)</label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateDates}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaDownload className="mr-2" />
              Generate Dates
            </button>
            {dates.length > 0 && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors font-medium flex items-center justify-center ${
                    isCopied
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" />
                  {isCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={downloadAsText}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
                <button
                  onClick={clearDates}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>

          {/* Generated Dates */}
          {dates.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 text-center">
                Generated Dates ({dates.length}):
              </h2>
              <div className="mt-3 text-gray-700 whitespace-pre-wrap break-all max-h-64 overflow-y-auto font-mono">
                {dates.join(options.separator)}
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold text-gray-700 flex items-center">
                <FaHistory className="mr-2" /> Recent Generations (Last 5)
              </h3>
              <ul className="mt-2 text-sm text-gray-600 space-y-2">
                {history.slice().reverse().map((entry, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>
                      {entry.dates.length} dates ({entry.startDate} to {entry.endDate})
                    </span>
                    <button
                      onClick={() => restoreFromHistory(entry)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <FaUndo />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Features Info */}
          <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
            <h3 className="font-semibold text-blue-700">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm">
              <li>Generate random dates within a custom range</li>
              <li>Multiple date formats with optional time</li>
              <li>Custom output separators and unique date option</li>
              <li>Copy, download, and track history</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RandomDateGenerator;