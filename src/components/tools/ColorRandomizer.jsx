"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync, FaRandom } from "react-icons/fa";

const ColorRandomizer = () => {
  const [color, setColor] = useState("#FF6B6B");
  const [history, setHistory] = useState([]);
  const [randomizeOptions, setRandomizeOptions] = useState({
    hue: true,
    saturation: true,
    lightness: true,
  });
  const [lockColor, setLockColor] = useState(false);
  const [colorFormat, setColorFormat] = useState("hex"); // hex, rgb, hsl
  const [rangeLimits, setRangeLimits] = useState({
    hue: { min: 0, max: 360 },
    saturation: { min: 0, max: 100 },
    lightness: { min: 0, max: 100 },
  });

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
    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  // Convert HSL to RGB
  const hslToRgb = (h, s, l) => {
    h = (h % 360 + 360) % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
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
      b: Math.round((b + m) * 255),
    };
  };

  // Generate random color within range limits
  const generateRandomColor = useCallback(() => {
    if (lockColor) return;

    const currentHsl = rgbToHsl(...Object.values(hexToRgb(color)));
    const newHsl = {
      h: randomizeOptions.hue
        ? Math.random() * (rangeLimits.hue.max - rangeLimits.hue.min) + rangeLimits.hue.min
        : currentHsl.h,
      s: randomizeOptions.saturation
        ? Math.random() * (rangeLimits.saturation.max - rangeLimits.saturation.min) +
          rangeLimits.saturation.min
        : currentHsl.s,
      l: randomizeOptions.lightness
        ? Math.random() * (rangeLimits.lightness.max - rangeLimits.lightness.min) +
          rangeLimits.lightness.min
        : currentHsl.l,
    };
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setColor(newHex);
    setHistory((prev) => [newHex, ...prev.slice(0, 9)]);
  }, [color, randomizeOptions, rangeLimits, lockColor]);

  // Handle option changes
  const handleOptionChange = (option) => {
    setRandomizeOptions((prev) => ({ ...prev, [option]: !prev[option] }));
  };

  // Handle range changes
  const handleRangeChange = (type, bound) => (e) => {
    const value = parseInt(e.target.value);
    setRangeLimits((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [bound]: Math.max(
          bound === "min" ? 0 : prev[type].min + 1,
          Math.min(bound === "max" ? (type === "hue" ? 360 : 100) : prev[type].max - 1, value)
        ),
      },
    }));
  };

  // Copy color in selected format
  const copyColor = () => {
    const rgb = hexToRgb(color);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    let text;
    switch (colorFormat) {
      case "rgb":
        text = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        break;
      case "hsl":
        text = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
        break;
      default:
        text = color;
    }
    navigator.clipboard.writeText(text);
  };

  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Color Randomizer</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls and Preview */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Current Color</h2>
              <div
                className="h-40 rounded-lg shadow-inner flex items-center justify-center text-white text-lg font-medium transition-colors"
                style={{ backgroundColor: color }}
              >
                {colorFormat === "hex"
                  ? color
                  : colorFormat === "rgb"
                  ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
                  : `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Randomize Options
                </label>
                {["hue", "saturation", "lightness"].map((option) => (
                  <div key={option} className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={randomizeOptions[option]}
                      onChange={() => handleOptionChange(option)}
                      className="rounded accent-blue-500"
                    />
                    <span className="capitalize">{option}</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Range Limits
                </label>
                {["hue", "saturation", "lightness"].map((type) => (
                  <div key={type} className="mb-2">
                    <span className="capitalize text-sm">{type}</span>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min="0"
                        max={type === "hue" ? 360 : 100}
                        value={rangeLimits[type].min}
                        onChange={handleRangeChange(type, "min")}
                        className="w-20 p-1 border rounded-md"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        min="0"
                        max={type === "hue" ? 360 : 100}
                        value={rangeLimits[type].max}
                        onChange={handleRangeChange(type, "max")}
                        className="w-20 p-1 border rounded-md"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={generateRandomColor}
                disabled={lockColor}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaRandom className="mr-2" /> Randomize
              </button>
              <button
                onClick={() => setLockColor(!lockColor)}
                className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                  lockColor
                    ? "bg-yellow-500 text-white hover:bg-yellow-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {lockColor ? "Unlock" : "Lock"} Color
              </button>
            </div>
          </div>

          {/* Color Details and History */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Color Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <select
                    value={colorFormat}
                    onChange={(e) => setColorFormat(e.target.value)}
                    className="p-1 border rounded-md"
                  >
                    <option value="hex">HEX</option>
                    <option value="rgb">RGB</option>
                    <option value="hsl">HSL</option>
                  </select>
                  <button
                    onClick={copyColor}
                    className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <FaCopy size={16} />
                  </button>
                </div>
                <p>HEX: {color}</p>
                <p>RGB: {rgb.r}, {rgb.g}, {rgb.b}</p>
                <p>
                  HSL: {Math.round(hsl.h)}°, {Math.round(hsl.s)}%, {Math.round(hsl.l)}%
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Color History</h2>
              {history.length === 0 ? (
                <p className="text-gray-500 text-sm">No colors generated yet</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 max-h-48 overflow-y-auto">
                  {history.map((histColor, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="w-12 h-12 rounded shadow cursor-pointer hover:scale-105 transition-transform"
                        style={{ backgroundColor: histColor }}
                        onClick={() => setColor(histColor)}
                      />
                      <p className="text-xs mt-1">{histColor}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">Features</h2>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Randomize Hue, Saturation, and Lightness with customizable ranges</li>
            <li>Lock current color to prevent changes</li>
            <li>Copy color in HEX, RGB, or HSL format</li>
            <li>History of last 10 colors with clickable preview</li>
            <li>Smooth transitions and hover effects</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ColorRandomizer;