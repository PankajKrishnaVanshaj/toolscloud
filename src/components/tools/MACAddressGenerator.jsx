"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo, FaDice } from "react-icons/fa";

const MACAddressGenerator = () => {
  const [macAddresses, setMacAddresses] = useState([]);
  const [count, setCount] = useState(10);
  const [separator, setSeparator] = useState(":"); // :, -, .
  const [caseFormat, setCaseFormat] = useState("lower"); // lower, upper
  const [ouiPrefix, setOuiPrefix] = useState(""); // Vendor OUI or random
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);

  // Sample OUI prefixes (vendor-specific MAC prefixes)
  const ouiOptions = [
    { value: "", label: "Random" },
    { value: "00:50:56", label: "VMware (00:50:56)" },
    { value: "00:0C:29", label: "VMware (00:0C:29)" },
    { value: "00:1A:11", label: "Apple (00:1A:11)" },
    { value: "00:14:22", label: "Dell (00:14:22)" },
    { value: "00:25:00", label: "Cisco (00:25:00)" },
  ];

  const generateMACAddress = useCallback(() => {
    let bytes;
    if (ouiPrefix) {
      const ouiBytes = ouiPrefix.split(separator);
      bytes = [
        ...ouiBytes,
        ...Array.from({ length: 3 }, () =>
          Math.floor(Math.random() * 256).toString(16).padStart(2, "0")
        ),
      ];
    } else {
      bytes = Array.from({ length: 6 }, () =>
        Math.floor(Math.random() * 256).toString(16).padStart(2, "0")
      );
    }
    const mac = bytes.join(separator);
    return caseFormat === "upper" ? mac.toUpperCase() : mac.toLowerCase();
  }, [separator, caseFormat, ouiPrefix]);

  const generateMACAddresses = useCallback(() => {
    const newMacAddresses = Array.from(
      { length: Math.min(count, 1000) },
      generateMACAddress
    );
    setMacAddresses(newMacAddresses);
    setIsCopied(false);
    setHistory((prev) => [
      ...prev,
      { macs: newMacAddresses, count, separator, caseFormat, ouiPrefix },
    ].slice(-5));
  }, [count, separator, caseFormat, ouiPrefix, generateMACAddress]);

  const copyToClipboard = () => {
    const text = macAddresses.join("\n");
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const downloadAsText = () => {
    const text = macAddresses.join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mac-addresses-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearMACs = () => {
    setMacAddresses([]);
    setIsCopied(false);
  };

  const restoreFromHistory = (entry) => {
    setMacAddresses(entry.macs);
    setCount(entry.count);
    setSeparator(entry.separator);
    setCaseFormat(entry.caseFormat);
    setOuiPrefix(entry.ouiPrefix);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced MAC Address Generator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of MAC Addresses (1-1000)
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={count}
                onChange={(e) =>
                  setCount(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Separator
              </label>
              <select
                value={separator}
                onChange={(e) => setSeparator(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value=":">Colon (:)</option>
                <option value="-">Hyphen (-)</option>
                <option value=".">Dot (.)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case Format
              </label>
              <select
                value={caseFormat}
                onChange={(e) => setCaseFormat(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="lower">Lowercase (e.g., ab:cd:ef:12:34:56)</option>
                <option value="upper">Uppercase (e.g., AB:CD:EF:12:34:56)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OUI Prefix (Vendor)
              </label>
              <select
                value={ouiPrefix}
                onChange={(e) => setOuiPrefix(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ouiOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateMACAddresses}
              className="flex-1 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center"
            >
              <FaDice className="mr-2" />
              Generate MACs
            </button>
            {macAddresses.length > 0 && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-3 rounded-md text-white transition-colors font-semibold flex items-center justify-center ${
                    isCopied
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-600 hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" />
                  {isCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={downloadAsText}
                  className="flex-1 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-semibold flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
                <button
                  onClick={clearMACs}
                  className="flex-1 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-semibold flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>

          {/* Output Display */}
          {macAddresses.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 text-center">
                Generated MAC Addresses ({macAddresses.length}):
              </h2>
              <div className="mt-3 bg-gray-50 p-4 rounded-md border border-gray-200 max-h-64 overflow-y-auto font-mono text-sm text-gray-700">
                <ul className="list-decimal list-inside">
                  {macAddresses.map((mac, index) => (
                    <li key={index} className="py-1">{mac}</li>
                  ))}
                </ul>
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
                      {entry.macs.length} MACs ({entry.count}, {entry.separator}, {entry.caseFormat})
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
              <li>Generate 1-1000 random MAC addresses</li>
              <li>Custom separators (colon, hyphen, dot)</li>
              <li>Uppercase or lowercase formatting</li>
              <li>Optional vendor OUI prefix</li>
              <li>Copy, download, and track history</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MACAddressGenerator;