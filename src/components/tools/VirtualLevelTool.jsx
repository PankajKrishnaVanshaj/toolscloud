"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaLock, FaUnlock } from "react-icons/fa";

const VirtualLevelTool = () => {
  const [angles, setAngles] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [isSupported, setIsSupported] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [calibrationOffset, setCalibrationOffset] = useState({ beta: 0, gamma: 0 });
  const [bubbleSize, setBubbleSize] = useState(48); // Size in pixels
  const [levelThreshold, setLevelThreshold] = useState(2); // Degrees for "level" zone

  // Request permission and start listening
  const requestPermission = async () => {
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === "granted") {
          setPermissionGranted(true);
          window.addEventListener("deviceorientation", handleOrientation);
        }
      } catch (error) {
        setIsSupported(false);
      }
    } else if ("ondeviceorientation" in window) {
      setPermissionGranted(true);
      window.addEventListener("deviceorientation", handleOrientation);
    } else {
      setIsSupported(false);
    }
  };

  // Handle orientation changes
  const handleOrientation = useCallback(
    (event) => {
      if (!isLocked) {
        setAngles({
          alpha: event.alpha || 0,
          beta: (event.beta || 0) - calibrationOffset.beta,
          gamma: (event.gamma || 0) - calibrationOffset.gamma,
        });
      }
    },
    [isLocked, calibrationOffset]
  );

  // Cleanup event listener
  useEffect(() => {
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [handleOrientation]);

  // Calibrate to current position
  const calibrate = () => {
    setCalibrationOffset({ beta: angles.beta, gamma: angles.gamma });
  };

  // Reset to default
  const reset = () => {
    setCalibrationOffset({ beta: 0, gamma: 0 });
    setBubbleSize(48);
    setLevelThreshold(2);
    setIsLocked(false);
  };

  // Calculate bubble position with bounds
  const bubblePosition = {
    x: Math.min(Math.max(angles.gamma * 2, -90), 90),
    y: Math.min(Math.max(angles.beta * 2, -90), 90),
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Virtual Level Tool
        </h1>

        {!permissionGranted && isSupported && (
          <div className="text-center">
            <button
              onClick={requestPermission}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Enable Level Tool
            </button>
            <p className="mt-2 text-sm text-gray-500">
              Grant motion sensor permission to start
            </p>
          </div>
        )}

        {!isSupported && (
          <p className="text-center text-red-600 font-medium">
            Device orientation not supported on this device/browser.
          </p>
        )}

        {permissionGranted && (
          <div className="space-y-6">
            {/* Level Visualization */}
            <div className="relative w-64 h-64 mx-auto">
              <div className="absolute inset-0 border-4 border-gray-700 rounded-full bg-gray-100 overflow-hidden">
                {/* Grid Lines */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-400"></div>
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400"></div>
                {/* Level Zone */}
                <div
                  className="absolute bg-green-200 opacity-30 rounded-full"
                  style={{
                    width: `${levelThreshold * 4}px`,
                    height: `${levelThreshold * 4}px`,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
                {/* Center Mark */}
                <div className="absolute left-1/2 top-1/2 w-2 h-2 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              </div>
              {/* Bubble */}
              <div
                className="absolute bg-blue-500 rounded-full opacity-70 transition-all duration-100"
                style={{
                  width: `${bubbleSize}px`,
                  height: `${bubbleSize}px`,
                  left: `calc(50% + ${bubblePosition.x}px - ${bubbleSize / 2}px)`,
                  top: `calc(50% + ${bubblePosition.y}px - ${bubbleSize / 2}px)`,
                }}
              />
            </div>

            {/* Angle Readings */}
            <div className="text-center space-y-2">
              <p className="text-sm">
                <span className="font-medium">Horizontal Tilt (γ):</span>{" "}
                {angles.gamma.toFixed(1)}°
              </p>
              <p className="text-sm">
                <span className="font-medium">Vertical Tilt (β):</span>{" "}
                {angles.beta.toFixed(1)}°
              </p>
              <p className="text-sm">
                <span className="font-medium">Rotation (α):</span> {angles.alpha.toFixed(1)}°
              </p>
            </div>

            {/* Level Indicator */}
            <div className="text-center">
              {Math.abs(angles.gamma) <= levelThreshold &&
              Math.abs(angles.beta) <= levelThreshold ? (
                <p className="text-green-600 font-semibold text-lg">LEVEL</p>
              ) : (
                <p className="text-red-600 font-semibold text-lg">NOT LEVEL</p>
              )}
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bubble Size ({bubbleSize}px)
                </label>
                <input
                  type="range"
                  min="24"
                  max="72"
                  value={bubbleSize}
                  onChange={(e) => setBubbleSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level Threshold ({levelThreshold}°)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={levelThreshold}
                  onChange={(e) => setLevelThreshold(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={calibrate}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Calibrate
              </button>
              <button
                onClick={() => setIsLocked(!isLocked)}
                className={`flex-1 py-2 px-4 ${
                  isLocked ? "bg-yellow-600 hover:bg-yellow-700" : "bg-gray-600 hover:bg-gray-700"
                } text-white rounded-md transition-colors flex items-center justify-center`}
              >
                {isLocked ? <FaLock className="mr-2" /> : <FaUnlock className="mr-2" />}
                {isLocked ? "Unlock" : "Lock"}
              </button>
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Real-time horizontal and vertical tilt measurement</li>
            <li>Adjustable bubble size and level threshold</li>
            <li>Calibration to set current position as level</li>
            <li>Lock/Unlock orientation readings</li>
            <li>Visual level indicator with green zone</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: Requires a device with motion sensors. Best on mobile devices.
        </p>
      </div>
    </div>
  );
};

export default VirtualLevelTool;