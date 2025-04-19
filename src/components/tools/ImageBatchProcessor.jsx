"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload, FaTrash } from "react-icons/fa";
import JSZip from "jszip"; // For ZIP downloads
import { saveAs } from "file-saver"; // For saving the ZIP file

const ImageBatchProcessor = () => {
  const [images, setImages] = useState([]);
  const [operation, setOperation] = useState("resize");
  const [resizeWidth, setResizeWidth] = useState(800);
  const [resizeHeight, setResizeHeight] = useState(null); // Optional height
  const [quality, setQuality] = useState(80);
  const [isProcessing, setIsProcessing] = useState(false);
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);
  const [outputFormat, setOutputFormat] = useState("jpeg");
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle multiple image uploads
  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      processedUrl: null,
      name: file.name,
    }));
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  // Remove individual image
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Process all images
  const processImages = useCallback(async () => {
    if (!images.length || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const processedImages = await Promise.all(
      images.map(async (img) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        const promise = new Promise((resolve) => {
          image.onload = () => {
            let width = image.width;
            let height = image.height;

            switch (operation) {
              case "resize":
                width = resizeWidth;
                height = resizeHeight || (keepAspectRatio ? (resizeWidth / image.width) * image.height : image.height);
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(image, 0, 0, width, height);
                break;
              case "grayscale":
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                  const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                  data[i] = data[i + 1] = data[i + 2] = avg;
                }
                ctx.putImageData(imageData, 0, 0);
                break;
              case "sepia":
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0);
                const sepiaData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const sData = sepiaData.data;
                for (let i = 0; i < sData.length; i += 4) {
                  const r = sData[i];
                  const g = sData[i + 1];
                  const b = sData[i + 2];
                  sData[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
                  sData[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
                  sData[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
                }
                ctx.putImageData(sepiaData, 0, 0);
                break;
              case "blur":
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.filter = "blur(5px)"; // Example blur radius
                ctx.drawImage(image, 0, 0);
                ctx.filter = "none"; // Reset filter
                break;
              case "brightness":
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.filter = "brightness(150%)"; // Example brightness adjustment
                ctx.drawImage(image, 0, 0);
                ctx.filter = "none";
                break;
            }
            resolve(canvas.toDataURL(`image/${outputFormat}`, quality / 100));
          };
          image.src = img.url;
        });
        return { ...img, processedUrl: await promise };
      })
    );

    setImages(processedImages);
    setIsProcessing(false);
  }, [images, operation, resizeWidth, resizeHeight, quality, keepAspectRatio, outputFormat]);

  // Download all processed images as a ZIP
  const downloadAll = useCallback(async () => {
    const processedImages = images.filter((img) => img.processedUrl);
    if (!processedImages.length) return;

    const zip = new JSZip();
    processedImages.forEach((img, index) => {
      const base64Data = img.processedUrl.split(",")[1];
      zip.file(`processed_${index}_${img.name.split(".")[0]}.${outputFormat}`, base64Data, { base64: true });
    });

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `processed_images_${Date.now()}.zip`);
  }, [images, outputFormat]);

  // Clear all images and reset settings
  const clearAll = () => {
    setImages([]);
    setOperation("resize");
    setResizeWidth(800);
    setResizeHeight(null);
    setQuality(80);
    setKeepAspectRatio(true);
    setOutputFormat("jpeg");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gray-800">
          Image Batch Processor
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Operation</label>
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              >
                <option value="resize">Resize</option>
                <option value="grayscale">Grayscale</option>
                <option value="sepia">Sepia</option>
                <option value="blur">Blur</option>
                <option value="brightness">Brightness</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              >
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
                <option value="webp">WEBP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quality ({quality}%)</label>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Resize Options */}
          {operation === "resize" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Width ({resizeWidth}px)</label>
                <input
                  type="number"
                  value={resizeWidth}
                  onChange={(e) => setResizeWidth(Math.max(100, parseInt(e.target.value)))}
                  min="100"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height ({resizeHeight || "Auto"}px)
                </label>
                <input
                  type="number"
                  value={resizeHeight || ""}
                  onChange={(e) => setResizeHeight(e.target.value ? Math.max(100, parseInt(e.target.value)) : null)}
                  min="100"
                  placeholder="Auto"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing || keepAspectRatio}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={keepAspectRatio}
                  onChange={(e) => setKeepAspectRatio(e.target.checked)}
                  className="mr-2 accent-blue-500"
                  disabled={isProcessing}
                />
                <label className="text-sm font-medium text-gray-700">Keep Aspect Ratio</label>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={processImages}
              disabled={isProcessing || !images.length}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <FaUpload className="mr-2" />
              {isProcessing ? "Processing..." : "Process All"}
            </button>
            <button
              onClick={downloadAll}
              disabled={!images.some((img) => img.processedUrl) || isProcessing}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <FaDownload className="mr-2" /> Download All (ZIP)
            </button>
            <button
              onClick={clearAll}
              disabled={isProcessing}
              className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <FaSync className="mr-2" /> Clear All
            </button>
          </div>

          {/* Image Preview */}
          {images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((img, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm relative">
                  <p className="text-sm text-gray-600 mb-2 truncate">{img.name}</p>
                  <div className="relative aspect-square">
                    <img
                      src={img.processedUrl || img.url}
                      alt={img.name}
                      className="w-full h-full object-cover rounded-md transition-transform hover:scale-105"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!images.length && (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
              <p className="text-gray-500 italic">Upload images to start processing</p>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Batch process multiple images</li>
            <li>Operations: Resize, Grayscale, Sepia, Blur, Brightness</li>
            <li>Customizable resize dimensions with aspect ratio option</li>
            <li>Adjustable quality and output format (JPEG/PNG/WEBP)</li>
            <li>Download all as ZIP</li>
            <li>Remove individual images</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageBatchProcessor;