"use client";
import React, { useState, useCallback } from "react";
import { FaClock, FaSync, FaCalculator } from "react-icons/fa";

const TimeCalculator = () => {
  const [time1, setTime1] = useState("");
  const [time2, setTime2] = useState("");
  const [operation, setOperation] = useState("difference");
  const [durationHours, setDurationHours] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [timeFormat, setTimeFormat] = useState("24"); // 12 or 24-hour format

  // Parse time string to minutes since midnight
  const parseTimeToMinutes = useCallback((time) => {
    if (!time) return null;
    let hours, minutes;
    if (timeFormat === "12") {
      const [timePart, period] = time.split(" ");
      [hours, minutes] = timePart.split(":").map(Number);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
    } else {
      [hours, minutes] = time.split(":").map(Number);
    }
    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return null;
    }
    return hours * 60 + minutes;
  }, [timeFormat]);

  // Convert minutes to time string
  const minutesToTime = useCallback(
    (minutes) => {
      const totalMinutes = ((minutes % 1440) + 1440) % 1440;
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      if (timeFormat === "12") {
        const period = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${mins.toString().padStart(2, "0")} ${period}`;
      }
      return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
    },
    [timeFormat]
  );

  // Calculate time based on operation
  const calculateTime = useCallback(() => {
    setError("");
    setResult(null);

    const time1Minutes = time1 ? parseTimeToMinutes(time1) : null;
    const time2Minutes = time2 ? parseTimeToMinutes(time2) : null;
    const durHoursNum = parseInt(durationHours) || 0;
    const durMinsNum = parseInt(durationMinutes) || 0;

    if (operation === "difference") {
      if (time1Minutes === null || time2Minutes === null) {
        return { error: `Please enter valid times in ${timeFormat === "12" ? "HH:MM AM/PM" : "HH:MM"} format` };
      }
      let diffMinutes = time2Minutes - time1Minutes;
      if (diffMinutes < 0) diffMinutes += 1440;
      const diffHours = Math.floor(diffMinutes / 60);
      const diffMins = diffMinutes % 60;
      const totalHours = (diffMinutes / 60).toFixed(2);

      return {
        time1,
        time2,
        diffHours,
        diffMinutes: diffMins,
        totalMinutes: diffMinutes,
        totalHours,
        type: "difference",
      };
    } else if (operation === "addDuration" || operation === "subtractDuration") {
      if (time1Minutes === null) {
        return { error: `Please enter a valid start time in ${timeFormat === "12" ? "HH:MM AM/PM" : "HH:MM"} format` };
      }
      if (durHoursNum < 0 || durMinsNum < 0 || durMinsNum > 59) {
        return { error: "Duration hours must be non-negative, minutes must be 0-59" };
      }

      const durationMinutes = durHoursNum * 60 + durMinsNum;
      const startMinutes = time1Minutes;
      const endMinutes =
        operation === "addDuration"
          ? startMinutes + durationMinutes
          : startMinutes - durationMinutes;
      const endTime = minutesToTime(endMinutes);

      return {
        time1,
        durationHours: durHoursNum,
        durationMinutes: durMinsNum,
        endTime,
        totalMinutes: operation === "addDuration" ? durationMinutes : -durationMinutes,
        type: operation,
      };
    }
    return null;
  }, [time1, time2, operation, durationHours, durationMinutes, timeFormat]);

  const calculate = () => {
    if (
      (operation === "difference" && (!time1 || !time2)) ||
      ((operation === "addDuration" || operation === "subtractDuration") && !time1)
    ) {
      setError("Please fill in all required time fields");
      return;
    }

    const calcResult = calculateTime();
    if (calcResult && calcResult.error) {
      setError(calcResult.error);
      return;
    }
    setResult(calcResult);
  };

  const reset = () => {
    setTime1("");
    setTime2("");
    setOperation("difference");
    setDurationHours("");
    setDurationMinutes("");
    setResult(null);
    setError("");
    setShowDetails(false);
    setTimeFormat("24");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Time Calculator
        </h1>

        {/* Operation and Format Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Operation</label>
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="difference">Time Difference</option>
              <option value="addDuration">Add Duration</option>
              <option value="subtractDuration">Subtract Duration</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Format</label>
            <select
              value={timeFormat}
              onChange={(e) => setTimeFormat(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="24">24-Hour (HH:MM)</option>
              <option value="12">12-Hour (HH:MM AM/PM)</option>
            </select>
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <label className="w-32 text-gray-700 text-sm font-medium">
              Start Time:
            </label>
            <input
              type="text"
              value={time1}
              onChange={(e) => setTime1(e.target.value)}
              className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder={timeFormat === "12" ? "e.g., 9:00 AM" : "e.g., 09:00"}
            />
          </div>
          {operation === "difference" && (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <label className="w-32 text-gray-700 text-sm font-medium">
                End Time:
              </label>
              <input
                type="text"
                value={time2}
                onChange={(e) => setTime2(e.target.value)}
                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder={timeFormat === "12" ? "e.g., 5:00 PM" : "e.g., 17:00"}
              />
            </div>
          )}
          {(operation === "addDuration" || operation === "subtractDuration") && (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <label className="w-32 text-gray-700 text-sm font-medium">
                Duration:
              </label>
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="number"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  className="w-20 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Hours"
                  min="0"
                />
                <span className="text-gray-700">h</span>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-20 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Mins"
                  min="0"
                  max="59"
                />
                <span className="text-gray-700">m</span>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={calculate}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Calculate
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center mb-2">
              Time Results
            </h2>
            <div className="space-y-2">
              {result.type === "difference" && (
                <>
                  <p className="text-center text-xl font-medium">
                    Difference: {result.diffHours}h {result.diffMinutes}m
                  </p>
                  <p className="text-center">Total Hours: {result.totalHours}</p>
                  <p className="text-center">Total Minutes: {result.totalMinutes}</p>
                </>
              )}
              {(result.type === "addDuration" || result.type === "subtractDuration") && (
                <p className="text-center text-xl font-medium">
                  Result: {result.endTime}
                </p>
              )}

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showDetails ? "Hide Details" : "Show Details"}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm text-gray-600 space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    {result.type === "difference" && (
                      <>
                        <li>Start Time: {result.time1}</li>
                        <li>End Time: {result.time2}</li>
                        <li>
                          Time1 in Minutes: {parseTimeToMinutes(result.time1)}
                        </li>
                        <li>
                          Time2 in Minutes: {parseTimeToMinutes(result.time2)}
                        </li>
                        <li>
                          Total Minutes = Time2 - Time1
                          {parseTimeToMinutes(result.time2) <
                          parseTimeToMinutes(result.time1)
                            ? " + 1440"
                            : ""}{" "}
                          = {result.totalMinutes}
                        </li>
                        <li>
                          Hours = Total Minutes / 60 = {result.diffHours}
                        </li>
                        <li>
                          Remaining Minutes = Total Minutes % 60 ={" "}
                          {result.diffMinutes}
                        </li>
                        <li>
                          Total Hours = Total Minutes / 60 = {result.totalHours}
                        </li>
                      </>
                    )}
                    {(result.type === "addDuration" ||
                      result.type === "subtractDuration") && (
                      <>
                        <li>Start Time: {result.time1}</li>
                        <li>
                          Start Minutes: {parseTimeToMinutes(result.time1)}
                        </li>
                        <li>
                          Duration: {result.durationHours}h{" "}
                          {result.durationMinutes}m = {result.totalMinutes}{" "}
                          minutes
                        </li>
                        <li>
                          End Minutes = Start{" "}
                          {result.type === "addDuration" ? "+" : "-"} Duration ={" "}
                          {parseTimeToMinutes(result.time1)}{" "}
                          {result.type === "addDuration" ? "+" : "-"}{" "}
                          {result.totalMinutes} ={" "}
                          {parseTimeToMinutes(result.time1) +
                            result.totalMinutes}
                        </li>
                        <li>End Time = {result.endTime}</li>
                      </>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate time difference, add, or subtract durations</li>
            <li>Support for 12-hour (AM/PM) and 24-hour formats</li>
            <li>Detailed calculation breakdown</li>
            <li>Handles crossing midnight</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TimeCalculator;