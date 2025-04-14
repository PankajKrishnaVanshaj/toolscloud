"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo } from "react-icons/fa";

const SupabaseSchemaGenerator = () => {
  const [tables, setTables] = useState([
    {
      name: "users",
      columns: [
        { name: "id", type: "uuid", isPrimary: true, isNullable: false, isUnique: true, defaultValue: "gen_random_uuid()", foreignKey: null, comment: "Unique user identifier" },
        { name: "email", type: "text", isPrimary: false, isNullable: false, isUnique: true, defaultValue: "", foreignKey: null, comment: "User email address" },
        { name: "created_at", type: "timestamptz", isPrimary: false, isNullable: false, isUnique: false, defaultValue: "now()", foreignKey: null, comment: "Creation timestamp" },
      ],
      indexes: [{ name: "idx_users_email", columns: ["email"], isUnique: true }],
      comment: "Stores user information",
    },
  ]);
  const [schema, setSchema] = useState("");
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    schemaName: "public",
    includeComments: true,
    includeRLS: true,
  });

  const SQL_TYPES = [
    "int", "bigint", "smallint", "serial", "bigserial",
    "text", "varchar", "char",
    "timestamp", "timestamptz", "date",
    "boolean", "uuid", "json", "jsonb",
    "real", "double precision", "numeric",
  ];

  const MAX_TABLES = 20;
  const MAX_COLUMNS = 30;
  const MAX_INDEXES = 10;

  const validateInput = useCallback(() => {
    if (!tables.length) return "Add at least one table";
    if (tables.some((t) => !t.name.trim())) return "All tables need names";
    if (new Set(tables.map((t) => t.name)).size !== tables.length) return "Table names must be unique";
    if (tables.some((t) => !/^[a-z][a-z0-9_]*$/.test(t.name))) return "Table names must be lowercase with letters, numbers, or underscores";

    for (const table of tables) {
      if (!table.columns.length) return `Table "${table.name}" needs at least one column`;
      if (table.columns.some((c) => !c.name.trim())) return `All columns in "${table.name}" need names`;
      if (new Set(table.columns.map((c) => c.name)).size !== table.columns.length) return `Column names in "${table.name}" must be unique`;
      if (!table.columns.some((c) => c.isPrimary)) return `Table "${table.name}" needs a primary key`;
      for (const col of table.columns) {
        if (col.foreignKey) {
          const [refTable, refColumn] = col.foreignKey.split(".");
          if (!tables.some((t) => t.name === refTable && t.columns.some((c) => c.name === refColumn))) {
            return `Foreign key in "${table.name}.${col.name}" references invalid "${col.foreignKey}"`;
          }
        }
      }
      if (table.indexes.some((idx) => !idx.columns.length || idx.columns.some((col) => !table.columns.some((c) => c.name === col)))) {
        return `Invalid index columns in "${table.name}"`;
      }
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
      let schemaString = `-- Supabase Schema\n-- Generated: ${new Date().toISOString()}\n-- Schema: ${options.schemaName}\n\n`;

      tables.forEach((table) => {
        if (options.includeComments && table.comment) {
          schemaString += `-- ${table.comment}\n`;
        }
        schemaString += `CREATE TABLE ${options.schemaName}.${table.name} (\n`;
        const columnDefs = table.columns.map((col) => {
          let def = `  ${col.name} ${col.type}`;
          if (!col.isNullable) def += " NOT NULL";
          if (col.isUnique && !col.isPrimary) def += " UNIQUE";
          if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`;
          if (col.foreignKey) def += ` REFERENCES ${options.schemaName}.${col.foreignKey}`;
          if (options.includeComments && col.comment) def += ` -- ${col.comment}`;
          return def;
        });

        const primaryKeys = table.columns.filter((col) => col.isPrimary).map((col) => col.name);
        if (primaryKeys.length) {
          columnDefs.push(`  PRIMARY KEY (${primaryKeys.join(", ")})`);
        }

        schemaString += columnDefs.join(",\n");
        schemaString += "\n);\n\n";

        if (options.includeRLS) {
          schemaString += `ALTER TABLE ${options.schemaName}.${table.name} ENABLE ROW LEVEL SECURITY;\n\n`;
        }

        table.indexes.forEach((idx) => {
          schemaString += `CREATE ${idx.isUnique ? "UNIQUE " : ""}INDEX ${idx.name} ON ${options.schemaName}.${table.name} (${idx.columns.join(", ")});\n`;
        });
        if (table.indexes.length) schemaString += "\n";
      });

      setSchema(schemaString);
      setHistory((prev) => [...prev, { tables: JSON.parse(JSON.stringify(tables)), schema: schemaString, options }].slice(-5));
      setIsCopied(false);
    } catch (e) {
      setError(`Schema generation failed: ${e.message}`);
    }
  }, [tables, options]);

  const addTable = () => {
    if (tables.length < MAX_TABLES) {
      setTables([...tables, {
        name: `table${tables.length + 1}`,
        columns: [{ name: "id", type: "uuid", isPrimary: true, isNullable: false, isUnique: true, defaultValue: "gen_random_uuid()", foreignKey: null, comment: "" }],
        indexes: [],
        comment: "",
      }]);
    }
  };

  const updateTable = (index, field, value) => {
    setTables(tables.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  };

  const removeTable = (index) => {
    if (tables.length > 1) setTables(tables.filter((_, i) => i !== index));
  };

  const addColumn = (tableIndex) => {
    if (tables[tableIndex].columns.length < MAX_COLUMNS) {
      const newTables = [...tables];
      newTables[tableIndex].columns.push({
        name: `col${newTables[tableIndex].columns.length + 1}`,
        type: "text",
        isPrimary: false,
        isNullable: true,
        isUnique: false,
        defaultValue: "",
        foreignKey: null,
        comment: "",
      });
      setTables(newTables);
    }
  };

  const updateColumn = (tableIndex, columnIndex, key, value) => {
    const newTables = [...tables];
    newTables[tableIndex].columns[columnIndex][key] = value;
    setTables(newTables);
  };

  const removeColumn = (tableIndex, columnIndex) => {
    if (tables[tableIndex].columns.length > 1) {
      const newTables = [...tables];
      newTables[tableIndex].columns = newTables[tableIndex].columns.filter((_, i) => i !== columnIndex);
      setTables(newTables);
    }
  };

  const addIndex = (tableIndex) => {
    if (tables[tableIndex].indexes.length < MAX_INDEXES) {
      const newTables = [...tables];
      newTables[tableIndex].indexes.push({
        name: `idx_${tableIndex}_${newTables[tableIndex].indexes.length + 1}`,
        columns: [newTables[tableIndex].columns[0].name],
        isUnique: false,
      });
      setTables(newTables);
    }
  };

  const updateIndex = (tableIndex, indexIndex, key, value) => {
    const newTables = [...tables];
    newTables[tableIndex].indexes[indexIndex][key] = value;
    setTables(newTables);
  };

  const removeIndex = (tableIndex, indexIndex) => {
    const newTables = [...tables];
    newTables[tableIndex].indexes = newTables[tableIndex].indexes.filter((_, i) => i !== indexIndex);
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
    link.download = `schema-${Date.now()}.sql`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">Supabase Schema Generator</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>
        )}

        {/* Options */}
        <div className="p-4 bg-gray-50 rounded-lg mb-6 space-y-4">
          <p className="text-sm font-medium text-gray-700">Schema Options:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Schema Name:</label>
              <input
                type="text"
                value={options.schemaName}
                onChange={(e) => setOptions((prev) => ({ ...prev, schemaName: e.target.value }))}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., public"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.includeComments}
                onChange={(e) => setOptions((prev) => ({ ...prev, includeComments: e.target.checked }))}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-600">Include Comments</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.includeRLS}
                onChange={(e) => setOptions((prev) => ({ ...prev, includeRLS: e.target.checked }))}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-600">Enable RLS</label>
            </div>
          </div>
        </div>

        {/* Tables */}
        <div className="space-y-6">
          {tables.map((table, tableIndex) => (
            <div key={tableIndex} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
                <input
                  type="text"
                  value={table.name}
                  onChange={(e) => updateTable(tableIndex, "name", e.target.value)}
                  placeholder="Table name"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={table.comment}
                  onChange={(e) => updateTable(tableIndex, "comment", e.target.value)}
                  placeholder="Table comment"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => removeTable(tableIndex)}
                  disabled={tables.length <= 1}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  Delete
                </button>
              </div>

              {/* Columns */}
              <div className="space-y-3 mb-4">
                {table.columns.map((column, columnIndex) => (
                  <div key={columnIndex} className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-md border border-gray-200">
                    <input
                      type="text"
                      value={column.name}
                      onChange={(e) => updateColumn(tableIndex, columnIndex, "name", e.target.value)}
                      placeholder="Column name"
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    />
                    <select
                      value={column.type}
                      onChange={(e) => updateColumn(tableIndex, columnIndex, "type", e.target.value)}
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    >
                      {SQL_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={column.defaultValue}
                      onChange={(e) => updateColumn(tableIndex, columnIndex, "defaultValue", e.target.value)}
                      placeholder="Default value"
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      value={column.comment}
                      onChange={(e) => updateColumn(tableIndex, columnIndex, "comment", e.target.value)}
                      placeholder="Column comment"
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      value={column.foreignKey || ""}
                      onChange={(e) => updateColumn(tableIndex, columnIndex, "foreignKey", e.target.value || null)}
                      placeholder="Foreign key (table.column)"
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={column.isPrimary}
                          onChange={(e) => updateColumn(tableIndex, columnIndex, "isPrimary", e.target.checked)}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <span className="text-xs">PK</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={!column.isNullable}
                          onChange={(e) => updateColumn(tableIndex, columnIndex, "isNullable", !e.target.checked)}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <span className="text-xs">NN</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={column.isUnique}
                          onChange={(e) => updateColumn(tableIndex, columnIndex, "isUnique", e.target.checked)}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <span className="text-xs">UN</span>
                      </label>
                    </div>
                    <button
                      onClick={() => removeColumn(tableIndex, columnIndex)}
                      disabled={table.columns.length <= 1}
                      className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addColumn(tableIndex)}
                  disabled={table.columns.length >= MAX_COLUMNS}
                  className="text-sm text-indigo-600 hover:text-indigo-800 disabled:text-gray-400"
                >
                  + Add Column {table.columns.length >= MAX_COLUMNS && `(Max ${MAX_COLUMNS})`}
                </button>
              </div>

              {/* Indexes */}
              <div className="space-y-3">
                {table.indexes.map((index, indexIndex) => (
                  <div key={indexIndex} className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-md border border-gray-200">
                    <input
                      type="text"
                      value={index.name}
                      onChange={(e) => updateIndex(tableIndex, indexIndex, "name", e.target.value)}
                      placeholder="Index name"
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    />
                    <select
                      multiple
                      value={index.columns}
                      onChange={(e) => updateIndex(tableIndex, indexIndex, "columns", Array.from(e.target.selectedOptions, (option) => option.value))}
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    >
                      {table.columns.map((col) => (
                        <option key={col.name} value={col.name}>{col.name}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={index.isUnique}
                        onChange={(e) => updateIndex(tableIndex, indexIndex, "isUnique", e.target.checked)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                      <span className="text-xs">Unique</span>
                    </label>
                    <button
                      onClick={() => removeIndex(tableIndex, indexIndex)}
                      className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addIndex(tableIndex)}
                  disabled={table.indexes.length >= MAX_INDEXES}
                  className="text-sm text-indigo-600 hover:text-indigo-800 disabled:text-gray-400"
                >
                  + Add Index {table.indexes.length >= MAX_INDEXES && `(Max ${MAX_INDEXES})`}
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addTable}
            disabled={tables.length >= MAX_TABLES}
            className="text-sm text-indigo-600 hover:text-indigo-800 disabled:text-gray-400"
          >
            + Add Table {tables.length >= MAX_TABLES && `(Max ${MAX_TABLES})`}
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-6">
          <button
            onClick={generateSchema}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors font-medium"
          >
            Generate Schema
          </button>
          {schema && (
            <>
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-2 px-4 rounded-md transition-colors font-medium text-white ${
                  isCopied ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
                } flex items-center justify-center`}
              >
                <FaCopy className="mr-2" />
                {isCopied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={downloadSchema}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
              >
                <FaDownload className="mr-2" />
                Download (.sql)
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
                  <span>{entry.tables.length} tables - {entry.schema.slice(0, 20)}...</span>
                  <button
                    onClick={() => {
                      setTables(entry.tables);
                      setSchema(entry.schema);
                      setOptions(entry.options);
                      setIsCopied(false);
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
            <li>Custom schema name and RLS support</li>
            <li>Foreign key constraints and indexes</li>
            <li>Comments for tables and columns</li>
            <li>History tracking and schema download</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SupabaseSchemaGenerator;