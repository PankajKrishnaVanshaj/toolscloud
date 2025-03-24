"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload, FaCog } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading

const ImageMosaicMaker = () => {
  const [mainImage, setMainImage] = useState(null);
  const [tileImages, setTileImages] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [tileSize, setTileSize] = useState(20);
  const [opacity, setOpacity] = useState(1.0);
  const [blendMode, setBlendMode] = useState("source-over");
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);
  const fileInputMainRef = useRef(null);
  const fileInputTilesRef = useRef(null);

  // Handle main image upload
  const handleMainImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMainImage(file);
      setPreviewUrl(url);
    }
  }, []);

  // Handle tile images upload
  const handleTileImagesUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    const urls = files.map((file) => URL.createObjectURL(file));
    setTileImages(urls);
  }, []);

  // Reset all settings
  const reset = () => {
    setMainImage(null);
    setTileImages([]);
    setPreviewUrl(null);
    setTileSize(20);
    setOpacity(1.0);
    setBlendMode("source-over");
    setIsProcessing(false);
    if (fileInputMainRef.current) fileInputMainRef.current.value = "";
    if (fileInputTilesRef.current) fileInputTilesRef.current.value = "";
  };

  // Create mosaic
  const createMosaic = useCallback(() => {
    if (!mainImage || !tileImages.length || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const mainImg = new Image();

    mainImg.onload = () => {
      canvas.width = mainImg.width;
      canvas.height = mainImg.height;
      ctx.globalAlpha = opacity;
      ctx.globalCompositeOperation = blendMode;
      ctx.drawImage(mainImg, 0, 0);

      const tilePromises = tileImages.map((src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = src;
        })
      );

      Promise.all(tilePromises).then((loadedTiles) => {
        const mainData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = mainData.data;

        for (let y = 0; y < mainImg.height; y += tileSize) {
          for (let x = 0; x < mainImg.width; x += tileSize) {
            let r = 0,
              g = 0,
              b = 0,
              count = 0;
            const tileWidth = Math.min(tileSize, mainImg.width - x);
            const tileHeight = Math.min(tileSize, mainImg.height - y);

            for (let dy = 0; dy < tileHeight; dy++) {
              for (let dx = 0; dx < tileWidth; dx++) {
                const pos = ((y + dy) * mainImg.width + (x + dx)) * 4;
                r += data[pos];
                g += data[pos + 1];
                b += data[pos + 2];
                count++;
              }
            }

            r = Math.floor(r / count);
            g = Math.floor(g / count);
            b = Math.floor(b / count);

            let bestTile = loadedTiles[0];
            let minDiff = Infinity;

            loadedTiles.forEach((tile) => {
              const tileCanvas = document.createElement("canvas");
              tileCanvas.width = tileSize;
              tileCanvas.height = tileSize;
              const tileCtx = tileCanvas.getContext("2d");
              tileCtx.drawImage(tile, 0, 0, tileSize, tileSize);
              const tileData = tileCtx.getImageData(0, 0, tileSize, tileSize).data;

              let tileR = 0,
                tileG = 0,
                tileB = 0;
              for (let i = 0; i < tileData.length; i += 4) {
                tileR += tileData[i];
                tileG += tileData[i + 1];
                tileB += tileData[i + 2];
              }

              tileR = Math.floor(tileR / (tileData.length / 4));
              tileG = Math.floor(tileG / (tileData.length / 4));
              tileB = Math.floor(tileB / (tileData.length / 4));

              const diff = Math.abs(r - tileR) + Math.abs(g - tileG) + Math.abs(b - tileB);
              if (diff < minDiff) {
                minDiff = diff;
                bestTile = tile;
              }
            });

            ctx.drawImage(bestTile, x, y, tileWidth, tileHeight);
          }
        }

        setPreviewUrl(canvas.toDataURL("image/png"));
        setIsProcessing(false);
      });
    };

    mainImg.src = previewUrl;
  }, [mainImage, tileImages, tileSize, opacity, blendMode, previewUrl]);

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `mosaic-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">Image Mosaic Maker</h1>

        {/* Upload Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Main Image</label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputMainRef}
              onChange={handleMainImageUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tile Images (Multiple)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputTilesRef}
              onChange={handleTileImagesUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        {previewUrl && (
          <div className="space-y-6">
            {/* Preview */}
            <div className="relative flex justify-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full h-auto rounded-lg shadow-md max-h-[70vh] object-contain"
              />
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tile Size ({tileSize}px)</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={tileSize}
                  onChange={(e) => setTileSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opacity ({opacity})</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blend Mode</label>
                <select
                  value={blendMode}
                  onChange={(e) => setBlendMode(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                >
                  <option value="source-over">Normal</option>
                  <option value="multiply">Multiply</option>
                  <option value="screen">Screen</option>
                  <option value="overlay">Overlay</option>
                  <option value="difference">Difference</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={createMosaic}
                disabled={isProcessing || tileImages.length === 0}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaCog className="mr-2" /> {isProcessing ? "Processing..." : "Create Mosaic"}
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
            <p className="text-gray-500 italic">Upload a main image and tile images to start</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Create mosaics from a main image using multiple tile images</li>
            <li>Adjustable tile size (10-100px)</li>
            <li>Customizable opacity and blend modes</li>
            <li>Download result as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Processing indicator</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageMosaicMaker;