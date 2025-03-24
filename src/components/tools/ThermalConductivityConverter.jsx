"use client";
import React, { useState, useCallback } from "react";
import { FaSync } from "react-icons/fa";

const ThermalConductivityConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("W_mK");
  const [length, setLength] = useState("");
  const [lengthUnit, setLengthUnit] = useState("m");
  const [area, setArea] = useState("");
  const [areaUnit, setAreaUnit] = useState("m2");
  const [tempDiff, setTempDiff] = useState("");
  const [tempUnit, setTempUnit] = useState("K");
  const [precision, setPrecision] = useState(4);

  // Conversion factors to W/(m·K)
  const conversionFactors = {
    W_mK: 1,                // Watt per meter-Kelvin
    W_cmK: 100,            // Watt per centimeter-Kelvin
    mW_mK: 1e-3,           // Milliwatt per meter-Kelvin
    kW_mK: 1e3,            // Kilowatt per meter-Kelvin
    Btu_hftF: 1.730735,    // BTU per hour-foot-°F
    cal_shcmC: 418.6805,   // Calorie per second-hour-centimeter-°C
    kcal_hmC: 1.162222,    // Kilocalorie per hour-meter-°C
    W_inK: 39.3701,        // Watt per inch-Kelvin
    J_smK: 1,              // Joule per second-meter-Kelvin (same as W/m·K)
  };

  const unitDisplayNames = {
    W_mK: "W/(m·K)",
    W_cmK: "W/(cm·K)",
    mW_mK: "mW/(m·K)",
    kW_mK: "kW/(m·K)",
    Btu_hftF: "BTU/(h·ft·°F)",
    cal_shcmC: "cal/(s·h·cm·°C)",
    kcal_hmC: "kcal/(h·m·°C)",
    W_inK: "W/(in·K)",
    J_smK: "J/(s·m·K)",
  };

  // Length conversion to meters
  const lengthConversion = {
    m: 1,
    cm: 0.01,
    mm: 0.001,
    ft: 0.3048,
    in: 0.0254,
    km: 1000,
  };

  // Area conversion to square meters
  const areaConversion = {
    m2: 1,
    cm2: 1e-4,
    mm2: 1e-6,
    ft2: 0.092903,
    in2: 6.4516e-4,
    km2: 1e6,
  };

  const areaDisplayNames = {
    m2: "m²",
    cm2: "cm²",
    mm2: "mm²",
    ft2: "ft²",
    in2: "in²",
    km2: "km²",
  };

  // Temperature difference conversion to Kelvin
  const tempConversion = {
    K: 1,
    C: 1,     // Δ°C = ΔK
    F: 5 / 9, // Δ°F to ΔK
  };

  const convertValue = useCallback((inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInWmK = inputValue * conversionFactors[fromUnit];

    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInWmK / conversionFactors[unit];
      return acc;
    }, {});
  }, []);

  const calculateHeatFlow = useCallback(() => {
    if (
      !value ||
      !length ||
      !area ||
      !tempDiff ||
      isNaN(value) ||
      isNaN(length) ||
      isNaN(area) ||
      isNaN(tempDiff)
    ) {
      return null;
    }

    const k = value * conversionFactors[unit]; // W/(m·K)
    const L = length * lengthConversion[lengthUnit]; // m
    const A = area * areaConversion[areaUnit]; // m²
    const deltaT = tempDiff * tempConversion[tempUnit]; // K

    // Q = k × A × ΔT / L (Watts)
    const heatFlow = (k * A * deltaT) / L;
    return {
      W: heatFlow,
      kW: heatFlow / 1000,
      Btu_h: heatFlow * 3.412142,
      cal_s: heatFlow * 0.2388459,
    };
  }, [value, unit, length, lengthUnit, area, areaUnit, tempDiff, tempUnit]);

  const reset = () => {
    setValue("");
    setUnit("W_mK");
    setLength("");
    setLengthUnit("m");
    setArea("");
    setAreaUnit("m2");
    setTempDiff("");
    setTempUnit("K");
    setPrecision(4);
  };

  const results = convertValue(value, unit);
  const heatFlow = calculateHeatFlow();

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Thermal Conductivity Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Thermal Conductivity",
                value: value,
                setValue: setValue,
                unit: unit,
                setUnit: setUnit,
                options: Object.keys(conversionFactors),
                displayNames: unitDisplayNames,
              },
              {
                label: "Length",
                value: length,
                setValue: setLength,
                unit: lengthUnit,
                setUnit: setLengthUnit,
                options: Object.keys(lengthConversion),
              },
              {
                label: "Area",
                value: area,
                setValue: setArea,
                unit: areaUnit,
                setUnit: setAreaUnit,
                options: Object.keys(areaConversion),
                displayNames: areaDisplayNames,
              },
              {
                label: "Temperature Difference",
                value: tempDiff,
                setValue: setTempDiff,
                unit: tempUnit,
                setUnit: setTempUnit,
                options: Object.keys(tempConversion),
              },
            ].map(({ label, value, setValue, unit, setUnit, options, displayNames }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {options.map((u) => (
                    <option key={u} value={u}>
                      {displayNames ? displayNames[u] : u}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Precision Control */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Decimal Precision: {precision}
            </label>
            <input
              type="range"
              min="1"
              max="8"
              value={precision}
              onChange={(e) => setPrecision(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Thermal Conductivity Conversions</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>
                      {unitDisplayNames[unit]}:{" "}
                      {val.toFixed(precision).replace(/\.?0+$/, "")}
                    </p>
                  ))}
                </div>
              </div>

              {heatFlow && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">Heat Flow (Q)</h2>
                  <div className="space-y-1 text-sm">
                    <p>Watts (W): {heatFlow.W.toFixed(precision).replace(/\.?0+$/, "")}</p>
                    <p>kW: {heatFlow.kW.toFixed(precision).replace(/\.?0+$/, "")}</p>
                    <p>BTU/h: {heatFlow.Btu_h.toFixed(precision).replace(/\.?0+$/, "")}</p>
                    <p>cal/s: {heatFlow.cal_s.toFixed(precision).replace(/\.?0+$/, "")}</p>
                  </div>
                  <p className="mt-2 text-xs text-gray-600">Q = k × A × ΔT / L</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end">
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
              <li>Convert between multiple thermal conductivity units</li>
              <li>Calculate heat flow with customizable units</li>
              <li>Adjustable decimal precision (1-8)</li>
              <li>Supports metric and imperial units</li>
            </ul>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-medium text-blue-700">
                Conversion References
              </summary>
              <ul className="list-disc list-inside mt-2 text-sm text-blue-600">
                <li>1 W/(m·K) = 1.730735 BTU/(h·ft·°F)</li>
                <li>1 W/(m·K) = 0.859845 kcal/(h·m·°C)</li>
                <li>1 W/(m·K) = 418.6805 cal/(s·h·cm·°C)</li>
                <li>1 W/(m·K) = 39.3701 W/(in·K)</li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThermalConductivityConverter;