"use client";

import { useState, useRef } from "react";

const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  // Start or Resume Stopwatch
  const startStopwatch = () => {
    if (!isRunning) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    }
  };

  // Pause Stopwatch
  const pauseStopwatch = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
  };

  // Reset Stopwatch
  const resetStopwatch = () => {
    clearInterval(intervalRef.current);
    setTime(0);
    setIsRunning(false);
  };

  // Format time values
  const formatTime = (time) => {
    const milliseconds = `00${(time % 1000) / 10}`.slice(-2);
    const seconds = `0${Math.floor((time / 1000) % 60)}`.slice(-2);
    const minutes = `0${Math.floor((time / 60000) % 60)}`.slice(-2);
    const hours = `0${Math.floor(time / 3600000)}`.slice(-2);
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg text-center">

      {/* Display Time */}
      <div className="text-3xl font-mono bg-gray-100 p-4 rounded-lg mb-4">
        {formatTime(time)}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        {!isRunning ? (
          <button
            onClick={startStopwatch}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {time === 0 ? "Start" : "Resume"}
          </button>
        ) : (
          <button
            onClick={pauseStopwatch}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            Pause
          </button>
        )}

        <button
          onClick={resetStopwatch}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Stopwatch;
