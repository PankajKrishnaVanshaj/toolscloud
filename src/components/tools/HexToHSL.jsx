// app/components/HexToHSL.jsx
'use client';

import React, { useState, useEffect } from 'react';

const HexToHSL = () => {
  const [hex, setHex] = useState('#FF6B6B');
  const [rgb, setRgb] = useState({ r: 0, g: 0, b: 0 });
  const [hsl, setHsl] = useState({ h: 0, s: 0, l: 0 });

  // Convert HEX to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Convert RGB to HSL
  const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // Achromatic
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

  // Update RGB and HSL when HEX changes
  useEffect(() => {
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      const newRgb = hexToRgb(hex);
      setRgb(newRgb);
      setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
    }
  }, [hex]);

  // Handle HEX input change
  const handleHexChange = (value) => {
    setHex(value.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          HEX to HSL Converter
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* HEX Input */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HEX Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={hex}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 uppercase"
                  placeholder="#FF6B6B"
                />
              </div>
            </div>
          </div>

          {/* HSL and RGB Output */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Converted Color</h2>
              <div
                className="w-full h-24 rounded-lg shadow-inner mb-2"
                style={{ backgroundColor: hex }}
              />
              <div className="space-y-2 text-sm">
                <p>
                  HSL: {hsl.h}°, {hsl.s}%, {hsl.l}%
                  <button
                    onClick={() => navigator.clipboard.writeText(`${hsl.h}, ${hsl.s}%, ${hsl.l}%`)}
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
                  HEX: {hex}
                  <button
                    onClick={() => navigator.clipboard.writeText(hex)}
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
          <h2 className="text-lg font-semibold mb-2">About HEX to HSL Conversion</h2>
          <div className="text-sm text-gray-700">
            <p>Converts HEX (web color format) to HSL (perceptual color model):</p>
            <ul className="list-disc ml-5 mt-1">
              <li>HEX: 6-digit hexadecimal code</li>
              <li>RGB: Red, Green, Blue (0-255)</li>
              <li>HSL: Hue (0-360°), Saturation (0-100%), Lightness (0-100%)</li>
            </ul>
            <p className="mt-1">Enter a HEX code or use the color picker to see the HSL and RGB values.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HexToHSL;