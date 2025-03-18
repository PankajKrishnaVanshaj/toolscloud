"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaSync, FaRandom } from "react-icons/fa";

const ColorContrastRatioCalculator = () => {
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [contrastRatio, setContrastRatio] = useState(0);
  const [luminance1, setLuminance1] = useState(0);
  const [luminance2, setLuminance2] = useState(0);
  const [fontSize, setFontSize] = useState(16); // For preview
  const [isBold, setIsBold] = useState(false); // For preview
  const [showDetails, setShowDetails] = useState(true); // Toggle detailed view

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

  // Calculate relative luminance (WCAG formula)
  const calculateLuminance = (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  // Calculate contrast ratio
  const calculateContrastRatio = (lum1, lum2) => {
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  // Check WCAG compliance
  const getWCAGCompliance = (ratio) => {
    return {
      AAALarge: ratio >= 4.5,
      AAANormal: ratio >= 7,
      AALarge: ratio >= 3,
      AANormal: ratio >= 4.5,
    };
  };

  // Update contrast ratio and luminance
  const updateContrast = useCallback(() => {
    const rgb1 = hexToRgb(foregroundColor);
    const rgb2 = hexToRgb(backgroundColor);
    const lum1 = calculateLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = calculateLuminance(rgb2.r, rgb2.g, rgb2.b);
    setLuminance1(lum1);
    setLuminance2(lum2);
    const ratio = calculateContrastRatio(lum1, lum2);
    setContrastRatio(ratio.toFixed(2));
  }, [foregroundColor, backgroundColor]);

  useEffect(() => {
    updateContrast();
  }, [updateContrast]);

  const compliance = getWCAGCompliance(contrastRatio);

  // Generate random colors
  const randomizeColors = () => {
    const randomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
    setForegroundColor(randomColor());
    setBackgroundColor(randomColor());
  };

  // Reset to default
  const reset = () => {
    setForegroundColor("#000000");
    setBackgroundColor("#FFFFFF");
    setFontSize(16);
    setIsBold(false);
  };

  // Copy CSS to clipboard
  const copyCSS = () => {
    const css = `color: ${foregroundColor};\nbackground-color: ${backgroundColor};`;
    navigator.clipboard.writeText(css);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Contrast Ratio Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Color Inputs and Preview */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Foreground Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Preview Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Size ({fontSize}px)
                </label>
                <input
                  type="range"
                  min="12"
                  max="36"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isBold}
                    onChange={(e) => setIsBold(e.target.checked)}
                    className="mr-2 accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">Bold Text</span>
                </label>
              </div>
            </div>

            {/* Preview */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Preview</h2>
              <div
                className="h-40 rounded-lg flex items-center justify-center text-center p-4 shadow-inner"
                style={{
                  backgroundColor,
                  color: foregroundColor,
                  fontSize: `${fontSize}px`,
                  fontWeight: isBold ? "bold" : "normal",
                }}
              >
                The quick brown fox jumps over the lazy dog
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={randomizeColors}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaRandom className="mr-2" /> Randomize
              </button>
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Contrast Results */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Contrast Analysis</h2>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-blue-500 hover:underline text-sm"
                >
                  {showDetails ? "Hide Details" : "Show Details"}
                </button>
              </div>
              <div className={showDetails ? "space-y-3" : "space-y-1"}>
                <p className="text-sm">
                  Contrast Ratio: <span className="font-bold">{contrastRatio}:1</span>
                </p>
                {showDetails && (
                  <>
                    <p className="text-sm">
                      Foreground Luminance: {luminance1.toFixed(4)}
                    </p>
                    <p className="text-sm">
                      Background Luminance: {luminance2.toFixed(4)}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium text-sm">WCAG Level AA</p>
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
                        <p className="font-medium text-sm">WCAG Level AAA</p>
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
                  </>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">CSS Usage</h2>
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
                {`.example {
  color: ${foregroundColor};
  background-color: ${backgroundColor};
  font-size: ${fontSize}px;
  font-weight: ${isBold ? "bold" : "normal"};
}`}
              </pre>
              <button
                onClick={copyCSS}
                className="mt-2 flex items-center text-blue-500 hover:underline text-sm"
              >
                <FaCopy className="mr-1" /> Copy CSS
              </button>
            </div>
          </div>
        </div>

        {/* WCAG Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold mb-2 text-blue-700">WCAG Requirements</h2>
          <p className="text-sm text-blue-600">
            <strong>Level AA:</strong> 4.5:1 for normal text, 3:1 for large text<br />
            <strong>Level AAA:</strong> 7:1 for normal text, 4.5:1 for large text<br />
            Large text is typically 18pt+ (24px+) or 14pt+ (18px+) bold.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ColorContrastRatioCalculator;