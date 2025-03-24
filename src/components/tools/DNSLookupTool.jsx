"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaSync, FaDownload } from "react-icons/fa";

const DNSLookupTool = () => {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [recordType, setRecordType] = useState("A");
  const [copied, setCopied] = useState(false);

  const RECORD_TYPES = ["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA"];

  // Fetch DNS records using a public API (e.g., Google DNS)
  const fetchDNSRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${recordType}`
      );
      const data = await response.json();

      if (data.Status !== 0) {
        throw new Error(`DNS lookup failed: ${data.Comment || "Unknown error"}`);
      }

      setResults(data.Answer || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [domain, recordType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!domain.trim()) {
      setError("Please enter a valid domain name");
      return;
    }
    fetchDNSRecords();
  };

  const handleReset = () => {
    setDomain("");
    setResults(null);
    setError(null);
    setCopied(false);
  };

  const handleCopy = () => {
    if (results) {
      const text = JSON.stringify(results, null, 2);
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (results) {
      const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${domain}-${recordType}-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">DNS Lookup Tool</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Domain Name
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="example.com"
                disabled={loading}
                aria-label="Domain Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Record Type
              </label>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                disabled={loading}
              >
                {RECORD_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className={`flex-1 py-3 px-4 rounded-lg text-white transition-colors ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              } flex items-center justify-center`}
              disabled={loading}
            >
              {loading ? (
                <span className="animate-spin mr-2">⏳</span>
              ) : null}
              {loading ? "Processing..." : "Lookup DNS"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg text-center border border-red-200">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">DNS Records ({recordType})</h3>
            {results.length === 0 ? (
              <p className="text-sm text-gray-600">No {recordType} records found for {domain}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">TTL</th>
                      <th className="p-2">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((record, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{record.name}</td>
                        <td className="p-2">{record.type}</td>
                        <td className="p-2">{record.TTL}</td>
                        <td className="p-2 break-all">{record.data}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={handleCopy}
                className={`flex-1 py-2 px-4 rounded-lg text-white transition-colors ${
                  copied ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
                } flex items-center justify-center`}
              >
                <FaCopy className="mr-2" /> {copied ? "Copied!" : "Copy Results"}
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download JSON
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
            <p className="text-sm text-gray-600">Fetching DNS records for {domain}...</p>
          </div>
        )}

        {/* Features List */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports multiple DNS record types (A, AAAA, MX, NS, TXT, CNAME, SOA)</li>
            <li>Real-time lookup using Google DNS API</li>
            <li>Copy results to clipboard</li>
            <li>Download results as JSON</li>
            <li>Responsive table display</li>
            <li>Error handling and validation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DNSLookupTool;