"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { FaDownload, FaSync, FaUpload, FaSearchPlus } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the difference image

const AdvancedImageComparisonTool = () => {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [mode, setMode] = useState("slider"); // slider, side-by-side, difference, overlay
  const [zoom, setZoom] = useState(1);
  const [opacity, setOpacity] = useState(0.5); // For overlay mode
  const [differenceThreshold, setDifferenceThreshold] = useState(10); // For difference mode
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInput1Ref = useRef(null);
  const fileInput2Ref = useRef(null);

  // Handle image uploads
  const handleImageUpload = useCallback((e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
    }
  }, []);

  // Handle slider movement
  const handleSliderChange = (e) => {
    setSliderPosition(e.target.value);
  };

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current || mode !== "slider") return;
    const rect = containerRef.current.getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, position)));
  }, [mode]);

  // Calculate difference image
  const getDifferenceImage = useCallback(() => {
    if (!image1 || !image2 || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img1 = new Image();
    const img2 = new Image();

    return new Promise((resolve) => {
      img1.onload = () => {
        img2.onload = () => {
          canvas.width = img1.width;
          canvas.height = img1.height;
          ctx.drawImage(img1, 0, 0);
          const imageData1 = ctx.getImageData(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img2, 0, 0);
          const imageData2 = ctx.getImageData(0, 0, canvas.width, canvas.height);

          const diffData = ctx.createImageData(canvas.width, canvas.height);
          const data1 = imageData1.data;
          const data2 = imageData2.data;
          const diff = diffData.data;

          for (let i = 0; i < data1.length; i += 4) {
            const rDiff = Math.abs(data1[i] - data2[i]);
            const gDiff = Math.abs(data1[i + 1] - data2[i + 1]);
            const bDiff = Math.abs(data1[i + 2] - data2[i + 2]);
            const totalDiff = (rDiff + gDiff + bDiff) / 3;
            if (totalDiff > differenceThreshold) {
              diff[i] = 255;     // Highlight differences in red
              diff[i + 1] = 0;
              diff[i + 2] = 0;
              diff[i + 3] = 255; // Full opacity
            } else {
              diff[i] = data1[i];
              diff[i + 1] = data1[i + 1];
              diff[i + 2] = data1[i + 2];
              diff[i + 3] = 255;
            }
          }

          ctx.putImageData(diffData, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };
        img2.src = image2;
      };
      img1.src = image1;
    });
  }, [image1, image2, differenceThreshold]);

  // Download difference image
  const handleDownload = async () => {
    if (mode === "difference" && image1 && image2) {
      const diffImage = await getDifferenceImage();
      const link = document.createElement("a");
      link.download = `difference-image-${Date.now()}.png`;
      link.href = diffImage;
      link.click();
    }
  };

  // Reset all settings
  const reset = () => {
    setImage1(null);
    setImage2(null);
    setSliderPosition(50);
    setMode("slider");
    setZoom(1);
    setOpacity(0.5);
    setDifferenceThreshold(10);
    if (fileInput1Ref.current) fileInput1Ref.current.value = "";
    if (fileInput2Ref.current) fileInput2Ref.current.value = "";
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Advanced Image Comparison Tool
        </h1>

        {/* Upload Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Image</label>
            <input
              type="file"
              accept="image/*"
              ref={fileInput1Ref}
              onChange={(e) => handleImageUpload(e, setImage1)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Second Image</label>
            <input
              type="file"
              accept="image/*"
              ref={fileInput2Ref}
              onChange={(e) => handleImageUpload(e, setImage2)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        {image1 && image2 && (
          <>
            {/* Controls */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex flex-wrap gap-2">
                  {["slider", "side-by-side", "difference", "overlay"].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        mode === m ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {m.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                    </button>
                  ))}
                </div>
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                >
                  <FaSync className="mr-2" /> Reset
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zoom ({zoom.toFixed(1)}x)</label>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                {mode === "overlay" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Overlay Opacity ({opacity})</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={opacity}
                      onChange={(e) => setOpacity(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                )}
                {mode === "difference" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difference Threshold ({differenceThreshold})</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={differenceThreshold}
                      onChange={(e) => setDifferenceThreshold(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Comparison Viewer */}
            <div
              ref={containerRef}
              className="relative w-full max-h-[70vh] bg-gray-200 rounded-lg overflow-auto"
              onMouseMove={handleMouseMove}
            >
              {mode === "slider" && (
                <>
                  <img
                    src={image1}
                    alt="First image"
                    className="absolute top-0 left-0 w-full h-full object-contain"
                    style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
                  />
                  <div
                    className="absolute top-0 left-0 h-full overflow-hidden"
                    style={{ width: `${sliderPosition}%`, transform: `scale(${zoom})`, transformOrigin: "top left" }}
                  >
                    <img
                      src={image2}
                      alt="Second image"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div
                    className="absolute top-0 h-full w-1 bg-white shadow-md"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center cursor-ew-resize">
                      <span className="text-gray-600">↔</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPosition}
                    onChange={handleSliderChange}
                    className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1/2 opacity-70 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </>
              )}

              {mode === "side-by-side" && (
                <div className="flex flex-col sm:flex-row">
                  <img
                    src={image1}
                    alt="First image"
                    className="w-full sm:w-1/2 h-auto object-contain"
                    style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
                  />
                  <img
                    src={image2}
                    alt="Second image"
                    className="w-full sm:w-1/2 h-auto object-contain"
                    style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
                  />
                </div>
              )}

              {mode === "difference" && (
                <img
                  src={getDifferenceImage()}
                  alt="Difference"
                  className="w-full h-auto object-contain"
                  style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
                />
              )}

              {mode === "overlay" && (
                <div className="relative">
                  <img
                    src={image1}
                    alt="First image"
                    className="w-full h-auto object-contain"
                    style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
                  />
                  <img
                    src={image2}
                    alt="Second image"
                    className="absolute top-0 left-0 w-full h-auto object-contain"
                    style={{ transform: `scale(${zoom})`, transformOrigin: "top left", opacity }}
                  />
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Download Button for Difference Mode */}
            {mode === "difference" && (
              <button
                onClick={handleDownload}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center mx-auto"
              >
                <FaDownload className="mr-2" /> Download Difference Image
              </button>
            )}
          </>
        )}

        {!image1 && !image2 && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload two images to compare them</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Multiple modes: Slider, Side-by-Side, Difference, Overlay</li>
            <li>Zoom functionality (1x to 4x)</li>
            <li>Adjustable overlay opacity</li>
            <li>Customizable difference threshold</li>
            <li>Download difference image</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Real-time interaction</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdvancedImageComparisonTool;