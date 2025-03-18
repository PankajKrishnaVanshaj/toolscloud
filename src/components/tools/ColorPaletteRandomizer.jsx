"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaSync, FaLock, FaUnlock } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading palette preview

const ColorPaletteRandomizer = () => {
  const [paletteSize, setPaletteSize] = useState(5);
  const [palette, setPalette] = useState([]);
  const [lockedColors, setLockedColors] = useState(new Set());
  const [harmony, setHarmony] = useState("random");
  const [baseColor, setBaseColor] = useState("#ffffff");
  const [saturation, setSaturation] = useState(0.7); // Default saturation
  const [lightness, setLightness] = useState(0.5); // Default lightness
  const paletteRef = React.useRef(null);

  // Generate random HEX color
  const generateRandomColor = useCallback(() => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }, []);

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

  // Generate palette with harmony
  const generatePalette = useCallback(() => {
    const newPalette = [];
    const baseRgb = hexToRgb(baseColor);
    const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);

    for (let i = 0; i < paletteSize; i++) {
      if (lockedColors.has(i) && palette[i]) {
        newPalette.push(palette[i]);
      } else {
        let newColor;
        switch (harmony) {
          case "complementary":
            newColor =
              i === 0
                ? baseColor
                : rgbToHex(
                    hslToRgb(
                      (baseHsl.h + 180) % 360,
                      saturation,
                      lightness
                    )
                  );
            break;
          case "analogous":
            newColor = rgbToHex(
              hslToRgb(
                (baseHsl.h + (i * 30 - 60)) % 360,
                saturation,
                lightness
              )
            );
            break;
          case "triadic":
            newColor = rgbToHex(
              hslToRgb(
                (baseHsl.h + (i * 120)) % 360,
                saturation,
                lightness
              )
            );
            break;
          case "monochromatic":
            newColor = rgbToHex(
              hslToRgb(
                baseHsl.h,
                saturation,
                Math.max(0.1, Math.min(0.9, lightness + (i * 0.15 - 0.3)))
              )
            );
            break;
          case "split-complementary":
            newColor = rgbToHex(
              hslToRgb(
                (baseHsl.h + (i % 2 === 0 ? 0 : i === 1 ? 150 : 210)) % 360,
                saturation,
                lightness
              )
            );
            break;
          default: // random
            newColor = generateRandomColor();
        }
        newPalette.push(newColor);
      }
    }
    setPalette(newPalette);
  }, [paletteSize, harmony, baseColor, lockedColors, palette, saturation, lightness]);

  // Toggle lock on a color
  const toggleLock = (index) => {
    const newLocked = new Set(lockedColors);
    if (newLocked.has(index)) {
      newLocked.delete(index);
    } else {
      newLocked.add(index);
    }
    setLockedColors(newLocked);
  };

  // Copy palette as JSON
  const copyPaletteJson = () => {
    const json = JSON.stringify(palette);
    navigator.clipboard.writeText(json);
    alert("Palette copied as JSON!");
  };

  // Download palette preview
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

  // Reset everything
  const reset = () => {
    setPalette([]);
    setLockedColors(new Set());
    setPaletteSize(5);
    setHarmony("random");
    setBaseColor("#ffffff");
    setSaturation(0.7);
    setLightness(0.5);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Palette Randomizer
        </h1>

        <div className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Palette Size
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={paletteSize}
                onChange={(e) =>
                  setPaletteSize(Math.max(2, Math.min(10, parseInt(e.target.value))))
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color Harmony
              </label>
              <select
                value={harmony}
                onChange={(e) => setHarmony(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="random">Random</option>
                <option value="complementary">Complementary</option>
                <option value="analogous">Analogous</option>
                <option value="triadic">Triadic</option>
                <option value="monochromatic">Monochromatic</option>
                <option value="split-complementary">Split-Complementary</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Color
              </label>
              <input
                type="color"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                className="w-full h-10 p-1 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Saturation ({(saturation * 100).toFixed(0)}%)
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={saturation}
                onChange={(e) => setSaturation(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lightness ({(lightness * 100).toFixed(0)}%)
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={lightness}
                onChange={(e) => setLightness(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generatePalette}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Generate Palette
            </button>
            <button
              onClick={copyPaletteJson}
              disabled={palette.length === 0}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaCopy className="mr-2" /> Copy JSON
            </button>
            <button
              onClick={downloadPalette}
              disabled={palette.length === 0}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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

          {/* Palette Display */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Generated Palette</h2>
            {palette.length === 0 ? (
              <p className="text-gray-500 italic">Click "Generate Palette" to start</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {palette.map((color, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-20 h-20 rounded-lg shadow-md relative transition-transform hover:scale-105"
                      style={{ backgroundColor: color }}
                    >
                      <button
                        onClick={() => toggleLock(index)}
                        className={`absolute top-1 right-1 p-1 rounded-full ${
                          lockedColors.has(index)
                            ? "bg-yellow-500 hover:bg-yellow-600"
                            : "bg-gray-300 hover:bg-gray-400"
                        } text-white transition-colors`}
                      >
                        {lockedColors.has(index) ? <FaLock /> : <FaUnlock />}
                      </button>
                    </div>
                    <p className="text-xs mt-2 font-mono">{color}</p>
                    <button
                      onClick={() => navigator.clipboard.writeText(color)}
                      className="text-blue-500 text-xs hover:underline mt-1"
                    >
                      Copy HEX
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Palette Preview */}
          {palette.length > 0 && (
            <div ref={paletteRef} className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Palette Preview</h2>
              <div className="flex h-32 rounded-lg overflow-hidden shadow-md">
                {palette.map((color, index) => (
                  <div
                    key={index}
                    className="flex-1"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Customizable palette size (2-10 colors)</li>
              <li>Multiple color harmonies including Split-Complementary</li>
              <li>Base color selection with saturation and lightness controls</li>
              <li>Lock individual colors</li>
              <li>Copy palette as JSON or individual HEX codes</li>
              <li>Download preview as PNG</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteRandomizer;