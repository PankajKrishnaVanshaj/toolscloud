"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaInfoCircle } from "react-icons/fa";

const SoundSpeedCalculator = () => {
  const [medium, setMedium] = useState("air");
  const [temperature, setTemperature] = useState(20); // Celsius
  const [pressure, setPressure] = useState(101325); // Pascals (1 atm)
  const [humidity, setHumidity] = useState(50); // % for air
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [unit, setUnit] = useState("m/s"); // m/s, km/h, mph

  // Constants
  const R = 287.05; // Specific gas constant for dry air (J/(kg·K))
  const gammaAir = 1.4; // Adiabatic index for air
  const rhoWater = 1000; // Density of water (kg/m³)
  const BWater = 2.2e9; // Bulk modulus of water (Pa)
  const rhoSteel = 7850; // Density of steel (kg/m³)
  const BSteel = 1.6e11; // Bulk modulus of steel (Pa)

  const calculateSoundSpeed = useCallback(() => {
    setError("");
    setResult(null);

    const tempK = parseFloat(temperature) + 273.15; // Convert to Kelvin
    if (isNaN(tempK) || tempK < 0) {
      setError("Please enter a valid temperature (≥ -273.15°C)");
      return;
    }

    const press = parseFloat(pressure);
    if (medium === "air" && (isNaN(press) || press <= 0)) {
      setError("Please enter a valid pressure (> 0 Pa)");
      return;
    }

    const humid = parseFloat(humidity);
    if (medium === "air" && (isNaN(humid) || humid < 0 || humid > 100)) {
      setError("Humidity must be between 0 and 100%");
      return;
    }

    try {
      let speed;
      let method;

      switch (medium) {
        case "air":
          // Speed of sound in air with humidity correction (simplified)
          const baseSpeed = Math.sqrt(gammaAir * R * tempK);
          const humidityEffect = humid * 0.001 * tempK; // Simplified effect: ~0.1-0.6 m/s per % humidity
          speed = baseSpeed + humidityEffect;
          method = "Ideal gas with humidity correction";
          break;
        case "water":
          // Speed of sound in water with temperature adjustment
          const v0 = 1481; // Speed at 20°C
          const tempEffect = 4.0 * (tempK - 293.15); // Approx 4 m/s per °C
          speed = v0 + tempEffect;
          method = "Empirical formula for water";
          break;
        case "steel":
          // Speed of sound in steel
          speed = Math.sqrt(BSteel / rhoSteel);
          method = "Bulk modulus and density";
          break;
        case "wood":
          // Speed of sound in wood (approximate for oak)
          const rhoWood = 700; // Density of oak (kg/m³)
          const BWood = 1.4e10; // Bulk modulus of oak (Pa)
          speed = Math.sqrt(BWood / rhoWood);
          method = "Bulk modulus and density (approximate)";
          break;
        default:
          throw new Error("Unknown medium");
      }

      // Convert speed based on selected unit
      let convertedSpeed;
      switch (unit) {
        case "m/s":
          convertedSpeed = speed;
          break;
        case "km/h":
          convertedSpeed = speed * 3.6;
          break;
        case "mph":
          convertedSpeed = speed * 2.23694;
          break;
        default:
          convertedSpeed = speed;
      }

      setResult({
        speed: convertedSpeed,
        medium,
        temperature: tempK - 273.15,
        pressure: press,
        humidity: humid,
        method,
        unit,
      });
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [medium, temperature, pressure, humidity, unit]);

  const formatNumber = (num, digits = 2) => {
    return num.toLocaleString("en-US", { maximumFractionDigits: digits });
  };

  const reset = () => {
    setMedium("air");
    setTemperature(20);
    setPressure(101325);
    setHumidity(50);
    setResult(null);
    setError("");
    setUnit("m/s");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Sound Speed Calculator
        </h1>

        <div className="space-y-6">
          {/* Medium Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medium
            </label>
            <select
              value={medium}
              onChange={(e) => {
                setMedium(e.target.value);
                setResult(null);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="air">Air</option>
              <option value="water">Water</option>
              <option value="steel">Steel</option>
              <option value="wood">Wood (Oak)</option>
            </select>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperature (°C)
            </label>
            <input
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              step="0.1"
            />
          </div>

          {/* Pressure and Humidity (for air) */}
          {medium === "air" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pressure (Pa)
                </label>
                <input
                  type="number"
                  value={pressure}
                  onChange={(e) => setPressure(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">1 atm = 101325 Pa</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Humidity (%)
                </label>
                <input
                  type="number"
                  value={humidity}
                  onChange={(e) => setHumidity(e.target.value)}
                  min="0"
                  max="100"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Unit Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="m/s">m/s</option>
              <option value="km/h">km/h</option>
              <option value="mph">mph</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={calculateSoundSpeed}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Calculate
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
              <h2 className="text-lg font-semibold mb-2">Speed of Sound:</h2>
              <p className="text-xl font-bold">{formatNumber(result.speed)} {unit}</p>
              <p className="text-sm text-gray-600 mt-2">
                Medium: {result.medium} | Temp: {formatNumber(result.temperature)}°C
                {result.medium === "air" &&
                  ` | Pressure: ${formatNumber(result.pressure)} Pa | Humidity: ${formatNumber(result.humidity)}%`}
              </p>
              <p className="text-xs text-gray-500 mt-1">Method: {result.method}</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Air (20°C, 50%)", medium: "air", temp: 20, press: 101325, humid: 50 },
                { label: "Water (20°C)", medium: "water", temp: 20 },
                { label: "Steel", medium: "steel", temp: 20 },
                { label: "Wood (Oak)", medium: "wood", temp: 20 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setMedium(preset.medium);
                    setTemperature(preset.temp);
                    if (preset.press) setPressure(preset.press);
                    if (preset.humid) setHumidity(preset.humid);
                    setResult(null);
                  }}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
              <FaInfoCircle className="mr-2" /> About
            </h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Air: Adjusted for temperature and humidity</li>
              <li>Water: Empirical adjustment from 1481 m/s at 20°C</li>
              <li>Steel/Wood: Based on bulk modulus and density</li>
              <li>Simplified models; actual values vary with conditions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoundSpeedCalculator;