"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaCopy, FaDownload, FaSync } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the wheel

const ColorWheelGenerator = () => {
  const [selectedColor, setSelectedColor] = useState("#FF0000");
  const [lightness, setLightness] = useState(50);
  const [wheelSize, setWheelSize] = useState(300);
  const [complementary, setComplementary] = useState(false);
  const canvasRef = useRef(null);

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

  // Convert HSL to RGB
  const hslToRgb = (h, s, l) => {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r, g, b;

    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    };
  };

  // Convert RGB to HEX
  const rgbToHex = (r, g, b) =>
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
      .toUpperCase();

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
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  // Get complementary color
  const getComplementaryColor = (h) => {
    const complementaryHue = (h + 180) % 360;
    return rgbToHex(...Object.values(hslToRgb(complementaryHue, 100, lightness)));
  };

  // Draw the color wheel
  const drawColorWheel = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const radius = wheelSize / 2;
    const centerX = radius;
    const centerY = radius;

    canvas.width = wheelSize;
    canvas.height = wheelSize;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let angle = 0; angle < 360; angle++) {
      for (let r = 0; r < radius; r++) {
        const rad = (angle * Math.PI) / 180;
        const x = centerX + r * Math.cos(rad);
        const y = centerY + r * Math.sin(rad);
        const saturation = (r / radius) * 100;
        const { r: red, g: green, b: blue } = hslToRgb(angle, saturation, lightness);

        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // Draw selected color marker
    const { h } = rgbToHsl(...Object.values(hexToRgb(selectedColor)));
    const markerRad = (h * Math.PI) / 180;
    const markerR = (radius * 100) / 100; // Full saturation
    const markerX = centerX + markerR * Math.cos(markerRad);
    const markerY = centerY + markerR * Math.sin(markerRad);
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(markerX, markerY, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [wheelSize, lightness, selectedColor]);

  // Handle canvas click
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext("2d");
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    setSelectedColor(hex);
  };

  // Download the color wheel
  const downloadWheel = () => {
    if (canvasRef.current) {
      html2canvas(canvasRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `color-wheel-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  // Reset to default
  const reset = () => {
    setSelectedColor("#FF0000");
    setLightness(50);
    setWheelSize(300);
    setComplementary(false);
  };

  useEffect(() => {
    drawColorWheel();
  }, [drawColorWheel]);

  const rgb = hexToRgb(selectedColor);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const complementaryColor = complementary ? getComplementaryColor(hsl.h) : null;

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Wheel Generator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Color Wheel */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Color Wheel</h2>
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="rounded-lg border border-gray-300 cursor-pointer w-full max-w-[300px] sm:max-w-[400px] mx-auto"
            />
            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lightness ({lightness}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={lightness}
                  onChange={(e) => setLightness(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wheel Size ({wheelSize}px)
                </label>
                <input
                  type="range"
                  min="200"
                  max="500"
                  step="10"
                  value={wheelSize}
                  onChange={(e) => setWheelSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={complementary}
                onChange={(e) => setComplementary(e.target.checked)}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Show Complementary Color</span>
            </div>
          </div>

          {/* Selected Color */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Selected Color</h2>
              <div
                className="w-full h-24 rounded-lg shadow-inner mb-4"
                style={{ backgroundColor: selectedColor }}
              />
              <div className="space-y-2 text-sm text-gray-600">
                {[
                  { label: "HEX", value: selectedColor },
                  { label: "RGB", value: `${rgb.r}, ${rgb.g}, ${rgb.b}` },
                  { label: "HSL", value: `${hsl.h}°, ${hsl.s}%, ${hsl.l}%` },
                ].map(({ label, value }) => (
                  <p key={label} className="flex items-center justify-between">
                    <span>
                      {label}: {value}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(value)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <FaCopy />
                    </button>
                  </p>
                ))}
              </div>
            </div>

            {/* Complementary Color */}
            {complementary && complementaryColor && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Complementary Color</h2>
                <div
                  className="w-full h-24 rounded-lg shadow-inner mb-4"
                  style={{ backgroundColor: complementaryColor }}
                />
                <p className="flex items-center justify-between text-sm text-gray-600">
                  <span>HEX: {complementaryColor}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(complementaryColor)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <FaCopy />
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={downloadWheel}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download Wheel
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">Features</h2>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Interactive HSL-based color wheel</li>
            <li>Adjustable lightness and wheel size</li>
            <li>Complementary color display</li>
            <li>Copy color values (HEX, RGB, HSL)</li>
            <li>Downloadable color wheel as PNG</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ColorWheelGenerator;