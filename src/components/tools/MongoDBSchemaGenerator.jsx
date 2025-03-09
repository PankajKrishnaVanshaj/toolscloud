"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo } from "react-icons/fa";

const MongoDBSchemaGenerator = () => {
  const [collections, setCollections] = useState([
    {
      name: "users",
      fields: [
        { name: "_id", type: "ObjectId", required: true, index: false, unique: false, defaultValue: "" },
        { name: "email", type: "string", required: true, index: true, unique: true, defaultValue: "" },
        { name: "createdAt", type: "date", required: false, index: false, unique: false, defaultValue: "Date.now" },
      ],
    },
  ]);
  const [schema, setSchema] = useState("");
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [schemaType, setSchemaType] = useState("native"); // native or mongoose

  const MONGO_TYPES = [
    "string",
    "number",
    "boolean",
    "date",
    "ObjectId",
    "array",
    "object",
    "binary",
    "mixed",
  ];
  const MAX_COLLECTIONS = 20;
  const MAX_FIELDS = 30;

  const validateInput = useCallback(() => {
    if (!collections.length) return "Add at least one collection";
    if (collections.some((c) => !c.name.trim())) return "All collections need names";
    if (new Set(collections.map((c) => c.name)).size !== collections.length) return "Collection names must be unique";
    if (collections.some((c) => !/^[a-z][a-z0-9_]*$/.test(c.name)))
      return "Collection names must start with a lowercase letter and contain only letters, numbers, or underscores";

    for (const collection of collections) {
      if (!collection.fields.length) return `Collection "${collection.name}" needs at least one field`;
      if (collection.fields.some((f) => !f.name.trim())) return `All fields in "${collection.name}" need names`;
      if (new Set(collection.fields.map((f) => f.name)).size !== collection.fields.length)
        return `Field names in "${collection.name}" must be unique`;
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
      let schemaString = schemaType === "mongoose"
        ? "// MongoDB Schema Definition (Mongoose)\nconst mongoose = require('mongoose');\nconst { Schema } = mongoose;\n\n"
        : "// MongoDB Schema Definition (Native Driver)\n\n";

      collections.forEach((collection) => {
        if (schemaType === "mongoose") {
          schemaString += `const ${collection.name}Schema = new Schema({\n`;
          collection.fields.forEach((field) => {
            schemaString += `  ${field.name}: {\n`;
            schemaString += `    type: ${field.type === "ObjectId" ? "Schema.Types.ObjectId" : field.type.charAt(0).toUpperCase() + field.type.slice(1)},\n`;
            if (field.required) schemaString += "    required: true,\n";
            if (field.index) schemaString += "    index: true,\n";
            if (field.unique) schemaString += "    unique: true,\n";
            if (field.defaultValue) schemaString += `    default: ${field.defaultValue},\n`;
            schemaString += "  },\n";
          });
          schemaString += "}, { timestamps: true });\n";
          schemaString += `const ${collection.name.charAt(0).toUpperCase() + collection.name.slice(1)} = mongoose.model('${collection.name}', ${collection.name}Schema);\n\n`;
        } else {
          schemaString += `// Collection: ${collection.name}\n`;
          schemaString += `db.createCollection("${collection.name}", {\n`;
          schemaString += "  validator: {\n";
          schemaString += "    $jsonSchema: {\n";
          schemaString += '      bsonType: "object",\n';
          schemaString += "      required: [";
          const requiredFields = collection.fields.filter((f) => f.required).map((f) => `"${f.name}"`).join(", ");
          schemaString += requiredFields ? `${requiredFields}` : "";
          schemaString += "],\n";
          schemaString += "      properties: {\n";
          collection.fields.forEach((field) => {
            schemaString += `        ${field.name}: {\n`;
            schemaString += `          bsonType: "${field.type === "ObjectId" ? "objectId" : field.type}",\n`;
            if (field.unique) schemaString += "          uniqueItems: true,\n";
            if (field.defaultValue) schemaString += `          default: ${field.defaultValue},\n`;
            schemaString += "        },\n";
          });
          schemaString += "      }\n";
          schemaString += "    }\n";
          schemaString += "  }\n";
          schemaString += "});\n\n";

          const indexedFields = collection.fields.filter((f) => f.index || f.unique);
          if (indexedFields.length) {
            schemaString += `// Indexes for ${collection.name}\n`;
            indexedFields.forEach((field) => {
              schemaString += `db.${collection.name}.createIndex({ "${field.name}": 1 }, { unique: ${field.unique} });\n`;
            });
            schemaString += "\n";
          }
        }
      });

      setSchema(schemaString);
      setHistory((prev) => [...prev, { collections: [...collections], schema: schemaString, schemaType }].slice(-5));
      setIsCopied(false);
    } catch (e) {
      setError(`Schema generation failed: ${e.message}`);
    }
  }, [collections, schemaType]);

  const addCollection = () => {
    if (collections.length < MAX_COLLECTIONS) {
      setCollections([...collections, {
        name: `collection${collections.length + 1}`,
        fields: [{ name: "_id", type: "ObjectId", required: true, index: false, unique: false, defaultValue: "" }],
      }]);
    }
  };

  const updateCollection = (index, name) => {
    setCollections(collections.map((c, i) => (i === index ? { ...c, name } : c)));
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
        index: false,
        unique: false,
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
    if (collections[collectionIndex].fields.length > 1) {
      const newCollections = [...collections];
      newCollections[collectionIndex].fields = newCollections[collectionIndex].fields.filter((_, i) => i !== fieldIndex);
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
    link.download = `schema-${schemaType}-${Date.now()}.js`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const restoreFromHistory = (entry) => {
    setCollections(entry.collections);
    setSchema(entry.schema);
    setSchemaType(entry.schemaType);
    setError("");
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          MongoDB Schema Generator
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Schema Type Selection */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">Schema Type</label>
          <select
            value={schemaType}
            onChange={(e) => setSchemaType(e.target.value)}
            className="w-full sm:w-1/4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="native">Native MongoDB Driver</option>
            <option value="mongoose">Mongoose</option>
          </select>
        </div>

        <div className="space-y-6">
          {collections.map((collection, collectionIndex) => (
            <div key={collectionIndex} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                <input
                  type="text"
                  value={collection.name}
                  onChange={(e) => updateCollection(collectionIndex, e.target.value)}
                  placeholder="Collection name"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button
                  onClick={() => removeCollection(collectionIndex)}
                  disabled={collections.length <= 1}
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  Delete Collection
                </button>
              </div>

              <div className="space-y-3">
                {collection.fields.map((field, fieldIndex) => (
                  <div
                    key={fieldIndex}
                    className="flex flex-col sm:flex-row flex-wrap items-center gap-3 p-3 bg-white rounded-md border border-gray-200"
                  >
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateField(collectionIndex, fieldIndex, "name", e.target.value)}
                      placeholder="Field name"
                      className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateField(collectionIndex, fieldIndex, "type", e.target.value)}
                      className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {MONGO_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateField(collectionIndex, fieldIndex, "required", e.target.checked)}
                          className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm">Required</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={field.index}
                          onChange={(e) => updateField(collectionIndex, fieldIndex, "index", e.target.checked)}
                          className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm">Index</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={field.unique}
                          onChange={(e) => updateField(collectionIndex, fieldIndex, "unique", e.target.checked)}
                          className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm">Unique</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={field.defaultValue}
                      onChange={(e) => updateField(collectionIndex, fieldIndex, "defaultValue", e.target.value)}
                      placeholder="Default (e.g., Date.now)"
                      className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <button
                      onClick={() => removeField(collectionIndex, fieldIndex)}
                      disabled={collection.fields.length <= 1}
                      className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addField(collectionIndex)}
                  disabled={collection.fields.length >= MAX_FIELDS}
                  className="text-sm text-green-600 hover:text-green-800 disabled:text-gray-400"
                >
                  + Add Field {collection.fields.length >= MAX_FIELDS && `(Max ${MAX_FIELDS})`}
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addCollection}
            disabled={collections.length >= MAX_COLLECTIONS}
            className="text-sm text-green-600 hover:text-green-800 disabled:text-gray-400"
          >
            + Add Collection {collections.length >= MAX_COLLECTIONS && `(Max ${MAX_COLLECTIONS})`}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-6">
          <button
            onClick={generateSchema}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
          >
            Generate Schema
          </button>
          {schema && (
            <>
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-2 px-4 rounded-md transition-colors text-white flex items-center justify-center ${
                  isCopied ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
                }`}
              >
                <FaCopy className="mr-2" />
                {isCopied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={downloadSchema}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
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

        {schema && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Generated Schema:</h2>
            <pre className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto text-sm font-mono text-gray-800 whitespace-pre-wrap">
              {schema}
            </pre>
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Schemas (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.collections.length} collection(s) - {entry.schemaType}
                  </span>
                  <button
                    onClick={() => restoreFromHistory(entry)}
                    className="text-green-500 hover:text-green-700 transition-colors"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-green-100 rounded-lg border border-green-300">
          <h3 className="font-semibold text-green-700">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm">
            <li>Generate Native MongoDB or Mongoose schemas</li>
            <li>Support for required, indexed, and unique fields</li>
            <li>Custom default values</li>
            <li>Track and restore recent schemas</li>
            <li>Copy or download generated schemas</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MongoDBSchemaGenerator;