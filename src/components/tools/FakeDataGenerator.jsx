"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaHistory, FaUndo, FaTrash } from "react-icons/fa";

const generateUniqueId = () => Math.random().toString(36).substr(2, 9);

const generateFakeData = (type, options, existingData = {}) => {
  const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
  let newData;

  switch (type) {
    case "user":
      newData = {
        id: generateUniqueId(),
        firstName: randomChoice(["John", "Jane", "Mike", "Emily", "Alex", "Sam", "Chris", "Pat"]),
        lastName: randomChoice(["Doe", "Smith", "Johnson", "Brown", "Taylor", "Lee", "Wilson", "Davis"]),
        email: `${generateUniqueId()}@${randomChoice(options.emailDomains)}.com`,
        age: Math.floor(Math.random() * (options.maxAge - options.minAge + 1)) + options.minAge,
        phone: `(${Math.floor(Math.random() * 900) + 100})-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        occupation: randomChoice(["Software Developer", "Teacher", "Accountant", "Artist", "Manager", "Engineer", "Doctor", "Writer"]),
        gender: randomChoice(["Male", "Female", "Non-binary", "Other"]),
      };
      break;
    case "address":
      newData = {
        id: generateUniqueId(),
        street: `${Math.floor(Math.random() * 10000)} ${randomChoice(["Main", "Park", "Oak", "Pine", "Maple", "Cedar"])} ${randomChoice(["St", "Ave", "Rd"])}`,
        city: randomChoice(["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Seattle", "Boston"]),
        zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        state: randomChoice(["CA", "NY", "TX", "FL", "IL", "AZ", "WA", "MA"]),
        country: randomChoice(["USA", "Canada", "UK"]),
      };
      break;
    case "company":
      newData = {
        id: generateUniqueId(),
        name: `${randomChoice(["Tech", "Health", "Finance", "Retail", "Edu", "Green"])} ${randomChoice(["Systems", "Solutions", "Group", "Innovations", "Labs"])} ${generateUniqueId()}`,
        industry: randomChoice(["Tech", "Healthcare", "Finance", "Retail", "Education", "Energy", "Media"]),
        foundedYear: Math.floor(Math.random() * (2025 - options.minYear + 1)) + options.minYear,
        employeeCount: Math.floor(Math.random() * options.maxEmployees) + 1,
        website: `www.${generateUniqueId()}.${randomChoice(options.webTlds)}`,
        revenue: `${Math.floor(Math.random() * options.maxRevenue)}M`,
      };
      break;
    default:
      return null;
  }

  // Ensure uniqueness
  let attempts = 0;
  const maxAttempts = 1000;
  while (attempts < maxAttempts) {
    const uniqueKey = JSON.stringify(newData);
    if (!existingData[uniqueKey]) {
      existingData[uniqueKey] = true;
      return newData;
    }
    // Regenerate unique fields
    newData.id = generateUniqueId();
    if (type === "user") newData.email = `${generateUniqueId()}@${randomChoice(options.emailDomains)}.com`;
    if (type === "company") {
      newData.name = `${randomChoice(["Tech", "Health", "Finance", "Retail", "Edu", "Green"])} ${randomChoice(["Systems", "Solutions", "Group", "Innovations", "Labs"])} ${generateUniqueId()}`;
      newData.website = `www.${generateUniqueId()}.${randomChoice(options.webTlds)}`;
    }
    attempts++;
  }
  console.warn("Max attempts reached; data may not be unique");
  return newData;
};

const FakeDataGenerator = () => {
  const [selectedType, setSelectedType] = useState("user");
  const [generatedData, setGeneratedData] = useState([]);
  const [allData, setAllData] = useState({});
  const [count, setCount] = useState(1);
  const [history, setHistory] = useState([]);
  const [isCopied, setIsCopied] = useState(false);
  const [options, setOptions] = useState({
    emailDomains: ["gmail", "yahoo", "outlook", "hotmail"],
    webTlds: ["com", "net", "org", "co"],
    minAge: 18,
    maxAge: 80,
    minYear: 1950,
    maxEmployees: 50000,
    maxRevenue: 1000,
  });

  const handleGenerate = useCallback(() => {
    const newData = Array.from({ length: Math.min(count, 100) }, () =>
      generateFakeData(selectedType, options, allData)
    );
    setGeneratedData(newData);
    setAllData((prev) => {
      const updated = { ...prev };
      newData.forEach((item) => (updated[JSON.stringify(item)] = true));
      return updated;
    });
    setHistory((prev) => [
      ...prev,
      { type: selectedType, count, data: newData, options },
    ].slice(-5));
    setIsCopied(false);
  }, [selectedType, count, options]);

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    setGeneratedData([]);
    setAllData({});
  };

  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const copyToClipboard = () => {
    const text = JSON.stringify(generatedData, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const downloadAsJson = () => {
    const text = JSON.stringify(generatedData, null, 2);
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fake-data-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearData = () => {
    setGeneratedData([]);
    setIsCopied(false);
  };

  const restoreFromHistory = (entry) => {
    setSelectedType(entry.type);
    setCount(entry.count);
    setGeneratedData(entry.data);
    setOptions(entry.options);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Fake Data Generator
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Generate unique fake data for testing purposes
        </p>

        {/* Controls */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Type
              </label>
              <select
                value={selectedType}
                onChange={handleTypeChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">User</option>
                <option value="address">Address</option>
                <option value="company">Company</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Records (1-100)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Custom Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Customization Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedType === "user" && (
                <>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Email Domains (comma-separated):</label>
                    <input
                      type="text"
                      value={options.emailDomains.join(", ")}
                      onChange={(e) => handleOptionChange("emailDomains", e.target.value.split(", ").filter(Boolean))}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Age Range:</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max="150"
                        value={options.minAge}
                        onChange={(e) => handleOptionChange("minAge", Math.max(1, Number(e.target.value)))}
                        className="w-1/2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        min="1"
                        max="150"
                        value={options.maxAge}
                        onChange={(e) => handleOptionChange("maxAge", Math.min(150, Number(e.target.value)))}
                        className="w-1/2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}
              {selectedType === "company" && (
                <>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Web TLDs (comma-separated):</label>
                    <input
                      type="text"
                      value={options.webTlds.join(", ")}
                      onChange={(e) => handleOptionChange("webTlds", e.target.value.split(", ").filter(Boolean))}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Min Founded Year:</label>
                    <input
                      type="number"
                      min="1900"
                      max="2025"
                      value={options.minYear}
                      onChange={(e) => handleOptionChange("minYear", Math.max(1900, Number(e.target.value)))}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Max Employees:</label>
                    <input
                      type="number"
                      min="1"
                      max="100000"
                      value={options.maxEmployees}
                      onChange={(e) => handleOptionChange("maxEmployees", Math.min(100000, Number(e.target.value)))}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Max Revenue (M):</label>
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      value={options.maxRevenue}
                      onChange={(e) => handleOptionChange("maxRevenue", Math.min(10000, Number(e.target.value)))}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleGenerate}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold flex items-center justify-center"
            >
              Generate Data
            </button>
            {generatedData.length > 0 && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-3 rounded-lg text-white transition-all font-semibold flex items-center justify-center ${
                    isCopied ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" />
                  {isCopied ? "Copied!" : "Copy JSON"}
                </button>
                <button
                  onClick={downloadAsJson}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  Download JSON
                </button>
                <button
                  onClick={clearData}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Generated Data */}
        {generatedData.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Generated {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Data ({generatedData.length}):
            </h2>
            <pre className="text-sm text-gray-700 max-h-64 overflow-y-auto whitespace-pre-wrap break-words">
              {JSON.stringify(generatedData, null, 2)}
            </pre>
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
                    {entry.count} {entry.type}(s)
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
      </div>
    </div>
  );
};

export default FakeDataGenerator;