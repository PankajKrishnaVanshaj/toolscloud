"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaRandom } from "react-icons/fa";

const ColorDifferenceCalculator = () => {
  const [color1, setColor1] = useState("#FF6B6B");
  const [color2, setColor2] = useState("#4ECDC4");
  const [rgbDistance, setRgbDistance] = useState(0);
  const [cie76, setCie76] = useState(0);
  const [ciede2000, setCiede2000] = useState(0);
  const [displayMode, setDisplayMode] = useState("split"); // split or gradient
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
    const bLab = 200 * (y - z);
    return { l, a, b: bLab };
  };

  // RGB Euclidean Distance
  const calculateRgbDistance = (rgb1, rgb2) => {
    return Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );
  };

  // CIE76 ΔE (Lab)
  const calculateCie76 = (lab1, lab2) => {
    return Math.sqrt(
      Math.pow(lab1.l - lab2.l, 2) +
      Math.pow(lab1.a - lab2.a, 2) +
      Math.pow(lab1.b - lab2.b, 2)
    );
  };

  // CIEDE2000 ΔE*00 (simplified implementation)
  const calculateCiede2000 = (lab1, lab2) => {
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

    const h1Prime = (Math.atan2(b1, a1Prime) * 180) / Math.PI + 360 % 360;
    const h2Prime = (Math.atan2(b2, a2Prime) * 180) / Math.PI + 360 % 360;

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
      0.17 * Math.cos((HBarPrime - 30) * Math.PI / 180) +
      0.24 * Math.cos(2 * HBarPrime * Math.PI / 180) +
      0.32 * Math.cos((3 * HBarPrime + 6) * Math.PI / 180) -
      0.20 * Math.cos((4 * HBarPrime - 63) * Math.PI / 180);

    const SL = 1 + (0.015 * Math.pow(LBar - 50, 2)) / Math.sqrt(20 + Math.pow(LBar - 50, 2));
    const SC = 1 + 0.045 * CBar;
    const SH = 1 + 0.015 * CBar * T;

    const RT =
      -2 *
      Math.sqrt(Math.pow(CBar, 7) / (Math.pow(CBar, 7) + Math.pow(25, 7))) *
      Math.sin((60 * Math.exp(-Math.pow((HBarPrime - 275) / 25, 2))) * Math.PI / 180);

    return Math.sqrt(
      Math.pow(deltaL / (kL * SL), 2) +
      Math.pow(deltaC / (kC * SC), 2) +
      Math.pow(deltaH / (kH * SH), 2) +
      RT * (deltaC / (kC * SC)) * (deltaH / (kH * SH))
    );
  };

  // Calculate differences
  const calculateDifferences = useCallback(() => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    const xyz1 = rgbToXyz(rgb1.r, rgb1.g, rgb1.b);
    const xyz2 = rgbToXyz(rgb2.r, rgb2.g, rgb2.b);
    const lab1 = xyzToLab(xyz1.x, xyz1.y, xyz1.z);
    const lab2 = xyzToLab(xyz2.x, xyz2.y, xyz2.z);

    const newRgbDistance = calculateRgbDistance(rgb1, rgb2).toFixed(2);
    const newCie76 = calculateCie76(lab1, lab2).toFixed(2);
    const newCiede2000 = calculateCiede2000(lab1, lab2).toFixed(2);

    setRgbDistance(newRgbDistance);
    setCie76(newCie76);
    setCiede2000(newCiede2000);

    setHistory((prev) => [
      { color1, color2, rgbDistance: newRgbDistance, cie76: newCie76, ciede2000: newCiede2000 },
      ...prev.slice(0, 9), // Keep last 10 comparisons
    ]);
  }, [color1, color2]);

  useEffect(() => {
    calculateDifferences();
  }, [calculateDifferences]);

  // Randomize colors
  const randomizeColors = () => {
    const randomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
    setColor1(randomColor());
    setColor2(randomColor());
  };

  // Reset to defaults
  const reset = () => {
    setColor1("#FF6B6B");
    setColor2("#4ECDC4");
    setDisplayMode("split");
    setHistory([]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Difference Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Color Inputs and Preview */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color 1</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color1}
                    onChange={(e) => setColor1(e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={color1}
                    onChange={(e) => setColor1(e.target.value)}
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color 2</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color2}
                    onChange={(e) => setColor2(e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={color2}
                    onChange={(e) => setColor2(e.target.value)}
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Mode
              </label>
              <select
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="split">Split View</option>
                <option value="gradient">Gradient Transition</option>
              </select>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Preview</h2>
              <div
                className="h-32 rounded-lg overflow-hidden shadow-md"
                style={
                  displayMode === "split"
                    ? { display: "flex" }
                    : { background: `linear-gradient(to right, ${color1}, ${color2})` }
                }
              >
                {displayMode === "split" && (
                  <>
                    <div className="flex-1" style={{ backgroundColor: color1 }} />
                    <div className="flex-1" style={{ backgroundColor: color2 }} />
                  </>
                )}
              </div>
            </div>

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

          {/* Results */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Color Difference Results</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">RGB Euclidean Distance</p>
                  <p className="text-lg">{rgbDistance}</p>
                  <p className="text-xs text-gray-600">
                    Range: 0 - 441.67 (max distance between black and white)
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">CIE76 (ΔE)</p>
                  <p className="text-lg">{cie76}</p>
                  <p className="text-xs text-gray-600">
                    Simple Lab difference, less perceptually accurate
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">CIEDE2000 (ΔE*00)</p>
                  <p className="text-lg">{ciede2000}</p>
                  <p className="text-xs text-gray-600">
                    Perceptually uniform, modern standard
                    <br />
                    {ciede2000 < 1
                      ? "Not perceptible"
                      : ciede2000 < 2
                      ? "Close observation needed"
                      : ciede2000 < 10
                      ? "Noticeable at a glance"
                      : ciede2000 < 50
                      ? "Similar colors"
                      : "Nearly opposite"}
                  </p>
                </div>
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                <h2 className="text-lg font-semibold mb-2">Comparison History</h2>
                <ul className="space-y-2 text-sm text-gray-600">
                  {history.map((entry, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 p-2 bg-white rounded-md cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setColor1(entry.color1);
                        setColor2(entry.color2);
                      }}
                    >
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: entry.color1 }}
                      />
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: entry.color2 }}
                      />
                      <span>
                        RGB: {entry.rgbDistance}, CIE76: {entry.cie76}, CIEDE2000:{" "}
                        {entry.ciede2000}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">
            About Color Difference
          </h2>
          <div className="text-sm text-blue-600">
            <p>Calculate the difference between two colors using different methods:</p>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>
                <strong>RGB Euclidean:</strong> Simple distance in RGB space (0-441.67)
              </li>
              <li>
                <strong>CIE76:</strong> Basic Lab color difference, less accurate for
                perception
              </li>
              <li>
                <strong>CIEDE2000:</strong> Advanced perceptual difference (0-100+),
                where:
                <ul className="list-circle ml-5 mt-1 space-y-1">
                  <li>0-1: Not perceptible</li>
                  <li>1-2: Close observation needed</li>
                  <li>2-10: Noticeable at a glance</li>
                  <li>11-49: Similar colors</li>
                  <li>50+: Nearly opposite</li>
                </ul>
              </li>
            </ul>
            <p className="mt-1">CIEDE2000 is the most accurate for human perception.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorDifferenceCalculator;