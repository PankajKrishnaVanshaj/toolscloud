// app/components/ColorMatchingTool.jsx
'use client';

import React, { useState, useEffect } from 'react';

const ColorMatchingTool = () => {
  const [baseColor, setBaseColor] = useState('#FF6B6B');
  const [matchType, setMatchType] = useState('complementary');
  const [matches, setMatches] = useState([]);
  const [savedMatches, setSavedMatches] = useState([]);

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

  // Generate matching colors
  const generateMatches = () => {
    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    let newMatches = [];

    switch (matchType) {
      case 'complementary':
        newMatches = [rgbToHex(hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l))];
        break;
      case 'analogous':
        newMatches = [
          rgbToHex(hslToRgb((hsl.h + 30) % 360, hsl.s, hsl.l)),
          rgbToHex(hslToRgb((hsl.h - 30 + 360) % 360, hsl.s, hsl.l))
        ];
        break;
      case 'triadic':
        newMatches = [
          rgbToHex(hslToRgb((hsl.h + 120) % 360, hsl.s, hsl.l)),
          rgbToHex(hslToRgb((hsl.h + 240) % 360, hsl.s, hsl.l))
        ];
        break;
      case 'shades':
        newMatches = [
          rgbToHex(hslToRgb(hsl.h, hsl.s, Math.max(0.2, hsl.l - 0.2))),
          rgbToHex(hslToRgb(hsl.h, hsl.s, Math.min(0.8, hsl.l + 0.2)))
        ];
        break;
      case 'tints':
        newMatches = [
          rgbToHex(hslToRgb(hsl.h, Math.max(0.2, hsl.s - 0.2), hsl.l)),
          rgbToHex(hslToRgb(hsl.h, Math.min(0.8, hsl.s + 0.2), hsl.l))
        ];
        break;
    }
    setMatches(newMatches);
  };

  useEffect(() => {
    generateMatches();
  }, [baseColor, matchType]);

  // Save a match
  const saveMatch = (color) => {
    if (!savedMatches.includes(color)) {
      setSavedMatches([...savedMatches, color]);
    }
  };

  // Remove a saved match
  const removeSavedMatch = (color) => {
    setSavedMatches(savedMatches.filter(match => match !== color));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Matching Tool
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Base Color and Match Type */}
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
                Match Type
              </label>
              <select
                value={matchType}
                onChange={(e) => setMatchType(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="complementary">Complementary</option>
                <option value="analogous">Analogous</option>
                <option value="triadic">Triadic</option>
                <option value="shades">Shades</option>
                <option value="tints">Tints</option>
              </select>
            </div>

            {/* Matches Display */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Matching Colors</h2>
              <div className="grid grid-cols-2 gap-4">
                {matches.map((color, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-16 h-16 rounded shadow"
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs mt-1">{color}</p>
                    <div className="flex gap-1 mt-1">
                      <button
                        onClick={() => navigator.clipboard.writeText(color)}
                        className="text-blue-500 text-xs hover:underline"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => saveMatch(color)}
                        className="text-green-500 text-xs hover:underline"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Saved Matches */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Saved Matches</h2>
            {savedMatches.length === 0 ? (
              <p className="text-gray-500 text-sm">No saved matches yet</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {savedMatches.map((color, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-16 h-16 rounded shadow cursor-pointer"
                      style={{ backgroundColor: color }}
                      onClick={() => setBaseColor(color)}
                    />
                    <p className="text-xs mt-1">{color}</p>
                    <div className="flex gap-1 mt-1">
                      <button
                        onClick={() => navigator.clipboard.writeText(color)}
                        className="text-blue-500 text-xs hover:underline"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => removeSavedMatch(color)}
                        className="text-red-500 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Palette Preview</h2>
          <div className="flex h-24 rounded-lg overflow-hidden">
            <div className="flex-1" style={{ backgroundColor: baseColor }} />
            {matches.map((color, index) => (
              <div key={index} className="flex-1" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorMatchingTool;