// components/MetronomeTool.js
'use client';

import React, { useState, useEffect, useRef } from 'react';

const MetronomeTool = () => {
  const [bpm, setBpm] = useState(120); // Beats per minute
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatCount, setBeatCount] = useState(0);
  const audioContextRef = useRef(null);
  const intervalRef = useRef(null);

  // Initialize AudioContext on first interaction (due to browser restrictions)
  const initializeAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  };

  // Play a click sound
  const playClick = () => {
    if (!audioContextRef.current) return;

    const osc = audioContextRef.current.createOscillator();
    const gain = audioContextRef.current.createGain();
    
    osc.connect(gain);
    gain.connect(audioContextRef.current.destination);
    
    osc.frequency.value = 1000; // High pitch for beat
    gain.gain.setValueAtTime(1, audioContextRef.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.1);
    
    osc.start(audioContextRef.current.currentTime);
    osc.stop(audioContextRef.current.currentTime + 0.1);
  };

  // Start or stop the metronome
  const toggleMetronome = () => {
    initializeAudio();
    
    if (!isPlaying) {
      setIsPlaying(true);
      const interval = (60 / bpm) * 1000; // Convert BPM to milliseconds
      playClick();
      setBeatCount(1);
      
      intervalRef.current = setInterval(() => {
        playClick();
        setBeatCount(prev => (prev % 4) + 1); // Count beats 1-4
      }, interval);
    } else {
      clearInterval(intervalRef.current);
      setIsPlaying(false);
      setBeatCount(0);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Handle BPM change
  const handleBpmChange = (newBpm) => {
    const clampedBpm = Math.max(20, Math.min(240, newBpm));
    setBpm(clampedBpm);
    if (isPlaying) {
      clearInterval(intervalRef.current);
      const interval = (60 / clampedBpm) * 1000;
      intervalRef.current = setInterval(() => {
        playClick();
        setBeatCount(prev => (prev % 4) + 1);
      }, interval);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Metronome Tool</h1>

      <div className="space-y-6">
        {/* BPM Display and Controls */}
        <div className="text-center">
          <div className="text-4xl font-semibold text-gray-800">
            {bpm} BPM
          </div>
          <div className="mt-2 text-lg text-gray-600">
            Beat: {beatCount || '-'}
          </div>
        </div>

        {/* BPM Slider */}
        <div>
          <input
            type="range"
            min="20"
            max="240"
            value={bpm}
            onChange={(e) => handleBpmChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>20</span>
            <span>240</span>
          </div>
        </div>

        {/* BPM Buttons */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => handleBpmChange(bpm - 1)}
            className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            -1
          </button>
          <button
            onClick={() => handleBpmChange(bpm - 10)}
            className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            -10
          </button>
          <button
            onClick={() => handleBpmChange(bpm + 10)}
            className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            +10
          </button>
          <button
            onClick={() => handleBpmChange(bpm + 1)}
            className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            +1
          </button>
        </div>

        {/* Play/Stop Button */}
        <div className="flex justify-center">
          <button
            onClick={toggleMetronome}
            className={`px-6 py-2 rounded-md text-white transition-colors ${
              isPlaying 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isPlaying ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: Sound requires browser permission and may not work in all environments.
      </p>
    </div>
  );
};

export default MetronomeTool;