"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaPlay, FaPause, FaSync, FaDownload, FaChartBar } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading stats as an image

const MouseClickCounter = () => {
  const [clicks, setClicks] = useState({
    left: 0,
    right: 0,
    middle: 0,
    total: 0,
  });
  const [isCounting, setIsCounting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [clickHistory, setClickHistory] = useState([]);
  const [clickAreaSize, setClickAreaSize] = useState("large");
  const clickAreaRef = useRef(null);
  const timerRef = useRef(null);

  // Handle mouse clicks
  const handleClick = useCallback(
    (e) => {
      if (!isCounting) return;

      e.preventDefault();

      const clickType = {
        0: "left",
        1: "middle",
        2: "right",
      }[e.button];

      if (clickType) {
        setClicks((prev) => ({
          ...prev,
          [clickType]: prev[clickType] + 1,
          total: prev.total + 1,
        }));
        setClickHistory((prev) => [
          ...prev,
          { type: clickType, timestamp: Date.now(), timer: timer },
        ].slice(-50)); // Keep last 50 clicks
      }
    },
    [isCounting, timer]
  );

  // Reset all counters and history
  const resetCounter = () => {
    setClicks({ left: 0, right: 0, middle: 0, total: 0 });
    setClickHistory([]);
    setTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Toggle counting state
  const toggleCounting = () => {
    setIsCounting((prev) => {
      if (!prev) {
        timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
      } else {
        clearInterval(timerRef.current);
      }
      return !prev;
    });
  };

  // Download stats as image
  const downloadStats = () => {
    if (clickAreaRef.current) {
      html2canvas(clickAreaRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `click-stats-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  // Effect for handling click events
  useEffect(() => {
    const clickArea = clickAreaRef.current;
    if (clickArea) {
      clickArea.addEventListener("contextmenu", (e) => e.preventDefault());
      clickArea.addEventListener("click", handleClick);
      clickArea.addEventListener("auxclick", handleClick);

      return () => {
        clickArea.removeEventListener("click", handleClick);
        clickArea.removeEventListener("auxclick", handleClick);
      };
    }
  }, [handleClick]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Format timer
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Mouse Click Counter
        </h1>

        <div className="space-y-6">
          {/* Click Area */}
          <div
            ref={clickAreaRef}
            id="click-area"
            className={`w-full rounded-lg flex items-center justify-center text-xl font-semibold cursor-pointer transition-colors ${
              clickAreaSize === "small"
                ? "h-32"
                : clickAreaSize === "medium"
                ? "h-48"
                : "h-64"
            } ${isCounting ? "bg-blue-100 hover:bg-blue-200" : "bg-gray-200"}`}
          >
            {isCounting ? (
              <span>
                Click Here! <br />
                <span className="text-sm">Time: {formatTimer(timer)}</span>
              </span>
            ) : (
              "Press Start to Begin"
            )}
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={toggleCounting}
              className={`flex items-center justify-center py-2 px-4 rounded-md text-white transition-colors ${
                isCounting
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isCounting ? <FaPause className="mr-2" /> : <FaPlay className="mr-2" />}
              {isCounting ? "Pause" : "Start"}
            </button>
            <button
              onClick={resetCounter}
              className="flex items-center justify-center py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={downloadStats}
              disabled={!clicks.total}
              className="flex items-center justify-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <FaDownload className="mr-2" /> Download Stats
            </button>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Click Area Size
              </label>
              <select
                value={clickAreaSize}
                onChange={(e) => setClickAreaSize(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>

          {/* Results */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-center flex items-center justify-center gap-2">
              <FaChartBar /> Click Statistics
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              <p>
                Total: <span className="font-bold">{clicks.total}</span>
              </p>
              <p>
                Left: <span className="font-bold">{clicks.left}</span>
              </p>
              <p>
                Right: <span className="font-bold">{clicks.right}</span>
              </p>
              <p>
                Middle: <span className="font-bold">{clicks.middle}</span>
              </p>
            </div>
            {clicks.total > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                <p>
                  Clicks per Second:{" "}
                  <span className="font-bold">
                    {(clicks.total / (timer || 1)).toFixed(2)}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Click History */}
          {clickHistory.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
              <h3 className="text-md font-semibold mb-2">Click History (Last 50)</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                {clickHistory
                  .slice()
                  .reverse()
                  .map((click, index) => (
                    <li key={index}>
                      {click.type.charAt(0).toUpperCase() + click.type.slice(1)} click at{" "}
                      {formatTimer(click.timer)} ({new Date(click.timestamp).toLocaleTimeString()})
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Instructions */}
          <p className="text-xs text-gray-500 text-center">
            Click within the area when counting is active. Use left, right, or middle mouse buttons.
          </p>

          {/* Features */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Counts left, right, and middle clicks</li>
              <li>Timer and clicks-per-second calculation</li>
              <li>Adjustable click area size</li>
              <li>Click history tracking</li>
              <li>Download stats as PNG</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MouseClickCounter;