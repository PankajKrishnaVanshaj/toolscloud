"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaMicrophone, FaStop, FaPlay, FaDownload, FaSync, FaVolumeUp } from "react-icons/fa";

const MicrophoneTester = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [sensitivity, setSensitivity] = useState(1.0); // Sensitivity multiplier
  const [frequencyData, setFrequencyData] = useState([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Start microphone testing
  const startTesting = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setError("");

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      analyserRef.current.fftSize = 512; // Increased for better frequency resolution
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      setIsTesting(true);

      // Update volume and frequency visualization
      const updateAudioData = () => {
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        setVolume((average / 255) * 100 * sensitivity);
        setFrequencyData(Array.from(dataArray.slice(0, 10))); // Sample for visualizer
        animationFrameRef.current = requestAnimationFrame(updateAudioData);
      };
      updateAudioData();

      // Setup recording
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioURL(URL.createObjectURL(blob));
      };
    } catch (err) {
      setError("Microphone access denied. Please grant permission.");
    }
  }, [sensitivity]);

  // Stop testing
  const stopTesting = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      cancelAnimationFrame(animationFrameRef.current);
      setIsTesting(false);
      setVolume(0);
      setFrequencyData([]);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // Toggle recording
  const toggleRecording = useCallback(() => {
    if (!mediaRecorderRef.current) return;

    if (isRecording) {
      mediaRecorderRef.current.stop();
    } else {
      mediaRecorderRef.current.start();
    }
    setIsRecording(!isRecording);
  }, [isRecording]);

  // Download recording
  const downloadRecording = () => {
    if (audioURL) {
      const link = document.createElement("a");
      link.href = audioURL;
      link.download = `recording-${Date.now()}.webm`;
      link.click();
    }
  };

  // Reset everything
  const reset = () => {
    stopTesting();
    setAudioURL(null);
    setSensitivity(1.0);
    setError("");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopTesting();
  }, [stopTesting]);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Microphone Tester
        </h1>

        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={isTesting ? stopTesting : startTesting}
              className={`flex-1 py-2 px-4 rounded-md text-white transition-colors ${
                isTesting
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              } flex items-center justify-center`}
            >
              {isTesting ? (
                <>
                  <FaStop className="mr-2" /> Stop Testing
                </>
              ) : (
                <>
                  <FaMicrophone className="mr-2" /> Start Testing
                </>
              )}
            </button>
            {isTesting && (
              <button
                onClick={toggleRecording}
                disabled={!isTesting}
                className={`flex-1 py-2 px-4 rounded-md text-white transition-colors ${
                  isRecording
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center`}
              >
                {isRecording ? (
                  <>
                    <FaStop className="mr-2" /> Stop Recording
                  </>
                ) : (
                  <>
                    <FaPlay className="mr-2" /> Start Recording
                  </>
                )}
              </button>
            )}
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Sensitivity Control */}
          {isTesting && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
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
          )}

          {/* Volume Visualizer */}
          {isTesting && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 text-center">
                Microphone Volume Level
              </label>
              <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-6 rounded-full transition-all duration-100"
                  style={{ width: `${Math.min(volume, 100)}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Volume: {Math.round(volume)}%
              </p>

              {/* Frequency Visualizer */}
              <div className="flex justify-center gap-1 h-20">
                {frequencyData.map((value, index) => (
                  <div
                    key={index}
                    className="bg-blue-500 rounded-t"
                    style={{
                      width: "8px",
                      height: `${(value / 255) * 100}%`,
                      transition: "height 0.1s ease",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recorded Audio */}
          {audioURL && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 text-center">
                Recorded Audio
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <audio controls src={audioURL} className="w-full sm:flex-1" />
                <button
                  onClick={downloadRecording}
                  className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-600 text-center bg-red-50 p-2 rounded-md">
              {error}
            </p>
          )}

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Real-time volume visualization</li>
              <li>Frequency spectrum display</li>
              <li>Adjustable sensitivity</li>
              <li>Record and playback audio</li>
              <li>Download recordings as WEBM</li>
            </ul>
          </div>

          {/* Instructions */}
          <p className="text-xs text-gray-500 text-center">
            Note: Requires microphone permission. Speak or make noise to test levels.
            Recordings are stored temporarily in your browser.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MicrophoneTester;