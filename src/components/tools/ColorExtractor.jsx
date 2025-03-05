// app/components/ColorExtractor.jsx
'use client';

import React, { useState, useRef, useEffect } from 'react';

const ColorExtractor = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [extractedColors, setExtractedColors] = useState([]);
  const [colorCount, setColorCount] = useState(5); // Number of colors to extract
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
        setExtractedColors([]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert RGB to HEX
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

  // Simple color quantization and extraction
  const extractColors = () => {
    if (!imageSrc) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const colorMap = {};

    // Sample every 5th pixel to reduce processing time
    for (let i = 0; i < imageData.length; i += 20) {
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      const alpha = imageData[i + 3];

      // Skip fully transparent pixels
      if (alpha === 0) continue;

      // Round to nearest 10 to reduce color variations
      const key = `${Math.round(r / 10) * 10},${Math.round(g / 10) * 10},${Math.round(b / 10) * 10}`;
      colorMap[key] = (colorMap[key] || 0) + 1;
    }

    // Sort colors by frequency and take top N
    const sortedColors = Object.entries(colorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, colorCount)
      .map(([key]) => {
        const [r, g, b] = key.split(',').map(Number);
        return rgbToHex(r, g, b);
      });

    setExtractedColors(sortedColors);
  };

  useEffect(() => {
    if (imageSrc) {
      const img = imageRef.current;
      img.onload = extractColors;
    }
  }, [imageSrc, colorCount]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Extractor
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Upload and Preview */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Colors: {colorCount}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={colorCount}
                onChange={(e) => setColorCount(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {imageSrc && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Image Preview</h2>
                <img
                  src={imageSrc}
                  alt="Uploaded"
                  className="max-w-full h-auto rounded border border-gray-300"
                />
              </div>
            )}
          </div>

          {/* Extracted Colors */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Extracted Colors</h2>
              {extractedColors.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {extractedColors.map((color, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="w-16 h-16 rounded shadow"
                        style={{ backgroundColor: color }}
                      />
                      <p className="text-xs mt-1">{color}</p>
                      <button
                        onClick={() => navigator.clipboard.writeText(color)}
                        className="text-blue-500 text-xs hover:underline mt-1"
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              ) : imageSrc ? (
                <p className="text-gray-500 text-sm">Extracting colors...</p>
              ) : (
                <p className="text-gray-500 text-sm">Upload an image to extract colors</p>
              )}
            </div>

            {extractedColors.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Color Palette Preview</h2>
                <div className="flex h-24 rounded-lg overflow-hidden">
                  {extractedColors.map((color, index) => (
                    <div
                      key={index}
                      className="flex-1"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hidden Canvas for Processing */}
        <canvas ref={canvasRef} className="hidden" />
        {imageSrc && (
          <img ref={imageRef} src={imageSrc} alt="Processing" className="hidden" />
        )}

        {/* Info */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">About Color Extraction</h2>
          <div className="text-sm text-gray-700">
            <p>Extract dominant colors from an image:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>Analyzes pixel data to find most frequent colors</li>
              <li>Rounds RGB values to reduce noise</li>
              <li>Adjust the number of colors to extract (1-10)</li>
            </ul>
            <p className="mt-1">Note: This is a basic implementation; results may vary with image complexity.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorExtractor;