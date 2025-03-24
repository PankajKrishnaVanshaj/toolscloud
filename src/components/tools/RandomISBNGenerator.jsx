"use client";

import React, { useState, useCallback, useEffect } from "react";
import { faker } from "@faker-js/faker";
import { FaCopy, FaDownload, FaTimes, FaCheckCircle, FaHistory, FaUndo } from "react-icons/fa";

const RandomISBNGenerator = () => {
  const [isbnType, setIsbnType] = useState("isbn13");
  const [batchSize, setBatchSize] = useState(1);
  const [isbns, setIsbns] = useState([]);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uniqueOnly, setUniqueOnly] = useState(true);
  const [prefix, setPrefix] = useState("random");
  const [separator, setSeparator] = useState("-");
  const [includeTimestamp, setIncludeTimestamp] = useState(false);
  const [languageGroup, setLanguageGroup] = useState("random");
  const [isCustom, setIsCustom] = useState(false);
  const [customPrefix, setCustomPrefix] = useState("978");
  const [customRegistration, setCustomRegistration] = useState("");
  const [customRegistrant, setCustomRegistrant] = useState("");
  const [includeChecksum, setIncludeChecksum] = useState(true); // New option
  const [outputCase, setOutputCase] = useState("default"); // New: upper, lower, default
  const [isbnPartsList, setIsbnPartsList] = useState([]);
  const [showAlert, setShowAlert] = useState(false);

  const generateISBN = useCallback(() => {
    const prefixes = prefix === "random" ? ["978", "979"] : [prefix];
    const langGroups = {
      random: ["0", "1", "2", "3", "4", "5", "6", "7", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99"],
      english: ["0", "1"],
      french: ["2"],
      german: ["3"],
      japan: ["4"],
      russia: ["5"],
    };
    const selectedLangGroup = languageGroup === "random" ? langGroups.random : langGroups[languageGroup];

    const isbnParts = {};
    if (isbnType === "isbn13") {
      isbnParts.prefix = isCustom ? (customPrefix || faker.helpers.arrayElement(prefixes)) : faker.helpers.arrayElement(prefixes);
      if (!/^(97[89])$/.test(isbnParts.prefix)) throw new Error("Invalid ISBN-13 prefix (must be 978 or 979)");
      isbnParts.prefix = isbnParts.prefix.padEnd(3, "0").slice(0, 3);
      const is979 = isbnParts.prefix === "979";
      isbnParts.registration = isCustom && customRegistration
        ? customRegistration.padEnd(is979 ? 2 : 1, "0").slice(0, is979 ? 2 : 1)
        : faker.helpers.arrayElement(selectedLangGroup);
      isbnParts.registrant = isCustom && customRegistrant
        ? customRegistrant.padEnd(is979 ? 4 : 5, "0").slice(0, is979 ? 4 : 5)
        : faker.string.numeric({ length: is979 ? 4 : 5 });
      isbnParts.publication = faker.string.numeric({ length: is979 ? 3 : 2 });
      const base = isbnParts.prefix + isbnParts.registration + isbnParts.registrant + isbnParts.publication;
      isbnParts.checksum = includeChecksum ? calculateISBN13Checksum(base) : "0";
    } else {
      isbnParts.registration = isCustom && customRegistration
        ? customRegistration.padEnd(1, "0").slice(0, 1)
        : faker.helpers.arrayElement(selectedLangGroup);
      isbnParts.registrant = isCustom && customRegistrant
        ? customRegistrant.padEnd(4, "0").slice(0, 4)
        : faker.string.numeric({ length: 4 });
      isbnParts.publication = faker.string.numeric({ length: 3 });
      const base = isbnParts.registration + isbnParts.registrant + isbnParts.publication;
      isbnParts.checksum = includeChecksum ? calculateISBN10Checksum(base) : "0";
    }
    isbnParts.timestamp = new Date().toISOString();
    return isbnParts;
  }, [isbnType, prefix, languageGroup, isCustom, customPrefix, customRegistration, customRegistrant, includeChecksum]);

  const calculateISBN13Checksum = (base) => {
    const digits = base.split("").map(Number);
    const sum = digits.reduce((acc, digit, i) => acc + (i % 2 === 0 ? digit : digit * 3), 0);
    return ((10 - (sum % 10)) % 10).toString();
  };

  const calculateISBN10Checksum = (base) => {
    const digits = base.split("").map(Number);
    const sum = digits.reduce((acc, digit, i) => acc + digit * (10 - i), 0);
    const checksum = (11 - (sum % 11)) % 11;
    return checksum === 10 ? "X" : checksum.toString();
  };

  const formatISBN = (parts, type) => {
    const sep = separator === "none" ? "" : separator;
    let isbn;
    if (type === "isbn13") {
      isbn = [parts.prefix, parts.registration, parts.registrant, parts.publication, parts.checksum].join(sep);
    } else {
      isbn = [parts.registration, parts.registrant, parts.publication, parts.checksum].join(sep);
    }
    if (outputCase === "upper") isbn = isbn.toUpperCase();
    else if (outputCase === "lower") isbn = isbn.toLowerCase();
    return includeTimestamp ? `${isbn} [${parts.timestamp}]` : isbn;
  };

  useEffect(() => {
    if (isbnPartsList.length > 0) {
      const updatedIsbns = isbnPartsList.map((parts) => formatISBN(parts, isbnType));
      setIsbns(updatedIsbns);
    }
  }, [separator, includeTimestamp, isbnPartsList, isbnType, outputCase]);

  const generateBatch = async () => {
    setIsGenerating(true);
    try {
      const newIsbnsSet = new Set();
      const newPartsList = [];
      const maxAttempts = batchSize * 10;
      let attempts = 0;

      while (newIsbnsSet.size < batchSize && attempts < maxAttempts) {
        const parts = generateISBN();
        const isbn = formatISBN(parts, isbnType);
        if (!uniqueOnly || !newIsbnsSet.has(isbn)) {
          newIsbnsSet.add(isbn);
          newPartsList.push(parts);
        }
        attempts++;
      }

      if (newPartsList.length < batchSize) {
        setError(`Could only generate ${newPartsList.length} unique ISBNs after ${attempts} attempts`);
      } else {
        setError("");
      }

      setIsbnPartsList(newPartsList);
      setIsbns(newPartsList.map((parts) => formatISBN(parts, isbnType)));
      setHistory((prev) => [
        {
          isbns: newPartsList.map((parts) => formatISBN(parts, isbnType)),
          type: isbnType,
          timestamp: new Date(),
          unique: uniqueOnly,
          prefix,
          separator,
          includeTimestamp,
          languageGroup,
          isCustom,
          customPrefix,
          customRegistration,
          customRegistrant,
          includeChecksum,
          outputCase,
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      setError(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(isbns.join("\n")).then(() => {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    });
  };

  const handleDownload = (format) => {
    const content =
      format === "csv"
        ? ["ISBN", ...isbns].join("\n")
        : isbns.join("\n");
    const blob = new Blob([content], { type: `text/${format}` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `isbns_${isbnType}_${Date.now()}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setIsbns([]);
    setIsbnPartsList([]);
    setError("");
    setCustomPrefix("978");
    setCustomRegistration("");
    setCustomRegistrant("");
  };

  const loadFromHistory = (entry) => {
    setIsbns(entry.isbns);
    const reconstructedParts = entry.isbns.map((isbn) => {
      const parts = {};
      const digitsOnly = isbn.split(" ")[0].replace(new RegExp(`[${separator === "none" ? "" : separator}]`, "g"), "");
      if (entry.type === "isbn13") {
        const is979 = digitsOnly.startsWith("979");
        parts.prefix = digitsOnly.slice(0, 3);
        parts.registration = digitsOnly.slice(3, is979 ? 5 : 4);
        parts.registrant = digitsOnly.slice(is979 ? 5 : 4, is979 ? 9 : 9);
        parts.publication = digitsOnly.slice(is979 ? 9 : 9, 12);
        parts.checksum = digitsOnly.slice(12);
      } else {
        parts.registration = digitsOnly.slice(0, 1);
        parts.registrant = digitsOnly.slice(1, 5);
        parts.publication = digitsOnly.slice(5, 9);
        parts.checksum = digitsOnly.slice(9);
      }
      parts.timestamp = isbn.includes("[") ? isbn.split(" [")[1].slice(0, -1) : new Date().toISOString();
      return parts;
    });
    setIsbnPartsList(reconstructedParts);
    setIsbnType(entry.type);
    setUniqueOnly(entry.unique);
    setPrefix(entry.prefix);
    setSeparator(entry.separator);
    setIncludeTimestamp(entry.includeTimestamp);
    setLanguageGroup(entry.languageGroup);
    setIsCustom(entry.isCustom);
    setCustomPrefix(entry.customPrefix);
    setCustomRegistration(entry.customRegistration);
    setCustomRegistrant(entry.customRegistrant);
    setIncludeChecksum(entry.includeChecksum);
    setOutputCase(entry.outputCase);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="relative bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full ">
        {/* Alert Notification */}
        {showAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            ISBNs copied to clipboard!
          </div>
        )}

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Random ISBN Generator
        </h2>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ISBN Type</label>
            <select
              value={isbnType}
              onChange={(e) => setIsbnType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="isbn13">ISBN-13</option>
              <option value="isbn10">ISBN-10</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Batch Size (1-100)</label>
            <input
              type="number"
              value={batchSize}
              onChange={(e) => setBatchSize(Math.min(100, Math.max(1, Number(e.target.value) || 1)))}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prefix</label>
            {isCustom ? (
              <input
                type="text"
                value={customPrefix}
                onChange={(e) => setCustomPrefix(e.target.value.slice(0, 3))}
                placeholder="e.g., 978"
                maxLength={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <select
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                disabled={isbnType === "isbn10"}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="random">Random (978/979)</option>
                <option value="978">978</option>
                <option value="979">979</option>
              </select>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Separator</label>
            <select
              value={separator}
              onChange={(e) => setSeparator(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="-">Hyphen (-)</option>
              <option value=" ">Space</option>
              <option value="none">None</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language/Region Group</label>
            <select
              value={languageGroup}
              onChange={(e) => setLanguageGroup(e.target.value)}
              disabled={isCustom && customRegistration}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="random">Random</option>
              <option value="english">English (0-1)</option>
              <option value="french">French (2)</option>
              <option value="german">German (3)</option>
              <option value="japan">Japan (4)</option>
              <option value="russia">Russia (5)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Output Case</label>
            <select
              value={outputCase}
              onChange={(e) => setOutputCase(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="default">Default</option>
              <option value="upper">Uppercase</option>
              <option value="lower">Lowercase</option>
            </select>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="p-4 bg-gray-50 rounded-lg mb-6 space-y-4">
          <p className="text-sm font-medium text-gray-700">Advanced Options:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isCustom && (
              <>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Custom Registration</label>
                  <input
                    type="text"
                    value={customRegistration}
                    onChange={(e) => setCustomRegistration(e.target.value.slice(0, isbnType === "isbn13" && customPrefix === "979" ? 2 : 1))}
                    placeholder={isbnType === "isbn13" && customPrefix === "979" ? "e.g., 12" : "e.g., 1"}
                    maxLength={isbnType === "isbn13" && customPrefix === "979" ? 2 : 1}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Custom Registrant</label>
                  <input
                    type="text"
                    value={customRegistrant}
                    onChange={(e) => setCustomRegistrant(e.target.value.slice(0, isbnType === "isbn13" && customPrefix === "979" ? 4 : 5))}
                    placeholder={isbnType === "isbn13" && customPrefix === "979" ? "e.g., 1234" : "e.g., 12345"}
                    maxLength={isbnType === "isbn13" && customPrefix === "979" ? 4 : 5}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={uniqueOnly}
                  onChange={(e) => setUniqueOnly(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Unique ISBNs
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={includeTimestamp}
                  onChange={(e) => setIncludeTimestamp(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Include Timestamp
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={isCustom}
                  onChange={(e) => setIsCustom(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Custom Mode
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={includeChecksum}
                  onChange={(e) => setIncludeChecksum(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Include Checksum
              </label>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={generateBatch}
            disabled={isGenerating}
            className={`flex-1 py-2 px-4 bg-blue-600 text-white rounded-md font-medium flex items-center justify-center ${
              isGenerating ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700 transition-colors"
            }`}
          >
            {isGenerating ? (
              <span className="animate-spin mr-2">⌛</span>
            ) : (
              "Generate"
            )}
          </button>
          <button
            onClick={handleCopy}
            disabled={!isbns.length}
            className={`flex-1 py-2 px-4 bg-green-600 text-white rounded-md font-medium flex items-center justify-center ${
              !isbns.length ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700 transition-colors"
            }`}
          >
            <FaCopy className="mr-2" />
            Copy
          </button>
          <button
            onClick={() => handleDownload("txt")}
            disabled={!isbns.length}
            className={`flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md font-medium flex items-center justify-center ${
              !isbns.length ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700 transition-colors"
            }`}
          >
            <FaDownload className="mr-2" />
            TXT
          </button>
          <button
            onClick={() => handleDownload("csv")}
            disabled={!isbns.length}
            className={`flex-1 py-2 px-4 bg-teal-600 text-white rounded-md font-medium flex items-center justify-center ${
              !isbns.length ? "opacity-50 cursor-not-allowed" : "hover:bg-teal-700 transition-colors"
            }`}
          >
            <FaDownload className="mr-2" />
            CSV
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
          >
            <FaTimes className="mr-2" />
            Reset
          </button>
        </div>

        {/* Output */}
        {isbns.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Generated ISBNs ({isbns.length})
            </h3>
            <div className="font-mono text-sm max-h-64 overflow-y-auto bg-white p-4 rounded-lg border border-gray-200">
              {isbns.map((isbn, index) => (
                <div key={index} className="py-1 px-2 hover:bg-gray-100 rounded transition-colors">
                  {isbn}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${error.includes("failed") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            <FaCheckCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center mb-2">
              <FaHistory className="mr-2" /> Recent Generations (Last 10)
            </h3>
            <div className="max-h-64 overflow-y-auto">
              {history.map((entry, index) => (
                <div
                  key={index}
                  onClick={() => loadFromHistory(entry)}
                  className="p-3 bg-white rounded-md mb-2 hover:bg-gray-50 cursor-pointer transition-colors border border-gray-200"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">
                        {entry.type.toUpperCase()} ({entry.isbns.length}) {entry.unique && "- Unique"}
                        {entry.includeTimestamp && " - Timestamp"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {entry.timestamp.toLocaleString()} | {entry.isCustom ? `Custom: ${entry.customPrefix}-${entry.customRegistration || "R"}-${entry.customRegistrant || "R"}` : `${entry.prefix} - ${entry.languageGroup}`}
                      </p>
                    </div>
                    <button className="text-blue-500 hover:text-blue-700">
                      <FaUndo />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Generate ISBN-10 or ISBN-13 with custom or random prefixes</li>
            <li>Custom separators, language groups, and output case</li>
            <li>Optional checksum and timestamp inclusion</li>
            <li>Batch generation with uniqueness option</li>
            <li>Export as TXT or CSV, copy, and history tracking</li>
          </ul>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-in;
          }
        `}</style>
      </div>
    </div>
  );
};

export default RandomISBNGenerator;