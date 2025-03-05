// app/components/ColorContrastRatioCalculator.jsx
'use client';

import React, { useState, useEffect } from 'react';

const ColorContrastRatioCalculator = () => {
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [contrastRatio, setContrastRatio] = useState(0);
  const [luminance1, setLuminance1] = useState(0);
  const [luminance2, setLuminance2] = useState(0);

  // Convert HEX to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Calculate relative luminance (WCAG formula)
  const calculateLuminance = (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map(v => {
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
      AANormal: ratio >= 4.5
    };
  };

  useEffect(() => {
    const rgb1 = hexToRgb(foregroundColor);
    const rgb2 = hexToRgb(backgroundColor);
    const lum1 = calculateLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = calculateLuminance(rgb2.r, rgb2.g, rgb2.b);
    setLuminance1(lum1);
    setLuminance2(lum2);
    const ratio = calculateContrastRatio(lum1, lum2);
    setContrastRatio(ratio.toFixed(2));
  }, [foregroundColor, backgroundColor]);

  const compliance = getWCAGCompliance(contrastRatio);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Contrast Ratio Calculator
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Color Inputs */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Foreground Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 uppercase"
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
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>
            </div>

            {/* Preview */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Preview</h2>
              <div
                className="h-32 rounded-lg flex items-center justify-center text-lg font-medium"
                style={{ backgroundColor, color: foregroundColor }}
              >
                The quick brown fox jumps over the lazy dog
              </div>
            </div>
          </div>

          {/* Contrast Results */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Contrast Analysis</h2>
              <div className="space-y-3">
                <p className="text-sm">
                  Contrast Ratio: <span className="font-bold">{contrastRatio}:1</span>
                </p>
                <p className="text-sm">
                  Foreground Luminance: {luminance1.toFixed(4)}
                </p>
                <p className="text-sm">
                  Background Luminance: {luminance2.toFixed(4)}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-sm">WCAG Level AA</p>
                    <p className={`text-sm ${compliance.AANormal ? 'text-green-600' : 'text-red-600'}`}>
                      Normal Text: {compliance.AANormal ? 'Pass' : 'Fail'}
                    </p>
                    <p className={`text-sm ${compliance.AALarge ? 'text-green-600' : 'text-red-600'}`}>
                      Large Text: {compliance.AALarge ? 'Pass' : 'Fail'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">WCAG Level AAA</p>
                    <p className={`text-sm ${compliance.AAANormal ? 'text-green-600' : 'text-red-600'}`}>
                      Normal Text: {compliance.AAANormal ? 'Pass' : 'Fail'}
                    </p>
                    <p className={`text-sm ${compliance.AAALarge ? 'text-green-600' : 'text-red-600'}`}>
                      Large Text: {compliance.AAALarge ? 'Pass' : 'Fail'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">CSS Usage</h2>
              <pre className="text-sm bg-gray-100 p-2 rounded">
                {`.example {
  color: ${foregroundColor};
  background-color: ${backgroundColor};
}`}
              </pre>
              <button
                onClick={() => navigator.clipboard.writeText(`color: ${foregroundColor};\nbackground-color: ${backgroundColor};`)}
                className="mt-2 text-blue-500 hover:underline text-xs"
              >
                Copy CSS
              </button>
            </div>
          </div>
        </div>

        {/* WCAG Info */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">WCAG Requirements</h2>
          <p className="text-sm text-gray-700">
            <strong>Level AA:</strong> 4.5:1 for normal text, 3:1 for large text<br />
            <strong>Level AAA:</strong> 7:1 for normal text, 4.5:1 for large text<br />
            Large text is typically 18pt+ or 14pt+ bold.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ColorContrastRatioCalculator;