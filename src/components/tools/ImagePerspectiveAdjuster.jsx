// components/ImagePerspectiveAdjuster.jsx
"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";

const ImagePerspectiveAdjuster = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [points, setPoints] = useState([
    { x: 0, y: 0 },    // Top-left
    { x: 300, y: 0 },  // Top-right
    { x: 300, y: 300 },// Bottom-right
    { x: 0, y: 300 },  // Bottom-left
  ]);
  const [draggingPoint, setDraggingPoint] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 600 });
  const [gridVisible, setGridVisible] = useState(false);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
      // Reset points to fit new image size after load
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const newWidth = Math.min(600, img.width);
        const newHeight = newWidth / aspectRatio;
        setCanvasSize({ width: newWidth, height: newHeight });
        setPoints([
          { x: 0, y: 0 },
          { x: newWidth, y: 0 },
          { x: newWidth, y: newHeight },
          { x: 0, y: newHeight },
        ]);
      };
      img.src = url;
    }
  }, []);

  // Update canvas with perspective transformation
  const updatePerspective = useCallback(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply perspective transformation
      const srcPoints = [
        [0, 0],
        [img.width, 0],
        [img.width, img.height],
        [0, img.height],
      ];

      const destPoints = points.map((p) => [p.x, p.y]);
      const matrix = getPerspectiveTransform(srcPoints, destPoints);

      // Apply transform
      ctx.setTransform(matrix[0], matrix[3], matrix[1], matrix[4], matrix[2], matrix[5]);
      ctx.drawImage(img, 0, 0);

      // Reset transform for grid and controls
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // Draw grid if enabled
      if (gridVisible) {
        ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
        ctx.lineWidth = 1;
        for (let x = 0; x <= canvas.width; x += 50) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y <= canvas.height; y += 50) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }

      setPreviewUrl(canvas.toDataURL("image/png"));
    };

    img.src = URL.createObjectURL(image);
  }, [image, points, canvasSize, gridVisible]);

  // Handle mouse events for dragging points
  const handleMouseDown = (index) => (e) => {
    setDraggingPoint(index);
  };

  const handleMouseMove = (e) => {
    if (draggingPoint === null || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, canvasSize.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, canvasSize.height));

    const newPoints = [...points];
    newPoints[draggingPoint] = { x, y };
    setPoints(newPoints);
  };

  const handleMouseUp = () => {
    setDraggingPoint(null);
    updatePerspective();
  };

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `perspective-adjusted-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Reset points
  const resetPoints = () => {
    setPoints([
      { x: 0, y: 0 },
      { x: canvasSize.width, y: 0 },
      { x: canvasSize.width, y: canvasSize.height },
      { x: 0, y: canvasSize.height },
    ]);
    updatePerspective();
  };

  // Reset everything
  const resetAll = () => {
    setImage(null);
    setPreviewUrl(null);
    setPoints([
      { x: 0, y: 0 },
      { x: 300, y: 0 },
      { x: 300, y: 300 },
      { x: 0, y: 300 },
    ]);
    setCanvasSize({ width: 600, height: 600 });
    setGridVisible(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    if (image) updatePerspective();
  }, [image, points, gridVisible, updatePerspective]);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Image Perspective Adjuster
        </h1>

        {/* Upload Section */}
        <div className="mb-6">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Preview and Controls */}
        {previewUrl && (
          <div className="space-y-6">
            <div
              ref={containerRef}
              className="relative mx-auto"
              style={{ width: canvasSize.width, height: canvasSize.height }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-contain rounded-lg shadow-md"
              />
              {points.map((point, index) => (
                <div
                  key={index}
                  className="absolute w-4 h-4 bg-blue-500 rounded-full cursor-move transform -translate-x-1/2 -translate-y-1/2 hover:bg-blue-700 transition-colors"
                  style={{ left: point.x, top: point.y }}
                  onMouseDown={handleMouseDown(index)}
                />
              ))}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Show Grid</label>
                <input
                  type="checkbox"
                  checked={gridVisible}
                  onChange={(e) => setGridVisible(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetPoints}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset Points
              </button>
              <button
                onClick={resetAll}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset All
              </button>
              <button
                onClick={downloadImage}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>

            <p className="text-sm text-gray-500 text-center">
              Drag the blue points to adjust the perspective
            </p>
          </div>
        )}

        {!previewUrl && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to start adjusting</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Adjust perspective with draggable points</li>
            <li>Dynamic canvas size based on image aspect ratio</li>
            <li>Optional grid overlay for precision</li>
            <li>Download adjusted image as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Real-time preview</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate perspective transform matrix
function getPerspectiveTransform(src, dst) {
  const a = [];
  for (let i = 0; i < 4; i++) {
    a.push([
      src[i][0], src[i][1], 1, 0, 0, 0,
      -src[i][0] * dst[i][0], -src[i][1] * dst[i][0]
    ]);
    a.push([
      0, 0, 0, src[i][0], src[i][1], 1,
      -src[i][0] * dst[i][1], -src[i][1] * dst[i][1]
    ]);
  }

  const b = [];
  for (let i = 0; i < 4; i++) {
    b.push(dst[i][0]);
    b.push(dst[i][1]);
  }

  const x = solveLinearSystem(a, b);
  return [x[0], x[3], x[6], x[1], x[4], x[7], x[2], x[5], 1];
}

// Basic Gaussian elimination for solving linear system
function solveLinearSystem(a, b) {
  const n = 8;
  const x = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    let maxEl = Math.abs(a[i][i]);
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(a[k][i]) > maxEl) {
        maxEl = Math.abs(a[k][i]);
        maxRow = k;
      }
    }

    for (let k = i; k < n; k++) {
      [a[maxRow][k], a[i][k]] = [a[i][k], a[maxRow][k]];
    }
    [b[maxRow], b[i]] = [b[i], b[maxRow]];

    for (let k = i + 1; k < n; k++) {
      const c = -a[k][i] / a[i][i];
      for (let j = i; j < n; j++) {
        a[k][j] = j === i ? 0 : a[k][j] + c * a[i][j];
      }
      b[k] += c * b[i];
    }
  }

  for (let i = n - 1; i >= 0; i--) {
    x[i] = b[i] / a[i][i];
    for (let k = i - 1; k >= 0; k--) {
      b[k] -= a[k][i] * x[i];
    }
  }

  return x;
}

export default ImagePerspectiveAdjuster;