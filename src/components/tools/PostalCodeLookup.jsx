"use client";

import React, { useState, useCallback } from "react";
import { FaSearch, FaTrash, FaCopy, FaHistory, FaUndo } from "react-icons/fa";

const PostalCodeLookup = () => {
  const [countryCode, setCountryCode] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showCopyAlert, setShowCopyAlert] = useState(false);

    // Zipcodebase API key 
  const API_KEY = "c8adc0f0-1862-11f0-b104-f98ccb1def5b"; 

  // const response = await fetch(`https://api.zippopotam.us/${countryCode}/${postalCode.trim()}`);


  // Supported countries (ISO 3166-1 alpha-2 codes with postal code regex)
  const supportedCountries = [
    { code: "US", name: "United States", postalCodeRegex: /^\d{5}(-\d{4})?$/ },
    { code: "CA", name: "Canada", postalCodeRegex: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/ },
    { code: "GB", name: "United Kingdom", postalCodeRegex: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i },
    { code: "AU", name: "Australia", postalCodeRegex: /^\d{4}$/ },
    { code: "DE", name: "Germany", postalCodeRegex: /^\d{5}$/ },
    { code: "FR", name: "France", postalCodeRegex: /^\d{5}$/ },
    { code: "IN", name: "India", postalCodeRegex: /^\d{6}$/ },
  ];

  // Validate postal code
  const validatePostalCode = (code, country) => {
    const countryData = supportedCountries.find((c) => c.code === country);
    return countryData ? countryData.postalCodeRegex.test(code.trim()) : false;
  };

  // Fetch postal code data from Zipcodebase
  const searchPostalCode = useCallback(async () => {
    if (!countryCode) {
      setError("Please select a country");
      return;
    }
    if (!postalCode.trim()) {
      setError("Please enter a postal code");
      return;
    }
    if (!validatePostalCode(postalCode, countryCode)) {
      setError(`Invalid postal code format for ${supportedCountries.find((c) => c.code === countryCode)?.name}`);
      return;
    }

    setError("");
    setIsLoading(true);
    setResults(null);

    try {
      const response = await fetch(
        `https://app.zipcodebase.com/api/v1/search?apikey=${API_KEY}&codes=${encodeURIComponent(postalCode.trim())}&country=${countryCode}`
      );
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Postal code not found");
        }
        throw new Error(`API error: ${response.statusText}`);
      }
      const data = await response.json();

      // Validate response
      if (!data.results || !data.results[postalCode.trim()] || !Array.isArray(data.results[postalCode.trim()])) {
        throw new Error("Invalid or empty response from API");
      }

      const places = data.results[postalCode.trim()];
      if (places.length === 0) {
        throw new Error("No data found for this postal code");
      }

      const formattedResults = {
        country: places[0].country || supportedCountries.find((c) => c.code === countryCode)?.name || "Unknown",
        postalCode: places[0].postal_code || postalCode.trim(),
        places: places.map((place) => ({
          placeName: place.city || place.province || "Unknown",
          state: place.state || "N/A",
          stateCode: place.state_code || "N/A",
          latitude: place.latitude || null,
          longitude: place.longitude || null,
        })),
      };

      setResults(formattedResults);
      setHistory((prev) => [
        {
          countryCode,
          postalCode,
          timestamp: new Date().toISOString(),
          results: formattedResults,
        },
        ...prev,
      ].slice(0, 5));
    } catch (err) {
      setError(err.message || "Failed to fetch postal code data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [countryCode, postalCode, API_KEY]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    searchPostalCode();
  };

  // Clear form
  const clearForm = () => {
    setCountryCode("");
    setPostalCode("");
    setResults(null);
    setError("");
  };

  // Copy results to clipboard
  const copyToClipboard = () => {
    if (!results) return;
    const text = `
Country: ${results.country}
Postal Code: ${results.postalCode}
Places:
${results.places
  .map(
    (place) =>
      `  - ${place.placeName}, ${place.state} (${place.stateCode})${
        place.latitude && place.longitude ? `, Lat: ${place.latitude}, Lon: ${place.longitude}` : ""
      }`
  )
  .join("\n")}
    `.trim();
    navigator.clipboard.writeText(text).then(() => {
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    }).catch(() => setError("Failed to copy to clipboard"));
  };

  // Restore from history
  const restoreFromHistory = (entry) => {
    setCountryCode(entry.countryCode);
    setPostalCode(entry.postalCode);
    setResults(entry.results);
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="relative bg-white shadow-xl rounded-2xl p-6 sm:p-8 w-full ">
        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            Results copied to clipboard!
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Postal Code Lookup
        </h1>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a country</option>
                {supportedCountries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="e.g., 90210"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
            >
              <FaSearch className="mr-2" />
              {isLoading ? "Searching..." : "Search"}
            </button>
            <button
              type="button"
              onClick={clearForm}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaTrash className="mr-2" />
              Clear
            </button>
          </div>
        </form>

        {/* Results */}
        {results && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Results</h2>
            <p>
              <strong>Country:</strong> {results.country}
            </p>
            <p>
              <strong>Postal Code:</strong> {results.postalCode}
            </p>
            <h3 className="font-medium text-gray-700 mt-2">Places:</h3>
            {results.places.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-gray-600">
                {results.places.map((place, index) => (
                  <li key={index}>
                    {place.placeName}, {place.state} ({place.stateCode})
                    {place.latitude && place.longitude && (
                      <span>
                        {" "}
                        [Lat: {place.latitude}, Lon: {place.longitude}]
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">No place details available</p>
            )}
            <button
              onClick={copyToClipboard}
              className="mt-4 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <FaCopy className="mr-2" />
              Copy Results
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Searches (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.countryCode}/{entry.postalCode} (
                    {new Date(entry.timestamp).toLocaleString()})
                  </span>
                  <button
                    onClick={() => restoreFromHistory(entry)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                    title="Restore"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Search postal codes globally</li>
            <li>Retrieve city, state, and location details</li>
            <li>Copy results to clipboard</li>
            <li>Track recent searches with restore option</li>
          </ul>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-in;
          }
        `}</style>
      </div>
    </div>
  );
};

export default PostalCodeLookup;