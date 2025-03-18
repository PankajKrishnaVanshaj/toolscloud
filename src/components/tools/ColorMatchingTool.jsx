"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaSave, FaTrash, FaSync } from "react-icons/fa";

const ColorMatchingTool = () => {
  const [baseColor, setBaseColor] = useState("#FF6B6B");
  const [matchType, setMatchType] = useState("complementary");
  const [matches, setMatches] = useState([]);
  const [savedMatches, setSavedMatches] = useState([]);
  const [adjustment, setAdjustment] = useState({ hue: 0, saturation: 0, lightness: 0 });

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

  // Convert RGB to HEX
  const rgbToHex = (r, g, b) =>
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
      .toUpperCase();

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
    return { h: h * 360, s, l };
  };

  // Convert HSL to RGB
  const hslToRgb = (h, s, l) => {
    h /= 360;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
    const m = l - c / 2;
    let r, g, b;

    if (h < 1 / 6) {
      r = c;
      g = x;
      b = 0;
    } else if (h < 2 / 6) {
      r = x;
      g = c;
      b = 0;
    } else if (h < 3 / 6) {
      r = 0;
      g = c;
      b = x;
    } else if (h < 4 / 6) {
      r = 0;
      g = x;
      b = c;
    } else if (h < 5 / 6) {
      r = x;
      g = 0;
      b = c;
    } else {
      r = c;
      g = 0;
      b = x;
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    };
  };

  // Generate matching colors with adjustments
  const generateMatches = useCallback(() => {
    const rgb = hexToRgb(baseColor);
    let hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl = {
      h: (hsl.h + adjustment.hue) % 360,
      s: Math.max(0, Math.min(1, hsl.s + adjustment.saturation / 100)),
      l: Math.max(0, Math.min(1, hsl.l + adjustment.lightness / 100)),
    };
    let newMatches = [];

    switch (matchType) {
      case "complementary":
        newMatches = [rgbToHex(hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l))];
        break;
      case "analogous":
        newMatches = [
          rgbToHex(hslToRgb((hsl.h + 30) % 360, hsl.s, hsl.l)),
          rgbToHex(hslToRgb((hsl.h - 30 + 360) % 360, hsl.s, hsl.l)),
        ];
        break;
      case "triadic":
        newMatches = [
          rgbToHex(hslToRgb((hsl.h + 120) % 360, hsl.s, hsl.l)),
          rgbToHex(hslToRgb((hsl.h + 240) % 360, hsl.s, hsl.l)),
        ];
        break;
      case "shades":
        newMatches = [
          rgbToHex(hslToRgb(hsl.h, hsl.s, Math.max(0.2, hsl.l - 0.2))),
          rgbToHex(hslToRgb(hsl.h, hsl.s, Math.min(0.8, hsl.l + 0.2))),
        ];
        break;
      case "tints":
        newMatches = [
          rgbToHex(hslToRgb(hsl.h, Math.max(0.2, hsl.s - 0.2), hsl.l)),
          rgbToHex(hslToRgb(hsl.h, Math.min(0.8, hsl.s + 0.2), hsl.l)),
        ];
        break;
      case "monochromatic":
        newMatches = [
          rgbToHex(hslToRgb(hsl.h, hsl.s, Math.max(0.1, hsl.l - 0.3))),
          rgbToHex(hslToRgb(hsl.h, hsl.s, Math.min(0.9, hsl.l + 0.3))),
        ];
        break;
      case "split-complementary":
        newMatches = [
          rgbToHex(hslToRgb((hsl.h + 150) % 360, hsl.s, hsl.l)),
          rgbToHex(hslToRgb((hsl.h + 210) % 360, hsl.s, hsl.l)),
        ];
        break;
    }
    setMatches(newMatches);
  }, [baseColor, matchType, adjustment]);

  useEffect(() => {
    generateMatches();
  }, [generateMatches]);

  // Save a match
  const saveMatch = (color) => {
    if (!savedMatches.includes(color)) {
      setSavedMatches([...savedMatches, color]);
    }
  };

  // Remove a saved match
  const removeSavedMatch = (color) => {
    setSavedMatches(savedMatches.filter((match) => match !== color));
  };

  // Reset adjustments
  const resetAdjustments = () => {
    setAdjustment({ hue: 0, saturation: 0, lightness: 0 });
  };

  // Copy all matches
  const copyAllMatches = () => {
    const text = [baseColor, ...matches].join("\n");
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Matching Tool
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls and Matches */}
          <div className="space-y-6">
            {/* Base Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer border-none"
                />
                <input
                  type="text"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>
            </div>

            {/* Match Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Match Type
              </label>
              <select
                value={matchType}
                onChange={(e) => setMatchType(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="complementary">Complementary</option>
                <option value="analogous">Analogous</option>
                <option value="triadic">Triadic</option>
                <option value="shades">Shades</option>
                <option value="tints">Tints</option>
                <option value="monochromatic">Monochromatic</option>
                <option value="split-complementary">Split-Complementary</option>
              </select>
            </div>

            {/* Adjustments */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Fine-Tune Adjustments
              </label>
              {[
                { label: "Hue", key: "hue", min: -180, max: 180, unit: "°" },
                { label: "Saturation", key: "saturation", min: -100, max: 100, unit: "%" },
                { label: "Lightness", key: "lightness", min: -100, max: 100, unit: "%" },
              ].map(({ label, key, min, max, unit }) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-20">{label}</span>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    value={adjustment[key]}
                    onChange={(e) =>
                      setAdjustment((prev) => ({
                        ...prev,
                        [key]: parseInt(e.target.value),
                      }))
                    }
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <span className="text-sm text-gray-600">
                    {adjustment[key]}
                    {unit}
                  </span>
                </div>
              ))}
              <button
                onClick={resetAdjustments}
                className="mt-2 text-sm text-blue-500 hover:underline flex items-center gap-1"
              >
                <FaSync /> Reset Adjustments
              </button>
            </div>

            {/* Matches Display */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Matching Colors</h2>
                <button
                  onClick={copyAllMatches}
                  className="text-blue-500 text-sm hover:underline flex items-center gap-1"
                >
                  <FaCopy /> Copy All
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {matches.map((color, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-16 h-16 rounded-lg shadow-md transition-transform hover:scale-105"
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs mt-1 font-mono">{color}</p>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => navigator.clipboard.writeText(color)}
                        className="text-blue-500 text-xs hover:underline"
                        title="Copy"
                      >
                        <FaCopy />
                      </button>
                      <button
                        onClick={() => saveMatch(color)}
                        className="text-green-500 text-xs hover:text-green-600"
                        title="Save"
                      >
                        <FaSave />
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
              <p className="text-gray-500 text-sm italic">No saved matches yet</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                {savedMatches.map((color, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-16 h-16 rounded-lg shadow-md cursor-pointer transition-transform hover:scale-105"
                      style={{ backgroundColor: color }}
                      onClick={() => setBaseColor(color)}
                    />
                    <p className="text-xs mt-1 font-mono">{color}</p>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => navigator.clipboard.writeText(color)}
                        className="text-blue-500 text-xs hover:underline"
                        title="Copy"
                      >
                        <FaCopy />
                      </button>
                      <button
                        onClick={() => removeSavedMatch(color)}
                        className="text-red-500 text-xs hover:text-red-600"
                        title="Remove"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Palette Preview */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Palette Preview</h2>
          <div className="flex h-32 rounded-lg overflow-hidden shadow-md">
            <div className="flex-1" style={{ backgroundColor: baseColor }} />
            {matches.map((color, index) => (
              <div key={index} className="flex-1" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Multiple match types: Complementary, Analogous, Triadic, Shades, Tints, Monochromatic, Split-Complementary</li>
            <li>Fine-tune with Hue, Saturation, and Lightness adjustments</li>
            <li>Save and reuse colors</li>
            <li>Copy individual colors or entire palette</li>
            <li>Interactive palette preview</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ColorMatchingTool;