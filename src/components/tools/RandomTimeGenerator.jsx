"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo, FaClock } from "react-icons/fa";

const RandomTimeGenerator = () => {
  const [times, setTimes] = useState([]);
  const [count, setCount] = useState(1);
  const [startHour, setStartHour] = useState(0);
  const [endHour, setEndHour] = useState(23);
  const [format, setFormat] = useState("24h"); // 24h or 12h
  const [includeSeconds, setIncludeSeconds] = useState(false);
  const [minuteStep, setMinuteStep] = useState(1); // Minute precision
  const [separator, setSeparator] = useState("\n"); // Output separator
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const generateRandomTimes = useCallback(() => {
    const newTimes = Array.from({ length: Math.min(count, 1000) }, () => {
      const hour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;
      const minute = Math.floor(Math.random() * (60 / minuteStep)) * minuteStep;
      const second = includeSeconds ? Math.floor(Math.random() * 60) : 0;

      if (format === "24h") {
        const timeParts = [
          String(hour).padStart(2, "0"),
          String(minute).padStart(2, "0"),
        ];
        if (includeSeconds) timeParts.push(String(second).padStart(2, "0"));
        return timeParts.join(":");
      } else {
        const period = hour >= 12 ? "PM" : "AM";
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const timeParts = [
          String(displayHour).padStart(2, "0"),
          String(minute).padStart(2, "0"),
        ];
        if (includeSeconds) timeParts.push(String(second).padStart(2, "0"));
        return `${timeParts.join(":")} ${period}`;
      }
    });

    setTimes(newTimes);
    setIsCopied(false);
    setHistory((prev) => [
      ...prev,
      { times: newTimes, options: { count, startHour, endHour, format, includeSeconds, minuteStep, separator } },
    ].slice(-5));
  }, [count, startHour, endHour, format, includeSeconds, minuteStep, separator]);

  const copyToClipboard = () => {
    const text = times.join(separator);
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const downloadAsText = () => {
    const text = times.join(separator);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `times-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearTimes = () => {
    setTimes([]);
    setIsCopied(false);
  };

  const restoreFromHistory = (entry) => {
    setTimes(entry.times);
    setCount(entry.options.count);
    setStartHour(entry.options.startHour);
    setEndHour(entry.options.endHour);
    setFormat(entry.options.format);
    setIncludeSeconds(entry.options.includeSeconds);
    setMinuteStep(entry.options.minuteStep);
    setSeparator(entry.options.separator);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Random Time Generator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Times (1-1000)
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minute Step (1-60)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={minuteStep}
                onChange={(e) => setMinuteStep(Math.max(1, Math.min(60, Number(e.target.value) || 1)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Hour (0-23)
              </label>
              <input
                type="number"
                min="0"
                max="23"
                value={startHour}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(23, Number(e.target.value) || 0));
                  setStartHour(val);
                  if (val > endHour) setEndHour(val);
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Hour (0-23)
              </label>
              <input
                type="number"
                min="0"
                max="23"
                value={endHour}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(23, Number(e.target.value) || 0));
                  setEndHour(val);
                  if (val < startHour) setStartHour(val);
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Format:</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="24h">24-Hour (HH:MM)</option>
                  <option value="12h">12-Hour (HH:MM AM/PM)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Output Separator:</label>
                <select
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="\n">Newline</option>
                  <option value=", ">Comma</option>
                  <option value=" ">Space</option>
                  <option value="; ">Semicolon</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeSeconds"
                  checked={includeSeconds}
                  onChange={(e) => setIncludeSeconds(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="includeSeconds" className="text-sm text-gray-600">
                  Include Seconds
                </label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateRandomTimes}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaClock className="mr-2" />
              Generate Times
            </button>
            {times.length > 0 && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors font-medium flex items-center justify-center ${
                    isCopied
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" />
                  {isCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={downloadAsText}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
                <button
                  onClick={clearTimes}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Output Display */}
        {times.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Times ({times.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-64 overflow-y-auto font-mono text-gray-800 whitespace-pre-wrap">
              {times.join(separator)}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Generations (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.times.length} times ({entry.options.startHour}-{entry.options.endHour}, {entry.options.format})
                  </span>
                  <button
                    onClick={() => restoreFromHistory(entry)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Generate times in 24-hour or 12-hour format</li>
            <li>Customizable hour range and minute precision</li>
            <li>Optional seconds and output separators</li>
            <li>Copy, download, and track history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RandomTimeGenerator;