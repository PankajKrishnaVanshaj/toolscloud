"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaCopy, FaSync, FaPlus, FaTrash } from "react-icons/fa";

const INIDataGenerator = () => {
  const [iniData, setIniData] = useState("");
  const [count, setCount] = useState(5);
  const [sections, setSections] = useState([
    {
      name: "Settings",
      keys: [
        { name: "id", type: "number" },
        { name: "username", type: "text" },
        { name: "active", type: "boolean" },
      ],
    },
  ]);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [prefix, setPrefix] = useState(""); // New: Section name prefix
  const [commentStyle, setCommentStyle] = useState("none"); // New: Add comments

  const MAX_ITEMS = 100;
  const MAX_SECTIONS = 10;
  const MAX_KEYS = 20;
  const FIELD_TYPES = ["number", "text", "boolean", "date", "enum", "float"];
  const ENUM_OPTIONS = ["low", "medium", "high", "critical"];
  const COMMENT_STYLES = ["none", "basic", "detailed"];

  // Random data generation
  const generateRandomData = useCallback((type) => {
    const timestamp = Date.now();
    switch (type) {
      case "number":
        return Math.floor(Math.random() * 10000) + 1;
      case "float":
        return (Math.random() * 100).toFixed(2);
      case "text":
        const prefixes = ["user", "client", "admin", "test", "dev"];
        return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${Math.random()
          .toString(36)
          .substring(2, 8)}`;
      case "boolean":
        return Math.random() > 0.5 ? "true" : "false";
      case "date":
        const date = new Date(timestamp - Math.random() * 31536000000);
        return date.toISOString().split("T")[0];
      case "enum":
        return ENUM_OPTIONS[Math.floor(Math.random() * ENUM_OPTIONS.length)];
      default:
        return "";
    }
  }, []);

  // Validation
  const validateConfig = useCallback(() => {
    if (sections.length === 0) return "Please add at least one section";
    if (sections.some((section) => !section.name.trim()))
      return "All section names must be filled";
    if (sections.some((section) => section.keys.length === 0))
      return "Each section must have at least one key";
    if (sections.some((section) => section.keys.some((key) => !key.name.trim())))
      return "All key names must be filled";
    const allKeys = sections.flatMap((s) => s.keys.map((k) => `${s.name}.${k.name}`));
    if (new Set(allKeys).size !== allKeys.length)
      return "Key names must be unique within and across sections";
    return "";
  }, [sections]);

  // INI generation with comments
  const generateINI = useCallback(() => {
    const validationError = validateConfig();
    if (validationError) {
      setError(validationError);
      setIniData("");
      return;
    }

    setError("");
    try {
      let result = "";
      const itemCount = Math.min(count, MAX_ITEMS);

      for (let i = 0; i < itemCount; i++) {
        sections.forEach((section, sectionIdx) => {
          const sectionName = `${prefix}${section.name}${itemCount > 1 ? i + 1 : ""}`;
          if (commentStyle === "basic") result += `; Section ${sectionName}\n`;
          else if (commentStyle === "detailed")
            result += `; Section ${sectionName} - Generated on ${new Date().toLocaleString()}\n`;
          result += `[${sectionName}]\n`;

          section.keys.forEach((key) => {
            if (commentStyle === "detailed")
              result += `; ${key.name} (${key.type})\n`;
            result += `${key.name}=${generateRandomData(key.type)}\n`;
          });
          if (sectionIdx < sections.length - 1 || i < itemCount - 1) result += "\n";
        });
      }

      setIniData(result.trim());
      setIsCopied(false);
    } catch (e) {
      setError("Error generating INI: " + e.message);
    }
  }, [count, sections, prefix, commentStyle, generateRandomData, validateConfig]);

  // Section and key management
  const addSection = () => {
    if (sections.length < MAX_SECTIONS) {
      setSections([
        ...sections,
        { name: `Section${sections.length + 1}`, keys: [{ name: "key1", type: "text" }] },
      ]);
    }
  };

  const updateSectionName = (index, name) => {
    setSections(sections.map((s, i) => (i === index ? { ...s, name } : s)));
  };

  const removeSection = (index) => {
    if (sections.length > 1) {
      setSections(sections.filter((_, i) => i !== index));
    }
  };

  const addKey = (sectionIndex) => {
    setSections(
      sections.map((section, i) => {
        if (i !== sectionIndex || section.keys.length >= MAX_KEYS) return section;
        return {
          ...section,
          keys: [...section.keys, { name: `key${section.keys.length + 1}`, type: "text" }],
        };
      })
    );
  };

  const updateKey = (sectionIndex, keyIndex, field, value) => {
    setSections(
      sections.map((section, i) => {
        if (i !== sectionIndex) return section;
        return {
          ...section,
          keys: section.keys.map((key, k) =>
            k === keyIndex ? { ...key, [field]: value } : key
          ),
        };
      })
    );
  };

  const removeKey = (sectionIndex, keyIndex) => {
    setSections(
      sections.map((section, i) => {
        if (i !== sectionIndex || section.keys.length <= 1) return section;
        return {
          ...section,
          keys: section.keys.filter((_, k) => k !== keyIndex),
        };
      })
    );
  };

  // Utility functions
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(iniData);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard: " + err.message);
    }
  };

  const downloadAsINI = () => {
    try {
      const blob = new Blob([iniData], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `config-${Date.now()}.ini`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download: " + err.message);
    }
  };

  const clearData = () => {
    setIniData("");
    setCount(5);
    setSections([{ name: "Settings", keys: [{ name: "key1", type: "text" }] }]);
    setPrefix("");
    setCommentStyle("none");
    setIsCopied(false);
    setError("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          INI Data Generator
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Configuration */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Items (1-{MAX_ITEMS})
              </label>
              <input
                type="number"
                min="1"
                max={MAX_ITEMS}
                value={count}
                onChange={(e) =>
                  setCount(Math.max(1, Math.min(MAX_ITEMS, Number(e.target.value) || 1)))
                }
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section Prefix (Optional)
              </label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="e.g., Config_"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comment Style
              </label>
              <select
                value={commentStyle}
                onChange={(e) => setCommentStyle(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {COMMENT_STYLES.map((style) => (
                  <option key={style} value={style}>
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sections */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sections ({sections.length}/{MAX_SECTIONS})
            </label>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {sections.map((section, sectionIndex) => (
                <div
                  key={sectionIndex}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={section.name}
                      onChange={(e) => updateSectionName(sectionIndex, e.target.value)}
                      placeholder="Section Name"
                      className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeSection(sectionIndex)}
                      disabled={sections.length <= 1}
                      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {section.keys.map((key, keyIndex) => (
                      <div key={keyIndex} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={key.name}
                          onChange={(e) =>
                            updateKey(sectionIndex, keyIndex, "name", e.target.value)
                          }
                          placeholder="Key Name"
                          className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                          value={key.type}
                          onChange={(e) =>
                            updateKey(sectionIndex, keyIndex, "type", e.target.value)
                          }
                          className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                          {FIELD_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => removeKey(sectionIndex, keyIndex)}
                          disabled={section.keys.length <= 1}
                          className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => addKey(sectionIndex)}
                    disabled={section.keys.length >= MAX_KEYS}
                    className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                  >
                    <FaPlus className="mr-1" /> Add Key{" "}
                    {section.keys.length >= MAX_KEYS && `(Max ${MAX_KEYS})`}
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addSection}
              disabled={sections.length >= MAX_SECTIONS}
              className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              <FaPlus className="mr-1" /> Add Section{" "}
              {sections.length >= MAX_SECTIONS && `(Max ${MAX_SECTIONS})`}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={generateINI}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Generate INI
          </button>
          {iniData && (
            <>
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                  isCopied
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-600 text-white hover:bg-gray-700"
                }`}
              >
                <FaCopy className="mr-2" /> {isCopied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={downloadAsINI}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
              <button
                onClick={clearData}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </>
          )}
        </div>

        {/* Generated INI */}
        {iniData && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated INI Data ({count} items):
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-80 overflow-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                {iniData}
              </pre>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Generate multiple INI sections with custom keys</li>
            <li>Support for various data types: Number, Float, Text, Boolean, Date, Enum</li>
            <li>Custom section prefix and comment styles</li>
            <li>Copy to clipboard and download as .ini file</li>
            <li>Validation for unique keys and required fields</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default INIDataGenerator;