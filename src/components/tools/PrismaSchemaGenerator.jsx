"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaPlus } from "react-icons/fa";

const PrismaSchemaGenerator = () => {
  const [models, setModels] = useState([
    {
      name: "User",
      fields: [
        { name: "id", type: "Int", isId: true, isUnique: true, isRequired: true, defaultValue: "autoincrement()" },
        { name: "email", type: "String", isId: false, isUnique: true, isRequired: true, defaultValue: "" },
        { name: "name", type: "String", isId: false, isUnique: false, isRequired: false, defaultValue: "" },
      ],
      relations: [],
    },
  ]);
  const [enums, setEnums] = useState([]); // Support for enums
  const [schema, setSchema] = useState("");
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [datasource, setDatasource] = useState({
    provider: "postgresql",
    url: 'env("DATABASE_URL")',
  });

  const PRISMA_TYPES = [
    "String", "Int", "Float", "Boolean", "DateTime",
    "Json", "Bytes", "BigInt", "Decimal",
  ];
  const DATASOURCE_PROVIDERS = ["postgresql", "mysql", "sqlite", "mongodb"];
  const MAX_MODELS = 20;
  const MAX_FIELDS = 30;
  const MAX_ENUMS = 10;

  const validateInput = useCallback(() => {
    if (!models.length) return "Add at least one model";
    if (models.some((m) => !m.name.trim())) return "All models need names";
    if (new Set(models.map((m) => m.name)).size !== models.length) return "Model names must be unique";
    if (models.some((m) => !/^[A-Z][A-Za-z0-9]*$/.test(m.name))) return "Model names must start with an uppercase letter and contain only letters and numbers";

    for (const model of models) {
      if (!model.fields.length) return `Model "${model.name}" needs at least one field`;
      if (model.fields.some((f) => !f.name.trim())) return `All fields in "${model.name}" need names`;
      if (new Set(model.fields.map((f) => f.name)).size !== model.fields.length) return `Field names in "${model.name}" must be unique`;
      if (!model.fields.some((f) => f.isId)) return `Model "${model.name}" needs an ID field`;
    }

    if (enums.some((e) => !e.name.trim() || !/^[A-Z][A-Za-z0-9]*$/.test(e.name))) return "Enum names must start with an uppercase letter and contain only letters and numbers";
    if (enums.some((e) => !e.values.length)) return "All enums need at least one value";
    if (new Set(enums.map((e) => e.name)).size !== enums.length) return "Enum names must be unique";

    return "";
  }, [models, enums]);

  const generateSchema = useCallback(() => {
    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      setSchema("");
      return;
    }

    setError("");
    try {
      let schemaString = `// Prisma Schema\n// Generated: ${new Date().toISOString()}\n\n`;
      schemaString += "generator client {\n  provider = \"prisma-client-js\"\n}\n\n";
      schemaString += `datasource db {\n  provider = "${datasource.provider}"\n  url      = ${datasource.url}\n}\n\n`;

      // Enums
      enums.forEach((enumDef) => {
        schemaString += `enum ${enumDef.name} {\n`;
        enumDef.values.forEach((val) => (schemaString += `  ${val}\n`));
        schemaString += "}\n\n";
      });

      // Models
      models.forEach((model) => {
        schemaString += `model ${model.name} {\n`;
        model.fields.forEach((field) => {
          let def = `  ${field.name} ${field.type}`;
          if (field.isId) def += " @id";
          if (field.isUnique && !field.isId) def += " @unique";
          if (field.isRequired) def += "!";
          if (field.defaultValue) def += ` @default(${field.defaultValue})`;
          schemaString += `${def}\n`;
        });

        model.relations.forEach((rel) => {
          schemaString += `  ${rel.field} ${rel.target} @relation("${rel.name}", fields: [${rel.field}], references: [${rel.reference}])\n`;
        });

        schemaString += "}\n\n";
      });

      setSchema(schemaString);
      setIsCopied(false);
    } catch (e) {
      setError(`Schema generation failed: ${e.message}`);
    }
  }, [models, enums, datasource]);

  // Model Management
  const addModel = () => {
    if (models.length < MAX_MODELS) {
      setModels([...models, {
        name: `Model${models.length + 1}`,
        fields: [{ name: "id", type: "Int", isId: true, isUnique: true, isRequired: true, defaultValue: "autoincrement()" }],
        relations: [],
      }]);
    }
  };

  const updateModel = (index, name) => {
    setModels(models.map((m, i) => (i === index ? { ...m, name } : m)));
  };

  const removeModel = (index) => {
    if (models.length > 1) setModels(models.filter((_, i) => i !== index));
  };

  // Field Management
  const addField = (modelIndex) => {
    if (models[modelIndex].fields.length < MAX_FIELDS) {
      const newModels = [...models];
      newModels[modelIndex].fields.push({
        name: `field${newModels[modelIndex].fields.length + 1}`,
        type: "String",
        isId: false,
        isUnique: false,
        isRequired: false,
        defaultValue: "",
      });
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

  // Relation Management
  const addRelation = (modelIndex) => {
    const newModels = [...models];
    newModels[modelIndex].relations.push({
      name: `rel${newModels[modelIndex].relations.length + 1}`,
      field: "",
      target: models[0].name,
      reference: "id",
    });
    setModels(newModels);
  };

  const updateRelation = (modelIndex, relIndex, key, value) => {
    const newModels = [...models];
    newModels[modelIndex].relations[relIndex][key] = value;
    setModels(newModels);
  };

  const removeRelation = (modelIndex, relIndex) => {
    const newModels = [...models];
    newModels[modelIndex].relations = newModels[modelIndex].relations.filter((_, i) => i !== relIndex);
    setModels(newModels);
  };

  // Enum Management
  const addEnum = () => {
    if (enums.length < MAX_ENUMS) {
      setEnums([...enums, { name: `Enum${enums.length + 1}`, values: ["Value1"] }]);
    }
  };

  const updateEnum = (index, key, value) => {
    const newEnums = [...enums];
    newEnums[index][key] = value;
    setEnums(newEnums);
  };

  const addEnumValue = (enumIndex) => {
    const newEnums = [...enums];
    newEnums[enumIndex].values.push(`Value${newEnums[enumIndex].values.length + 1}`);
    setEnums(newEnums);
  };

  const updateEnumValue = (enumIndex, valueIndex, value) => {
    const newEnums = [...enums];
    newEnums[enumIndex].values[valueIndex] = value;
    setEnums(newEnums);
  };

  const removeEnumValue = (enumIndex, valueIndex) => {
    const newEnums = [...enums];
    if (newEnums[enumIndex].values.length > 1) {
      newEnums[enumIndex].values = newEnums[enumIndex].values.filter((_, i) => i !== valueIndex);
      setEnums(newEnums);
    }
  };

  const removeEnum = (index) => {
    setEnums(enums.filter((_, i) => i !== index));
  };

  // Utility Functions
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
    link.download = `schema-${Date.now()}.prisma`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Prisma Schema Generator
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Datasource Config */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Datasource</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
              <select
                value={datasource.provider}
                onChange={(e) => setDatasource({ ...datasource, provider: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DATASOURCE_PROVIDERS.map((prov) => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input
                type="text"
                value={datasource.url}
                onChange={(e) => setDatasource({ ...datasource, url: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder='e.g., env("DATABASE_URL")'
              />
            </div>
          </div>
        </div>

        {/* Models */}
        <div className="space-y-6">
          {models.map((model, modelIndex) => (
            <div key={modelIndex} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                <input
                  type="text"
                  value={model.name}
                  onChange={(e) => updateModel(modelIndex, e.target.value)}
                  placeholder="Model name"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeModel(modelIndex)}
                  disabled={models.length <= 1}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  <FaTrash />
                </button>
              </div>

              {/* Fields */}
              <div className="space-y-3">
                {model.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex} className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-md border border-gray-200">
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateField(modelIndex, fieldIndex, "name", e.target.value)}
                      placeholder="Field name"
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateField(modelIndex, fieldIndex, "type", e.target.value)}
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      {[...PRISMA_TYPES, ...enums.map((e) => e.name)].map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={field.isId}
                          onChange={(e) => updateField(modelIndex, fieldIndex, "isId", e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-xs">ID</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={field.isUnique}
                          onChange={(e) => updateField(modelIndex, fieldIndex, "isUnique", e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-xs">UN</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={field.isRequired}
                          onChange={(e) => updateField(modelIndex, fieldIndex, "isRequired", e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-xs">REQ</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={field.defaultValue}
                      onChange={(e) => updateField(modelIndex, fieldIndex, "defaultValue", e.target.value)}
                      placeholder="Default (e.g., autoincrement())"
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeField(modelIndex, fieldIndex)}
                      disabled={model.fields.length <= 1}
                      className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addField(modelIndex)}
                  disabled={model.fields.length >= MAX_FIELDS}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                >
                  + Add Field {model.fields.length >= MAX_FIELDS && `(Max ${MAX_FIELDS})`}
                </button>
              </div>

              {/* Relations */}
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700">Relations</h3>
                {model.relations.map((rel, relIndex) => (
                  <div key={relIndex} className="flex flex-wrap items-center gap-3 p-3 mt-2 bg-white rounded-md border border-gray-200">
                    <input
                      type="text"
                      value={rel.name}
                      onChange={(e) => updateRelation(modelIndex, relIndex, "name", e.target.value)}
                      placeholder="Relation name"
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={rel.field}
                      onChange={(e) => updateRelation(modelIndex, relIndex, "field", e.target.value)}
                      placeholder="Field name"
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={rel.target}
                      onChange={(e) => updateRelation(modelIndex, relIndex, "target", e.target.value)}
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      {models.map((m) => (
                        <option key={m.name} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={rel.reference}
                      onChange={(e) => updateRelation(modelIndex, relIndex, "reference", e.target.value)}
                      placeholder="Reference field"
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeRelation(modelIndex, relIndex)}
                      className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addRelation(modelIndex)}
                  className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                >
                  + Add Relation
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addModel}
            disabled={models.length >= MAX_MODELS}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
          >
            + Add Model {models.length >= MAX_MODELS && `(Max ${MAX_MODELS})`}
          </button>
        </div>

        {/* Enums */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Enums</h2>
          {enums.map((enumDef, enumIndex) => (
            <div key={enumIndex} className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="text"
                  value={enumDef.name}
                  onChange={(e) => updateEnum(enumIndex, "name", e.target.value)}
                  placeholder="Enum name"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeEnum(enumIndex)}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
              {enumDef.values.map((val, valueIndex) => (
                <div key={valueIndex} className="flex items-center gap-3 mb-2">
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => updateEnumValue(enumIndex, valueIndex, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeEnumValue(enumIndex, valueIndex)}
                    disabled={enumDef.values.length <= 1}
                    className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addEnumValue(enumIndex)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Enum Value
              </button>
            </div>
          ))}
          <button
            onClick={addEnum}
            disabled={enums.length >= MAX_ENUMS}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
          >
            + Add Enum {enums.length >= MAX_ENUMS && `(Max ${MAX_ENUMS})`}
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-6">
          <button
            onClick={generateSchema}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FaPlus className="mr-2" />
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
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" />
                Download (.prisma)
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
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Generated Prisma Schema:</h2>
            <pre className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto text-sm font-mono text-gray-800 whitespace-pre-wrap">
              {schema}
            </pre>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Custom models with fields (ID, unique, required, defaults)</li>
            <li>Relations between models</li>
            <li>Custom enums for field types</li>
            <li>Configurable datasource (PostgreSQL, MySQL, SQLite, MongoDB)</li>
            <li>Copy or download generated schema</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PrismaSchemaGenerator;