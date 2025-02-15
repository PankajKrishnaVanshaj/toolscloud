"use client";

import { useState } from "react";

const timeZones = [
  { label: "UTC", value: "UTC" },
  { label: "New York (EST)", value: "America/New_York" },
  { label: "London (GMT)", value: "Europe/London" },
  { label: "Tokyo (JST)", value: "Asia/Tokyo" },
  { label: "Sydney (AEDT)", value: "Australia/Sydney" },
  { label: "Dubai (GST)", value: "Asia/Dubai" },
  { label: "Paris (CET)", value: "Europe/Paris" },
  { label: "Los Angeles (PST)", value: "America/Los_Angeles" },
  { label: "Chicago (CST)", value: "America/Chicago" },
  { label: "Beijing (CST)", value: "Asia/Shanghai" },
  { label: "Mumbai (IST)", value: "Asia/Kolkata" },
];

const convertTimeZone = (time, toZone) => {
  if (!time) return "";
  const date = new Date(time);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: toZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
};

const TimeZoneConverter = () => {
  const [selectedTime, setSelectedTime] = useState("");
  const [fromTimeZone, setFromTimeZone] = useState("UTC");
  const [toTimeZone, setToTimeZone] = useState("America/New_York");
  const [convertedTime, setConvertedTime] = useState("");
  const [error, setError] = useState("");

  const handleConversion = () => {
    if (!selectedTime) {
      setError("Please select a valid date and time.");
      return;
    }
    setError("");
    const converted = convertTimeZone(selectedTime, toTimeZone);
    setConvertedTime(converted);
  };

  const swapZones = () => {
    const temp = fromTimeZone;
    setFromTimeZone(toTimeZone);
    setToTimeZone(temp);
    if (selectedTime) handleConversion();
  };

  const setCurrentTime = () => {
    const now = new Date().toISOString().slice(0, 16); // Format as 'YYYY-MM-DDTHH:MM'
    setSelectedTime(now);
    setError("");
  };

  return (
    <div className="mx-auto p-6 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg rounded-lg max-w-lg">
      <div className="flex justify-between items-center mb-4">
        <label htmlFor="datetime-input" className="font-medium">
          Select Date and Time:
        </label>
        <button
          onClick={setCurrentTime}
          className="p-1 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Set Current Time
        </button>
      </div>
      <input
        id="datetime-input"
        type="datetime-local"
        value={selectedTime}
        onChange={(e) => setSelectedTime(e.target.value)}
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      />
      {error && <p className="text-red-600 mt-2">{error}</p>}

      <div className="flex gap-2 mb-4 mt-4">
        <select
          value={fromTimeZone}
          onChange={(e) => setFromTimeZone(e.target.value)}
          className="w-1/2 p-2 border rounded-lg"
        >
          {timeZones.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>

        <button
          onClick={swapZones}
          className="p-2 border rounded-lg bg-gray-200 hover:bg-gray-300 transition"
          aria-label="Swap Time Zones"
        >
          🔄
        </button>

        <select
          value={toTimeZone}
          onChange={(e) => setToTimeZone(e.target.value)}
          className="w-1/2 p-2 border rounded-lg"
        >
          {timeZones.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleConversion}
        className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Convert Time
      </button>

      {convertedTime && (
        <div className="p-3 bg-gray-100 rounded-lg text-lg text-center mt-4">
          <strong>Converted Time: </strong> {convertedTime}
        </div>
      )}
    </div>
  );
};

export default TimeZoneConverter;
