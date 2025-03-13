"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaInfoCircle } from "react-icons/fa";

const ResolutionConverter = () => {
  const [widthPx, setWidthPx] = useState("");
  const [heightPx, setHeightPx] = useState("");
  const [dpi, setDpi] = useState("96"); // Default DPI for web
  const [unit, setUnit] = useState("in"); // Default physical unit
  const [physicalWidth, setPhysicalWidth] = useState("");
  const [physicalHeight, setPhysicalHeight] = useState("");
  const [mode, setMode] = useState("pixels-to-physical"); // Conversion mode

  // Conversion factors to inches
  const lengthConversion = {
    in: 1,
    cm: 0.393701,
    mm: 0.0393701,
  };

  const lengthDisplayNames = {
    in: "inches (in)",
    cm: "centimeters (cm)",
    mm: "millimeters (mm)",
  };

  // Common resolution presets
  const presets = {
    "HD (720p)": { width: 1280, height: 720 },
    "Full HD (1080p)": { width: 1920, height: 1080 },
    "2K": { width: 2560, height: 1440 },
    "4K UHD": { width: 3840, height: 2160 },
    "Square (1:1)": { width: 1000, height: 1000 },
  };

  // Calculate physical size from pixels
  const calculatePhysicalSize = useCallback(() => {
    if (!widthPx || !heightPx || !dpi || isNaN(widthPx) || isNaN(heightPx) || isNaN(dpi)) {
      return null;
    }
    const widthInches = widthPx / dpi;
    const heightInches = heightPx / dpi;

    return {
      in: { width: widthInches, height: heightInches },
      cm: { width: widthInches / lengthConversion.cm, height: heightInches / lengthConversion.cm },
      mm: { width: widthInches / lengthConversion.mm, height: heightInches / lengthConversion.mm },
    };
  }, [widthPx, heightPx, dpi]);

  // Calculate pixels from physical size
  const calculatePixelsFromPhysical = useCallback(() => {
    if (
      !physicalWidth ||
      !physicalHeight ||
      !dpi ||
      isNaN(physicalWidth) ||
      isNaN(physicalHeight) ||
      isNaN(dpi)
    ) {
      return null;
    }
    const widthInches = physicalWidth * lengthConversion[unit];
    const heightInches = physicalHeight * lengthConversion[unit];
    return {
      width: Math.round(widthInches * dpi),
      height: Math.round(heightInches * dpi),
    };
  }, [physicalWidth, physicalHeight, dpi, unit]);

  const calculateAspectRatio = (w, h) => {
    if (!w || !h || isNaN(w) || isNaN(h)) return null;
    const gcd = (a, b) => (b ? gcd(b, a % b) : a);
    const divisor = gcd(w, h);
    return `${w / divisor}:${h / divisor}`;
  };

  const calculatePixelCount = (w, h) => {
    if (!w || !h || isNaN(w) || isNaN(h)) return null;
    return w * h;
  };

  const physicalSize = mode === "pixels-to-physical" ? calculatePhysicalSize() : null;
  const pixelResult = mode === "physical-to-pixels" ? calculatePixelsFromPhysical() : null;
  const aspectRatio =
    mode === "pixels-to-physical"
      ? calculateAspectRatio(widthPx, heightPx)
      : calculateAspectRatio(pixelResult?.width, pixelResult?.height);
  const pixelCount =
    mode === "pixels-to-physical"
      ? calculatePixelCount(widthPx, heightPx)
      : calculatePixelCount(pixelResult?.width, pixelResult?.height);

  // Apply preset
  const applyPreset = (preset) => {
    setWidthPx(preset.width);
    setHeightPx(preset.height);
  };

  // Reset all fields
  const reset = () => {
    setWidthPx("");
    setHeightPx("");
    setDpi("96");
    setUnit("in");
    setPhysicalWidth("");
    setPhysicalHeight("");
    setMode("pixels-to-physical");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Resolution Converter
        </h1>

        <div className="space-y-6">
          {/* Mode Selection */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setMode("pixels-to-physical")}
              className={`py-2 px-4 rounded-md ${
                mode === "pixels-to-physical"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } transition-colors`}
            >
              Pixels to Physical
            </button>
            <button
              onClick={() => setMode("physical-to-pixels")}
              className={`py-2 px-4 rounded-md ${
                mode === "physical-to-pixels"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } transition-colors`}
            >
              Physical to Pixels
            </button>
          </div>

          {/* Input Section */}
          {mode === "pixels-to-physical" ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Width (px)</label>
                <input
                  type="number"
                  value={widthPx}
                  onChange={(e) => setWidthPx(e.target.value)}
                  placeholder="Enter width"
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
                <input
                  type="number"
                  value={heightPx}
                  onChange={(e) => setHeightPx(e.target.value)}
                  placeholder="Enter height"
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DPI</label>
                <input
                  type="number"
                  value={dpi}
                  onChange={(e) => setDpi(e.target.value)}
                  placeholder="Enter DPI"
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width ({unit})
                </label>
                <input
                  type="number"
                  value={physicalWidth}
                  onChange={(e) => setPhysicalWidth(e.target.value)}
                  placeholder="Enter width"
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height ({unit})
                </label>
                <input
                  type="number"
                  value={physicalHeight}
                  onChange={(e) => setPhysicalHeight(e.target.value)}
                  placeholder="Enter height"
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DPI</label>
                <input
                  type="number"
                  value={dpi}
                  onChange={(e) => setDpi(e.target.value)}
                  placeholder="Enter DPI"
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Unit Selection and Presets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Physical Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(lengthConversion).map((u) => (
                  <option key={u} value={u}>
                    {lengthDisplayNames[u]}
                  </option>
                ))}
              </select>
            </div>
            {mode === "pixels-to-physical" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Presets
                </label>
                <select
                  onChange={(e) => applyPreset(presets[e.target.value])}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select a preset
                  </option>
                  {Object.entries(presets).map(([name, { width, height }]) => (
                    <option key={name} value={name}>
                      {name} ({width}×{height})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Results Section */}
          {(widthPx || heightPx || physicalWidth || physicalHeight) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mode === "pixels-to-physical" ? (
                <>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Resolution Info</h2>
                    <div className="space-y-2 text-sm">
                      <p>
                        Resolution: {widthPx} × {heightPx} px
                      </p>
                      {pixelCount && (
                        <p>Total Pixels: {pixelCount.toLocaleString()} px</p>
                      )}
                      {aspectRatio && <p>Aspect Ratio: {aspectRatio}</p>}
                    </div>
                  </div>
                  {physicalSize && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h2 className="text-lg font-semibold mb-2">Physical Size</h2>
                      <div className="space-y-2 text-sm">
                        <p>
                          {lengthDisplayNames[unit]}:{" "}
                          {physicalSize[unit].width.toFixed(2)} ×{" "}
                          {physicalSize[unit].height.toFixed(2)}
                        </p>
                        <p>PPI/DPI: {dpi}</p>
                        <p className="text-gray-600">
                          Diagonal:{" "}
                          {Math.sqrt(
                            physicalSize[unit].width ** 2 +
                              physicalSize[unit].height ** 2
                          ).toFixed(2)}{" "}
                          {unit}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Physical Size</h2>
                    <div className="space-y-2 text-sm">
                      <p>
                        {lengthDisplayNames[unit]}: {physicalWidth} × {physicalHeight}
                      </p>
                      <p>PPI/DPI: {dpi}</p>
                    </div>
                  </div>
                  {pixelResult && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h2 className="text-lg font-semibold mb-2">Resolution Info</h2>
                      <div className="space-y-2 text-sm">
                        <p>
                          Resolution: {pixelResult.width} × {pixelResult.height} px
                        </p>
                        {pixelCount && (
                          <p>Total Pixels: {pixelCount.toLocaleString()} px</p>
                        )}
                        {aspectRatio && <p>Aspect Ratio: {aspectRatio}</p>}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Reset Button */}
          <div className="flex justify-center">
            <button
              onClick={reset}
              className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Info Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
              <FaInfoCircle className="mr-2" /> Useful Information
            </h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Common DPI: Web (96), Print (300), High Quality (600)</li>
              <li>1 in = 2.54 cm = 25.4 mm</li>
              <li>Physical Size = Pixels ÷ DPI (or Pixels = Physical × DPI)</li>
              <li>Common Ratios: 16:9 (Widescreen), 4:3 (Standard), 1:1 (Square)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResolutionConverter;