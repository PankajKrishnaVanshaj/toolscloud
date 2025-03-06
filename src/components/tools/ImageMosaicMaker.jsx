// components/ImageMosaicMaker.jsx
"use client";
import React, { useState, useRef } from "react";

const ImageMosaicMaker = () => {
  const [mainImage, setMainImage] = useState(null);
  const [tileImages, setTileImages] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [tileSize, setTileSize] = useState(20);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);

  // Handle main image upload
  const handleMainImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMainImage(file);
      setPreviewUrl(url);
    }
  };

  // Handle tile images upload (multiple)
  const handleTileImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map(file => URL.createObjectURL(file));
    setTileImages(urls);
  };

  // Convert to mosaic
  const createMosaic = () => {
    if (!mainImage || !tileImages.length || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const mainImg = new Image();

    mainImg.onload = () => {
      canvas.width = mainImg.width;
      canvas.height = mainImg.height;
      ctx.drawImage(mainImg, 0, 0);

      // Load all tile images
      const tilePromises = tileImages.map(src => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = src;
        });
      });

      Promise.all(tilePromises).then(loadedTiles => {
        const mainData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = mainData.data;

        // Process each tile
        for (let y = 0; y < mainImg.height; y += tileSize) {
          for (let x = 0; x < mainImg.width; x += tileSize) {
            // Get average color of tile area
            let r = 0, g = 0, b = 0, count = 0;
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

            // Find best matching tile
            let bestTile = loadedTiles[0];
            let minDiff = Infinity;

            loadedTiles.forEach(tile => {
              const tileCanvas = document.createElement("canvas");
              tileCanvas.width = tileSize;
              tileCanvas.height = tileSize;
              const tileCtx = tileCanvas.getContext("2d");
              tileCtx.drawImage(tile, 0, 0, tileSize, tileSize);
              const tileData = tileCtx.getImageData(0, 0, tileSize, tileSize).data;
              
              let tileR = 0, tileG = 0, tileB = 0;
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

            // Draw the best matching tile
            ctx.drawImage(bestTile, x, y, tileWidth, tileHeight);
          }
        }

        setPreviewUrl(canvas.toDataURL());
        setIsProcessing(false);
      });
    };

    mainImg.src = previewUrl;
  };

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "mosaic.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Mosaic Maker
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleMainImageUpload}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tile Images (Multiple)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleTileImagesUpload}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Preview and Controls */}
          {previewUrl && (
            <div className="space-y-6">
              <div className="relative max-w-full mx-auto">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded-md"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tile Size ({tileSize}px)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={tileSize}
                    onChange={(e) => setTileSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={createMosaic}
                    disabled={isProcessing || tileImages.length === 0}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? "Processing..." : "Create Mosaic"}
                  </button>
                  <button
                    onClick={downloadImage}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Upload a main image and multiple tile images, adjust tile size, then click "Create Mosaic"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageMosaicMaker;