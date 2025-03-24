"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaClock, FaCalendarAlt } from "react-icons/fa";

const TimeZoneDSTAdjuster = () => {
  const [inputDateTime, setInputDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [sourceTimeZone, setSourceTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [targetTimeZone, setTargetTimeZone] = useState("UTC");
  const [adjustedTime, setAdjustedTime] = useState(null);
  const [dstInfo, setDstInfo] = useState(null);
  const [error, setError] = useState("");
  const [timeFormat, setTimeFormat] = useState("12"); // 12 or 24 hour
  const [showDetails, setShowDetails] = useState(false);

  const timeZones = Intl.supportedValuesOf("timeZone");

  const getDSTInfo = useCallback((date, timeZone) => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "longOffset",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
    });

    const january = new Date(date.getFullYear(), 0, 1);
    const july = new Date(date.getFullYear(), 6, 1);
    const dateCheck = new Date(date);

    const janOffset = january.getTimezoneOffset();
    const julOffset = july.getTimezoneOffset();
    const currentOffset = dateCheck.getTimezoneOffset();

    const isDST = currentOffset !== Math.max(janOffset, julOffset);
    const dstSavings = Math.abs(janOffset - julOffset) / 60;
    const offsetHours = -currentOffset / 60;

    return {
      isDST,
      dstSavings: dstSavings > 0 ? dstSavings : 0,
      offset: offsetHours >= 0 ? `+${offsetHours}` : `${offsetHours}`,
      name: formatter.format(dateCheck).split(", ").pop(),
    };
  }, []);

  const adjustTime = useCallback(() => {
    try {
      const date = new Date(inputDateTime);
      if (isNaN(date.getTime())) throw new Error("Invalid date/time");

      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
        hour12: timeFormat === "12",
      };

      const sourceTime = new Intl.DateTimeFormat("en-US", {
        ...options,
        timeZone: sourceTimeZone,
      }).format(date);

      const targetTime = new Intl.DateTimeFormat("en-US", {
        ...options,
        timeZone: targetTimeZone,
      }).format(date);

      setAdjustedTime({ source: sourceTime, target: targetTime });
      setDstInfo({
        source: getDSTInfo(date, sourceTimeZone),
        target: getDSTInfo(date, targetTimeZone),
      });
      setError("");
    } catch (err) {
      setError(`Error: ${err.message}`);
      setAdjustedTime(null);
      setDstInfo(null);
    }
  }, [inputDateTime, sourceTimeZone, targetTimeZone, timeFormat, getDSTInfo]);

  useEffect(() => {
    adjustTime();
  }, [adjustTime]);

  const handleNow = () => {
    setInputDateTime(new Date().toISOString().slice(0, 16));
  };

  const reset = () => {
    setInputDateTime(new Date().toISOString().slice(0, 16));
    setSourceTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setTargetTimeZone("UTC");
    setTimeFormat("12");
    setShowDetails(false);
  };

  const swapTimeZones = () => {
    setSourceTimeZone(targetTimeZone);
    setTargetTimeZone(sourceTimeZone);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Time Zone & DST Adjuster
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date/Time
              </label>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={inputDateTime}
                  onChange={(e) => setInputDateTime(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleNow}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  title="Set to current time"
                >
                  <FaClock />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source Time Zone
              </label>
              <select
                value={sourceTimeZone}
                onChange={(e) => setSourceTimeZone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timeZones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Time Zone
              </label>
              <div className="flex gap-2">
                <select
                  value={targetTimeZone}
                  onChange={(e) => setTargetTimeZone(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeZones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
                <button
                  onClick={swapTimeZones}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  title="Swap time zones"
                >
                  ⇆
                </button>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Format
              </label>
              <select
                value={timeFormat}
                onChange={(e) => setTimeFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="12">12-Hour</option>
                <option value="24">24-Hour</option>
              </select>
            </div>
            <button
              onClick={reset}
              className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results Section */}
          {adjustedTime && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["source", "target"].map((type) => (
                <div
                  key={type}
                  className={`p-4 rounded-lg shadow-sm ${
                    type === "source" ? "bg-gray-50" : "bg-blue-50"
                  }`}
                >
                  <h2 className="text-lg font-semibold mb-2 capitalize">{type} Time</h2>
                  <p className="text-sm font-mono">{adjustedTime[type]}</p>
                  {dstInfo?.[type] && (
                    <div className="mt-3 text-sm text-gray-600">
                      <p>
                        <strong>DST:</strong>{" "}
                        {dstInfo[type].isDST ? (
                          <span className="text-green-600">Active</span>
                        ) : (
                          "Inactive"
                        )}
                      </p>
                      <p>
                        <strong>DST Savings:</strong> {dstInfo[type].dstSavings} hour(s)
                      </p>
                      <p>
                        <strong>Offset:</strong> UTC{dstInfo[type].offset}
                      </p>
                      <p>
                        <strong>Time Zone:</strong> {dstInfo[type].name}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700 shadow-sm">
              <p>{error}</p>
            </div>
          )}

          {/* Detailed Info */}
          {adjustedTime && (
            <div className="mt-4">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <FaCalendarAlt className="mr-2" />
                {showDetails ? "Hide Details" : "Show Details"}
              </button>
              {showDetails && (
                <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                  <p>
                    <strong>Unix Timestamp:</strong>{" "}
                    {Math.floor(new Date(inputDateTime).getTime() / 1000)}
                  </p>
                  <p>
                    <strong>ISO String:</strong> {new Date(inputDateTime).toISOString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert time between any IANA time zones</li>
            <li>Real-time DST detection and offset calculation</li>
            <li>12/24-hour format toggle</li>
            <li>Swap source and target time zones</li>
            <li>Show current time with "Now" button</li>
            <li>Detailed timestamp information</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TimeZoneDSTAdjuster;