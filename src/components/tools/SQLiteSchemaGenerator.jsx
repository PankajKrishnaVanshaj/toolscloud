"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo } from "react-icons/fa";

const SQLiteSchemaGenerator = () => {
  const [tables, setTables] = useState([
    {
      name: "users",
      columns: [
        { name: "id", type: "INTEGER", isPrimary: true, isNullable: false, isUnique: true, autoIncrement: true, defaultValue: "" },
        { name: "email", type: "TEXT", isPrimary: false, isNullable: false, isUnique: true, autoIncrement: false, defaultValue: "" },
        { name: "created_at", type: "DATETIME", isPrimary: false, isNullable: false, isUnique: false, autoIncrement: false, defaultValue: "CURRENT_TIMESTAMP" },
      ],
      foreignKeys: [],
      indexes: [],
    },
  ]);
  const [schema, setSchema] = useState("");
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    tempTable: false, // Temporary table option
    ifNotExists: true, // Add IF NOT EXISTS clause
  });

  const SQLITE_TYPES = ["INTEGER", "REAL", "TEXT", "BLOB", "NUMERIC", "DATETIME", "DATE", "TIME", "BOOLEAN"];
  const MAX_TABLES = 20;
  const MAX_COLUMNS = 30;

  const validateInput = useCallback(() => {
    if (!tables.length) return "Add at least one table";
    if (tables.some((t) => !t.name.trim())) return "All tables need names";
    if (new Set(tables.map((t) => t.name)).size !== tables.length) return "Table names must be unique";
    if (tables.some((t) => !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(t.name))) return "Table names must start with a letter and contain only letters, numbers, or underscores";

    for (const table of tables) {
      if (!table.columns.length) return `Table "${table.name}" needs at least one column`;
      if (table.columns.some((c) => !c.name.trim())) return `All columns in "${table.name}" need names`;
      if (new Set(table.columns.map((c) => c.name)).size !== table.columns.length) return `Column names in "${table.name}" must be unique`;
      if (!table.columns.some((c) => c.isPrimary)) return `Table "${table.name}" needs a primary key`;

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
      let schemaString = `-- SQLite Schema\n-- Generated: ${new Date().toISOString()}\n\n`;

      tables.forEach((table) => {
        const tableType = options.tempTable ? "TEMPORARY" : "";
        const ifNotExists = options.ifNotExists ? "IF NOT EXISTS" : "";
        schemaString += `CREATE ${tableType} TABLE ${ifNotExists} ${table.name} (\n`;

        // Columns
        const columnDefs = table.columns.map((col) => {
          let def = `  ${col.name} ${col.type}`;
          if (col.isPrimary) def += " PRIMARY KEY";
          if (col.autoIncrement && col.type === "INTEGER") def += " AUTOINCREMENT";
          if (!col.isNullable && !col.isPrimary) def += " NOT NULL";
          if (col.isUnique && !col.isPrimary) def += " UNIQUE";
          if (col.defaultValue) def += ` DEFAULT ${col.defaultValue === "CURRENT_TIMESTAMP" ? "CURRENT_TIMESTAMP" : `'${col.defaultValue}'`}`;
          return def;
        });

        // Foreign Keys
        const fkDefs = table.foreignKeys.map((fk) => {
          return `  FOREIGN KEY (${fk.column}) REFERENCES ${fk.refTable}(${fk.refColumn})${fk.onDelete ? ` ON DELETE ${fk.onDelete}` : ""}${fk.onUpdate ? ` ON UPDATE ${fk.onUpdate}` : ""}`;
        });

        schemaString += [...columnDefs, ...fkDefs].join(",\n");
        schemaString += "\n);\n\n";

        // Indexes
        table.indexes.forEach((index) => {
          schemaString += `CREATE ${index.isUnique ? "UNIQUE " : ""}INDEX idx_${table.name}_${index.column} ON ${table.name}(${index.column});\n`;
        });
        schemaString += "\n";
      });

      setSchema(schemaString);
      setHistory((prev) => [...prev, { tables: JSON.parse(JSON.stringify(tables)), options, schema: schemaString }].slice(-5));
      setIsCopied(false);
    } catch (e) {
      setError(`Schema generation failed: ${e.message}`);
    }
  }, [tables, options]);

  const addTable = () => {
    if (tables.length < MAX_TABLES) {
      setTables([...tables, { name: `table${tables.length + 1}`, columns: [{ name: "id", type: "INTEGER", isPrimary: true, isNullable: false, isUnique: true, autoIncrement: true, defaultValue: "" }], foreignKeys: [], indexes: [] }]);
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
      newTables[tableIndex].columns.push({ name: `col${newTables[tableIndex].columns.length + 1}`, type: "TEXT", isPrimary: false, isNullable: true, isUnique: false, autoIncrement: false, defaultValue: "" });
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
    newTables[tableIndex].foreignKeys.push({ column: "", refTable: "", refColumn: "", onDelete: "", onUpdate: "" });
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
    newTables[tableIndex].indexes.push({ column: tables[tableIndex].columns[0].name, isUnique: false });
    setTables(newTables);
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

  const restoreFromHistory = (entry) => {
    setTables(entry.tables);
    setOptions(entry.options);
    setSchema(entry.schema);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 text-center">SQLite Schema Generator</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>
        )}

        {/* Options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <p className="text-sm font-medium text-gray-700">Schema Options:</p>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.tempTable}
                onChange={(e) => setOptions((prev) => ({ ...prev, tempTable: e.target.checked }))}
                className="h-4 w-4 text-green-600 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">Temporary Tables</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.ifNotExists}
                onChange={(e) => setOptions((prev) => ({ ...prev, ifNotExists: e.target.checked }))}
                className="h-4 w-4 text-green-600 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">IF NOT EXISTS</span>
            </label>
          </div>
        </div>

        {/* Tables */}
        <div className="space-y-6">
          {tables.map((table, tableIndex) => (
            <div key={tableIndex} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                <input
                  type="text"
                  value={table.name}
                  onChange={(e) => updateTable(tableIndex, "name", e.target.value)}
                  placeholder="Table name"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <button
                  onClick={() => removeTable(tableIndex)}
                  disabled={tables.length <= 1}
                  className="w-full sm:w-auto px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  Delete Table
                </button>
              </div>

              {/* Columns */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Columns:</h3>
                {table.columns.map((column, columnIndex) => (
                  <div key={columnIndex} className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-md border border-gray-200">
                    <input
                      type="text"
                      value={column.name}
                      onChange={(e) => updateColumn(tableIndex, columnIndex, "name", e.target.value)}
                      placeholder="Column name"
                      className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                    />
                    <select
                      value={column.type}
                      onChange={(e) => updateColumn(tableIndex, columnIndex, "type", e.target.value)}
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                    >
                      {SQLITE_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1">
                        <input type="checkbox" checked={column.isPrimary} onChange={(e) => updateColumn(tableIndex, columnIndex, "isPrimary", e.target.checked)} className="h-4 w-4 text-green-600" />
                        <span className="text-xs">PK</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input type="checkbox" checked={!column.isNullable} onChange={(e) => updateColumn(tableIndex, columnIndex, "isNullable", !e.target.checked)} className="h-4 w-4 text-green-600" />
                        <span className="text-xs">NN</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input type="checkbox" checked={column.isUnique} onChange={(e) => updateColumn(tableIndex, columnIndex, "isUnique", e.target.checked)} className="h-4 w-4 text-green-600" />
                        <span className="text-xs">UN</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input type="checkbox" checked={column.autoIncrement} onChange={(e) => updateColumn(tableIndex, columnIndex, "autoIncrement", e.target.checked)} disabled={column.type !== "INTEGER"} className="h-4 w-4 text-green-600 disabled:opacity-50" />
                        <span className="text-xs">AI</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={column.defaultValue}
                      onChange={(e) => updateColumn(tableIndex, columnIndex, "defaultValue", e.target.value)}
                      placeholder="Default"
                      className="flex-1 min-w-[100px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
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
                  className="text-sm text-green-600 hover:text-green-800 disabled:text-gray-400"
                >
                  + Add Column {table.columns.length >= MAX_COLUMNS && `(Max ${MAX_COLUMNS})`}
                </button>
              </div>

              {/* Foreign Keys */}
              <div className="mt-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Foreign Keys:</h3>
                {table.foreignKeys.map((fk, fkIndex) => (
                  <div key={fkIndex} className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-md border border-gray-200">
                    <select value={fk.column} onChange={(e) => updateForeignKey(tableIndex, fkIndex, "column", e.target.value)} className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500">
                      <option value="">Select Column</option>
                      {table.columns.map((col) => <option key={col.name} value={col.name}>{col.name}</option>)}
                    </select>
                    <select value={fk.refTable} onChange={(e) => updateForeignKey(tableIndex, fkIndex, "refTable", e.target.value)} className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500">
                      <option value="">Ref Table</option>
                      {tables.map((t) => <option key={t.name} value={t.name}>{t.name}</option>)}
                    </select>
                    <select value={fk.refColumn} onChange={(e) => updateForeignKey(tableIndex, fkIndex, "refColumn", e.target.value)} className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500">
                      <option value="">Ref Column</option>
                      {tables.find((t) => t.name === fk.refTable)?.columns.map((col) => <option key={col.name} value={col.name}>{col.name}</option>) || []}
                    </select>
                    <select value={fk.onDelete} onChange={(e) => updateForeignKey(tableIndex, fkIndex, "onDelete", e.target.value)} className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500">
                      <option value="">On Delete</option>
                      <option value="CASCADE">CASCADE</option>
                      <option value="SET NULL">SET NULL</option>
                      <option value="RESTRICT">RESTRICT</option>
                    </select>
                    <button onClick={() => removeForeignKey(tableIndex, fkIndex)} className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">×</button>
                  </div>
                ))}
                <button onClick={() => addForeignKey(tableIndex)} className="text-sm text-green-600 hover:text-green-800">+ Add Foreign Key</button>
              </div>

              {/* Indexes */}
              <div className="mt-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Indexes:</h3>
                {table.indexes.map((index, indexIndex) => (
                  <div key={indexIndex} className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-md border border-gray-200">
                    <select value={index.column} onChange={(e) => updateIndex(tableIndex, indexIndex, "column", e.target.value)} className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500">
                      {table.columns.map((col) => <option key={col.name} value={col.name}>{col.name}</option>)}
                    </select>
                    <label className="flex items-center gap-1">
                      <input type="checkbox" checked={index.isUnique} onChange={(e) => updateIndex(tableIndex, indexIndex, "isUnique", e.target.checked)} className="h-4 w-4 text-green-600" />
                      <span className="text-xs">Unique</span>
                    </label>
                    <button onClick={() => removeIndex(tableIndex, indexIndex)} className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">×</button>
                  </div>
                ))}
                <button onClick={() => addIndex(tableIndex)} className="text-sm text-green-600 hover:text-green-800">+ Add Index</button>
              </div>
            </div>
          ))}
          <button
            onClick={addTable}
            disabled={tables.length >= MAX_TABLES}
            className="text-sm text-green-600 hover:text-green-800 disabled:text-gray-400"
          >
            + Add Table {tables.length >= MAX_TABLES && `(Max ${MAX_TABLES})`}
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button onClick={generateSchema} className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">Generate Schema</button>
          {schema && (
            <>
              <button onClick={copyToClipboard} className={`flex-1 py-2 px-4 rounded-md text-white transition-colors ${isCopied ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"} flex items-center justify-center`}>
                <FaCopy className="mr-2" />
                {isCopied ? "Copied!" : "Copy"}
              </button>
              <button onClick={downloadSchema} className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center">
                <FaDownload className="mr-2" />
                Download (.sql)
              </button>
              <button onClick={() => setSchema("")} className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center">
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
            <pre className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto text-sm font-mono text-gray-800 whitespace-pre-wrap">{schema}</pre>
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
                  <span>{entry.tables.length} tables - {entry.schema.split("\n").length} lines</span>
                  <button onClick={() => restoreFromHistory(entry)} className="text-green-500 hover:text-green-700 transition-colors">
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
            <li>Create tables with columns, foreign keys, and indexes</li>
            <li>Support for SQLite data types and constraints</li>
            <li>Optional temporary tables and IF NOT EXISTS clause</li>
            <li>Copy, download, and restore schema history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SQLiteSchemaGenerator;