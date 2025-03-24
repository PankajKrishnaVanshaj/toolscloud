"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo } from "react-icons/fa";

const InfluxDBSchemaGenerator = () => {
  const [measurements, setMeasurements] = useState([
    {
      name: "temperature",
      tags: [
        { name: "sensor_id", type: "tag" },
        { name: "location", type: "tag" },
      ],
      fields: [
        { name: "value", type: "FLOAT" },
        { name: "status", type: "STRING" },
      ],
      retentionPolicy: "30d",
      description: "", // New: Optional description
    },
  ]);
  const [schema, setSchema] = useState("");
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    includeComments: true, // Include explanatory comments in schema
    customRetention: false, // Toggle custom retention input
    customRetentionValue: "30d", // Custom retention duration
  });

  const FIELD_TYPES = ["FLOAT", "INTEGER", "STRING", "BOOLEAN"];
  const RETENTION_OPTIONS = ["1h", "12h", "1d", "7d", "30d", "90d", "infinite"];
  const MAX_MEASUREMENTS = 20;
  const MAX_TAGS = 15;
  const MAX_FIELDS = 15;

  const validateInput = useCallback(() => {
    if (!measurements.length) return "Add at least one measurement";
    if (measurements.some((m) => !m.name.trim())) return "All measurements need names";
    if (new Set(measurements.map((m) => m.name)).size !== measurements.length)
      return "Measurement names must be unique";
    if (measurements.some((m) => !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(m.name)))
      return "Measurement names must start with a letter and contain only letters, numbers, or underscores";

    for (const measurement of measurements) {
      if (!measurement.fields.length) return `Measurement "${measurement.name}" needs at least one field`;
      if ([...measurement.tags, ...measurement.fields].some((item) => !item.name.trim()))
        return `All tags and fields in "${measurement.name}" need names`;
      if (
        new Set([...measurement.tags, ...measurement.fields].map((item) => item.name)).size !==
        measurement.tags.length + measurement.fields.length
      )
        return `Tag and field names in "${measurement.name}" must be unique`;
    }
    if (options.customRetention && !/^\d+[hmsd]$/.test(options.customRetentionValue))
      return "Custom retention must be in format 'number + h/m/s/d' (e.g., '10h')";
    return "";
  }, [measurements, options]);

  const generateSchema = useCallback(() => {
    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      setSchema("");
      return;
    }

    setError("");
    try {
      let schemaString = options.includeComments
        ? `// InfluxDB Schema\n// Generated: ${new Date().toISOString()}\n\n`
        : "";

      measurements.forEach((measurement) => {
        const retention = options.customRetention ? options.customRetentionValue : measurement.retentionPolicy;

        if (options.includeComments) {
          schemaString += `// Bucket for ${measurement.name}${measurement.description ? `: ${measurement.description}` : ""}\n`;
        }
        schemaString += `influx bucket create --name ${measurement.name}_bucket --retention ${retention}\n\n`;
      });

      if (options.includeComments) schemaString += `// Example Line Protocol Data\n`;
      measurements.forEach((measurement) => {
        const tags = measurement.tags.map((tag) => `${tag.name}=example_${tag.name}`).join(",");
        const fields = measurement.fields
          .map((field) => {
            const value =
              field.type === "FLOAT"
                ? "23.5"
                : field.type === "INTEGER"
                ? "42"
                : field.type === "STRING"
                ? '"example"'
                : "true";
            return `${field.name}=${value}`;
          })
          .join(",");
        schemaString += `${measurement.name}${tags ? "," + tags : ""} ${fields} ${Math.floor(Date.now() / 1000)}\n`;
      });

      setSchema(schemaString);
      setHistory((prev) => [...prev, { measurements: [...measurements], schema: schemaString, options }].slice(-5));
      setIsCopied(false);
    } catch (e) {
      setError(`Schema generation failed: ${e.message}`);
    }
  }, [measurements, options]);

  const addMeasurement = () => {
    if (measurements.length < MAX_MEASUREMENTS) {
      setMeasurements([
        ...measurements,
        {
          name: `measurement${measurements.length + 1}`,
          tags: [],
          fields: [{ name: "value", type: "FLOAT" }],
          retentionPolicy: "30d",
          description: "",
        },
      ]);
    }
  };

  const updateMeasurement = (index, key, value) => {
    setMeasurements(measurements.map((m, i) => (i === index ? { ...m, [key]: value } : m)));
  };

  const removeMeasurement = (index) => {
    if (measurements.length > 1) setMeasurements(measurements.filter((_, i) => i !== index));
  };

  const addTag = (measurementIndex) => {
    if (measurements[measurementIndex].tags.length < MAX_TAGS) {
      const newMeasurements = [...measurements];
      newMeasurements[measurementIndex].tags.push({
        name: `tag${newMeasurements[measurementIndex].tags.length + 1}`,
        type: "tag",
      });
      setMeasurements(newMeasurements);
    }
  };

  const addField = (measurementIndex) => {
    if (measurements[measurementIndex].fields.length < MAX_FIELDS) {
      const newMeasurements = [...measurements];
      newMeasurements[measurementIndex].fields.push({
        name: `field${newMeasurements[measurementIndex].fields.length + 1}`,
        type: "FLOAT",
      });
      setMeasurements(newMeasurements);
    }
  };

  const updateItem = (measurementIndex, type, itemIndex, key, value) => {
    const newMeasurements = [...measurements];
    newMeasurements[measurementIndex][type][itemIndex][key] = value;
    setMeasurements(newMeasurements);
  };

  const removeItem = (measurementIndex, type, itemIndex) => {
    const newMeasurements = [...measurements];
    if (type === "fields" && newMeasurements[measurementIndex].fields.length <= 1) return;
    newMeasurements[measurementIndex][type] = newMeasurements[measurementIndex][type].filter((_, i) => i !== itemIndex);
    setMeasurements(newMeasurements);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(schema);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setError(`Copy failed: ${err.message}`);
    }
  };

  const downloadSchema = () => {
    const blob = new Blob([schema], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `influxdb-schema-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const restoreFromHistory = (entry) => {
    setMeasurements(entry.measurements);
    setSchema(entry.schema);
    setOptions(entry.options);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">InfluxDB Schema Generator</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>
        )}

        {/* Options Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <p className="text-sm font-medium text-gray-700">Schema Options:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.includeComments}
                onChange={() => setOptions((prev) => ({ ...prev, includeComments: !prev.includeComments }))}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-600">Include Comments</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.customRetention}
                onChange={() => setOptions((prev) => ({ ...prev, customRetention: !prev.customRetention }))}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-600">Custom Retention</label>
            </div>
            {options.customRetention && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Custom Retention (e.g., 10h):</label>
                <input
                  type="text"
                  value={options.customRetentionValue}
                  onChange={(e) => setOptions((prev) => ({ ...prev, customRetentionValue: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., 10h, 5d"
                />
              </div>
            )}
          </div>
        </div>

        {/* Measurements Section */}
        <div className="space-y-6">
          {measurements.map((measurement, measurementIndex) => (
            <div key={measurementIndex} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col gap-3 mb-4">
                <input
                  type="text"
                  value={measurement.name}
                  onChange={(e) => updateMeasurement(measurementIndex, "name", e.target.value)}
                  placeholder="Measurement name"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="text"
                  value={measurement.description}
                  onChange={(e) => updateMeasurement(measurementIndex, "description", e.target.value)}
                  placeholder="Optional description"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
                />
                {!options.customRetention && (
                  <select
                    value={measurement.retentionPolicy}
                    onChange={(e) => updateMeasurement(measurementIndex, "retentionPolicy", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
                  >
                    {RETENTION_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  onClick={() => removeMeasurement(measurementIndex)}
                  disabled={measurements.length <= 1}
                  className="w-full py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  Delete Measurement
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags</h3>
                  {measurement.tags.map((tag, tagIndex) => (
                    <div
                      key={tagIndex}
                      className="flex items-center gap-3 p-2 bg-white rounded-md border border-gray-200 mb-2"
                    >
                      <input
                        type="text"
                        value={tag.name}
                        onChange={(e) => updateItem(measurementIndex, "tags", tagIndex, "name", e.target.value)}
                        placeholder="Tag name"
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-500">tag</span>
                      <button
                        onClick={() => removeItem(measurementIndex, "tags", tagIndex)}
                        className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addTag(measurementIndex)}
                    disabled={measurement.tags.length >= MAX_TAGS}
                    className="mt-2 text-sm text-teal-600 hover:text-teal-800 disabled:text-gray-400"
                  >
                    + Add Tag {measurement.tags.length >= MAX_TAGS && `(Max ${MAX_TAGS})`}
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Fields</h3>
                  {measurement.fields.map((field, fieldIndex) => (
                    <div
                      key={fieldIndex}
                      className="flex items-center gap-3 p-2 bg-white rounded-md border border-gray-200 mb-2"
                    >
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => updateItem(measurementIndex, "fields", fieldIndex, "name", e.target.value)}
                        placeholder="Field name"
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
                      />
                      <select
                        value={field.type}
                        onChange={(e) => updateItem(measurementIndex, "fields", fieldIndex, "type", e.target.value)}
                        className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
                      >
                        {FIELD_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeItem(measurementIndex, "fields", fieldIndex)}
                        disabled={measurement.fields.length <= 1}
                        className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addField(measurementIndex)}
                    disabled={measurement.fields.length >= MAX_FIELDS}
                    className="mt-2 text-sm text-teal-600 hover:text-teal-800 disabled:text-gray-400"
                  >
                    + Add Field {measurement.fields.length >= MAX_FIELDS && `(Max ${MAX_FIELDS})`}
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={addMeasurement}
            disabled={measurements.length >= MAX_MEASUREMENTS}
            className="text-sm text-teal-600 hover:text-teal-800 disabled:text-gray-400"
          >
            + Add Measurement {measurements.length >= MAX_MEASUREMENTS && `(Max ${MAX_MEASUREMENTS})`}
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={generateSchema}
            className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition-colors"
          >
            Generate Schema
          </button>
          {schema && (
            <>
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-2 px-4 rounded-md transition-colors text-white ${
                  isCopied ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
                } flex items-center justify-center`}
              >
                <FaCopy className="mr-2" />
                {isCopied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={downloadSchema}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" />
                Download
              </button>
              <button
                onClick={() => setSchema("")}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaTrash className="mr-2" />
                Clear
              </button>
            </>
          )}
        </div>

        {/* Generated Schema */}
        {schema && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Generated Schema:</h2>
            <pre className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto text-sm font-mono text-gray-800 whitespace-pre-wrap">
              {schema}
            </pre>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Schemas (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.measurements.length} Measurement(s) - {entry.schema.split("\n")[0].slice(0, 30)}...
                  </span>
                  <button
                    onClick={() => restoreFromHistory(entry)}
                    className="text-teal-500 hover:text-teal-700 transition-colors"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-teal-100 rounded-lg border border-teal-300">
          <h3 className="font-semibold text-teal-700">Features</h3>
          <ul className="list-disc list-inside text-teal-600 text-sm">
            <li>Define measurements with tags and fields</li>
            <li>Custom retention policies or predefined options</li>
            <li>Add descriptions for documentation</li>
            <li>Generate, copy, download, and restore schemas</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InfluxDBSchemaGenerator;