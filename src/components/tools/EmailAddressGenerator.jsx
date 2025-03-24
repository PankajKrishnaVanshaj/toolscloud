"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo, FaDice } from "react-icons/fa";

const EmailAddressGenerator = () => {
  const [emails, setEmails] = useState([]);
  const [count, setCount] = useState(10);
  const [domain, setDomain] = useState("gmail.com");
  const [customDomain, setCustomDomain] = useState("");
  const [format, setFormat] = useState("random");
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    separator: ".",        // Separator for name parts
    prefix: "",           // Prefix for email local part
    suffix: "",           // Suffix for email local part
    includeNumbers: false, // Add random numbers
    maxLength: 20,        // Max length of local part
  });

  // Sample name data
  const firstNames = ["john", "jane", "alex", "emma", "chris", "sophia", "mike", "lisa"];
  const lastNames = ["smith", "doe", "johnson", "brown", "wilson", "taylor", "davis", "clark"];

  const generateEmail = useCallback(() => {
    const getRandomString = (length) => {
      const chars = "abcdefghijklmnopqrstuvwxyz" + (options.includeNumbers ? "0123456789" : "");
      return Array.from({ length }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join("");
    };

    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    const selectedDomain = domain === "custom" && customDomain ? customDomain : domain;

    let localPart;
    switch (format) {
      case "random":
        localPart = getRandomString(8);
        break;
      case "firstname.lastname":
        localPart = `${first}${options.separator}${last}`;
        break;
      case "initial.lastname":
        localPart = `${first[0]}${options.separator}${last}`;
        break;
      default:
        localPart = `${first}${options.separator}${last}`;
    }

    if (options.includeNumbers) {
      localPart += Math.floor(Math.random() * 1000);
    }
    if (options.prefix) localPart = `${options.prefix}${options.separator}${localPart}`;
    if (options.suffix) localPart += `${options.separator}${options.suffix}`;
    if (options.maxLength) localPart = localPart.slice(0, options.maxLength);

    return `${localPart}@${selectedDomain}`;
  }, [format, domain, customDomain, options]);

  const generateEmails = useCallback(() => {
    if (domain === "custom" && !customDomain.trim()) {
      alert("Please enter a custom domain.");
      return;
    }
    const newEmails = Array.from({ length: Math.min(count, 1000) }, generateEmail);
    setEmails(newEmails);
    setIsCopied(false);
    setHistory((prev) => [
      ...prev,
      { emails: newEmails, count, domain, customDomain, format, options },
    ].slice(-5));
  }, [count, domain, customDomain, format, options, generateEmail]);

  const copyToClipboard = () => {
    const text = emails.join("\n");
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const downloadAsText = () => {
    const text = emails.join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `emails-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearEmails = () => {
    setEmails([]);
    setIsCopied(false);
  };

  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const restoreFromHistory = (entry) => {
    setEmails(entry.emails);
    setCount(entry.count);
    setDomain(entry.domain);
    setCustomDomain(entry.customDomain);
    setFormat(entry.format);
    setOptions(entry.options);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Advanced Email Address Generator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Emails (1-1000)
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
                Domain
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="gmail.com">gmail.com</option>
                <option value="yahoo.com">yahoo.com</option>
                <option value="hotmail.com">hotmail.com</option>
                <option value="outlook.com">outlook.com</option>
                <option value="custom">Custom Domain</option>
              </select>
            </div>
            {domain === "custom" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Domain
                </label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., example.com"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="random">Random (e.g., xk7p9m2n@...)</option>
                <option value="firstname.lastname">First.Last (e.g., john.doe@...)</option>
                <option value="initial.lastname">Initial.Last (e.g., j.doe@...)</option>
              </select>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Advanced Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Separator:</label>
                <select
                  value={options.separator}
                  onChange={(e) => handleOptionChange("separator", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value=".">Dot (.)</option>
                  <option value="-">Hyphen (-)</option>
                  <option value="_">Underscore (_)</option>
                  <option value="">None</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Prefix:</label>
                <input
                  type="text"
                  value={options.prefix}
                  onChange={(e) => handleOptionChange("prefix", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., user"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Suffix:</label>
                <input
                  type="text"
                  value={options.suffix}
                  onChange={(e) => handleOptionChange("suffix", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 123"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Local Part Length:</label>
                <input
                  type="number"
                  min="5"
                  max="64"
                  value={options.maxLength}
                  onChange={(e) =>
                    handleOptionChange("maxLength", Math.max(5, Math.min(64, Number(e.target.value) || 20)))
                  }
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeNumbers}
                  onChange={() => handleOptionChange("includeNumbers", !options.includeNumbers)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">Include Numbers</label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateEmails}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaDice className="mr-2" />
              Generate Emails
            </button>
            {emails.length > 0 && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors font-medium flex items-center justify-center ${
                    isCopied
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
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
                  onClick={clearEmails}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>

          {/* Generated Emails */}
          {emails.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 text-center">
                Generated Email Addresses ({emails.length}):
              </h2>
              <div className="mt-2 max-h-64 overflow-y-auto">
                <ul className="list-decimal list-inside text-gray-800">
                  {emails.map((email, index) => (
                    <li key={index} className="py-1 break-all">{email}</li>
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
                      {entry.emails.length} emails ({entry.format}, {entry.domain})
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
              <li>Generate random, first.last, or initial.last formats</li>
              <li>Custom domains and separators (dot, hyphen, underscore)</li>
              <li>Add prefixes, suffixes, or numbers</li>
              <li>Set max length for local part (5-64 chars)</li>
              <li>Copy, download, and track history</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailAddressGenerator;