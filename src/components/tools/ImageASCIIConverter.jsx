"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload, FaCopy } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading ASCII as an image

const ImageASCIIConverter = () => {
  const [image, setImage] = useState(null);
  const [asciiArt, setAsciiArt] = useState("");
  const [resolution, setResolution] = useState(100);
  const [contrast, setContrast] = useState(1);
  const [brightness, setBrightness] = useState(1);
  const [invert, setInvert] = useState(false);
  const [charSet, setCharSet] = useState("@%#*+=-:. ");
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);
  const asciiContainerRef = useRef(null);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setAsciiArt("");
      previewRef.current.src = url;
    }
  }, []);

  // Convert image to ASCII
  const convertToASCII = useCallback(() => {
    if (!image || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = previewRef.current;

    img.onload = () => {
      const aspectRatio = img.height / img.width;
      canvas.width = resolution;
      canvas.height = Math.floor(resolution * aspectRatio);

      ctx.filter = `brightness(${brightness}) contrast(${contrast}) ${invert ? "invert(1)" : ""}`;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let ascii = "";
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const pos = (y * canvas.width + x) * 4;
          let brightnessVal = (data[pos] + data[pos + 1] + data[pos + 2]) / 3;
          brightnessVal = Math.min(255, brightnessVal);
          const charIndex = Math.floor((brightnessVal / 255) * (charSet.length - 1));
          ascii += charSet[invert ? charIndex : charSet.length - 1 - charIndex];
        }
        ascii += "\n";
      }

      setAsciiArt(ascii);
      setIsProcessing(false);
    };

    if (!img.src) img.src = URL.createObjectURL(image);
    else img.onload();
  }, [image, resolution, contrast, brightness, invert, charSet]);

  // Copy ASCII to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(asciiArt);
    alert("ASCII art copied to clipboard!");
  };

  // Download ASCII as image
  const downloadASCII = () => {
    if (!asciiContainerRef.current) return;

    html2canvas(asciiContainerRef.current, {
      backgroundColor: "#1f2937", // Matches bg-gray-900
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `ascii-art-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  // Reset all settings
  const reset = () => {
    setImage(null);
    setAsciiArt("");
    setResolution(100);
    setContrast(1);
    setBrightness(1);
    setInvert(false);
    setCharSet("@%#*+=-:. ");
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Image to ASCII Converter
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

        {image && (
          <div className="space-y-6">
            {/* Controls and Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="relative">
                  <img
                    ref={previewRef}
                    alt="Preview"
                    className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain mx-auto"
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                {/* Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resolution ({resolution}px wide)
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="300"
                      value={resolution}
                      onChange={(e) => setResolution(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
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
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brightness ({brightness.toFixed(1)})
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={brightness}
                      onChange={(e) => setBrightness(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invert Colors</label>
                    <input
                      type="checkbox"
                      checked={invert}
                      onChange={(e) => setInvert(e.target.checked)}
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Character Set</label>
                    <input
                      type="text"
                      value={charSet}
                      onChange={(e) => setCharSet(e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 font-mono"
                      placeholder="Enter custom characters (dark to light)"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={convertToASCII}
                    disabled={isProcessing}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <FaUpload className="mr-2" /> {isProcessing ? "Processing..." : "Convert"}
                  </button>
                  {asciiArt && (
                    <>
                      <button
                        onClick={copyToClipboard}
                        className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                      >
                        <FaCopy className="mr-2" /> Copy
                      </button>
                      <button
                        onClick={downloadASCII}
                        className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
                      >
                        <FaDownload className="mr-2" /> Download
                      </button>
                    </>
                  )}
                  <button
                    onClick={reset}
                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <FaSync className="mr-2" /> Reset
                  </button>
                </div>
              </div>

              {/* ASCII Output */}
              {asciiArt && (
                <div
                  ref={asciiContainerRef}
                  className="bg-gray-900 p-4 rounded-lg text-white font-mono text-xs overflow-auto max-h-[70vh] whitespace-pre"
                >
                  <pre>{asciiArt}</pre>
                </div>
              )}
            </div>
          </div>
        )}

        {!image && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to convert to ASCII art</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Adjustable resolution, contrast, and brightness</li>
            <li>Invert colors option</li>
            <li>Customizable ASCII character set</li>
            <li>Copy to clipboard and download as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Real-time preview and processing indicator</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageASCIIConverter;