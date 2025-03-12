"use client";

import React, { useState, useCallback } from "react";
import { FaSearch, FaCopy, FaDownload, FaHistory } from "react-icons/fa";

const WhoisLookup = () => {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [lookupOptions, setLookupOptions] = useState({
    includeRawData: false,
    checkDNS: false,
    checkAvailability: false,
  });

  // Simulated WHOIS lookup (replace with actual API call in production)
  const performWhoisLookup = useCallback(async (domainName) => {
    setLoading(true);
    setError("");
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Mock response
      const mockResult = {
        domainName: domainName,
        registered: true,
        registrar: "Example Registrar",
        created: "2020-01-15",
        expires: "2025-01-15",
        nameservers: ["ns1.example.com", "ns2.example.com"],
        rawData: lookupOptions.includeRawData ? "Domain Name: EXAMPLE.COM\nRegistry Domain ID: 123456789\n..." : null,
        dnsRecords: lookupOptions.checkDNS ? { A: "192.0.2.1", MX: "mail.example.com" } : null,
        available: lookupOptions.checkAvailability ? false : null,
      };

      setResult(mockResult);
      setHistory((prev) => [...prev, { domain: domainName, timestamp: new Date(), result: mockResult }].slice(-5));
    } catch (err) {
      setError("Failed to perform WHOIS lookup. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [lookupOptions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!domain.trim() || !/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(domain)) {
      setError("Please enter a valid domain name (e.g., example.com)");
      return;
    }
    performWhoisLookup(domain);
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      alert("Result copied to clipboard!");
    }
  };

  const handleDownload = () => {
    if (result) {
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${domain}-whois-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const clearForm = () => {
    setDomain("");
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Whois Lookup</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Domain Name
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value.trim().toLowerCase())}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="example.com"
              disabled={loading}
              aria-label="Domain Name"
            />
          </div>

          {/* Lookup Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Lookup Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(lookupOptions).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setLookupOptions((prev) => ({ ...prev, [key]: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <span className="text-sm text-gray-600">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className={`flex-1 py-3 px-4 rounded-lg text-white font-semibold transition-colors ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              } flex items-center justify-center`}
              disabled={loading}
            >
              <FaSearch className="mr-2" />
              {loading ? "Processing..." : "Lookup"}
            </button>
            <button
              type="button"
              onClick={clearForm}
              className="flex-1 py-3 px-4 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
            >
              Clear
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">WHOIS Results</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Domain:</strong> {result.domainName}</p>
              <p><strong>Registered:</strong> {result.registered ? "Yes" : "No"}</p>
              {result.registered && (
                <>
                  <p><strong>Registrar:</strong> {result.registrar}</p>
                  <p><strong>Created:</strong> {result.created}</p>
                  <p><strong>Expires:</strong> {result.expires}</p>
                  <p><strong>Nameservers:</strong> {result.nameservers.join(", ")}</p>
                </>
              )}
              {result.dnsRecords && (
                <div>
                  <strong>DNS Records:</strong>
                  <ul className="list-disc list-inside ml-4">
                    {Object.entries(result.dnsRecords).map(([type, value]) => (
                      <li key={type}>{type}: {value}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.available !== null && (
                <p><strong>Available:</strong> {result.available ? "Yes" : "No"}</p>
              )}
              {result.rawData && (
                <pre className="mt-2 p-2 bg-white rounded border text-xs overflow-auto max-h-40">
                  {result.rawData}
                </pre>
              )}
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaCopy className="mr-2" /> Copy
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <FaHistory className="mr-2" /> Recent Lookups (Last 5)
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{entry.domain} - {entry.timestamp.toLocaleTimeString()}</span>
                  <button
                    onClick={() => {
                      setDomain(entry.domain);
                      setResult(entry.result);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Reload
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Domain registration details lookup</li>
            <li>Optional raw WHOIS data</li>
            <li>DNS records checking</li>
            <li>Availability status</li>
            <li>Copy and download results</li>
            <li>History of recent lookups</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WhoisLookup;