"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaRandom, FaCopy } from "react-icons/fa";

const ColorPaletteContrastTester = () => {
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [contrastRatio, setContrastRatio] = useState(21);
  const [textSize, setTextSize] = useState("normal"); // normal or large
  const [savedPalettes, setSavedPalettes] = useState([]);

  // Calculate luminance for a given color
  const getLuminance = (hex) => {
    const rgb = hexToRgb(hex);
    const [r, g, b] = rgb.map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [0, 0, 0];
  };

  // Calculate contrast ratio
  const calculateContrastRatio = useCallback(() => {
    const lum1 = getLuminance(foregroundColor);
    const lum2 = getLuminance(backgroundColor);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    const ratio = (brightest + 0.05) / (darkest + 0.05);
    return Number(ratio.toFixed(2));
  }, [foregroundColor, backgroundColor]);

  // Check WCAG compliance
  const getWCAGCompliance = (ratio) => {
    return {
      AAALarge: ratio >= 4.5,
      AAANormal: ratio >= 7,
      AALarge: ratio >= 3,
      AANormal: ratio >= 4.5,
    };
  };

  useEffect(() => {
    setContrastRatio(calculateContrastRatio());
  }, [foregroundColor, backgroundColor, calculateContrastRatio]);

  const compliance = getWCAGCompliance(contrastRatio);

  // Generate random color
  const randomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;

  // Randomize colors
  const randomizeColors = () => {
    setForegroundColor(randomColor());
    setBackgroundColor(randomColor());
  };

  // Reset to default
  const resetColors = () => {
    setForegroundColor("#000000");
    setBackgroundColor("#FFFFFF");
    setTextSize("normal");
  };

  // Save current palette
  const savePalette = () => {
    const palette = { foreground: foregroundColor, background: backgroundColor, ratio: contrastRatio };
    setSavedPalettes((prev) => [...prev, palette].slice(-5)); // Keep last 5
  };

  // Load saved palette
  const loadPalette = (palette) => {
    setForegroundColor(palette.foreground);
    setBackgroundColor(palette.background);
  };

  // Copy color to clipboard
  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color);
    alert(`Copied ${color} to clipboard!`);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Contrast Tester
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Color Inputs */}
          <div className="space-y-6">
            {[
              { label: "Foreground Color", color: foregroundColor, setter: setForegroundColor },
              { label: "Background Color", color: backgroundColor, setter: setBackgroundColor },
            ].map(({ label, color, setter }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setter(e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer border-none"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setter(e.target.value)}
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => copyToClipboard(color)}
                    className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    <FaCopy />
                  </button>
                </div>
              </div>
            ))}

            {/* Text Size Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text Size</label>
              <select
                value={textSize}
                onChange={(e) => setTextSize(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="normal">Normal</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preview</label>
            <div
              className="p-4 rounded-lg h-40 flex items-center justify-center shadow-inner"
              style={{ backgroundColor, color: foregroundColor }}
            >
              <p
                className={`font-medium ${
                  textSize === "large" ? "text-2xl" : "text-lg"
                }`}
              >
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
          </div>
        </div>

        {/* Contrast Results */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Contrast Analysis</h2>
          <div className="space-y-4">
            <p className="text-gray-700">
              Contrast Ratio: <span className="font-bold">{contrastRatio}:1</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-700">WCAG Level AA</p>
                <p
                  className={`text-sm ${
                    compliance.AANormal ? "text-green-600" : "text-red-600"
                  }`}
                >
                  Normal Text: {compliance.AANormal ? "Pass" : "Fail"}
                </p>
                <p
                  className={`text-sm ${
                    compliance.AALarge ? "text-green-600" : "text-red-600"
                  }`}
                >
                  Large Text: {compliance.AALarge ? "Pass" : "Fail"}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700">WCAG Level AAA</p>
                <p
                  className={`text-sm ${
                    compliance.AAANormal ? "text-green-600" : "text-red-600"
                  }`}
                >
                  Normal Text: {compliance.AAANormal ? "Pass" : "Fail"}
                </p>
                <p
                  className={`text-sm ${
                    compliance.AAALarge ? "text-green-600" : "text-red-600"
                  }`}
                >
                  Large Text: {compliance.AAALarge ? "Pass" : "Fail"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={randomizeColors}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FaRandom className="mr-2" /> Randomize
          </button>
          <button
            onClick={resetColors}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
          <button
            onClick={savePalette}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Save Palette
          </button>
        </div>

        {/* Saved Palettes */}
        {savedPalettes.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Saved Palettes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedPalettes.map((palette, index) => (
                <div
                  key={index}
                  className="p-2 bg-white rounded-md shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => loadPalette(palette)}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: palette.background }}
                    />
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: palette.foreground }}
                    />
                    <span className="text-sm text-gray-700">
                      Ratio: {palette.ratio}:1
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Real-time contrast ratio calculation</li>
            <li>WCAG AA/AAA compliance checker</li>
            <li>Text size toggle (normal/large)</li>
            <li>Random color generator</li>
            <li>Save and load color palettes (up to 5)</li>
            <li>Copy colors to clipboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteContrastTester;