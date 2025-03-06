// components/SoundFrequencyGenerator.js
'use client';

import React, { useState, useRef, useEffect } from 'react';

const SoundFrequencyGenerator = () => {
  const [frequency, setFrequency] = useState(440); // Default: A4 note
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5); // 0 to 1
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

  const startTone = () => {
    if (!audioContextRef.current) return;

    // Create oscillator and gain nodes
    oscillatorRef.current = audioContextRef.current.createOscillator();
    gainNodeRef.current = audioContextRef.current.createGain();

    // Configure oscillator
    oscillatorRef.current.type = 'sine'; // Can be 'sine', 'square', 'sawtooth', 'triangle'
    oscillatorRef.current.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);

    // Configure gain (volume)
    gainNodeRef.current.gain.setValueAtTime(volume, audioContextRef.current.currentTime);

    // Connect nodes
    oscillatorRef.current.connect(gainNodeRef.current);
    gainNodeRef.current.connect(audioContextRef.current.destination);

    // Start oscillator
    oscillatorRef.current.start();
    setIsPlaying(true);
  };

  const stopTone = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
      gainNodeRef.current.disconnect();
      setIsPlaying(false);
    }
  };

  const toggleTone = () => {
    if (isPlaying) {
      stopTone();
    } else {
      startTone();
    }
  };

  // Update frequency while playing
  useEffect(() => {
    if (isPlaying && oscillatorRef.current) {
      oscillatorRef.current.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    }
  }, [frequency]);

  // Update volume while playing
  useEffect(() => {
    if (isPlaying && gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
    }
  }, [volume]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Sound Frequency Generator</h1>

      <div className="space-y-6">
        {/* Frequency Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Frequency: {frequency} Hz
          </label>
          <input
            type="range"
            min="20"
            max="2000"
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>20 Hz</span>
            <span>2000 Hz</span>
          </div>
        </div>

        {/* Volume Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Volume: {(volume * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Play/Stop Button */}
        <div className="flex justify-center">
          <button
            onClick={toggleTone}
            className={`px-6 py-2 rounded-md text-white transition-colors duration-200 ${
              isPlaying 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isPlaying ? 'Stop' : 'Play'}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-6 text-center">
        Note: Generates a sine wave tone. Be cautious with volume to protect your hearing.
      </p>
    </div>
  );
};

export default SoundFrequencyGenerator;