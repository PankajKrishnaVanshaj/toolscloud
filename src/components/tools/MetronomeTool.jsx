"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaPlay, FaPause, FaSync, FaVolumeUp } from "react-icons/fa";

const MetronomeTool = () => {
  const [bpm, setBpm] = useState(120); // Beats per minute
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatCount, setBeatCount] = useState(0);
  const [timeSignature, setTimeSignature] = useState(4); // Beats per measure
  const [volume, setVolume] = useState(1.0); // Volume control (0 to 1)
  const [accentFirstBeat, setAccentFirstBeat] = useState(true); // Accent on first beat
  const audioContextRef = useRef(null);
  const intervalRef = useRef(null);

  // Initialize AudioContext
  const initializeAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  // Play a click sound with pitch variation
  const playClick = useCallback((isAccent = false) => {
    if (!audioContextRef.current) return;

    const osc = audioContextRef.current.createOscillator();
    const gain = audioContextRef.current.createGain();

    osc.connect(gain);
    gain.connect(audioContextRef.current.destination);

    osc.frequency.value = isAccent ? 1200 : 800; // Higher pitch for accented beat
    gain.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContextRef.current.currentTime + 0.1
    );

    osc.start(audioContextRef.current.currentTime);
    osc.stop(audioContextRef.current.currentTime + 0.1);
  }, [volume]);

  // Start or stop the metronome
  const toggleMetronome = useCallback(() => {
    initializeAudio();

    if (!isPlaying) {
      setIsPlaying(true);
      const interval = (60 / bpm) * 1000;
      playClick(true); // Accent first beat
      setBeatCount(1);

      intervalRef.current = setInterval(() => {
        setBeatCount((prev) => {
          const nextBeat = (prev % timeSignature) + 1;
          playClick(nextBeat === 1 && accentFirstBeat);
          return nextBeat;
        });
      }, interval);
    } else {
      clearInterval(intervalRef.current);
      setIsPlaying(false);
      setBeatCount(0);
    }
  }, [bpm, timeSignature, accentFirstBeat, isPlaying, playClick, initializeAudio]);

  // Update BPM and adjust interval if playing
  const handleBpmChange = (newBpm) => {
    const clampedBpm = Math.max(20, Math.min(240, newBpm));
    setBpm(clampedBpm);
    if (isPlaying) {
      clearInterval(intervalRef.current);
      const interval = (60 / clampedBpm) * 1000;
      intervalRef.current = setInterval(() => {
        setBeatCount((prev) => {
          const nextBeat = (prev % timeSignature) + 1;
          playClick(nextBeat === 1 && accentFirstBeat);
          return nextBeat;
        });
      }, interval);
    }
  };

  // Reset to default settings
  const reset = () => {
    if (isPlaying) {
      clearInterval(intervalRef.current);
      setIsPlaying(false);
    }
    setBpm(120);
    setBeatCount(0);
    setTimeSignature(4);
    setVolume(1.0);
    setAccentFirstBeat(true);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Metronome Tool
        </h1>

        <div className="space-y-6">
          {/* Display */}
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-semibold text-gray-800">
              {bpm} BPM
            </div>
            <div className="mt-2 text-lg text-gray-600">
              Beat: {beatCount || "-"} / {timeSignature}
            </div>
          </div>

          {/* BPM Controls */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              BPM ({bpm})
            </label>
            <input
              type="range"
              min="20"
              max="240"
              value={bpm}
              onChange={(e) => handleBpmChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>20</span>
              <span>240</span>
            </div>
            <div className="flex justify-center gap-2 mt-2">
              {[-10, -1, 1, 10].map((step) => (
                <button
                  key={step}
                  onClick={() => handleBpmChange(bpm + step)}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  {step > 0 ? `+${step}` : step}
                </button>
              ))}
            </div>
          </div>

          {/* Time Signature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Signature
            </label>
            <select
              value={timeSignature}
              onChange={(e) => setTimeSignature(Number(e.target.value))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {[2, 3, 4, 5, 6, 7, 8].map((ts) => (
                <option key={ts} value={ts}>
                  {ts}/4
                </option>
              ))}
            </select>
          </div>

          {/* Volume Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Volume ({(volume * 100).toFixed(0)}%)
            </label>
            <div className="flex items-center gap-2">
              <FaVolumeUp className="text-gray-600" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          {/* Accent First Beat */}
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={accentFirstBeat}
                onChange={(e) => setAccentFirstBeat(e.target.checked)}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Accent First Beat</span>
            </label>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={toggleMetronome}
              className={`flex-1 py-2 px-4 rounded-md text-white transition-colors flex items-center justify-center ${
                isPlaying
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isPlaying ? (
                <>
                  <FaPause className="mr-2" /> Stop
                </>
              ) : (
                <>
                  <FaPlay className="mr-2" /> Start
                </>
              )}
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Adjustable BPM (20-240)</li>
            <li>Customizable time signatures (2/4 to 8/4)</li>
            <li>Volume control</li>
            <li>Accent on first beat option</li>
            <li>Real-time beat counter</li>
          </ul>
        </div>

        
      </div>
    </div>
  );
};

export default MetronomeTool;