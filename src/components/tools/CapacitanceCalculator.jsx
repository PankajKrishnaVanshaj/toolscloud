"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCalculator } from "react-icons/fa";

const CapacitanceCalculator = () => {
  const [type, setType] = useState("parallel");
  const [params, setParams] = useState({
    area: "",
    distance: "",
    radius1: "",
    radius2: "",
    length: "",
    permittivity: "1", // Relative permittivity (εᵣ)
  });
  const [unitScale, setUnitScale] = useState("m");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  // Constants
  const ε0 = 8.854187817e-12; // Permittivity of free space (F/m)

  const unitConversions = {
    m: 1,
    cm: 0.01,
    mm: 0.001,
  };

  // Calculate capacitance
  const calculateCapacitance = useCallback(() => {
    setError("");
    setResult(null);

    const scale = unitConversions[unitScale];
    const εr = parseFloat(params.permittivity) || 1; // Relative permittivity
    const scaledParams = {
      area: parseFloat(params.area) * scale * scale || 0,
      distance: parseFloat(params.distance) * scale || 0,
      radius1: parseFloat(params.radius1) * scale || 0,
      radius2: parseFloat(params.radius2) * scale || 0,
      length: parseFloat(params.length) * scale || 0,
    };

    try {
      let capacitance;
      switch (type) {
        case "parallel":
          if (!scaledParams.area || !scaledParams.distance || scaledParams.distance <= 0) {
            throw new Error("Invalid area or distance");
          }
          capacitance = (ε0 * εr * scaledParams.area) / scaledParams.distance;
          break;

        case "cylindrical":
          if (
            !scaledParams.radius1 ||
            !scaledParams.radius2 ||
            !scaledParams.length ||
            scaledParams.radius1 <= 0 ||
            scaledParams.radius2 <= scaledParams.radius1
          ) {
            throw new Error("Invalid radii or length");
          }
          capacitance =
            (2 * Math.PI * ε0 * εr * scaledParams.length) /
            Math.log(scaledParams.radius2 / scaledParams.radius1);
          break;

        case "spherical":
          if (
            !scaledParams.radius1 ||
            !scaledParams.radius2 ||
            scaledParams.radius1 <= 0 ||
            scaledParams.radius2 <= scaledParams.radius1
          ) {
            throw new Error("Invalid radii");
          }
          capacitance =
            (4 * Math.PI * ε0 * εr * scaledParams.radius1 * scaledParams.radius2) /
            (scaledParams.radius2 - scaledParams.radius1);
          break;

        default:
          throw new Error("Unknown capacitor type");
      }

      const resultData = {
        farads: capacitance,
        picofarads: capacitance * 1e12,
        nanofarads: capacitance * 1e9,
        microfarads: capacitance * 1e6,
      };
      setResult(resultData);
      setHistory((prev) => [
        {
          type,
          params: { ...scaledParams, permittivity: εr },
          result: resultData,
          unitScale,
          timestamp: new Date().toLocaleString(),
        },
        ...prev.slice(0, 9), // Keep last 10 entries
      ]);
    } catch (err) {
      setError(err.message);
    }
  }, [type, params, unitScale]);

  // Handle parameter changes
  const handleParamChange = (field, value) => {
    setParams((prev) => ({ ...prev, [field]: value }));
  };

  // Reset form
  const resetForm = () => {
    setParams({
      area: "",
      distance: "",
      radius1: "",
      radius2: "",
      length: "",
      permittivity: "1",
    });
    setResult(null);
    setError("");
  };

  // Format number for display
  const formatNumber = (num, digits = 4) => {
    return num.toLocaleString("en-US", { maximumFractionDigits: digits });
  };

  const presets = {
    parallel: { area: "1", distance: "0.01", permittivity: "1" },
    cylindrical: { radius1: "0.01", radius2: "0.02", length: "1", permittivity: "1" },
    spherical: { radius1: "0.05", radius2: "0.06", permittivity: "1" },
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Capacitance Calculator
        </h1>

        <div className="space-y-6">
          {/* Capacitor Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacitor Type
            </label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setParams(presets[e.target.value]);
                setResult(null);
                setError("");
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="parallel">Parallel Plate</option>
              <option value="cylindrical">Cylindrical</option>
              <option value="spherical">Spherical</option>
            </select>
          </div>

          {/* Unit Scale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
            <select
              value={unitScale}
              onChange={(e) => setUnitScale(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="m">Meters (m)</option>
              <option value="cm">Centimeters (cm)</option>
              <option value="mm">Millimeters (mm)</option>
            </select>
          </div>

          {/* Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {type === "parallel" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Plate Area ({unitScale}²)
                  </label>
                  <input
                    type="number"
                    value={params.area}
                    onChange={(e) => handleParamChange("area", e.target.value)}
                    placeholder="e.g., 1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Plate Separation ({unitScale})
                  </label>
                  <input
                    type="number"
                    value={params.distance}
                    onChange={(e) => handleParamChange("distance", e.target.value)}
                    placeholder="e.g., 0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
            {type === "cylindrical" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Inner Radius ({unitScale})
                  </label>
                  <input
                    type="number"
                    value={params.radius1}
                    onChange={(e) => handleParamChange("radius1", e.target.value)}
                    placeholder="e.g., 0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Outer Radius ({unitScale})
                  </label>
                  <input
                    type="number"
                    value={params.radius2}
                    onChange={(e) => handleParamChange("radius2", e.target.value)}
                    placeholder="e.g., 0.02"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Length ({unitScale})
                  </label>
                  <input
                    type="number"
                    value={params.length}
                    onChange={(e) => handleParamChange("length", e.target.value)}
                    placeholder="e.g., 1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
            {type === "spherical" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Inner Radius ({unitScale})
                  </label>
                  <input
                    type="number"
                    value={params.radius1}
                    onChange={(e) => handleParamChange("radius1", e.target.value)}
                    placeholder="e.g., 0.05"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Outer Radius ({unitScale})
                  </label>
                  <input
                    type="number"
                    value={params.radius2}
                    onChange={(e) => handleParamChange("radius2", e.target.value)}
                    placeholder="e.g., 0.06"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Relative Permittivity (εᵣ)
              </label>
              <input
                type="number"
                value={params.permittivity}
                onChange={(e) => handleParamChange("permittivity", e.target.value)}
                placeholder="e.g., 1 (vacuum)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                e.g., 1 (vacuum), 2.25 (paper), 4.5 (glass)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateCapacitance}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center transition-colors"
            >
              <FaCalculator className="mr-2" /> Calculate
            </button>
            <button
              onClick={resetForm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center transition-colors"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">Capacitance:</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <p>{formatNumber(result.farads)} F</p>
                <p>{formatNumber(result.microfarads)} μF</p>
                <p>{formatNumber(result.nanofarads)} nF</p>
                <p>{formatNumber(result.picofarads)} pF</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2 text-blue-800">Calculation History</h2>
              <ul className="space-y-2 max-h-48 overflow-y-auto text-sm text-blue-700">
                {history.map((entry, index) => (
                  <li key={index}>
                    <strong>{entry.type} ({entry.unitScale}):</strong>{" "}
                    {Object.entries(entry.params)
                      .filter(([key]) => key !== "permittivity")
                      .map(([key, value]) => `${key}: ${formatNumber(value)}`)
                      .join(", ")}
                    , εᵣ: {entry.params.permittivity} → {formatNumber(entry.result.picofarads)} pF (
                    {entry.timestamp})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">Formulas & Info</summary>
              <div className="mt-2 space-y-2">
                <p>Capacitance calculations include dielectric effect (εᵣ):</p>
                <ul className="list-disc list-inside">
                  <li>Parallel: C = ε₀εᵣA/d</li>
                  <li>Cylindrical: C = 2πε₀εᵣL/ln(r₂/r₁)</li>
                  <li>Spherical: C = 4πε₀εᵣr₁r₂/(r₂-r₁)</li>
                </ul>
                <p>ε₀ = {ε0} F/m (vacuum permittivity)</p>
                <p>Common εᵣ values: Vacuum (1), Air (~1), Paper (2-4), Glass (4-10)</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapacitanceCalculator;