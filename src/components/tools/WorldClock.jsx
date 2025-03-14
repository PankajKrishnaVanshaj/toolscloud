"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaPlus, FaTrash, FaSync } from "react-icons/fa";

const WorldClock = () => {
  const [clocks, setClocks] = useState([
    { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, label: "Local Time" },
  ]);
  const [search, setSearch] = useState("");
  const [time, setTime] = useState(new Date());
  const [showAnalog, setShowAnalog] = useState(false);
  const [dateFormat, setDateFormat] = useState("short"); // short, medium, long

  // Available time zones
  const timeZones = Intl.supportedValuesOf("timeZone");

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Format time based on selected date format
  const formatTime = useCallback(
    (timeZone) => {
      const options = {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        ...(dateFormat === "medium" && { weekday: "short" }),
        ...(dateFormat === "long" && { weekday: "long", month: "long", day: "numeric" }),
      };
      return new Intl.DateTimeFormat("en-US", options).format(time);
    },
    [dateFormat]
  );

  // Calculate time difference
  const getTimeDifference = (timeZone) => {
    const localTime = new Date().toLocaleString("en-US", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    const targetTime = new Date().toLocaleString("en-US", { timeZone });
    const diffMs = new Date(targetTime) - new Date(localTime);
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    return diffHours >= 0 ? `+${diffHours}` : `${diffHours}`;
  };

  // Add a new clock
  const addClock = (timeZone) => {
    if (!clocks.some((clock) => clock.timeZone === timeZone)) {
      setClocks([...clocks, { timeZone, label: timeZone.split("/").pop().replace("_", " ") }]);
      setSearch("");
    }
  };

  // Remove a clock
  const removeClock = (timeZone) => {
    setClocks(clocks.filter((clock) => clock.timeZone !== timeZone));
  };

  // Reset all clocks except local time
  const resetClocks = () => {
    setClocks([clocks[0]]);
    setSearch("");
    setShowAnalog(false);
    setDateFormat("short");
  };

  // Filter time zones for search
  const filteredTimeZones = timeZones.filter(
    (tz) =>
      tz.toLowerCase().includes(search.toLowerCase()) &&
      !clocks.some((clock) => clock.timeZone === tz)
  );

  // Analog Clock Component
  const AnalogClock = ({ timeZone }) => {
    const date = new Date(time.toLocaleString("en-US", { timeZone }));
    const hours = date.getHours() % 12;
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const hourDeg = hours * 30 + minutes / 2;
    const minuteDeg = minutes * 6;
    const secondDeg = seconds * 6;

    return (
      <div className="relative w-32 h-32 rounded-full bg-gray-100 border border-gray-300">
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-1 h-12 bg-black origin-bottom absolute bottom-1/2"
            style={{ transform: `rotate(${hourDeg}deg)` }}
          />
          <div
            className="w-0.5 h-16 bg-gray-700 origin-bottom absolute bottom-1/2"
            style={{ transform: `rotate(${minuteDeg}deg)` }}
          />
          <div
            className="w-px h-20 bg-red-500 origin-bottom absolute bottom-1/2"
            style={{ transform: `rotate(${secondDeg}deg)` }}
          />
          <div className="w-2 h-2 bg-black rounded-full absolute" />
        </div>
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => {
          const angle = (num * 30 - 90) * (Math.PI / 180);
          const x = 50 + 45 * Math.cos(angle);
          const y = 50 + 45 * Math.sin(angle);
          return (
            <span
              key={num}
              className="absolute text-sm text-black"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
            >
              {num}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          World Clock
        </h1>

        {/* Controls */}
        <div className="grid gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search time zones (e.g., America/New_York)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {search && filteredTimeZones.length > 0 && (
                <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-auto">
                  {filteredTimeZones.slice(0, 5).map((tz) => (
                    <div
                      key={tz}
                      onClick={() => addClock(tz)}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {tz}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => addClock(filteredTimeZones[0])}
                disabled={!filteredTimeZones.length}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaPlus className="mr-2" /> Add
              </button>
              <button
                onClick={resetClocks}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showAnalog}
                  onChange={(e) => setShowAnalog(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Analog</span>
              </label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
          </div>

          {/* Clock Display */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clocks.map((clock, index) => (
              <div
                key={clock.timeZone}
                className="p-4 bg-gray-50 rounded-md relative"
              >
                <button
                  onClick={() => removeClock(clock.timeZone)}
                  disabled={index === 0}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaTrash />
                </button>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">{clock.label}</h3>
                <p className="text-sm text-gray-500">Zone: {clock.timeZone}</p>
                <p className="text-sm text-gray-500">
                  Diff: {getTimeDifference(clock.timeZone)} hrs
                </p>
                <p className="text-xl font-medium mt-2 text-gray-800">{formatTime(clock.timeZone)}</p>
                {showAnalog && (
                  <div className="mt-4 flex justify-center">
                    <AnalogClock timeZone={clock.timeZone} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Real-time updates every second</li>
            <li>Add multiple time zones with search</li>
            <li>Toggle between digital and analog displays</li>
            <li>Customizable date formats (Short, Medium, Long)</li>
            <li>Time difference from local time</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WorldClock;