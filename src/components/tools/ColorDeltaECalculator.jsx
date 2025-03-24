"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaCopy } from "react-icons/fa";

const ColorDeltaECalculator = () => {
  const [color1, setColor1] = useState("#FF6B6B");
  const [color2, setColor2] = useState("#4ECDC4");
  const [deltaE, setDeltaE] = useState(0);
  const [formula, setFormula] = useState("CIEDE2000"); // New feature: switch formulas
  const [history, setHistory] = useState([]);

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

  // Convert RGB to XYZ
  const rgbToXyz = (r, g, b) => {
    r = r / 255;
    g = g / 255;
    b = b / 255;
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    r *= 100;
    g *= 100;
    b *= 100;
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

    x = x / refX;
    y = y / refY;
    z = z / refZ;
    x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
    y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
    z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

    const l = 116 * y - 16;
    const a = 500 * (x - y);
    const b = 200 * (y - z);
    return { l, a, b };
  };

  // CIE76 Delta E (simpler formula)
  const calculateDeltaE76 = (lab1, lab2) => {
    const { l: L1, a: a1, b: b1 } = lab1;
    const { l: L2, a: a2, b: b2 } = lab2;
    return Math.sqrt(
      Math.pow(L2 - L1, 2) + Math.pow(a2 - a1, 2) + Math.pow(b2 - b1, 2)
    );
  };

  // CIEDE2000 Delta E calculation
  const calculateDeltaE2000 = (lab1, lab2) => {
    const { l: L1, a: a1, b: b1 } = lab1;
    const { l: L2, a: a2, b: b2 } = lab2;

    const kL = 1;
    const kC = 1;
    const kH = 1;
    const deltaL = L2 - L1;
    const LBar = (L1 + L2) / 2;

    const C1 = Math.sqrt(a1 * a1 + b1 * b1);
    const C2 = Math.sqrt(a2 * a2 + b2 * b2);
    const CBar = (C1 + C2) / 2;

    const a1Prime =
      a1 +
      (a1 / 2) * (1 - Math.sqrt(Math.pow(CBar, 7) / (Math.pow(CBar, 7) + Math.pow(25, 7))));
    const a2Prime =
      a2 +
      (a2 / 2) * (1 - Math.sqrt(Math.pow(CBar, 7) / (Math.pow(CBar, 7) + Math.pow(25, 7))));

    const C1Prime = Math.sqrt(a1Prime * a1Prime + b1 * b1);
    const C2Prime = Math.sqrt(a2Prime * a2Prime + b2 * b2);
    const deltaC = C2Prime - C1Prime;

    
    const h1Prime = (Math.atan2(b1, a1Prime) * 180 / Math.PI + 360) % 360;
    const h2Prime = (Math.atan2(b2, a2Prime) * 180 / Math.PI + 360) % 360;

    let deltaH = h2Prime - h1Prime;
    if (Math.abs(deltaH) > 180) deltaH -= 360 * Math.sign(deltaH);
    deltaH = 2 * Math.sqrt(C1Prime * C2Prime) * Math.sin((deltaH * Math.PI) / 180 / 2);

    const HBarPrime =
      C1 * C2 === 0
        ? h1Prime + h2Prime
        : Math.abs(h1Prime - h2Prime) <= 180
        ? (h1Prime + h2Prime) / 2
        : h1Prime + h2Prime < 360
        ? (h1Prime + h2Prime + 360) / 2
        : (h1Prime + h2Prime - 360) / 2;

    const T =
      1 -
      0.17 * Math.cos(((HBarPrime - 30) * Math.PI) / 180) +
      0.24 * Math.cos((2 * HBarPrime * Math.PI) / 180) +
      0.32 * Math.cos(((3 * HBarPrime + 6) * Math.PI) / 180) -
      0.20 * Math.cos(((4 * HBarPrime - 63) * Math.PI) / 180);

    const SL = 1 + (0.015 * Math.pow(LBar - 50, 2)) / Math.sqrt(20 + Math.pow(LBar - 50, 2));
    const SC = 1 + 0.045 * CBar;
    const SH = 1 + 0.015 * CBar * T;

    const RT =
      -2 *
      Math.sqrt(Math.pow(CBar, 7) / (Math.pow(CBar, 7) + Math.pow(25, 7))) *
      Math.sin((60 * Math.exp(-Math.pow((HBarPrime - 275) / 25, 2))) * Math.PI / 180);

    const deltaE = Math.sqrt(
      Math.pow(deltaL / (kL * SL), 2) +
      Math.pow(deltaC / (kC * SC), 2) +
      Math.pow(deltaH / (kH * SH), 2) +
      RT * (deltaC / (kC * SC)) * (deltaH / (kH * SH))
    );

    return deltaE;
  };

  // Calculate Delta E based on selected formula
  const calculateDeltaE = useCallback(() => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    const xyz1 = rgbToXyz(rgb1.r, rgb1.g, rgb1.b);
    const xyz2 = rgbToXyz(rgb2.r, rgb2.g, rgb2.b);
    const lab1 = xyzToLab(xyz1.x, xyz1.y, xyz1.z);
    const lab2 = xyzToLab(xyz2.x, xyz2.y, xyz2.z);

    const deltaEValue =
      formula === "CIEDE2000" ? calculateDeltaE2000(lab1, lab2) : calculateDeltaE76(lab1, lab2);
    const result = deltaEValue.toFixed(2);
    setDeltaE(result);

    // Add to history
    setHistory((prev) => [
      { color1, color2, deltaE: result, formula, timestamp: new Date().toLocaleString() },
      ...prev.slice(0, 9), // Keep last 10 entries
    ]);
  }, [color1, color2, formula]);

  useEffect(() => {
    calculateDeltaE();
  }, [color1, color2, formula, calculateDeltaE]);

  // Reset colors
  const resetColors = () => {
    setColor1("#FF6B6B");
    setColor2("#4ECDC4");
    setFormula("CIEDE2000");
  };

  // Copy result to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(`ΔE (${formula}): ${deltaE}`);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Delta E Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Color Inputs and Preview */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Color 1", value: color1, setter: setColor1 },
                { label: "Color 2", value: color2, setter: setColor2 },
              ].map(({ label, value, setter }) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      className="w-12 h-12 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Formula
              </label>
              <select
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="CIEDE2000">CIEDE2000 (Advanced)</option>
                <option value="CIE76">CIE76 (Basic)</option>
              </select>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Preview</h2>
              <div className="flex h-32 rounded-lg overflow-hidden shadow-md">
                <div className="flex-1" style={{ backgroundColor: color1 }} />
                <div className="flex-1" style={{ backgroundColor: color2 }} />
              </div>
            </div>

            <button
              onClick={resetColors}
              className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset Colors
            </button>
          </div>

          {/* Delta E Result and History */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Delta E Result</h2>
              <div className="flex items-center gap-2">
                <p className="text-sm">
                  ΔE ({formula}): <span className="font-bold">{deltaE}</span>
                </p>
                <button
                  onClick={copyToClipboard}
                  className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                  title="Copy to clipboard"
                >
                  <FaCopy />
                </button>
              </div>
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

            {history.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Calculation History</h2>
                <ul className="text-sm text-gray-700 max-h-40 overflow-y-auto space-y-2">
                  {history.map((entry, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: entry.color1 }}
                      />
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: entry.color2 }}
                      />
                      <span>
                        ΔE ({entry.formula}): {entry.deltaE} - {entry.timestamp}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* About Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">About Delta E</h2>
          <div className="text-sm text-blue-600">
            <p>Delta E measures the perceptual difference between two colors in the Lab color space:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>CIEDE2000: Advanced formula with better accuracy for human perception</li>
              <li>CIE76: Simpler, earlier standard (less accurate)</li>
              <li>Accounts for lightness (L), chroma (a), and hue (b) differences</li>
              <li>Lower values indicate closer color matches</li>
            </ul>
            <p className="mt-1">
              Useful in design, printing, and quality control for color consistency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorDeltaECalculator;