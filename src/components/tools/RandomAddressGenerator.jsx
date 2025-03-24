"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo, FaDice } from "react-icons/fa";

const RandomAddressGenerator = () => {
  const [addresses, setAddresses] = useState([]);
  const [count, setCount] = useState(1);
  const [country, setCountry] = useState("us");
  const [options, setOptions] = useState({
    includeZip: true,
    includePhone: false,
    includeBuilding: false,
    separator: "\n",
  });
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);

  // Expanded sample data for address generation
  const addressData = {
    us: {
      streets: ["Main St", "Oak Ave", "Pine Rd", "Cedar Ln", "Maple Dr", "Elm St", "Willow Way"],
      cities: ["Springfield", "Riverside", "Fairview", "Hillsboro", "Lakewood", "Madison", "Clinton"],
      states: ["CA", "TX", "NY", "FL", "IL", "PA", "OH"],
      buildings: ["Apt", "Suite", "Unit", "Floor"],
      zipFormat: () => `${Math.floor(Math.random() * 90000) + 10000}`,
      phoneFormat: () => `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    },
    uk: {
      streets: ["High St", "Church Rd", "Station Ln", "Park Ave", "Green Way", "King St", "Queen Rd"],
      cities: ["London", "Manchester", "Birmingham", "Leeds", "Bristol", "Glasgow", "Edinburgh"],
      states: ["England", "Scotland", "Wales", "Northern Ireland"],
      buildings: ["Flat", "Unit", "House"],
      zipFormat: () => {
        const parts = [
          String.fromCharCode(65 + Math.floor(Math.random() * 26)),
          String.fromCharCode(65 + Math.floor(Math.random() * 26)),
          Math.floor(Math.random() * 10),
          Math.floor(Math.random() * 10),
          String.fromCharCode(65 + Math.floor(Math.random() * 26)),
          String.fromCharCode(65 + Math.floor(Math.random() * 26)),
        ];
        return `${parts[0]}${parts[1]}${parts[2]} ${parts[3]}${parts[4]}${parts[5]}`;
      },
      phoneFormat: () => `+44 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900000) + 100000}`,
    },
    generic: {
      streets: ["Central St", "North Rd", "South Ave", "West Ln", "East Dr", "River Rd", "Hill St"],
      cities: ["Metropolis", "Gotham", "Star City", "Emerald Town", "Silver City", "Nova Ville", "Zenith"],
      states: ["Region A", "Region B", "Region C", "Zone X", "Zone Y"],
      buildings: ["Block", "Sector", "Unit"],
      zipFormat: () => `${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 900) + 100}`,
      phoneFormat: () => `${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 900000) + 100000}`,
    },
  };

  const generateAddresses = useCallback(() => {
    const data = addressData[country];
    const newAddresses = Array.from({ length: Math.min(count, 100) }, () => {
      const number = Math.floor(Math.random() * 999) + 1;
      const street = data.streets[Math.floor(Math.random() * data.streets.length)];
      const city = data.cities[Math.floor(Math.random() * data.cities.length)];
      const state = data.states[Math.floor(Math.random() * data.states.length)];
      const zip = options.includeZip ? data.zipFormat() : "";
      const phone = options.includePhone ? data.phoneFormat() : "";
      const building = options.includeBuilding
        ? `${data.buildings[Math.floor(Math.random() * data.buildings.length)]} ${Math.floor(Math.random() * 100) + 1}`
        : "";

      let address = country === "uk"
        ? `${number} ${street}${building ? " " + building : ""}${options.separator}${city}${options.separator}${state}${zip ? options.separator + zip : ""}`
        : `${number} ${street}${building ? " " + building : ""}${options.separator}${city}, ${state}${zip ? " " + zip : ""}`;

      if (phone) address += `${options.separator}${phone}`;
      return address;
    });

    setAddresses(newAddresses);
    setHistory((prev) => [...prev, { addresses: newAddresses, count, country, options }].slice(-5));
    setIsCopied(false);
  }, [count, country, options]);

  const copyToClipboard = () => {
    const text = addresses.join("\n\n");
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const downloadAsText = () => {
    const text = addresses.join("\n\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `addresses-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearAddresses = () => {
    setAddresses([]);
    setIsCopied(false);
  };

  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const restoreFromHistory = (entry) => {
    setAddresses(entry.addresses);
    setCount(entry.count);
    setCountry(entry.country);
    setOptions(entry.options);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">
          Advanced Random Address Generator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Addresses (1-100)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country Format
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="us">United States</option>
                <option value="uk">United Kingdom</option>
                <option value="generic">Generic</option>
              </select>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Customization Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeZip"
                  checked={options.includeZip}
                  onChange={(e) => handleOptionChange("includeZip", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="includeZip" className="text-sm text-gray-600">
                  Include ZIP/Postal Code
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includePhone"
                  checked={options.includePhone}
                  onChange={(e) => handleOptionChange("includePhone", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="includePhone" className="text-sm text-gray-600">
                  Include Phone Number
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeBuilding"
                  checked={options.includeBuilding}
                  onChange={(e) => handleOptionChange("includeBuilding", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="includeBuilding" className="text-sm text-gray-600">
                  Include Building (e.g., Apt #)
                </label>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Separator:</label>
                <select
                  value={options.separator}
                  onChange={(e) => handleOptionChange("separator", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="\n">Newline</option>
                  <option value=", ">Comma</option>
                  <option value=" ">Space</option>
                  <option value="; ">Semicolon</option>
                </select>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateAddresses}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaDice className="mr-2" />
              Generate Addresses
            </button>
            {addresses.length > 0 && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors font-medium flex items-center justify-center ${
                    isCopied
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" />
                  {isCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={downloadAsText}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
                <button
                  onClick={clearAddresses}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Output Display */}
        {addresses.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2 text-center">
              Generated Addresses ({addresses.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
              <div className="space-y-4">
                {addresses.map((address, index) => (
                  <pre key={index} className="text-sm text-gray-800 whitespace-pre-wrap">
                    {address}
                  </pre>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Generations (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>{entry.addresses.length} addresses ({entry.country})</span>
                  <button
                    onClick={() => restoreFromHistory(entry)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Generate addresses for US, UK, or generic formats</li>
            <li>Include ZIP codes, phone numbers, and building details</li>
            <li>Customizable separators</li>
            <li>Copy, download, and track history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RandomAddressGenerator;