"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaHistory } from "react-icons/fa";

const ThermodynamicEfficiencyCalculator = () => {
  const [cycleType, setCycleType] = useState("carnot");
  const [tempHot, setTempHot] = useState("");
  const [tempCold, setTempCold] = useState("");
  const [pressureHigh, setPressureHigh] = useState(""); // For Rankine
  const [pressureLow, setPressureLow] = useState(""); // For Rankine
  const [gamma, setGamma] = useState(1.4); // For Brayton (specific heat ratio)
  const [unit, setUnit] = useState("K");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  // Convert temperature to Kelvin
  const convertToKelvin = (temp, unit) => {
    const t = parseFloat(temp);
    if (isNaN(t)) return NaN;
    switch (unit) {
      case "C":
        return t + 273.15;
      case "F":
        return ((t - 32) * 5) / 9 + 273.15;
      case "K":
        return t;
      default:
        return t;
    }
  };

  // Calculate efficiency based on cycle type
  const calculateEfficiency = useCallback(() => {
    setError("");
    setResult(null);

    const tHot = parseFloat(tempHot);
    const tCold = parseFloat(tempCold);
    const pHigh = parseFloat(pressureHigh);
    const pLow = parseFloat(pressureLow);

    if (isNaN(tHot) || isNaN(tCold)) {
      setError("Please enter valid temperatures");
      return;
    }

    const tHotK = convertToKelvin(tHot, unit);
    const tColdK = convertToKelvin(tCold, unit);

    if (tHotK <= tColdK) {
      setError("Hot temperature must be greater than cold temperature");
      return;
    }
    if (tColdK <= 0) {
      setError("Temperatures must be above absolute zero");
      return;
    }

    let efficiency, description;
    try {
      switch (cycleType) {
        case "carnot":
          efficiency = 1 - tColdK / tHotK;
          description = "Maximum theoretical efficiency for a heat engine";
          break;
        case "rankine":
          if (isNaN(pHigh) || isNaN(pLow) || pHigh <= pLow || pLow <= 0) {
            setError("Please enter valid pressures (P_high > P_low > 0)");
            return;
          }
          // Simplified Rankine efficiency (ideal, no losses)
          const tempRatio = tColdK / tHotK;
          const pressureRatio = Math.log(pHigh / pLow);
          efficiency = 1 - tempRatio - 0.1 * pressureRatio; // Approximation
          description = "Efficiency for an ideal Rankine cycle (simplified)";
          break;
        case "brayton":
          if (gamma <= 1) {
            setError("Gamma must be greater than 1");
            return;
          }
          // Brayton efficiency: η = 1 - (T_cold / T_hot)^((γ-1)/γ)
          efficiency = 1 - Math.pow(tColdK / tHotK, (gamma - 1) / gamma);
          description = "Efficiency for an ideal Brayton (gas turbine) cycle";
          break;
        default:
          throw new Error("Unsupported cycle type");
      }

      const resultData = {
        efficiency: efficiency * 100,
        tHotK,
        tColdK,
        description,
        cycleType,
        unit,
        inputs: { tempHot, tempCold, pressureHigh, pressureLow, gamma },
      };
      setResult(resultData);
      setHistory((prev) => [...prev, resultData].slice(-5)); // Keep last 5
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [cycleType, tempHot, tempCold, pressureHigh, pressureLow, gamma, unit]);

  const formatNumber = (num, digits = 2) =>
    num.toLocaleString("en-US", { maximumFractionDigits: digits });

  // Reset form
  const reset = () => {
    setCycleType("carnot");
    setTempHot("");
    setTempCold("");
    setPressureHigh("");
    setPressureLow("");
    setGamma(1.4);
    setUnit("K");
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Thermodynamic Efficiency Calculator
        </h1>

        <div className="space-y-6">
          {/* Cycle Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cycle Type
            </label>
            <select
              value={cycleType}
              onChange={(e) => {
                setCycleType(e.target.value);
                setResult(null);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="carnot">Carnot Cycle</option>
              <option value="rankine">Rankine Cycle</option>
              <option value="brayton">Brayton Cycle</option>
            </select>
          </div>

          {/* Temperature Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperature Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="K">Kelvin (K)</option>
              <option value="C">Celsius (°C)</option>
              <option value="F">Fahrenheit (°F)</option>
            </select>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hot Temperature ({unit})
              </label>
              <input
                type="number"
                value={tempHot}
                onChange={(e) => setTempHot(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cold Temperature ({unit})
              </label>
              <input
                type="number"
                value={tempCold}
                onChange={(e) => setTempCold(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {cycleType === "rankine" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    High Pressure (kPa)
                  </label>
                  <input
                    type="number"
                    value={pressureHigh}
                    onChange={(e) => setPressureHigh(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Low Pressure (kPa)
                  </label>
                  <input
                    type="number"
                    value={pressureLow}
                    onChange={(e) => setPressureLow(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
            {cycleType === "brayton" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specific Heat Ratio (γ)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1.1"
                  max="1.67"
                  value={gamma}
                  onChange={(e) => setGamma(parseFloat(e.target.value))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateEfficiency}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Calculate Efficiency
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Efficiency:</h2>
              <p className="text-xl">{formatNumber(result.efficiency)}%</p>
              <p className="text-sm text-gray-600 mt-2">
                T_hot: {formatNumber(result.tHotK)} K (
                {formatNumber(result.tHotK - 273.15)}°C)
              </p>
              <p className="text-sm text-gray-600">
                T_cold: {formatNumber(result.tColdK)} K (
                {formatNumber(result.tColdK - 273.15)}°C)
              </p>
              {cycleType === "rankine" && (
                <>
                  <p className="text-sm text-gray-600">P_high: {pressureHigh} kPa</p>
                  <p className="text-sm text-gray-600">P_low: {pressureLow} kPa</p>
                </>
              )}
              {cycleType === "brayton" && (
                <p className="text-sm text-gray-600">γ: {gamma}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">{result.description}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Presets</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setCycleType("carnot");
                  setUnit("K");
                  setTempHot("500");
                  setTempCold("300");
                }}
                className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm"
              >
                Carnot (500K/300K)
              </button>
              <button
                onClick={() => {
                  setCycleType("rankine");
                  setUnit("C");
                  setTempHot("300");
                  setTempCold("40");
                  setPressureHigh("1000");
                  setPressureLow("10");
                }}
                className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm"
              >
                Rankine (300°C/40°C)
              </button>
              <button
                onClick={() => {
                  setCycleType("brayton");
                  setUnit("K");
                  setTempHot("1200");
                  setTempCold("300");
                  setGamma(1.4);
                }}
                className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm"
              >
                Brayton (1200K/300K)
              </button>
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
                <FaHistory className="mr-2" /> Calculation History
              </h3>
              <ul className="text-sm text-blue-600 space-y-1 max-h-40 overflow-y-auto">
                {history.slice().reverse().map((entry, index) => (
                  <li key={index}>
                    {entry.cycleType.charAt(0).toUpperCase() + entry.cycleType.slice(1)}: {formatNumber(entry.efficiency)}% (T_hot: {entry.inputs.tempHot} {entry.unit}, T_cold: {entry.inputs.tempCold} {entry.unit})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Info */}
          <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About Thermodynamic Cycles</summary>
              <div className="mt-2 space-y-2">
                <ul className="list-disc list-inside">
                  <li><strong>Carnot:</strong> η = 1 - (T_cold / T_hot)</li>
                  <li><strong>Rankine:</strong> Simplified model with pressure effects</li>
                  <li><strong>Brayton:</strong> η = 1 - (T_cold / T_hot)^((γ-1)/γ)</li>
                </ul>
                <p>All temperatures are converted to Kelvin for calculations.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThermodynamicEfficiencyCalculator;