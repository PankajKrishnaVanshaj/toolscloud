"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaPlay, FaStop, FaCamera, FaDownload, FaSync, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

const WebcamTester = () => {
  const videoRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState("");
  const [facingMode, setFacingMode] = useState("user");
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [resolution, setResolution] = useState({ width: 1280, height: 720 });
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [snapshot, setSnapshot] = useState(null);
  const [isMirrored, setIsMirrored] = useState(true);

  // Get available video devices
  const getDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === "videoinput");
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      setError("Failed to enumerate devices.");
    }
  }, [selectedDeviceId]);

  // Start webcam stream
  const startWebcam = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Webcam access not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          facingMode: selectedDeviceId ? undefined : facingMode,
          width: { ideal: resolution.width },
          height: { ideal: resolution.height },
        },
        audio: isAudioEnabled,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError("");
        setSnapshot(null);
      }
    } catch (err) {
      setError("Failed to access webcam or microphone. Ensure permissions are granted.");
    }
  }, [selectedDeviceId, facingMode, resolution, isAudioEnabled]);

  // Stop webcam stream
  const stopWebcam = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  }, []);

  // Toggle camera facing mode
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    if (isStreaming) {
      stopWebcam();
      setTimeout(startWebcam, 100);
    }
  };

  // Handle device change
  const handleDeviceChange = (e) => {
    setSelectedDeviceId(e.target.value);
    if (isStreaming) {
      stopWebcam();
      setTimeout(startWebcam, 100);
    }
  };

  // Capture snapshot
  const captureSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      setSnapshot(canvas.toDataURL("image/png"));
    }
  };

  // Download snapshot
  const downloadSnapshot = () => {
    if (snapshot) {
      const link = document.createElement("a");
      link.download = `webcam-snapshot-${Date.now()}.png`;
      link.href = snapshot;
      link.click();
    }
  };

  // Reset settings
  const reset = () => {
    stopWebcam();
    setFacingMode("user");
    setSelectedDeviceId(devices[0]?.deviceId || "");
    setResolution({ width: 1280, height: 720 });
    setIsAudioEnabled(false);
    setSnapshot(null);
    setIsMirrored(true);
    setError("");
  };

  // Initial setup and cleanup
  useEffect(() => {
    getDevices();
    return () => stopWebcam();
  }, [getDevices, stopWebcam]);

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Webcam Tester
        </h1>

        <div className="space-y-6">
          {/* Video Display */}
          <div className="relative bg-gray-200 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`w-full h-auto ${isMirrored ? "scale-x-[-1]" : ""}`}
            />
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                Webcam feed will appear here
              </div>
            )}
            {snapshot && (
              <div className="absolute inset-0 flex items-center justify-center">
                <img src={snapshot} alt="Snapshot" className="max-w-full max-h-full rounded-lg" />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={startWebcam}
              disabled={isStreaming}
              className={`flex items-center justify-center py-2 px-4 rounded-md text-white transition-colors ${
                isStreaming
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <FaPlay className="mr-2" /> Start
            </button>
            <button
              onClick={stopWebcam}
              disabled={!isStreaming}
              className={`flex items-center justify-center py-2 px-4 rounded-md text-white transition-colors ${
                !isStreaming
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              <FaStop className="mr-2" /> Stop
            </button>
            <button
              onClick={toggleFacingMode}
              className="flex items-center justify-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FaCamera className="mr-2" /> Switch ({facingMode === "user" ? "Front" : "Rear"})
            </button>
            <button
              onClick={captureSnapshot}
              disabled={!isStreaming}
              className={`flex items-center justify-center py-2 px-4 rounded-md text-white transition-colors ${
                !isStreaming
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              <FaCamera className="mr-2" /> Snapshot
            </button>
            <button
              onClick={downloadSnapshot}
              disabled={!snapshot}
              className={`flex items-center justify-center py-2 px-4 rounded-md text-white transition-colors ${
                !snapshot
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <FaDownload className="mr-2" /> Download
            </button>
            <button
              onClick={reset}
              className="flex items-center justify-center py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {devices.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Camera
                </label>
                <select
                  value={selectedDeviceId}
                  onChange={handleDeviceChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  {devices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${devices.indexOf(device) + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resolution
              </label>
              <select
                value={`${resolution.width}x${resolution.height}`}
                onChange={(e) => {
                  const [width, height] = e.target.value.split("x").map(Number);
                  setResolution({ width, height });
                  if (isStreaming) {
                    stopWebcam();
                    setTimeout(startWebcam, 100);
                  }
                }}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="640x480">640x480</option>
                <option value="1280x720">1280x720</option>
                <option value="1920x1080">1920x1080</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isAudioEnabled}
                  onChange={(e) => {
                    setIsAudioEnabled(e.target.checked);
                    if (isStreaming) {
                      stopWebcam();
                      setTimeout(startWebcam, 100);
                    }
                  }}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Enable Audio</span>
              </label>
              {isAudioEnabled && (
                <span className="ml-2">
                  {isStreaming ? <FaMicrophone /> : <FaMicrophoneSlash />}
                </span>
              )}
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isMirrored}
                  onChange={(e) => setIsMirrored(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Mirror Video</span>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Switch between front and rear cameras</li>
              <li>Select from multiple camera devices</li>
              <li>Adjustable resolution (480p, 720p, 1080p)</li>
              <li>Audio toggle with microphone support</li>
              <li>Capture and download snapshots</li>
              <li>Mirror video option</li>
            </ul>
          </div>

          {/* Instructions */}
          <p className="text-xs text-gray-500 text-center">
            Note: Requires webcam and microphone permissions. Works best in secure contexts
            (HTTPS or localhost).
          </p>
        </div>
      </div>
    </div>
  );
};

export default WebcamTester;