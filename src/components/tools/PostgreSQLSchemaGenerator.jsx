"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaPlus } from "react-icons/fa";

const PostgreSQLSchemaGenerator = () => {
  const [tables, setTables] = useState([
    {
      name: "users",
      columns: [
        { name: "id", type: "SERIAL", isPrimary: true, isNullable: false, isUnique: true, defaultValue: "", isGenerated: false, generatedExpression: "", comment: "" },
        { name: "email", type: "VARCHAR(255)", isPrimary: false, isNullable: false, isUnique: true, defaultValue: "", isGenerated: false, generatedExpression: "", comment: "User's email address" },
        { name: "full_name", type: "TEXT", isPrimary: false, isNullable: true, isUnique: false, defaultValue: "", isGenerated: false, generatedExpression: "", comment: "" },
        { name: "created_at", type: "TIMESTAMPTZ", isPrimary: false, isNullable: false, isUnique: false, defaultValue: "NOW()", isGenerated: false, generatedExpression: "", comment: "Creation timestamp" },
      ],
      foreignKeys: [],
      indexes: [],
      comment: "Table for storing user information",
    },
  ]);
  const [schema, setSchema] = useState("");
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [options, setOptions] = useState({
    includeDrop: false,
    includeComments: true,
    schemaName: "",
  });

  const PG_TYPES = [
    "SMALLINT", "INTEGER", "BIGINT", "SERIAL", "BIGSERIAL",
    "REAL", "DOUBLE PRECISION", "NUMERIC",
    "CHAR", "VARCHAR(255)", "TEXT",
    "DATE", "TIMESTAMP", "TIMESTAMPTZ",
    "BOOLEAN", "UUID", "JSON", "JSONB",
    "BYTEA", "INET", "CIDR",
  ];

  const MAX_TABLES = 20;
  const MAX_COLUMNS = 30;

  const validateInput = useCallback(() => {
    if (!tables.length) return "Add at least one table";
    if (tables.some(t => !t.name.trim())) return "All tables need names";
    if (new Set(tables.map(t => t.name)).size !== tables.length) return "Table names must be unique";
    if (tables.some(t => !/^[a-z][a-z0-9_]*$/.test(t.name))) return "Table names must be lowercase with letters, numbers, or underscores";

    for (const table of tables) {
      if (!table.columns.length) return `Table "${table.name}" needs at least one column`;
      if (table.columns.some(c => !c.name.trim())) return `All columns in "${table.name}" need names`;
      if (new Set(table.columns.map(c => c.name)).size !== table.columns.length) return `Column names in "${table.name}" must be unique`;
      if (!table.columns.some(c => c.isPrimary)) return `Table "${table.name}" needs a primary key`;
      if (table.columns.some(c => c.isGenerated && !c.generatedExpression)) return `Generated column in "${table.name}" needs an expression`;
      for (const fk of table.foreignKeys) {
        if (!fk.column || !fk.refTable || !fk.refColumn) return `Foreign key in "${table.name}" is incomplete`;
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
      let schemaString = `-- PostgreSQL Schema\n-- Generated: ${new Date().toISOString()}\n\n`;
      if (options.schemaName) schemaString += `CREATE SCHEMA IF NOT EXISTS ${options.schemaName};\n\n`;

      tables.forEach(table => {
        const tableName = options.schemaName ? `${options.schemaName}.${table.name}` : table.name;

        if (options.includeDrop) schemaString += `DROP TABLE IF EXISTS ${tableName} CASCADE;\n`;
        schemaString += `CREATE TABLE ${tableName} (\n`;
        const columnDefs = table.columns.map(col => {
          let def = `  ${col.name} ${col.type}`;
          if (col.isGenerated) {
            def += ` GENERATED ALWAYS AS (${col.generatedExpression}) STORED`;
          } else {
            if (!col.isNullable) def += " NOT NULL";
            if (col.isUnique && !col.isPrimary) def += " UNIQUE";
            if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`;
          }
          return def;
        });

        const primaryKeys = table.columns.filter(col => col.isPrimary).map(col => col.name);
        if (primaryKeys.length) {
          columnDefs.push(`  PRIMARY KEY (${primaryKeys.join(", ")})`);
        }

        schemaString += columnDefs.join(",\n");
        schemaString += "\n);\n";

        // Foreign Keys
        table.foreignKeys.forEach((fk, idx) => {
          const fkName = `${table.name}_fk_${idx}`;
          const refTableName = options.schemaName ? `${options.schemaName}.${fk.refTable}` : fk.refTable;
          schemaString += `ALTER TABLE ${tableName}\n  ADD CONSTRAINT ${fkName} FOREIGN KEY (${fk.column}) REFERENCES ${refTableName} (${fk.refColumn});\n`;
        });

        // Indexes
        table.indexes.forEach((idx, i) => {
          const idxName = `${table.name}_idx_${i}`;
          schemaString += `CREATE ${idx.isUnique ? "UNIQUE " : ""}INDEX ${idxName} ON ${tableName} (${idx.column});\n`;
        });

        // Comments
        if (options.includeComments && table.comment) {
          schemaString += `COMMENT ON TABLE ${tableName} IS '${table.comment}';\n`;
        }
        if (options.includeComments) {
          table.columns.forEach(col => {
            if (col.comment) {
              schemaString += `COMMENT ON COLUMN ${tableName}.${col.name} IS '${col.comment}';\n`;
            }
          });
        }
        schemaString += "\n";
      });

      setSchema(schemaString);
      setIsCopied(false);
    } catch (e) {
      setError(`Schema generation failed: ${e.message}`);
    }
  }, [tables, options]);

  const addTable = () => {
    if (tables.length < MAX_TABLES) {
      setTables([...tables, {
        name: `table${tables.length + 1}`,
        columns: [{ name: "id", type: "SERIAL", isPrimary: true, isNullable: false, isUnique: true, defaultValue: "", isGenerated: false, generatedExpression: "", comment: "" }],
        foreignKeys: [],
        indexes: [],
        comment: "",
      }]);
    }
  };

  const updateTable = (index, key, value) => {
    setTables(tables.map((t, i) => (i === index ? { ...t, [key]: value } : t)));
  };

  const removeTable = (index) => {
    if (tables.length > 1) setTables(tables.filter((_, i) => i !== index));
  };

  const addColumn = (tableIndex) => {
    if (tables[tableIndex].columns.length < MAX_COLUMNS) {
      const newTables = [...tables];
      newTables[tableIndex].columns.push({
        name: `column${newTables[tableIndex].columns.length + 1}`,
        type: "TEXT",
        isPrimary: false,
        isNullable: true,
        isUnique: false,
        defaultValue: "",
        isGenerated: false,
        generatedExpression: "",
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

  const addForeignKey = (tableIndex) => {
    const newTables = [...tables];
    newTables[tableIndex].foreignKeys.push({ column: "", refTable: "", refColumn: "" });
    setTables(newTables);
  };

  const updateForeignKey = (tableIndex, fkIndex, key, value) => {
    const newTables = [...tables];
    newTables[tableIndex].foreignKeys[fkIndex][key] = value;
    setTables(newTables);
  };

  const removeForeignKey = (tableIndex, fkIndex) => {
    const newTables = [...tables];
    newTables[tableIndex].foreignKeys = newTables[tableIndex].foreignKeys.filter((_, i) => i !== fkIndex);
    setTables(newTables);
  };

  const addIndex = (tableIndex) => {
    const newTables = [...tables];
    newTables[tableIndex].indexes.push({ column: "", isUnique: false });
    setTables(newTables);
  };

  const updateIndex = (tableIndex, idxIndex, key, value) => {
    const newTables = [...tables];
    newTables[tableIndex].indexes[idxIndex][key] = value;
    setTables(newTables);
  };

  const removeIndex = (tableIndex, idxIndex) => {
    const newTables = [...tables];
    newTables[tableIndex].indexes = newTables[tableIndex].indexes.filter((_, i) => i !== idxIndex);
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          PostgreSQL Schema Generator
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Schema Options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">Schema Options</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Schema Name:</label>
              <input
                type="text"
                value={options.schemaName}
                onChange={(e) => setOptions({ ...options, schemaName: e.target.value })}
                placeholder="e.g., public"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.includeDrop}
                onChange={(e) => setOptions({ ...options, includeDrop: e.target.checked })}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-600">Include DROP TABLE</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.includeComments}
                onChange={(e) => setOptions({ ...options, includeComments: e.target.checked })}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-600">Include Comments</label>
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
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeTable(tableIndex)}
                  disabled={tables.length <= 1}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
              <input
                type="text"
                value={table.comment}
                onChange={(e) => updateTable(tableIndex, "comment", e.target.value)}
                placeholder="Table comment"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 mb-4"
              />

              {/* Columns */}
              <div className="space-y-3">
                {table.columns.map((column, columnIndex) => (
                  <div key={columnIndex} className="flex flex-col gap-3 p-3 bg-white rounded-md border border-gray-200">
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="text"
                        value={column.name}
                        onChange={(e) => updateColumn(tableIndex, columnIndex, "name", e.target.value)}
                        placeholder="Column name"
                        className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        value={column.type}
                        onChange={(e) => updateColumn(tableIndex, columnIndex, "type", e.target.value)}
                        className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      >
                        {PG_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={column.isPrimary}
                            onChange={(e) => updateColumn(tableIndex, columnIndex, "isPrimary", e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <span className="text-xs">PK</span>
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={!column.isNullable}
                            onChange={(e) => updateColumn(tableIndex, columnIndex, "isNullable", !e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <span className="text-xs">NN</span>
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={column.isUnique}
                            onChange={(e) => updateColumn(tableIndex, columnIndex, "isUnique", e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <span className="text-xs">UN</span>
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={column.isGenerated}
                            onChange={(e) => updateColumn(tableIndex, columnIndex, "isGenerated", e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <span className="text-xs">GEN</span>
                        </label>
                      </div>
                      {!column.isGenerated && (
                        <input
                          type="text"
                          value={column.defaultValue}
                          onChange={(e) => updateColumn(tableIndex, columnIndex, "defaultValue", e.target.value)}
                          placeholder="Default value"
                          className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                      <button
                        onClick={() => removeColumn(tableIndex, columnIndex)}
                        disabled={table.columns.length <= 1}
                        className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    {column.isGenerated && (
                      <input
                        type="text"
                        value={column.generatedExpression}
                        onChange={(e) => updateColumn(tableIndex, columnIndex, "generatedExpression", e.target.value)}
                        placeholder="Generated expression (e.g., column1 + column2)"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                    <input
                      type="text"
                      value={column.comment}
                      onChange={(e) => updateColumn(tableIndex, columnIndex, "comment", e.target.value)}
                      placeholder="Column comment"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
                <button
                  onClick={() => addColumn(tableIndex)}
                  disabled={table.columns.length >= MAX_COLUMNS}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 flex items-center"
                >
                  <FaPlus className="mr-1" /> Add Column {table.columns.length >= MAX_COLUMNS && `(Max ${MAX_COLUMNS})`}
                </button>
              </div>

              {/* Foreign Keys */}
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Foreign Keys</h3>
                {table.foreignKeys.map((fk, fkIndex) => (
                  <div key={fkIndex} className="flex flex-wrap items-center gap-3 mb-2">
                    <select
                      value={fk.column}
                      onChange={(e) => updateForeignKey(tableIndex, fkIndex, "column", e.target.value)}
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Column</option>
                      {table.columns.map(col => (
                        <option key={col.name} value={col.name}>{col.name}</option>
                      ))}
                    </select>
                    <select
                      value={fk.refTable}
                      onChange={(e) => updateForeignKey(tableIndex, fkIndex, "refTable", e.target.value)}
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Reference Table</option>
                      {tables.map(t => (
                        <option key={t.name} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                    <select
                      value={fk.refColumn}
                      onChange={(e) => updateForeignKey(tableIndex, fkIndex, "refColumn", e.target.value)}
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Reference Column</option>
                      {fk.refTable && tables.find(t => t.name === fk.refTable)?.columns.map(col => (
                        <option key={col.name} value={col.name}>{col.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeForeignKey(tableIndex, fkIndex)}
                      className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addForeignKey(tableIndex)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <FaPlus className="mr-1" /> Add Foreign Key
                </button>
              </div>

              {/* Indexes */}
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Indexes</h3>
                {table.indexes.map((idx, idxIndex) => (
                  <div key={idxIndex} className="flex flex-wrap items-center gap-3 mb-2">
                    <select
                      value={idx.column}
                      onChange={(e) => updateIndex(tableIndex, idxIndex, "column", e.target.value)}
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Column</option>
                      {table.columns.map(col => (
                        <option key={col.name} value={col.name}>{col.name}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={idx.isUnique}
                        onChange={(e) => updateIndex(tableIndex, idxIndex, "isUnique", e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <span className="text-sm">Unique</span>
                    </label>
                    <button
                      onClick={() => removeIndex(tableIndex, idxIndex)}
                      className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addIndex(tableIndex)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <FaPlus className="mr-1" /> Add Index
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

        {/* Controls */}
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
                className={`flex-1 py-2 px-4 rounded-md text-white transition-colors ${isCopied ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"}`}
              >
                <FaCopy className="inline mr-2" />
                {isCopied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={downloadSchema}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                <FaDownload className="inline mr-2" />
                Download (.sql)
              </button>
              <button
                onClick={() => setSchema("")}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
              >
                <FaTrash className="inline mr-2" />
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

        {/* Features Info */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Create tables with columns, constraints, and comments</li>
            <li>Add foreign keys and indexes</li>
            <li>Support for schema names and DROP statements</li>
            <li>Copy or download generated SQL</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PostgreSQLSchemaGenerator;