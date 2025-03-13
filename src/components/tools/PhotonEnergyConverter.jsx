"use client";
import React, { useState, useCallback } from "react";
import { FaSync } from "react-icons/fa";

const PhotonEnergyConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("eV");
  const [precision, setPrecision] = useState(4);
  const [showDetails, setShowDetails] = useState(false);

  // Physical constants
  const h = 4.135667696e-15; // Planck's constant in eV·s
  const c = 299792458; // Speed of light in m/s
  const hc = h * c * 1e9; // h*c in eV·nm (converted to nanometers)
  const eVToJ = 1.60217662e-19; // Conversion factor from eV to J

  // Conversion functions
  const convertFromEV = (ev) => ({
    eV: ev,
    J: ev * eVToJ,
    Hz: ev / h,
    nm: hc / ev,
    cmInverse: (1e7 / hc) * ev, // Wavenumber in cm⁻¹
  });

  const convertFromJoules = (j) => ({
    eV: j / eVToJ,
    J: j,
    Hz: j / (h * eVToJ),
    nm: hc / (j / eVToJ),
    cmInverse: (1e7 / hc) * (j / eVToJ),
  });

  const convertFromHz = (hz) => ({
    eV: h * hz,
    J: h * hz * eVToJ,
    Hz: hz,
    nm: hc / (h * hz),
    cmInverse: (1e7 / hc) * (h * hz),
  });

  const convertFromNm = (nm) => ({
    eV: hc / nm,
    J: (hc / nm) * eVToJ,
    Hz: (hc / nm) / h,
    nm: nm,
    cmInverse: 1e7 / nm,
  });

  const convertFromWavenumber = (cmInverse) => ({
    eV: (hc * cmInverse) / 1e7,
    J: ((hc * cmInverse) / 1e7) * eVToJ,
    Hz: ((hc * cmInverse) / 1e7) / h,
    nm: 1e7 / cmInverse,
    cmInverse: cmInverse,
  });

  const convertValue = useCallback((inputValue, fromUnit) => {
    if (!inputValue || isNaN(parseFloat(inputValue))) return {};

    const val = parseFloat(inputValue);
    switch (fromUnit) {
      case "eV":
        return convertFromEV(val);
      case "J":
        return convertFromJoules(val);
      case "Hz":
        return convertFromHz(val);
      case "nm":
        return convertFromNm(val);
      case "cm⁻¹": // Still using cm⁻¹ in the UI, but mapped to cmInverse internally
        return convertFromWavenumber(val);
      default:
        return {};
    }
  }, []);

  const results = convertValue(value, unit);

  // Reset function
  const reset = () => {
    setValue("");
    setUnit("eV");
    setPrecision(4);
    setShowDetails(false);
  };

  // Determine wavelength properties
  const getWavelengthProperties = (nm) => {
    const range = nm < 400 ? "Ultraviolet" : nm < 700 ? "Visible" : "Infrared";
    let color = "";
    if (nm >= 400 && nm <= 700) {
      color =
        nm < 450 ? "Violet" :
        nm < 500 ? "Blue" :
        nm < 570 ? "Green" :
        nm < 590 ? "Yellow" :
        nm < 620 ? "Orange" : "Red";
    }
    return { range, color };
  };

  const wavelengthProps = results.nm ? getWavelengthProperties(results.nm) : { range: "", color: "" };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Photon Energy Converter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Value
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter value"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="eV">Electronvolts (eV)</option>
                <option value="J">Joules (J)</option>
                <option value="Hz">Frequency (Hz)</option>
                <option value="nm">Wavelength (nm)</option>
                <option value="cm⁻¹">Wavenumber (cm⁻¹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precision (decimal places)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={precision}
                onChange={(e) => setPrecision(Math.max(0, Math.min(10, parseInt(e.target.value) || 0)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end">
            <button
              onClick={reset}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results Section */}
          {value && Object.keys(results).length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">Conversions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                <p>Energy: {results.eV.toExponential(precision)} eV</p>
                <p>Energy: {results.J.toExponential(precision)} J</p>
                <p>Frequency: {results.Hz.toExponential(precision)} Hz</p>
                <p>Wavelength: {results.nm.toExponential(precision)} nm</p>
                <p>Wavenumber: {results.cmInverse.toExponential(precision)} cm⁻¹</p>
              </div>
            </div>
          )}

          {/* Photon Properties */}
          {value && Object.keys(results).length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-blue-800">Photon Properties</h2>
              <div className="text-sm text-blue-700">
                <p>Photon energy: E = hν = hc/λ</p>
                <p>Wavelength range: {wavelengthProps.range}</p>
                {wavelengthProps.color && (
                  <p>Color approximation: {wavelengthProps.color}</p>
                )}
                <p>Photon momentum: {(results.eV / c).toExponential(precision)} eV/c</p>
              </div>
            </div>
          )}
        </div>

        {/* Constants & Formulas */}
        <div className="mt-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full text-left py-2 px-4 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium text-gray-700 flex items-center justify-between"
          >
            <span>Constants & Formulas</span>
            <span>{showDetails ? "▲" : "▼"}</span>
          </button>
          {showDetails && (
            <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
              <ul className="list-disc list-inside space-y-1">
                <li>h = 4.135667696 × 10⁻¹⁵ eV·s (Planck's constant)</li>
                <li>c = 299792458 m/s (Speed of light)</li>
                <li>1 eV = 1.60217662 × 10⁻¹⁹ J</li>
                <li>E = hν (energy-frequency)</li>
                <li>E = hc/λ (energy-wavelength)</li>
                <li>ν = c/λ (frequency-wavelength)</li>
                <li>p = E/c (momentum-energy)</li>
                <li>cm⁻¹ = 10⁷/λ (wavenumber-wavelength)</li>
              </ul>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
            <li>Convert between eV, J, Hz, nm, and cm⁻¹</li>
            <li>Adjustable precision (0-10 decimal places)</li>
            <li>Wavelength range and color approximation</li>
            <li>Photon momentum calculation</li>
            <li>Collapsible constants and formulas section</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PhotonEnergyConverter;