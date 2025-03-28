"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaArrowsAltH, FaArrowsAltV, FaSync, FaLock, FaUnlock } from "react-icons/fa";

const VirtualRulerTool = () => {
  const [rulerSize, setRulerSize] = useState({ width: 200, height: 20 });
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null); // 'horizontal' or 'vertical'
  const [dpi, setDpi] = useState(96); // Default DPI
  const [unit, setUnit] = useState("px"); // 'px', 'in', 'cm'
  const [isLocked, setIsLocked] = useState(false); // Lock position
  const [rotation, setRotation] = useState(0); // Ruler rotation in degrees
  const rulerRef = useRef(null);

  // Handle dragging and resizing
  const handleMouseDown = useCallback((e) => {
    if (e.target.classList.contains("resize-handle-horizontal")) {
      setResizeDirection("horizontal");
    } else if (e.target.classList.contains("resize-handle-vertical")) {
      setResizeDirection("vertical");
    } else if (!isLocked) {
      setIsDragging(true);
    }
  }, [isLocked]);

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging && !isLocked) {
        setPosition({
          x: e.clientX - rulerSize.width / 2,
          y: e.clientY - rulerSize.height / 2,
        });
      } else if (resizeDirection) {
        const rect = rulerRef.current.getBoundingClientRect();
        if (resizeDirection === "horizontal") {
          const newWidth = Math.max(50, e.clientX - rect.left);
          setRulerSize((prev) => ({ ...prev, width: newWidth }));
        } else if (resizeDirection === "vertical") {
          const newHeight = Math.max(20, e.clientY - rect.top);
          setRulerSize((prev) => ({ ...prev, height: newHeight }));
        }
      }
    },
    [isDragging, resizeDirection, isLocked, rulerSize]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setResizeDirection(null);
  }, []);

  // Convert measurements
  const convertMeasurement = (pixels) => {
    switch (unit) {
      case "in":
        return (pixels / dpi).toFixed(2);
      case "cm":
        return (pixels / dpi * 2.54).toFixed(2);
      case "px":
      default:
        return pixels;
    }
  };

  // Reset ruler
  const resetRuler = () => {
    setRulerSize({ width: 200, height: 20 });
    setPosition({ x: 100, y: 100 });
    setRotation(0);
    setDpi(96);
    setUnit("px");
    setIsLocked(false);
  };

  // Calculate ruler markings
  const renderMarkings = () => {
    const markings = [];
    const step = rulerSize.width / 10;
    for (let i = 0; i <= 10; i++) {
      const pos = i * step;
      markings.push(
        <div
          key={i}
          className="absolute h-2 bg-white"
          style={{ left: `${pos}px`, width: "1px" }}
        />
      );
    }
    return markings;
  };

  return (
    <div
      className="min-h-screen  flex flex-col "
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="w-full mx-auto bg-white rounded-xl shadow-lg p-6 mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Virtual Ruler Tool
        </h1>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Screen DPI ({dpi})
            </label>
            <input
              type="range"
              min="72"
              max="300"
              value={dpi}
              onChange={(e) => setDpi(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="px">Pixels (px)</option>
              <option value="in">Inches (in)</option>
              <option value="cm">Centimeters (cm)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rotation ({rotation}°)
            </label>
            <input
              type="range"
              min="-180"
              max="180"
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLocked(!isLocked)}
              className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                isLocked
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-600 text-white hover:bg-gray-700"
              }`}
            >
              {isLocked ? <FaLock className="mr-2" /> : <FaUnlock className="mr-2" />}
              {isLocked ? "Unlock" : "Lock"}
            </button>
            <button
              onClick={resetRuler}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
          <p>Drag the ruler to move it (when unlocked). Use handles to resize horizontally or vertically.</p>
          <p>Adjust DPI and unit for accurate measurements. Rotate as needed.</p>
          <p className="text-xs mt-2 italic">Note: Measurements depend on screen DPI accuracy.</p>
        </div>
      </div>

      {/* Ruler */}
      <div
        ref={rulerRef}
        className="absolute bg-blue-500 text-white p-1 rounded cursor-move flex items-center justify-between shadow-lg"
        style={{
          width: `${rulerSize.width}px`,
          height: `${rulerSize.height}px`,
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center",
          userSelect: "none",
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="text-xs flex-1 text-center">
          {convertMeasurement(rulerSize.width)}
          {unit} (H) x {convertMeasurement(rulerSize.height)}
          {unit} (V)
        </div>
        <div className="relative flex items-center">
          {renderMarkings()}
          <div
            className="w-2 h-full bg-blue-700 resize-handle-horizontal cursor-ew-resize"
            onMouseDown={(e) => e.stopPropagation()}
          />
          <div
            className="w-full h-2 bg-blue-700 resize-handle-vertical cursor-ns-resize absolute bottom-[-8px] left-0"
            onMouseDown={(e) => e.stopPropagation()}
          />
        </div>
      </div>

      {/* Features */}
      <div className="max-w-3xl mx-auto mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
        <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
          <li>Draggable and resizable ruler (horizontal and vertical)</li>
          <li>Customizable DPI and measurement units (px, in, cm)</li>
          <li>Rotation control</li>
          <li>Lock/unlock position</li>
          <li>Reset functionality</li>
        </ul>
      </div>
    </div>
  );
};

export default VirtualRulerTool;