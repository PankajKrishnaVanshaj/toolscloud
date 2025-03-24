"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync, FaCalendarAlt } from "react-icons/fa";

const DateToTimestamp = () => {
  const [dateInput, setDateInput] = useState("");
  const [timestampSeconds, setTimestampSeconds] = useState("");
  const [timestampMilliseconds, setTimestampMilliseconds] = useState("");
  const [humanReadableDate, setHumanReadableDate] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [format, setFormat] = useState("datetime-local");

  // Handle date input change
  const handleDateChange = useCallback(
    (e) => {
      const selectedDate = e.target.value;
      setDateInput(selectedDate);

      if (selectedDate) {
        let dateObj;
        if (format === "custom") {
          dateObj = new Date(selectedDate);
        } else {
          dateObj = new Date(selectedDate);
        }

        if (isNaN(dateObj.getTime())) {
          alert("Invalid date format. Please enter a valid date and time.");
          resetOutputs();
          return;
        }

        const time = dateObj.getTime();
        setTimestampSeconds(Math.floor(time / 1000));
        setTimestampMilliseconds(time);
        setHumanReadableDate(
          dateObj.toLocaleString("en-US", { timeZone: timezone })
        );
      } else {
        resetOutputs();
      }
    },
    [timezone, format]
  );

  // Reset output fields
  const resetOutputs = () => {
    setTimestampSeconds("");
    setTimestampMilliseconds("");
    setHumanReadableDate("");
  };

  // Reset everything
  const resetAll = () => {
    setDateInput("");
    resetOutputs();
    setTimezone("UTC");
    setFormat("datetime-local");
  };

  // Copy to clipboard
  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(value).then(() => {
      alert("Copied to clipboard!");
    });
  };

  // Get current date and time
  const setCurrentDateTime = () => {
    const now = new Date().toISOString().slice(0, 16);
    setDateInput(now);
    handleDateChange({ target: { value: now } });
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Date to Timestamp Converter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Format
              </label>
              <select
                value={format}
                onChange={(e) => {
                  setFormat(e.target.value);
                  resetOutputs();
                  setDateInput("");
                }}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="datetime-local">Date & Time Picker</option>
                <option value="custom">Custom Input</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => {
                  setTimezone(e.target.value);
                  if (dateInput) handleDateChange({ target: { value: dateInput } });
                }}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time (US)</option>
                <option value="America/Los_Angeles">Pacific Time (US)</option>
                <option value="Europe/London">London</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-gray-700">
              {format === "datetime-local"
                ? "Select Date & Time"
                : "Enter Date (e.g., 2023-10-15 14:30)"}
            </label>
            {format === "datetime-local" ? (
              <input
                type="datetime-local"
                value={dateInput}
                onChange={handleDateChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <input
                type="text"
                value={dateInput}
                onChange={handleDateChange}
                placeholder="e.g., 2023-10-15 14:30"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            )}
            <button
              onClick={setCurrentDateTime}
              className="mt-2 flex items-center justify-center py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <FaCalendarAlt className="mr-2" /> Use Current Date & Time
            </button>
          </div>

          {/* Output Section */}
          {humanReadableDate && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Human-Readable Date ({timezone}):</strong>{" "}
                  {humanReadableDate}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                <p className="text-sm text-gray-700">
                  <strong>Timestamp (Seconds):</strong> {timestampSeconds}
                </p>
                <button
                  onClick={() => copyToClipboard(timestampSeconds)}
                  className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  <FaCopy />
                </button>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                <p className="text-sm text-gray-700">
                  <strong>Timestamp (Milliseconds):</strong> {timestampMilliseconds}
                </p>
                <button
                  onClick={() => copyToClipboard(timestampMilliseconds)}
                  className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  <FaCopy />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={resetAll}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert date to Unix timestamp (seconds & milliseconds)</li>
              <li>Support for multiple timezones</li>
              <li>Flexible input: Date picker or custom format</li>
              <li>Copy timestamps to clipboard</li>
              <li>Set to current date and time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateToTimestamp;