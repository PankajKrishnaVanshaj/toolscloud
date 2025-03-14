"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { FaPlay, FaPause, FaRedo, FaFlag, FaDownload } from "react-icons/fa";

const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const [displayMode, setDisplayMode] = useState("digital"); // digital or analog
  const intervalRef = useRef(null);
  const canvasRef = useRef(null);

  // Start or Resume Stopwatch
  const startStopwatch = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    }
  }, [isRunning]);

  // Pause Stopwatch
  const pauseStopwatch = useCallback(() => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
  }, []);

  // Reset Stopwatch
  const resetStopwatch = useCallback(() => {
    clearInterval(intervalRef.current);
    setTime(0);
    setIsRunning(false);
    setLaps([]);
  }, []);

  // Record Lap
  const recordLap = useCallback(() => {
    setLaps((prevLaps) => [...prevLaps, time]);
  }, [time]);

  // Download Laps as CSV
  const downloadLaps = () => {
    const csvContent = [
      "Lap,Time",
      ...laps.map((lap, index) => `${index + 1},${formatTime(lap)}`),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stopwatch-laps-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "s") startStopwatch();
      if (e.key === "p") pauseStopwatch();
      if (e.key === "r") resetStopwatch();
      if (e.key === "l" && isRunning) recordLap();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isRunning, startStopwatch, pauseStopwatch, resetStopwatch, recordLap]);

  // Analog Clock Rendering
  useEffect(() => {
    if (displayMode === "analog" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const radius = canvas.width / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw clock face
      ctx.beginPath();
      ctx.arc(radius, radius, radius - 10, 0, 2 * Math.PI);
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Calculate angles
      const totalSeconds = time / 1000;
      const hours = (totalSeconds / 3600) % 12;
      const minutes = (totalSeconds / 60) % 60;
      const seconds = totalSeconds % 60;

      // Hour hand
      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.lineTo(
        radius + (radius - 20) * Math.sin((hours * Math.PI) / 6),
        radius - (radius - 20) * Math.cos((hours * Math.PI) / 6)
      );
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 4;
      ctx.stroke();

      // Minute hand
      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.lineTo(
        radius + (radius - 15) * Math.sin((minutes * Math.PI) / 30),
        radius - (radius - 15) * Math.cos((minutes * Math.PI) / 30)
      );
      ctx.strokeStyle = "#666";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Second hand
      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.lineTo(
        radius + (radius - 10) * Math.sin((seconds * Math.PI) / 30),
        radius - (radius - 10) * Math.cos((seconds * Math.PI) / 30)
      );
      ctx.strokeStyle = "#e53e3e";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [time, displayMode]);

  // Format time values
  const formatTime = (time) => {
    const milliseconds = `00${(time % 1000) / 10}`.slice(-2);
    const seconds = `0${Math.floor((time / 1000) % 60)}`.slice(-2);
    const minutes = `0${Math.floor((time / 60000) % 60)}`.slice(-2);
    const hours = `0${Math.floor(time / 3600000)}`.slice(-2);
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Stopwatch</h1>

        {/* Display */}
        <div className="mb-6">
          {displayMode === "digital" ? (
            <div className="text-4xl sm:text-5xl font-mono bg-gray-50 p-4 rounded-lg text-center shadow-inner">
              {formatTime(time)}
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              width={200}
              height={200}
              className="mx-auto rounded-full shadow-md"
            />
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={startStopwatch}
            disabled={isRunning}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaPlay className="mr-2" /> {time === 0 ? "Start" : "Resume"}
          </button>
          <button
            onClick={pauseStopwatch}
            disabled={!isRunning}
            className="flex-1 py-2 px-4 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaPause className="mr-2" /> Pause
          </button>
          <button
            onClick={resetStopwatch}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaRedo className="mr-2" /> Reset
          </button>
        </div>

        {/* Additional Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={recordLap}
            disabled={!isRunning}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaFlag className="mr-2" /> Lap
          </button>
          <button
            onClick={downloadLaps}
            disabled={laps.length === 0}
            className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download Laps
          </button>
          <select
            value={displayMode}
            onChange={(e) => setDisplayMode(e.target.value)}
            className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="digital">Digital Display</option>
            <option value="analog">Analog Display</option>
          </select>
        </div>

        {/* Laps */}
        {laps.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg max-h-48 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Laps</h3>
            <ul className="space-y-2">
              {laps.map((lap, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center py-1 px-2 bg-white rounded-md shadow-sm"
                >
                  <span className="text-sm font-medium">Lap {index + 1}</span>
                  <span className="text-sm font-mono">{formatTime(lap)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Keyboard Shortcuts</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>S: Start/Resume</li>
            <li>P: Pause</li>
            <li>R: Reset</li>
            <li>L: Record Lap (when running)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Stopwatch;