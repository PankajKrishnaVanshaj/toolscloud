"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaLock, FaUnlock } from "react-icons/fa";

const VirtualCompassTool = () => {
  const [heading, setHeading] = useState(null);
  const [error, setError] = useState("");
  const [isManual, setIsManual] = useState(false);
  const [manualHeading, setManualHeading] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [compassSize, setCompassSize] = useState(300); // Size in pixels

  // Handle device orientation
  useEffect(() => {
    let handler;

    const handleOrientation = (event) => {
      const direction = event.webkitCompassHeading || (360 - event.alpha);
      if (direction !== null && direction !== undefined && !isLocked && !isManual) {
        setHeading(direction.toFixed(1));
        setError("");
      }
    };

    if (!isManual && "DeviceOrientationEvent" in window) {
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission()
          .then((permissionState) => {
            if (permissionState === "granted") {
              window.addEventListener("deviceorientation", handleOrientation);
              handler = handleOrientation;
            } else {
              setError("Permission denied. Using manual mode.");
              setIsManual(true);
            }
          })
          .catch((err) => {
            setError("Error requesting permission. Using manual mode.");
            setIsManual(true);
          });
      } else {
        window.addEventListener("deviceorientation", handleOrientation);
        handler = handleOrientation;
      }
    } else if (!isManual) {
      setError("Device orientation not supported. Using manual mode.");
      setIsManual(true);
    }

    return () => {
      if (handler) {
        window.removeEventListener("deviceorientation", handler);
      }
    };
  }, [isManual, isLocked]);

  // Calculate cardinal direction
  const getCardinalDirection = (deg) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  // Compass needle rotation style
  const needleStyle = {
    transform: `rotate(${(isManual ? manualHeading : heading) || 0}deg)`,
    transition: "transform 0.2s ease-out",
  };

  // Reset compass
  const resetCompass = useCallback(() => {
    setManualHeading(0);
    setHeading(null);
    setIsLocked(false);
    setError("");
    if (!isManual && "DeviceOrientationEvent" in window) {
      setIsManual(false);
    }
  }, [isManual]);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Virtual Compass Tool
        </h1>

        {/* Compass Display */}
        <div className="relative flex justify-center mb-6">
          <div
            className="rounded-full border-4 border-gray-300 flex items-center justify-center relative bg-gray-50 overflow-hidden"
            style={{ width: `${compassSize}px`, height: `${compassSize}px` }}
          >
            {/* Compass Grid */}
            {showGrid && (
              <>
                <div className="absolute inset-0 flex justify-center">
                  <div className="w-px h-full bg-gray-200 opacity-50"></div>
                </div>
                <div className="absolute inset-0 flex items-center">
                  <div className="h-px w-full bg-gray-200 opacity-50"></div>
                </div>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-px h-full bg-gray-200 opacity-30"
                    style={{ transform: `rotate(${i * 45}deg)` }}
                  ></div>
                ))}
              </>
            )}

            {/* Cardinal Directions */}
            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-gray-600 font-semibold">
              N
            </span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-gray-600 font-semibold">
              S
            </span>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">
              W
            </span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">
              E
            </span>

            {/* Compass Needle */}
            <div
              className="absolute w-3 h-3/4 bg-red-500 rounded-full origin-bottom"
              style={needleStyle}
            >
              <div className="absolute top-0 w-3 h-1/2 bg-red-700 rounded-t-full" />
            </div>
          </div>
        </div>

        {/* Heading Display */}
        <div className="text-center mb-6">
          <p className="text-lg font-semibold text-gray-800">
            Heading: {(isManual ? manualHeading : heading) || "N/A"}°
          </p>
          <p className="text-gray-600">
            Direction:{" "}
            {isManual
              ? getCardinalDirection(manualHeading)
              : heading
              ? getCardinalDirection(heading)
              : "N/A"}
          </p>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* Manual Mode Controls */}
          {isManual && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manual Heading (0-360°)
              </label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={manualHeading}
                  onChange={(e) => setManualHeading(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <input
                  type="number"
                  min="0"
                  max="360"
                  value={manualHeading}
                  onChange={(e) =>
                    setManualHeading(Math.min(360, Math.max(0, Number(e.target.value))))
                  }
                  className="w-20 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Additional Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compass Size ({compassSize}px)
              </label>
              <input
                type="range"
                min="200"
                max="500"
                value={compassSize}
                onChange={(e) => setCompassSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Show Grid</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setIsManual(!isManual)}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              {isManual ? "Try Device Mode" : "Switch to Manual Mode"}
            </button>
            <button
              onClick={() => setIsLocked(!isLocked)}
              disabled={isManual}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLocked ? <FaUnlock className="mr-2" /> : <FaLock className="mr-2" />}
              {isLocked ? "Unlock" : "Lock"} Heading
            </button>
            <button
              onClick={resetCompass}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Device orientation support (with permission handling)</li>
            <li>Manual mode with adjustable heading</li>
            <li>Lock/unlock current heading</li>
            <li>Customizable compass size</li>
            <li>Toggleable grid for better readability</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VirtualCompassTool;