"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaPlay, FaStop, FaSync, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading results

const MouseSensitivityTester = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [targetPosition, setTargetPosition] = useState({ x: 300, y: 200 });
  const [hits, setHits] = useState(0);
  const [isTesting, setIsTesting] = useState(false);
  const [testDuration, setTestDuration] = useState(10); // In seconds
  const [targetSize, setTargetSize] = useState(32); // In pixels
  const [remainingTime, setRemainingTime] = useState(0);
  const testAreaRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const timerRef = useRef(null);

  // Handle mouse movement
  const handleMouseMove = useCallback(
    (e) => {
      if (!testAreaRef.current || !isTesting) return;

      const rect = testAreaRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const now = performance.now();
      const timeDiff = (now - lastTimeRef.current) / 1000; // seconds
      lastTimeRef.current = now;

      const dx = x - lastPosition.x;
      const dy = y - lastPosition.y;
      const movement = Math.sqrt(dx * dx + dy * dy);

      setPosition({ x, y });
      setLastPosition({ x, y });
      setDistance((prev) => prev + movement);
      setSpeed(movement / timeDiff);

      // Check if mouse hits target
      const targetDistance = Math.sqrt(
        Math.pow(x - targetPosition.x, 2) + Math.pow(y - targetPosition.y, 2)
      );
      if (targetDistance < targetSize / 2) {
        moveTarget();
        setHits((prev) => prev + 1);
      }
    },
    [isTesting, lastPosition, targetPosition, targetSize]
  );

  // Move target to a new random position
  const moveTarget = useCallback(() => {
    if (!testAreaRef.current) return;
    const rect = testAreaRef.current.getBoundingClientRect();
    const newX = Math.random() * (rect.width - targetSize);
    const newY = Math.random() * (rect.height - targetSize);
    setTargetPosition({ x: newX, y: newY });
  }, [targetSize]);

  // Start the test
  const startTest = () => {
    setIsTesting(true);
    setDistance(0);
    setHits(0);
    setSpeed(0);
    setRemainingTime(testDuration);
    lastTimeRef.current = performance.now();
    moveTarget();
  };

  // Stop the test
  const stopTest = () => {
    setIsTesting(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Reset all settings
  const resetTest = () => {
    stopTest();
    setDistance(0);
    setHits(0);
    setSpeed(0);
    setRemainingTime(0);
    setPosition({ x: 0, y: 0 });
    setLastPosition({ x: 0, y: 0 });
    setTargetPosition({ x: 300, y: 200 });
  };

  // Download test results
  const downloadResults = () => {
    if (testAreaRef.current) {
      html2canvas(testAreaRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `mouse-sensitivity-test-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  // Timer logic
  useEffect(() => {
    if (isTesting) {
      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 0) {
            stopTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [isTesting]);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Mouse Sensitivity Tester
        </h1>

        <div className="space-y-6">
          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Duration (seconds)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={testDuration}
                onChange={(e) => setTestDuration(Math.max(5, Math.min(60, e.target.value)))}
                disabled={isTesting}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Size (px)
              </label>
              <input
                type="range"
                min="16"
                max="64"
                value={targetSize}
                onChange={(e) => setTargetSize(e.target.value)}
                disabled={isTesting}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-sm text-gray-600">{targetSize}px</span>
            </div>
          </div>

          {/* Test Area */}
          <div
            ref={testAreaRef}
            className="relative w-full h-96 bg-gray-100 rounded-md border overflow-hidden"
            onMouseMove={handleMouseMove}
          >
            {/* Mouse Cursor Indicator */}
            <div
              className="absolute w-4 h-4 bg-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform"
              style={{ left: position.x, top: position.y }}
            />
            {/* Target */}
            {isTesting && (
              <div
                className="absolute bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-in-out"
                style={{
                  left: targetPosition.x,
                  top: targetPosition.y,
                  width: `${targetSize}px`,
                  height: `${targetSize}px`,
                }}
              />
            )}
          </div>

          {/* Controls and Stats */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={startTest}
                disabled={isTesting}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaPlay className="mr-2" /> Start Test
              </button>
              <button
                onClick={stopTest}
                disabled={!isTesting}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaStop className="mr-2" /> Stop Test
              </button>
              <button
                onClick={resetTest}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
              <button
                onClick={downloadResults}
                disabled={isTesting}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div>
                <p className="font-medium text-gray-700">Distance Moved</p>
                <p className="text-lg text-gray-900">{distance.toFixed(1)} px</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Speed</p>
                <p className="text-lg text-gray-900">{speed.toFixed(1)} px/s</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Targets Hit</p>
                <p className="text-lg text-gray-900">{hits}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Time Remaining</p>
                <p className="text-lg text-gray-900">{remainingTime}s</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <p className="text-sm text-gray-500 text-center">
            {isTesting
              ? `Move your mouse to hit the red target! Test ends in ${remainingTime} seconds.`
              : 'Adjust settings and click "Start Test" to begin. Hit the target as many times as possible!'}
          </p>

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Customizable test duration (5-60 seconds)</li>
              <li>Adjustable target size (16-64px)</li>
              <li>Real-time distance, speed, and hit tracking</li>
              <li>Countdown timer</li>
              <li>Download test results as PNG</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MouseSensitivityTester;