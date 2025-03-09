// components/ArangoDBSchemaGenerator.jsx
"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo, FaPlus } from "react-icons/fa";

const ArangoDBSchemaGenerator = () => {
  const [collections, setCollections] = useState([
    {
      name: "users",
      type: "document",
      fields: [
        { name: "_key", type: "string", required: true, defaultValue: "" },
        { name: "name", type: "string", required: false, defaultValue: "" },
        { name: "email", type: "string", required: true, defaultValue: "" },
      ],
    },
    {
      name: "friendships",
      type: "edge",
      fields: [
        { name: "_key", type: "string", required: true, defaultValue: "" },
        { name: "_from", type: "string", required: true, defaultValue: "" },
        { name: "_to", type: "string", required: true, defaultValue: "" },
      ],
    },
  ]);
  const [schema, setSchema] = useState("");
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    schemaLevel: "moderate", // none, moderate, strict
    allowAdditionalProperties: true,
    includeComments: true,
  });

  const ARANGO_TYPES = ["string", "number", "boolean", "object", "array"];
  const MAX_COLLECTIONS = 20;
  const MAX_FIELDS = 30;

  const validateInput = useCallback(() => {
    if (!collections.length) return "Add at least one collection";
    if (collections.some((c) => !c.name.trim())) return "All collections need names";
    if (new Set(collections.map((c) => c.name)).size !== collections.length)
      return "Collection names must be unique";
    if (collections.some((c) => !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(c.name)))
      return "Collection names must start with a letter and contain only letters, numbers, underscores, or hyphens";

    for (const collection of collections) {
      if (!collection.fields.length) return `Collection "${collection.name}" needs at least one field`;
      if (collection.fields.some((f) => !f.name.trim()))
        return `All fields in "${collection.name}" need names`;
      if (new Set(collection.fields.map((f) => f.name)).size !== collection.fields.length)
        return `Field names in "${collection.name}" must be unique`;
      if (
        collection.type === "edge" &&
        (!collection.fields.some((f) => f.name === "_from") ||
          !collection.fields.some((f) => f.name === "_to"))
      ) {
        return `Edge collection "${collection.name}" must have _from and _to fields`;
      }
    }
    return "";
  }, [collections]);

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
        ? `// ArangoDB Schema\n// Generated: ${new Date().toISOString()}\n\n`
        : "";

      collections.forEach((collection) => {
        if (options.includeComments) {
          schemaString += `// Create ${collection.type} collection\n`;
        }
        schemaString += `db._create${collection.type === "edge" ? "Edge" : ""}Collection("${
          collection.name
        }");\n\n`;

        if (options.includeComments) {
          schemaString += `// Schema for ${collection.name}\n`;
        }
        schemaString += `db.${collection.name}.ensureSchema({\n`;
        schemaString += `  rule: {\n`;
        schemaString += `    type: "object",\n`;
        schemaString += `    properties: {\n`;

        collection.fields.forEach((field) => {
          schemaString += `      "${field.name}": { type: "${field.type}"${
            field.required ? ", required: true" : ""
          }${field.defaultValue ? `, default: ${JSON.stringify(field.defaultValue)}` : ""} },\n`;
        });

        schemaString += `    },\n`;
        schemaString += `    required: [${collection.fields
          .filter((f) => f.required)
          .map((f) => `"${f.name}"`)
          .join(", ")}],\n`;
        schemaString += `    additionalProperties: ${options.allowAdditionalProperties},\n`;
        schemaString += `  },\n`;
        schemaString += `  level: "${options.schemaLevel}",\n`;
        schemaString += `  message: "Document does not conform to schema"\n`;
        schemaString += `});\n\n`;
      });

      setSchema(schemaString);
      setHistory((prev) => [...prev, { collections: [...collections], schema: schemaString, options }].slice(-5));
      setIsCopied(false);
    } catch (e) {
      setError(`Schema generation failed: ${e.message}`);
    }
  }, [collections, options]);

  const addCollection = () => {
    if (collections.length < MAX_COLLECTIONS) {
      const newCollection = {
        name: `collection${collections.length + 1}`,
        type: "document",
        fields: [{ name: "_key", type: "string", required: true, defaultValue: "" }],
      };
      setCollections([...collections, newCollection]);
    }
  };

  const updateCollection = (index, key, value) => {
    const newCollections = [...collections];
    newCollections[index][key] = value;
    if (key === "type" && value === "edge") {
      const hasFrom = newCollections[index].fields.some((f) => f.name === "_from");
      const hasTo = newCollections[index].fields.some((f) => f.name === "_to");
      if (!hasFrom)
        newCollections[index].fields.push({ name: "_from", type: "string", required: true, defaultValue: "" });
      if (!hasTo)
        newCollections[index].fields.push({ name: "_to", type: "string", required: true, defaultValue: "" });
    }
    setCollections(newCollections);
  };

  const removeCollection = (index) => {
    if (collections.length > 1) {
      setCollections(collections.filter((_, i) => i !== index));
    }
  };

  const addField = (collectionIndex) => {
    if (collections[collectionIndex].fields.length < MAX_FIELDS) {
      const newCollections = [...collections];
      newCollections[collectionIndex].fields.push({
        name: `field${newCollections[collectionIndex].fields.length + 1}`,
        type: "string",
        required: false,
        defaultValue: "",
      });
      setCollections(newCollections);
    }
  };

  const updateField = (collectionIndex, fieldIndex, key, value) => {
    const newCollections = [...collections];
    newCollections[collectionIndex].fields[fieldIndex][key] = value;
    setCollections(newCollections);
  };

  const removeField = (collectionIndex, fieldIndex) => {
    const newCollections = [...collections];
    const collection = newCollections[collectionIndex];
    const fieldName = collection.fields[fieldIndex].name;

    if (collection.type === "edge" && (fieldName === "_from" || fieldName === "_to")) {
      setError(`Cannot remove ${fieldName} from edge collection "${collection.name}"`);
      return;
    }

    if (collection.fields.length > 1) {
      newCollections[collectionIndex].fields = collection.fields.filter((_, i) => i !== fieldIndex);
      setCollections(newCollections);
    }
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
    link.download = `schema-${Date.now()}.js`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const restoreFromHistory = (entry) => {
    setCollections(entry.collections);
    setSchema(entry.schema);
    setOptions(entry.options);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          ArangoDB Schema Generator
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Advanced Options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Schema Options:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Validation Level:</label>
              <select
                value={options.schemaLevel}
                onChange={(e) => setOptions((prev) => ({ ...prev, schemaLevel: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="none">None</option>
                <option value="moderate">Moderate</option>
                <option value="strict">Strict</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.allowAdditionalProperties}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, allowAdditionalProperties: e.target.checked }))
                }
                className="h-4 w-4 text-purple-600 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-600">Allow Additional Properties</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.includeComments}
                onChange={(e) => setOptions((prev) => ({ ...prev, includeComments: e.target.checked }))}
                className="h-4 w-4 text-purple-600 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-600">Include Comments</label>
            </div>
          </div>
        </div>

        {/* Collections */}
        <div className="space-y-6">
          {collections.map((collection, collectionIndex) => (
            <div
              key={collectionIndex}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
                <input
                  type="text"
                  value={collection.name}
                  onChange={(e) => updateCollection(collectionIndex, "name", e.target.value)}
                  placeholder="Collection name"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <select
                  value={collection.type}
                  onChange={(e) => updateCollection(collectionIndex, "type", e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="document">Document</option>
                  <option value="edge">Edge</option>
                </select>
                <button
                  onClick={() => removeCollection(collectionIndex)}
                  disabled={collections.length <= 1}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors flex items-center"
                >
                  <FaTrash className="mr-1" /> Delete
                </button>
              </div>
              {collection.type === "edge" && (
                <p className="text-sm text-gray-600 mb-2">
                  Edge collections require _from and _to fields
                </p>
              )}

              <div className="space-y-3">
                {collection.fields.map((field, fieldIndex) => (
                  <div
                    key={fieldIndex}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-white rounded-md border border-gray-200"
                  >
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateField(collectionIndex, fieldIndex, "name", e.target.value)}
                      placeholder="Field name"
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      disabled={collection.type === "edge" && (field.name === "_from" || field.name === "_to")}
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateField(collectionIndex, fieldIndex, "type", e.target.value)}
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      {ARANGO_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) =>
                          updateField(collectionIndex, fieldIndex, "required", e.target.checked)
                        }
                        className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                        disabled={collection.type === "edge" && (field.name === "_from" || field.name === "_to")}
                      />
                      <span className="text-sm">Required</span>
                    </label>
                    <input
                      type="text"
                      value={field.defaultValue}
                      onChange={(e) =>
                        updateField(collectionIndex, fieldIndex, "defaultValue", e.target.value)
                      }
                      placeholder="Default value"
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <button
                      onClick={() => removeField(collectionIndex, fieldIndex)}
                      disabled={
                        collection.fields.length <= 1 ||
                        (collection.type === "edge" && (field.name === "_from" || field.name === "_to"))
                      }
                      className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addField(collectionIndex)}
                  disabled={collections[collectionIndex].fields.length >= MAX_FIELDS}
                  className="text-sm text-purple-600 hover:text-purple-800 disabled:text-gray-400 flex items-center"
                >
                  <FaPlus className="mr-1" /> Add Field{" "}
                  {collections[collectionIndex].fields.length >= MAX_FIELDS && `(Max ${MAX_FIELDS})`}
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addCollection}
            disabled={collections.length >= MAX_COLLECTIONS}
            className="text-sm text-purple-600 hover:text-purple-800 disabled:text-gray-400 flex items-center"
          >
            <FaPlus className="mr-1" /> Add Collection{" "}
            {collections.length >= MAX_COLLECTIONS && `(Max ${MAX_COLLECTIONS})`}
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={generateSchema}
            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
          >
            Generate Schema
          </button>
          {schema && (
            <>
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center text-white ${
                  isCopied ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
                }`}
              >
                <FaCopy className="mr-2" />
                {isCopied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={downloadSchema}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" />
                Download (.js)
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
                    {entry.collections.length} collections - {entry.schema.slice(0, 30)}...
                  </span>
                  <button
                    onClick={() => restoreFromHistory(entry)}
                    className="text-purple-500 hover:text-purple-700 transition-colors"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-purple-100 rounded-lg border border-purple-300">
          <h3 className="font-semibold text-purple-700">Features</h3>
          <ul className="list-disc list-inside text-purple-600 text-sm">
            <li>Generate schemas for document and edge collections</li>
            <li>Customizable field types, required flags, and defaults</li>
            <li>Advanced options: validation level, additional properties, comments</li>
            <li>Copy, download, and restore from history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ArangoDBSchemaGenerator;