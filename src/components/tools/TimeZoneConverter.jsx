"use client";

import { useState } from "react";

const timeZones = [
  { label: "UTC", value: "UTC" },
  { label: "New York (EST)", value: "America/New_York" },
  { label: "London (GMT)", value: "Europe/London" },
  { label: "Tokyo (JST)", value: "Asia/Tokyo" },
  { label: "Sydney (AEDT)", value: "Australia/Sydney" },
  { label: "Dubai (GST)", value: "Asia/Dubai" },
];

const convertTimeZone = (time, fromZone, toZone) => {
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

  const handleConversion = () => {
    setConvertedTime(convertTimeZone(selectedTime, fromTimeZone, toTimeZone));
  };

  const swapZones = () => {
    setFromTimeZone(toTimeZone);
    setToTimeZone(fromTimeZone);
    setConvertedTime(convertTimeZone(selectedTime, toTimeZone, fromTimeZone));
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">

      <div className="mb-4">
        <input
          type="datetime-local"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2 mb-4">
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
          className="p-2 border rounded-lg bg-gray-200"
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
        className="w-full p-2 bg-blue-500 text-white rounded-lg"
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
