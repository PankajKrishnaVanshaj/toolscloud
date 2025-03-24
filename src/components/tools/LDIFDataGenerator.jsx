"use client";
import React, { useState, useCallback } from "react";
import { saveAs } from "file-saver";
import { FaDownload, FaCopy, FaSync, FaPlus, FaTrash } from "react-icons/fa";

const LDIFDataGenerator = () => {
  const [ldifData, setLdifData] = useState("");
  const [count, setCount] = useState(5);
  const [baseDN, setBaseDN] = useState("dc=example,dc=com");
  const [objectClasses, setObjectClasses] = useState(["inetOrgPerson", "person", "organizationalPerson"]);
  const [attributes, setAttributes] = useState([
    { name: "uid", type: "string", required: true, customPrefix: "" },
    { name: "cn", type: "string", required: true, customPrefix: "" },
    { name: "sn", type: "string", required: true, customPrefix: "" },
    { name: "mail", type: "email", required: false, customPrefix: "" },
  ]);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const MAX_ITEMS = 1000;
  const ATTRIBUTE_TYPES = ["string", "email", "number", "boolean", "date"];

  const generateRandomData = useCallback((type, required, customPrefix = "") => {
    const timestamp = Date.now();
    let value;
    switch (type) {
      case "string":
        value = `${customPrefix || "user"}${timestamp}${Math.random().toString(36).substring(2, 8)}`;
        break;
      case "email":
        const domains = ["example.com", "test.org", "company.net"];
        value = `${customPrefix || "user"}${timestamp}${Math.random().toString(36).substring(2, 6)}@${
          domains[Math.floor(Math.random() * domains.length)]
        }`;
        break;
      case "number":
        value = Math.floor(Math.random() * 10000);
        break;
      case "boolean":
        value = Math.random() > 0.5 ? "TRUE" : "FALSE";
        break;
      case "date":
        value = new Date(Date.now() - Math.random() * 10000000000).toISOString().split("T")[0];
        break;
      default:
        value = "";
    }
    return required && !value ? generateRandomData(type, required, customPrefix) : value;
  }, []);

  const generateLDIF = useCallback(async () => {
    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      setLdifData("");
      return;
    }

    setError("");
    setIsGenerating(true);

    try {
      let ldifContent = `# LDIF Data Generated on ${new Date().toISOString()}\n`;
      ldifContent += "version: 1\n\n";

      const entries = Array.from({ length: Math.min(count, MAX_ITEMS) }, (_, index) => {
        const uid = generateRandomData("string", true, attributes.find((a) => a.name === "uid")?.customPrefix);
        let entry = `dn: uid=${uid},${baseDN}\n`;

        objectClasses.forEach((objClass) => {
          entry += `objectClass: ${objClass}\n`;
        });

        attributes.forEach((attr) => {
          const value = generateRandomData(attr.type, attr.required, attr.customPrefix);
          if (value || attr.required) {
            entry += `${attr.name}: ${value}\n`;
          }
        });

        entry += "\n";
        return entry;
      });

      ldifContent += entries.join("");
      setLdifData(ldifContent);
      setIsCopied(false);
    } catch (err) {
      setError("Generation failed: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  }, [count, baseDN, objectClasses, attributes, generateRandomData]);

  const validateFields = () => {
    if (attributes.length === 0) return "Please add at least one attribute";
    if (!baseDN.trim()) return "Base DN cannot be empty";
    if (objectClasses.length === 0) return "Please add at least one object class";
    if (attributes.some((attr) => !attr.name.trim())) return "All attribute names must be filled";
    if (new Set(attributes.map((a) => a.name)).size !== attributes.length)
      return "Attribute names must be unique";
    return "";
  };

  const addAttribute = () => {
    if (attributes.length < 20) {
      setAttributes([
        ...attributes,
        { name: `attr${attributes.length + 1}`, type: "string", required: false, customPrefix: "" },
      ]);
    }
  };

  const updateAttribute = (index, key, value) => {
    setAttributes(attributes.map((attr, i) => (i === index ? { ...attr, [key]: value } : attr)));
  };

  const removeAttribute = (index) => {
    if (attributes.length > 1) {
      setAttributes(attributes.filter((_, i) => i !== index));
    }
  };

  const addObjectClass = () => {
    const newClass = prompt("Enter new object class:")?.trim();
    if (newClass && !objectClasses.includes(newClass)) {
      setObjectClasses([...objectClasses, newClass]);
    }
  };

  const removeObjectClass = (index) => {
    if (objectClasses.length > 1) {
      setObjectClasses(objectClasses.filter((_, i) => i !== index));
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(ldifData);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy: " + err.message);
    }
  };

  const downloadFile = () => {
    try {
      const blob = new Blob([ldifData], { type: "text/plain;charset=utf-8" });
      saveAs(blob, `data-${Date.now()}.ldif`);
    } catch (err) {
      setError("Download failed: " + err.message);
    }
  };

  const reset = () => {
    setLdifData("");
    setCount(5);
    setBaseDN("dc=example,dc=com");
    setObjectClasses(["inetOrgPerson", "person", "organizationalPerson"]);
    setAttributes([
      { name: "uid", type: "string", required: true, customPrefix: "" },
      { name: "cn", type: "string", required: true, customPrefix: "" },
      { name: "sn", type: "string", required: true, customPrefix: "" },
      { name: "mail", type: "email", required: false, customPrefix: "" },
    ]);
    setIsCopied(false);
    setError("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">LDIF Data Generator</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* General Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Entries (1-{MAX_ITEMS})
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
                disabled={isGenerating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base DN</label>
              <input
                type="text"
                value={baseDN}
                onChange={(e) => setBaseDN(e.target.value.trim() || "dc=example,dc=com")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., dc=example,dc=com"
                disabled={isGenerating}
              />
            </div>
          </div>

          {/* Object Classes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Object Classes ({objectClasses.length})
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {objectClasses.map((objClass, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={objClass}
                    onChange={(e) => {
                      const newClasses = [...objectClasses];
                      newClasses[index] = e.target.value.trim();
                      setObjectClasses(newClasses);
                    }}
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    disabled={isGenerating}
                  />
                  <button
                    onClick={() => removeObjectClass(index)}
                    disabled={objectClasses.length <= 1 || isGenerating}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addObjectClass}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
              disabled={isGenerating}
            >
              <FaPlus className="inline mr-1" /> Add Object Class
            </button>
          </div>

          {/* Attributes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attributes ({attributes.length})
            </label>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {attributes.map((attr, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 items-center">
                  <input
                    type="text"
                    value={attr.name}
                    onChange={(e) => updateAttribute(index, "name", e.target.value)}
                    placeholder="Attribute Name"
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    disabled={isGenerating}
                  />
                  <select
                    value={attr.type}
                    onChange={(e) => updateAttribute(index, "type", e.target.value)}
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    disabled={isGenerating}
                  >
                    {ATTRIBUTE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={attr.customPrefix}
                    onChange={(e) => updateAttribute(index, "customPrefix", e.target.value)}
                    placeholder="Custom Prefix"
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    disabled={isGenerating}
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={attr.required}
                      onChange={(e) => updateAttribute(index, "required", e.target.checked)}
                      className="mr-2 accent-blue-500"
                      disabled={isGenerating}
                    />
                    <span className="text-sm text-gray-600">Required</span>
                  </label>
                  <button
                    onClick={() => removeAttribute(index)}
                    disabled={attributes.length <= 1 || isGenerating}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addAttribute}
              disabled={attributes.length >= 20 || isGenerating}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              <FaPlus className="inline mr-1" /> Add Attribute{" "}
              {attributes.length >= 20 && "(Max 20)"}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateLDIF}
              disabled={isGenerating}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isGenerating ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              ) : null}
              {isGenerating ? "Generating..." : "Generate LDIF"}
            </button>
            {ldifData && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                    isCopied
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" />
                  {isCopied ? "Copied!" : "Copy LDIF"}
                </button>
                <button
                  onClick={downloadFile}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download LDIF
                </button>
                <button
                  onClick={reset}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <FaSync className="mr-2" /> Reset
                </button>
              </>
            )}
          </div>

          {/* Generated LDIF */}
          {ldifData && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Generated LDIF Data ({count} entries):
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-auto">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{ldifData}</pre>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Size: {(ldifData.length / 1024).toFixed(2)} KB
              </div>
            </div>
          )}

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Generate up to {MAX_ITEMS} LDIF entries</li>
              <li>Customizable object classes and attributes</li>
              <li>New attribute type: date</li>
              <li>Custom prefixes for string and email attributes</li>
              <li>Copy to clipboard and download as .ldif file</li>
              <li>Real-time validation and error handling</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LDIFDataGenerator;