"use client";
import React, { useState, useCallback } from "react";
import { FaSearch, FaSync, FaDownload } from "react-icons/fa";

// Replace with your WHOISXMLAPI key (optional)
const WHOIS_API_KEY = "YOUR_WHOISXMLAPI_KEY_HERE";

const DomainAvailabilityChecker = () => {
  const [domain, setDomain] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tlds, setTlds] = useState(["com", "org", "net"]); // Default TLDs
  const [customTld, setCustomTld] = useState("");
  const [history, setHistory] = useState([]);

  // Real domain checking using WHOIS API
  const checkDomainAvailability = useCallback(async (domainName) => {
    try {
      const url = WHOIS_API_KEY
        ? `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${WHOIS_API_KEY}&domainName=${domainName}&outputFormat=JSON`
        : `https://api.whoisjs.com/whois/${domainName}`; // Fallback (requires CORS proxy or server-side handling)

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();

      // WHOISXMLAPI response parsing
      if (WHOIS_API_KEY) {
        const available = !data.WhoisRecord?.registryData?.createdDate; // If no creation date, assume available
        return {
          domain: domainName,
          available: available || false,
          checkedAt: new Date().toLocaleString(),
        };
      } 
      // Fallback parsing (whoisjs or similar)
      else {
        const available = data.available || !data.registered; // Adjust based on API response
        return {
          domain: domainName,
          available: available || false,
          checkedAt: new Date().toLocaleString(),
        };
      }
    } catch (err) {
      return {
        domain: domainName,
        available: null, // Indicates error
        error: `Failed to check ${domainName}: ${err.message}`,
        checkedAt: new Date().toLocaleString(),
      };
    }
  }, []);

  const checkDomain = async (e) => {
    e.preventDefault();
    if (!domain) {
      setError("Please enter a domain name");
      return;
    }

    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]$/;
    if (!domainRegex.test(domain.split(".")[0])) {
      setError("Please enter a valid domain name (e.g., example)");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const domainsToCheck = tlds.map((tld) => `${domain}.${tld}`);
      const checkPromises = domainsToCheck.map((fullDomain) =>
        checkDomainAvailability(fullDomain)
      );
      const resultsData = await Promise.all(checkPromises);

      setResults(resultsData);
      setHistory((prev) => [
        ...prev,
        { domain, tlds: [...tlds], results: resultsData, timestamp: Date.now() },
      ].slice(-10)); // Keep last 10 searches
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Add custom TLD
  const addCustomTld = () => {
    if (customTld && !tlds.includes(customTld) && /^[a-zA-Z]{2,}$/.test(customTld)) {
      setTlds((prev) => [...prev, customTld.toLowerCase()]);
      setCustomTld("");
    } else {
      setError("Invalid or duplicate TLD");
    }
  };

  // Remove TLD
  const removeTld = (tld) => {
    setTlds((prev) => prev.filter((t) => t !== tld));
  };

  // Reset form
  const reset = () => {
    setDomain("");
    setResults([]);
    setError("");
    setTlds(["com", "org", "net"]);
    setCustomTld("");
  };

  // Download results as text
  const downloadResults = () => {
    if (results.length) {
      const text = results
        .map((r) =>
          r.available === null
            ? `${r.domain}: Error (${r.error})`
            : `${r.domain}: ${r.available ? "Available" : "Taken"} (Checked: ${r.checkedAt})`
        )
        .join("\n");
      const blob = new Blob([text], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `domain-check-${Date.now()}.txt`;
      link.click();
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
    <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
        Domain Availability Checker
      </h1>

        {/* Form */}
        <form onSubmit={checkDomain} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="domain"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Domain Name
              </label>
              <input
                type="text"
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value.toLowerCase())}
                placeholder="example"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                TLDs to Check
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tlds.map((tld) => (
                  <span
                    key={tld}
                    className="flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm"
                  >
                    .{tld}
                    <button
                      onClick={() => removeTld(tld)}
                      className="ml-1 text-red-500 hover:text-red-700"
                      disabled={loading}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTld}
                  onChange={(e) => setCustomTld(e.target.value.toLowerCase())}
                  placeholder="Add TLD (e.g., io)"
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={addCustomTld}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  disabled={loading}
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaSearch className="mr-2" />
              {loading ? "Checking..." : "Check Domains"}
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={loading}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              type="button"
              onClick={downloadResults}
              disabled={!results.length || loading}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Results
            </button>
          </div>
        </form>

        {/* Error */}
        {error && <p className="text-sm text-red-600 text-center mt-4">{error}</p>}

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Results</h2>
            <ul className="space-y-2">
              {results.map((result, index) => (
                <li
                  key={index}
                  className={`p-2 rounded-md ${
                    result.available === null
                      ? "bg-yellow-100"
                      : result.available
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  <span className="font-medium">{result.domain}:</span>{" "}
                  <span
                    className={
                      result.available === null
                        ? "text-yellow-600"
                        : result.available
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {result.available === null
                      ? "Error"
                      : result.available
                      ? "Available"
                      : "Taken"}
                  </span>{" "}
                  {result.error && (
                    <span className="text-sm text-gray-500">({result.error})</span>
                  )}
                  <span className="text-sm text-gray-500">
                    {" "}
                    (Checked: {result.checkedAt})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Search History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Search History</h2>
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {history
                .slice()
                .reverse()
                .map((entry, index) => (
                  <li key={index} className="text-sm text-blue-600">
                    Checked "{entry.domain}" with TLDs [{entry.tlds.join(", ")}] at{" "}
                    {new Date(entry.timestamp).toLocaleString()}
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Check multiple TLDs simultaneously</li>
            <li>Custom TLD support</li>
            <li>Download results as text file</li>
            <li>Search history tracking</li>
            <li>Real-time validation and feedback</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DomainAvailabilityChecker;