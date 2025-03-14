"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaCalendarDay, FaClock } from "react-icons/fa";

const DaylightSavingTimeChecker = () => {
  const [dateTime, setDateTime] = useState(
    new Date().toISOString().slice(0, 16)
  ); // Include time
  const [timeZone, setTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [dstInfo, setDstInfo] = useState(null);
  const [error, setError] = useState("");
  const [showFutureTransitions, setShowFutureTransitions] = useState(false);
  const timeZones = Intl.supportedValuesOf("timeZone");

  const checkDST = useCallback((inputDateTime, tz) => {
    try {
      const dateObj = new Date(inputDateTime);
      if (isNaN(dateObj.getTime())) throw new Error("Invalid date or time");

      const year = dateObj.getFullYear();
      const jan = new Date(Date.UTC(year, 0, 1));
      const jul = new Date(Date.UTC(year, 6, 1));
      const janOffset = jan.toLocaleString("en-US", { timeZone: tz }).includes("GMT")
        ? jan.getTimezoneOffset()
        : new Date(jan.toLocaleString("en-US", { timeZone: tz })).getTimezoneOffset();
      const julOffset = jul.toLocaleString("en-US", { timeZone: tz }).includes("GMT")
        ? jul.getTimezoneOffset()
        : new Date(jul.toLocaleString("en-US", { timeZone: tz })).getTimezoneOffset();
      const currentOffset = dateObj.toLocaleString("en-US", { timeZone: tz }).includes("GMT")
        ? dateObj.getTimezoneOffset()
        : new Date(dateObj.toLocaleString("en-US", { timeZone: tz })).getTimezoneOffset();

      const observesDST = janOffset !== julOffset;
      const isDST = observesDST && currentOffset === Math.min(janOffset, julOffset);

      let springForward = null;
      let fallBack = null;
      let nextSpringForward = null;
      let nextFallBack = null;
      if (observesDST) {
        const start = new Date(Date.UTC(year, 0, 1));
        const end = new Date(Date.UTC(year + 1, 0, 1));
        const nextYearEnd = new Date(Date.UTC(year + 2, 0, 1));

        for (let d = start; d < end; d.setDate(d.getDate() + 1)) {
          const nextDay = new Date(d);
          nextDay.setDate(nextDay.getDate() + 1);
          const offsetChange =
            new Date(d.toLocaleString("en-US", { timeZone: tz })).getTimezoneOffset() -
            new Date(nextDay.toLocaleString("en-US", { timeZone: tz })).getTimezoneOffset();
          if (offsetChange > 0 && !springForward) springForward = new Date(d);
          else if (offsetChange < 0 && !fallBack) fallBack = new Date(d);
        }

        if (showFutureTransitions) {
          for (let d = end; d < nextYearEnd; d.setDate(d.getDate() + 1)) {
            const nextDay = new Date(d);
            nextDay.setDate(nextDay.getDate() + 1);
            const offsetChange =
              new Date(d.toLocaleString("en-US", { timeZone: tz })).getTimezoneOffset() -
              new Date(nextDay.toLocaleString("en-US", { timeZone: tz })).getTimezoneOffset();
            if (offsetChange > 0 && !nextSpringForward) nextSpringForward = new Date(d);
            else if (offsetChange < 0 && !nextFallBack) nextFallBack = new Date(d);
          }
        }
      }

      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        timeZoneName: "long",
      });

      return {
        isDST,
        observesDST,
        offset: -currentOffset / 60,
        standardOffset: -Math.max(janOffset, julOffset) / 60,
        dstOffset: -Math.min(janOffset, julOffset) / 60,
        springForward: springForward ? formatter.format(springForward) : null,
        fallBack: fallBack ? formatter.format(fallBack) : null,
        nextSpringForward: nextSpringForward ? formatter.format(nextSpringForward) : null,
        nextFallBack: nextFallBack ? formatter.format(nextFallBack) : null,
        formattedDate: formatter.format(dateObj),
      };
    } catch (err) {
      setError(`Error: ${err.message}`);
      return null;
    }
  }, [showFutureTransitions]);

  const updateDSTInfo = () => {
    const info = checkDST(dateTime, timeZone);
    setDstInfo(info);
    setError("");
  };

  useEffect(() => {
    updateDSTInfo();
  }, [dateTime, timeZone, showFutureTransitions]);

  const handleNow = () => {
    setDateTime(new Date().toISOString().slice(0, 16));
  };

  const reset = () => {
    setDateTime(new Date().toISOString().slice(0, 16));
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setShowFutureTransitions(false);
    updateDSTInfo();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Daylight Saving Time Checker
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date & Time
              </label>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleNow}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <FaCalendarDay className="mr-2" /> Now
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Zone
              </label>
              <select
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timeZones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Additional Options */}
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showFutureTransitions}
                onChange={(e) => setShowFutureTransitions(e.target.checked)}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Show Next Year Transitions</span>
            </label>
            <button
              onClick={reset}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results Section */}
          {dstInfo && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">DST Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Date & Time:</span>{" "}
                    {dstInfo.formattedDate}
                  </p>
                  <p>
                    <span className="font-medium">DST Active:</span>{" "}
                    <span
                      className={dstInfo.isDST ? "text-green-600" : "text-red-600"}
                    >
                      {dstInfo.isDST ? "Yes" : "No"}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Observes DST:</span>{" "}
                    {dstInfo.observesDST ? "Yes" : "No"}
                  </p>
                  <p>
                    <span className="font-medium">Current Offset:</span>{" "}
                    {dstInfo.offset >= 0 ? "+" : ""}
                    {dstInfo.offset} hours
                  </p>
                </div>
                {dstInfo.observesDST && (
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Standard Offset:</span>{" "}
                      {dstInfo.standardOffset >= 0 ? "+" : ""}
                      {dstInfo.standardOffset} hours
                    </p>
                    <p>
                      <span className="font-medium">DST Offset:</span>{" "}
                      {dstInfo.dstOffset >= 0 ? "+" : ""}
                      {dstInfo.dstOffset} hours
                    </p>
                    <p>
                      <span className="font-medium">Spring Forward:</span>{" "}
                      {dstInfo.springForward || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Fall Back:</span>{" "}
                      {dstInfo.fallBack || "N/A"}
                    </p>
                    {showFutureTransitions && (
                      <>
                        <p>
                          <span className="font-medium">Next Spring Forward:</span>{" "}
                          {dstInfo.nextSpringForward || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Next Fall Back:</span>{" "}
                          {dstInfo.nextFallBack || "N/A"}
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Features & Notes */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features & Notes</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Check DST status for any date, time, and time zone</li>
              <li>View current year and optional next year transition dates</li>
              <li>Displays detailed offset information</li>
              <li>Transition dates are approximate, based on offset changes</li>
              <li>Use "Now" button for current date and time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DaylightSavingTimeChecker;