"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo } from "react-icons/fa";

const TimescaleDBSchemaGenerator = () => {
  const [tables, setTables] = useState([
    {
      name: "sensor_readings",
      isHypertable: true,
      timeColumn: "timestamp",
      partitionColumn: "",
      compression: false,
      compressionAfter: "30 days",
      indexes: [],
      columns: [
        { name: "id", type: "BIGINT", isPrimary: true, isNullable: false, isUnique: true, defaultValue: "", isIndexed: false },
        { name: "timestamp", type: "TIMESTAMPTZ", isPrimary: false, isNullable: false, isUnique: false, defaultValue: "NOW()", isIndexed: false },
        { name: "value", type: "DOUBLE PRECISION", isPrimary: false, isNullable: false, isUnique: false, defaultValue: "", isIndexed: false },
        { name: "sensor_id", type: "VARCHAR(50)", isPrimary: false, isNullable: false, isUnique: false, defaultValue: "", isIndexed: false },
      ],
    },
  ]);
  const [schema, setSchema] = useState("");
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const TIMESCALE_TYPES = [
    "SMALLINT", "INTEGER", "BIGINT",
    "REAL", "DOUBLE PRECISION", "NUMERIC",
    "CHAR", "VARCHAR(50)", "TEXT",
    "DATE", "TIMESTAMP", "TIMESTAMPTZ",
    "BOOLEAN", "UUID", "JSON", "JSONB",
  ];

  const MAX_TABLES = 20;
  const MAX_COLUMNS = 30;

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
      if (table.isHypertable && !table.timeColumn) return `Hypertable "${table.name}" needs a time column`;
      if (table.isHypertable && !table.columns.some((c) => c.name === table.timeColumn)) return `Time column "${table.timeColumn}" not found in "${table.name}"`;
      if (table.partitionColumn && !table.columns.some((c) => c.name === table.partitionColumn)) return `Partition column "${table.partitionColumn}" not found in "${table.name}"`;
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
      let schemaString = `-- TimescaleDB Schema\n-- Generated: ${new Date().toISOString()}\n\n`;

      tables.forEach((table) => {
        schemaString += `CREATE TABLE ${table.name} (\n`;
        const columnDefs = table.columns.map((col) => {
          let def = `  ${col.name} ${col.type}`;
          if (!col.isNullable) def += " NOT NULL";
          if (col.isUnique && !col.isPrimary) def += " UNIQUE";
          if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`;
          return def;
        });

        const primaryKeys = table.columns.filter((col) => col.isPrimary).map((col) => col.name);
        if (primaryKeys.length) {
          columnDefs.push(`  PRIMARY KEY (${primaryKeys.join(", ")})`);
        }

        schemaString += columnDefs.join(",\n");
        schemaString += "\n);\n\n";

        if (table.isHypertable) {
          schemaString += `-- Convert to hypertable\n`;
          schemaString += `SELECT create_hypertable('${table.name}', '${table.timeColumn}'`;
          if (table.partitionColumn) {
            schemaString += `, partitioning_column => '${table.partitionColumn}'`;
          }
          schemaString += `);\n\n`;
        }

        if (table.indexes.length) {
          table.indexes.forEach((idx) => {
            schemaString += `CREATE INDEX idx_${table.name}_${idx} ON ${table.name} (${idx});\n`;
          });
          schemaString += "\n";
        }

        if (table.compression) {
          schemaString += `-- Enable compression\n`;
          schemaString += `ALTER TABLE ${table.name} SET (\n  timescaledb.compress,\n  timescaledb.compress_segmentby = '${table.partitionColumn || table.timeColumn}'\n);\n`;
          schemaString += `SELECT add_compression_policy('${table.name}', INTERVAL '${table.compressionAfter}');\n\n`;
        }
      });

      setSchema(schemaString);
      setHistory((prev) => [...prev, { tables: JSON.parse(JSON.stringify(tables)), schema: schemaString }].slice(-5));
      setIsCopied(false);
    } catch (e) {
      setError(`Schema generation failed: ${e.message}`);
    }
  }, [tables]);

  const addTable = () => {
    if (tables.length < MAX_TABLES) {
      setTables([
        ...tables,
        {
          name: `table${tables.length + 1}`,
          isHypertable: false,
          timeColumn: "",
          partitionColumn: "",
          compression: false,
          compressionAfter: "30 days",
          indexes: [],
          columns: [{ name: "id", type: "BIGINT", isPrimary: true, isNullable: false, isUnique: true, defaultValue: "", isIndexed: false }],
        },
      ]);
    }
  };

  const updateTable = (index, key, value) => {
    setTables(tables.map((t, i) => (i === index ? { ...t, [key]: value } : t)));
  };

  const removeTable = (index) => {
    if (tables.length > 1) {
      setTables(tables.filter((_, i) => i !== index));
    }
  };

  const addColumn = (tableIndex) => {
    if (tables[tableIndex].columns.length < MAX_COLUMNS) {
      const newTables = [...tables];
      newTables[tableIndex].columns.push({
        name: `col${newTables[tableIndex].columns.length + 1}`,
        type: "INTEGER",
        isPrimary: false,
        isNullable: true,
        isUnique: false,
        defaultValue: "",
        isIndexed: false,
      });
      setTables(newTables);
    }
  };

  const updateColumn = (tableIndex, columnIndex, key, value) => {
    const newTables = [...tables];
    newTables[tableIndex].columns[columnIndex][key] = value;
    if (key === "isIndexed") {
      const columnName = newTables[tableIndex].columns[columnIndex].name;
      newTables[tableIndex].indexes = value
        ? [...newTables[tableIndex].indexes, columnName]
        : newTables[tableIndex].indexes.filter((idx) => idx !== columnName);
    }
    setTables(newTables);
  };

  const removeColumn = (tableIndex, columnIndex) => {
    if (tables[tableIndex].columns.length > 1) {
      const newTables = [...tables];
      const columnName = newTables[tableIndex].columns[columnIndex].name;
      newTables[tableIndex].indexes = newTables[tableIndex].indexes.filter((idx) => idx !== columnName);
      newTables[tableIndex].columns = newTables[tableIndex].columns.filter((_, i) => i !== columnIndex);
      setTables(newTables);
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
    link.download = `schema-${Date.now()}.sql`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const restoreFromHistory = (entry) => {
    setTables(entry.tables);
    setSchema(entry.schema);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced TimescaleDB Schema Generator
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {tables.map((table, tableIndex) => (
            <div key={tableIndex} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <input
                    type="text"
                    value={table.name}
                    onChange={(e) => updateTable(tableIndex, "name", e.target.value)}
                    placeholder="Table name"
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => removeTable(tableIndex)}
                    disabled={tables.length <= 1}
                    className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={table.isHypertable}
                      onChange={(e) => updateTable(tableIndex, "isHypertable", e.target.checked)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <span className="text-sm">Hypertable</span>
                  </label>
                  {table.isHypertable && (
                    <>
                      <select
                        value={table.timeColumn}
                        onChange={(e) => updateTable(tableIndex, "timeColumn", e.target.value)}
                        className="w-full sm:w-auto p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select time column</option>
                        {table.columns.map((col) => (
                          <option key={col.name} value={col.name}>{col.name}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={table.partitionColumn}
                        onChange={(e) => updateTable(tableIndex, "partitionColumn", e.target.value)}
                        placeholder="Partition column (optional)"
                        className="w-full sm:w-auto p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={table.compression}
                          onChange={(e) => updateTable(tableIndex, "compression", e.target.checked)}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <span className="text-sm">Compression</span>
                      </label>
                      {table.compression && (
                        <input
                          type="text"
                          value={table.compressionAfter}
                          onChange={(e) => updateTable(tableIndex, "compressionAfter", e.target.value)}
                          placeholder="e.g., 30 days"
                          className="w-full sm:w-auto p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {table.columns.map((column, columnIndex) => (
                  <div key={columnIndex} className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-md border border-gray-200">
                    <input
                      type="text"
                      value={column.name}
                      onChange={(e) => updateColumn(tableIndex, columnIndex, "name", e.target.value)}
                      placeholder="Column name"
                      className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <select
                      value={column.type}
                      onChange={(e) => updateColumn(tableIndex, columnIndex, "type", e.target.value)}
                      className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {TIMESCALE_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={column.isPrimary}
                          onChange={(e) => updateColumn(tableIndex, columnIndex, "isPrimary", e.target.checked)}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <span className="text-sm">PK</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={!column.isNullable}
                          onChange={(e) => updateColumn(tableIndex, columnIndex, "isNullable", !e.target.checked)}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <span className="text-sm">NN</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={column.isUnique}
                          onChange={(e) => updateColumn(tableIndex, columnIndex, "isUnique", e.target.checked)}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <span className="text-sm">UN</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={column.isIndexed}
                          onChange={(e) => updateColumn(tableIndex, columnIndex, "isIndexed", e.target.checked)}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <span className="text-sm">IX</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={column.defaultValue}
                      onChange={(e) => updateColumn(tableIndex, columnIndex, "defaultValue", e.target.value)}
                      placeholder="Default value"
                      className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
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

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-6">
          <button
            onClick={generateSchema}
            className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center"
          >
            Generate Schema
          </button>
          {schema && (
            <>
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-2 px-4 rounded-md transition-colors font-medium flex items-center justify-center text-white ${
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
                Download (.sql)
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
                    {entry.tables.map((t) => t.name).join(", ")} ({entry.tables.length} tables)
                  </span>
                  <button
                    onClick={() => restoreFromHistory(entry)}
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
            <li>Create regular tables or hypertables</li>
            <li>Configure time and partition columns</li>
            <li>Add indexes and compression policies</li>
            <li>Support for primary keys, unique constraints, and defaults</li>
            <li>Copy, download, and track schema history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TimescaleDBSchemaGenerator;