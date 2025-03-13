"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const AreaConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("m2");
  const [shape, setShape] = useState("square");
  const [precision, setPrecision] = useState(4);
  const [customRatio, setCustomRatio] = useState("2:1"); // For rectangle

  // Conversion factors to square meters (m²)
  const conversionFactors = {
    m2: 1,            // Square meters
    cm2: 1e-4,        // Square centimeters
    mm2: 1e-6,        // Square millimeters
    km2: 1e6,         // Square kilometers
    in2: 6.4516e-4,   // Square inches
    ft2: 9.2903e-2,   // Square feet
    yd2: 0.836127,    // Square yards
    mi2: 2589988.11,  // Square miles
    ha: 1e4,          // Hectares
    acre: 4046.85642, // Acres
  };

  // Display names for units
  const unitDisplayNames = {
    m2: "m²",
    cm2: "cm²",
    mm2: "mm²",
    km2: "km²",
    in2: "in²",
    ft2: "ft²",
    yd2: "yd²",
    mi2: "mi²",
    ha: "ha",
    acre: "acre",
  };

  const convertValue = useCallback(
    (inputValue, fromUnit) => {
      if (!inputValue || isNaN(inputValue)) return {};
      const valueInSquareMeters = inputValue * conversionFactors[fromUnit];

      return Object.keys(conversionFactors).reduce((acc, unit) => {
        acc[unit] = valueInSquareMeters / conversionFactors[unit];
        return acc;
      }, {});
    },
    [conversionFactors]
  );

  const calculateShapeProperties = useCallback(() => {
    if (!value || isNaN(value)) return null;
    const areaInM2 = value * conversionFactors[unit];
    const properties = {};

    switch (shape) {
      case "square":
        properties.side = Math.sqrt(areaInM2);
        properties.perimeter = 4 * properties.side;
        break;
      case "circle":
        properties.radius = Math.sqrt(areaInM2 / Math.PI);
        properties.perimeter = 2 * Math.PI * properties.radius;
        break;
      case "rectangle":
        const [widthRatio, lengthRatio] = customRatio
          .split(":")
          .map((r) => parseFloat(r) || 1);
        const ratio = widthRatio / lengthRatio;
        properties.width = Math.sqrt(areaInM2 * ratio);
        properties.length = properties.width / ratio;
        properties.perimeter = 2 * (properties.width + properties.length);
        break;
      case "triangle": // Equilateral triangle
        properties.side = Math.sqrt((4 * areaInM2) / Math.sqrt(3));
        properties.perimeter = 3 * properties.side;
        properties.height = (Math.sqrt(3) / 2) * properties.side;
        break;
      default:
        return null;
    }
    return properties;
  }, [value, unit, shape, customRatio, conversionFactors]);

  const results = convertValue(value, unit);
  const shapeProperties = calculateShapeProperties();

  // Reset function
  const reset = () => {
    setValue("");
    setUnit("m2");
    setShape("square");
    setPrecision(4);
    setCustomRatio("2:1");
  };

  // Download results as text
  const downloadResults = () => {
    if (!value) return;
    const text = [
      `Area Conversion Results (${value} ${unitDisplayNames[unit]}):`,
      ...Object.entries(results).map(
        ([u, val]) => `${unitDisplayNames[u]}: ${val.toFixed(precision)}`
      ),
      "",
      `Shape Properties (${shape}):`,
      shapeProperties &&
        Object.entries(shapeProperties).map(
          ([key, val]) => `${key}: ${val.toFixed(precision)} m`
        ),
    ]
      .flat()
      .join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `area-conversion-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Area Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter area"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(conversionFactors).map((u) => (
                  <option key={u} value={u}>
                    {unitDisplayNames[u]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shape</label>
              <select
                value={shape}
                onChange={(e) => setShape(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="square">Square</option>
                <option value="circle">Circle</option>
                <option value="rectangle">Rectangle</option>
                <option value="triangle">Equilateral Triangle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precision (decimals)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={precision}
                onChange={(e) => setPrecision(Math.max(0, Math.min(10, e.target.value)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Rectangle Ratio (only for rectangle shape) */}
          {shape === "rectangle" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width:Length Ratio
              </label>
              <input
                type="text"
                value={customRatio}
                onChange={(e) => setCustomRatio(e.target.value)}
                placeholder="e.g., 2:1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter ratio as "width:length" (e.g., 2:1)
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={downloadResults}
              disabled={!value}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Results
            </button>
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2 text-gray-700">Conversions</h2>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>
                      {unitDisplayNames[unit]}: {val.toFixed(precision)}
                    </p>
                  ))}
                </div>
              </div>
              {shapeProperties && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2 text-blue-700">
                    Shape Properties ({shape})
                  </h2>
                  <div className="text-sm text-blue-600">
                    {shape === "square" && (
                      <>
                        <p>Side: {shapeProperties.side.toFixed(precision)} m</p>
                        <p>Perimeter: {shapeProperties.perimeter.toFixed(precision)} m</p>
                      </>
                    )}
                    {shape === "circle" && (
                      <>
                        <p>Radius: {shapeProperties.radius.toFixed(precision)} m</p>
                        <p>
                          Circumference: {shapeProperties.perimeter.toFixed(precision)} m
                        </p>
                      </>
                    )}
                    {shape === "rectangle" && (
                      <>
                        <p>Width: {shapeProperties.width.toFixed(precision)} m</p>
                        <p>Length: {shapeProperties.length.toFixed(precision)} m</p>
                        <p>Perimeter: {shapeProperties.perimeter.toFixed(precision)} m</p>
                      </>
                    )}
                    {shape === "triangle" && (
                      <>
                        <p>Side: {shapeProperties.side.toFixed(precision)} m</p>
                        <p>Height: {shapeProperties.height.toFixed(precision)} m</p>
                        <p>Perimeter: {shapeProperties.perimeter.toFixed(precision)} m</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Info</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert between 10 different area units</li>
            <li>Calculate properties for square, circle, rectangle, and triangle</li>
            <li>Customizable precision (0-10 decimals)</li>
            <li>Adjustable rectangle ratio</li>
            <li>Download results as text file</li>
          </ul>
          <details className="mt-2">
            <summary className="cursor-pointer text-sm font-medium text-blue-700">
              Common Conversions
            </summary>
            <ul className="list-disc list-inside mt-2 text-sm text-blue-600">
              <li>1 m² = 10⁴ cm²</li>
              <li>1 m² = 10⁻⁶ km²</li>
              <li>1 m² ≈ 10.764 ft²</li>
              <li>1 ha = 10⁴ m²</li>
              <li>1 acre ≈ 4046.86 m²</li>
              <li>1 mi² ≈ 2.59 km²</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default AreaConverter;