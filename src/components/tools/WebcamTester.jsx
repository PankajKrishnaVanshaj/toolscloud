// components/WebcamTester.js
'use client';

import React, { useState, useRef, useEffect } from 'react';

const WebcamTester = () => {
  const videoRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const [facingMode, setFacingMode] = useState('user'); // 'user' for front, 'environment' for rear
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  // Get available video devices
  const getDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      setError('Failed to enumerate devices.');
    }
  };

  // Start webcam stream
  const startWebcam = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
            facingMode: selectedDeviceId ? undefined : facingMode 
          }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsStreaming(true);
          setError('');
        }
      } catch (err) {
        setError('Failed to access webcam. Please ensure it\'s connected and permissions are granted.');
      }
    } else {
      setError('Webcam access not supported in this browser.');
    }
  };

  // Stop webcam stream
  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  // Toggle camera facing mode
  const toggleFacingMode = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    if (isStreaming) {
      stopWebcam();
      setTimeout(startWebcam, 100); // Restart with new facing mode
    }
  };

  // Handle device change
  const handleDeviceChange = (e) => {
    setSelectedDeviceId(e.target.value);
    if (isStreaming) {
      stopWebcam();
      setTimeout(startWebcam, 100); // Restart with new device
    }
  };

  // Initial setup
  useEffect(() => {
    getDevices();
    return () => stopWebcam(); // Cleanup on unmount
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Webcam Tester</h1>

      <div className="space-y-4">
        {/* Video Display */}
        <div className="relative bg-gray-200 rounded-md overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-auto"
          />
          {!isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              Webcam feed will appear here
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={startWebcam}
            disabled={isStreaming}
            className={`px-4 py-2 rounded-md text-white transition-colors ${
              isStreaming 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            Start Webcam
          </button>
          <button
            onClick={stopWebcam}
            disabled={!isStreaming}
            className={`px-4 py-2 rounded-md text-white transition-colors ${
              !isStreaming 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            Stop Webcam
          </button>
          <button
            onClick={toggleFacingMode}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Switch Camera ({facingMode === 'user' ? 'Front' : 'Rear'})
          </button>
        </div>

        {/* Device Selection */}
        {devices.length > 1 && (
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Camera
            </label>
            <select
              value={selectedDeviceId}
              onChange={handleDeviceChange}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {devices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${devices.indexOf(device) + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        {/* Instructions */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: This tool requires webcam permission. Ensure your webcam is connected and
          browser permissions are granted. Works best in secure contexts (HTTPS or localhost).
        </p>
      </div>
    </div>
  );
};

export default WebcamTester;