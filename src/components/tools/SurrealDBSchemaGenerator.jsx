"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaPlus } from "react-icons/fa";

const SurrealDBSchemaGenerator = () => {
  const [tables, setTables] = useState([
    {
      name: "user",
      fields: [
        { name: "id", type: "record", isRequired: true, defaultValue: "", assertions: [] },
        { name: "email", type: "string", isRequired: true, defaultValue: "", assertions: ["IS EMAIL"] },
        { name: "created_at", type: "datetime", isRequired: true, defaultValue: "time::now()", assertions: [] },
      ],
      permissions: { select: "WHERE true", create: "WHERE true", update: "WHERE true", delete: "WHERE false" },
      indexes: [],
      events: [],
    },
  ]);
  const [schema, setSchema] = useState("");
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const SURREAL_TYPES = [
    "any", "bool", "datetime", "decimal", "float", "int", "number", "object", "string", "record", "array",
    "geometry", "uuid", "duration",
  ];
  const COMMON_ASSERTIONS = [
    "IS EMAIL", "IS UUID", "IS ALPHA", "IS NUMERIC", "IS ALPHANUM", "> 0", "> 18", "CONTAINS @",
  ];
  const MAX_TABLES = 20;
  const MAX_FIELDS = 30;
  const MAX_INDEXES = 10;
  const MAX_EVENTS = 5;

  const validateInput = useCallback(() => {
    if (!tables.length) return "Add at least one table";
    if (tables.some((t) => !t.name.trim())) return "All tables need names";
    if (new Set(tables.map((t) => t.name)).size !== tables.length) return "Table names must be unique";
    if (tables.some((t) => !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(t.name))) return "Table names must start with a letter and contain only letters, numbers, or underscores";

    for (const table of tables) {
      if (!table.fields.length) return `Table "${table.name}" needs at least one field`;
      if (table.fields.some((f) => !f.name.trim())) return `All fields in "${table.name}" need names`;
      if (new Set(table.fields.map((f) => f.name)).size !== table.fields.length) return `Field names in "${table.name}" must be unique`;
      if (table.indexes.some((i) => !i.name || !i.field)) return `All indexes in "${table.name}" need a name and field`;
      if (table.events.some((e) => !e.name || !e.condition || !e.then)) return `All events in "${table.name}" need a name, condition, and action`;
    }
    return "";
  }, [tables]);

  const generateSchema = useCallback(() => {
    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      setSchema("");
      return;
    }

    setError("");
    try {
      let schemaString = `-- SurrealDB Schema\n-- Generated: ${new Date().toISOString()}\n\n`;

      tables.forEach((table) => {
        schemaString += `DEFINE TABLE ${table.name} SCHEMAFULL;\n\n`;
        table.fields.forEach((field) => {
          schemaString += `DEFINE FIELD ${field.name} ON TABLE ${table.name}`;
          schemaString += ` TYPE ${field.type}`;
          if (field.isRequired) schemaString += ' VALUE $value OR THROW "Field is required"';
          if (field.defaultValue) schemaString += ` DEFAULT ${field.defaultValue}`;
          if (field.assertions?.length) {
            field.assertions.forEach((assertion) => {
              let condition = assertion;
              if (assertion === "IS EMAIL") condition = "string::is::email($value)";
              else if (assertion === "IS UUID") condition = "string::is::uuid($value)";
              else if (assertion === "IS ALPHA") condition = "string::is::alpha($value)";
              else if (assertion === "IS NUMERIC") condition = "string::is::numeric($value)";
              else if (assertion === "IS ALPHANUM") condition = "string::is::alphanum($value)";
              else if (assertion.startsWith(">")) condition = `$value ${assertion}`;
              else if (assertion.startsWith("CONTAINS")) condition = `string::contains($value, '${assertion.split(" ")[1]}')`;
              schemaString += `\n  ASSERT ${condition}`;
            });
          }
          schemaString += ";\n";
        });

        schemaString += `\nDEFINE TABLE ${table.name} PERMISSIONS`;
        schemaString += `\n  FOR SELECT ${table.permissions.select}`;
        schemaString += `\n  FOR CREATE ${table.permissions.create}`;
        schemaString += `\n  FOR UPDATE ${table.permissions.update}`;
        schemaString += `\n  FOR DELETE ${table.permissions.delete};\n`;

        table.indexes.forEach((index) => {
          schemaString += `\nDEFINE INDEX ${index.name} ON TABLE ${table.name} FIELDS ${index.field}`;
          if (index.unique) schemaString += " UNIQUE";
          schemaString += ";\n";
        });

        table.events.forEach((event) => {
          schemaString += `\nDEFINE EVENT ${event.name} ON TABLE ${table.name}`;
          schemaString += `\n  WHEN ${event.condition}`;
          schemaString += `\n  THEN ${event.then};\n`;
        });

        schemaString += "\n";
      });

      setSchema(schemaString);
      setIsCopied(false);
    } catch (e) {
      setError(`Schema generation failed: ${e.message}`);
    }
  }, [tables]);

  const addTable = () => {
    if (tables.length < MAX_TABLES) {
      setTables([...tables, {
        name: `table${tables.length + 1}`,
        fields: [{ name: "id", type: "record", isRequired: true, defaultValue: "", assertions: [] }],
        permissions: { select: "WHERE true", create: "WHERE true", update: "WHERE true", delete: "WHERE false" },
        indexes: [],
        events: [],
      }]);
    }
  };

  const updateTable = (index, key, value) => {
    setTables(tables.map((t, i) => (i === index ? { ...t, [key]: value } : t)));
  };

  const removeTable = (index) => {
    if (tables.length > 1) setTables(tables.filter((_, i) => i !== index));
  };

  const addField = (tableIndex) => {
    if (tables[tableIndex].fields.length < MAX_FIELDS) {
      const newTables = [...tables];
      newTables[tableIndex].fields.push({
        name: `field${newTables[tableIndex].fields.length + 1}`,
        type: "string",
        isRequired: false,
        defaultValue: "",
        assertions: [],
      });
      setTables(newTables);
    }
  };

  const updateField = (tableIndex, fieldIndex, key, value) => {
    const newTables = [...tables];
    newTables[tableIndex].fields[fieldIndex][key] = value;
    setTables(newTables);
  };

  const toggleAssertion = (tableIndex, fieldIndex, assertion) => {
    const newTables = [...tables];
    const field = newTables[tableIndex].fields[fieldIndex];
    const assertions = field.assertions || [];
    field.assertions = assertions.includes(assertion)
      ? assertions.filter((a) => a !== assertion)
      : [...assertions, assertion];
    setTables(newTables);
  };

  const removeField = (tableIndex, fieldIndex) => {
    if (tables[tableIndex].fields.length > 1) {
      const newTables = [...tables];
      newTables[tableIndex].fields = newTables[tableIndex].fields.filter((_, i) => i !== fieldIndex);
      setTables(newTables);
    }
  };

  const addIndex = (tableIndex) => {
    if (tables[tableIndex].indexes.length < MAX_INDEXES) {
      const newTables = [...tables];
      newTables[tableIndex].indexes.push({ name: `idx_${newTables[tableIndex].indexes.length + 1}`, field: "", unique: false });
      setTables(newTables);
    }
  };

  const updateIndex = (tableIndex, indexIdx, key, value) => {
    const newTables = [...tables];
    newTables[tableIndex].indexes[indexIdx][key] = value;
    setTables(newTables);
  };

  const removeIndex = (tableIndex, indexIdx) => {
    const newTables = [...tables];
    newTables[tableIndex].indexes = newTables[tableIndex].indexes.filter((_, i) => i !== indexIdx);
    setTables(newTables);
  };

  const addEvent = (tableIndex) => {
    if (tables[tableIndex].events.length < MAX_EVENTS) {
      const newTables = [...tables];
      newTables[tableIndex].events.push({
        name: `evt_${newTables[tableIndex].events.length + 1}`,
        condition: "$before IS NULL AND $after IS NOT NULL",
        then: "CREATE log SET table = $table, action = 'created'",
      });
      setTables(newTables);
    }
  };

  const updateEvent = (tableIndex, eventIdx, key, value) => {
    const newTables = [...tables];
    newTables[tableIndex].events[eventIdx][key] = value;
    setTables(newTables);
  };

  const removeEvent = (tableIndex, eventIdx) => {
    const newTables = [...tables];
    newTables[tableIndex].events = newTables[tableIndex].events.filter((_, i) => i !== eventIdx);
    setTables(newTables);
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
    link.download = `schema-${Date.now()}.surql`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          SurrealDB Schema Generator
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {tables.map((table, tableIndex) => (
            <div key={tableIndex} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
                <input
                  type="text"
                  value={table.name}
                  onChange={(e) => updateTable(tableIndex, "name", e.target.value)}
                  placeholder="Table name"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeTable(tableIndex)}
                  disabled={tables.length <= 1}
                  className="w-full sm:w-auto px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  <FaTrash />
                </button>
              </div>

              <div className="space-y-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Fields</h3>
                {table.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex} className="flex flex-col gap-3 p-3 bg-white rounded-md border border-gray-200">
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => updateField(tableIndex, fieldIndex, "name", e.target.value)}
                        placeholder="Field name"
                        className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        value={field.type}
                        onChange={(e) => updateField(tableIndex, fieldIndex, "type", e.target.value)}
                        className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      >
                        {SURREAL_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={field.isRequired}
                          onChange={(e) => updateField(tableIndex, fieldIndex, "isRequired", e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-sm">Required</span>
                      </label>
                      <input
                        type="text"
                        value={field.defaultValue}
                        onChange={(e) => updateField(tableIndex, fieldIndex, "defaultValue", e.target.value)}
                        placeholder="Default value"
                        className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => removeField(tableIndex, fieldIndex)}
                        disabled={table.fields.length <= 1}
                        className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_ASSERTIONS.map((assertion) => (
                        <label key={assertion} className="flex items-center gap-1 text-sm">
                          <input
                            type="checkbox"
                            checked={field.assertions?.includes(assertion)}
                            onChange={() => toggleAssertion(tableIndex, fieldIndex, assertion)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          {assertion}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => addField(tableIndex)}
                  disabled={table.fields.length >= MAX_FIELDS}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 flex items-center"
                >
                  <FaPlus className="mr-1" /> Add Field {table.fields.length >= MAX_FIELDS && `(Max ${MAX_FIELDS})`}
                </button>
              </div>

              <div className="space-y-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Permissions</h3>
                {["select", "create", "update", "delete"].map((perm) => (
                  <div key={perm} className="flex items-center gap-3">
                    <label className="w-24 text-sm font-medium text-gray-700 capitalize">{perm}:</label>
                    <input
                      type="text"
                      value={table.permissions[perm]}
                      onChange={(e) => updateTable(tableIndex, "permissions", { ...table.permissions, [perm]: e.target.value })}
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder={`Permission for ${perm}`}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Indexes</h3>
                {table.indexes.map((index, indexIdx) => (
                  <div key={indexIdx} className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-md border border-gray-200">
                    <input
                      type="text"
                      value={index.name}
                      onChange={(e) => updateIndex(tableIndex, indexIdx, "name", e.target.value)}
                      placeholder="Index name"
                      className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={index.field}
                      onChange={(e) => updateIndex(tableIndex, indexIdx, "field", e.target.value)}
                      placeholder="Field (e.g., email)"
                      className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={index.unique}
                        onChange={(e) => updateIndex(tableIndex, indexIdx, "unique", e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <span className="text-sm">Unique</span>
                    </label>
                    <button
                      onClick={() => removeIndex(tableIndex, indexIdx)}
                      className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addIndex(tableIndex)}
                  disabled={table.indexes.length >= MAX_INDEXES}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 flex items-center"
                >
                  <FaPlus className="mr-1" /> Add Index {table.indexes.length >= MAX_INDEXES && `(Max ${MAX_INDEXES})`}
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Events</h3>
                {table.events.map((event, eventIdx) => (
                  <div key={eventIdx} className="flex flex-col gap-3 p-3 bg-white rounded-md border border-gray-200">
                    <input
                      type="text"
                      value={event.name}
                      onChange={(e) => updateEvent(tableIndex, eventIdx, "name", e.target.value)}
                      placeholder="Event name"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={event.condition}
                      onChange={(e) => updateEvent(tableIndex, eventIdx, "condition", e.target.value)}
                      placeholder="WHEN condition"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={event.then}
                      onChange={(e) => updateEvent(tableIndex, eventIdx, "then", e.target.value)}
                      placeholder="THEN action"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeEvent(tableIndex, eventIdx)}
                      className="self-end p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addEvent(tableIndex)}
                  disabled={table.events.length >= MAX_EVENTS}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 flex items-center"
                >
                  <FaPlus className="mr-1" /> Add Event {table.events.length >= MAX_EVENTS && `(Max ${MAX_EVENTS})`}
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addTable}
            disabled={tables.length >= MAX_TABLES}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 flex items-center"
          >
            <FaPlus className="mr-1" /> Add Table {tables.length >= MAX_TABLES && `(Max ${MAX_TABLES})`}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-6">
          <button
            onClick={generateSchema}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate Schema
          </button>
          {schema && (
            <>
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-2 px-4 rounded-md text-white transition-colors ${
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
                Download (.surql)
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
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Generated SurrealQL Schema:</h2>
            <pre className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto text-sm font-mono text-gray-800 whitespace-pre-wrap">
              {schema}
            </pre>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Define tables with fields, types, defaults, and assertions</li>
            <li>Set permissions for SELECT, CREATE, UPDATE, and DELETE</li>
            <li>Create unique or non-unique indexes on fields</li>
            <li>Add events with custom conditions and actions</li>
            <li>Generate, copy, and download SurrealQL schemas</li>
            <li>Support for all SurrealDB data types</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SurrealDBSchemaGenerator;