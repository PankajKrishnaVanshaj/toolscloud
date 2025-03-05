// app/components/ColorBlindnessSimulator.jsx
'use client';

import React, { useState, useRef, useEffect } from 'react';

const ColorBlindnessSimulator = () => {
  const [inputType, setInputType] = useState('color');
  const [inputColor, setInputColor] = useState('#FF6B6B');
  const [imageSrc, setImageSrc] = useState(null);
  const [simulatedColors, setSimulatedColors] = useState({});
  const [simulatedImages, setSimulatedImages] = useState({});
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Convert HEX to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Convert RGB to HEX
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

  // Simulate color vision deficiencies (simplified approximations)
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

  // Process single color
  const processColor = () => {
    const rgb = hexToRgb(inputColor);
    const types = ['normal', 'protanopia', 'deuteranopia', 'tritanopia'];
    const results = {};

    types.forEach(type => {
      const simulated = simulateColorVision(rgb.r, rgb.g, rgb.b, type);
      results[type] = rgbToHex(
        Math.min(255, Math.max(0, simulated.r)),
        Math.min(255, Math.max(0, simulated.g)),
        Math.min(255, Math.max(0, simulated.b))
      );
    });

    setSimulatedColors(results);
    setSimulatedImages({});
  };

  // Process image
  const processImage = () => {
    if (!imageSrc) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const types = ['normal', 'protanopia', 'deuteranopia', 'tritanopia'];
    const results = {};

    types.forEach(type => {
      ctx.drawImage(img, 0, 0); // Reset canvas
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const simulated = simulateColorVision(r, g, b, type);

        data[i] = Math.min(255, Math.max(0, simulated.r));
        data[i + 1] = Math.min(255, Math.max(0, simulated.g));
        data[i + 2] = Math.min(255, Math.max(0, simulated.b));
      }

      ctx.putImageData(imageData, 0, 0);
      results[type] = canvas.toDataURL();
    });

    setSimulatedImages(results);
    setSimulatedColors({});
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
        setSimulatedColors({});
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (inputType === 'color') {
      processColor();
    } else if (inputType === 'image' && imageSrc) {
      processImage();
    }
  }, [inputColor, imageSrc, inputType]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Blindness Simulator
        </h1>

        <div className="space-y-6">
          {/* Input Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Input Type
            </label>
            <select
              value={inputType}
              onChange={(e) => setInputType(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="color">Single Color</option>
              <option value="image">Image</option>
            </select>
          </div>

          {/* Input Section */}
          {inputType === 'color' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={inputColor}
                  onChange={(e) => setInputColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={inputColor}
                  onChange={(e) => setInputColor(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 uppercase"
                  placeholder="#FF6B6B"
                />
              </div>
            </div>
          ) : (
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
              {imageSrc && (
                <img
                  src={imageSrc}
                  alt="Uploaded"
                  className="mt-2 max-w-full h-auto rounded border border-gray-300"
                />
              )}
            </div>
          )}

          {/* Simulation Results */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Simulation Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {inputType === 'color' && Object.keys(simulatedColors).length > 0 ? (
                Object.entries(simulatedColors).map(([type, color]) => (
                  <div key={type} className="space-y-2">
                    <p className="text-sm font-medium capitalize">{type}</p>
                    <div
                      className="w-full h-24 rounded-lg shadow-inner"
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-sm text-center">
                      {color}
                      <button
                        onClick={() => navigator.clipboard.writeText(color)}
                        className="ml-2 text-blue-500 hover:underline text-xs"
                      >
                        Copy
                      </button>
                    </p>
                  </div>
                ))
              ) : inputType === 'image' && Object.keys(simulatedImages).length > 0 ? (
                Object.entries(simulatedImages).map(([type, src]) => (
                  <div key={type} className="space-y-2">
                    <p className="text-sm font-medium capitalize">{type}</p>
                    <img
                      src={src}
                      alt={`${type} simulation`}
                      className="w-full h-auto rounded border border-gray-300"
                    />
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm col-span-full">
                  {inputType === 'color' ? 'Select a color to simulate' : 'Upload an image to simulate'}
                </p>
              )}
            </div>
          </div>

          {/* Hidden Canvas for Image Processing */}
          <canvas ref={canvasRef} className="hidden" />
          {imageSrc && (
            <img ref={imageRef} src={imageSrc} alt="Processing" className="hidden" />
          )}

          {/* Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">About Color Blindness Simulation</h2>
            <div className="text-sm text-gray-700">
              <p>Simulates common color vision deficiencies:</p>
              <ul className="list-disc ml-5 mt-1">
                <li><strong>Protanopia:</strong> Red deficiency</li>
                <li><strong>Deuteranopia:</strong> Green deficiency</li>
                <li><strong>Tritanopia:</strong> Blue deficiency</li>
              </ul>
              <p className="mt-1">Uses simplified transformation matrices; actual perception may vary.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorBlindnessSimulator;