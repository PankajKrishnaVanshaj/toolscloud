"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo, FaDice } from "react-icons/fa";

const IPAddressGenerator = () => {
  const [ipAddresses, setIpAddresses] = useState([]);
  const [count, setCount] = useState(10);
  const [ipVersion, setIpVersion] = useState("ipv4"); // ipv4, ipv6
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    includeCidr: false,       // Add CIDR notation (e.g., /24)
    cidrRange: 24,           // CIDR range for IPv4 (0-32), IPv6 (0-128)
    filter: "any",           // any, private, public (IPv4 only)
    separator: "\n",         // Output separator
  });

  // Generate IPv4 with optional private/public filtering
  const generateIPv4 = () => {
    const getOctet = () => Math.floor(Math.random() * 256);
    let ip;
    if (options.filter === "private") {
      const privateRanges = [
        [10, 0, 0, 0],           // 10.0.0.0 - 10.255.255.255
        [172, 16, 0, 0, 31],     // 172.16.0.0 - 172.31.255.255
        [192, 168, 0, 0],        // 192.168.0.0 - 192.168.255.255
      ];
      const range = privateRanges[Math.floor(Math.random() * privateRanges.length)];
      ip = [
        range[0],
        range[1] + (range[4] ? Math.floor(Math.random() * (range[4] - range[1] + 1)) : getOctet()),
        getOctet(),
        getOctet(),
      ];
    } else if (options.filter === "public") {
      do {
        ip = [getOctet(), getOctet(), getOctet(), getOctet()];
      } while (
        (ip[0] === 10) ||
        (ip[0] === 172 && ip[1] >= 16 && ip[1] <= 31) ||
        (ip[0] === 192 && ip[1] === 168)
      );
    } else {
      ip = [getOctet(), getOctet(), getOctet(), getOctet()];
    }
    return options.includeCidr ? `${ip.join(".")}/${options.cidrRange}` : ip.join(".");
  };

  // Generate IPv6
  const generateIPv6 = () => {
    const segments = Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * 65536).toString(16).padStart(4, "0")
    );
    return options.includeCidr ? `${segments.join(":")}/${options.cidrRange}` : segments.join(":");
  };

  const generateIPAddresses = useCallback(() => {
    const newIpAddresses = Array.from(
      { length: Math.min(count, 1000) },
      () => (ipVersion === "ipv4" ? generateIPv4() : generateIPv6())
    );
    setIpAddresses(newIpAddresses);
    setIsCopied(false);
    setHistory((prev) => [
      ...prev,
      { ips: newIpAddresses, count, ipVersion, options },
    ].slice(-5));
  }, [count, ipVersion, options]);

  const copyToClipboard = () => {
    const text = ipAddresses.join(options.separator);
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const downloadAsText = () => {
    const text = ipAddresses.join(options.separator);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ip-addresses-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearIPs = () => {
    setIpAddresses([]);
    setIsCopied(false);
  };

  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({
      ...prev,
      [key]: key === "cidrRange" ? Math.max(0, Math.min(ipVersion === "ipv4" ? 32 : 128, Number(value))) : value,
    }));
  };

  const restoreFromHistory = (entry) => {
    setIpAddresses(entry.ips);
    setCount(entry.count);
    setIpVersion(entry.ipVersion);
    setOptions(entry.options);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced IP Address Generator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of IPs (1-1000)
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
                IP Version
              </label>
              <select
                value={ipVersion}
                onChange={(e) => setIpVersion(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ipv4">IPv4 (e.g., 192.168.1.1)</option>
                <option value="ipv6">IPv6 (e.g., 2001:0db8:...)</option>
              </select>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Advanced Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeCidr}
                  onChange={() => handleOptionChange("includeCidr", !options.includeCidr)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">Include CIDR</label>
              </div>
              {options.includeCidr && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    CIDR Range (0-{ipVersion === "ipv4" ? 32 : 128})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={ipVersion === "ipv4" ? 32 : 128}
                    value={options.cidrRange}
                    onChange={(e) => handleOptionChange("cidrRange", e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              {ipVersion === "ipv4" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Filter:</label>
                  <select
                    value={options.filter}
                    onChange={(e) => handleOptionChange("filter", e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="any">Any</option>
                    <option value="private">Private Only</option>
                    <option value="public">Public Only</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Output Separator:</label>
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
              onClick={generateIPAddresses}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaDice className="mr-2" />
              Generate IPs
            </button>
            {ipAddresses.length > 0 && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md text-white transition-colors font-medium flex items-center justify-center ${
                    isCopied ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
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
                  onClick={clearIPs}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>

          {/* Output */}
          {ipAddresses.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Generated IP Addresses ({ipAddresses.length}):
              </h2>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto whitespace-pre-wrap font-mono text-gray-800">
                {ipAddresses.join(options.separator)}
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
                      {entry.ips.length} {entry.ipVersion.toUpperCase()} IPs
                      {entry.options.includeCidr ? ` (/ ${entry.options.cidrRange})` : ""}
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
              <li>Generate IPv4 or IPv6 addresses</li>
              <li>Optional CIDR notation with custom range</li>
              <li>Filter IPv4 by private or public ranges</li>
              <li>Custom output separators</li>
              <li>Copy, download, and track history</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IPAddressGenerator;