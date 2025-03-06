// components/NoiseLevelMeter.js
'use client';

import React, { useState, useEffect, useRef } from 'react';

const NoiseLevelMeter = () => {
  const [decibels, setDecibels] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState('');
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);

  const startMeter = async () => {
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
      setError('');
      measureNoise();
    } catch (err) {
      setError('Microphone access denied. Please grant permission to use this tool.');
      setIsActive(false);
    }
  };

  const stopMeter = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      setIsActive(false);
    }
  };

  const measureNoise = () => {
    if (!isActive || !analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    const measure = () => {
      analyser.getByteFrequencyData(dataArray);
      const sum = dataArray.reduce((a, b) => a + b, 0);
      const avg = sum / dataArray.length;
      
      // Convert to approximate dB (simplified calculation)
      const dB = Math.max(20, Math.min(120, 20 * Math.log10(avg) + 40));
      setDecibels(Math.round(dB));

      if (isActive) {
        requestAnimationFrame(measure);
      }
    };

    requestAnimationFrame(measure);
  };

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Determine color based on noise level
  const getMeterColor = () => {
    if (decibels < 40) return 'bg-green-500';
    if (decibels < 60) return 'bg-yellow-500';
    if (decibels < 80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Noise Level Meter</h1>

      <div className="space-y-6">
        {/* Controls */}
        <div className="flex justify-center gap-4">
          <button
            onClick={startMeter}
            disabled={isActive}
            className={`px-6 py-2 text-white rounded-md transition-colors ${
              isActive ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            Start Meter
          </button>
          <button
            onClick={stopMeter}
            disabled={!isActive}
            className={`px-6 py-2 text-white rounded-md transition-colors ${
              !isActive ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            Stop Meter
          </button>
        </div>

        {/* Meter Display */}
        <div className="text-center">
          <div className="relative h-8 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getMeterColor()} transition-all duration-200`}
              style={{ width: `${(decibels / 120) * 100}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold">
              {isActive ? `${decibels} dB` : 'Inactive'}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {decibels < 40 && 'Quiet (e.g., whisper)'}
            {decibels >= 40 && decibels < 60 && 'Normal (e.g., conversation)'}
            {decibels >= 60 && decibels < 80 && 'Loud (e.g., traffic)'}
            {decibels >= 80 && 'Very Loud (e.g., concert)'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-500">
          <p>Note: Requires microphone access. Decibel levels are approximate and depend on:</p>
          <ul className="list-disc list-inside">
            <li>Microphone sensitivity</li>
            <li>Environmental factors</li>
            <li>Browser implementation</li>
          </ul>
          <p>Range: 20-120 dB (simplified scale)</p>
        </div>
      </div>
    </div>
  );
};

export default NoiseLevelMeter;