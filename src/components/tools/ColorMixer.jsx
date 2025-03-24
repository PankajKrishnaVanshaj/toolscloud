"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaPlus, FaTrash, FaSync, FaCopy } from "react-icons/fa";

const ColorMixer = () => {
  const [colors, setColors] = useState([
    { hex: "#FF6B6B", weight: 50 },
    { hex: "#4ECDC4", weight: 50 },
  ]);
  const [newColor, setNewColor] = useState("#000000");
  const [mixedColor, setMixedColor] = useState("");
  const [mixMode, setMixMode] = useState("rgb"); // RGB or HSL mixing
  const [savedColors, setSavedColors] = useState([]);

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
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  // Convert HSL to RGB
  const hslToRgb = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  };

  // Mix colors based on weights and mode
  const mixColors = useCallback(() => {
    const totalWeight = colors.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight === 0) return;

    if (mixMode === "rgb") {
      let r = 0,
        g = 0,
        b = 0;
      colors.forEach((color) => {
        const rgb = hexToRgb(color.hex);
        const weight = color.weight / totalWeight;
        r += rgb.r * weight;
        g += rgb.g * weight;
        b += rgb.b * weight;
      });
      const mixedRgb = {
        r: Math.min(255, Math.max(0, r)),
        g: Math.min(255, Math.max(0, g)),
        b: Math.min(255, Math.max(0, b)),
      };
      setMixedColor(rgbToHex(mixedRgb.r, mixedRgb.g, mixedRgb.b));
    } else {
      // HSL Mixing
      let h = 0,
        s = 0,
        l = 0;
      colors.forEach((color) => {
        const rgb = hexToRgb(color.hex);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        const weight = color.weight / totalWeight;
        h += hsl.h * weight;
        s += hsl.s * weight;
        l += hsl.l * weight;
      });
      const mixedHsl = {
        h: Math.round(h) % 360,
        s: Math.min(100, Math.max(0, s)),
        l: Math.min(100, Math.max(0, l)),
      };
      const mixedRgb = hslToRgb(mixedHsl.h, mixedHsl.s, mixedHsl.l);
      setMixedColor(rgbToHex(mixedRgb.r, mixedRgb.g, mixedRgb.b));
    }
  }, [colors, mixMode]);

  useEffect(() => {
    mixColors();
  }, [mixColors]);

  // Add a new color
  const addColor = () => {
    if (/^#[0-9A-F]{6}$/i.test(newColor) && !colors.some((c) => c.hex === newColor)) {
      setColors([...colors, { hex: newColor, weight: 50 }]);
      setNewColor("#000000");
    }
  };

  // Update color HEX
  const updateColorHex = (index, value) => {
    const newColors = [...colors];
    newColors[index].hex = value;
    setColors(newColors);
  };

  // Update color weight
  const updateColorWeight = (index, value) => {
    const newColors = [...colors];
    newColors[index].weight = Math.max(0, Math.min(100, parseInt(value) || 0));
    setColors(newColors);
  };

  // Remove a color
  const removeColor = (index) => {
    if (colors.length > 2) {
      setColors(colors.filter((_, i) => i !== index));
    }
  };

  // Save mixed color
  const saveMixedColor = () => {
    if (mixedColor && !savedColors.includes(mixedColor)) {
      setSavedColors([...savedColors, mixedColor]);
    }
  };

  // Reset to default
  const reset = () => {
    setColors([
      { hex: "#FF6B6B", weight: 50 },
      { hex: "#4ECDC4", weight: 50 },
    ]);
    setNewColor("#000000");
    setMixMode("rgb");
  };

  const mixedRgb = hexToRgb(mixedColor);
  const mixedHsl = rgbToHsl(mixedRgb.r, mixedRgb.g, mixedRgb.b);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Color Mixer</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Color Inputs */}
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
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FaPlus className="mr-2" /> Add
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Input Colors</h2>
              {colors.map((color, index) => (
                <div key={index} className="flex items-center gap-2 mb-3">
                  <input
                    type="color"
                    value={color.hex}
                    onChange={(e) => updateColorHex(index, e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={color.hex}
                    onChange={(e) => updateColorHex(index, e.target.value)}
                    className="w-24 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={color.weight}
                    onChange={(e) => updateColorWeight(index, e.target.value)}
                    className="w-20 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Weight"
                  />
                  {colors.length > 2 && (
                    <button
                      onClick={() => removeColor(index)}
                      className="p-2 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mixed Color */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Mixed Color</h2>
              <div
                className="w-full h-32 rounded-lg shadow-inner mb-4 transition-colors duration-300"
                style={{ backgroundColor: mixedColor }}
              />
              <div className="space-y-2 text-sm">
                <p>
                  HEX: {mixedColor}
                  <button
                    onClick={() => navigator.clipboard.writeText(mixedColor)}
                    className="ml-2 text-blue-500 hover:underline"
                  >
                    <FaCopy />
                  </button>
                </p>
                <p>
                  RGB: {mixedRgb.r}, {mixedRgb.g}, {mixedRgb.b}
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `${mixedRgb.r}, ${mixedRgb.g}, ${mixedRgb.b}`
                      )
                    }
                    className="ml-2 text-blue-500 hover:underline"
                  >
                    <FaCopy />
                  </button>
                </p>
                <p>
                  HSL: {mixedHsl.h}°, {mixedHsl.s}%, {mixedHsl.l}%
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `${mixedHsl.h}, ${mixedHsl.s}%, ${mixedHsl.l}%`
                      )
                    }
                    className="ml-2 text-blue-500 hover:underline"
                  >
                    <FaCopy />
                  </button>
                </p>
              </div>
              <button
                onClick={saveMixedColor}
                className="mt-4 w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Save Mixed Color
              </button>
            </div>
          </div>

          {/* Controls and Saved Colors */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mix Mode
              </label>
              <select
                value={mixMode}
                onChange={(e) => setMixMode(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="rgb">RGB (Additive)</option>
                <option value="hsl">HSL (Perceptual)</option>
              </select>
              <button
                onClick={reset}
                className="mt-4 w-full flex items-center justify-center py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>

            {savedColors.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Saved Colors</h2>
                <div className="grid grid-cols-2 gap-2">
                  {savedColors.map((color, index) => (
                    <div
                      key={index}
                      className="h-12 rounded-lg shadow-inner cursor-pointer"
                      style={{ backgroundColor: color }}
                      onClick={() => setNewColor(color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">About Color Mixing</h2>
          <div className="text-sm text-blue-600">
            <p>Mix colors using different methods:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>
                <strong>RGB:</strong> Weighted average of Red, Green, Blue values
              </li>
              <li>
                <strong>HSL:</strong> Weighted average of Hue, Saturation, Lightness
              </li>
              <li>Weights (0-100) determine contribution; normalized to 100%</li>
              <li>Save mixed colors for reuse</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorMixer;