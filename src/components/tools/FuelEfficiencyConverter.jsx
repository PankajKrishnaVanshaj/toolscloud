"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCalculator, FaInfoCircle } from "react-icons/fa";

const FuelEfficiencyConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("mpg_us");
  const [distance, setDistance] = useState("");
  const [distanceUnit, setDistanceUnit] = useState("mi");
  const [fuelPrice, setFuelPrice] = useState("");
  const [currency, setCurrency] = useState("USD");

  // Conversion factors to MPG (US)
  const conversionFactors = {
    mpg_us: 1, // Miles per gallon (US)
    mpg_imp: 1.20095, // Miles per gallon (Imperial)
    km_l: 2.35215, // Kilometers per liter
    l_100km: (value) => 235.215 / value, // Liters per 100 kilometers (reciprocal)
    mi_l: 0.425144, // Miles per liter
  };

  // Distance conversion factors to miles
  const distanceConversion = {
    mi: 1,
    km: 0.621371,
    m: 0.000621371,
  };

  // Currency symbols
  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };

  // Display names for units
  const unitDisplayNames = {
    mpg_us: "MPG (US)",
    mpg_imp: "MPG (Imperial)",
    km_l: "km/L",
    l_100km: "L/100km",
    mi_l: "mi/L",
  };

  const distanceDisplayNames = {
    mi: "Miles (mi)",
    km: "Kilometers (km)",
    m: "Meters (m)",
  };

  // Conversion logic
  const convertValue = useCallback((inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue) || inputValue <= 0) return {};

    let valueInMpgUs;
    if (fromUnit === "l_100km") {
      valueInMpgUs = conversionFactors.l_100km(inputValue);
    } else {
      valueInMpgUs = inputValue * conversionFactors[fromUnit];
    }

    const results = {};
    Object.keys(conversionFactors).forEach((unit) => {
      if (unit === "l_100km") {
        results[unit] = 235.215 / valueInMpgUs;
      } else {
        results[unit] = valueInMpgUs / conversionFactors[unit];
      }
    });
    return results;
  }, []);

  // Fuel needed calculation
  const calculateFuelNeeded = useCallback(() => {
    if (
      !value ||
      !distance ||
      isNaN(value) ||
      isNaN(distance) ||
      value <= 0 ||
      distance <=0
    )
      return null;

    const efficiencyInMpgUs =
      unit === "l_100km"
        ? conversionFactors.l_100km(value)
        : value * conversionFactors[unit];
    const distanceInMiles = distance * distanceConversion[distanceUnit];
    const fuelGallonsUs = distanceInMiles / efficiencyInMpgUs;

    return {
      gallons_us: fuelGallonsUs,
      gallons_imp: fuelGallonsUs / 1.20095,
      liters: fuelGallonsUs * 3.78541,
    };
  }, [value, unit, distance, distanceUnit]);

  // Cost calculation
  const calculateCost = useCallback(() => {
    const fuel = calculateFuelNeeded();
    if (!fuel || !fuelPrice || isNaN(fuelPrice) || fuelPrice <= 0) return null;
    return {
      cost: fuel.liters * (fuelPrice / 100), // Assuming price per liter in cents
    };
  }, [calculateFuelNeeded, fuelPrice]);

  const results = convertValue(value, unit);
  const fuelNeeded = calculateFuelNeeded();
  const cost = calculateCost();

  // Reset function
  const reset = () => {
    setValue("");
    setUnit("mpg_us");
    setDistance("");
    setDistanceUnit("mi");
    setFuelPrice("");
    setCurrency("USD");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Fuel Efficiency Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fuel Efficiency
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter value"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(conversionFactors).map((u) => (
                  <option key={u} value={u}>
                    {unitDisplayNames[u]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distance
              </label>
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="Enter distance"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(distanceConversion).map((u) => (
                  <option key={u} value={u}>
                    {distanceDisplayNames[u]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fuel Price (per Liter)
              </label>
              <input
                type="number"
                value={fuelPrice}
                onChange={(e) => setFuelPrice(e.target.value)}
                placeholder="Enter price (cents)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(currencySymbols).map((c) => (
                  <option key={c} value={c}>
                    {c} ({currencySymbols[c]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Section */}
          {(value || distance || fuelPrice) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {value && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2 flex items-center">
                    <FaCalculator className="mr-2" /> Conversions
                  </h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(results).map(([unit, val]) => (
                      <p key={unit}>
                        {unitDisplayNames[unit]}: {val.toFixed(2)}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {fuelNeeded && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2 flex items-center">
                    <FaCalculator className="mr-2" /> Fuel Needed
                  </h2>
                  <p>Gallons (US): {fuelNeeded.gallons_us.toFixed(2)}</p>
                  <p>Gallons (Imp): {fuelNeeded.gallons_imp.toFixed(2)}</p>
                  <p>Liters: {fuelNeeded.liters.toFixed(2)}</p>
                </div>
              )}

              {cost && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2 flex items-center">
                    <FaCalculator className="mr-2" /> Estimated Cost
                  </h2>
                  <p>
                    Cost: {currencySymbols[currency]}
                    {(cost.cost / 100).toFixed(2)} {currency}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Based on {fuelPrice}¢/L
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Reset Button */}
          <div className="flex justify-center">
            <button
              onClick={reset}
              className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center transition-colors"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Info Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
              <FaInfoCircle className="mr-2" /> Features & References
            </h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert between MPG (US/Imp), km/L, L/100km, mi/L</li>
              <li>Calculate fuel needed for a given distance</li>
              <li>Estimate cost based on fuel price</li>
              <li>Supports multiple currencies</li>
            </ul>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-blue-600">
                Conversion Formulas
              </summary>
              <ul className="list-disc list-inside mt-2 text-sm text-blue-600">
                <li>1 MPG (US) = 0.425144 km/L</li>
                <li>1 MPG (US) = 1.20095 MPG (Imp)</li>
                <li>1 km/L = 2.35215 MPG (US)</li>
                <li>L/100km = 235.215 ÷ MPG (US)</li>
                <li>1 Gallon (US) = 3.78541 L</li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuelEfficiencyConverter;