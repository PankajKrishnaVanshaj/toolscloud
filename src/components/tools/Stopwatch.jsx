"use client";

import { useState, useRef, useEffect } from "react";

const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState([]);
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
    setLaps([]);
  };

  // Record Lap
  const recordLap = () => {
    setLaps((prevLaps) => [...prevLaps, time]);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "s") startStopwatch();
      if (e.key === "p") pauseStopwatch();
      if (e.key === "r") resetStopwatch();
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Format time values
  const formatTime = (time) => {
    const milliseconds = `00${(time % 1000) / 10}`.slice(-2);
    const seconds = `0${Math.floor((time / 1000) % 60)}`.slice(-2);
    const minutes = `0${Math.floor((time / 60000) % 60)}`.slice(-2);
    const hours = `0${Math.floor(time / 3600000)}`.slice(-2);
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  };

  return (
    <div className="mx-auto p-6 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg rounded-lg text-center max-w-lg">
      {/* Display Time */}
      <div className="text-3xl font-mono bg-gray-100 p-4 rounded-lg mb-4 animate-pulse">
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
          onClick={recordLap}
          disabled={!isRunning}
          className={`px-4 py-2 ${
            isRunning ? "bg-green-500 hover:bg-green-600" : "bg-gray-300"
          } text-white rounded-lg`}
        >
          Lap
        </button>

        <button
          onClick={resetStopwatch}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Reset
        </button>
      </div>

      {/* Display Laps */}
      {laps.length > 0 && (
        <div className="mt-4 text-left">
          <h3 className="text-lg font-semibold mb-2">Laps:</h3>
          <ul className="list-decimal list-inside bg-white p-4 rounded-lg shadow">
            {laps.map((lap, index) => (
              <li key={index} className="py-1 border-b">
                <span className="font-mono">{formatTime(lap)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Stopwatch;
