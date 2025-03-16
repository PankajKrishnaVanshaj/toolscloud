"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaStar } from "react-icons/fa";

const StarBrightnessCalculator = () => {
  const [inputType, setInputType] = useState("apparent");
  const [apparentMag, setApparentMag] = useState("");
  const [distance, setDistance] = useState("");
  const [distanceUnit, setDistanceUnit] = useState("parsecs"); // parsecs or light-years
  const [absoluteMag, setAbsoluteMag] = useState("");
  const [luminosity, setLuminosity] = useState("");
  const [luminosityUnit, setLuminosityUnit] = useState("solar"); // solar or watts
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Constants
  const SOLAR_LUMINOSITY = 3.828e26; // Watts
  const SOLAR_ABSOLUTE_MAG = 4.83;
  const PARSECS_PER_LIGHT_YEAR = 3.262;

  const calculateBrightness = useCallback(() => {
    setError("");
    setResult(null);

    let d = parseFloat(distance);
    if (isNaN(d) || d <= 0) {
      setError("Please enter a valid positive distance");
      return;
    }
    if (distanceUnit === "light-years") {
      d /= PARSECS_PER_LIGHT_YEAR; // Convert to parsecs
    }

    try {
      let m, M, L;

      switch (inputType) {
        case "apparent":
          const mVal = parseFloat(apparentMag);
          if (isNaN(mVal)) {
            setError("Please enter a valid apparent magnitude");
            return;
          }
          M = mVal - 5 * Math.log10(d) + 5;
          L = Math.pow(10, (SOLAR_ABSOLUTE_MAG - M) / 2.5);
          m = mVal;
          break;

        case "absolute":
          const MVal = parseFloat(absoluteMag);
          if (isNaN(MVal)) {
            setError("Please enter a valid absolute magnitude");
            return;
          }
          m = MVal + 5 * Math.log10(d) - 5;
          L = Math.pow(10, (SOLAR_ABSOLUTE_MAG - MVal) / 2.5);
          M = MVal;
          break;

        case "luminosity":
          const LVal = parseFloat(luminosity);
          if (isNaN(LVal) || LVal <= 0) {
            setError("Please enter a valid positive luminosity");
            return;
          }
          let LInSolar = LVal;
          if (luminosityUnit === "watts") {
            LInSolar = LVal / SOLAR_LUMINOSITY;
          }
          M = SOLAR_ABSOLUTE_MAG - 2.5 * Math.log10(LInSolar);
          m = M + 5 * Math.log10(d) - 5;
          L = LInSolar;
          break;

        default:
          throw new Error("Invalid input type");
      }

      setResult({
        apparentMag: m,
        absoluteMag: M,
        luminosityWatts: L * SOLAR_LUMINOSITY,
        luminositySolar: L,
        distanceParsecs: d,
        distanceLightYears: d * PARSECS_PER_LIGHT_YEAR,
      });
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [
    inputType,
    apparentMag,
    distance,
    distanceUnit,
    absoluteMag,
    luminosity,
    luminosityUnit,
  ]);

  const formatNumber = (num, digits = 3) => {
    if (num === null || num === undefined || isNaN(num)) return "N/A";
    if (Math.abs(num) < 1e-6 || Math.abs(num) > 1e6) {
      return num.toExponential(digits);
    }
    return num.toLocaleString("en-US", { maximumFractionDigits: digits });
  };

  const reset = () => {
    setInputType("apparent");
    setApparentMag("");
    setDistance("");
    setDistanceUnit("parsecs");
    setAbsoluteMag("");
    setLuminosity("");
    setLuminosityUnit("solar");
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center justify-center">
          <FaStar className="mr-2 text-yellow-500" /> Star Brightness Calculator
        </h1>

        <div className="space-y-6">
          {/* Input Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Type
              </label>
              <select
                value={inputType}
                onChange={(e) => {
                  setInputType(e.target.value);
                  setApparentMag("");
                  setAbsoluteMag("");
                  setLuminosity("");
                  setResult(null);
                  setError("");
                }}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="apparent">Apparent Magnitude (m)</option>
                <option value="absolute">Absolute Magnitude (M)</option>
                <option value="luminosity">Luminosity</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distance Unit
              </label>
              <select
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="parsecs">Parsecs</option>
                <option value="light-years">Light Years</option>
              </select>
            </div>
          </div>

          {/* Distance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Distance ({distanceUnit})
            </label>
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder={`e.g., ${distanceUnit === "parsecs" ? "10" : "32.6"}`}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Specific Input */}
          {inputType === "apparent" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apparent Magnitude (m)
              </label>
              <input
                type="number"
                value={apparentMag}
                onChange={(e) => setApparentMag(e.target.value)}
                placeholder="e.g., -1.46"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          {inputType === "absolute" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Absolute Magnitude (M)
              </label>
              <input
                type="number"
                value={absoluteMag}
                onChange={(e) => setAbsoluteMag(e.target.value)}
                placeholder="e.g., 4.83"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          {inputType === "luminosity" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Luminosity ({luminosityUnit === "solar" ? "L☉" : "Watts"})
                </label>
                <input
                  type="number"
                  value={luminosity}
                  onChange={(e) => setLuminosity(e.target.value)}
                  placeholder={`e.g., ${luminosityUnit === "solar" ? "1" : "3.828e26"}`}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Luminosity Unit
                </label>
                <select
                  value={luminosityUnit}
                  onChange={(e) => setLuminosityUnit(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="solar">Solar Luminosities (L☉)</option>
                  <option value="watts">Watts</option>
                </select>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateBrightness}
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
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Stellar Properties
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                <p>Apparent Magnitude (m): {formatNumber(result.apparentMag)}</p>
                <p>Absolute Magnitude (M): {formatNumber(result.absoluteMag)}</p>
                <p>Luminosity: {formatNumber(result.luminositySolar)} L☉</p>
                <p>Luminosity: {formatNumber(result.luminosityWatts)} W</p>
                <p>Distance: {formatNumber(result.distanceParsecs)} parsecs</p>
                <p>Distance: {formatNumber(result.distanceLightYears)} ly</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700 text-sm">
              <p>{error}</p>
            </div>
          )}

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stellar Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { name: "Sirius", type: "apparent", mag: -1.46, dist: 8.6 / PARSECS_PER_LIGHT_YEAR },
                { name: "Sun", type: "absolute", mag: 4.83, dist: 1 / 206265 },
                { name: "Betelgeuse", type: "luminosity", lum: 126000, dist: 200 },
              ].map((star) => (
                <button
                  key={star.name}
                  onClick={() => {
                    setInputType(star.type);
                    if (star.type === "apparent") setApparentMag(star.mag);
                    if (star.type === "absolute") setAbsoluteMag(star.mag);
                    if (star.type === "luminosity") {
                      setLuminosity(star.lum);
                      setLuminosityUnit("solar");
                    }
                    setDistance(star.dist);
                    setDistanceUnit("parsecs");
                    setResult(null);
                    setError("");
                  }}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm transition-colors"
                >
                  {star.name}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">About</h3>
            <div className="text-sm text-blue-600 space-y-1">
              <p>Calculates stellar brightness properties:</p>
              <ul className="list-disc list-inside">
                <li>m = M + 5 log₁₀(d) - 5</li>
                <li>L/L☉ = 10^((M☉ - M) / 2.5)</li>
                <li>M☉ = 4.83, L☉ = 3.828×10²⁶ W</li>
                <li>1 parsec = {PARSECS_PER_LIGHT_YEAR.toFixed(3)} light-years</li>
              </ul>
              <p>
                <strong>m:</strong> Apparent magnitude (observed brightness)
              </p>
              <p>
                <strong>M:</strong> Absolute magnitude (at 10 pc)
              </p>
              <p>
                <strong>L:</strong> Luminosity (intrinsic brightness)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StarBrightnessCalculator;