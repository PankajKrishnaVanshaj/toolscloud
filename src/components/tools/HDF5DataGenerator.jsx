"use client";
import React, { useState, useCallback } from "react";
import { saveAs } from "file-saver";
import { FaDownload, FaPlus, FaTrash, FaCopy } from "react-icons/fa";

const HDF5DataGenerator = () => {
  const [hdf5Structure, setHDF5Structure] = useState("");
  const [generatedData, setGeneratedData] = useState(null);
  const [count, setCount] = useState(5);
  const [groupName, setGroupName] = useState("root_group");
  const [datasetName, setDatasetName] = useState("dataset");
  const [fields, setFields] = useState([
    { name: "id", type: "int32", shape: [1] },
    { name: "value", type: "float64", shape: [1] },
    { name: "label", type: "string", shape: [1] },
  ]);
  const [attributes, setAttributes] = useState([{ name: "version", value: "1.0", type: "string" }]);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [compressionLevel, setCompressionLevel] = useState(0); // New: Compression simulation
  const [includeMetadata, setIncludeMetadata] = useState(true); // New: Metadata toggle

  const MAX_ITEMS = 1000;
  const FIELD_TYPES = ["int32", "int64", "float32", "float64", "string", "bool"];

  const generateRandomData = useCallback((type) => {
    const timestamp = Date.now();
    switch (type) {
      case "int32":
        return Math.floor(Math.random() * 1000000);
      case "int64":
        return Math.floor(Math.random() * 1000000000);
      case "float32":
        return parseFloat((Math.random() * 1000).toFixed(2));
      case "float64":
        return parseFloat((Math.random() * 1000000).toFixed(4));
      case "string":
        const prefixes = ["sample", "record", "entry", "data"];
        return `${prefixes[Math.floor(Math.random() * prefixes.length)]}_${timestamp}`;
      case "bool":
        return Math.random() > 0.5;
      default:
        return 0;
    }
  }, []);

  const generateHDF5Structure = useCallback(() => {
    let structure = `HDF5 Structure Description:\n`;
    structure += `Group: /${groupName}\n`;
    structure += `Dataset: /${groupName}/${datasetName}\n`;
    structure += `Shape: [${count}]\n`;
    structure += `Compression Level: ${compressionLevel} (0-9)\n\n`;

    structure += `Dataset Fields:\n`;
    fields.forEach((field) => {
      structure += `- ${field.name}: ${field.type} ${JSON.stringify(field.shape)}\n`;
    });

    structure += `\nAttributes:\n`;
    attributes.forEach((attr) => {
      structure += `- ${attr.name}: ${attr.type} = "${attr.value}"\n`;
    });

    if (includeMetadata) {
      structure += `\nMetadata:\n`;
      structure += `- Generated: ${new Date().toISOString()}\n`;
      structure += `- Tool: HDF5 Data Generator v1.0\n`;
    }

    return structure;
  }, [groupName, datasetName, count, fields, attributes, compressionLevel, includeMetadata]);

  const generateData = useCallback(() => {
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      setGeneratedData(null);
      setHDF5Structure("");
      return;
    }

    setError("");
    try {
      const dataset = Array.from({ length: Math.min(count, MAX_ITEMS) }, () => {
        return fields.reduce(
          (obj, field) => ({
            ...obj,
            [field.name]:
              field.shape[0] === 1
                ? generateRandomData(field.type)
                : Array.from({ length: field.shape[0] }, () => generateRandomData(field.type)),
          }),
          {}
        );
      });

      const attrObj = attributes.reduce((obj, attr) => ({ ...obj, [attr.name]: attr.value }), {});

      const dataStructure = {
        [groupName]: {
          [datasetName]: dataset,
          attributes: attrObj,
          ...(includeMetadata && {
            metadata: {
              generated: new Date().toISOString(),
              tool: "HDF5 Data Generator v1.0",
            },
          }),
        },
      };

      const jsonString = JSON.stringify(dataStructure);
      // Simulate compression effect on size (rough estimate)
      const compressionFactor = 1 - compressionLevel * 0.05;
      const binaryBuffer = new TextEncoder().encode(jsonString);
      const compressedSize = Math.round(binaryBuffer.length * compressionFactor);

      setGeneratedData({
        structure: dataStructure,
        binary: binaryBuffer,
        size: compressedSize,
      });
      setHDF5Structure(generateHDF5Structure());
      setIsCopied(false);
    } catch (err) {
      setError("Generation failed: " + err.message);
    }
  }, [
    count,
    fields,
    groupName,
    datasetName,
    attributes,
    compressionLevel,
    includeMetadata,
    generateRandomData,
    generateHDF5Structure,
  ]);

  const validateInputs = () => {
    if (fields.length === 0) return "Please add at least one field";
    if (!groupName.trim()) return "Group name cannot be empty";
    if (!datasetName.trim()) return "Dataset name cannot be empty";
    if (fields.some((f) => !f.name.trim())) return "All field names must be filled";
    if (new Set(fields.map((f) => f.name)).size !== fields.length) return "Field names must be unique";
    if (attributes.some((a) => !a.name.trim())) return "All attribute names must be filled";
    if (new Set(attributes.map((a) => a.name)).size !== attributes.length)
      return "Attribute names must be unique";
    return "";
  };

  const addField = () => {
    if (fields.length < 20) {
      setFields([...fields, { name: `field${fields.length + 1}`, type: "int32", shape: [1] }]);
    }
  };

  const addAttribute = () => {
    if (attributes.length < 10) {
      setAttributes([...attributes, { name: `attr${attributes.length + 1}`, value: "", type: "string" }]);
    }
  };

  const updateField = (index, key, value) => {
    setFields(fields.map((f, i) =>
      i === index ? { ...f, [key]: key === "shape" ? [parseInt(value) || 1] : value } : f
    ));
  };

  const updateAttribute = (index, key, value) => {
    setAttributes(attributes.map((a, i) => (i === index ? { ...a, [key]: value } : a)));
  };

  const removeField = (index) => {
    if (fields.length > 1) setFields(fields.filter((_, i) => i !== index));
  };

  const removeAttribute = (index) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy: " + err.message);
    }
  };

  const downloadFile = (content, fileName, type) => {
    try {
      const blob = new Blob([content], { type });
      saveAs(blob, fileName);
    } catch (err) {
      setError("Download failed: " + err.message);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">HDF5 Data Generator</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Input Controls */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Items (1-{MAX_ITEMS})
              </label>
              <input
                type="number"
                min="1"
                max={MAX_ITEMS}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(MAX_ITEMS, Number(e.target.value) || 1)))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value.trim() || "root_group")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., root_group"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dataset Name</label>
              <input
                type="text"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value.trim() || "dataset")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., dataset"
              />
            </div>
          </div>

          {/* Fields */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Fields ({fields.length}/20)
              </label>
              <button
                onClick={addField}
                disabled={fields.length >= 20}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
              >
                <FaPlus className="mr-1" /> Add Field
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {fields.map((field, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(index, "name", e.target.value)}
                    placeholder="Field Name"
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, "type", e.target.value)}
                    className="w-32 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {FIELD_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={field.shape[0]}
                    onChange={(e) => updateField(index, "shape", e.target.value)}
                    min="1"
                    className="w-20 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Shape"
                  />
                  <button
                    onClick={() => removeField(index)}
                    disabled={fields.length <= 1}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Attributes */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Attributes ({attributes.length}/10)
              </label>
              <button
                onClick={addAttribute}
                disabled={attributes.length >= 10}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
              >
                <FaPlus className="mr-1" /> Add Attribute
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {attributes.map((attr, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={attr.name}
                    onChange={(e) => updateAttribute(index, "name", e.target.value)}
                    placeholder="Attribute Name"
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={attr.value}
                    onChange={(e) => updateAttribute(index, "value", e.target.value)}
                    placeholder="Value"
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={attr.type}
                    onChange={(e) => updateAttribute(index, "type", e.target.value)}
                    className="w-32 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {["string", "int32", "float64"].map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeAttribute(index)}
                    disabled={attributes.length <= 1}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compression Level ({compressionLevel})
              </label>
              <input
                type="range"
                min="0"
                max="9"
                value={compressionLevel}
                onChange={(e) => setCompressionLevel(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Simulates compression (0-9)</p>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Include Metadata</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={generateData}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Generate HDF5 Data
          </button>
          {generatedData && (
            <>
              <button
                onClick={() => copyToClipboard(hdf5Structure)}
                className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                  isCopied ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
                } text-white`}
              >
                <FaCopy className="mr-2" /> {isCopied ? "Copied!" : "Copy Structure"}
              </button>
              <button
                onClick={() =>
                  downloadFile(hdf5Structure, `${datasetName}_structure.txt`, "text/plain")
                }
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download Structure
              </button>
              <button
                onClick={() =>
                  downloadFile(generatedData.binary, `${datasetName}.h5sim`, "application/octet-stream")
                }
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download Data
              </button>
            </>
          )}
        </div>

        {/* Generated Output */}
        {hdf5Structure && generatedData && (
          <div className="mt-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">HDF5 Structure Description</h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                  {hdf5Structure}
                </pre>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Generated Data ({count} items)
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                  {JSON.stringify(generatedData.structure, null, 2)}
                </pre>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Total items: {generatedData.structure[groupName][datasetName].length} | Simulated size:{" "}
              {(generatedData.size / 1024).toFixed(2)} KB
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable group and dataset names</li>
            <li>Dynamic field and attribute configuration</li>
            <li>Simulated compression levels (0-9)</li>
            <li>Optional metadata inclusion</li>
            <li>Download structure and data files</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HDF5DataGenerator;