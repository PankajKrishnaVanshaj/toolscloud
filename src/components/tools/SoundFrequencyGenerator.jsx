"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaPlay, FaStop, FaVolumeUp, FaSync } from "react-icons/fa";

const SoundFrequencyGenerator = () => {
  const [frequency, setFrequency] = useState(440); // Default: A4 note
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5); // 0 to 1
  const [waveform, setWaveform] = useState("sine"); // Waveform type
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Initialize AudioContext on mount
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Start tone
  const startTone = useCallback(() => {
    if (!audioContextRef.current) return;

    oscillatorRef.current = audioContextRef.current.createOscillator();
    gainNodeRef.current = audioContextRef.current.createGain();

    oscillatorRef.current.type = waveform;
    oscillatorRef.current.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    gainNodeRef.current.gain.setValueAtTime(volume, audioContextRef.current.currentTime);

    oscillatorRef.current.connect(gainNodeRef.current);
    gainNodeRef.current.connect(audioContextRef.current.destination);

    oscillatorRef.current.start();
    setIsPlaying(true);
  }, [frequency, volume, waveform]);

  // Stop tone
  const stopTone = useCallback(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
      gainNodeRef.current.disconnect();
      setIsPlaying(false);
    }
  }, []);

  // Toggle play/stop
  const toggleTone = () => {
    if (isPlaying) {
      stopTone();
    } else {
      startTone();
    }
  };

  // Update frequency live
  useEffect(() => {
    if (isPlaying && oscillatorRef.current) {
      oscillatorRef.current.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    }
  }, [frequency]);

  // Update volume live
  useEffect(() => {
    if (isPlaying && gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
    }
  }, [volume]);

  // Update waveform live (requires restart)
  useEffect(() => {
    if (isPlaying) {
      stopTone();
      startTone();
    }
  }, [waveform, stopTone, startTone]);

  // Reset to defaults
  const reset = () => {
    stopTone();
    setFrequency(440);
    setVolume(0.5);
    setWaveform("sine");
  };

  // Frequency presets
  const presets = [
    { label: "Low (100 Hz)", value: 100 },
    { label: "Middle C (261.63 Hz)", value: 261.63 },
    { label: "A4 (440 Hz)", value: 440 },
    { label: "High (1000 Hz)", value: 1000 },
  ];

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Sound Frequency Generator
        </h1>

        <div className="space-y-6">
          {/* Frequency Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequency: {frequency.toFixed(2)} Hz
            </label>
            <input
              type="range"
              min="20"
              max="2000"
              step="0.01"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>20 Hz</span>
              <span>2000 Hz</span>
            </div>
            {/* Presets */}
            <div className="mt-2 flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setFrequency(preset.value)}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    frequency === preset.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Volume Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Volume: {(volume * 100).toFixed(0)}%
            </label>
            <div className="flex items-center gap-2">
              <FaVolumeUp className="text-gray-500" />
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
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Waveform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Waveform</label>
            <select
              value={waveform}
              onChange={(e) => setWaveform(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="sine">Sine</option>
              <option value="square">Square</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="triangle">Triangle</option>
            </select>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={toggleTone}
              className={`flex-1 py-2 px-4 rounded-md text-white transition-colors flex items-center justify-center ${
                isPlaying
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isPlaying ? <FaStop className="mr-2" /> : <FaPlay className="mr-2" />}
              {isPlaying ? "Stop" : "Play"}
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
            <li>Adjustable frequency (20-2000 Hz)</li>
            <li>Volume control (0-100%)</li>
            <li>Multiple waveforms: Sine, Square, Sawtooth, Triangle</li>
            <li>Frequency presets for quick selection</li>
            <li>Real-time sound adjustments</li>
          </ul>
        </div>

        {/* Warning */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          <strong>Caution:</strong> Use moderate volume to protect your hearing, especially at high frequencies.
        </p>
      </div>
    </div>
  );
};

export default SoundFrequencyGenerator;