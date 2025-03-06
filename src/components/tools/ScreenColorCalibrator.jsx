// components/ScreenColorCalibrator.js
'use client';

import React, { useState } from 'react';

const ScreenColorCalibrator = () => {
  const [activeTest, setActiveTest] = useState('colorBars');

  // Color bar values (RGB + CMYK + White/Black)
  const colorBars = [
    { name: 'Red', color: 'rgb(255, 0, 0)' },
    { name: 'Green', color: 'rgb(0, 255, 0)' },
    { name: 'Blue', color: 'rgb(0, 0, 255)' },
    { name: 'Cyan', color: 'rgb(0, 255, 255)' },
    { name: 'Magenta', color: 'rgb(255, 0, 255)' },
    { name: 'Yellow', color: 'rgb(255, 255, 0)' },
    { name: 'White', color: 'rgb(255, 255, 255)' },
    { name: 'Black', color: 'rgb(0, 0, 0)' },
  ];

  // Grayscale steps (0-100% in 10% increments)
  const grayscaleSteps = Array.from({ length: 11 }, (_, i) => {
    const value = i * 10;
    const rgb = Math.round((value / 100) * 255);
    return { value: `${value}%`, color: `rgb(${rgb}, ${rgb}, ${rgb})` };
  });

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Screen Color Calibrator</h1>

      {/* Test Selection */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setActiveTest('colorBars')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTest === 'colorBars'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Color Bars
        </button>
        <button
          onClick={() => setActiveTest('grayscale')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTest === 'grayscale'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Grayscale
        </button>
        <button
          onClick={() => setActiveTest('guide')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTest === 'guide'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Guide
        </button>
      </div>

      {/* Color Bars Test */}
      {activeTest === 'colorBars' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-center">Color Bars</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {colorBars.map((bar) => (
              <div
                key={bar.name}
                className="h-24 flex items-center justify-center text-white font-medium"
                style={{ backgroundColor: bar.color }}
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
      {activeTest === 'grayscale' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-center">Grayscale Steps</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {grayscaleSteps.map((step) => (
              <div
                key={step.value}
                className="h-24 flex items-center justify-center text-white font-medium mix-blend-difference"
                style={{ backgroundColor: step.color }}
              >
                {step.value}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center">
            Adjust brightness/contrast until you can distinguish all steps clearly.
          </p>
        </div>
      )}

      {/* Calibration Guide */}
      {activeTest === 'guide' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-center">Calibration Guide</h2>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
            <li>Set your screen to its native resolution.</li>
            <li>Reset your monitor to factory settings if possible.</li>
            <li>
              Use the Color Bars test: Adjust color settings until all bars are distinct and true to their names.
            </li>
            <li>
              Use the Grayscale test: Adjust brightness and contrast until you can see all steps clearly, 
              with pure black at 0% and pure white at 100%.
            </li>
            <li>Avoid extreme ambient lighting (too bright or too dark).</li>
            <li>For best results, use a hardware calibrator if available.</li>
          </ul>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-6 text-center">
        Note: This is a basic visual calibration tool. For professional results, use a hardware calibrator.
      </p>
    </div>
  );
};

export default ScreenColorCalibrator;