// components/VirtualSpinnerWheel.js
'use client';

import React, { useState, useRef } from 'react';

const VirtualSpinnerWheel = () => {
  const [segments, setSegments] = useState([
    'Prize 1', 'Prize 2', 'Prize 3', 'Prize 4', 'Prize 5', 'Prize 6'
  ]);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState('');
  const wheelRef = useRef(null);

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult('');

    // Generate random rotation (between 5 and 10 full spins + random angle)
    const randomSpins = Math.floor(Math.random() * 5) + 5; // 5-10 spins
    const randomAngle = Math.random() * 360;
    const totalRotation = randomSpins * 360 + randomAngle;

    setRotation(totalRotation);

    // Calculate result after animation
    setTimeout(() => {
      const finalAngle = totalRotation % 360;
      const segmentAngle = 360 / segments.length;
      const winningIndex = Math.floor(((360 - finalAngle) % 360) / segmentAngle);
      setResult(segments[winningIndex]);
      setIsSpinning(false);
    }, 3000); // Match animation duration
  };

  const handleSegmentChange = (index, value) => {
    const newSegments = [...segments];
    newSegments[index] = value;
    setSegments(newSegments);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Virtual Spinner Wheel</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Wheel */}
        <div className="relative w-64 h-64 mx-auto">
          <div
            ref={wheelRef}
            className="w-full h-full rounded-full overflow-hidden transition-transform duration-3000 ease-out"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {segments.map((segment, index) => {
              const angle = (360 / segments.length) * index;
              const segmentColor = `hsl(${(index * 360) / segments.length}, 70%, 50%)`;
              return (
                <div
                  key={index}
                  className="absolute w-full h-full"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    clipPath: `polygon(50% 50%, 100% 50%, 100% 0%, 50% 0%)`,
                    backgroundColor: segmentColor,
                  }}
                >
                  <span
                    className="absolute text-white text-sm font-medium transform -rotate-90"
                    style={{
                      top: '10%',
                      left: '50%',
                      transform: 'translateX(-50%) rotate(-90deg)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {segment}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 w-0 h-0 -translate-x-1/2 border-l-[10px] border-r-[10px] border-t-[20px] border-l-transparent border-r-transparent border-t-red-600"></div>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-4">
          <button
            onClick={spinWheel}
            disabled={isSpinning}
            className={`w-full px-6 py-2 rounded-md text-white transition-colors ${
              isSpinning
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isSpinning ? 'Spinning...' : 'Spin the Wheel'}
          </button>

          {result && (
            <div className="text-center p-3 bg-green-100 rounded-md">
              <p className="text-lg font-semibold text-green-700">
                You landed on: {result}
              </p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Edit Segments</h3>
            <div className="space-y-2">
              {segments.map((segment, index) => (
                <input
                  key={index}
                  type="text"
                  value={segment}
                  onChange={(e) => handleSegmentChange(index, e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder={`Segment ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: Enter your own segment values and spin the wheel to get a random result!
      </p>
    </div>
  );
};

export default VirtualSpinnerWheel;