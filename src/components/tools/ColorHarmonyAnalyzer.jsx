"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaPlus, FaTrash, FaDownload, FaSync } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the palette

const ColorHarmonyAnalyzer = () => {
  const [colors, setColors] = useState(["#FF6B6B", "#4ECDC4"]);
  const [newColor, setNewColor] = useState("#000000");
  const [harmonyAnalysis, setHarmonyAnalysis] = useState(null);
  const [tolerance, setTolerance] = useState(15);
  const paletteRef = React.useRef(null);

  // Convert HEX to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  // Convert RGB to HSL
  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 }; // Return as degrees and percentages
  };

  // Analyze color harmony
  const analyzeHarmony = useCallback(() => {
    if (colors.length < 1) {
      setHarmonyAnalysis({
        type: "No Colors",
        description: "Add at least one color to analyze.",
      });
      return;
    }

    const hslColors = colors.map((color) => {
      const rgb = hexToRgb(color);
      return rgbToHsl(rgb.r, rgb.g, rgb.b);
    });

    if (colors.length === 1) {
      setHarmonyAnalysis({
        type: "Single Color",
        description: "Single color selected. Add more for harmony analysis.",
        hsl: hslColors[0],
      });
      return;
    }

    const hues = hslColors.map((c) => c.h).sort((a, b) => a - b);
    const hueDiffs = hues
      .map((h, i) => {
        if (i === 0) return null;
        let diff = hues[i] - hues[i - 1];
        return diff > 180 ? 360 - diff : diff;
      })
      .filter((d) => d !== null);

    const analyzeDifferences = () => {
      if (colors.length === 2) {
        const diff = hueDiffs[0];
        if (Math.abs(diff - 180) <= tolerance) {
          return {
            type: "Complementary",
            description: "Colors are opposite on the color wheel (180° apart).",
          };
        }
        if (Math.abs(diff - 30) <= tolerance) {
          return {
            type: "Analogous",
            description: "Colors are adjacent on the color wheel (30° apart).",
          };
        }
      } else if (colors.length === 3) {
        const diff1 = hueDiffs[0];
        const diff2 = hueDiffs[1];
        if (Math.abs(diff1 - 120) <= tolerance && Math.abs(diff2 - 120) <= tolerance) {
          return {
            type: "Triadic",
            description: "Colors are evenly spaced on the color wheel (120° apart).",
          };
        }
        if (Math.max(...hueDiffs) <= 40) {
          return {
            type: "Analogous",
            description: "Colors are adjacent on the color wheel (within 40°).",
          };
        }
      } else if (colors.length === 4) {
        const diffs = hueDiffs.concat(hues[0] + 360 - hues[hues.length - 1]);
        const sortedDiffs = diffs.sort((a, b) => a - b);
        if (sortedDiffs.every((d) => Math.abs(d - 90) <= tolerance)) {
          return {
            type: "Tetradic",
            description: "Colors form a rectangle on the color wheel (90° apart).",
          };
        }
      }

      if (hueDiffs.every((d) => d <= 10)) {
        return {
          type: "Monochromatic",
          description: "Colors share a similar hue with varying saturation/lightness.",
        };
      }

      return {
        type: "No Clear Harmony",
        description: "Colors do not fit a standard harmonic pattern.",
      };
    };

    setHarmonyAnalysis(analyzeDifferences());
  }, [colors, tolerance]);

  useEffect(() => {
    analyzeHarmony();
  }, [analyzeHarmony]);

  // Add a new color
  const addColor = () => {
    if (/^#[0-9A-F]{6}$/i.test(newColor) && !colors.includes(newColor)) {
      setColors([...colors, newColor]);
      setNewColor("#000000");
    }
  };

  // Remove a color
  const removeColor = (index) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  // Clear all colors
  const clearColors = () => {
    setColors([]);
    setNewColor("#000000");
    setTolerance(15);
  };

  // Download palette
  const downloadPalette = () => {
    if (paletteRef.current) {
      html2canvas(paletteRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `color-palette-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Harmony Analyzer
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Color Input and List */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Color
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
                  placeholder="#HEXCODE"
                />
                <button
                  onClick={addColor}
                  className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FaPlus className="mr-2" /> Add
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Selected Colors</h2>
                <button
                  onClick={clearColors}
                  className="flex items-center px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <FaSync className="mr-1" /> Clear
                </button>
              </div>
              {colors.length === 0 ? (
                <p className="text-gray-500 text-sm">No colors added yet</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4">
                  {colors.map((color, index) => {
                    const rgb = hexToRgb(color);
                    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                    return (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className="w-16 h-16 rounded-lg shadow-md border border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                        <p className="text-xs mt-1 font-mono">{color}</p>
                        <p className="text-xs text-gray-600">
                          HSL: {Math.round(hsl.h)}°, {Math.round(hsl.s)}%, {Math.round(hsl.l)}%
                        </p>
                        <button
                          onClick={() => removeColor(index)}
                          className="text-red-500 text-sm mt-1 hover:text-red-700 transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Harmony Analysis */}
          <div ref={paletteRef} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Harmony Analysis</h2>
              {harmonyAnalysis ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">
                      Type: <span className="font-bold">{harmonyAnalysis.type}</span>
                    </p>
                    <p className="text-sm">{harmonyAnalysis.description}</p>
                    {harmonyAnalysis.hsl && (
                      <p className="text-sm">
                        HSL: {Math.round(harmonyAnalysis.hsl.h)}°,{" "}
                        {Math.round(harmonyAnalysis.hsl.s)}%, {Math.round(harmonyAnalysis.hsl.l)}%
                      </p>
                    )}
                  </div>
                  {colors.length > 0 && (
                    <div className="flex h-24 rounded-lg overflow-hidden shadow-md border border-gray-200">
                      {colors.map((color, index) => (
                        <div
                          key={index}
                          className="flex-1 transition-all hover:flex-[1.5]"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tolerance ({tolerance}°)
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      value={tolerance}
                      onChange={(e) => setTolerance(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Adjust the allowable deviation for harmony detection
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Analyzing...</p>
              )}
            </div>
            {colors.length > 0 && (
              <button
                onClick={downloadPalette}
                className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download Palette
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">About Color Harmony</h2>
          <div className="text-sm text-blue-600">
            <p>Analyzes color relationships based on HSL hues:</p>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li><strong>Monochromatic:</strong> Similar hues (within 10°)</li>
              <li><strong>Complementary:</strong> Opposite hues (180° apart)</li>
              <li><strong>Analogous:</strong> Adjacent hues (30° for 2, within 40° for 3)</li>
              <li><strong>Triadic:</strong> Evenly spaced (120° apart)</li>
              <li><strong>Tetradic:</strong> Rectangle pattern (90° apart)</li>
            </ul>
            <p className="mt-1">Adjust tolerance to fine-tune harmony detection.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorHarmonyAnalyzer;