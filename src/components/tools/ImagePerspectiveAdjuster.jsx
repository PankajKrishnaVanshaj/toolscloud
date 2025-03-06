// components/ImagePerspectiveAdjuster.jsx
"use client";
import React, { useState, useRef, useEffect } from "react";

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
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
    }
  };

  // Update canvas with perspective transformation
  const updatePerspective = () => {
    if (!image || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 600;
      canvas.height = 600;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply perspective transformation
      const srcPoints = [
        [0, 0],
        [img.width, 0],
        [img.width, img.height],
        [0, img.height],
      ];
      
      const destPoints = points.map(p => [p.x, p.y]);
      
      // Calculate perspective transform matrix
      const matrix = getPerspectiveTransform(srcPoints, destPoints);
      
      // Apply transform
      ctx.setTransform(
        matrix[0], matrix[3], matrix[1],
        matrix[4], matrix[2], matrix[5]
      );
      
      ctx.drawImage(img, 0, 0);
      
      // Reset transform for controls
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      
      setPreviewUrl(canvas.toDataURL());
    };
    
    img.src = URL.createObjectURL(image);
  };

  // Handle mouse events for dragging points
  const handleMouseDown = (index) => (e) => {
    setDraggingPoint(index);
  };

  const handleMouseMove = (e) => {
    if (draggingPoint === null || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    
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
    link.download = "perspective-adjusted.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Reset points
  const resetPoints = () => {
    setPoints([
      { x: 0, y: 0 },
      { x: 300, y: 0 },
      { x: 300, y: 300 },
      { x: 0, y: 300 },
    ]);
    updatePerspective();
  };

  useEffect(() => {
    if (image) updatePerspective();
  }, [image]);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Perspective Adjuster
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Preview and Controls */}
          {previewUrl && (
            <div className="space-y-6">
              <div
                ref={containerRef}
                className="relative w-[600px] h-[600px] mx-auto"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
                {points.map((point, index) => (
                  <div
                    key={index}
                    className="absolute w-4 h-4 bg-blue-500 rounded-full cursor-move transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: point.x, top: point.y }}
                    onMouseDown={handleMouseDown(index)}
                  />
                ))}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={resetPoints}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={downloadImage}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Download
                </button>
              </div>

              <p className="text-sm text-gray-500 text-center">
                Drag the blue points to adjust perspective
              </p>
            </div>
          )}
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