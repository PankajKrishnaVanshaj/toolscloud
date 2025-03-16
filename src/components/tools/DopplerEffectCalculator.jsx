"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCalculator, FaInfoCircle } from "react-icons/fa";

const DopplerEffectCalculator = () => {
  const [waveType, setWaveType] = useState("sound");
  const [sourceFreq, setSourceFreq] = useState("");
  const [sourceVel, setSourceVel] = useState("");
  const [observerVel, setObserverVel] = useState("");
  const [mediumVel, setMediumVel] = useState(343);
  const [direction, setDirection] = useState("towards");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [unitSystem, setUnitSystem] = useState("metric"); // metric or imperial

  // Constants
  const c = 299792458; // Speed of light in m/s

  // Preset examples
  const presets = [
    { name: "Car Horn", type: "sound", freq: 440, sVel: 20, oVel: 0, mVel: 343 },
    { name: "Train", type: "sound", freq: 300, sVel: 30, oVel: 0, mVel: 343 },
    { name: "Redshift", type: "light", freq: 5e14, sVel: 1e6, oVel: 0 },
    { name: "Siren", type: "sound", freq: 600, sVel: 15, oVel: 5, mVel: 343 },
  ];

  // Conversion functions
  const convertToMetric = (value, type) => {
    if (unitSystem === "imperial") {
      return type === "speed" ? value * 0.44704 : value; // mph to m/s
    }
    return value;
  };

  const convertFromMetric = (value, type) => {
    if (unitSystem === "imperial") {
      return type === "speed" ? value / 0.44704 : value; // m/s to mph
    }
    return value;
  };

  const calculateDopplerEffect = useCallback(() => {
    setError("");
    setResult(null);

    if (!sourceFreq || isNaN(sourceFreq) || sourceFreq <= 0) {
      setError("Please enter a valid source frequency");
      return;
    }

    const f0 = parseFloat(sourceFreq);
    const vs = convertToMetric(parseFloat(sourceVel) || 0, "speed");
    const vo = convertToMetric(parseFloat(observerVel) || 0, "speed");
    let v = convertToMetric(parseFloat(mediumVel) || 343, "speed");

    if (waveType === "sound" && v <= 0) {
      setError("Medium velocity must be positive for sound");
      return;
    }

    try {
      let observedFreq, freqShift, wavelength;

      if (waveType === "sound") {
        const sign = direction === "towards" ? 1 : -1;
        const numerator = v + sign * vo;
        const denominator = v - sign * vs;

        if (denominator === 0) {
          setError("Source velocity cannot equal medium velocity");
          return;
        }

        observedFreq = f0 * (numerator / denominator);
        freqShift = observedFreq - f0;
        wavelength = v / observedFreq;
      } else {
        const relVel = (vs - vo) / c;
        const sign = direction === "towards" ? -1 : 1;
        const beta = sign * relVel;

        if (Math.abs(beta) >= 1) {
          setError("Relative velocity must be less than speed of light");
          return;
        }

        observedFreq = f0 * Math.sqrt((1 - beta) / (1 + beta));
        freqShift = observedFreq - f0;
        wavelength = c / observedFreq;
      }

      setResult({
        observedFreq,
        freqShift,
        wavelength: convertFromMetric(wavelength, "length"),
      });
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [sourceFreq, sourceVel, observerVel, mediumVel, waveType, direction, unitSystem]);

  const reset = () => {
    setWaveType("sound");
    setSourceFreq("");
    setSourceVel("");
    setObserverVel("");
    setMediumVel(343);
    setDirection("towards");
    setResult(null);
    setError("");
    setUnitSystem("metric");
  };

  const formatNumber = (num, digits = 2) => {
    return num.toLocaleString("en-US", { maximumFractionDigits: digits });
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Doppler Effect Calculator
        </h1>

        <div className="space-y-6">
          {/* Wave Type & Unit System */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wave Type
              </label>
              <select
                value={waveType}
                onChange={(e) => {
                  setWaveType(e.target.value);
                  setResult(null);
                  setMediumVel(e.target.value === "sound" ? 343 : c);
                }}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="sound">Sound</option>
                <option value="light">Light</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit System
              </label>
              <select
                value={unitSystem}
                onChange={(e) => setUnitSystem(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="metric">Metric (m/s, m)</option>
                <option value="imperial">Imperial (mph, ft)</option>
              </select>
            </div>
          </div>

          {/* Inputs */}
          {[
            { label: "Source Frequency (Hz)", value: sourceFreq, setter: setSourceFreq },
            { label: `Source Velocity (${unitSystem === "metric" ? "m/s" : "mph"})`, value: sourceVel, setter: setSourceVel },
            { label: `Observer Velocity (${unitSystem === "metric" ? "m/s" : "mph"})`, value: observerVel, setter: setObserverVel },
            ...(waveType === "sound"
              ? [{ label: `Medium Velocity (${unitSystem === "metric" ? "m/s" : "mph"})`, value: mediumVel, setter: setMediumVel }]
              : []),
            { label: "Direction", value: direction, setter: setDirection, type: "select" },
          ].map(({ label, value, setter, type }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              {type === "select" ? (
                <select
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="towards">Source towards Observer</option>
                  <option value="away">Source away from Observer</option>
                </select>
              ) : (
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={`e.g., ${label.includes("Frequency") ? "440" : "0"}`}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          ))}

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Presets</label>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setWaveType(preset.type);
                    setSourceFreq(preset.freq.toString());
                    setSourceVel(preset.sVel.toString());
                    setObserverVel(preset.oVel.toString());
                    setMediumVel(preset.mVel || c);
                    setDirection("towards");
                    setResult(null);
                  }}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateDopplerEffect}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h2 className="text-lg font-semibold text-green-700 mb-2">Results:</h2>
              <p>
                Observed Frequency: {formatNumber(result.observedFreq)} Hz
              </p>
              <p>
                Frequency Shift: {formatNumber(result.freqShift)} Hz
              </p>
              <p>
                Wavelength:{" "}
                {formatNumber(
                  waveType === "sound"
                    ? unitSystem === "metric"
                      ? result.wavelength
                      : result.wavelength * 3.28084
                    : result.wavelength * 1e9
                )}{" "}
                {waveType === "sound" ? (unitSystem === "metric" ? "m" : "ft") : "nm"}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Info */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
              <FaInfoCircle className="mr-2" /> About
            </h3>
            <div className="text-sm text-blue-600 space-y-2">
              <p>Calculates the Doppler effect for sound and light waves.</p>
              <p>Formulas:</p>
              <ul className="list-disc list-inside">
                <li>Sound: f = f₀ * (v ± vₒ)/(v ± vₛ)</li>
                <li>Light: f = f₀ * √((1 - β)/(1 + β)), where β = v/c</li>
              </ul>
              <p>Positive velocities indicate motion towards; negative away.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DopplerEffectCalculator;