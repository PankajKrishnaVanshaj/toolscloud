"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaInfoCircle } from "react-icons/fa";

const MomentOfInertiaConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("kg_m2");
  const [shape, setShape] = useState("none");
  const [mass, setMass] = useState("");
  const [massUnit, setMassUnit] = useState("kg");
  const [length, setLength] = useState("");
  const [lengthUnit, setLengthUnit] = useState("m");
  const [decimalPlaces, setDecimalPlaces] = useState(4);

  // Conversion factors to kg·m²
  const conversionFactors = {
    kg_m2: 1, // kg·m²
    g_cm2: 1e-7, // g·cm²
    kg_cm2: 1e-4, // kg·cm²
    lb_ft2: 0.042140, // lb·ft²
    lb_in2: 2.926e-4, // lb·in²
    oz_in2: 1.829e-5, // oz·in²
  };

  const unitDisplayNames = {
    kg_m2: "kg·m²",
    g_cm2: "g·cm²",
    kg_cm2: "kg·cm²",
    lb_ft2: "lb·ft²",
    lb_in2: "lb·in²",
    oz_in2: "oz·in²",
  };

  // Mass conversion factors to kg
  const massConversion = {
    kg: 1,
    g: 0.001,
    lb: 0.453592,
    oz: 0.0283495,
  };

  const massDisplayNames = {
    kg: "kg",
    g: "g",
    lb: "lb",
    oz: "oz",
  };

  // Length conversion factors to meters
  const lengthConversion = {
    m: 1,
    cm: 0.01,
    mm: 0.001,
    ft: 0.3048,
    in: 0.0254,
  };

  const lengthDisplayNames = {
    m: "m",
    cm: "cm",
    mm: "mm",
    ft: "ft",
    in: "in",
  };

  // Convert moment of inertia
  const convertValue = useCallback((inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInKgM2 = inputValue * conversionFactors[fromUnit];
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInKgM2 / conversionFactors[unit];
      return acc;
    }, {});
  }, []);

  // Calculate moment of inertia for shapes
  const calculateMomentOfInertia = useCallback(() => {
    if (!mass || !length || isNaN(mass) || isNaN(length)) return null;

    const massInKg = parseFloat(mass) * massConversion[massUnit];
    const lengthInMeters = parseFloat(length) * lengthConversion[lengthUnit];

    switch (shape) {
      case "point": // I = m * r²
        return massInKg * lengthInMeters * lengthInMeters;
      case "rod_center": // I = (1/12) * m * L²
        return (1 / 12) * massInKg * lengthInMeters * lengthInMeters;
      case "rod_end": // I = (1/3) * m * L²
        return (1 / 3) * massInKg * lengthInMeters * lengthInMeters;
      case "disk": // I = (1/2) * m * r²
        return (1 / 2) * massInKg * lengthInMeters * lengthInMeters;
      case "sphere": // I = (2/5) * m * r²
        return (2 / 5) * massInKg * lengthInMeters * lengthInMeters;
      case "rectangle": // I = (1/12) * m * (a² + b²), using length as 'a', assume b = a
        return (1 / 12) * massInKg * (lengthInMeters * lengthInMeters * 2);
      default:
        return null;
    }
  }, [mass, massUnit, length, lengthUnit, shape]);

  // Reset all fields
  const reset = () => {
    setValue("");
    setUnit("kg_m2");
    setShape("none");
    setMass("");
    setMassUnit("kg");
    setLength("");
    setLengthUnit("m");
    setDecimalPlaces(4);
  };

  const results = convertValue(value, unit);
  const calculatedInertia = calculateMomentOfInertia();

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Moment of Inertia Converter & Calculator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moment of Inertia
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Enter value"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(conversionFactors).map((u) => (
                    <option key={u} value={u}>
                      {unitDisplayNames[u]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Shape Calculator */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calculate for Shape
              </label>
              <select
                value={shape}
                onChange={(e) => setShape(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">Select Shape</option>
                <option value="point">Point Mass</option>
                <option value="rod_center">Rod (Center)</option>
                <option value="rod_end">Rod (End)</option>
                <option value="disk">Disk (Center)</option>
                <option value="sphere">Sphere (Solid)</option>
                <option value="rectangle">Rectangle (Center)</option>
              </select>
            </div>
          </div>

          {/* Shape Parameters */}
          {shape !== "none" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mass
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={mass}
                    onChange={(e) => setMass(e.target.value)}
                    placeholder="Enter mass"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={massUnit}
                    onChange={(e) => setMassUnit(e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(massConversion).map((u) => (
                      <option key={u} value={u}>
                        {massDisplayNames[u]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {shape === "point" ? "Distance (r)" : "Length (L or r)"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    placeholder="Enter length"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={lengthUnit}
                    onChange={(e) => setLengthUnit(e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(lengthConversion).map((u) => (
                      <option key={u} value={u}>
                        {lengthDisplayNames[u]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Display Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decimal Places ({decimalPlaces})
              </label>
              <input
                type="range"
                min="0"
                max="8"
                value={decimalPlaces}
                onChange={(e) => setDecimalPlaces(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div className="flex items-center justify-end">
              <button
                onClick={reset}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Results Section */}
          {(value || calculatedInertia) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {value && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Converted Values
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                    {Object.entries(results).map(([unit, val]) => (
                      <p key={unit}>
                        {unitDisplayNames[unit]}:{" "}
                        {val.toFixed(decimalPlaces)}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {calculatedInertia && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h2 className="text-lg font-semibold text-blue-800 mb-2">
                    Calculated Inertia
                  </h2>
                  <p className="text-blue-700">
                    kg·m²: {calculatedInertia.toFixed(decimalPlaces)}
                  </p>
                  <p className="mt-2 text-sm text-blue-600">
                    Formula:{" "}
                    {shape === "point"
                      ? "I = m·r²"
                      : shape === "rod_center"
                      ? "I = (1/12)·m·L²"
                      : shape === "rod_end"
                      ? "I = (1/3)·m·L²"
                      : shape === "disk"
                      ? "I = (1/2)·m·r²"
                      : shape === "sphere"
                      ? "I = (2/5)·m·r²"
                      : "I = (1/12)·m·(a² + b²)"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Info Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <details className="group">
              <summary className="flex items-center cursor-pointer font-semibold text-blue-700">
                <FaInfoCircle className="mr-2" /> Conversion References & Features
                <span className="ml-2 group-open:rotate-180">▼</span>
              </summary>
              <div className="mt-2 text-sm text-blue-600">
                <ul className="list-disc list-inside space-y-1">
                  <li>1 kg·m² = 10⁴ kg·cm² = 10⁷ g·cm²</li>
                  <li>1 lb·ft² ≈ 0.042140 kg·m²</li>
                  <li>1 lb·in² ≈ 2.926 × 10⁻⁴ kg·m²</li>
                  <li>Supports multiple mass and length units</li>
                  <li>Adjustable decimal precision</li>
                  <li>Formulas for various shapes included</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MomentOfInertiaConverter;