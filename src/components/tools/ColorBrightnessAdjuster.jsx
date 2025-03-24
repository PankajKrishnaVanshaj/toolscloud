"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaSync, FaDownload } from "react-icons/fa";

const ColorBrightnessAdjuster = () => {
  const [baseColor, setBaseColor] = useState("#FF6B6B");
  const [brightnessAdjust, setBrightnessAdjust] = useState(0); // -100 to 100
  const [contrastAdjust, setContrastAdjust] = useState(0); // -100 to 100
  const [saturationAdjust, setSaturationAdjust] = useState(0); // -100 to 100
  const [adjustedColor, setAdjustedColor] = useState("");
  const canvasRef = React.useRef(null);

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
    h = (h % 360 + 360) % 360;
    h /= 360;
    s = Math.max(0, Math.min(1, s));
    l = Math.max(0, Math.min(1, l));
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

  // Adjust color properties
  const adjustColor = useCallback((hex, brightness, saturation, contrast) => {
    const rgb = hexToRgb(hex);
    let hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    // Adjust saturation
    const newSaturation = Math.max(
      0,
      Math.min(1, hsl.s + saturation / 100)
    );

    // Adjust brightness (lightness)
    const newLightness = Math.max(0, Math.min(1, hsl.l + brightness / 100));

    // Adjust contrast (simplified: affects lightness range)
    const contrastFactor = (contrast + 100) / 100;
    const adjustedLightness = Math.max(
      0,
      Math.min(1, (newLightness - 0.5) * contrastFactor + 0.5)
    );

    const adjustedRgb = hslToRgb(hsl.h, newSaturation, adjustedLightness);
    return rgbToHex(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b);
  }, []);

  useEffect(() => {
    if (/^#[0-9A-Fa-f]{6}$/.test(baseColor)) {
      const adjusted = adjustColor(
        baseColor,
        brightnessAdjust,
        saturationAdjust,
        contrastAdjust
      );
      setAdjustedColor(adjusted);
    } else {
      setAdjustedColor("");
    }
  }, [baseColor, brightnessAdjust, saturationAdjust, contrastAdjust, adjustColor]);

  const baseRgb = hexToRgb(baseColor);
  const adjustedRgb = hexToRgb(adjustedColor);
  const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
  const adjustedHsl = rgbToHsl(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b);

  // Reset all adjustments
  const resetAdjustments = () => {
    setBrightnessAdjust(0);
    setSaturationAdjust(0);
    setContrastAdjust(0);
  };

  // Copy color to clipboard
  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color);
    alert(`${color} copied to clipboard!`);
  };

  // Download color swatch
  const downloadSwatch = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = 200;
    canvas.height = 100;

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 100, 100);
    ctx.fillStyle = adjustedColor;
    ctx.fillRect(100, 0, 100, 100);

    const link = document.createElement("a");
    link.download = `color-swatch-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Adjuster
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  className="p-2 text-blue-500 hover:text-blue-700"
                >
                  <FaCopy />
                </button>
              </div>
            </div>

            {[
              { label: "Brightness", value: brightnessAdjust, setter: setBrightnessAdjust },
              { label: "Saturation", value: saturationAdjust, setter: setSaturationAdjust },
              { label: "Contrast", value: contrastAdjust, setter: setContrastAdjust },
            ].map(({ label, value, setter }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label} Adjust: {value}%
                </label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={value}
                  onChange={(e) => setter(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            ))}

            <div className="flex justify-center gap-4">
              <button
                onClick={resetAdjustments}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <FaSync className="mr-2" /> Reset
              </button>
              <button
                onClick={downloadSwatch}
                disabled={!adjustedColor}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <FaDownload className="mr-2" /> Download Swatch
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
                      HEX: {adjustedColor}{" "}
                      <button
                        onClick={() => copyToClipboard(adjustedColor)}
                        className="ml-2 text-blue-500 hover:underline text-xs"
                      >
                        Copy
                      </button>
                    </p>
                    <p>
                      RGB: {adjustedRgb.r}, {adjustedRgb.g}, {adjustedRgb.b}
                    </p>
                    <p>
                      HSL: {Math.round(adjustedHsl.h)}°,{" "}
                      {Math.round(adjustedHsl.s * 100)}%,{" "}
                      {Math.round(adjustedHsl.l * 100)}%
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Enter a valid HEX color (e.g., #FF6B6B) to adjust
                </p>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">Features</h2>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Adjust brightness, saturation, and contrast</li>
            <li>Real-time color preview</li>
            <li>Copy HEX code to clipboard</li>
            <li>Download color swatch as PNG</li>
            <li>Supports HEX, RGB, and HSL color formats</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ColorBrightnessAdjuster;