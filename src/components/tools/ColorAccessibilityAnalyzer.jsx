// app/components/ColorAccessibilityAnalyzer.jsx
'use client';

import React, { useState, useEffect } from 'react';

const ColorAccessibilityAnalyzer = () => {
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

  // Convert RGB to HEX
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
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

  // Simulate color vision deficiencies (simplified)
  const simulateColorVision = (r, g, b, type) => {
    switch (type) {
      case 'protanopia': // Red deficiency
        return {
          r: 0.567 * r + 0.433 * g,
          g: 0.558 * r + 0.442 * g,
          b: b
        };
      case 'deuteranopia': // Green deficiency
        return {
          r: 0.625 * r + 0.375 * g,
          g: 0.7 * r + 0.3 * g,
          b: b
        };
      case 'tritanopia': // Blue deficiency
        return {
          r: r,
          g: 0.95 * g + 0.05 * b,
          b: 0.433 * g + 0.567 * b
        };
      default: // Normal vision
        return { r, g, b };
    }
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

  // Simulate vision types
  const visionTypes = ['normal', 'protanopia', 'deuteranopia', 'tritanopia'];
  const simulatedForegrounds = visionTypes.map(type => {
    const rgb = hexToRgb(foregroundColor);
    const simulated = simulateColorVision(rgb.r, rgb.g, rgb.b, type);
    return rgbToHex(simulated.r, simulated.g, simulated.b);
  });
  const simulatedBackgrounds = visionTypes.map(type => {
    const rgb = hexToRgb(backgroundColor);
    const simulated = simulateColorVision(rgb.r, rgb.g, rgb.b, type);
    return rgbToHex(simulated.r, simulated.g, simulated.b);
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Accessibility Analyzer
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Color Inputs and Preview */}
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

          {/* Contrast and Compliance */}
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
          </div>
        </div>

        {/* Color Vision Simulation */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Color Vision Deficiency Simulation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {visionTypes.map((type, index) => (
              <div key={type} className="space-y-2">
                <p className="text-sm font-medium capitalize">{type}</p>
                <div
                  className="h-24 rounded-lg flex items-center justify-center text-sm"
                  style={{
                    backgroundColor: simulatedBackgrounds[index],
                    color: simulatedForegrounds[index]
                  }}
                >
                  Sample Text
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Note: Simulations are approximations of common color vision deficiencies.
          </p>
        </div>

        {/* WCAG Info */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Accessibility Guidelines</h2>
          <div className="text-sm text-gray-700">
            <p>WCAG 2.1 Requirements:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>Level AA: 4.5:1 (normal text), 3:1 (large text)</li>
              <li>Level AAA: 7:1 (normal text), 4.5:1 (large text)</li>
              <li>Large text: 18pt+ or 14pt+ bold</li>
            </ul>
            <p className="mt-1">Ensure sufficient contrast and consider color vision deficiencies for accessibility.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorAccessibilityAnalyzer;