"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaPlus, FaMinus, FaSync, FaPlay } from "react-icons/fa";

const VirtualSpinnerWheel = () => {
  const [segments, setSegments] = useState([
    "Prize 1",
    "Prize 2",
    "Prize 3",
    "Prize 4",
    "Prize 5",
    "Prize 6",
  ]);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState("");
  const [spinDuration, setSpinDuration] = useState(3); // In seconds
  const [wheelSize, setWheelSize] = useState(300); // In pixels
  const wheelRef = useRef(null);

  // Spin the wheel
  const spinWheel = useCallback(() => {
    if (isSpinning || segments.length < 2) return;

    setIsSpinning(true);
    setResult("");

    const randomSpins = Math.floor(Math.random() * 5) + 5; // 5-10 spins
    const randomAngle = Math.random() * 360;
    const totalRotation = randomSpins * 360 + randomAngle;

    setRotation(totalRotation);

    setTimeout(() => {
      const finalAngle = totalRotation % 360;
      const segmentAngle = 360 / segments.length;
      const winningIndex = Math.floor(((360 - finalAngle) % 360) / segmentAngle);
      setResult(segments[winningIndex]);
      setIsSpinning(false);
    }, spinDuration * 1000);
  }, [isSpinning, segments, spinDuration]);

  // Handle segment changes
  const handleSegmentChange = (index, value) => {
    const newSegments = [...segments];
    newSegments[index] = value;
    setSegments(newSegments);
  };

  // Add or remove segments
  const addSegment = () => {
    if (segments.length < 12) {
      setSegments((prev) => [...prev, `Prize ${prev.length + 1}`]);
    }
  };

  const removeSegment = (index) => {
    if (segments.length > 2) {
      setSegments((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Reset wheel
  const resetWheel = () => {
    setSegments(["Prize 1", "Prize 2", "Prize 3", "Prize 4", "Prize 5", "Prize 6"]);
    setRotation(0);
    setResult("");
    setSpinDuration(3);
    setWheelSize(300);
    setIsSpinning(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Virtual Spinner Wheel
        </h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Wheel */}
          <div className="flex justify-center">
            <div
              className="relative"
              style={{ width: `${wheelSize}px`, height: `${wheelSize}px` }}
            >
              <div
                ref={wheelRef}
                className="w-full h-full rounded-full overflow-hidden shadow-md transition-transform ease-out"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transitionDuration: `${spinDuration}s`,
                }}
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
                        className="absolute text-white text-sm font-medium transform"
                        style={{
                          top: "10%",
                          left: "50%",
                          transform: "translateX(-50%) rotate(-90deg)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {segment}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 w-0 h-0 -translate-x-1/2 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-red-600 z-10"></div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex-1 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={spinWheel}
                disabled={isSpinning || segments.length < 2}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaPlay className="mr-2" />
                {isSpinning ? "Spinning..." : "Spin the Wheel"}
              </button>
              <button
                onClick={resetWheel}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>

            {result && (
              <div className="text-center p-4 bg-green-100 rounded-lg">
                <p className="text-lg font-semibold text-green-700">
                  You landed on: <span className="font-bold">{result}</span>
                </p>
              </div>
            )}

            {/* Settings */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium textphysics-700 mb-1">
                  Spin Duration ({spinDuration}s)
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={spinDuration}
                  onChange={(e) => setSpinDuration(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wheel Size ({wheelSize}px)
                </label>
                <input
                  type="range"
                  min="200"
                  max="500"
                  step="10"
                  value={wheelSize}
                  onChange={(e) => setWheelSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Segment Editor */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Edit Segments</h3>
                  <button
                    onClick={addSegment}
                    disabled={segments.length >= 12}
                    className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <FaPlus size={12} />
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {segments.map((segment, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={segment}
                        onChange={(e) => handleSegmentChange(index, e.target.value)}
                        className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder={`Segment ${index + 1}`}
                      />
                      <button
                        onClick={() => removeSegment(index)}
                        disabled={segments.length <= 2}
                        className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        <FaMinus size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable segments (2-12)</li>
            <li>Adjustable spin duration and wheel size</li>
            <li>Randomized spinning with smooth animation</li>
            <li>Real-time result display</li>
            <li>Reset functionality</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VirtualSpinnerWheel;