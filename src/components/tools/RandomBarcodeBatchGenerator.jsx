"use client";

import React, { useState, useCallback } from "react";
import { faker } from "@faker-js/faker";
import { FaCopy, FaDownload, FaTrash, FaHistory, FaUndo } from "react-icons/fa";

const RandomBarcodeBatchGenerator = () => {
  const [barcodeType, setBarcodeType] = useState("ean13");
  const [batchSize, setBatchSize] = useState(10);
  const [customLength, setCustomLength] = useState(12);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [includeChecksum, setIncludeChecksum] = useState(true);
  const [barcodes, setBarcodes] = useState([]);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [showAlert, setShowAlert] = useState(false);

  // Generate a single barcode based on type
  const generateBarcode = useCallback(() => {
    try {
      let barcode;
      switch (barcodeType) {
        case "ean13":
          const eanBase = faker.string.numeric({ length: 12 });
          barcode = includeChecksum ? eanBase + calculateEan13Checksum(eanBase) : eanBase;
          break;
        case "ean8":
          const ean8Base = faker.string.numeric({ length: 7 });
          barcode = includeChecksum ? ean8Base + calculateEan8Checksum(ean8Base) : ean8Base;
          break;
        case "upc":
          const upcBase = faker.string.numeric({ length: 11 });
          barcode = includeChecksum ? upcBase + calculateUpcChecksum(upcBase) : upcBase;
          break;
        case "code39":
          barcode = faker.string.alphanumeric({ length: customLength, casing: "upper" })
            .replace(/[^A-Z0-9\-]/g, "");
          break;
        case "custom":
          barcode = faker.string.numeric({ length: customLength });
          break;
        default:
          throw new Error("Invalid barcode type");
      }
      return `${prefix}${barcode}${suffix}`;
    } catch (err) {
      throw new Error(`Barcode generation failed: ${err.message}`);
    }
  }, [barcodeType, customLength, includeChecksum, prefix, suffix]);

  // Checksum calculations
  const calculateEan13Checksum = (base) => {
    const digits = base.split("").map(Number);
    const sum = digits.reduce((acc, digit, i) => acc + (i % 2 === 0 ? digit : digit * 3), 0);
    return ((10 - (sum % 10)) % 10).toString();
  };

  const calculateEan8Checksum = (base) => {
    const digits = base.split("").map(Number);
    const sum = digits.reduce((acc, digit, i) => acc + (i % 2 === 0 ? digit * 3 : digit), 0);
    return ((10 - (sum % 10)) % 10).toString();
  };

  const calculateUpcChecksum = (base) => {
    const digits = base.split("").map(Number);
    const sum = digits.reduce((acc, digit, i) => acc + (i % 2 === 0 ? digit * 3 : digit), 0);
    return ((10 - (sum % 10)) % 10).toString();
  };

  // Generate a batch of barcodes
  const generateBatch = useCallback(() => {
    try {
      if (batchSize < 1 || batchSize > 1000) {
        setError("Batch size must be between 1 and 1000");
        return;
      }
      const newBarcodes = Array.from({ length: batchSize }, generateBarcode);
      setBarcodes(newBarcodes);
      setHistory((prev) => [
        { barcodes: newBarcodes, type: barcodeType, options: { batchSize, customLength, prefix, suffix, includeChecksum }, timestamp: new Date() },
        ...prev.slice(0, 4), // Limit to 5 batches
      ]);
      setError("");
    } catch (err) {
      setError(`Generation failed: ${err.message}`);
    }
  }, [batchSize, generateBarcode]);

  // Copy barcodes to clipboard
  const handleCopy = () => {
    if (barcodes.length > 0) {
      navigator.clipboard.writeText(barcodes.join("\n")).then(() => {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 2000);
      });
    }
  };

  // Download barcodes as a file
  const handleDownload = (format) => {
    if (barcodes.length > 0) {
      const content = format === "csv" ? "Barcode\n" + barcodes.join("\n") : barcodes.join("\n");
      const blob = new Blob([content], { type: format === "csv" ? "text/csv" : "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `barcodes_${barcodeType}_${Date.now()}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Reset
  const handleReset = () => {
    setBarcodes([]);
    setError("");
  };

  // Load from history
  const loadFromHistory = (entry) => {
    setBarcodes(entry.barcodes);
    setBarcodeType(entry.type);
    setBatchSize(entry.options.batchSize);
    setCustomLength(entry.options.customLength);
    setPrefix(entry.options.prefix);
    setSuffix(entry.options.suffix);
    setIncludeChecksum(entry.options.includeChecksum);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full ">
        {/* Alert Notification */}
        {showAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            Barcodes copied to clipboard!
          </div>
        )}

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Barcode Batch Generator
        </h2>

        {/* Controls */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Barcode Type
              </label>
              <select
                value={barcodeType}
                onChange={(e) => setBarcodeType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ean13">EAN-13 (13 digits)</option>
                <option value="ean8">EAN-8 (8 digits)</option>
                <option value="upc">UPC-A (12 digits)</option>
                <option value="code39">Code 39 (Alphanumeric)</option>
                <option value="custom">Custom (Numeric)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Size (1-1000)
              </label>
              <input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Advanced Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Advanced Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(barcodeType === "custom" || barcodeType === "code39") && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Custom Length (4-20):</label>
                  <input
                    type="number"
                    value={customLength}
                    onChange={(e) => setCustomLength(Math.max(4, Math.min(20, Number(e.target.value) || 4)))}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Prefix:</label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., PROD-"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Suffix:</label>
                <input
                  type="text"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., -2023"
                />
              </div>
              {(barcodeType === "ean13" || barcodeType === "ean8" || barcodeType === "upc") && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={includeChecksum}
                    onChange={() => setIncludeChecksum(!includeChecksum)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-600">Include Checksum</label>
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateBatch}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Generate Batch
            </button>
            <button
              onClick={handleCopy}
              disabled={barcodes.length === 0}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaCopy className="mr-2" />
              Copy
            </button>
            <button
              onClick={() => handleDownload("txt")}
              disabled={barcodes.length === 0}
              className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" />
              TXT
            </button>
            <button
              onClick={() => handleDownload("csv")}
              disabled={barcodes.length === 0}
              className="flex-1 py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" />
              CSV
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaTrash className="mr-2" />
              Reset
            </button>
          </div>
        </div>

        {/* Output */}
        {barcodes.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Generated Barcodes ({barcodes.length})
            </h3>
            <div className="w-full p-3 bg-white border border-gray-300 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              {barcodes.map((barcode, index) => (
                <div key={index} className="py-1 break-all">{barcode}</div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 text-sm p-3 bg-red-100 text-red-700 rounded-md text-center">
            {error}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Batches (Last 5)
            </h3>
            <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
              {history.map((entry, index) => (
                <div
                  key={index}
                  onClick={() => loadFromHistory(entry)}
                  className="p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {entry.type.toUpperCase()} Batch ({entry.barcodes.length}) - {entry.timestamp.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {entry.barcodes[0]}...
                    </p>
                  </div>
                  <button className="text-blue-500 hover:text-blue-700">
                    <FaUndo />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Generate EAN-13, EAN-8, UPC-A, Code 39, or custom barcodes</li>
            <li>Customizable batch size, length, prefix, and suffix</li>
            <li>Optional checksum for standard barcode types</li>
            <li>Download as TXT or CSV, copy to clipboard, and track history</li>
          </ul>
        </div>
      </div>

      {/* Tailwind Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }
      `}</style>
    </div>
  );
};

export default RandomBarcodeBatchGenerator;