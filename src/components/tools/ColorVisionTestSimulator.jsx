// app/components/ColorVisionTestSimulator.jsx
'use client';

import React, { useState, useRef, useEffect } from 'react';

const ColorVisionTestSimulator = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [visionType, setVisionType] = useState('normal');
  const [processedImage, setProcessedImage] = useState(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Color vision deficiency simulation functions (simplified approximations)
  const simulateColorVision = (r, g, b, type) => {
    switch (type) {
      case 'protanopia': // Red deficiency
        return {
          r: 0.567 * r + 0.433 * g,
          g: 0.558 * r + 0.442 * g,
          b: b
        };
      case 'deuteranopia': // Green deficiency
        return {
          r: 0.625 * r + 0.375 * g,
          g: 0.7 * r + 0.3 * g,
          b: b
        };
      case 'tritanopia': // Blue deficiency
        return {
          r: r,
          g: 0.95 * g + 0.05 * b,
          b: 0.433 * g + 0.567 * b
        };
      default: // Normal vision
        return { r, g, b };
    }
  };

  // Process image for color vision simulation
  const processImage = () => {
    if (!imageSrc) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const simulated = simulateColorVision(r, g, b, visionType);

      data[i] = Math.min(255, Math.max(0, simulated.r));
      data[i + 1] = Math.min(255, Math.max(0, simulated.g));
      data[i + 2] = Math.min(255, Math.max(0, simulated.b));
    }

    ctx.putImageData(imageData, 0, 0);
    setProcessedImage(canvas.toDataURL());
  };

  useEffect(() => {
    if (imageSrc) {
      const img = imageRef.current;
      img.onload = processImage;
    }
  }, [imageSrc, visionType]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Vision Test Simulator
        </h1>

        <div className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                Vision Type
              </label>
              <select
                value={visionType}
                onChange={(e) => setVisionType(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="normal">Normal Vision</option>
                <option value="protanopia">Protanopia (Red-Blind)</option>
                <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
                <option value="tritanopia">Tritanopia (Blue-Blind)</option>
              </select>
            </div>
          </div>

          {/* Image Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Image */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Original Image</h2>
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt="Original"
                  className="max-w-full h-auto rounded border border-gray-300"
                />
              ) : (
                <div className="h-64 flex items-center justify-center bg-gray-200 rounded text-gray-500">
                  Upload an image to begin
                </div>
              )}
            </div>

            {/* Simulated Image */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Simulated Vision ({visionType})</h2>
              {processedImage ? (
                <img
                  src={processedImage}
                  alt="Simulated"
                  className="max-w-full h-auto rounded border border-gray-300"
                />
              ) : (
                <div className="h-64 flex items-center justify-center bg-gray-200 rounded text-gray-500">
                  {imageSrc ? 'Processing...' : 'Waiting for image'}
                </div>
              )}
            </div>
          </div>

          {/* Hidden Canvas and Image for Processing */}
          <canvas ref={canvasRef} className="hidden" />
          {imageSrc && (
            <img ref={imageRef} src={imageSrc} alt="Processing" className="hidden" />
          )}
        </div>

        {/* Information */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">About Color Vision Deficiency</h2>
          <p className="text-sm text-gray-700">
            This simulator approximates how images appear to individuals with common color vision deficiencies:
            <ul className="list-disc ml-5 mt-1">
              <li><strong>Protanopia</strong>: Reduced sensitivity to red light</li>
              <li><strong>Deuteranopia</strong>: Reduced sensitivity to green light</li>
              <li><strong>Tritanopia</strong>: Reduced sensitivity to blue light</li>
            </ul>
            Note: These are simplified simulations and may not perfectly represent actual perception.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ColorVisionTestSimulator;