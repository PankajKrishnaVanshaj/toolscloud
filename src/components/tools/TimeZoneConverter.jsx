"use client";
import React, { useState, useCallback } from "react";
import { FaClock, FaSync, FaGlobe, FaCalendar } from "react-icons/fa";

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
  { label: "Moscow (MSK)", value: "Europe/Moscow" },
  { label: "Singapore (SGT)", value: "Asia/Singapore" },
  { label: "Sao Paulo (BRT)", value: "America/Sao_Paulo" },
];

const convertTimeZone = (time, fromZone, toZone, includeDate = false) => {
  if (!time) return "";
  const date = new Date(time);
  const options = {
    timeZone: toZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  if (includeDate) {
    options.year = "numeric";
    options.month = "short";
    options.day = "2-digit";
  }
  return new Intl.DateTimeFormat("en-US", options).format(date);
};

const TimeZoneConverter = () => {
  const [selectedTime, setSelectedTime] = useState("");
  const [fromTimeZone, setFromTimeZone] = useState("UTC");
  const [toTimeZone, setToTimeZone] = useState("America/New_York");
  const [convertedTime, setConvertedTime] = useState("");
  const [error, setError] = useState("");
  const [showDate, setShowDate] = useState(false);
  const [showMultipleZones, setShowMultipleZones] = useState(false);
  const [additionalZones, setAdditionalZones] = useState([]);

  const handleConversion = useCallback(() => {
    if (!selectedTime) {
      setError("Please select a valid date and time.");
      setConvertedTime("");
      return;
    }
    setError("");
    const converted = convertTimeZone(selectedTime, fromTimeZone, toTimeZone, showDate);
    setConvertedTime(converted);
  }, [selectedTime, fromTimeZone, toTimeZone, showDate]);

  const swapZones = () => {
    const temp = fromTimeZone;
    setFromTimeZone(toTimeZone);
    setToTimeZone(temp);
    if (selectedTime) handleConversion();
  };

  const setCurrentTime = () => {
    const now = new Date().toISOString().slice(0, 16);
    setSelectedTime(now);
    setError("");
    handleConversion();
  };

  const addZone = (zone) => {
    if (!additionalZones.includes(zone) && zone !== fromTimeZone && zone !== toTimeZone) {
      setAdditionalZones((prev) => [...prev, zone]);
    }
  };

  const removeZone = (zone) => {
    setAdditionalZones((prev) => prev.filter((z) => z !== zone));
  };

  const reset = () => {
    setSelectedTime("");
    setFromTimeZone("UTC");
    setToTimeZone("America/New_York");
    setConvertedTime("");
    setError("");
    setShowDate(false);
    setShowMultipleZones(false);
    setAdditionalZones([]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Time Zone Converter
        </h2>

        {/* Time Input */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="datetime-input" className="text-sm font-medium text-gray-700">
              Select Date and Time
            </label>
            <button
              onClick={setCurrentTime}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition"
            >
              <FaClock /> Now
            </button>
          </div>
          <input
            id="datetime-input"
            type="datetime-local"
            value={selectedTime}
            onChange={(e) => {
              setSelectedTime(e.target.value);
              setError("");
            }}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>

        {/* Time Zone Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <select
              value={fromTimeZone}
              onChange={(e) => setFromTimeZone(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {timeZones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-center">
            <button
              onClick={swapZones}
              className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
              aria-label="Swap Time Zones"
            >
              <FaSync />
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <select
              value={toTimeZone}
              onChange={(e) => setToTimeZone(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {timeZones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Additional Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showDate}
              onChange={(e) => setShowDate(e.target.checked)}
              className="mr-2 accent-blue-500"
            />
            <span className="text-sm text-gray-700">Show Date</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showMultipleZones}
              onChange={(e) => setShowMultipleZones(e.target.checked)}
              className="mr-2 accent-blue-500"
            />
            <span className="text-sm text-gray-700">Multiple Time Zones</span>
          </label>
        </div>

        {/* Multiple Time Zones */}
        {showMultipleZones && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Additional Time Zones
            </label>
            <select
              onChange={(e) => addZone(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 mb-2"
            >
              <option value="">Select a time zone</option>
              {timeZones
                .filter(
                  (tz) =>
                    tz.value !== fromTimeZone &&
                    tz.value !== toTimeZone &&
                    !additionalZones.includes(tz.value)
                )
                .map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
            </select>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {additionalZones.map((zone) => (
                <div
                  key={zone}
                  className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm"
                >
                  <span>{timeZones.find((tz) => tz.value === zone)?.label}</span>
                  <button
                    onClick={() => removeZone(zone)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={handleConversion}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center justify-center"
          >
            <FaGlobe className="mr-2" /> Convert Time
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Results */}
        {convertedTime && (
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Converted Time</h3>
            <p className="text-xl text-gray-800">{convertedTime}</p>
            {showMultipleZones && additionalZones.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  Additional Time Zones
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {additionalZones.map((zone) => (
                    <div
                      key={zone}
                      className="p-2 bg-white rounded-md shadow-sm text-sm"
                    >
                      <strong>{timeZones.find((tz) => tz.value === zone)?.label}:</strong>{" "}
                      {convertTimeZone(selectedTime, fromTimeZone, zone, showDate)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert between multiple time zones</li>
            <li>Option to include date in output</li>
            <li>View multiple time zones simultaneously</li>
            <li>Set current time with one click</li>
            <li>Swap time zones easily</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TimeZoneConverter;