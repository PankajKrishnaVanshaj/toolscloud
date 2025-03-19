"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaSync, FaLock, FaUnlock, FaVolumeUp, FaVolumeMute } from "react-icons/fa";

const VirtualBubbleLevel = () => {
  const [angleX, setAngleX] = useState(0); // Tilt left/right
  const [angleY, setAngleY] = useState(0); // Tilt forward/back
  const [hasPermission, setHasPermission] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [bubbleSize, setBubbleSize] = useState(12); // Tailwind size (w-12 = 3rem)
  const [sensitivity, setSensitivity] = useState(1.0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const containerRef = useRef(null);
  const audioRef = useRef(null);

  // Request device orientation permission
  const requestOrientationPermission = useCallback(async () => {
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === "granted") {
          setHasPermission(true);
          window.addEventListener("deviceorientation", handleOrientation);
        }
      } catch (error) {
        console.error("Permission denied", error);
      }
    } else {
      setHasPermission(true);
      window.addEventListener("deviceorientation", handleOrientation);
    }
  }, []);

  // Handle device orientation
  const handleOrientation = useCallback(
    (event) => {
      if (isLocked) return;
      const beta = (event.beta || 0) * sensitivity; // X-axis (front-back tilt)
      const gamma = (event.gamma || 0) * sensitivity; // Y-axis (left-right tilt)
      setAngleX(Math.min(Math.max(gamma, -45), 45));
      setAngleY(Math.min(Math.max(beta, -45), 45));
      playLevelSound();
    },
    [isLocked, sensitivity]
  );

  // Fallback: ව: Mouse movement for desktop
  const handleMouseMove = useCallback(
    (e) => {
      if (isLocked || hasPermission) return;
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        setAngleX((x / rect.width) * 90 * sensitivity);
        setAngleY((y / rect.height) * 90 * sensitivity);
        playLevelSound();
      }
    },
    [isLocked, sensitivity, hasPermission]
  );

  // Play sound when level
  const playLevelSound = () => {
    if (soundEnabled && audioRef.current && isLevel) {
      audioRef.current.play().catch(() => {});
    }
  };

  // Clean up
  useEffect(() => {
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [handleOrientation]);

  // Reset function
  const reset = () => {
    setAngleX(0);
    setAngleY(0);
    setIsLocked(false);
    setBubbleSize(12);
    setSensitivity(1.0);
    setSoundEnabled(false);
  };

  // Calculate bubble position
  const bubbleX = (angleX / 45) * 50;
  const bubbleY = (angleY / 45) * 50;
  const isLevel = Math.abs(angleX) < 2 && Math.abs(angleY) < 2;

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Virtual Bubble Level
        </h1>

        <div className="space-y-6">
          {/* Level Container */}
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden border-2 border-gray-400"
          >
            {/* Grid Lines */}
            <div className="absolute inset-0 flex justify-center items-center">
              <div className="w-px h-full bg-gray-400"></div>
              <div className="h-px w-full bg-gray-400 absolute"></div>
            </div>

            {/* Bubble */}
            <div
              className={`absolute w-${bubbleSize} h-${bubbleSize} rounded-full transition-all duration-100 ${
                isLevel ? "bg-green-500" : "bg-blue-500"
              }`}
              style={{
                left: `calc(50% + ${bubbleX}% - ${bubbleSize / 4}rem)`,
                top: `calc(50% + ${bubbleY}% - ${bubbleSize / 4}rem)`,
              }}
            ></div>
          </div>

          {/* Readings */}
          <div className="text-center space-y-2">
            <p className="text-sm">
              X-Axis (Left/Right):{" "}
              <span className="font-medium">{angleX.toFixed(1)}°</span>
            </p>
            <p className="text-sm">
              Y-Axis (Front/Back):{" "}
              <span className="font-medium">{angleY.toFixed(1)}°</span>
            </p>
            <p className="text-sm">
              Status:{" "}
              <span
                className={`font-medium ${isLevel ? "text-green-600" : "text-red-600"}`}
              >
                {isLevel ? "Level" : "Not Level"}
              </span>
            </p>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bubble Size
              </label>
              <input
                type="range"
                min="8"
                max="16"
                value={bubbleSize}
                onChange={(e) => setBubbleSize(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
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
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {!hasPermission && (
              <button
                onClick={requestOrientationPermission}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaUnlock className="mr-2" /> Use Device Orientation
              </button>
            )}
            <button
              onClick={() => setIsLocked(!isLocked)}
              className={`flex-1 py-2 px-4 ${
                isLocked ? "bg-yellow-600" : "bg-gray-600"
              } text-white rounded-md hover:${
                isLocked ? "bg-yellow-700" : "bg-gray-700"
              } transition-colors flex items-center justify-center`}
            >
              {isLocked ? <FaLock className="mr-2" /> : <FaUnlock className="mr-2" />}
              {isLocked ? "Unlock" : "Lock"}
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              {soundEnabled ? <FaVolumeUp className="mr-2" /> : <FaVolumeMute className="mr-2" />}
              {soundEnabled ? "Mute" : "Sound"}
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Audio for level sound */}
        <audio ref={audioRef} src="/level-sound.mp3" preload="auto" />

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Device orientation support (mobile)</li>
            <li>Mouse movement simulation (desktop)</li>
            <li>Adjustable bubble size and sensitivity</li>
            <li>Lock orientation feature</li>
            <li>Sound feedback when level</li>
          </ul>
        </div>

        {/* Instructions */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          {hasPermission
            ? "Tilt your device to move the bubble."
            : "Move your mouse over the square to simulate tilt, or enable device orientation on mobile."}
        </p>
      </div>
    </div>
  );
};

export default VirtualBubbleLevel;