"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload, FaSpinner } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading

const ImageBlurTool = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [blurType, setBlurType] = useState("gaussian");
  const [blurRadius, setBlurRadius] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [blurArea, setBlurArea] = useState("full"); // New: full or partial blur
  const [selection, setSelection] = useState(null); // For partial blur area
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
      setSelection(null);
    }
  }, []);

  // Handle mouse events for partial blur selection
  const handleMouseDown = (e) => {
    if (blurArea !== "partial" || !previewUrl) return;
    const rect = e.target.getBoundingClientRect();
    setSelection({
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
      endX: e.clientX - rect.left,
      endY: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e) => {
    if (!selection || blurArea !== "partial") return;
    const rect = e.target.getBoundingClientRect();
    setSelection((prev) => ({
      ...prev,
      endX: Math.min(Math.max(e.clientX - rect.left, 0), rect.width),
      endY: Math.min(Math.max(e.clientY - rect.top, 0), rect.height),
    }));
  };

  const handleMouseUp = () => {
    if (selection) {
      setSelection((prev) => ({
        ...prev,
        endX: Math.max(prev.startX, prev.endX),
        endY: Math.max(prev.startY, prev.endY),
      }));
    }
  };

  // Apply blur effect
  const applyBlur = useCallback(() => {
    if (!image || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;
      const outputData = new Uint8ClampedArray(data);

      const gaussianBlur = (data, output, width, height, radius, x1, y1, x2, y2) => {
        const kernelSize = radius * 2 + 1;
        const kernel = Array(kernelSize).fill(1 / kernelSize);

        // Horizontal pass
        for (let y = y1; y < y2; y++) {
          for (let x = x1; x < x2; x++) {
            let r = 0, g = 0, b = 0, a = 0;
            for (let k = -radius; k <= radius; k++) {
              const nx = Math.min(Math.max(x + k, 0), width - 1);
              const pos = (y * width + nx) * 4;
              r += data[pos] * kernel[k + radius];
              g += data[pos + 1] * kernel[k + radius];
              b += data[pos + 2] * kernel[k + radius];
              a += data[pos + 3] * kernel[k + radius];
            }
            const outPos = (y * width + x) * 4;
            output[outPos] = r;
            output[outPos + 1] = g;
            output[outPos + 2] = b;
            output[outPos + 3] = a;
          }
        }

        // Vertical pass
        const tempData = new Uint8ClampedArray(output);
        for (let x = x1; x < x2; x++) {
          for (let y = y1; y < y2; y++) {
            let r = 0, g = 0, b = 0, a = 0;
            for (let k = -radius; k <= radius; k++) {
              const ny = Math.min(Math.max(y + k, 0), height - 1);
              const pos = (ny * width + x) * 4;
              r += tempData[pos] * kernel[k + radius];
              g += tempData[pos + 1] * kernel[k + radius];
              b += tempData[pos + 2] * kernel[k + radius];
              a += tempData[pos + 3] * kernel[k + radius];
            }
            const outPos = (y * width + x) * 4;
            output[outPos] = r;
            output[outPos + 1] = g;
            output[outPos + 2] = b;
            output[outPos + 3] = a;
          }
        }
      };

      const boxBlur = (data, output, width, height, radius, x1, y1, x2, y2) => {
        for (let y = y1; y < y2; y++) {
          for (let x = x1; x < x2; x++) {
            let r = 0, g = 0, b = 0, a = 0, count = 0;
            for (let dy = -radius; dy <= radius; dy++) {
              for (let dx = -radius; dx <= radius; dx++) {
                const nx = Math.min(Math.max(x + dx, 0), width - 1);
                const ny = Math.min(Math.max(y + dy, 0), height - 1);
                const pos = (ny * width + nx) * 4;
                r += data[pos];
                g += data[pos + 1];
                b += data[pos + 2];
                a += data[pos + 3];
                count++;
              }
            }
            const outPos = (y * width + x) * 4;
            output[outPos] = r / count;
            output[outPos + 1] = g / count;
            output[outPos + 2] = b / count;
            output[outPos + 3] = a / count;
          }
        }
      };

      // Apply blur based on type and area
      const x1 = blurArea === "partial" && selection ? Math.floor(selection.startX) : 0;
      const y1 = blurArea === "partial" && selection ? Math.floor(selection.startY) : 0;
      const x2 = blurArea === "partial" && selection ? Math.floor(selection.endX) : width;
      const y2 = blurArea === "partial" && selection ? Math.floor(selection.endY) : height;

      if (blurType === "gaussian") {
        gaussianBlur(data, outputData, width, height, blurRadius, x1, y1, x2, y2);
      } else if (blurType === "box") {
        boxBlur(data, outputData, width, height, blurRadius, x1, y1, x2, y2);
      }

      ctx.putImageData(new ImageData(outputData, width, height), 0, 0);
      setPreviewUrl(canvas.toDataURL("image/png"));
      setIsProcessing(false);
    };

    img.src = previewUrl;
  }, [image, previewUrl, blurType, blurRadius, blurArea, selection]);

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `blurred-image-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Reset to initial state
  const reset = () => {
    setImage(null);
    setPreviewUrl(null);
    setBlurType("gaussian");
    setBlurRadius(5);
    setBlurArea("full");
    setSelection(null);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Image Blur Tool
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

        {previewUrl && (
          <div className="space-y-6">
            {/* Image Preview */}
            <div className="relative flex justify-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              />
              {blurArea === "partial" && selection && (
                <div
                  className="absolute border-2 border-dashed border-blue-500 bg-blue-200 bg-opacity-20"
                  style={{
                    left: `${Math.min(selection.startX, selection.endX)}px`,
                    top: `${Math.min(selection.startY, selection.endY)}px`,
                    width: `${Math.abs(selection.endX - selection.startX)}px`,
                    height: `${Math.abs(selection.endY - selection.startY)}px`,
                  }}
                />
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blur Type</label>
                <select
                  value={blurType}
                  onChange={(e) => setBlurType(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                >
                  <option value="gaussian">Gaussian Blur</option>
                  <option value="box">Box Blur</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blur Radius ({blurRadius}px)
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={blurRadius}
                  onChange={(e) => setBlurRadius(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blur Area</label>
                <select
                  value={blurArea}
                  onChange={(e) => setBlurArea(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                >
                  <option value="full">Full Image</option>
                  <option value="partial">Partial (Select Area)</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={applyBlur}
                disabled={isProcessing || (blurArea === "partial" && !selection)}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isProcessing ? (
                  <FaSpinner className="mr-2 animate-spin" />
                ) : (
                  <FaUpload className="mr-2" />
                )}
                {isProcessing ? "Processing..." : "Apply Blur"}
              </button>
              <button
                onClick={downloadImage}
                disabled={!previewUrl || isProcessing}
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

            {blurArea === "partial" && (
              <p className="text-sm text-gray-500">
                Click and drag on the image to select the area to blur.
              </p>
            )}
          </div>
        )}

        {!previewUrl && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to start blurring</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Gaussian and Box blur options</li>
            <li>Full image or partial area blurring</li>
            <li>Adjustable blur radius</li>
            <li>Real-time preview and download as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageBlurTool;