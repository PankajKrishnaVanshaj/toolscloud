// components/MouseSensitivityTester.js
'use client';

import React, { useState, useEffect, useRef } from 'react';

const MouseSensitivityTester = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [targetPosition, setTargetPosition] = useState({ x: 300, y: 200 });
  const [hits, setHits] = useState(0);
  const [isTesting, setIsTesting] = useState(false);
  const testAreaRef = useRef(null);
  const lastTimeRef = useRef(performance.now());

  const handleMouseMove = (e) => {
    if (!testAreaRef.current) return;

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
    setDistance(prev => prev + movement);
    setSpeed(movement / timeDiff);

    // Check if mouse is over target
    const targetDistance = Math.sqrt(
      Math.pow(x - targetPosition.x, 2) + Math.pow(y - targetPosition.y, 2)
    );
    if (targetDistance < 25 && isTesting) { // 25px radius
      moveTarget();
      setHits(prev => prev + 1);
    }
  };

  const moveTarget = () => {
    if (!testAreaRef.current) return;
    const rect = testAreaRef.current.getBoundingClientRect();
    const newX = Math.random() * (rect.width - 50); // 50px buffer
    const newY = Math.random() * (rect.height - 50);
    setTargetPosition({ x: newX, y: newY });
  };

  const startTest = () => {
    setIsTesting(true);
    setDistance(0);
    setHits(0);
    setSpeed(0);
    moveTarget();
  };

  const stopTest = () => {
    setIsTesting(false);
  };

  useEffect(() => {
    if (isTesting) {
      const timer = setTimeout(stopTest, 10000); // 10-second test
      return () => clearTimeout(timer);
    }
  }, [isTesting]);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Mouse Sensitivity Tester</h1>

      <div className="space-y-6">
        {/* Test Area */}
        <div
          ref={testAreaRef}
          className="relative w-full h-96 bg-gray-100 rounded-md border overflow-hidden"
          onMouseMove={handleMouseMove}
        >
          {/* Mouse Cursor Indicator */}
          <div
            className="absolute w-4 h-4 bg-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: position.x, top: position.y }}
          />
          
          {/* Target */}
          {isTesting && (
            <div
              className="absolute w-8 h-8 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{ left: targetPosition.x, top: targetPosition.y }}
            />
          )}
        </div>

        {/* Controls and Stats */}
        <div className="space-y-4">
          <div className="flex justify-center gap-4">
            <button
              onClick={startTest}
              disabled={isTesting}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              Start Test
            </button>
            <button
              onClick={stopTest}
              disabled={!isTesting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
            >
              Stop Test
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-medium">Distance Moved</p>
              <p className="text-lg">{distance.toFixed(1)} px</p>
            </div>
            <div>
              <p className="font-medium">Speed</p>
              <p className="text-lg">{speed.toFixed(1)} px/s</p>
            </div>
            <div>
              <p className="font-medium">Targets Hit</p>
              <p className="text-lg">{hits}</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <p className="text-sm text-gray-500 text-center">
          {isTesting
            ? 'Move your mouse to hit the red target! Test ends in 10 seconds.'
            : 'Click "Start Test" to begin. Move your mouse to follow the target and test your sensitivity.'}
        </p>
      </div>
    </div>
  );
};

export default MouseSensitivityTester;