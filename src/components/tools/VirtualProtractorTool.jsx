"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaSync, FaDownload, FaPlus, FaMinus } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the canvas

const VirtualProtractorTool = () => {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([
    { x: 200, y: 300 }, // Vertex
    { x: 300, y: 300 }, // Point A
    { x: 200, y: 200 }, // Point B
  ]);
  const [draggingPoint, setDraggingPoint] = useState(null);
  const [angle, setAngle] = useState(0);
  const [arcRadius, setArcRadius] = useState(50);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const canvasWidth = 600;
  const canvasHeight = 400;

  // Calculate angle between three points
  const calculateAngle = useCallback((p0, p1, p2) => {
    const a = Math.atan2(p1.y - p0.y, p1.x - p0.x);
    const b = Math.atan2(p2.y - p0.y, p2.x - p0.x);
    let angle = (b - a) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return Math.abs(angle).toFixed(1);
  }, []);

  // Draw canvas content
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw grid if enabled
    if (showGrid) {
      ctx.beginPath();
      ctx.strokeStyle = "#e0e0e0";
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= canvasWidth; x += 20) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
      }
      for (let y = 0; y <= canvasHeight; y += 20) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
      }
      ctx.stroke();
    }

    // Draw lines
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.strokeStyle = "#4B5EAA";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw angle arc
    const startAngle = Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x);
    const endAngle = Math.atan2(points[2].y - points[0].y, points[2].x - points[0].x);
    ctx.beginPath();
    ctx.arc(points[0].x, points[0].y, arcRadius, startAngle, endAngle);
    ctx.strokeStyle = "#FF6B6B";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw points
    points.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = index === 0 ? "#FF6B6B" : "#4B5EAA";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Update angle
    setAngle(calculateAngle(points[0], points[1], points[2]));
  }, [points, arcRadius, showGrid, calculateAngle]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Mouse/Touch event handlers
  const getPosition = (canvas, evt) => {
    const rect = canvas.getBoundingClientRect();
    const pos = {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
    };
    if (snapToGrid) {
      pos.x = Math.round(pos.x / 20) * 20;
      pos.y = Math.round(pos.y / 20) * 20;
    }
    return pos;
  };

  const handleMouseDown = (e) => {
    const pos = getPosition(canvasRef.current, e);
    const pointIndex = points.findIndex((p) => Math.hypot(p.x - pos.x, p.y - pos.y) < 10);
    if (pointIndex !== -1) {
      setDraggingPoint(pointIndex);
    }
  };

  const handleMouseMove = (e) => {
    if (draggingPoint !== null) {
      const pos = getPosition(canvasRef.current, e);
      setPoints((prev) =>
        prev.map((p, i) => (i === draggingPoint ? { x: pos.x, y: pos.y } : p))
      );
    }
  };

  const handleMouseUp = () => {
    setDraggingPoint(null);
  };

  // Reset to default positions
  const resetPoints = () => {
    setPoints([
      { x: 200, y: 300 },
      { x: 300, y: 300 },
      { x: 200, y: 200 },
    ]);
    setArcRadius(50);
    setShowGrid(false);
    setSnapToGrid(false);
  };

  // Download canvas as image
  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    html2canvas(canvas).then((canvas) => {
      const link = document.createElement("a");
      link.download = `protractor-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Virtual Protractor Tool
        </h1>

        <div className="space-y-6">
          {/* Canvas */}
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="border rounded-lg shadow-md cursor-crosshair w-full max-w-full h-auto"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Arc Radius ({arcRadius}px)
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setArcRadius((prev) => Math.max(20, prev - 10))}
                  className="p-1 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  <FaMinus />
                </button>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={arcRadius}
                  onChange={(e) => setArcRadius(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <button
                  onClick={() => setArcRadius((prev) => Math.min(100, prev + 10))}
                  className="p-1 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  <FaPlus />
                </button>
              </div>
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
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={snapToGrid}
                  onChange={(e) => setSnapToGrid(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Snap to Grid</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="text-center flex-1">
              <p className="text-lg font-semibold">
                Angle: <span className="text-red-500">{angle}°</span>
              </p>
            </div>
            <button
              onClick={resetPoints}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={downloadCanvas}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>

          {/* Instructions */}
          <p className="text-xs text-gray-500 text-center">
            Drag the points to adjust the angle. Red point is the vertex, blue points form the arms.
            Use grid options for precision.
          </p>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Adjustable angle arc radius</li>
            <li>Optional grid display and snap-to-grid functionality</li>
            <li>Real-time angle calculation</li>
            <li>Download as PNG</li>
            <li>Touch/mouse drag support</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VirtualProtractorTool;