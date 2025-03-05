// app/components/ColorDeltaECalculator.jsx
'use client';

import React, { useState, useEffect } from 'react';

const ColorDeltaECalculator = () => {
  const [color1, setColor1] = useState('#FF6B6B');
  const [color2, setColor2] = useState('#4ECDC4');
  const [deltaE, setDeltaE] = useState(0);

  // Convert HEX to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Convert RGB to XYZ
  const rgbToXyz = (r, g, b) => {
    r = r / 255; g = g / 255; b = b / 255;
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    r *= 100; g *= 100; b *= 100;
    const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    const z = r * 0.0193 + g * 0.1192 + b * 0.9505;
    return { x, y, z };
  };

  // Convert XYZ to Lab
  const xyzToLab = (x, y, z) => {
    const refX = 95.047; // D65 illuminant
    const refY = 100.0;
    const refZ = 108.883;

    x = x / refX; y = y / refY; z = z / refZ;
    x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16 / 116);
    y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16 / 116);
    z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16 / 116);

    const l = (116 * y) - 16;
    const a = 500 * (x - y);
    const b = 200 * (y - z);
    return { l, a, b };
  };

  // CIEDE2000 Delta E calculation
  const calculateDeltaE = (lab1, lab2) => {
    const { l: L1, a: a1, b: b1 } = lab1;
    const { l: L2, a: a2, b: b2 } = lab2;

    const kL = 1; const kC = 1; const kH = 1; // Default weighting factors
    const deltaL = L2 - L1;
    const LBar = (L1 + L2) / 2;

    const C1 = Math.sqrt(a1 * a1 + b1 * b1);
    const C2 = Math.sqrt(a2 * a2 + b2 * b2);
    const CBar = (C1 + C2) / 2;

    const a1Prime = a1 + (a1 / 2) * (1 - Math.sqrt(Math.pow(CBar, 7) / (Math.pow(CBar, 7) + Math.pow(25, 7))));
    const a2Prime = a2 + (a2 / 2) * (1 - Math.sqrt(Math.pow(CBar, 7) / (Math.pow(CBar, 7) + Math.pow(25, 7))));

    const C1Prime = Math.sqrt(a1Prime * a1Prime + b1 * b1);
    const C2Prime = Math.sqrt(a2Prime * a2Prime + b2 * b2);
    const deltaC = C2Prime - C1Prime;

    const h1Prime = (Math.atan2(b1, a1Prime) * 180 / Math.PI + 360) % 360;
    const h2Prime = (Math.atan2(b2, a2Prime) * 180 / Math.PI + 360) % 360;

    let deltaH = h2Prime - h1Prime;
    if (Math.abs(deltaH) > 180) deltaH -= 360 * Math.sign(deltaH);
    deltaH = 2 * Math.sqrt(C1Prime * C2Prime) * Math.sin((deltaH * Math.PI / 180) / 2);

    const HBarPrime = (C1 * C2 === 0) ? h1Prime + h2Prime : 
                     (Math.abs(h1Prime - h2Prime) <= 180) ? (h1Prime + h2Prime) / 2 :
                     (h1Prime + h2Prime < 360) ? (h1Prime + h2Prime + 360) / 2 :
                     (h1Prime + h2Prime - 360) / 2;

    const T = 1 - 0.17 * Math.cos((HBarPrime - 30) * Math.PI / 180) +
              0.24 * Math.cos(2 * HBarPrime * Math.PI / 180) +
              0.32 * Math.cos((3 * HBarPrime + 6) * Math.PI / 180) -
              0.20 * Math.cos((4 * HBarPrime - 63) * Math.PI / 180);

    const SL = 1 + ((0.015 * Math.pow(LBar - 50, 2)) / 
              Math.sqrt(20 + Math.pow(LBar - 50, 2)));
    const SC = 1 + 0.045 * CBar;
    const SH = 1 + 0.015 * CBar * T;

    const RT = -2 * Math.sqrt(Math.pow(CBar, 7) / (Math.pow(CBar, 7) + Math.pow(25, 7))) *
              Math.sin((60 * Math.exp(-Math.pow((HBarPrime - 275) / 25, 2))) * Math.PI / 180);

    const deltaE = Math.sqrt(
      Math.pow(deltaL / (kL * SL), 2) +
      Math.pow(deltaC / (kC * SC), 2) +
      Math.pow(deltaH / (kH * SH), 2) +
      RT * (deltaC / (kC * SC)) * (deltaH / (kH * SH))
    );

    return deltaE;
  };

  useEffect(() => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    const xyz1 = rgbToXyz(rgb1.r, rgb1.g, rgb1.b);
    const xyz2 = rgbToXyz(rgb2.r, rgb2.g, rgb2.b);
    const lab1 = xyzToLab(xyz1.x, xyz1.y, xyz1.z);
    const lab2 = xyzToLab(xyz2.x, xyz2.y, xyz2.z);
    const deltaEValue = calculateDeltaE(lab1, lab2);
    setDeltaE(deltaEValue.toFixed(2));
  }, [color1, color2]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Delta E Calculator (CIEDE2000)
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Color Inputs */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color 1
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color1}
                  onChange={(e) => setColor1(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={color1}
                  onChange={(e) => setColor1(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color 2
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color2}
                  onChange={(e) => setColor2(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={color2}
                  onChange={(e) => setColor2(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>
            </div>

            {/* Preview */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Preview</h2>
              <div className="flex h-32 rounded-lg overflow-hidden">
                <div className="flex-1" style={{ backgroundColor: color1 }} />
                <div className="flex-1" style={{ backgroundColor: color2 }} />
              </div>
            </div>
          </div>

          {/* Delta E Result */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Delta E Result</h2>
              <p className="text-sm">
                Delta E (CIEDE2000): <span className="font-bold">{deltaE}</span>
              </p>
              <div className="mt-2">
                <p className="text-sm text-gray-600">Interpretation:</p>
                <ul className="list-disc ml-5 text-sm text-gray-700">
                  <li>0-1: Not perceptible by human eyes</li>
                  <li>1-2: Perceptible through close observation</li>
                  <li>2-10: Perceptible at a glance</li>
                  <li>11-49: Colors are more similar than opposite</li>
                  <li>50+: Colors are nearly opposite</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* About Delta E */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">About Delta E (CIEDE2000)</h2>
          <div className="text-sm text-gray-700">
            <p>Delta E measures the perceptual difference between two colors in the Lab color space:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>Uses CIEDE2000 formula for improved accuracy over earlier standards</li>
              <li>Accounts for lightness (L), chroma (a), and hue (b) differences</li>
              <li>Lower values indicate closer color matches</li>
            </ul>
            <p className="mt-1">Useful in design, printing, and quality control to ensure color consistency.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorDeltaECalculator;