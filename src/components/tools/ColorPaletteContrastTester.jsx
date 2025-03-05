// app/components/ColorPaletteContrastTester.jsx
'use client';

import React, { useState, useEffect } from 'react';

const ColorPaletteContrastTester = () => {
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [contrastRatio, setContrastRatio] = useState(21);

  // Calculate luminance for a given color
  const getLuminance = (hex) => {
    const rgb = hexToRgb(hex);
    const [r, g, b] = rgb.map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  };

  // Calculate contrast ratio
  const calculateContrastRatio = () => {
    const lum1 = getLuminance(foregroundColor);
    const lum2 = getLuminance(backgroundColor);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    const ratio = (brightest + 0.05) / (darkest + 0.05);
    return Number(ratio.toFixed(2));
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
    setContrastRatio(calculateContrastRatio());
  }, [foregroundColor, backgroundColor]);

  const compliance = getWCAGCompliance(contrastRatio);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Contrast Tester
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Color Inputs */}
          <div className="space-y-4">
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
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
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
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preview
            </label>
            <div
              className="p-4 rounded-lg h-32 flex items-center justify-center"
              style={{ backgroundColor, color: foregroundColor }}
            >
              <p className="text-lg font-medium">
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
          </div>
        </div>

        {/* Contrast Results */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Contrast Analysis</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-700">
                Contrast Ratio: <span className="font-bold">{contrastRatio}:1</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">WCAG Level AA</p>
                <p className={`text-sm ${compliance.AANormal ? 'text-green-600' : 'text-red-600'}`}>
                  Normal Text: {compliance.AANormal ? 'Pass' : 'Fail'}
                </p>
                <p className={`text-sm ${compliance.AALarge ? 'text-green-600' : 'text-red-600'}`}>
                  Large Text: {compliance.AALarge ? 'Pass' : 'Fail'}
                </p>
              </div>
              <div>
                <p className="font-medium">WCAG Level AAA</p>
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
      </div>
    </div>
  );
};

export default ColorPaletteContrastTester;