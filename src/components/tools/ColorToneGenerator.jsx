"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaDownload, FaSync, FaCopy } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the preview

const ColorToneGenerator = () => {
  const [baseColor, setBaseColor] = useState("#FF6B6B");
  const [toneCount, setToneCount] = useState(5);
  const [lightnessRange, setLightnessRange] = useState(40);
  const [saturationRange, setSaturationRange] = useState(20);
  const [hueShift, setHueShift] = useState(0); // New: Hue adjustment
  const [tones, setTones] = useState([]);
  const [toneStyle, setToneStyle] = useState("linear"); // New: Tone distribution style
  const previewRef = React.useRef(null);

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
          const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
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
    h = (h % 360 + 360) % 360; // Ensure hue is positive and within 0-360
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

  // Generate tones
  const generateTones = useCallback(() => {
    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const tonesArray = [];

    if (toneCount < 1) return;

    const lightnessStep = lightnessRange / (toneCount - 1 || 1);
    const saturationStep = saturationRange / (toneCount - 1 || 1);

    for (let i = 0; i < toneCount; i++) {
      let lightnessOffset, saturationOffset;

      // Different tone distribution styles
      if (toneStyle === "linear") {
        lightnessOffset = (i - (toneCount - 1) / 2) * lightnessStep / 100;
        saturationOffset = (i - (toneCount - 1) / 2) * saturationStep / 100;
      } else if (toneStyle === "exponential") {
        const factor = Math.pow(2, i / (toneCount - 1 || 1)) - 1;
        lightnessOffset = factor * lightnessRange / 100;
        saturationOffset = factor * saturationRange / 100;
      } else if (toneStyle === "center-weighted") {
        const mid = (toneCount - 1) / 2;
        const distance = Math.abs(i - mid);
        lightnessOffset = (distance / mid) * (lightnessRange / 100);
        saturationOffset = (distance / mid) * (saturationRange / 100);
      }

      const newLightness = Math.max(0, Math.min(1, hsl.l + lightnessOffset));
      const newSaturation = Math.max(0, Math.min(1, hsl.s + saturationOffset));
      const newHue = hsl.h + hueShift;

      const newRgb = hslToRgb(newHue, newSaturation, newLightness);
      tonesArray.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    }

    setTones(tonesArray);
  }, [baseColor, toneCount, lightnessRange, saturationRange, hueShift, toneStyle]);

  useEffect(() => {
    generateTones();
  }, [generateTones]);

  // Download preview as PNG
  const downloadPreview = () => {
    if (previewRef.current && tones.length > 0) {
      html2canvas(previewRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `color-tones-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  // Reset to default
  const reset = () => {
    setBaseColor("#FF6B6B");
    setToneCount(5);
    setLightnessRange(40);
    setSaturationRange(20);
    setHueShift(0);
    setToneStyle("linear");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Color Tone Generator</h1>

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
                />
                <button
                  onClick={() => navigator.clipboard.writeText(baseColor)}
                  className="p-2 text-blue-600 hover:text-blue-800"
                >
                  <FaCopy />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Tones: {toneCount}
              </label>
              <input
                type="range"
                min="1"
                max="12"
                value={toneCount}
                onChange={(e) => setToneCount(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lightness Range: ±{lightnessRange}%
              </label>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={lightnessRange}
                onChange={(e) => setLightnessRange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Saturation Range: ±{saturationRange}%
              </label>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={saturationRange}
                onChange={(e) => setSaturationRange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hue Shift: {hueShift}°
              </label>
              <input
                type="range"
                min="-180"
                max="180"
                step="5"
                value={hueShift}
                onChange={(e) => setHueShift(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tone Style</label>
              <select
                value={toneStyle}
                onChange={(e) => setToneStyle(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="linear">Linear</option>
                <option value="exponential">Exponential</option>
                <option value="center-weighted">Center-Weighted</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                onClick={downloadPreview}
                disabled={!tones.length}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Tones Display */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Generated Tones</h2>
            {tones.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {tones.map((color, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-16 h-16 rounded-lg shadow-md transition-transform hover:scale-105"
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs mt-2 font-mono">{color}</p>
                    <button
                      onClick={() => navigator.clipboard.writeText(color)}
                      className="text-blue-500 text-xs hover:underline mt-1 flex items-center gap-1"
                    >
                      <FaCopy /> Copy
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">Adjust parameters to generate tones</p>
            )}

            {/* Preview */}
            {tones.length > 0 && (
              <div ref={previewRef} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-md font-semibold text-gray-700 mb-2">Tones Preview</h3>
                <div className="flex h-24 rounded-lg overflow-hidden shadow-inner">
                  {tones.map((color, index) => (
                    <div
                      key={index}
                      className="flex-1 transition-colors"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Generate tones with adjustable lightness, saturation, and hue</li>
            <li>Multiple tone styles: Linear, Exponential, Center-Weighted</li>
            <li>Copy color codes to clipboard</li>
            <li>Download preview as PNG</li>
            <li>Real-time tone generation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ColorToneGenerator;