"use client";

import React, { useState, useCallback } from "react";
import { FaSearch, FaTrash, FaHistory, FaUndo } from "react-icons/fa";

const PinCodeLookup = () => {
  const [pincode, setPincode] = useState("");
  const [areaDetails, setAreaDetails] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch PIN code details from a real API
  const fetchPinCodeDetails = useCallback(async (code) => {
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${code}`);
      const data = await response.json();

      if (data[0].Status === "Error" || !data[0].PostOffice) {
        throw new Error(data[0].Message || "No details found for this PIN code");
      }

      const details = data[0].PostOffice.map((office) => ({
        postOffice: office.Name,
        district: office.District,
        state: office.State,
        pincode: office.Pincode,
        region: office.Region,
        sortingDistrict: office.Division,
      }));

      setAreaDetails(details);
      setHistory((prev) => [
        { pincode: code, details, timestamp: new Date().toISOString() },
        ...prev.slice(0, 4),
      ]);
    } catch (err) {
      setError(err.message || "Failed to fetch PIN code details");
      setAreaDetails(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle search
  const handleSearch = () => {
    if (!pincode.trim()) {
      setError("Please enter a PIN code");
      return;
    }
    if (!/^\d{6}$/.test(pincode)) {
      setError("PIN code must be exactly 6 digits");
      return;
    }
    fetchPinCodeDetails(pincode);
  };

  // Handle history restore
  const restoreFromHistory = (entry) => {
    setPincode(entry.pincode);
    setAreaDetails(entry.details);
    setError("");
    setShowHistory(false);
  };

  // Clear input
  const clearInput = () => {
    setPincode("");
    setAreaDetails(null);
    setError("");
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Indian PIN Code Lookup
        </h1>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Search Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter PIN Code
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter 6-digit PIN code (e.g., 110001)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={6}
              disabled={loading}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center"
                disabled={loading}
              >
                <FaSearch className="mr-2" />
                {loading ? "Searching..." : "Search"}
              </button>
              <button
                onClick={clearInput}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                disabled={loading}
              >
                <FaTrash className="mr-2" />
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Area Details */}
        {areaDetails && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Area Details</h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-64 overflow-y-auto">
              {areaDetails.map((detail, index) => (
                <div key={index} className="mb-4 last:mb-0 text-sm text-gray-700">
                  <p className="mb-1">
                    <span className="font-medium">Post Office:</span>{" "}
                    <span className="font-semibold">{detail.postOffice}</span>
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">PIN Code:</span> {detail.pincode}
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">District:</span> {detail.district}
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">State:</span> {detail.state}
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">Region:</span> {detail.region || "N/A"}
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">Sorting District:</span>{" "}
                    {detail.sortingDistrict || "N/A"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center mb-2"
            >
              <FaHistory className="mr-1" />
              {showHistory ? "Hide History" : "Show History"} ({history.length})
            </button>
            {showHistory && (
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Recent Searches</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  {history.map((entry, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between hover:bg-gray-200 p-1 rounded"
                    >
                      <span>
                        {entry.pincode} - {entry.details[0].postOffice} (
                        {entry.details[0].district})
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
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Search Indian PIN codes to get post office and area details</li>
            <li>Real-time data from postalpincode.in API</li>
            <li>Track up to 5 recent searches with restore option</li>
            <li>Strict 6-digit PIN code validation</li>
            <li>Responsive design with clear error handling</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PinCodeLookup;