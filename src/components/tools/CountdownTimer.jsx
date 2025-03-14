"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { FaPlay, FaPause, FaSync, FaBell, FaDownload } from "react-icons/fa";

const CountdownTimer = () => {
  const [time, setTime] = useState(0); // Time in milliseconds
  const [inputTime, setInputTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [customPresets, setCustomPresets] = useState([]);
  const intervalRef = useRef(null);
  const audioRef = useRef(new Audio("/alarm.mp3")); // Add an alarm sound file to your public folder

  // Start Countdown
  const startCountdown = useCallback(() => {
    if (time > 0 && !isRunning) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1000) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            if (soundEnabled) audioRef.current.play().catch(() => {});
            return 0;
          }
          return prevTime - 1000;
        });
      }, 1000);
    }
  }, [time, isRunning, soundEnabled]);

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
    const parsedValue = Math.max(0, parseInt(value, 10) || 0);
    setInputTime((prev) => ({ ...prev, [name]: parsedValue }));
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

  // Save current time as preset
  const savePreset = () => {
    if (time > 0) {
      setCustomPresets((prev) => [
        ...prev,
        { id: Date.now(), time: time, label: formatTime(time) },
      ]);
    }
  };

  // Load preset time
  const loadPreset = (presetTime) => {
    if (!isRunning) {
      setTime(presetTime);
      const totalSeconds = Math.floor(presetTime / 1000);
      setInputTime({
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
      });
    }
  };

  // Download timer settings as JSON
  const downloadSettings = () => {
    const settings = {
      time: time,
      inputTime: inputTime,
      presets: customPresets,
      soundEnabled: soundEnabled,
    };
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `timer-settings-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Countdown Timer
        </h2>

        {/* Display Countdown Time */}
        <div
          className={`text-4xl sm:text-5xl font-mono bg-gray-50 p-4 rounded-lg mb-6 text-center ${
            time <= 10000 && time > 0 ? "text-red-500 animate-pulse" : "text-gray-800"
          }`}
        >
          {formatTime(time)}
        </div>

        {/* Input Fields */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
          {["hours", "minutes", "seconds"].map((unit) => (
            <div key={unit} className="flex flex-col items-center">
              <input
                type="number"
                name={unit}
                value={inputTime[unit]}
                onChange={handleChange}
                placeholder={unit.slice(0, 2).toUpperCase()}
                className="w-20 p-2 border rounded-lg text-center focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                disabled={isRunning}
                min="0"
              />
              <span className="text-xs text-gray-500 mt-1 capitalize">{unit}</span>
            </div>
          ))}
          <button
            onClick={setCountdownTime}
            className={`px-4 py-2 rounded-lg text-white ${
              isRunning
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } transition-colors`}
            disabled={isRunning}
          >
            Set
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
          <button
            onClick={isRunning ? pauseCountdown : startCountdown}
            className={`flex-1 py-2 px-4 rounded-lg text-white flex items-center justify-center transition-colors ${
              isRunning
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isRunning ? <FaPause className="mr-2" /> : <FaPlay className="mr-2" />}
            {isRunning ? "Pause" : time === 0 ? "Start" : "Resume"}
          </button>
          <button
            onClick={resetCountdown}
            className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Additional Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center justify-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700 flex items-center">
                <FaBell className="mr-1" /> Sound on Finish
              </span>
            </label>
          </div>
          <button
            onClick={savePreset}
            disabled={time === 0 || isRunning}
            className="py-2 px-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Save Preset
          </button>
        </div>

        {/* Presets */}
        {customPresets.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Presets</h3>
            <div className="flex flex-wrap gap-2">
              {customPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => loadPreset(preset.time)}
                  disabled={isRunning}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:bg-gray-200 disabled:text-gray-500 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Download Settings */}
        <div className="flex justify-center">
          <button
            onClick={downloadSettings}
            className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <FaDownload className="mr-2" /> Download Settings
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable hours, minutes, and seconds</li>
            <li>Pause/Resume functionality</li>
            <li>Sound alert when timer finishes</li>
            <li>Save and load custom presets</li>
            <li>Download timer settings as JSON</li>
            <li>Visual feedback (pulse when near end)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;