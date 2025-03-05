// app/components/ColorHarmonyAnalyzer.jsx
'use client';

import React, { useState, useEffect } from 'react';

const ColorHarmonyAnalyzer = () => {
  const [colors, setColors] = useState(['#FF6B6B', '#4ECDC4']);
  const [newColor, setNewColor] = useState('#000000');
  const [harmonyAnalysis, setHarmonyAnalysis] = useState(null);

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

  // Analyze color harmony
  const analyzeHarmony = () => {
    if (colors.length < 2) {
      setHarmonyAnalysis({ type: 'Insufficient Colors', description: 'Add at least 2 colors to analyze harmony.' });
      return;
    }

    const hslColors = colors.map(color => {
      const rgb = hexToRgb(color);
      return rgbToHsl(rgb.r, rgb.g, rgb.b);
    });

    // Sort by hue for easier analysis
    const hues = hslColors.map(c => c.h).sort((a, b) => a - b);
    const hueDiffs = hues.map((h, i) => {
      if (i === 0) return null;
      let diff = hues[i] - hues[i - 1];
      return diff > 180 ? 360 - diff : diff;
    }).filter(d => d !== null);

    const analyzeDifferences = () => {
      const tolerance = 15; // Allowable deviation in degrees

      if (colors.length === 2) {
        const diff = hueDiffs[0];
        if (Math.abs(diff - 180) <= tolerance) {
          return { type: 'Complementary', description: 'Colors are opposite on the color wheel (180° apart).' };
        }
        if (Math.abs(diff - 30) <= tolerance) {
          return { type: 'Analogous', description: 'Colors are adjacent on the color wheel (30° apart).' };
        }
      } else if (colors.length === 3) {
        const diff1 = hueDiffs[0];
        const diff2 = hueDiffs[1];
        if (Math.abs(diff1 - 120) <= tolerance && Math.abs(diff2 - 120) <= tolerance) {
          return { type: 'Triadic', description: 'Colors are evenly spaced on the color wheel (120° apart).' };
        }
        if (Math.max(...hueDiffs) <= 40) {
          return { type: 'Analogous', description: 'Colors are adjacent on the color wheel (within 40°).' };
        }
      } else if (colors.length === 4) {
        const diffs = hueDiffs.concat(hues[0] + 360 - hues[hues.length - 1]);
        const sortedDiffs = diffs.sort((a, b) => a - b);
        if (sortedDiffs.every(d => Math.abs(d - 90) <= tolerance)) {
          return { type: 'Tetradic', description: 'Colors form a rectangle on the color wheel (90° apart).' };
        }
      }

      // Check for monochromatic (similar hue, varying saturation/lightness)
      if (hueDiffs.every(d => d <= 10)) {
        return { type: 'Monochromatic', description: 'Colors share a similar hue with varying saturation/lightness.' };
      }

      return { type: 'No Clear Harmony', description: 'Colors do not fit a standard harmonic pattern.' };
    };

    setHarmonyAnalysis(analyzeDifferences());
  };

  useEffect(() => {
    analyzeHarmony();
  }, [colors]);

  // Add a new color
  const addColor = () => {
    if (/^#[0-9A-F]{6}$/i.test(newColor) && !colors.includes(newColor)) {
      setColors([...colors, newColor]);
      setNewColor('#000000');
    }
  };

  // Remove a color
  const removeColor = (index) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Harmony Analyzer
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Color Input */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 uppercase"
                  placeholder="#HEXCODE"
                />
                <button
                  onClick={addColor}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Color List */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Selected Colors</h2>
              {colors.length === 0 ? (
                <p className="text-gray-500 text-sm">No colors added yet</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {colors.map((color, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="w-16 h-16 rounded shadow"
                        style={{ backgroundColor: color }}
                      />
                      <p className="text-xs mt-1">{color}</p>
                      <button
                        onClick={() => removeColor(index)}
                        className="text-red-500 text-xs mt-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Harmony Analysis */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Harmony Analysis</h2>
              {harmonyAnalysis ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Type: <span className="font-bold">{harmonyAnalysis.type}</span>
                  </p>
                  <p className="text-sm">{harmonyAnalysis.description}</p>
                  {colors.length > 0 && (
                    <div className="flex h-24 rounded-lg overflow-hidden mt-2">
                      {colors.map((color, index) => (
                        <div
                          key={index}
                          className="flex-1"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Add colors to analyze harmony</p>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">About Color Harmony</h2>
          <div className="text-sm text-gray-700">
            <p>Analyzes the harmonic relationship between colors based on HSL hues:</p>
            <ul className="list-disc ml-5 mt-1">
              <li><strong>Monochromatic:</strong> Similar hues (within 10°)</li>
              <li><strong>Complementary:</strong> Opposite hues (180° apart)</li>
              <li><strong>Analogous:</strong> Adjacent hues (30° apart for 2, within 40° for 3)</li>
              <li><strong>Triadic:</strong> Evenly spaced (120° apart)</li>
              <li><strong>Tetradic:</strong> Rectangle pattern (90° apart)</li>
            </ul>
            <p className="mt-1">Tolerance of ±15° is applied to account for slight variations.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorHarmonyAnalyzer;