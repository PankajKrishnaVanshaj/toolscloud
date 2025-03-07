"use client";
import React, { useState, useRef, useEffect } from "react";

const ImageFlipbookCreator = () => {
  const [images, setImages] = useState([]);
  const [frameRate, setFrameRate] = useState(100); // milliseconds per frame
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const intervalRef = useRef(null);
  const canvasRef = useRef(null);

  // Handle image uploads
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...newImages]);
  };

  // Animation control
  useEffect(() => {
    if (isPlaying && images.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % images.length);
      }, frameRate);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, frameRate, images.length]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const goToNext = () => {
    setCurrentFrame((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentFrame((prev) => (prev - 1 + images.length) % images.length);
  };

  // Export as GIF
  const exportAsGIF = async () => {
    if (images.length === 0) {
      alert("Please upload images to create a GIF.");
      return;
    }

    try {
      const { default: GIFEncoder } = await import("gif-encoder-2");
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Set canvas size based on first image
      const firstImg = new Image();
      firstImg.onload = async () => {
        canvas.width = firstImg.width;
        canvas.height = firstImg.height;

        const encoder = new GIFEncoder(canvas.width, canvas.height);
        encoder.start();
        encoder.setRepeat(0); // 0 for infinite loop
        encoder.setDelay(frameRate);

        const processFrame = async (index) => {
          if (index >= images.length) {
            encoder.finish();
            const buffer = encoder.out.getData();
            const blob = new Blob([buffer], { type: "image/gif" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "flipbook.gif";
            link.click();
            URL.revokeObjectURL(url);
            return;
          }

          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            encoder.addFrame(ctx);
            processFrame(index + 1);
          };
          img.onerror = () => {
            console.error(`Failed to load image at index ${index}`);
            processFrame(index + 1); // Skip to next frame on error
          };
          img.src = images[index];
        };

        await processFrame(0);
      };
      firstImg.onerror = () => {
        console.error("Failed to load first image for sizing");
        alert("Error loading images. Please try again.");
      };
      firstImg.src = images[0];
    } catch (error) {
      console.error("Error exporting GIF:", error);
      alert("Failed to export GIF. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Flipbook Creator
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images (Multiple)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Select multiple images in sequence for animation
            </p>
          </div>

          {/* Preview and Controls */}
          {images.length > 0 && (
            <div className="space-y-6">
              <div className="relative max-w-full mx-auto aspect-video bg-gray-200 rounded-md overflow-hidden">
                <img
                  src={images[currentFrame]}
                  alt={`Frame ${currentFrame + 1}`}
                  className="w-full h-full object-contain"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                  Frame {currentFrame + 1} / {images.length}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={goToPrevious}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={togglePlay}
                    className={`${
                      isPlaying
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-blue-500 hover:bg-blue-600"
                    } text-white px-4 py-2 rounded-md transition-colors`}
                  >
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <button
                    onClick={goToNext}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Next
                  </button>
                  <button
                    onClick={exportAsGIF}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Export GIF
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Upload images in sequence, adjust frame rate, and export as GIF
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageFlipbookCreator;