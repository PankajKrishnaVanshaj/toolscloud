"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaCopy, FaSync, FaDownload } from "react-icons/fa";

const MACAddressValidator = () => {
  const [macAddress, setMacAddress] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [format, setFormat] = useState("colon"); // colon, hyphen, none
  const [casePreference, setCasePreference] = useState("upper"); // upper, lower
  const resultRef = useRef(null);

  // Expanded OUI database (still a sample, can be extended)
  const ouiDatabase = {
    "00:50:56": "VMware, Inc.",
    "00:0C:29": "VMware, Inc.",
    "00:25:00": "Apple, Inc.",
    "00:14:22": "Dell Inc.",
    "00:18:F3": "ASUSTek Computer Inc.",
    "00:D0:59": "Ambit Microsystems Corp.",
    "00:16:17": "Hewlett Packard",
    "00:1A:11": "Google, Inc.",
  };

  // Validate and analyze MAC address
  const validateMAC = useCallback(() => {
    setError("");
    setResults(null);

    if (!macAddress.trim()) {
      setError("Please enter a MAC address");
      return;
    }

    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^([0-9A-Fa-f]{12})$/;
    if (!macRegex.test(macAddress)) {
      setError(
        "Invalid MAC address format. Use XX:XX:XX:XX:XX:XX, XX-XX-XX-XX-XX-XX, or XXXXXXXXXXXX"
      );
      return;
    }

    // Normalize MAC address
    let normalizedMac = macAddress.replace(/[:-]/g, "").toLowerCase();
    const octets = normalizedMac.match(/.{1,2}/g);
    const separator = format === "colon" ? ":" : format === "hyphen" ? "-" : "";
    normalizedMac =
      casePreference === "upper"
        ? octets.join(separator).toUpperCase()
        : octets.join(separator);

    // Extract components
    const firstOctet = parseInt(octets[0], 16);
    const oui = octets.slice(0, 3).join(":").toUpperCase();
    const vendor = ouiDatabase[oui] || "Unknown vendor (OUI not in database)";

    // Analyze properties
    const isValid = true;
    const isMulticast = (firstOctet & 1) === 1;
    const isLocallyAdministered = (firstOctet & 2) === 2;

    setResults({
      normalized: normalizedMac,
      isValid,
      isMulticast,
      isLocallyAdministered,
      oui,
      vendor,
      binary: octets.map((octet) => parseInt(octet, 16).toString(2).padStart(8, "0")).join(" "),
    });
  }, [macAddress, format, casePreference]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    validateMAC();
  };

  // Copy results to clipboard
  const copyToClipboard = () => {
    if (results) {
      const text = JSON.stringify(results, null, 2);
      navigator.clipboard.writeText(text);
    }
  };

  // Download results as JSON
  const downloadResults = () => {
    if (results) {
      const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mac-validation-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Clear all
  const clearAll = () => {
    setMacAddress("");
    setResults(null);
    setError("");
    setFormat("colon");
    setCasePreference("upper");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          MAC Address Validator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* MAC Address Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              MAC Address
            </label>
            <input
              type="text"
              value={macAddress}
              onChange={(e) => setMacAddress(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 font-mono"
              placeholder="e.g., 00:50:56:C0:00:01 or 005056C00001"
            />
            <p className="text-xs text-gray-500 mt-1">
              Formats: XX:XX:XX:XX:XX:XX, XX-XX-XX-XX-XX-XX, or XXXXXXXXXXXX
            </p>
          </div>

          {/* Formatting Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Separator
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="colon">Colon (:)</option>
                <option value="hyphen">Hyphen (-)</option>
                <option value="none">None</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Case
              </label>
              <select
                value={casePreference}
                onChange={(e) => setCasePreference(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="upper">Uppercase</option>
                <option value="lower">Lowercase</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Validate
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        {/* Validation Results */}
        {results && (
          <div ref={resultRef} className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Validation Results</h2>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="py-1 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <FaCopy className="mr-2" /> Copy
                </button>
                <button
                  onClick={downloadResults}
                  className="py-1 px-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
              <p className="text-sm">
                <strong>Normalized MAC:</strong> {results.normalized}
              </p>
              <p
                className={`text-sm ${
                  results.isValid ? "text-green-600" : "text-red-600"
                }`}
              >
                {results.isValid ? "✓ Valid format" : "✗ Invalid format"}
              </p>
              <p className="text-sm">
                <strong>Type:</strong> {results.isMulticast ? "Multicast" : "Unicast"}
              </p>
              <p className="text-sm">
                <strong>Locally Administered:</strong>{" "}
                {results.isLocallyAdministered ? "Yes" : "No"}
              </p>
              <p className="text-sm">
                <strong>OUI:</strong> {results.oui}
              </p>
              <p className="text-sm">
                <strong>Vendor:</strong> {results.vendor}
              </p>
              <p className="text-sm font-mono">
                <strong>Binary:</strong> {results.binary}
              </p>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports multiple MAC address formats</li>
            <li>Customizable output format (separator and case)</li>
            <li>Vendor lookup with OUI database</li>
            <li>Binary representation</li>
            <li>Copy to clipboard and download as JSON</li>
          </ul>
        </div>

       
      </div>
    </div>
  );
};

export default MACAddressValidator;