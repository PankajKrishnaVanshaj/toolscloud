"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCalculator, FaInfoCircle } from "react-icons/fa";

const OhmsLawCalculator = () => {
  const [calculate, setCalculate] = useState("voltage");
  const [voltage, setVoltage] = useState("");
  const [current, setCurrent] = useState("");
  const [resistance, setResistance] = useState("");
  const [power, setPower] = useState(""); // New: Power in Watts
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [unitScale, setUnitScale] = useState("standard"); // New: Unit scaling (mA, kΩ, etc.)
  const [precision, setPrecision] = useState(2); // New: Decimal precision

  const calculateOhmsLaw = useCallback(() => {
    setError("");
    setResult(null);

    let V = parseFloat(voltage);
    let I = parseFloat(current);
    let R = parseFloat(resistance);
    let P = parseFloat(power);

    // Adjust for unit scale
    if (unitScale === "milli") {
      I = I / 1000; // mA to A
      V = V / 1000; // mV to V
    } else if (unitScale === "kilo") {
      R = R * 1000; // kΩ to Ω
      P = P * 1000; // kW to W
    }

    switch (calculate) {
      case "voltage":
        if (isNaN(I) || isNaN(R) || I < 0 || R < 0) {
          setError("Please enter valid positive values for current and resistance");
          return;
        }
        V = I * R;
        P = V * I;
        setResult({ voltage: V, current: I, resistance: R, power: P });
        break;

      case "current":
        if (isNaN(V) || isNaN(R) || V < 0 || R <= 0) {
          setError("Please enter valid positive values for voltage and resistance (R > 0)");
          return;
        }
        I = V / R;
        P = V * I;
        setResult({ voltage: V, current: I, resistance: R, power: P });
        break;

      case "resistance":
        if (isNaN(V) || isNaN(I) || V < 0 || I <= 0) {
          setError("Please enter valid positive values for voltage and current (I > 0)");
          return;
        }
        R = V / I;
        P = V * I;
        setResult({ voltage: V, current: I, resistance: R, power: P });
        break;

      case "power":
        if (isNaN(V) || isNaN(I) || V < 0 || I < 0) {
          setError("Please enter valid positive values for voltage and current");
          return;
        }
        P = V * I;
        R = V / I;
        setResult({ voltage: V, current: I, resistance: R, power: P });
        break;

      default:
        setError("Invalid calculation type");
        return;
    }
  }, [calculate, voltage, current, resistance, power, unitScale]);

  const formatNumber = (num, digits = precision) => {
    return num.toLocaleString("en-US", { maximumFractionDigits: digits });
  };

  const resetInputs = () => {
    setVoltage("");
    setCurrent("");
    setResistance("");
    setPower("");
    setResult(null);
    setError("");
    setUnitScale("standard");
    setPrecision(2);
  };

  const getUnitLabel = (type) => {
    switch (type) {
      case "voltage":
        return unitScale === "milli" ? "mV" : "V";
      case "current":
        return unitScale === "milli" ? "mA" : "A";
      case "resistance":
        return unitScale === "kilo" ? "kΩ" : "Ω";
      case "power":
        return unitScale === "kilo" ? "kW" : "W";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Ohm's Law Calculator
        </h1>

        <div className="space-y-6">
          {/* Calculate Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calculate
            </label>
            <select
              value={calculate}
              onChange={(e) => {
                setCalculate(e.target.value);
                resetInputs();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="voltage">Voltage (V)</option>
              <option value="current">Current (I)</option>
              <option value="resistance">Resistance (R)</option>
              <option value="power">Power (P)</option>
            </select>
          </div>

          {/* Unit Scale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Scale
            </label>
            <select
              value={unitScale}
              onChange={(e) => setUnitScale(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="standard">Standard (V, A, Ω, W)</option>
              <option value="milli">Milli (mV, mA)</option>
              <option value="kilo">Kilo (kΩ, kW)</option>
            </select>
          </div>

          {/* Precision */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Decimal Precision ({precision})
            </label>
            <input
              type="range"
              min="0"
              max="6"
              value={precision}
              onChange={(e) => setPrecision(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            {calculate !== "voltage" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Voltage ({getUnitLabel("voltage")})
                </label>
                <input
                  type="number"
                  value={voltage}
                  onChange={(e) => setVoltage(e.target.value)}
                  placeholder={`Enter voltage in ${getUnitLabel("voltage")}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="any"
                />
              </div>
            )}
            {calculate !== "current" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current ({getUnitLabel("current")})
                </label>
                <input
                  type="number"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  placeholder={`Enter current in ${getUnitLabel("current")}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="any"
                />
              </div>
            )}
            {calculate !== "resistance" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resistance ({getUnitLabel("resistance")})
                </label>
                <input
                  type="number"
                  value={resistance}
                  onChange={(e) => setResistance(e.target.value)}
                  placeholder={`Enter resistance in ${getUnitLabel("resistance")}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="any"
                />
              </div>
            )}
            {calculate !== "power" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Power ({getUnitLabel("power")})
                </label>
                <input
                  type="number"
                  value={power}
                  onChange={(e) => setPower(e.target.value)}
                  placeholder={`Enter power in ${getUnitLabel("power")}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="any"
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateOhmsLaw}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate
            </button>
            <button
              onClick={resetInputs}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">Results:</h2>
              <p>Voltage: {formatNumber(result.voltage)} V</p>
              <p>Current: {formatNumber(result.current)} A</p>
              <p>Resistance: {formatNumber(result.resistance)} Ω</p>
              <p>Power: {formatNumber(result.power)} W</p>
              <p className="text-sm text-gray-600 mt-2">
                V = I × R | P = V × I
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Presets</label>
            <div className="flex flex-wrap gap-2">
              {[
                { calc: "voltage", V: "", I: 2, R: 5, P: "" },
                { calc: "current", V: 10, I: "", R: 2, P: "" },
                { calc: "resistance", V: 12, I: 3, R: "", P: "" },
                { calc: "power", V: 24, I: 2, R: "", P: "" },
              ].map((preset, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCalculate(preset.calc);
                    setVoltage(preset.V !== "" ? preset.V : "");
                    setCurrent(preset.I !== "" ? preset.I : "");
                    setResistance(preset.R !== "" ? preset.R : "");
                    setPower(preset.P !== "" ? preset.P : "");
                    setResult(null);
                  }}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm transition-colors"
                >
                  {preset.calc === "voltage" && "V = 2A × 5Ω"}
                  {preset.calc === "current" && "I = 10V / 2Ω"}
                  {preset.calc === "resistance" && "R = 12V / 3A"}
                  {preset.calc === "power" && "P = 24V × 2A"}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
              <FaInfoCircle className="mr-2" /> About Ohm's Law
            </h3>
            <div className="text-sm text-blue-600 space-y-2">
              <p>Calculates electrical properties using:</p>
              <p>V = I × R (Ohm's Law)</p>
              <p>P = V × I (Power Equation)</p>
              <p>Where:</p>
              <ul className="list-disc list-inside">
                <li>V = Voltage (Volts)</li>
                <li>I = Current (Amperes)</li>
                <li>R = Resistance (Ohms)</li>
                <li>P = Power (Watts)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OhmsLawCalculator;