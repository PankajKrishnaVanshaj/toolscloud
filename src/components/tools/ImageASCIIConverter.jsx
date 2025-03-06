// components/ImageASCIIConverter.jsx
"use client";
import React, { useState, useRef } from "react";

const ImageASCIIConverter = () => {
  const [image, setImage] = useState(null);
  const [asciiArt, setAsciiArt] = useState("");
  const [resolution, setResolution] = useState(50);
  const [contrast, setContrast] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // ASCII characters from dark to light
  const asciiChars = "@%#*+=-:. ";

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
      setAsciiArt("");
    }
  };

  // Convert image to ASCII
  const convertToASCII = () => {
    if (!image || !canvasRef.current) return;
    
    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Scale image to maintain aspect ratio based on resolution
      const aspectRatio = img.height / img.width;
      canvas.width = resolution;
      canvas.height = Math.floor(resolution * aspectRatio);
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let ascii = "";
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const pos = (y * canvas.width + x) * 4;
          // Calculate brightness with contrast adjustment
          let brightness = (data[pos] + data[pos + 1] + data[pos + 2]) / 3;
          brightness = Math.min(255, brightness * contrast);
          
          // Map brightness to ASCII character
          const charIndex = Math.floor((brightness / 255) * (asciiChars.length - 1));
          ascii += asciiChars[asciiChars.length - 1 - charIndex];
        }
        ascii += "\n";
      }

      setAsciiArt(ascii);
      setIsProcessing(false);
    };

    img.src = previewUrl;
  };

  // Copy ASCII to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(asciiArt);
    alert("ASCII art copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image to ASCII Converter
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

          {/* Controls and Preview */}
          {previewUrl && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full h-auto rounded-md mx-auto"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resolution ({resolution} pixels wide)
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="200"
                      value={resolution}
                      onChange={(e) => setResolution(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contrast ({contrast.toFixed(1)})
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={contrast}
                      onChange={(e) => setContrast(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={convertToASCII}
                      disabled={isProcessing}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                    >
                      {isProcessing ? "Processing..." : "Convert to ASCII"}
                    </button>
                    {asciiArt && (
                      <button
                        onClick={copyToClipboard}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                      >
                        Copy to Clipboard
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ASCII Output */}
              {asciiArt && (
                <div className="bg-gray-900 p-4 rounded-md text-white font-mono text-xs overflow-auto max-h-[600px]">
                  <pre>{asciiArt}</pre>
                </div>
              )}
            </div>
          )}

          <p className="text-sm text-gray-500 mt-4">
            Upload an image, adjust settings, and click "Convert" to generate ASCII art
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageASCIIConverter;