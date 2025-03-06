// components/VirtualProtractorTool.js
'use client';

import React, { useState, useRef, useEffect } from 'react';

const VirtualProtractorTool = () => {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([
    { x: 200, y: 300 }, // Vertex (center point)
    { x: 300, y: 300 }, // Point A
    { x: 200, y: 200 }, // Point B
  ]);
  const [draggingPoint, setDraggingPoint] = useState(null);
  const [angle, setAngle] = useState(0);

  const canvasWidth = 600;
  const canvasHeight = 400;

  // Calculate angle between three points
  const calculateAngle = (p0, p1, p2) => {
    const a = Math.atan2(p1.y - p0.y, p1.x - p0.x);
    const b = Math.atan2(p2.y - p0.y, p2.x - p0.x);
    let angle = (b - a) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return Math.abs(angle).toFixed(1);
  };

  // Draw canvas content
  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw lines
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[2].x, points[2].y);
    ctx.strokeStyle = '#4B5EAA';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw points
    points.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = index === 0 ? '#FF6B6B' : '#4B5EAA';
      ctx.fill();
    });

    // Draw angle arc
    const radius = 50;
    const startAngle = Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x);
    const endAngle = Math.atan2(points[2].y - points[0].y, points[2].x - points[0].x);
    ctx.beginPath();
    ctx.arc(points[0].x, points[0].y, radius, startAngle, endAngle);
    ctx.strokeStyle = '#FF6B6B';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Update angle
    setAngle(calculateAngle(points[0], points[1], points[2]));
  };

  useEffect(() => {
    draw();
  }, [points]);

  // Handle mouse/touch events
  const getMousePos = (canvas, evt) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
    };
  };

  const handleMouseDown = (e) => {
    const pos = getMousePos(canvasRef.current, e);
    const pointIndex = points.findIndex(
      (p) => Math.hypot(p.x - pos.x, p.y - pos.y) < 10
    );
    if (pointIndex !== -1) {
      setDraggingPoint(pointIndex);
    }
  };

  const handleMouseMove = (e) => {
    if (draggingPoint !== null) {
      const pos = getMousePos(canvasRef.current, e);
      setPoints((prev) =>
        prev.map((p, i) =>
          i === draggingPoint ? { x: pos.x, y: pos.y } : p
        )
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
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Virtual Protractor Tool</h1>

      <div className="flex flex-col items-center">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="border rounded-md cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        <div className="mt-4 text-center">
          <p className="text-lg font-semibold">
            Angle: <span className="text-red-500">{angle}°</span>
          </p>
          <button
            onClick={resetPoints}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Reset Points
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Drag the points to adjust the angle. Red point is the vertex, blue points form the arms.
        </p>
      </div>
    </div>
  );
};

export default VirtualProtractorTool;