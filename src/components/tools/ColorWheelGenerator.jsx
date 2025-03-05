// app/components/ColorWheelGenerator.jsx
'use client';

import React, { useState, useRef, useEffect } from 'react';

const ColorWheelGenerator = () => {
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  const canvasRef = useRef(null);

  // Convert HEX to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Convert HSL to RGB
  const hslToRgb = (h, s, l) => {
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r, g, b;

    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  };

  // Convert RGB to HEX
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
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

  // Draw the color wheel
  const drawColorWheel = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const radius = canvas.width / 2;
    const centerX = radius;
    const centerY = radius;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let angle = 0; angle < 360; angle++) {
      for (let r = 0; r < radius; r++) {
        const rad = (angle * Math.PI) / 180;
        const x = centerX + r * Math.cos(rad);
        const y = centerY + r * Math.sin(rad);
        const saturation = (r / radius) * 100;
        const lightness = 50; // Fixed lightness for simplicity
        const { r: red, g: green, b: blue } = hslToRgb(angle, saturation, lightness);

        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  };

  // Handle click on color wheel
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    setSelectedColor(hex);
  };

  useEffect(() => {
    drawColorWheel();
  }, []);

  const rgb = hexToRgb(selectedColor);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Wheel Generator
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Color Wheel */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Color Wheel</h2>
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              onClick={handleCanvasClick}
              className="rounded-lg border border-gray-300 cursor-pointer"
            />
          </div>

          {/* Selected Color */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Selected Color</h2>
              <div
                className="w-full h-24 rounded-lg shadow-inner mb-2"
                style={{ backgroundColor: selectedColor }}
              />
              <div className="space-y-2 text-sm">
                <p>
                  HEX: {selectedColor}
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedColor)}
                    className="ml-2 text-blue-500 hover:underline text-xs"
                  >
                    Copy
                  </button>
                </p>
                <p>
                  RGB: {rgb.r}, {rgb.g}, {rgb.b}
                  <button
                    onClick={() => navigator.clipboard.writeText(`${rgb.r}, ${rgb.g}, ${rgb.b}`)}
                    className="ml-2 text-blue-500 hover:underline text-xs"
                  >
                    Copy
                  </button>
                </p>
                <p>
                  HSL: {hsl.h}°, {hsl.s}%, {hsl.l}%
                  <button
                    onClick={() => navigator.clipboard.writeText(`${hsl.h}, ${hsl.s}%, ${hsl.l}%`)}
                    className="ml-2 text-blue-500 hover:underline text-xs"
                  >
                    Copy
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">About the Color Wheel</h2>
          <div className="text-sm text-gray-700">
            <p>Interactive color wheel generated using HSL color space:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>Hue: 0-360° around the wheel</li>
              <li>Saturation: 0% (center) to 100% (edge)</li>
              <li>Lightness: Fixed at 50% for this wheel</li>
            </ul>
            <p className="mt-1">Click anywhere on the wheel to select a color and view its values.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorWheelGenerator;