"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaPlay, FaStop, FaDownload, FaSync } from "react-icons/fa";

const NoiseLevelMeter = () => {
  const [decibels, setDecibels] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [sensitivity, setSensitivity] = useState(1.0); // Adjustable sensitivity
  const [peak, setPeak] = useState(0); // Track peak noise level
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);

  // Start the noise meter
  const startMeter = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      source.connect(analyser);
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;

      setIsActive(true);
      setError("");
      setPeak(0);
      measureNoise();
    } catch (err) {
      setError("Microphone access denied. Please grant permission to use this tool.");
      setIsActive(false);
    }
  }, []);

  // Stop the noise meter
  const stopMeter = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      setIsActive(false);
    }
  };

  // Measure noise levels
  const measureNoise = useCallback(() => {
    if (!isActive || !analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    const measure = () => {
      analyser.getByteFrequencyData(dataArray);
      const sum = dataArray.reduce((a, b) => a + b, 0);
      const avg = (sum / dataArray.length) * sensitivity;
      
      // Convert to approximate dB with sensitivity adjustment
      const dB = Math.max(20, Math.min(120, 20 * Math.log10(avg) + 40));
      const roundedDB = Math.round(dB);
      setDecibels(roundedDB);
      setPeak((prev) => Math.max(prev, roundedDB));
      setHistory((prev) => {
        const newHistory = [...prev, { time: new Date().toLocaleTimeString(), dB: roundedDB }];
        return newHistory.slice(-10); // Keep last 10 readings
      });

      if (isActive) {
        requestAnimationFrame(measure);
      }
    };

    requestAnimationFrame(measure);
  }, [isActive, sensitivity]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Reset all states
  const reset = () => {
    stopMeter();
    setDecibels(0);
    setHistory([]);
    setPeak(0);
    setSensitivity(1.0);
    setError("");
  };

  // Download history as CSV
  const downloadHistory = () => {
    const csv = ["Time,Decibels(dB)", ...history.map((h) => `${h.time},${h.dB}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `noise-levels-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Determine color based on noise level
  const getMeterColor = () => {
    if (decibels < 40) return "bg-green-500";
    if (decibels < 60) return "bg-yellow-500";
    if (decibels < 80) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Noise Level Meter
        </h1>

        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={startMeter}
              disabled={isActive}
              className={`flex-1 py-2 px-4 text-white rounded-md transition-colors flex items-center justify-center ${
                isActive
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <FaPlay className="mr-2" /> Start
            </button>
            <button
              onClick={stopMeter}
              disabled={!isActive}
              className={`flex-1 py-2 px-4 text-white rounded-md transition-colors flex items-center justify-center ${
                !isActive
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              <FaStop className="mr-2" /> Stop
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={downloadHistory}
              disabled={!history.length}
              className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Export History
            </button>
          </div>

          {/* Sensitivity Control */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sensitivity ({sensitivity.toFixed(1)}x)
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={sensitivity}
                onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">Peak Level</p>
              <p className="text-lg font-bold text-gray-800">{peak} dB</p>
            </div>
          </div>

          {/* Meter Display */}
          <div className="text-center">
            <div className="relative h-10 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${getMeterColor()} transition-all duration-200`}
                style={{ width: `${(decibels / 120) * 100}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold">
                {isActive ? `${decibels} dB` : "Inactive"}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {decibels < 40 && "Quiet (e.g., whisper)"}
              {decibels >= 40 && decibels < 60 && "Normal (e.g., conversation)"}
              {decibels >= 60 && decibels < 80 && "Loud (e.g., traffic)"}
              {decibels >= 80 && "Very Loud (e.g., concert)"}
            </p>
          </div>

          {/* Error Message */}
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          {/* History */}
          {history.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Recent Measurements</h3>
              <ul className="text-sm text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                {history.slice().reverse().map((entry, index) => (
                  <li key={index}>{`${entry.time}: ${entry.dB} dB`}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Real-time noise level measurement</li>
              <li>Adjustable sensitivity control</li>
              <li>Peak level tracking</li>
              <li>Measurement history (last 10 readings)</li>
              <li>Export history as CSV</li>
            </ul>
          </div>

          {/* Notes */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-700 text-sm">
              <strong>Note:</strong> Decibel levels are approximate and depend on microphone
              sensitivity, environmental factors, and browser implementation. Range: 20-120 dB.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoiseLevelMeter;