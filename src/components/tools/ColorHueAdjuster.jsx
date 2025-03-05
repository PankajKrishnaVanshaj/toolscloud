// app/components/ColorHueAdjuster.jsx
'use client';

import React, { useState, useEffect } from 'react';

const ColorHueAdjuster = () => {
  const [baseColor, setBaseColor] = useState('#FF6B6B');
  const [hueShift, setHueShift] = useState(0);
  const [adjustedColor, setAdjustedColor] = useState('');

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
    return { h: h * 360, s, l };
  };

  // Convert HSL to RGB
  const hslToRgb = (h, s, l) => {
    h = (h % 360 + 360) % 360; // Ensure hue is within 0-360
    h /= 360; s = s; l = l;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    let r, g, b;

    if (h < 1/6) { r = c; g = x; b = 0; }
    else if (h < 2/6) { r = x; g = c; b = 0; }
    else if (h < 3/6) { r = 0; g = c; b = x; }
    else if (h < 4/6) { r = 0; g = x; b = c; }
    else if (h < 5/6) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  };

  // Adjust hue
  const adjustHue = (hex, shift) => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const newHue = hsl.h + shift;
    const adjustedRgb = hslToRgb(newHue, hsl.s, hsl.l);
    return rgbToHex(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b);
  };

  useEffect(() => {
    if (/^#[0-9A-Fa-f]{6}$/.test(baseColor)) {
      const adjusted = adjustHue(baseColor, hueShift);
      setAdjustedColor(adjusted);
    } else {
      setAdjustedColor('');
    }
  }, [baseColor, hueShift]);

  const baseRgb = hexToRgb(baseColor);
  const adjustedRgb = hexToRgb(adjustedColor);
  const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
  const adjustedHsl = rgbToHsl(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Hue Adjuster
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 uppercase"
                  placeholder="#FF6B6B"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hue Shift: {hueShift}°
              </label>
              <input
                type="range"
                min="-180"
                max="180"
                value={hueShift}
                onChange={(e) => setHueShift(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex justify-center gap-2">
              <button
                onClick={() => setHueShift(0)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                Reset Hue
              </button>
            </div>
          </div>

          {/* Result */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Adjusted Color</h2>
              {adjustedColor ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Base Color</p>
                      <div
                        className="w-full h-24 rounded-lg shadow-inner"
                        style={{ backgroundColor: baseColor }}
                      />
                      <p className="text-sm mt-1 text-center">{baseColor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Adjusted Color</p>
                      <div
                        className="w-full h-24 rounded-lg shadow-inner"
                        style={{ backgroundColor: adjustedColor }}
                      />
                      <p className="text-sm mt-1 text-center">{adjustedColor}</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p>
                      HEX: {adjustedColor}
                      <button
                        onClick={() => navigator.clipboard.writeText(adjustedColor)}
                        className="ml-2 text-blue-500 hover:underline text-xs"
                      >
                        Copy
                      </button>
                    </p>
                    <p>RGB: {adjustedRgb.r}, {adjustedRgb.g}, {adjustedRgb.b}</p>
                    <p>HSL: {Math.round(adjustedHsl.h)}°, {Math.round(adjustedHsl.s * 100)}%, {Math.round(adjustedHsl.l * 100)}%</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Enter a valid HEX color (e.g., #FF6B6B) to adjust its hue
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">About Hue Adjustment</h2>
          <div className="text-sm text-gray-700">
            <p>Adjust the hue of a base color using the HSL color space:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>Hue ranges from 0° to 360° (e.g., 0° = red, 120° = green, 240° = blue)</li>
              <li>Shift from -180° to +180° relative to the base hue</li>
              <li>Saturation and lightness remain constant</li>
            </ul>
            <p className="mt-1">Use the slider to explore different hues and copy the result.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorHueAdjuster;