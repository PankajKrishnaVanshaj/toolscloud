"use client";

import { useState, useCallback } from "react";
import { FaClock, FaSync, FaCopy, FaDownload } from "react-icons/fa";

const timeZones = [
  { label: "UTC", value: "UTC" },
  { label: "New York (EST/EDT)", value: "America/New_York" },
  { label: "London (GMT/BST)", value: "Europe/London" },
  { label: "Tokyo (JST)", value: "Asia/Tokyo" },
  { label: "Sydney (AEDT/AEST)", value: "Australia/Sydney" },
  { label: "Dubai (GST)", value: "Asia/Dubai" },
  { label: "Los Angeles (PST/PDT)", value: "America/Los_Angeles" },
  { label: "Paris (CET/CEST)", value: "Europe/Paris" },
];

const EpochTimeConverter = () => {
  const [epochTime, setEpochTime] = useState("");
  const [humanTime, setHumanTime] = useState("");
  const [selectedTimeZone, setSelectedTimeZone] = useState("UTC");
  const [useMilliseconds, setUseMilliseconds] = useState(false);
  const [dateFormat, setDateFormat] = useState("medium");

  // Convert Epoch to Human Date
  const convertEpochToDate = useCallback(
    (epoch) => {
      if (!epoch || isNaN(epoch)) return "";
      const timestamp = useMilliseconds ? Number(epoch) : epoch * 1000;
      return new Intl.DateTimeFormat("en-US", {
        timeZone: selectedTimeZone,
        dateStyle: dateFormat,
        timeStyle: "long",
        hour12: true,
      }).format(new Date(timestamp));
    },
    [selectedTimeZone, useMilliseconds, dateFormat]
  );

  // Convert Human Date to Epoch
  const convertDateToEpoch = useCallback(
    (date) => {
      if (!date) return "";
      const timestamp = new Date(date).getTime();
      return useMilliseconds ? timestamp : Math.floor(timestamp / 1000);
    },
    [useMilliseconds]
  );

  // Handle Current Time Conversion
  const handleCurrentTimeConversion = () => {
    const now = new Date();
    setHumanTime(now.toISOString().slice(0, 16));
    setEpochTime(convertDateToEpoch(now));
  };

  // Clear Fields
  const clearFields = () => {
    setEpochTime("");
    setHumanTime("");
    setSelectedTimeZone("UTC");
    setUseMilliseconds(false);
    setDateFormat("medium");
  };

  // Copy to Clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // Download as TXT
  const downloadAsText = () => {
    if (!epochTime && !humanTime) return;
    const content = `Epoch Time: ${epochTime || "N/A"}\nHuman Readable: ${
      humanTime || "N/A"
    }\nTime Zone: ${selectedTimeZone}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `epoch-conversion-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Epoch Time Converter
        </h2>

        {/* Epoch Time Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Epoch Time
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={epochTime}
              onChange={(e) => {
                setEpochTime(e.target.value);
                setHumanTime(convertEpochToDate(e.target.value));
              }}
              className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder={`Enter Epoch Time (e.g., ${
                useMilliseconds ? "1694567890123" : "1694567890"
              })`}
            />
            {epochTime && (
              <button
                onClick={() => copyToClipboard(epochTime)}
                className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                <FaCopy />
              </button>
            )}
          </div>
        </div>

        {/* Human Time Output */}
        {humanTime && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-600">Human Readable Date</p>
            <p className="text-lg font-semibold text-gray-800">{humanTime}</p>
            <button
              onClick={() => copyToClipboard(humanTime)}
              className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <FaCopy className="mr-1" /> Copy
            </button>
          </div>
        )}

        {/* Human Time Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Human Readable Date
          </label>
          <input
            type="datetime-local"
            value={humanTime}
            onChange={(e) => {
              setHumanTime(e.target.value);
              setEpochTime(convertDateToEpoch(e.target.value));
            }}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Zone
            </label>
            <select
              value={selectedTimeZone}
              onChange={(e) => {
                setSelectedTimeZone(e.target.value);
                if (epochTime) setHumanTime(convertEpochToDate(epochTime));
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {timeZones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Format
            </label>
            <select
              value={dateFormat}
              onChange={(e) => {
                setDateFormat(e.target.value);
                if (epochTime) setHumanTime(convertEpochToDate(epochTime));
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="short">Short (e.g., 9/13/23)</option>
              <option value="medium">Medium (e.g., Sep 13, 2023)</option>
              <option value="long">Long (e.g., September 13, 2023)</option>
              <option value="full">Full (e.g., Wednesday, September 13, 2023)</option>
            </select>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="millisecondsToggle"
            checked={useMilliseconds}
            onChange={(e) => {
              setUseMilliseconds(e.target.checked);
              if (epochTime) setHumanTime(convertEpochToDate(epochTime));
              if (humanTime) setEpochTime(convertDateToEpoch(humanTime));
            }}
            className="mr-2 accent-blue-500"
          />
          <label htmlFor="millisecondsToggle" className="text-sm text-gray-700">
            Use Milliseconds
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleCurrentTimeConversion}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FaClock className="mr-2" /> Current Time
          </button>
          <button
            onClick={downloadAsText}
            disabled={!epochTime && !humanTime}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download
          </button>
          <button
            onClick={clearFields}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Clear
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Bidirectional conversion: Epoch ↔ Human Date</li>
            <li>Multiple time zones support</li>
            <li>Customizable date formats</li>
            <li>Milliseconds toggle</li>
            <li>Copy to clipboard and download options</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EpochTimeConverter;