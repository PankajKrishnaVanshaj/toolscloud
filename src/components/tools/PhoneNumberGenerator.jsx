"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo, FaDice } from "react-icons/fa";

const PhoneNumberGenerator = () => {
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [count, setCount] = useState(10);
  const [country, setCountry] = useState("us");
  const [format, setFormat] = useState("standard");
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    separator: "-",       // Custom separator for standard format
    includeAreaCode: true, // Toggle area/country code
    customPrefix: "",     // Custom prefix for numbers
  });

  const countryFormats = {
    us: { code: "+1", areaLength: 3, prefixLength: 3, lineLength: 4 },
    uk: { code: "+44", mobilePrefixes: ["07"], numberLength: 9 },
    fr: { code: "+33", mobilePrefixes: ["06", "07"], numberLength: 8 },
    de: { code: "+49", mobilePrefixes: ["015", "016", "017"], numberLength: 8 },
    generic: { code: "+000", areaLength: 3, numberLength: 7 },
  };

  const generatePhoneNumber = () => {
    const generateDigits = (length) =>
      Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");

    const config = countryFormats[country];
    let number = "";

    switch (country) {
      case "us":
        const usArea = options.includeAreaCode ? `${Math.floor(Math.random() * 900) + 100}` : "";
        const usPrefix = generateDigits(config.prefixLength);
        const usLine = generateDigits(config.lineLength);
        number = `${usArea}${usPrefix}${usLine}`;
        if (format === "standard" && options.includeAreaCode) return `(${usArea}) ${usPrefix}${options.separator}${usLine}`;
        if (format === "international") return `${config.code}${number}`;
        return `${options.customPrefix}${number}`;

      case "uk":
        const ukPrefix = config.mobilePrefixes[Math.floor(Math.random() * config.mobilePrefixes.length)];
        const ukNumber = generateDigits(config.numberLength);
        number = `${ukPrefix}${ukNumber}`;
        if (format === "standard") return `${ukPrefix}${ukNumber.slice(0, 3)} ${ukNumber.slice(3)}`;
        if (format === "international") return `${config.code}${number}`;
        return `${options.customPrefix}${number}`;

      case "fr":
        const frPrefix = config.mobilePrefixes[Math.floor(Math.random() * config.mobilePrefixes.length)];
        const frNumber = generateDigits(config.numberLength);
        number = `${frPrefix}${frNumber}`;
        if (format === "standard") return `${frPrefix} ${frNumber.match(/.{1,2}/g).join(" ")}`;
        if (format === "international") return `${config.code}${frPrefix.slice(1)}${frNumber}`;
        return `${options.customPrefix}${number}`;

      case "de":
        const dePrefix = config.mobilePrefixes[Math.floor(Math.random() * config.mobilePrefixes.length)];
        const deNumber = generateDigits(config.numberLength);
        number = `${dePrefix}${deNumber}`;
        if (format === "standard") return `${dePrefix} ${deNumber.slice(0, 4)}${options.separator}${deNumber.slice(4)}`;
        if (format === "international") return `${config.code}${number}`;
        return `${options.customPrefix}${number}`;

      case "generic":
      default:
        const genArea = options.includeAreaCode ? `${Math.floor(Math.random() * 900) + 100}` : "";
        const genNumber = generateDigits(config.numberLength);
        number = `${genArea}${genNumber}`;
        if (format === "standard" && options.includeAreaCode) return `${genArea}${options.separator}${genNumber.slice(0, 3)}${options.separator}${genNumber.slice(3)}`;
        if (format === "international") return `${config.code}${number}`;
        return `${options.customPrefix}${number}`;
    }
  };

  const generatePhoneNumbers = useCallback(() => {
    const newPhoneNumbers = Array.from({ length: Math.min(count, 1000) }, generatePhoneNumber);
    setPhoneNumbers(newPhoneNumbers);
    setIsCopied(false);
    setHistory((prev) => [
      ...prev,
      { numbers: newPhoneNumbers, count, country, format, options },
    ].slice(-5));
  }, [count, country, format, options]);

  const copyToClipboard = () => {
    const text = phoneNumbers.join("\n");
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const downloadAsText = () => {
    const text = phoneNumbers.join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `phone-numbers-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearPhoneNumbers = () => {
    setPhoneNumbers([]);
    setIsCopied(false);
  };

  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const restoreFromHistory = (entry) => {
    setPhoneNumbers(entry.numbers);
    setCount(entry.count);
    setCountry(entry.country);
    setFormat(entry.format);
    setOptions(entry.options);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Phone Number Generator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Phone Numbers (1-1000)
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
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
                <option value="fr">France</option>
                <option value="de">Germany</option>
                <option value="generic">Generic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="standard">Standard (country-specific)</option>
                <option value="international">International (+ country code)</option>
                <option value="digits">Digits Only</option>
              </select>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Advanced Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Separator (Standard):</label>
                <select
                  value={options.separator}
                  onChange={(e) => handleOptionChange("separator", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="-">Hyphen (-)</option>
                  <option value=" ">Space</option>
                  <option value=".">Dot (.)</option>
                  <option value="">None</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeAreaCode}
                  onChange={() => handleOptionChange("includeAreaCode", !options.includeAreaCode)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">Include Area Code</label>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Custom Prefix (Digits):</label>
                <input
                  type="text"
                  value={options.customPrefix}
                  onChange={(e) => handleOptionChange("customPrefix", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 123"
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generatePhoneNumbers}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaDice className="mr-2" />
              Generate Numbers
            </button>
            {phoneNumbers.length > 0 && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center text-white ${
                    isCopied ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" />
                  {isCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={downloadAsText}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
                <button
                  onClick={clearPhoneNumbers}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Output */}
        {phoneNumbers.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated Phone Numbers ({phoneNumbers.length}):
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-64 overflow-y-auto font-mono text-sm">
              {phoneNumbers.map((number, index) => (
                <div key={index} className="py-1">{number}</div>
              ))}
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
                  <span>
                    {entry.numbers.length} numbers ({entry.country.toUpperCase()}, {entry.format})
                  </span>
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
            <li>Generate numbers for US, UK, France, Germany, or Generic</li>
            <li>Formats: Standard, International, or Digits Only</li>
            <li>Custom separators and prefixes</li>
            <li>Copy, download, and track history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PhoneNumberGenerator;