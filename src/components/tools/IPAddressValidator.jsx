"use client";

import React, { useState, useCallback } from "react";
import { FaSync, FaCopy, FaInfoCircle } from "react-icons/fa";

const IPAddressValidator = () => {
  const [ipAddress, setIpAddress] = useState("");
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const validateIPv4 = useCallback((ip) => {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipv4Regex.test(ip)) return { isValid: false };

    const octets = ip.split(".").map(Number);
    const isPrivate =
      (octets[0] === 10) ||
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
      (octets[0] === 192 && octets[1] === 168);
    const isReserved =
      (octets[0] === 0) ||
      (octets[0] === 127) ||
      (octets[0] >= 224 && octets[0] <= 255);
    const isLoopback = octets[0] === 127;
    const isBroadcast = octets.every(octet => octet === 255);

    return {
      isValid: true,
      type: "IPv4",
      isPrivate,
      isReserved,
      isLoopback,
      isBroadcast,
      binary: octets.map(o => o.toString(2).padStart(8, "0")).join("."),
    };
  }, []);

  const validateIPv6 = useCallback((ip) => {
    const ipv6Regex = /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$|^::([0-9a-fA-F]{0,4}:){0,6}[0-9a-fA-F]{0,4}$|^([0-9a-fA-F]{0,4}:){1,6}:([0-9a-fA-F]{0,4}:){0,5}[0-9a-fA-F]{0,4}$/;
    if (!ipv6Regex.test(ip)) return { isValid: false };

    const segments = ip.split(":");
    const isLinkLocal = segments[0] === "fe80";
    const isMulticast = segments[0] === "ff00";

    return {
      isValid: true,
      type: "IPv6",
      isPrivate: isLinkLocal,
      isReserved: isMulticast,
      expanded: ip.replace(/::/, ":".repeat(8 - segments.length + 1).replace(/:/g, "0000:")),
    };
  }, []);

  const validateIP = (ip) => {
    setError(null);
    setValidationResult(null);
    setCopied(false);

    if (!ip.trim()) {
      setError("Please enter an IP address");
      return;
    }

    const trimmedIp = ip.trim();
    const ipv4Result = validateIPv4(trimmedIp);
    const ipv6Result = validateIPv6(trimmedIp);

    if (ipv4Result.isValid) {
      setValidationResult(ipv4Result);
      setHistory(prev => [...prev, { ip: trimmedIp, result: ipv4Result }].slice(-5));
    } else if (ipv6Result.isValid) {
      setValidationResult(ipv6Result);
      setHistory(prev => [...prev, { ip: trimmedIp, result: ipv6Result }].slice(-5));
    } else {
      setValidationResult({ isValid: false, type: "Unknown", message: "Invalid IP address format" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    validateIP(ipAddress);
  };

  const handleReset = () => {
    setIpAddress("");
    setValidationResult(null);
    setError(null);
    setShowDetails(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(ipAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">IP Address Validator</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 192.168.1.1 or 2001:0db8:85a3::8a2e:0370:7334"
              aria-label="IP Address Input"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!ipAddress.trim()}
            >
              Validate
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className={`flex-1 py-2 px-4 ${copied ? "bg-green-600" : "bg-gray-600"} text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center`}
              disabled={!ipAddress.trim()}
            >
              <FaCopy className="mr-2" /> {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Validation Result */}
        {validationResult && (
          <div className="space-y-6">
            <div className={`p-4 rounded-lg ${validationResult.isValid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} border`}>
              <h3 className="font-semibold text-gray-700 mb-2">Validation Result</h3>
              <p className={`text-lg ${validationResult.isValid ? "text-green-700" : "text-red-700"}`}>
                {validationResult.isValid ? "✓ Valid IP Address" : "✗ Invalid IP Address"}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Type: <span className="font-mono">{validationResult.type}</span>
              </p>
              {validationResult.message && (
                <p className="text-sm text-red-600 mt-1">{validationResult.message}</p>
              )}
              {validationResult.isValid && (
                <>
                  <p className="text-sm text-gray-600 mt-1">
                    Private: <span className="font-mono">{validationResult.isPrivate ? "Yes" : "No"}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Reserved: <span className="font-mono">{validationResult.isReserved ? "Yes" : "No"}</span>
                  </p>
                  {validationResult.type === "IPv4" && (
                    <>
                      <p className="text-sm text-gray-600 mt-1">
                        Loopback: <span className="font-mono">{validationResult.isLoopback ? "Yes" : "No"}</span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Broadcast: <span className="font-mono">{validationResult.isBroadcast ? "Yes" : "No"}</span>
                      </p>
                    </>
                  )}
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <FaInfoCircle className="mr-1" /> {showDetails ? "Hide Details" : "Show Details"}
                  </button>
                </>
              )}
            </div>

            {/* Detailed View */}
            {showDetails && validationResult.isValid && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">Technical Details</h3>
                {validationResult.type === "IPv4" && (
                  <p className="text-sm text-gray-600">Binary: <span className="font-mono">{validationResult.binary}</span></p>
                )}
                {validationResult.type === "IPv6" && (
                  <p className="text-sm text-gray-600">Expanded: <span className="font-mono">{validationResult.expanded}</span></p>
                )}
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div className="p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Recent Validations (Last 5)</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  {history.slice().reverse().map((entry, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span className="font-mono">{entry.ip}</span>
                      <span className={entry.result.isValid ? "text-green-600" : "text-red-600"}>
                        {entry.result.isValid ? "Valid" : "Invalid"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Notes */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-700 mb-2">Validation Rules</h3>
              <ul className="text-sm text-blue-600 list-disc pl-5 space-y-1">
                <li>IPv4: 0.0.0.0 - 255.255.255.255</li>
                <li>IPv6: Full and compressed formats supported</li>
                <li>Private IPv4: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16</li>
                <li>Reserved IPv4: 0.0.0.0, 127.0.0.0, 224.0.0.0-255.255.255.255</li>
                <li>IPv6 Link-Local: fe80::/10, Multicast: ff00::/8</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IPAddressValidator;