"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  FaSearch,
  FaHistory,
  FaUndo,
  FaTimes,
  FaDownload,
  FaStar,
  FaBars,
} from "react-icons/fa";

const IFSCFinder = () => {
  const [searchType, setSearchType] = useState("ifsc"); // ifsc, branch, or micr
  const [ifscCode, setIfscCode] = useState("");
  const [micrCode, setMicrCode] = useState("");
  const [branchSearch, setBranchSearch] = useState({
    bank: "",
    state: "",
    city: "",
    branch: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    // Load favorites from localStorage on mount
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("ifscFavorites") || "[]");
    }
    return [];
  });
  const [showHistory, setShowHistory] = useState(false); // Collapsible history
  const [showFeatures, setShowFeatures] = useState(false); // Collapsible features
  const [compactView, setCompactView] = useState(false); // Compact vs. detailed result
  const [suggestions, setSuggestions] = useState({
    banks: [],
    states: [],
    cities: [],
  });

  // API base URL (Razorpay IFSC API)
  const API_BASE_URL = "https://ifsc.razorpay.com";

  // Mock autocomplete suggestions (replace with real API if available)
  const MOCK_SUGGESTIONS = {
    banks: [
      "State Bank of India",
      "HDFC Bank",
      "ICICI Bank",
      "Axis Bank",
      "Punjab National Bank",
    ],
    states: ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat"],
    cities: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Ahmedabad"],
  };

  // Update suggestions based on input
  const updateSuggestions = useCallback((field, value) => {
    if (!value) {
      setSuggestions((prev) => ({ ...prev, [field]: [] }));
      return;
    }
    const key = field === "bank" ? "banks" : field;
    const filtered = MOCK_SUGGESTIONS[key].filter((item) =>
      item.toLowerCase().startsWith(value.toLowerCase())
    );
    setSuggestions((prev) => ({ ...prev, [key]: filtered }));
  }, []);

  // Validate IFSC code format (e.g., SBIN0001234)
  const validateIFSC = (code) => {
    const regex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return regex.test(code.trim().toUpperCase());
  };

  // Validate MICR code format (9 digits)
  const validateMICR = (code) => {
    const regex = /^\d{9}$/;
    return regex.test(code.trim());
  };

  // Fetch bank details by IFSC code
  const fetchByIFSC = useCallback(async (code) => {
    if (!validateIFSC(code)) {
      setError("Invalid IFSC code format (e.g., SBIN0001234)");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/${code.trim().toUpperCase()}`);
      if (!response.ok) throw new Error("Invalid IFSC code or server error");
      const data = await response.json();
      setResult(data);
      setHistory((prev) => [
        ...prev,
        { type: "ifsc", query: code.trim().toUpperCase(), result: data },
      ].slice(-10));
    } catch (err) {
      setError(err.message || "Failed to fetch bank details");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch bank details by MICR code (mocked, as Razorpay doesn't support this)
  const fetchByMICR = useCallback(async (code) => {
    if (!validateMICR(code)) {
      setError("Invalid MICR code format (9 digits)");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      // Mock response (replace with real API if available)
      const sampleIFSC = "SBIN0001234";
      const response = await fetch(`${API_BASE_URL}/${sampleIFSC}`);
      if (!response.ok) throw new Error("No matching MICR code found");
      const data = await response.json();
      setResult(data);
      setHistory((prev) => [
        ...prev,
        { type: "micr", query: code.trim(), result: data },
      ].slice(-10));
    } catch (err) {
      setError(err.message || "Failed to fetch bank details");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch bank details by branch details (mocked)
  const fetchByBranch = useCallback(async () => {
    const { bank, state, city } = branchSearch;
    if (!bank || !state || !city) {
      setError("Bank, state, and city are required for branch search");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      // Mock response
      const sampleIFSC = "SBIN0001234";
      const response = await fetch(`${API_BASE_URL}/${sampleIFSC}`);
      if (!response.ok) throw new Error("No matching branches found");
      const data = await response.json();
      setResult(data);
      setHistory((prev) => [
        ...prev,
        {
          type: "branch",
          query: { bank, state, city, branch: branchSearch.branch },
          result: data,
        },
      ].slice(-10));
    } catch (err) {
      setError(err.message || "Failed to fetch bank details");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [branchSearch]);

  // Handle search based on type
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchType === "ifsc" && ifscCode.trim()) {
      fetchByIFSC(ifscCode);
    } else if (searchType === "micr" && micrCode.trim()) {
      fetchByMICR(micrCode);
    } else if (searchType === "branch") {
      fetchByBranch();
    } else {
      setError("Please enter valid search details");
    }
  };

  // Clear form
  const clearForm = () => {
    setIfscCode("");
    setMicrCode("");
    setBranchSearch({ bank: "", state: "", city: "", branch: "" });
    setResult(null);
    setError("");
    setShowCopyAlert(false);
    setSuggestions({ banks: [], states: [], cities: [] });
  };

  // Restore from history
  const restoreFromHistory = (entry) => {
    setResult(entry.result);
    if (entry.type === "ifsc") {
      setSearchType("ifsc");
      setIfscCode(entry.query);
      setMicrCode("");
      setBranchSearch({ bank: "", state: "", city: "", branch: "" });
    } else if (entry.type === "micr") {
      setSearchType("micr");
      setMicrCode(entry.query);
      setIfscCode("");
      setBranchSearch({ bank: "", state: "", city: "", branch: "" });
    } else {
      setSearchType("branch");
      setBranchSearch(entry.query);
      setIfscCode("");
      setMicrCode("");
    }
  };

  // Copy result to clipboard
  const copyToClipboard = () => {
    if (!result) return;
    const text = compactView
      ? `Bank: ${result.BANK}, IFSC: ${result.IFSC}, Branch: ${result.BRANCH}`
      : `
          Bank: ${result.BANK}
          IFSC: ${result.IFSC}
          Branch: ${result.BRANCH}
          Address: ${result.ADDRESS}
          City: ${result.CITY}
          State: ${result.STATE}
          MICR: ${result.MICR || "N/A"}
        `.trim();
    navigator.clipboard.writeText(text);
    setShowCopyAlert(true);
    setTimeout(() => setShowCopyAlert(false), 2000);
  };

  // Download result as text file
  const downloadDetails = () => {
    if (!result) return;
    const text = `
      Bank: ${result.BANK}
      IFSC: ${result.IFSC}
      Branch: ${result.BRANCH}
      Address: ${result.ADDRESS}
      City: ${result.CITY}
      State: ${result.STATE}
      MICR: ${result.MICR || "N/A"}
    `.trim();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bank-details-${result.IFSC}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Toggle favorite
  const toggleFavorite = () => {
    if (!result) return;
    const favorite = {
      bank: result.BANK,
      ifsc: result.IFSC,
      branch: result.BRANCH,
      city: result.CITY,
      state: result.STATE,
    };
    setFavorites((prev) => {
      const isFavorited = prev.some((f) => f.ifsc === result.IFSC);
      let newFavorites;
      if (isFavorited) {
        newFavorites = prev.filter((f) => f.ifsc !== result.IFSC);
      } else {
        newFavorites = [...prev, favorite];
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("ifscFavorites", JSON.stringify(newFavorites));
      }
      return newFavorites;
    });
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
  };

  // Save favorites to localStorage on update
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ifscFavorites", JSON.stringify(favorites));
    }
  }, [favorites]);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        {/* Copy Alert */}
        {showCopyAlert && (
          <div
            className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in"
            role="alert"
          >
            Details copied to clipboard!
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          IFSC Finder
        </h1>

        {/* Error Message */}
        {error && (
          <div
            className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
          </div>
        )}

        {/* Search Type Toggle */}
        <div className="flex justify-center mb-6 space-x-2">
          {["ifsc", "micr", "branch"].map((type) => (
            <button
              key={type}
              onClick={() => setSearchType(type)}
              className={`px-4 py-2 rounded-md ${
                searchType === type
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              } hover:bg-blue-700 hover:text-white transition-colors capitalize`}
              aria-pressed={searchType === type}
            >
              By {type}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="space-y-6">
          {searchType === "ifsc" && (
            <div className="relative">
              <label
                htmlFor="ifsc-input"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                IFSC Code
                <span
                  className="ml-1 text-gray-500 cursor-help"
                  title="Enter a valid IFSC code (e.g., SBIN0001234)"
                >
                  ℹ️
                </span>
              </label>
              <input
                id="ifsc-input"
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                placeholder="Enter IFSC code (e.g., SBIN0001234)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={11}
                aria-describedby="ifsc-error"
              />
            </div>
          )}

          {searchType === "micr" && (
            <div className="relative">
              <label
                htmlFor="micr-input"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                MICR Code
                <span
                  className="ml-1 text-gray-500 cursor-help"
                  title="Enter a 9-digit MICR code"
                >
                  ℹ️
                </span>
              </label>
              <input
                id="micr-input"
                type="text"
                value={micrCode}
                onChange={(e) => setMicrCode(e.target.value)}
                placeholder="Enter MICR code (e.g., 123456789)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={9}
                aria-describedby="micr-error"
              />
            </div>
          )}

          {searchType === "branch" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: "bank", label: "Bank Name", placeholder: "e.g., State Bank of India" },
                { key: "state", label: "State", placeholder: "e.g., Maharashtra" },
                { key: "city", label: "City", placeholder: "e.g., Mumbai" },
                { key: "branch", label: "Branch (Optional)", placeholder: "e.g., Main Branch" },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="relative">
                  <label
                    htmlFor={`${key}-input`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {label}
                    <span
                      className="ml-1 text-gray-500 cursor-help"
                      title={`Enter ${label.toLowerCase()}`}
                    >
                      ℹ️
                    </span>
                  </label>
                  <input
                    id={`${key}-input`}
                    type="text"
                    value={branchSearch[key]}
                    onChange={(e) => {
                      setBranchSearch((prev) => ({ ...prev, [key]: e.target.value }));
                      if (["bank", "state", "city"].includes(key)) {
                        updateSuggestions(key, e.target.value);
                      }
                    }}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-describedby={`${key}-suggestions`}
                  />
                  {/* Autocomplete Suggestions */}
                  {suggestions[key + "s"]?.length > 0 && (
                    <ul
                      className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-auto"
                      id={`${key}-suggestions`}
                    >
                      {suggestions[key + "s"].map((item, idx) => (
                        <li
                          key={idx}
                          className="px-3 py-1 hover:bg-blue-100 cursor-pointer"
                          onClick={() => {
                            setBranchSearch((prev) => ({ ...prev, [key]: item }));
                            setSuggestions((prev) => ({ ...prev, [key + "s"]: [] }));
                          }}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
              aria-label="Search bank details"
            >
              <FaSearch className="mr-2" />
              {isLoading ? "Searching..." : "Search"}
            </button>
            <button
              type="button"
              onClick={clearForm}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              aria-label="Clear form"
            >
              <FaTimes className="mr-2" />
              Clear
            </button>
          </div>
        </form>

        {/* Result */}
        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-700">Bank Details</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setCompactView(!compactView)}
                  className="text-blue-600 hover:text-blue-800"
                  aria-label={compactView ? "Show detailed view" : "Show compact view"}
                >
                  {compactView ? "Detailed" : "Compact"}
                </button>
                <button
                  onClick={toggleFavorite}
                  className={`text-yellow-500 hover:text-yellow-600 ${
                    favorites.some((f) => f.ifsc === result.IFSC) ? "opacity-100" : "opacity-50"
                  }`}
                  aria-label={
                    favorites.some((f) => f.ifsc === result.IFSC)
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                >
                  <FaStar />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              {compactView ? (
                <>
                  <p>
                    <strong>Bank:</strong> {result.BANK}
                  </p>
                  <p>
                    <strong>IFSC:</strong> {result.IFSC}
                  </p>
                  <p>
                    <strong>Branch:</strong> {result.BRANCH}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Bank:</strong> {result.BANK}
                  </p>
                  <p>
                    <strong>IFSC:</strong> {result.IFSC}
                  </p>
                  <p>
                    <strong>Branch:</strong> {result.BRANCH}
                  </p>
                  <p>
                    <strong>Address:</strong> {result.ADDRESS}
                  </p>
                  <p>
                    <strong>City:</strong> {result.CITY}
                  </p>
                  <p>
                    <strong>State:</strong> {result.STATE}
                  </p>
                  <p>
                    <strong>MICR:</strong> {result.MICR || "N/A"}
                  </p>
                </>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={copyToClipboard}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                aria-label="Copy bank details"
              >
                Copy Details
              </button>
              <button
                onClick={downloadDetails}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                aria-label="Download bank details"
              >
                <FaDownload className="mr-2" />
                Download
              </button>
            </div>
          </div>
        )}

        {/* Favorites */}
        {favorites.length > 0 && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-700 flex items-center">
              <FaStar className="mr-2" /> Favorite Banks
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {favorites.map((fav, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {fav.bank}, {fav.branch}, {fav.city} ({fav.ifsc})
                  </span>
                  <button
                    onClick={() => fetchByIFSC(fav.ifsc)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                    aria-label={`Restore favorite: ${fav.bank}`}
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center font-semibold text-gray-700 mb-2"
              aria-expanded={showHistory}
              aria-controls="history-section"
            >
              <FaBars className="mr-2" />
              Recent Searches (Last 10)
            </button>
            {showHistory && (
              <div
                id="history-section"
                className="p-4 bg-gray-100 rounded-lg"
                role="region"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-700 flex items-center">
                    <FaHistory className="mr-2" /> History
                  </h3>
                  <button
                    onClick={clearHistory}
                    className="text-red-600 hover:text-red-800 text-sm"
                    aria-label="Clear search history"
                  >
                    Clear History
                  </button>
                </div>
                <ul className="text-sm text-gray-600 space-y-2">
                  {history.slice().reverse().map((entry, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <span>
                        {entry.type === "ifsc"
                          ? `IFSC: ${entry.query}`
                          : entry.type === "micr"
                          ? `MICR: ${entry.query}`
                          : `Branch: ${entry.query.bank}, ${entry.query.city}${
                              entry.query.branch ? `, ${entry.query.branch}` : ""
                            }`}
                      </span>
                      <button
                        onClick={() => restoreFromHistory(entry)}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        aria-label="Restore search"
                      >
                        <FaUndo />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className = "mt-6">
          <button
            onClick={() => setShowFeatures(!showFeatures)}
            className="flex items-center font-semibold text-gray-700 mb-2"
            aria-expanded={showFeatures}
            aria-controls="features-section"
          >
            <FaBars className="mr-2" />
            Features
          </button>
          {showFeatures && (
            <div
              id="features-section"
              className="p-4 bg-blue-100 rounded-lg border border-blue-300"
              role="region"
            >
              <h3 className="font-semibold text-blue-700">Features</h3>
              <ul className="list-disc list-inside text-blue-600 text-sm">
                <li>Search by IFSC code, MICR code, or branch details</li>
                <li>Autocomplete for bank names, states, and cities</li>
                <li>View compact or detailed bank information</li>
                <li>Copy or download results</li>
                <li>Save favorite banks for quick access</li>
                <li>Track and restore up to 10 recent searches</li>
                <li>Accessible and responsive design</li>
              </ul>
            </div>
          )}
        </div>

        {/* Tailwind Animation */}
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-in;
          }
          .animate-spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default IFSCFinder;