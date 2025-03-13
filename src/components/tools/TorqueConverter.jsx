"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCalculator } from "react-icons/fa";

const TorqueConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("Nm");
  const [force, setForce] = useState("");
  const [forceUnit, setForceUnit] = useState("N");
  const [distance, setDistance] = useState("");
  const [distanceUnit, setDistanceUnit] = useState("m");
  const [precision, setPrecision] = useState(4);
  const [displayMode, setDisplayMode] = useState("scientific");

  // Torque conversion factors to Newton-meters (Nm)
  const torqueConversionFactors = {
    Nm: 1, // Newton-meter
    ftlb: 1.35582, // Foot-pound
    inlb: 0.112985, // Inch-pound
    kgm: 9.80665, // Kilogram-meter
    gfcm: 9.80665e-5, // Gram-force centimeter
    ozft: 0.0847386, // Ounce-foot
    Ncm: 0.01, // Newton-centimeter
    dynm: 1e-5, // Dyne-meter
  };

  // Force conversion factors to Newtons (N)
  const forceConversionFactors = {
    N: 1, // Newton
    lbf: 4.44822, // Pound-force
    kgf: 9.80665, // Kilogram-force
    gf: 9.80665e-3, // Gram-force
    dyn: 1e-5, // Dyne
  };

  // Distance conversion factors to meters (m)
  const distanceConversionFactors = {
    m: 1, // Meter
    cm: 0.01, // Centimeter
    mm: 0.001, // Millimeter
    ft: 0.3048, // Foot
    inch: 0.0254, // Inch
    km: 1000, // Kilometer
  };

  // Convert torque to all units
  const convertTorque = useCallback((inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInNm = inputValue * torqueConversionFactors[fromUnit];

    return Object.keys(torqueConversionFactors).reduce((acc, unit) => {
      const converted = valueInNm / torqueConversionFactors[unit];
      acc[unit] =
        displayMode === "scientific"
          ? converted.toExponential(precision)
          : converted.toFixed(precision);
      return acc;
    }, {});
  }, [precision, displayMode]);

  // Calculate torque from force and distance
  const calculateTorqueFromForce = useCallback(() => {
    if (!force || !distance || isNaN(force) || isNaN(distance)) return null;

    const forceInNewtons = force * forceConversionFactors[forceUnit];
    const distanceInMeters = distance * distanceConversionFactors[distanceUnit];
    const torqueInNm = forceInNewtons * distanceInMeters;

    return Object.keys(torqueConversionFactors).reduce((acc, unit) => {
      const converted = torqueInNm / torqueConversionFactors[unit];
      acc[unit] =
        displayMode === "scientific"
          ? converted.toExponential(precision)
          : converted.toFixed(precision);
      return acc;
    }, {});
  }, [force, forceUnit, distance, distanceUnit, precision, displayMode]);

  const reset = () => {
    setValue("");
    setUnit("Nm");
    setForce("");
    setForceUnit("N");
    setDistance("");
    setDistanceUnit("m");
    setPrecision(4);
    setDisplayMode("scientific");
  };

  const results = convertTorque(value, unit);
  const calculatedTorque = calculateTorqueFromForce();

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Torque Converter & Calculator
        </h1>

        <div className="space-y-6">
          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precision (Decimals)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={precision}
                onChange={(e) => setPrecision(Math.max(0, Math.min(10, e.target.value)))}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Mode
              </label>
              <select
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="scientific">Scientific Notation</option>
                <option value="decimal">Decimal</option>
              </select>
            </div>
          </div>

          {/* Input Section */}
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Torque
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Enter torque"
                    className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-24 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(torqueConversionFactors).map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Force and Distance Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Force
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={force}
                    onChange={(e) => setForce(e.target.value)}
                    placeholder="Enter force"
                    className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={forceUnit}
                    onChange={(e) => setForceUnit(e.target.value)}
                    className="w-24 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(forceConversionFactors).map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distance
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="Enter distance"
                    className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={distanceUnit}
                    onChange={(e) => setDistanceUnit(e.target.value)}
                    className="w-24 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(distanceConversionFactors).map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {(value || calculatedTorque) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {value && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-700 mb-3">
                    Torque Conversions
                  </h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(results).map(([unit, val]) => (
                      <p key={unit} className="text-gray-600">
                        {unit}: <span className="font-medium">{val}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {calculatedTorque && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h2 className="text-lg font-semibold text-blue-700 mb-3">
                    Calculated Torque
                  </h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(calculatedTorque).map(([unit, val]) => (
                      <p key={unit} className="text-blue-600">
                        {unit}: <span className="font-medium">{val}</span>
                      </p>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-gray-600">
                    Formula: τ = F × d
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center">
            <button
              onClick={reset}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Info Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features & Info</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert between multiple torque units</li>
              <li>Calculate torque from force and distance</li>
              <li>Adjustable precision (0-10 decimals)</li>
              <li>Scientific or decimal display modes</li>
              <li>
                Key Conversions: 1 Nm = 0.737562 ft-lb, 1 ft-lb = 1.35582 Nm
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TorqueConverter;