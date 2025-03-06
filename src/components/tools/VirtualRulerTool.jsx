// components/VirtualRulerTool.js
'use client';

import React, { useState, useRef } from 'react';

const VirtualRulerTool = () => {
  const [rulerSize, setRulerSize] = useState({ width: 200, height: 20 });
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dpi, setDpi] = useState(96); // Default DPI for most screens
  const rulerRef = useRef(null);

  // Handle dragging
  const handleMouseDown = (e) => {
    if (e.target.classList.contains('resize-handle')) {
      setIsResizing(true);
    } else {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - rulerSize.width / 2,
        y: e.clientY - rulerSize.height / 2,
      });
    } else if (isResizing) {
      const rect = rulerRef.current.getBoundingClientRect();
      const newWidth = Math.max(50, e.clientX - rect.left);
      setRulerSize({ ...rulerSize, width: newWidth });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  // Convert pixels to inches/cm based on DPI
  const pixelsToInches = (pixels) => (pixels / dpi).toFixed(2);
  const pixelsToCm = (pixels) => (pixels / dpi * 2.54).toFixed(2);

  return (
    <div 
      className="min-h-screen bg-gray-100 p-6"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Virtual Ruler Tool</h1>

        {/* DPI Setting */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Screen DPI (default 96)
          </label>
          <input
            type="number"
            value={dpi}
            onChange={(e) => setDpi(Math.max(1, Number(e.target.value)))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="1"
          />
          <p className="text-xs text-gray-500 mt-1">
            Adjust DPI based on your screen (typical range: 72-120)
          </p>
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-600 mb-4">
          <p>Drag the ruler to move it. Drag the right edge to resize.</p>
          <p>Measurements are approximate and depend on screen DPI accuracy.</p>
        </div>
      </div>

      {/* Ruler */}
      <div
        ref={rulerRef}
        className="absolute bg-blue-500 text-white p-1 rounded cursor-move flex items-center justify-between"
        style={{
          width: `${rulerSize.width}px`,
          height: `${rulerSize.height}px`,
          left: `${position.x}px`,
          top: `${position.y}px`,
          userSelect: 'none',
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="text-xs">
          {rulerSize.width}px ({pixelsToInches(rulerSize.width)}in / {pixelsToCm(rulerSize.width)}cm)
        </div>
        <div
          className="w-2 h-full bg-blue-700 resize-handle cursor-ew-resize"
          onMouseDown={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

export default VirtualRulerTool;