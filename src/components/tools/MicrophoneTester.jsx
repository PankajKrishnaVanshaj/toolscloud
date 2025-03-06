// components/MicrophoneTester.js
'use client';

import React, { useState, useEffect, useRef } from 'react';

const MicrophoneTester = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Start microphone testing
  const startTesting = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setError('');
      
      // Setup Audio Context
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      setIsTesting(true);

      // Visualize audio levels
      const updateVolume = () => {
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        setVolume(average / 255 * 100); // Normalize to 0-100
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      // Setup recording
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioURL(URL.createObjectURL(blob));
      };

    } catch (err) {
      setError('Microphone access denied. Please grant permission.');
    }
  };

  // Stop testing
  const stopTesting = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      cancelAnimationFrame(animationFrameRef.current);
      setIsTesting(false);
      setVolume(0);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Toggle recording
  const toggleRecording = () => {
    if (!mediaRecorderRef.current) return;
    
    if (isRecording) {
      mediaRecorderRef.current.stop();
    } else {
      mediaRecorderRef.current.start();
    }
    setIsRecording(!isRecording);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTesting();
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Microphone Tester</h1>

      <div className="space-y-6">
        {/* Controls */}
        <div className="flex justify-center gap-4">
          <button
            onClick={isTesting ? stopTesting : startTesting}
            className={`px-6 py-2 rounded-md text-white transition-colors ${
              isTesting ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isTesting ? 'Stop Testing' : 'Start Testing'}
          </button>
          
          {isTesting && (
            <button
              onClick={toggleRecording}
              className={`px-6 py-2 rounded-md text-white transition-colors ${
                isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
          )}
        </div>

        {/* Volume Visualizer */}
        {isTesting && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 text-center">
              Microphone Volume Level
            </label>
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div
                className="bg-blue-600 h-6 rounded-full transition-all duration-100"
                style={{ width: `${volume}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 text-center">
              Volume: {Math.round(volume)}%
            </p>
          </div>
        )}

        {/* Recorded Audio */}
        {audioURL && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 text-center">
              Recorded Audio
            </label>
            <audio controls src={audioURL} className="w-full" />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        {/* Instructions */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: Requires microphone permission. Speak or make noise to test levels.
          Recordings are stored temporarily in your browser.
        </p>
      </div>
    </div>
  );
};

export default MicrophoneTester;