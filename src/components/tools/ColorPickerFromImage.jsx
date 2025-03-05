// app/components/ColorPickerFromImage.jsx
'use client';

import React, { useState, useRef, useEffect } from 'react';

const ColorPickerFromImage = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [pickedColor, setPickedColor] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
        setPickedColor(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert RGB to HEX
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  // Convert RGB to HSL
  const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // Pick color from image
  const pickColor = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const [r, g, b] = pixel;
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    setPickedColor({ r, g, b, hex, hsl });
    setPosition({ x, y });
  };

  // Draw image on canvas
  useEffect(() => {
    if (imageSrc) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
    }
  }, [imageSrc]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Picker From Image
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Upload and Canvas */}
          <div className="space-y-4">
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

            <div className="relative">
              <canvas
                ref={canvasRef}
                onClick={pickColor}
                className="max-w-full h-auto rounded border border-gray-300 cursor-crosshair"
              />
              {imageSrc && (
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Uploaded"
                  className="hidden"
                />
              )}
              {pickedColor && (
                <div
                  className="absolute w-4 h-4 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    left: position.x,
                    top: position.y,
                    backgroundColor: pickedColor.hex
                  }}
                />
              )}
            </div>
          </div>

          {/* Color Information */}
          <div className="space-y-4">
            {pickedColor ? (
              <>
                <div>
                  <h2 className="text-lg font-semibold mb-2">Picked Color</h2>
                  <div
                    className="w-full h-24 rounded-lg shadow-inner"
                    style={{ backgroundColor: pickedColor.hex }}
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-md font-semibold mb-2">Color Values</h3>
                  <div className="space-y-2 text-sm">
                    <p>HEX: {pickedColor.hex.toUpperCase()}
                      <button
                        onClick={() => navigator.clipboard.writeText(pickedColor.hex)}
                        className="ml-2 text-blue-500 hover:underline text-xs"
                      >
                        Copy
                      </button>
                    </p>
                    <p>RGB: {pickedColor.r}, {pickedColor.g}, {pickedColor.b}</p>
                    <p>HSL: {pickedColor.hsl.h}°, {pickedColor.hsl.s}%, {pickedColor.hsl.l}%</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Click on the image to pick a color
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPickerFromImage;