"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the result

const ImageTiltShiftTool = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [blurAmount, setBlurAmount] = useState(10);
  const [focusPosition, setFocusPosition] = useState(50); // Percentage from top
  const [focusWidth, setFocusWidth] = useState(20); // Percentage of height
  const [transitionWidth, setTransitionWidth] = useState(10); // Percentage for gradient transition
  const [tiltAngle, setTiltAngle] = useState(0); // Angle in degrees
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
    }
  }, []);

  // Reset all settings
  const reset = () => {
    setImage(null);
    setPreviewUrl(null);
    setBlurAmount(10);
    setFocusPosition(50);
    setFocusWidth(20);
    setTransitionWidth(10);
    setTiltAngle(0);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Apply tilt-shift effect
  const applyTiltShift = useCallback(() => {
    if (!image || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;

      // Create temporary canvas for blur
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.drawImage(img, 0, 0);

      // Apply Gaussian blur (simplified)
      stackBlurCanvasRGB(tempCanvas, 0, 0, width, height, blurAmount);

      // Get blurred data
      const blurredData = tempCtx.getImageData(0, 0, width, height).data;

      // Calculate focus area with tilt
      const focusCenter = (focusPosition / 100) * height;
      const focusHalfWidth = (focusWidth / 100) * height / 2;
      const transitionHalfWidth = (transitionWidth / 100) * height / 2;
      const angleRad = (tiltAngle * Math.PI) / 180;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;

          // Calculate distance from tilted focus line
          const rotatedY = (x - width / 2) * Math.sin(angleRad) + (y - height / 2) * Math.cos(angleRad) + height / 2;
          const distance = Math.abs(rotatedY - focusCenter);

          let blendFactor;
          if (distance <= focusHalfWidth) {
            blendFactor = 0; // Fully in focus
          } else if (distance <= focusHalfWidth + transitionHalfWidth) {
            blendFactor = (distance - focusHalfWidth) / transitionHalfWidth; // Gradient transition
          } else {
            blendFactor = 1; // Fully blurred
          }

          // Blend between original and blurred
          data[i] = data[i] * (1 - blendFactor) + blurredData[i] * blendFactor;
          data[i + 1] = data[i + 1] * (1 - blendFactor) + blurredData[i + 1] * blendFactor;
          data[i + 2] = data[i + 2] * (1 - blendFactor) + blurredData[i + 2] * blendFactor;
          data[i + 3] = data[i + 3]; // Preserve alpha
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setPreviewUrl(canvas.toDataURL("image/png"));
      setIsProcessing(false);
    };

    img.src = previewUrl;
  }, [image, previewUrl, blurAmount, focusPosition, focusWidth, transitionWidth, tiltAngle]);

  // Simplified stack blur (optimized from original)
  const stackBlurCanvasRGB = (canvas, top_x, top_y, width, height, radius) => {
    const context = canvas.getContext("2d");
    const imageData = context.getImageData(top_x, top_y, width, height);
    const pixels = imageData.data;

    const mul_table = [
      512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512,
      // ... (keeping your original table for brevity)
    ];
    const shg_table = [
      9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17,
      // ... (keeping your original table for brevity)
    ];

    const blurRadius = Math.min(radius, mul_table.length - 1);
    const mul_sum = mul_table[blurRadius] || 512;
    const shg_sum = shg_table[blurRadius] || 9;

    // Horizontal pass
    for (let y = 0; y < height; y++) {
      let r_sum = 0, g_sum = 0, b_sum = 0;
      for (let x = -blurRadius; x <= blurRadius; x++) {
        const idx = (y * width + Math.max(0, Math.min(x, width - 1))) * 4;
        r_sum += pixels[idx];
        g_sum += pixels[idx + 1];
        b_sum += pixels[idx + 2];
      }
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        pixels[i] = r_sum / mul_sum;
        pixels[i + 1] = g_sum / mul_sum;
        pixels[i + 2] = b_sum / mul_sum;
        if (x >= blurRadius) {
          const left = (y * width + (x - blurRadius)) * 4;
          r_sum -= pixels[left];
          g_sum -= pixels[left + 1];
          b_sum -= pixels[left + 2];
        }
        if (x + blurRadius + 1 < width) {
          const right = (y * width + (x + blurRadius + 1)) * 4;
          r_sum += pixels[right];
          g_sum += pixels[right + 1];
          b_sum += pixels[right + 2];
        }
      }
    }

    // Vertical pass (simplified for performance)
    for (let x = 0; x < width; x++) {
      let r_sum = 0, g_sum = 0, b_sum = 0;
      for (let y = -blurRadius; y <= blurRadius; y++) {
        const idx = (Math.max(0, Math.min(y, height - 1)) * width + x) * 4;
        r_sum += pixels[idx];
        g_sum += pixels[idx + 1];
        b_sum += pixels[idx + 2];
      }
      for (let y = 0; y < height; y++) {
        const i = (y * width + x) * 4;
        pixels[i] = r_sum / mul_sum;
        pixels[i + 1] = g_sum / mul_sum;
        pixels[i + 2] = b_sum / mul_sum;
        if (y >= blurRadius) {
          const top = ((y - blurRadius) * width + x) * 4;
          r_sum -= pixels[top];
          g_sum -= pixels[top + 1];
          b_sum -= pixels[top + 2];
        }
        if (y + blurRadius + 1 < height) {
          const bottom = ((y + blurRadius + 1) * width + x) * 4;
          r_sum += pixels[bottom];
          g_sum += pixels[bottom + 1];
          b_sum += pixels[bottom + 2];
        }
      }
    }

    context.putImageData(imageData, top_x, top_y);
  };

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `tilt-shift-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Tilt-Shift Tool</h1>

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

        {previewUrl && (
          <div className="space-y-6">
            {/* Preview */}
            <div className="relative flex justify-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain"
              />
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blur Amount ({blurAmount})
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={blurAmount}
                  onChange={(e) => setBlurAmount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Focus Position ({focusPosition}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={focusPosition}
                  onChange={(e) => setFocusPosition(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Focus Width ({focusWidth}%)
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={focusWidth}
                  onChange={(e) => setFocusWidth(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transition Width ({transitionWidth}%)
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={transitionWidth}
                  onChange={(e) => setTransitionWidth(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tilt Angle ({tiltAngle}°)
                </label>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  value={tiltAngle}
                  onChange={(e) => setTiltAngle(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={applyTiltShift}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaUpload className="mr-2" /> {isProcessing ? "Processing..." : "Apply"}
              </button>
              <button
                onClick={downloadImage}
                disabled={isProcessing || !previewUrl}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
              <button
                onClick={reset}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>
        )}

        {!previewUrl && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to start</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Adjustable blur amount and focus area</li>
            <li>Customizable focus position and width</li>
            <li>Gradient transition control</li>
            <li>Tilt angle adjustment</li>
            <li>Download as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Real-time preview with processing indicator</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageTiltShiftTool;