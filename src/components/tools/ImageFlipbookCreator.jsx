"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaDownload, FaSync, FaUpload } from "react-icons/fa";

const ImageFlipbookCreator = () => {
  const [images, setImages] = useState([]);
  const [frameRate, setFrameRate] = useState(100); // milliseconds per frame
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [loop, setLoop] = useState(true); // Toggle infinite loop
  const [isExporting, setIsExporting] = useState(false);
  const intervalRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image uploads
  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...newImages]);
    setCurrentFrame(0);
    setIsPlaying(false);
  }, []);

  // Animation control
  useEffect(() => {
    if (isPlaying && images.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentFrame((prev) => {
          const nextFrame = prev + 1;
          if (nextFrame >= images.length) {
            if (loop) return 0;
            setIsPlaying(false);
            return prev;
          }
          return nextFrame;
        });
      }, frameRate);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, frameRate, images.length, loop]);

  const togglePlay = () => setIsPlaying((prev) => !prev);

  const goToNext = () => {
    setCurrentFrame((prev) => (prev + 1) % images.length);
    if (!loop && currentFrame + 1 >= images.length - 1) setIsPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentFrame((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToFrame = (index) => {
    setCurrentFrame(index);
    if (isPlaying) setIsPlaying(false);
  };

  // Clear all images and reset settings
  const reset = () => {
    setImages([]);
    setFrameRate(100);
    setIsPlaying(false);
    setCurrentFrame(0);
    setLoop(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Export as GIF
  const exportAsGIF = async () => {
    if (images.length === 0) {
      alert("Please upload images to create a GIF.");
      return;
    }

    setIsExporting(true);
    try {
      const { default: GIFEncoder } = await import("gif-encoder-2");
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const firstImg = new Image();
      firstImg.onload = async () => {
        canvas.width = firstImg.width;
        canvas.height = firstImg.height;

        const encoder = new GIFEncoder(canvas.width, canvas.height);
        encoder.start();
        encoder.setRepeat(loop ? 0 : -1); // 0 for infinite, -1 for no repeat
        encoder.setDelay(frameRate);
        encoder.setQuality(10); // Higher quality

        for (const imgSrc of images) {
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = () => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);
              encoder.addFrame(ctx);
              resolve();
            };
            img.onerror = reject;
            img.src = imgSrc;
          });
        }

        encoder.finish();
        const buffer = encoder.out.getData();
        const blob = new Blob([buffer], { type: "image/gif" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `flipbook-${Date.now()}.gif`;
        link.click();
        URL.revokeObjectURL(url);
      };
      firstImg.onerror = () => {
        alert("Error loading images. Please try again.");
      };
      firstImg.src = images[0];
    } catch (error) {
      console.error("Error exporting GIF:", error);
      alert("Failed to export GIF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">Flipbook Creator</h1>

        {/* Upload Section */}
        <div className="mb-6">
          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500 mt-1">Upload multiple images in sequence for animation</p>
        </div>

        {images.length > 0 && (
          <div className="space-y-6">
            {/* Preview */}
            <div className="relative max-w-full mx-auto bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={images[currentFrame]}
                alt={`Frame ${currentFrame + 1}`}
                className="w-full h-auto max-h-96 object-contain"
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                Frame {currentFrame + 1} / {images.length}
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frame Rate ({frameRate}ms)
                </label>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={frameRate}
                  onChange={(e) => setFrameRate(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loop Animation</label>
                <input
                  type="checkbox"
                  checked={loop}
                  onChange={(e) => setLoop(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Repeat when finished</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={goToPrevious}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                <FaStepBackward className="mr-2" /> Previous
              </button>
              <button
                onClick={togglePlay}
                className={`flex-1 py-2 px-4 ${
                  isPlaying ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                } text-white rounded-md transition-colors flex items-center justify-center`}
              >
                {isPlaying ? <FaPause className="mr-2" /> : <FaPlay className="mr-2" />}
                {isPlaying ? "Pause" : "Play"}
              </button>
              <button
                onClick={goToNext}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                <FaStepForward className="mr-2" /> Next
              </button>
            </div>

            {/* Frame Thumbnails */}
            <div className="max-h-32 overflow-y-auto p-2 bg-gray-50 rounded-lg">
              <div className="flex gap-2 flex-wrap">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${
                      index === currentFrame ? "border-blue-500" : "border-transparent"
                    } hover:border-blue-300 transition-colors`}
                    onClick={() => goToFrame(index)}
                  />
                ))}
              </div>
            </div>

            {/* Export and Reset */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={exportAsGIF}
                disabled={isExporting}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> {isExporting ? "Exporting..." : "Export GIF"}
              </button>
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>
        )}

        {!images.length && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload images to create your flipbook</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Upload multiple images for animation</li>
            <li>Adjustable frame rate (50-1000ms)</li>
            <li>Play/pause, next/previous controls</li>
            <li>Frame thumbnails for quick navigation</li>
            <li>Toggle looping animation</li>
            <li>Export as GIF with custom settings</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageFlipbookCreator;