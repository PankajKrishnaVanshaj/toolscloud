"use client";

import React, { useState, useCallback } from "react";
import { FaSync, FaDownload, FaHistory, FaCopy } from "react-icons/fa";

const SSLCertificateChecker = () => {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showRawCert, setShowRawCert] = useState(false);
  const [copied, setCopied] = useState(false);

  const checkSSLCertificate = useCallback(async (domainName) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setShowRawCert(false);

    try {
      // Using a placeholder API - replace with actual service or your own backend
      const response = await fetch(`https://api.ssl-cert-checker.com/v1/ssl-check?domain=${encodeURIComponent(domainName)}`, {
        method: "GET",
        headers: { "Accept": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const certData = {
        valid: data.valid,
        issuer: data.issuer,
        subject: data.subject,
        validFrom: new Date(data.validFrom).toLocaleString(),
        validTo: new Date(data.validTo).toLocaleString(),
        daysRemaining: data.daysRemaining,
        certificate: data.certificate,
        checkedAt: new Date().toLocaleString(),
      };

      setResult(certData);
      setHistory((prev) => [certData, ...prev.slice(0, 4)]); // Keep last 5 checks
    } catch (err) {
      setError(`Failed to fetch SSL certificate details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!domain.trim()) {
      setError("Please enter a domain name");
      return;
    }
    if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(domain)) {
      setError("Please enter a valid domain name (e.g., example.com)");
      return;
    }
    checkSSLCertificate(domain);
  };

  const handleReset = () => {
    setDomain("");
    setResult(null);
    setError(null);
    setShowRawCert(false);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${domain}-ssl-cert-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!result?.certificate) return;
    navigator.clipboard.writeText(result.certificate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">SSL Certificate Checker</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Domain Name</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="e.g., example.com"
              disabled={loading}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className={`flex-1 py-2 px-4 rounded-lg text-white transition-colors ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              } flex items-center justify-center`}
              disabled={loading}
            >
              {loading && <span className="animate-spin mr-2">⏳</span>}
              {loading ? "Checking..." : "Check SSL Certificate"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="space-y-6">
            <div className={`p-4 rounded-lg ${result.valid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} border`}>
              <h3 className="font-semibold text-gray-700">Status</h3>
              <p className={`text-lg ${result.valid ? "text-green-700" : "text-red-700"}`}>
                {result.valid ? "✓ Valid SSL Certificate" : "✗ Invalid SSL Certificate"}
              </p>
              <p className="text-sm text-gray-600 mt-1">Checked at: {result.checkedAt}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-3">Certificate Details</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li><strong>Issuer:</strong> {result.issuer}</li>
                <li><strong>Subject:</strong> {result.subject}</li>
                <li><strong>Valid From:</strong> {result.validFrom}</li>
                <li><strong>Valid To:</strong> {result.validTo}</li>
                <li><strong>Days Remaining:</strong> {result.daysRemaining} {result.daysRemaining < 30 && <span className="text-yellow-600">(Low)</span>}</li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowRawCert(!showRawCert)}
                className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                {showRawCert ? "Hide Raw Certificate" : "Show Raw Certificate"}
              </button>
              {showRawCert && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-700">Raw Certificate</h3>
                    <button
                      onClick={handleCopy}
                      className={`py-1 px-3 rounded-lg text-sm flex items-center ${copied ? "bg-green-600" : "bg-blue-600"} text-white hover:bg-opacity-90 transition-colors`}
                    >
                      <FaCopy className="mr-1" /> {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all max-h-64 overflow-auto">
                    {result.certificate}
                  </pre>
                </div>
              )}
            </div>

            <button
              onClick={handleDownload}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Certificate Info
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center mb-3">
              <FaHistory className="mr-2" /> Check History (Last 5)
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              {history.map((item, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {item.subject.split("=")[1]} - {item.valid ? "Valid" : "Invalid"} ({item.checkedAt})
                  </span>
                  <button
                    onClick={() => setResult(item)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    View
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes */}
        {!result && !error && !loading && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">About</h3>
            <p className="text-sm text-blue-600">
              Enter a domain name to check its SSL certificate status, validity dates, and details.
              This tool uses a third-party API and includes history tracking and download options.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SSLCertificateChecker;