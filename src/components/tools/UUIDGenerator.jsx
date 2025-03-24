"use client";

import React, { useState, useCallback } from "react";
import { FiCopy, FiCheck, FiTrash2, FiDownload, FiSearch } from "react-icons/fi"; // Feather Icons
import { FaHistory, FaUndo } from "react-icons/fa"; // FontAwesome Icons
import { v1 as uuidv1, v4 as uuidv4 } from "uuid";

const UUIDGenerator = () => {
  const [uuids, setUuids] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [count, setCount] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [uuidLength, setUuidLength] = useState(36);
  const [copiedAll, setCopiedAll] = useState(false);
  const [version, setVersion] = useState("v4");
  const [caseOption, setCaseOption] = useState("lower");
  const [history, setHistory] = useState([]);
  const [separator, setSeparator] = useState(",\n");

  const generateUUID = useCallback(() => {
    const generateFn = version === "v1" ? uuidv1 : uuidv4;
    const newUuids = Array.from({ length: Math.min(count, 100) }, () => {
      let uuid = generateFn().slice(0, Math.min(uuidLength, 36));
      uuid = caseOption === "upper" ? uuid.toUpperCase() : uuid.toLowerCase();
      return `${prefix}${uuid}${suffix}`;
    });
    setUuids((prev) => [...newUuids, ...prev]);
    setHistory((prev) => [
      ...prev,
      { uuids: newUuids, count, prefix, suffix, uuidLength, version, caseOption, separator },
    ].slice(-5));
  }, [count, prefix, suffix, uuidLength, version, caseOption]);

  const copyToClipboard = (uuid, index) => {
    navigator.clipboard.writeText(uuid);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const deleteUUID = (index) => {
    setUuids((prev) => prev.filter((_, i) => i !== index));
  };

  const copyAllUUIDs = () => {
    if (!filteredUUIDs.length) return;
    navigator.clipboard.writeText(filteredUUIDs.join(separator));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  };

  const clearUUIDs = () => {
    setUuids([]);
    setCopiedIndex(null);
    setCopiedAll(false);
  };

  const downloadUUIDs = () => {
    if (!filteredUUIDs.length) return;
    const blob = new Blob([filteredUUIDs.join(separator)], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `uuids-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const restoreFromHistory = (entry) => {
    setUuids(entry.uuids);
    setCount(entry.count);
    setPrefix(entry.prefix);
    setSuffix(entry.suffix);
    setUuidLength(entry.uuidLength);
    setVersion(entry.version);
    setCaseOption(entry.caseOption);
    setSeparator(entry.separator);
  };

  const filteredUUIDs = uuids.filter((uuid) =>
    uuid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced UUID Generator
        </h1>

        {/* Controls */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of UUIDs (1-100)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={count}
                  onChange={(e) =>
                    setCount(Math.min(100, Math.max(1, Number(e.target.value) || 1)))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UUID Length (1-36)
                </label>
                <input
                  type="number"
                  min="1"
                  max="36"
                  value={uuidLength}
                  onChange={(e) =>
                    setUuidLength(Math.min(36, Math.max(1, Number(e.target.value) || 1)))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prefix
                </label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., user-"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Suffix
                </label>
                <input
                  type="text"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., -id"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Advanced Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Version:</label>
                <select
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="v1">v1 (Time-based)</option>
                  <option value="v4">v4 (Random)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Case:</label>
                <select
                  value={caseOption}
                  onChange={(e) => setCaseOption(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="lower">Lowercase</option>
                  <option value="upper">Uppercase</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Separator:</label>
                <select
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value=",\n">Comma + Newline</option>
                  <option value="\n">Newline</option>
                  <option value=", ">Comma</option>
                  <option value=" ">Space</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateUUID}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              Generate UUIDs
            </button>
            <button
              onClick={copyAllUUIDs}
              disabled={!filteredUUIDs.length}
              className={`flex-1 py-2 px-4 rounded-md text-white font-medium transition-colors flex items-center justify-center ${
                filteredUUIDs.length
                  ? "bg-gray-600 hover:bg-gray-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {copiedAll ? <FiCheck className="mr-2" /> : <FiCopy className="mr-2" />}
              Copy All
            </button>
            <button
              onClick={downloadUUIDs}
              disabled={!filteredUUIDs.length}
              className={`flex-1 py-2 px-4 rounded-md text-white font-medium transition-colors flex items-center justify-center ${
                filteredUUIDs.length
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              <FiDownload className="mr-2" />
              Download
            </button>
            <button
              onClick={clearUUIDs}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
            >
              <FiTrash2 className="mr-2" />
              Clear
            </button>
          </div>
        </div>

        <div className="mt-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search UUIDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {filteredUUIDs.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg max-h-64 overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Generated UUIDs ({filteredUUIDs.length}):
            </h2>
            <div className="space-y-2">
              {filteredUUIDs.map((uuid, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm"
                >
                  <span className="text-sm font-mono text-gray-700 break-all">{uuid}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(uuid, index)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {copiedIndex === index ? <FiCheck size={18} /> : <FiCopy size={18} />}
                    </button>
                    <button
                      onClick={() => deleteUUID(index)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Generations (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.uuids.length} UUIDs (v{entry.version}, {entry.uuidLength} chars)
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

        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Generate UUID v1 (time-based) or v4 (random)</li>
            <li>Custom prefix, suffix, length, and case</li>
            <li>Search, copy, download, and delete UUIDs</li>
            <li>History of recent generations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UUIDGenerator;