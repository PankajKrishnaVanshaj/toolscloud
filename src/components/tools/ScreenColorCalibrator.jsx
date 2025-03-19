"use client";
import React, { useState } from "react";
import { FaSync } from "react-icons/fa";

const ScreenColorCalibrator = () => {
  const [activeTest, setActiveTest] = useState("colorBars");
  const [brightness, setBrightness] = useState(100); // For brightness overlay simulation

  // Color bar values (RGB + CMYK + White/Black + Additional)
  const colorBars = [
    { name: "Red", color: "rgb(255, 0, 0)" },
    { name: "Green", color: "rgb(0, 255, 0)" },
    { name: "Blue", color: "rgb(0, 0, 255)" },
    { name: "Cyan", color: "rgb(0, 255, 255)" },
    { name: "Magenta", color: "rgb(255, 0, 255)" },
    { name: "Yellow", color: "rgb(255, 255, 0)" },
    { name: "White", color: "rgb(255, 255, 255)" },
    { name: "Black", color: "rgb(0, 0, 0)" },
    { name: "Gray 50%", color: "rgb(128, 128, 128)" },
    { name: "Orange", color: "rgb(255, 165, 0)" },
  ];

  // Grayscale steps (0-100% in 5% increments for finer detail)
  const grayscaleSteps = Array.from({ length: 21 }, (_, i) => {
    const value = i * 5;
    const rgb = Math.round((value / 100) * 255);
    return { value: `${value}%`, color: `rgb(${rgb}, ${rgb}, ${rgb})` };
  });

  // Contrast test pattern (checkerboard)
  const contrastPattern = Array.from({ length: 16 }, (_, i) => ({
    color: i % 2 === (Math.floor(i / 4) % 2) ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)",
  }));

  // Reset settings
  const reset = () => {
    setActiveTest("colorBars");
    setBrightness(100);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Screen Color Calibrator
          </h1>
          <div className="flex gap-2">
            <button
              onClick={reset}
              className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              title="Reset"
            >
              <FaSync />
            </button>
          </div>
        </div>

        {/* Test Selection */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6">
          {["colorBars", "grayscale", "contrast", "guide"].map((test) => (
            <button
              key={test}
              onClick={() => setActiveTest(test)}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTest === test
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {test.charAt(0).toUpperCase() + test.slice(1).replace("Bars", " Bars")}
            </button>
          ))}
        </div>

        {/* Brightness Overlay */}
        {activeTest !== "guide" && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brightness Overlay ({brightness}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        )}

        {/* Color Bars Test */}
        {activeTest === "colorBars" && (
          <div className="space-y-4 flex-1">
            <h2 className="text-lg font-semibold text-center">Color Bars</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {colorBars.map((bar) => (
                <div
                  key={bar.name}
                  className="h-24 flex items-center justify-center text-white font-medium mix-blend-difference"
                  style={{
                    backgroundColor: bar.color,
                    filter: `brightness(${brightness}%)`,
                  }}
                >
                  {bar.name}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 text-center">
              Adjust your screen until all colors are distinct and vibrant.
            </p>
          </div>
        )}

        {/* Grayscale Test */}
        {activeTest === "grayscale" && (
          <div className="space-y-4 flex-1">
            <h2 className="text-lg font-semibold text-center">Grayscale Steps</h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-2">
              {grayscaleSteps.map((step) => (
                <div
                  key={step.value}
                  className="h-24 flex items-center justify-center text-white font-medium mix-blend-difference"
                  style={{
                    backgroundColor: step.color,
                    filter: `brightness(${brightness}%)`,
                  }}
                >
                  {step.value}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 text-center">
              Adjust brightness/contrast until all steps are distinguishable.
            </p>
          </div>
        )}

        {/* Contrast Test */}
        {activeTest === "contrast" && (
          <div className="space-y-4 flex-1">
            <h2 className="text-lg font-semibold text-center">Contrast Pattern</h2>
            <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
              {contrastPattern.map((block, index) => (
                <div
                  key={index}
                  className="h-16 w-16"
                  style={{
                    backgroundColor: block.color,
                    filter: `brightness(${brightness}%)`,
                  }}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 text-center">
              Adjust contrast until the checkerboard pattern is sharp and clear.
            </p>
          </div>
        )}

        {/* Calibration Guide */}
        {activeTest === "guide" && (
          <div className="space-y-4 flex-1">
            <h2 className="text-lg font-semibold text-center">Calibration Guide</h2>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2 max-w-lg mx-auto">
              <li>Set your screen to its native resolution.</li>
              <li>Reset your monitor to factory settings if possible.</li>
              <li>
                Color Bars: Adjust color settings until all bars are distinct and true to their
                names.
              </li>
              <li>
                Grayscale: Adjust brightness and contrast until all steps are clear, with pure black
                at 0% and pure white at 100%.
              </li>
              <li>
                Contrast: Ensure the checkerboard pattern is sharp and distinguishable.
              </li>
              <li>Avoid extreme ambient lighting conditions.</li>
              <li>For professional results, use a hardware calibrator.</li>
            </ul>
          </div>
        )}

        {/* Footer Note */}
        <p className="text-xs text-gray-500 mt-6 text-center">
          Note: This is a visual calibration tool. For precise calibration, use a hardware device.
        </p>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Color Bars, Grayscale, and Contrast tests</li>
            <li>Brightness overlay simulation</li>
            <li>Additional colors and finer grayscale steps</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScreenColorCalibrator;