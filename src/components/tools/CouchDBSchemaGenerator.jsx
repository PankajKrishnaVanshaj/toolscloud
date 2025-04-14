"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo } from "react-icons/fa";

const CouchDBSchemaGenerator = () => {
  const [documents, setDocuments] = useState([
    {
      name: "user",
      fields: [
        { name: "_id", type: "string", required: true, defaultValue: "", validation: "" },
        { name: "type", type: "string", required: true, defaultValue: "user", validation: "" },
        { name: "username", type: "string", required: true, defaultValue: "", validation: "^[a-zA-Z0-9_]{3,20}$" },
        { name: "email", type: "string", required: false, defaultValue: "", validation: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$" },
        { name: "created_at", type: "timestamp", required: true, defaultValue: "new Date().toISOString()", validation: "" },
      ],
      views: [
        {
          name: "by_username",
          map: 'function(doc) { if (doc.type === "user") emit(doc.username, doc); }',
          reduce: "",
        },
      ],
    },
  ]);
  const [schema, setSchema] = useState("");
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [exportFormat, setExportFormat] = useState("json"); // json, js
  const [showAlert, setShowAlert] = useState(false);

  const COUCH_TYPES = ["string", "number", "boolean", "array", "object", "timestamp"];
  const MAX_DOCUMENTS = 20;
  const MAX_FIELDS = 30;
  const MAX_VIEWS = 10;

  const validateInput = useCallback(() => {
    if (!documents.length) return "Add at least one document type";
    if (documents.some((d) => !d.name.trim())) return "All document types need names";
    if (new Set(documents.map((d) => d.name)).size !== documents.length) return "Document names must be unique";
    if (documents.some((d) => !/^[a-z][a-z0-9_]*$/.test(d.name)))
      return "Document names must start with a lowercase letter and contain only letters, numbers, or underscores";

    for (const doc of documents) {
      if (!doc.fields.length) return `Document "${doc.name}" needs at least one field`;
      if (doc.fields.some((f) => !f.name.trim())) return `All fields in "${doc.name}" need names`;
      if (new Set(doc.fields.map((f) => f.name)).size !== doc.fields.length)
        return `Field names in "${doc.name}" must be unique`;
      if (!doc.fields.some((f) => f.name === "_id")) return `Document "${doc.name}" needs an "_id" field`;
      if (doc.views.some((v) => !v.name.trim())) return `All views in "${doc.name}" need names`;
      if (doc.views.some((v) => !v.map.trim())) return `All views in "${doc.name}" need a map function`;
      if (doc.fields.some((f) => f.validation && !isValidRegex(f.validation)))
        return `Invalid regex validation in "${doc.name}" for field "${f.name}"`;
    }
    return "";
  }, [documents]);

  const isValidRegex = (pattern) => {
    try {
      new RegExp(pattern);
      return true;
    } catch {
      return false;
    }
  };

  const generateSchema = useCallback(() => {
    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      setSchema("");
      return;
    }

    setError("");
    try {
      let schemaString = `// CouchDB Schema\n// Generated: ${new Date().toISOString()}\n\n`;

      documents.forEach((doc) => {
        // Document template
        schemaString += `// Document template for "${doc.name}"\n`;
        const docTemplate = {
          _id: doc.fields.find((f) => f.name === "_id").defaultValue || "<unique-id>",
          type: doc.name,
        };
        const validations = {};
        doc.fields.forEach((field) => {
          if (field.name !== "_id" && field.name !== "type") {
            let value;
            switch (field.type) {
              case "string":
                value = field.defaultValue || "";
                break;
              case "number":
                value = field.defaultValue ? Number(field.defaultValue) : 0;
                break;
              case "boolean":
                value = field.defaultValue === "true";
                break;
              case "array":
                value = field.defaultValue ? JSON.parse(field.defaultValue) : [];
                break;
              case "object":
                value = field.defaultValue ? JSON.parse(field.defaultValue) : {};
                break;
              case "timestamp":
                value = field.defaultValue || "new Date().toISOString()";
                break;
            }
            docTemplate[field.name] = value;
          }
          if (field.validation) validations[field.name] = field.validation;
        });
        schemaString += JSON.stringify(docTemplate, null, 2);
        if (Object.keys(validations).length) {
          schemaString += `\n// Validation rules for "${doc.name}"\n${JSON.stringify(validations, null, 2)}`;
        }
        schemaString += "\n\n";

        // Design document
        if (doc.views.length) {
          schemaString += `// Design document for "${doc.name}"\n`;
          const designDoc = {
            _id: `_design/${doc.name}`,
            views: {},
          };
          doc.views.forEach((view) => {
            designDoc.views[view.name] = { map: view.map };
            if (view.reduce) designDoc.views[view.name].reduce = view.reduce;
          });
          schemaString += JSON.stringify(designDoc, null, 2) + "\n\n";
        }
      });

      if (exportFormat === "js") {
        schemaString = `export const schema = ${JSON.stringify(
          { documents },
          null,
          2
        )};\n\n${schemaString}`;
      }

      setSchema(schemaString);
      setHistory((prev) => [...prev, { documents, schema: schemaString, format: exportFormat }].slice(-5));
      setIsCopied(false);
    } catch (e) {
      setError(`Schema generation failed: ${e.message}`);
    }
  }, [documents, exportFormat]);

  const addDocument = () => {
    if (documents.length < MAX_DOCUMENTS) {
      setDocuments([
        ...documents,
        {
          name: `doc${documents.length + 1}`,
          fields: [{ name: "_id", type: "string", required: true, defaultValue: "", validation: "" }],
          views: [],
        },
      ]);
    }
  };

  const updateDocument = (index, key, value) => {
    setDocuments(documents.map((d, i) => (i === index ? { ...d, [key]: value } : d)));
  };

  const removeDocument = (index) => {
    if (documents.length > 1) setDocuments(documents.filter((_, i) => i !== index));
  };

  const addField = (docIndex) => {
    if (documents[docIndex].fields.length < MAX_FIELDS) {
      const newDocs = [...documents];
      newDocs[docIndex].fields.push({
        name: `field${newDocs[docIndex].fields.length + 1}`,
        type: "string",
        required: false,
        defaultValue: "",
        validation: "",
      });
      setDocuments(newDocs);
    }
  };

  const updateField = (docIndex, fieldIndex, key, value) => {
    const newDocs = [...documents];
    newDocs[docIndex].fields[fieldIndex][key] = value;
    setDocuments(newDocs);
  };

  const removeField = (docIndex, fieldIndex) => {
    if (documents[docIndex].fields.length > 1) {
      const newDocs = [...documents];
      newDocs[docIndex].fields = newDocs[docIndex].fields.filter((_, i) => i !== fieldIndex);
      setDocuments(newDocs);
    }
  };

  const addView = (docIndex) => {
    if (documents[docIndex].views.length < MAX_VIEWS) {
      const newDocs = [...documents];
      newDocs[docIndex].views.push({
        name: `view${newDocs[docIndex].views.length + 1}`,
        map: "function(doc) { emit(doc._id, doc); }",
        reduce: "",
      });
      setDocuments(newDocs);
    }
  };

  const updateView = (docIndex, viewIndex, key, value) => {
    const newDocs = [...documents];
    newDocs[docIndex].views[viewIndex][key] = value;
    setDocuments(newDocs);
  };

  const removeView = (docIndex, viewIndex) => {
    const newDocs = [...documents];
    newDocs[docIndex].views = newDocs[docIndex].views.filter((_, i) => i !== viewIndex);
    setDocuments(newDocs);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(schema);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    } catch (err) {
      setError(`Copy failed: ${err.message}`);
    }
  };

  const downloadSchema = () => {
    const blob = new Blob([schema], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `schema-${Date.now()}.${exportFormat}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const restoreFromHistory = (entry) => {
    setDocuments(entry.documents);
    setSchema(entry.schema);
    setExportFormat(entry.format);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="relative w-full  bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        {/* Alert Notification */}
        {showAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            Schema copied to clipboard!
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          CouchDB Schema Generator
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-center">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {documents.map((doc, docIndex) => (
            <div key={docIndex} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                <input
                  type="text"
                  value={doc.name}
                  onChange={(e) => updateDocument(docIndex, "name", e.target.value)}
                  placeholder="Document type"
                  className="w-full sm:flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => removeDocument(docIndex)}
                  disabled={documents.length <= 1}
                  className="w-full sm:w-auto px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  Delete Document
                </button>
              </div>

              {/* Fields */}
              <div className="space-y-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Fields</h3>
                {doc.fields.map((field, fieldIndex) => (
                  <div
                    key={fieldIndex}
                    className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-white rounded-md border border-gray-200"
                  >
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateField(docIndex, fieldIndex, "name", e.target.value)}
                      placeholder="Field name"
                      className="w-full sm:flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateField(docIndex, fieldIndex, "type", e.target.value)}
                      className="w-full sm:flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {COUCH_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(docIndex, fieldIndex, "required", e.target.checked)}
                        className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm">Required</span>
                    </label>
                    <input
                      type="text"
                      value={field.defaultValue}
                      onChange={(e) => updateField(docIndex, fieldIndex, "defaultValue", e.target.value)}
                      placeholder="Default value"
                      className="w-full sm:flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="text"
                      value={field.validation}
                      onChange={(e) => updateField(docIndex, fieldIndex, "validation", e.target.value)}
                      placeholder="Regex validation (e.g., ^[a-z]+$)"
                      className="w-full sm:flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={() => removeField(docIndex, fieldIndex)}
                      disabled={doc.fields.length <= 1}
                      className="w-full sm:w-auto p-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addField(docIndex)}
                  disabled={doc.fields.length >= MAX_FIELDS}
                  className="text-sm text-purple-600 hover:text-purple-800 disabled:text-gray-400"
                >
                  + Add Field {doc.fields.length >= MAX_FIELDS && `(Max ${MAX_FIELDS})`}
                </button>
              </div>

              {/* Views */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-700">Views</h3>
                {doc.views.map((view, viewIndex) => (
                  <div key={viewIndex} className="space-y-2 p-3 bg-white rounded-md border border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <input
                        type="text"
                        value={view.name}
                        onChange={(e) => updateView(docIndex, viewIndex, "name", e.target.value)}
                        placeholder="View name"
                        className="w-full sm:flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={() => removeView(docIndex, viewIndex)}
                        className="w-full sm:w-auto p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                    <textarea
                      value={view.map}
                      onChange={(e) => updateView(docIndex, viewIndex, "map", e.target.value)}
                      placeholder="Map function"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px] resize-y"
                    />
                    <textarea
                      value={view.reduce}
                      onChange={(e) => updateView(docIndex, viewIndex, "reduce", e.target.value)}
                      placeholder="Reduce function (optional)"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[60px] resize-y"
                    />
                  </div>
                ))}
                <button
                  onClick={() => addView(docIndex)}
                  disabled={doc.views.length >= MAX_VIEWS}
                  className="text-sm text-purple-600 hover:text-purple-800 disabled:text-gray-400"
                >
                  + Add View {doc.views.length >= MAX_VIEWS && `(Max ${MAX_VIEWS})`}
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addDocument}
            disabled={documents.length >= MAX_DOCUMENTS}
            className="text-sm text-purple-600 hover:text-purple-800 disabled:text-gray-400"
          >
            + Add Document Type {documents.length >= MAX_DOCUMENTS && `(Max ${MAX_DOCUMENTS})`}
          </button>
        </div>

        {/* Export Options */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">Export Format:</label>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="json">JSON</option>
            <option value="js">JavaScript Module</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-6">
          <button
            onClick={generateSchema}
            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors font-medium"
          >
            Generate Schema
          </button>
          {schema && (
            <>
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-2 px-4 rounded-md transition-colors font-medium text-white flex items-center justify-center ${
                  isCopied ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
                }`}
              >
                <FaCopy className="mr-2" />
                {isCopied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={downloadSchema}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
              >
                <FaDownload className="mr-2" />
                Download
              </button>
              <button
                onClick={() => setSchema("")}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
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
            <pre className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto text-sm font-mono text-gray-800 whitespace-pre-wrap break-words">
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
                    {entry.documents.length} docs ({entry.format.toUpperCase()}) -{" "}
                    {entry.schema.slice(0, 20)}...
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
            <li>Define multiple document types with fields and views</li>
            <li>Add validation regex for fields</li>
            <li>Export as JSON or JavaScript module</li>
            <li>Copy, download, and track schema history</li>
          </ul>
        </div>
      </div>

      {/* Tailwind Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }
      `}</style>
    </div>
  );
};

export default CouchDBSchemaGenerator;