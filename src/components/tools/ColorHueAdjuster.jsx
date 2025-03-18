"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaSync, FaPalette } from "react-icons/fa";

const ColorHueAdjuster = () => {
  const [baseColor, setBaseColor] = useState("#FF6B6B");
  const [hueShift, setHueShift] = useState(0);
  const [saturationAdjust, setSaturationAdjust] = useState(0);
  const [lightnessAdjust, setLightnessAdjust] = useState(0);
  const [adjustedColor, setAdjustedColor] = useState("");
  const [history, setHistory] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

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
  const rgbToHex = (r, g, b) => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = Math.round(x).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
        .toUpperCase()
    );
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
    return { h: h * 360, s, l };
  };

  // Convert HSL to RGB
  const hslToRgb = (h, s, l) => {
    h = (h % 360 + 360) % 360; // Ensure hue is within 0-360
    h /= 360;
    s = Math.max(0, Math.min(1, s)); // Clamp saturation
    l = Math.max(0, Math.min(1, l)); // Clamp lightness
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

  // Adjust color with hue, saturation, and lightness
  const adjustColor = useCallback(
    (hex, hueShift, satAdjust, lightAdjust) => {
      const rgb = hexToRgb(hex);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const newHue = hsl.h + hueShift;
      const newSaturation = Math.max(0, Math.min(1, hsl.s + satAdjust / 100));
      const newLightness = Math.max(0, Math.min(1, hsl.l + lightAdjust / 100));
      const adjustedRgb = hslToRgb(newHue, newSaturation, newLightness);
      return rgbToHex(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b);
    },
    []
  );

  // Update adjusted color and history
  useEffect(() => {
    if (/^#[0-9A-Fa-f]{6}$/.test(baseColor)) {
      const adjusted = adjustColor(baseColor, hueShift, saturationAdjust, lightnessAdjust);
      setAdjustedColor(adjusted);
      setHistory((prev) => [...prev, { baseColor, adjusted, hueShift, saturationAdjust, lightnessAdjust }].slice(-5));
    } else {
      setAdjustedColor("");
    }
  }, [baseColor, hueShift, saturationAdjust, lightnessAdjust, adjustColor]);

  const baseRgb = hexToRgb(baseColor);
  const adjustedRgb = hexToRgb(adjustedColor);
  const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
  const adjustedHsl = rgbToHsl(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b);

  // Reset adjustments
  const resetAdjustments = () => {
    setHueShift(0);
    setSaturationAdjust(0);
    setLightnessAdjust(0);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Color Hue Adjuster</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
                  placeholder="#FF6B6B"
                />
                <button
                  onClick={() => copyToClipboard(baseColor)}
                  className="p-2 text-blue-500 hover:text-blue-700 transition-colors"
                  title="Copy Base Color"
                >
                  <FaCopy />
                </button>
              </div>
            </div>

            {/* Basic Adjustments */}
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
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Advanced Adjustments */}
            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center text-blue-600 hover:underline mb-2"
              >
                <FaPalette className="mr-2" />
                {showAdvanced ? "Hide Advanced" : "Show Advanced Adjustments"}
              </button>
              {showAdvanced && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Saturation Adjust: {saturationAdjust}%
                    </label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={saturationAdjust}
                      onChange={(e) => setSaturationAdjust(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lightness Adjust: {lightnessAdjust}%
                    </label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={lightnessAdjust}
                      onChange={(e) => setLightnessAdjust(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-2">
              <button
                onClick={resetAdjustments}
                className="flex items-center py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <FaSync className="mr-2" /> Reset Adjustments
              </button>
            </div>
          </div>

          {/* Result */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Adjusted Color</h2>
              {adjustedColor ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Base Color</p>
                      <div
                        className="w-full h-24 rounded-lg shadow-inner transition-colors"
                        style={{ backgroundColor: baseColor }}
                      />
                      <p className="text-sm mt-1 text-center">{baseColor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Adjusted Color</p>
                      <div
                        className="w-full h-24 rounded-lg shadow-inner transition-colors"
                        style={{ backgroundColor: adjustedColor }}
                      />
                      <p className="text-sm mt-1 text-center">{adjustedColor}</p>
                    </div>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>
                      HEX: {adjustedColor}
                      <button
                        onClick={() => copyToClipboard(adjustedColor)}
                        className="ml-2 text-blue-500 hover:underline text-xs"
                      >
                        Copy
                      </button>
                    </p>
                    <p>
                      RGB: {adjustedRgb.r}, {adjustedRgb.g}, {adjustedRgb.b}
                      <button
                        onClick={() =>
                          copyToClipboard(`${adjustedRgb.r}, ${adjustedRgb.g}, ${adjustedRgb.b}`)
                        }
                        className="ml-2 text-blue-500 hover:underline text-xs"
                      >
                        Copy
                      </button>
                    </p>
                    <p>
                      HSL: {Math.round(adjustedHsl.h)}°, {Math.round(adjustedHsl.s * 100)}%,{" "}
                      {Math.round(adjustedHsl.l * 100)}%
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `${Math.round(adjustedHsl.h)}, ${Math.round(
                              adjustedHsl.s * 100
                            )}, ${Math.round(adjustedHsl.l * 100)}`
                          )
                        }
                        className="ml-2 text-blue-500 hover:underline text-xs"
                      >
                        Copy
                      </button>
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Enter a valid HEX color (e.g., #FF6B6B) to adjust its properties
                </p>
              )}
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Adjustment History</h2>
                <ul className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
                  {history
                    .slice()
                    .reverse()
                    .map((entry, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
                        onClick={() => {
                          setBaseColor(entry.baseColor);
                          setHueShift(entry.hueShift);
                          setSaturationAdjust(entry.saturationAdjust);
                          setLightnessAdjust(entry.lightnessAdjust);
                        }}
                      >
                        <div
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: entry.adjusted }}
                        />
                        <span>
                          {entry.adjusted} (Hue: {entry.hueShift}°, Sat: {entry.saturationAdjust}
                          %, Light: {entry.lightnessAdjust}%)
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">About Color Adjustment</h2>
          <div className="text-sm text-blue-600">
            <p>Modify colors using the HSL color space:</p>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>Hue: 0°-360° (shift from -180° to +180°)</li>
              <li>Saturation: 0%-100% (adjust ±100%)</li>
              <li>Lightness: 0%-100% (adjust ±100%)</li>
              <li>Copy results in HEX, RGB, or HSL formats</li>
              <li>Track recent adjustments in history</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorHueAdjuster;