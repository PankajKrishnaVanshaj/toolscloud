"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaSync, FaHistory } from "react-icons/fa";

const RandomIPGenerator = () => {
  const [ipType, setIpType] = useState("ipv4");
  const [quantity, setQuantity] = useState(1);
  const [generatedIPs, setGeneratedIPs] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    excludeReserved: false,
    format: "plain", // plain, cidr, hex (for IPv6)
  });

  const generateIPv4 = useCallback(() => {
    const reservedRanges = [
      [0, 0, 0, 0], // 0.0.0.0
      [10, 0, 0, 0], // Private
      [127, 0, 0, 0], // Loopback
      [169, 254, 0, 0], // Link-local
      [192, 168, 0, 0], // Private
    ];

    let octets;
    do {
      octets = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256));
    } while (
      options.excludeReserved &&
      reservedRanges.some(range =>
        range.every((val, idx) => val === octets[idx] || val === 0)
      )
    );

    return options.format === "cidr" ? `${octets.join(".")}/32` : octets.join(".");
  }, [options]);

  const generateIPv6 = useCallback(() => {
    const segments = Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * 65536).toString(16).padStart(4, "0")
    );
    let ip = segments.join(":");
    if (options.excludeReserved) {
      // Avoid reserved ranges like ::/128 or fe80::/10
      while (ip === "0000:0000:0000:0000:0000:0000:0000:0000" || ip.startsWith("fe80")) {
        ip = Array.from({ length: 8 }, () =>
          Math.floor(Math.random() * 65536).toString(16).padStart(4, "0")
        ).join(":");
      }
    }
    if (options.format === "cidr") return `${ip}/128`;
    if (options.format === "hex") return ip.replace(/:/g, "");
    return ip;
  }, [options]);

  const generateIPs = useCallback(() => {
    const generator = ipType === "ipv4" ? generateIPv4 : generateIPv6;
    const newIPs = Array.from({ length: Math.min(quantity, 1000) }, generator);
    setGeneratedIPs(newIPs);
    setHistory(prev => [...prev, { type: ipType, ips: newIPs, timestamp: new Date() }].slice(-5));
    setCopiedIndex(null);
  }, [ipType, quantity, generateIPv4, generateIPv6]);

  const handleCopy = (ip, index) => {
    navigator.clipboard.writeText(ip);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(generatedIPs.join("\n"));
    setCopiedIndex(-1);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedIPs.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ips-${ipType}-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setGeneratedIPs([]);
    setQuantity(1);
    setCopiedIndex(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateIPs();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Random IP Generator</h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IP Type</label>
              <select
                value={ipType}
                onChange={(e) => setIpType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="ipv4">IPv4</option>
                <option value="ipv6">IPv6</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (1-1000)</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Options</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.excludeReserved}
                  onChange={(e) => setOptions(prev => ({ ...prev, excludeReserved: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Exclude Reserved Ranges</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                <select
                  value={options.format}
                  onChange={(e) => setOptions(prev => ({ ...prev, format: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="plain">Plain</option>
                  <option value="cidr">CIDR Notation</option>
                  {ipType === "ipv6" && <option value="hex">Hexadecimal</option>}
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate IPs
          </button>
        </form>

        {/* Generated IPs */}
        {generatedIPs.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-700">
                Generated {ipType.toUpperCase()} Addresses ({generatedIPs.length})
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyAll}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors flex items-center"
                >
                  <FaCopy className="mr-1" /> {copiedIndex === -1 ? "Copied!" : "Copy All"}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
                >
                  <FaDownload className="mr-1" /> Download
                </button>
                <button
                  onClick={handleReset}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center"
                >
                  <FaSync className="mr-1" /> Reset
                </button>
              </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {generatedIPs.map((ip, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <span className="font-mono text-sm text-gray-800 break-all flex-1">
                    {ip}
                  </span>
                  <button
                    onClick={() => handleCopy(ip, index)}
                    className={`ml-2 px-2 py-1 text-sm rounded transition-colors ${
                      copiedIndex === index
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {copiedIndex === index ? "Copied!" : "Copy"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center mb-3">
              <FaHistory className="mr-2" /> Generation History (Last 5)
            </h3>
            <div className="space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <div key={index} className="text-sm text-gray-600">
                  <span>
                    {entry.type.toUpperCase()} ({entry.ips.length} IPs) -{" "}
                    {entry.timestamp.toLocaleTimeString()} on{" "}
                    {entry.timestamp.toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => setGeneratedIPs(entry.ips)}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Generate IPv4 and IPv6 addresses</li>
            <li>Up to 1000 IPs at once</li>
            <li>Exclude reserved IP ranges</li>
            <li>Multiple format options (Plain, CIDR, Hex for IPv6)</li>
            <li>Copy individual IPs or all at once</li>
            <li>Download as text file</li>
            <li>History tracking with restore capability</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RandomIPGenerator;