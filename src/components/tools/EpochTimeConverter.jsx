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

const EpochTimeConverter = () => {
  const [epochTime, setEpochTime] = useState("");
  const [humanTime, setHumanTime] = useState("");
  const [selectedTimeZone, setSelectedTimeZone] = useState("UTC");
  const [useMilliseconds, setUseMilliseconds] = useState(false);

  // Convert Epoch to Human Date
  const convertEpochToDate = (epoch) => {
    if (!epoch || isNaN(epoch)) return "";
    const timestamp = useMilliseconds ? Number(epoch) : epoch * 1000;
    return new Intl.DateTimeFormat("en-US", {
      timeZone: selectedTimeZone,
      dateStyle: "medium",
      timeStyle: "medium",
    }).format(new Date(timestamp));
  };

  // Convert Human Date to Epoch
  const convertDateToEpoch = (date) => {
    if (!date) return "";
    const timestamp = new Date(date).getTime();
    return useMilliseconds ? timestamp : Math.floor(timestamp / 1000);
  };

  // Handle conversion of current date/time
  const handleCurrentTimeConversion = () => {
    const now = new Date();
    setHumanTime(now.toISOString().slice(0, 16));
    setEpochTime(convertDateToEpoch(now));
  };

  // Handle Clear Button
  const clearFields = () => {
    setEpochTime("");
    setHumanTime("");
  };

  return (
    <div className="mx-auto p-6 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg rounded-lg max-w-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center">Epoch Time Converter</h2>

      {/* Convert Epoch to Human Readable */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Epoch Time:</label>
        <input
          type="number"
          value={epochTime}
          onChange={(e) => {
            setEpochTime(e.target.value);
            setHumanTime(convertEpochToDate(e.target.value));
          }}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Enter Epoch Time (e.g., 1694567890)"
        />
      </div>

      {humanTime && (
        <div className="p-3 bg-gray-100 rounded-lg text-lg text-center mb-4">
          <strong>Human Date:</strong> {humanTime}
        </div>
      )}

      {/* Convert Human Readable to Epoch */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Human Readable Date:</label>
        <input
          type="datetime-local"
          value={humanTime}
          onChange={(e) => {
            setHumanTime(e.target.value);
            setEpochTime(convertDateToEpoch(e.target.value));
          }}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {epochTime && humanTime && (
        <div className="p-3 bg-gray-100 rounded-lg text-lg text-center">
          <strong>Epoch Timestamp:</strong> {epochTime}
        </div>
      )}

      {/* Timezone Selection */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Select Time Zone:</label>
        <select
          value={selectedTimeZone}
          onChange={(e) => setSelectedTimeZone(e.target.value)}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {timeZones.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      {/* Milliseconds Toggle */}
      <div className="flex items-center mb-6">
        <input
          type="checkbox"
          id="millisecondsToggle"
          checked={useMilliseconds}
          onChange={(e) => setUseMilliseconds(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="millisecondsToggle" className="font-medium">
          Use Milliseconds
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleCurrentTimeConversion}
          className="w-full p-2 bg-primary text-white rounded-lg"
        >
          Convert Current Date/Time
        </button>
        <button
          onClick={clearFields}
          className="w-full p-2 bg-gray-300 rounded-lg"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default EpochTimeConverter;
