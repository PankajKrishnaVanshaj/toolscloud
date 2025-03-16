"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync, FaDownload } from "react-icons/fa";

const SecureEmailHeaderAnalyzer = () => {
  const [headerInput, setHeaderInput] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [detailedView, setDetailedView] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Enhanced header parsing and analysis
  const analyzeHeaders = useCallback(() => {
    setError("");
    setResults(null);
    setIsAnalyzing(true);

    if (!headerInput.trim()) {
      setError("Please paste email headers to analyze");
      setIsAnalyzing(false);
      return;
    }

    // Parse headers
    const lines = headerInput.split("\n");
    const headers = {};
    let lastKey = "";
    lines.forEach((line) => {
      if (line.match(/^\s+/)) {
        if (lastKey && headers[lastKey]) {
          headers[lastKey] += " " + line.trim();
        }
      } else {
        const match = line.match(/^([^:]+):\s*(.+)$/i);
        if (match) {
          lastKey = match[1].toLowerCase();
          headers[lastKey] = match[2].trim();
        }
      }
    });

    // Comprehensive analysis
    const analysis = {
      from: headers["from"] || "Not present",
      returnPath: headers["return-path"] || "Not present",
      received: Object.keys(headers)
        .filter((key) => key === "received")
        .map((key) => headers[key]),
      date: headers["date"] || "Not present",
      spf: { present: false, result: "Not present", details: "" },
      dkim: { present: false, result: "Not present", details: "", signatures: [] },
      dmarc: { present: false, result: "Not present", details: "" },
      encryption: { tls: false, details: "" },
      potentialIssues: [],
      additionalHeaders: {}
    };

    // Store additional headers
    Object.keys(headers).forEach((key) => {
      if (!["from", "return-path", "received", "date", "received-spf", "dkim-signature", "authentication-results"].includes(key)) {
        analysis.additionalHeaders[key] = headers[key];
      }
    });

    // Received Headers Analysis
    if (analysis.received.length > 0) {
      analysis.received.forEach((received) => {
        if (/encrypted/i.test(received) || /tls/i.test(received)) {
          analysis.encryption.tls = true;
          analysis.encryption.details = received;
        }
      });
    }

    // SPF Analysis
    if (headers["received-spf"]) {
      analysis.spf.present = true;
      const spfParts = headers["received-spf"].split(";").map((part) => part.trim());
      analysis.spf.result = spfParts[0] || "Unknown";
      analysis.spf.details = spfParts.slice(1).join("; ");
      if (analysis.spf.result.toLowerCase() !== "pass") {
        analysis.potentialIssues.push({
          issue: "SPF Failure",
          severity: "High",
          details: `SPF check returned "${analysis.spf.result}"`
        });
      }
    }

    // DKIM Analysis
    if (headers["dkim-signature"]) {
      analysis.dkim.present = true;
      analysis.dkim.signatures = [headers["dkim-signature"]];
      analysis.dkim.result = "Present";
      analysis.dkim.details = headers["dkim-signature"];
      if (headers["authentication-results"]) {
        if (/dkim=pass/i.test(headers["authentication-results"])) {
          analysis.dkim.result = "Pass";
        } else if (/dkim=fail/i.test(headers["authentication-results"])) {
          analysis.dkim.result = "Fail";
          analysis.potentialIssues.push({
            issue: "DKIM Verification Failed",
            severity: "Medium",
            details: "DKIM signature did not pass verification"
          });
        }
      }
    }

    // DMARC Analysis
    if (headers["authentication-results"]) {
      const authResults = headers["authentication-results"].toLowerCase();
      if (/dmarc=/.test(authResults)) {
        analysis.dmarc.present = true;
        const dmarcMatch = authResults.match(/dmarc=(\w+)/);
        analysis.dmarc.result = dmarcMatch ? dmarcMatch[1] : "Unknown";
        analysis.dmarc.details = headers["authentication-results"];
        if (analysis.dmarc.result !== "pass") {
          analysis.potentialIssues.push({
            issue: "DMARC Failure",
            severity: "High",
            details: `DMARC check returned "${analysis.dmarc.result}"`
          });
        }
      }
    }

    // Additional Security Checks
    if (headers["from"] && headers["return-path"] && !headers["from"].includes(headers["return-path"].split("@")[1])) {
      analysis.potentialIssues.push({
        issue: "From/Return-Path Domain Mismatch",
        severity: "Medium",
        details: "Potential spoofing indicator: From and Return-Path domains differ"
      });
    }

    if (!analysis.spf.present && !analysis.dkim.present) {
      analysis.potentialIssues.push({
        issue: "No Email Authentication",
        severity: "High",
        details: "Neither SPF nor DKIM headers found, increasing spoofing risk"
      });
    }

    if (!analysis.encryption.tls) {
      analysis.potentialIssues.push({
        issue: "No TLS Encryption",
        severity: "Medium",
        details: "No evidence of TLS encryption in Received headers"
      });
    }

    setResults(analysis);
    setIsAnalyzing(false);
  }, [headerInput]);

  // Copy results to clipboard
  const copyToClipboard = () => {
    if (results) {
      const text = JSON.stringify(results, null, 2);
      navigator.clipboard.writeText(text);
    }
  };

  // Download results as JSON
  const downloadResults = () => {
    if (results) {
      const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `email-header-analysis-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Clear all
  const clearAll = () => {
    setHeaderInput("");
    setResults(null);
    setError("");
    setDetailedView(false);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Secure Email Header Analyzer
        </h1>

        {/* Header Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Headers
          </label>
          <textarea
            value={headerInput}
            onChange={(e) => setHeaderInput(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 h-40 font-mono text-sm resize-y"
            placeholder="Paste full email headers here (e.g., from 'View Source' or 'Show Original')"
            disabled={isAnalyzing}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter headers from your email client to analyze security features
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={analyzeHeaders}
            disabled={isAnalyzing}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isAnalyzing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            ) : null}
            {isAnalyzing ? "Analyzing..." : "Analyze Headers"}
          </button>
          <button
            onClick={clearAll}
            disabled={isAnalyzing}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Clear
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Analysis Results */}
        {results && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Analysis Results</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setDetailedView(!detailedView)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  {detailedView ? "Simple View" : "Detailed View"}
                </button>
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <FaCopy className="mr-2" /> Copy
                </button>
                <button
                  onClick={downloadResults}
                  className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
              {/* Basic Info */}
              {["from", "returnPath", "date"].map((key) => (
                <div key={key}>
                  <p className="text-sm font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                  <p className="text-sm text-gray-600">{results[key]}</p>
                </div>
              ))}

              {/* Received Headers */}
              {results.received.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Received Headers ({results.received.length})</p>
                  {detailedView ? (
                    <ul className="list-disc pl-5 text-sm text-gray-600 max-h-40 overflow-y-auto">
                      {results.received.map((header, index) => (
                        <li key={index} className="truncate">{header}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-600">{results.received[0].substring(0, 50)}... ({results.received.length} total)</p>
                  )}
                </div>
              )}

              {/* Security Checks */}
              {["spf", "dkim", "dmarc", "encryption"].map((key) => (
                <div key={key}>
                  <p className="text-sm font-medium text-gray-700 capitalize">{key}</p>
                  <p
                    className={`text-sm ${
                      results[key].result === "Pass" || results[key].tls
                        ? "text-green-600"
                        : results[key].result === "Not present"
                        ? "text-gray-600"
                        : "text-red-600"
                    }`}
                  >
                    {key === "encryption" ? (results[key].tls ? "TLS Detected" : "No TLS") : results[key].result}
                  </p>
                  {results[key].details && detailedView && (
                    <p className="text-xs text-gray-600 truncate">{results[key].details}</p>
                  )}
                </div>
              ))}

              {/* Potential Issues */}
              {results.potentialIssues.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Potential Issues ({results.potentialIssues.length})</p>
                  <ul className="mt-2 space-y-2">
                    {results.potentialIssues.map((issue, index) => (
                      <li key={index} className="border p-2 rounded-lg">
                        <p
                          className={`font-medium ${
                            issue.severity === "High" ? "text-red-600" : "text-yellow-600"
                          }`}
                        >
                          {issue.issue} ({issue.severity})
                        </p>
                        <p className="text-sm text-gray-600">{issue.details}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Additional Headers */}
              {detailedView && Object.keys(results.additionalHeaders).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Additional Headers</p>
                  <ul className="list-disc pl-5 text-sm text-gray-600 max-h-40 overflow-y-auto">
                    {Object.entries(results.additionalHeaders).map(([key, value]) => (
                      <li key={key} className="truncate">
                        <strong>{key}:</strong> {value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Analyzes SPF, DKIM, DMARC, and TLS encryption</li>
            <li>Detects potential security issues</li>
            <li>Detailed or simple view toggle</li>
            <li>Copy or download results as JSON</li>
            <li>Real-time analysis with loading indicator</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SecureEmailHeaderAnalyzer;