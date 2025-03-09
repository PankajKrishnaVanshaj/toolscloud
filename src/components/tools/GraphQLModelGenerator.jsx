"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo } from "react-icons/fa";

const GraphQLModelGenerator = () => {
  const [models, setModels] = useState([
    {
      name: "User",
      fields: [
        { name: "id", type: "ID", isNonNull: true, isList: false },
        { name: "name", type: "String", isNonNull: false, isList: false },
        { name: "email", type: "String", isNonNull: false, isList: false },
      ],
    },
  ]);
  const [enums, setEnums] = useState([{ name: "Role", values: ["USER", "ADMIN"] }]);
  const [customScalars, setCustomScalars] = useState(["DateTime"]);
  const [schema, setSchema] = useState("");
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    includeComments: true,
    generateInterfaces: false,
  });

  const SCALAR_TYPES = ["ID", "String", "Int", "Float", "Boolean"];
  const MAX_MODELS = 20;
  const MAX_FIELDS = 15;
  const MAX_ENUMS = 10;

  const validateInput = useCallback(() => {
    if (!models.length && !enums.length) return "Add at least one model or enum";
    if (models.some((m) => !m.name.trim())) return "All models need names";
    if (new Set(models.map((m) => m.name)).size !== models.length) return "Model names must be unique";
    if (models.some((m) => !/^[A-Z][A-Za-z0-9]*$/.test(m.name))) return "Model names must start with an uppercase letter";
    if (enums.some((e) => !e.name.trim() || !e.values.length || e.values.some((v) => !v.trim())))
      return "All enums need names and at least one value";
    if (new Set([...models.map((m) => m.name), ...enums.map((e) => e.name), ...customScalars]).size !==
        models.length + enums.length + customScalars.length)
      return "All type names (models, enums, scalars) must be unique";

    for (const model of models) {
      if (!model.fields.length) return `Model "${model.name}" needs at least one field`;
      if (model.fields.some((f) => !f.name.trim())) return `All fields in "${model.name}" need names`;
      if (new Set(model.fields.map((f) => f.name)).size !== model.fields.length)
        return `Field names in "${model.name}" must be unique`;
      if (model.fields.some((f) => !/^[a-z][A-Za-z0-9]*$/.test(f.name)))
        return `Field names in "${model.name}" must start with a lowercase letter`;
    }
    return "";
  }, [models, enums, customScalars]);

  const generateSchema = useCallback(() => {
    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      setSchema("");
      return;
    }

    setError("");
    try {
      let schemaString = options.includeComments ? `# GraphQL Schema\n# Generated: ${new Date().toISOString()}\n\n` : "";

      // Custom Scalars
      customScalars.forEach((scalar) => {
        schemaString += `${options.includeComments ? `# Custom scalar type\n` : ""}scalar ${scalar}\n\n`;
      });

      // Enums
      enums.forEach((enumType) => {
        schemaString += `${options.includeComments ? `# Enum for ${enumType.name}\n` : ""}enum ${enumType.name} {\n`;
        enumType.values.forEach((value) => (schemaString += `  ${value}\n`));
        schemaString += "}\n\n";
      });

      // Type Definitions
      models.forEach((model) => {
        schemaString += `${options.includeComments ? `# Model type\n` : ""}type ${model.name} {\n`;
        model.fields.forEach((field) => {
          const fieldType = [...SCALAR_TYPES, ...customScalars, ...models.map((m) => m.name), ...enums.map((e) => e.name)].includes(field.type)
            ? field.type
            : "String"; // Fallback to String if invalid
          schemaString += `  ${field.name}: ${field.isList ? "[" : ""}${fieldType}${field.isNonNull ? "!" : ""}${field.isList ? "]" : ""}\n`;
        });
        schemaString += "}\n\n";

        // Input Types
        schemaString += `${options.includeComments ? `# Input for ${model.name}\n` : ""}input ${model.name}Input {\n`;
        model.fields
          .filter((f) => f.type !== "ID")
          .forEach((field) => {
            const fieldType = [...SCALAR_TYPES, ...customScalars, ...models.map((m) => m.name), ...enums.map((e) => e.name)].includes(field.type)
              ? field.type
              : "String";
            schemaString += `  ${field.name}: ${field.isList ? "[" : ""}${fieldType}${field.isNonNull ? "!" : ""}${field.isList ? "]" : ""}\n`;
          });
        schemaString += "}\n\n";
      });

      // Query Type
      schemaString += `${options.includeComments ? `# Root queries\n` : ""}type Query {\n`;
      models.forEach((model) => {
        const modelNameLower = model.name.toLowerCase();
        schemaString += `  ${modelNameLower}s: [${model.name}!]!\n`;
        schemaString += `  ${modelNameLower}(id: ID!): ${model.name}\n`;
      });
      schemaString += "}\n\n";

      // Mutation Type
      schemaString += `${options.includeComments ? `# Root mutations\n` : ""}type Mutation {\n`;
      models.forEach((model) => {
        const modelNameLower = model.name.toLowerCase();
        schemaString += `  create${model.name}(input: ${model.name}Input!): ${model.name}!\n`;
        schemaString += `  update${model.name}(id: ID!, input: ${model.name}Input!): ${model.name}!\n`;
        schemaString += `  delete${model.name}(id: ID!): Boolean!\n`;
      });
      schemaString += "}\n";

      setSchema(schemaString);
      setHistory((prev) => [...prev, { models, enums, customScalars, schema: schemaString, options }].slice(-5));
      setIsCopied(false);
    } catch (e) {
      setError(`Schema generation failed: ${e.message}`);
    }
  }, [models, enums, customScalars, options]);

  const addModel = () => models.length < MAX_MODELS && setModels([...models, { name: `Model${models.length + 1}`, fields: [{ name: "id", type: "ID", isNonNull: true, isList: false }] }]);
  const updateModel = (index, name) => setModels(models.map((m, i) => (i === index ? { ...m, name } : m)));
  const removeModel = (index) => models.length > 1 && setModels(models.filter((_, i) => i !== index));

  const addField = (modelIndex) => {
    if (models[modelIndex].fields.length < MAX_FIELDS) {
      const newModels = [...models];
      newModels[modelIndex].fields.push({ name: `field${newModels[modelIndex].fields.length + 1}`, type: "String", isNonNull: false, isList: false });
      setModels(newModels);
    }
  };
  const updateField = (modelIndex, fieldIndex, key, value) => {
    const newModels = [...models];
    newModels[modelIndex].fields[fieldIndex][key] = value;
    setModels(newModels);
  };
  const removeField = (modelIndex, fieldIndex) => {
    if (models[modelIndex].fields.length > 1) {
      const newModels = [...models];
      newModels[modelIndex].fields = newModels[modelIndex].fields.filter((_, i) => i !== fieldIndex);
      setModels(newModels);
    }
  };

  const addEnum = () => enums.length < MAX_ENUMS && setEnums([...enums, { name: `Enum${enums.length + 1}`, values: ["VALUE1", "VALUE2"] }]);
  const updateEnum = (index, key, value) => setEnums(enums.map((e, i) => (i === index ? { ...e, [key]: key === "values" ? value.split(",").map((v) => v.trim()) : value } : e)));
  const removeEnum = (index) => enums.length > 1 && setEnums(enums.filter((_, i) => i !== index));

  const addCustomScalar = () => setCustomScalars([...customScalars, `Scalar${customScalars.length + 1}`]);
  const updateCustomScalar = (index, value) => setCustomScalars(customScalars.map((s, i) => (i === index ? value : s)));
  const removeCustomScalar = (index) => customScalars.length > 1 && setCustomScalars(customScalars.filter((_, i) => i !== index));

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
    link.download = `schema-${Date.now()}.graphql`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">Advanced GraphQL Model Generator</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>
        )}

        {/* Models */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-700">Models</h2>
          {models.map((model, modelIndex) => (
            <div key={modelIndex} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                <input
                  type="text"
                  value={model.name}
                  onChange={(e) => updateModel(modelIndex, e.target.value)}
                  placeholder="Model name"
                  className="flex-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => removeModel(modelIndex)}
                  disabled={models.length <= 1 && !enums.length}
                  className="w-full sm:w-auto px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  Delete
                </button>
              </div>
              <div className="space-y-3">
                {model.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex} className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-md border border-gray-200">
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateField(modelIndex, fieldIndex, "name", e.target.value)}
                      placeholder="Field name"
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateField(modelIndex, fieldIndex, "type", e.target.value)}
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    >
                      {[...SCALAR_TYPES, ...customScalars, ...models.map((m) => m.name), ...enums.map((e) => e.name)].map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={field.isNonNull}
                          onChange={(e) => updateField(modelIndex, fieldIndex, "isNonNull", e.target.checked)}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <span className="text-sm">NN</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={field.isList}
                          onChange={(e) => updateField(modelIndex, fieldIndex, "isList", e.target.checked)}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <span className="text-sm">List</span>
                      </label>
                    </div>
                    <button
                      onClick={() => removeField(modelIndex, fieldIndex)}
                      disabled={model.fields.length <= 1}
                      className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addField(modelIndex)}
                  disabled={model.fields.length >= MAX_FIELDS}
                  className="text-sm text-indigo-600 hover:text-indigo-800 disabled:text-gray-400"
                >
                  + Add Field {model.fields.length >= MAX_FIELDS && `(Max ${MAX_FIELDS})`}
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addModel}
            disabled={models.length >= MAX_MODELS}
            className="text-sm text-indigo-600 hover:text-indigo-800 disabled:text-gray-400"
          >
            + Add Model {models.length >= MAX_MODELS && `(Max ${MAX_MODELS})`}
          </button>
        </div>

        {/* Enums */}
        <div className="mt-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-700">Enums</h2>
          {enums.map((enumType, enumIndex) => (
            <div key={enumIndex} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                <input
                  type="text"
                  value={enumType.name}
                  onChange={(e) => updateEnum(enumIndex, "name", e.target.value)}
                  placeholder="Enum name"
                  className="flex-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={enumType.values.join(", ")}
                  onChange={(e) => updateEnum(enumIndex, "values", e.target.value)}
                  placeholder="Enum values (comma-separated)"
                  className="flex-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => removeEnum(enumIndex)}
                  disabled={enums.length <= 1 && !models.length}
                  className="w-full sm:w-auto px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addEnum}
            disabled={enums.length >= MAX_ENUMS}
            className="text-sm text-indigo-600 hover:text-indigo-800 disabled:text-gray-400"
          >
            + Add Enum {enums.length >= MAX_ENUMS && `(Max ${MAX_ENUMS})`}
          </button>
        </div>

        {/* Custom Scalars */}
        <div className="mt-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-700">Custom Scalars</h2>
          {customScalars.map((scalar, scalarIndex) => (
            <div key={scalarIndex} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border border-gray-200">
              <input
                type="text"
                value={scalar}
                onChange={(e) => updateCustomScalar(scalarIndex, e.target.value)}
                placeholder="Scalar name"
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => removeCustomScalar(scalarIndex)}
                disabled={customScalars.length <= 1}
                className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={addCustomScalar}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            + Add Custom Scalar
          </button>
        </div>

        {/* Options */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Options</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.includeComments}
                onChange={(e) => setOptions({ ...options, includeComments: e.target.checked })}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">Include Comments</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.generateInterfaces}
                onChange={(e) => setOptions({ ...options, generateInterfaces: e.target.checked })}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">Generate Interfaces (Future)</span>
            </label>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-6">
          <button
            onClick={generateSchema}
            className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
          >
            Generate Schema
          </button>
          {schema && (
            <>
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-2 px-4 rounded-md text-white transition-colors font-medium flex items-center justify-center ${
                  isCopied ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
                }`}
              >
                <FaCopy className="mr-2" />
                {isCopied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={downloadSchema}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
              >
                <FaDownload className="mr-2" />
                Download (.graphql)
              </button>
              <button
                onClick={() => setSchema("")}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
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
                  <span>Schema ({entry.models.length} models, {entry.enums.length} enums)</span>
                  <button
                    onClick={() => {
                      setModels(entry.models);
                      setEnums(entry.enums);
                      setCustomScalars(entry.customScalars);
                      setSchema(entry.schema);
                      setOptions(entry.options);
                    }}
                    className="text-indigo-500 hover:text-indigo-700 transition-colors"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-indigo-100 rounded-lg border border-indigo-300">
          <h3 className="font-semibold text-indigo-700">Features</h3>
          <ul className="list-disc list-inside text-indigo-600 text-sm">
            <li>Create models with fields (non-null, lists)</li>
            <li>Define enums and custom scalars</li>
            <li>Generate queries, mutations, and input types</li>
            <li>Copy, download, and track schema history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GraphQLModelGenerator;