"use client";

import { useState } from "react";

const DateToTimestamp = () => {
  const [date, setDate] = useState("");
  const [timestampSeconds, setTimestampSeconds] = useState("");
  const [timestampMilliseconds, setTimestampMilliseconds] = useState("");
  const [humanReadableDate, setHumanReadableDate] = useState("");

  // Convert Date to Timestamp
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);

    if (selectedDate) {
      const dateObj = new Date(selectedDate);
      if (isNaN(dateObj.getTime())) {
        alert("Invalid date format. Please select a valid date and time.");
        setTimestampSeconds("");
        setTimestampMilliseconds("");
        setHumanReadableDate("");
        return;
      }
      const time = dateObj.getTime();
      setTimestampSeconds(Math.floor(time / 1000));
      setTimestampMilliseconds(time);
      setHumanReadableDate(dateObj.toLocaleString("en-US", { timeZone: "UTC" }));
    } else {
      setTimestampSeconds("");
      setTimestampMilliseconds("");
      setHumanReadableDate("");
    }
  };

  // Copy to Clipboard
  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(value);
    alert("Copied to clipboard!");
  };

  return (
    <div className="mx-auto p-6 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg rounded-lg max-w-lg">

      {/* Input: Select Date & Time */}
      <div className="mb-4">
        <label className="block font-medium">Select Date & Time:</label>
        <input
          type="datetime-local"
          value={date}
          onChange={handleDateChange}
          placeholder="Select a date"
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Output: Human-Readable Date */}
      {humanReadableDate && (
        <div className="p-3 bg-gray-100 rounded-lg text-lg text-center mb-2">
          <strong>Human-Readable Date (UTC):</strong> {humanReadableDate}
        </div>
      )}

      {/* Output: Unix Timestamp (Seconds) */}
      {timestampSeconds && (
        <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg text-lg text-center mb-2">
          <span>
            <strong>Timestamp (Seconds):</strong> {timestampSeconds}
          </span>
          <button
            onClick={() => copyToClipboard(timestampSeconds)}
            className="ml-2 p-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Copy
          </button>
        </div>
      )}

      {/* Output: Unix Timestamp (Milliseconds) */}
      {timestampMilliseconds && (
        <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg text-lg text-center">
          <span>
            <strong>Timestamp (Milliseconds):</strong> {timestampMilliseconds}
          </span>
          <button
            onClick={() => copyToClipboard(timestampMilliseconds)}
            className="ml-2 p-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
};

export default DateToTimestamp;
