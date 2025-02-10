"use client";

import { useState, useRef } from "react";

const CountdownTimer = () => {
  const [time, setTime] = useState(0); // Time in milliseconds
  const [inputTime, setInputTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  // Start Countdown
  const startCountdown = () => {
    if (time > 0 && !isRunning) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1000) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            return 0;
          }
          return prevTime - 1000;
        });
      }, 1000);
    }
  };

  // Pause Countdown
  const pauseCountdown = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
  };

  // Reset Countdown
  const resetCountdown = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTime(0);
    setInputTime({ hours: 0, minutes: 0, seconds: 0 });
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputTime({ ...inputTime, [name]: Math.max(0, parseInt(value, 10) || 0) });
  };

  // Set Countdown Time
  const setCountdownTime = () => {
    const totalMilliseconds =
      (inputTime.hours * 3600 + inputTime.minutes * 60 + inputTime.seconds) * 1000;
    setTime(totalMilliseconds);
  };

  // Format time display
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg text-center">
      <h2 className="text-xl font-semibold mb-4">Countdown Timer</h2>

      {/* Display Countdown Time */}
      <div className="text-3xl font-mono bg-gray-100 p-4 rounded-lg mb-4">
        {formatTime(time)}
      </div>

      {/* Input Fields */}
      <div className="flex justify-center gap-2 mb-4">
        <input
          type="number"
          name="hours"
          value={inputTime.hours}
          onChange={handleChange}
          placeholder="HH"
          className="w-16 p-2 border rounded-lg text-center"
        />
        <input
          type="number"
          name="minutes"
          value={inputTime.minutes}
          onChange={handleChange}
          placeholder="MM"
          className="w-16 p-2 border rounded-lg text-center"
        />
        <input
          type="number"
          name="seconds"
          value={inputTime.seconds}
          onChange={handleChange}
          placeholder="SS"
          className="w-16 p-2 border rounded-lg text-center"
        />
        <button
          onClick={setCountdownTime}
          className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Set
        </button>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        {!isRunning ? (
          <button
            onClick={startCountdown}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            {time === 0 ? "Start" : "Resume"}
          </button>
        ) : (
          <button
            onClick={pauseCountdown}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            Pause
          </button>
        )}
        <button
          onClick={resetCountdown}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default CountdownTimer;
