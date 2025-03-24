"use client";

import React, { useState, useCallback } from "react";
import { faker } from "@faker-js/faker";
import { FaCopy, FaDownload, FaTrash, FaHistory, FaUndo } from "react-icons/fa";

const RandomDomainGenerator = () => {
  const [tldType, setTldType] = useState("predefined");
  const [predefinedTld, setPredefinedTld] = useState("com");
  const [customTld, setCustomTld] = useState("");
  const [domainLength, setDomainLength] = useState(10);
  const [batchSize, setBatchSize] = useState(5);
  const [domains, setDomains] = useState([]);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    includeNumbers: true,
    includeHyphens: false,
    prefix: "",
    separator: "\n",
  });
  const [showAlert, setShowAlert] = useState(false);

  const tldOptions = [
    "com",
    "org",
    "net",
    "edu",
    "gov",
    "io",
    "co",
    "tech",
    "app",
    "blog",
    "shop",
    "online",
    "dev",
  ];

  // Validate custom TLD
  const validateCustomTld = (tld) => {
    if (!tld) return false;
    const tldRegex = /^[a-zA-Z]{2,63}$/;
    return tldRegex.test(tld);
  };

  // Get effective TLD
  const getEffectiveTld = () => {
    return tldType === "predefined" ? predefinedTld : customTld.toLowerCase();
  };

  // Generate a single domain name
  const generateDomain = useCallback(() => {
    try {
      const effectiveTld = getEffectiveTld();
      if (tldType === "custom" && !validateCustomTld(customTld)) {
        throw new Error("Invalid custom TLD: Use 2-63 letters only");
      }

      let chars = "abcdefghijklmnopqrstuvwxyz";
      if (options.includeNumbers) chars += "0123456789";
      if (options.includeHyphens) chars += "-";

      const name = faker.string.fromCharacters(chars, domainLength).replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
      const domain = `${options.prefix}${name}.${effectiveTld}`;
      return domain.toLowerCase();
    } catch (err) {
      throw new Error(`Domain generation failed: ${err.message}`);
    }
  }, [tldType, predefinedTld, customTld, domainLength, options]);

  // Generate a batch of domains
  const generateBatch = () => {
    try {
      const newDomains = Array.from({ length: Math.min(batchSize, 100) }, generateDomain);
      setDomains(newDomains);
      setHistory((prev) => [
        {
          domains: newDomains,
          tld: getEffectiveTld(),
          length: domainLength,
          tldType,
          options,
          timestamp: new Date(),
        },
        ...prev.slice(0, 9), // Limit to 10 batches
      ]);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Copy domains to clipboard
  const handleCopy = () => {
    if (domains.length > 0) {
      navigator.clipboard
        .writeText(domains.join(options.separator))
        .then(() => {
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 2000);
        })
        .catch((err) => setError("Failed to copy: " + err.message));
    }
  };

  // Download domains as a file
  const handleDownload = (format) => {
    if (domains.length > 0) {
      const effectiveTld = getEffectiveTld();
      let content, type, extension;
      if (format === "txt") {
        content = domains.join(options.separator);
        type = "text/plain";
        extension = "txt";
      } else {
        content = "Domain\n" + domains.join("\n");
        type = "text/csv";
        extension = "csv";
      }
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `domains_${effectiveTld}_${Date.now()}.${extension}`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Reset form
  const handleReset = () => {
    setDomains([]);
    setError("");
    setCustomTld("");
    setDomainLength(10);
    setBatchSize(5);
    setOptions({ includeNumbers: true, includeHyphens: false, prefix: "", separator: "\n" });
  };

  // Load from history
  const loadFromHistory = (entry) => {
    setDomains(entry.domains);
    setTldType(entry.tldType);
    setDomainLength(entry.length);
    setOptions(entry.options);
    if (entry.tldType === "predefined") {
      setPredefinedTld(entry.tld);
      setCustomTld("");
    } else {
      setCustomTld(entry.tld);
      setPredefinedTld("com");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        {/* Alert Notification */}
        {showAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            Domains copied to clipboard!
          </div>
        )}

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Domain Generator
        </h2>

        {/* Controls */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TLD Type
              </label>
              <select
                value={tldType}
                onChange={(e) => setTldType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="predefined">Predefined TLD</option>
                <option value="custom">Custom TLD</option>
              </select>
            </div>
            {tldType === "predefined" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Predefined TLD
                </label>
                <select
                  value={predefinedTld}
                  onChange={(e) => setPredefinedTld(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {tldOptions.map((option) => (
                    <option key={option} value={option}>
                      .{option}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom TLD (2-63 letters)
                </label>
                <input
                  type="text"
                  value={customTld}
                  onChange={(e) => setCustomTld(e.target.value.toLowerCase())}
                  placeholder="e.g., xyz"
                  className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    customTld && !validateCustomTld(customTld) ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domain Length (1-63)
              </label>
              <input
                type="number"
                value={domainLength}
                onChange={(e) => setDomainLength(Math.max(1, Math.min(63, Number(e.target.value) || 1)))}
                min={1}
                max={63}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Size (1-100)
              </label>
              <input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                min={1}
                max={100}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Advanced Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Advanced Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Prefix:</label>
                <input
                  type="text"
                  value={options.prefix}
                  onChange={(e) => setOptions((prev) => ({ ...prev, prefix: e.target.value.toLowerCase() }))}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., www"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Output Separator:</label>
                <select
                  value={options.separator}
                  onChange={(e) => setOptions((prev) => ({ ...prev, separator: e.target.value }))}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="\n">Newline</option>
                  <option value=", ">Comma</option>
                  <option value=" ">Space</option>
                  <option value="; ">Semicolon</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeNumbers}
                  onChange={() => setOptions((prev) => ({ ...prev, includeNumbers: !prev.includeNumbers }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">Include Numbers</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeHyphens}
                  onChange={() => setOptions((prev) => ({ ...prev, includeHyphens: !prev.includeHyphens }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">Include Hyphens</label>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateBatch}
              disabled={tldType === "custom" && !validateCustomTld(customTld)}
              className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              Generate Batch
            </button>
            <button
              onClick={handleCopy}
              disabled={!domains.length}
              className="flex-1 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaCopy className="mr-2" />
              Copy
            </button>
            <button
              onClick={() => handleDownload("txt")}
              disabled={!domains.length}
              className="flex-1 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" />
              TXT
            </button>
            <button
              onClick={() => handleDownload("csv")}
              disabled={!domains.length}
              className="flex-1 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" />
              CSV
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaTrash className="mr-2" />
              Reset
            </button>
          </div>
        </div>

        {/* Output */}
        {domains.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 text-center">
              Generated Domains ({domains.length})
            </h3>
            <div className="mt-3 text-sm text-gray-700 font-mono whitespace-pre-wrap break-all max-h-64 overflow-y-auto">
              {domains.join(options.separator)}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            className={`mt-4 text-sm p-3 rounded-md ${
              error.includes("copied") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {error}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Batch History (Last 10)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2 max-h-64 overflow-y-auto">
              {history.map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    .{entry.tld} ({entry.domains.length}, {entry.length} chars) -{" "}
                    {entry.timestamp.toLocaleString()}
                  </span>
                  <button
                    onClick={() => loadFromHistory(entry)}
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
            <li>Predefined or custom TLDs</li>
            <li>Customizable domain length and batch size</li>
            <li>Include numbers, hyphens, and prefixes</li>
            <li>Copy or download as TXT/CSV with custom separators</li>
            <li>Track and restore previous batches</li>
          </ul>
        </div>
      </div>

      {/* Tailwind Animation */}
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
  );
};

export default RandomDomainGenerator;