// app/components/ColorToneGenerator.jsx
'use client';

import React, { useState, useEffect } from 'react';

const ColorToneGenerator = () => {
  const [baseColor, setBaseColor] = useState('#FF6B6B');
  const [toneCount, setToneCount] = useState(5);
  const [lightnessRange, setLightnessRange] = useState(40); // Percentage range
  const [saturationRange, setSaturationRange] = useState(20); // Percentage range
  const [tones, setTones] = useState([]);

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
      const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
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
    h /= 360;
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

  // Generate tones
  const generateTones = () => {
    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const tonesArray = [];

    if (toneCount < 1) return;

    // Calculate step sizes for lightness and saturation
    const lightnessStep = lightnessRange / (toneCount - 1 || 1);
    const saturationStep = saturationRange / (toneCount - 1 || 1);

    for (let i = 0; i < toneCount; i++) {
      const lightnessOffset = (i - (toneCount - 1) / 2) * lightnessStep / 100;
      const saturationOffset = (i - (toneCount - 1) / 2) * saturationStep / 100;

      const newLightness = Math.max(0, Math.min(1, hsl.l + lightnessOffset));
      const newSaturation = Math.max(0, Math.min(1, hsl.s + saturationOffset));

      const newRgb = hslToRgb(hsl.h, newSaturation, newLightness);
      tonesArray.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    }

    setTones(tonesArray);
  };

  useEffect(() => {
    generateTones();
  }, [baseColor, toneCount, lightnessRange, saturationRange]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Tone Generator
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
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Tones: {toneCount}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={toneCount}
                onChange={(e) => setToneCount(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lightness Range: ±{lightnessRange}%
              </label>
              <input
                type="range"
                min="10"
                max="80"
                step="5"
                value={lightnessRange}
                onChange={(e) => setLightnessRange(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Saturation Range: ±{saturationRange}%
              </label>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={saturationRange}
                onChange={(e) => setSaturationRange(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Tones Display */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Generated Tones</h2>
            {tones.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {tones.map((color, index) => (
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
            ) : (
              <p className="text-gray-500 text-sm">Adjust parameters to generate tones</p>
            )}
          </div>
        </div>

        {/* Preview */}
        {tones.length > 0 && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Tones Preview</h2>
            <div className="flex h-24 rounded-lg overflow-hidden">
              {tones.map((color, index) => (
                <div
                  key={index}
                  className="flex-1"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">About Tone Generation</h2>
          <div className="text-sm text-gray-700">
            <p>Generate tones from a base color by varying lightness and saturation:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>Lightness Range: Adjusts brightness (±% from base)</li>
              <li>Saturation Range: Adjusts color intensity (±% from base)</li>
              <li>Tones are evenly distributed around the base color</li>
            </ul>
            <p className="mt-1">Useful for creating harmonious color palettes with subtle variations.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorToneGenerator;