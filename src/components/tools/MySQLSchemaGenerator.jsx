"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload } from "react-icons/fa";

const MySQLSchemaGenerator = () => {
  const [tables, setTables] = useState([
    {
      name: "users",
      comment: "Stores user information",
      columns: [
        { name: "id", type: "INT", isPrimary: true, isNullable: false, isUnique: true, autoIncrement: true, defaultValue: "", foreignKey: null },
        { name: "email", type: "VARCHAR(255)", isPrimary: false, isNullable: false, isUnique: true, autoIncrement: false, defaultValue: "", foreignKey: null },
        { name: "created_at", type: "DATETIME", isPrimary: false, isNullable: false, isUnique: false, autoIncrement: false, defaultValue: "CURRENT_TIMESTAMP", foreignKey: null },
      ],
    },
  ]);
  const [schema, setSchema] = useState("");
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [options, setOptions] = useState({
    engine: "InnoDB",
    charset: "utf8mb4",
    collation: "utf8mb4_unicode_ci",
    includeDrop: false,
  });

  const MYSQL_TYPES = [
    "TINYINT", "SMALLINT", "MEDIUMINT", "INT", "BIGINT",
    "DECIMAL", "FLOAT", "DOUBLE",
    "CHAR", "VARCHAR(255)", "TEXT", "MEDIUMTEXT", "LONGTEXT",
    "DATE", "DATETIME", "TIMESTAMP", "TIME",
    "BOOLEAN", "BINARY", "VARBINARY(255)",
    "ENUM", "SET",
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
      for (const col of table.columns) {
        if (col.foreignKey) {
          const [refTable, refColumn] = col.foreignKey.split(".");
          if (!tables.some((t) => t.name === refTable && t.columns.some((c) => c.name === refColumn))) {
            return `Invalid foreign key reference in "${table.name}.${col.name}" to "${col.foreignKey}"`;
          }
        }
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
      let schemaString = `-- MySQL Schema\n-- Generated: ${new Date().toISOString()}\n\n`;

      if (options.includeDrop) {
        tables.forEach((table) => {
          schemaString += `DROP TABLE IF EXISTS ${table.name};\n`;
        });
        schemaString += "\n";
      }

      tables.forEach((table, index) => {
        schemaString += `CREATE TABLE ${table.name} (\n`;
        const columnDefs = table.columns.map((col) => {
          let def = `  ${col.name} ${col.type}`;
          if (col.autoIncrement) def += " AUTO_INCREMENT";
          if (!col.isNullable) def += " NOT NULL";
          if (col.isUnique && !col.isPrimary) def += " UNIQUE";
          if (col.defaultValue) def += ` DEFAULT ${col.defaultValue === "CURRENT_TIMESTAMP" ? "CURRENT_TIMESTAMP" : `'${col.defaultValue}'`}`;
          return def;
        });

        const primaryKeys = table.columns.filter((col) => col.isPrimary).map((col) => col.name);
        if (primaryKeys.length) {
          columnDefs.push(`  PRIMARY KEY (${primaryKeys.join(", ")})`);
        }

        const foreignKeys = table.columns.filter((col) => col.foreignKey).map((col, fkIndex) => {
          const [refTable, refColumn] = col.foreignKey.split(".");
          return `  CONSTRAINT fk_${table.name}_${col.name}_${fkIndex} FOREIGN KEY (${col.name}) REFERENCES ${refTable} (${refColumn}) ON DELETE CASCADE ON UPDATE CASCADE`;
        });

        schemaString += [...columnDefs, ...foreignKeys].join(",\n");
        schemaString += `\n) ENGINE=${options.engine} DEFAULT CHARSET=${options.charset} COLLATE=${options.collation}`;
        if (table.comment) schemaString += ` COMMENT='${table.comment}'`;
        schemaString += ";\n";
        if (index < tables.length - 1) schemaString += "\n";
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
        comment: "",
        columns: [{ name: "id", type: "INT", isPrimary: true, isNullable: false, isUnique: true, autoIncrement: true, defaultValue: "", foreignKey: null }],
      }]);
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
        type: "VARCHAR(255)",
        isPrimary: false,
        isNullable: true,
        isUnique: false,
        autoIncrement: false,
        defaultValue: "",
        foreignKey: null,
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
          MySQL Schema Generator
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Global Options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">Schema Options</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Engine:</label>
              <select
                value={options.engine}
                onChange={(e) => setOptions({ ...options, engine: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="InnoDB">InnoDB</option>
                <option value="MyISAM">MyISAM</option>
                <option value="MEMORY">MEMORY</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Charset:</label>
              <select
                value={options.charset}
                onChange={(e) => setOptions({ ...options, charset: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="utf8mb4">utf8mb4</option>
                <option value="utf8">utf8</option>
                <option value="latin1">latin1</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Collation:</label>
              <select
                value={options.collation}
                onChange={(e) => setOptions({ ...options, collation: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="utf8mb4_unicode_ci">utf8mb4_unicode_ci</option>
                <option value="utf8mb4_general_ci">utf8mb4_general_ci</option>
                <option value="utf8_general_ci">utf8_general_ci</option>
                <option value="latin1_swedish_ci">latin1_swedish_ci</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.includeDrop}
                onChange={(e) => setOptions({ ...options, includeDrop: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-600">Include DROP TABLE</label>
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
                <input
                  type="text"
                  value={table.comment}
                  onChange={(e) => updateTable(tableIndex, "comment", e.target.value)}
                  placeholder="Table comment"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeTable(tableIndex)}
                  disabled={tables.length <= 1}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  Delete
                </button>
              </div>

              <div className="space-y-3">
                {table.columns.map((column, columnIndex) => (
                  <div key={columnIndex} className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-md border border-gray-200">
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
                      {MYSQL_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2 flex-wrap">
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
                          checked={column.autoIncrement}
                          onChange={(e) => updateColumn(tableIndex, columnIndex, "autoIncrement", e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-xs">AI</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={column.defaultValue}
                      onChange={(e) => updateColumn(tableIndex, columnIndex, "defaultValue", e.target.value)}
                      placeholder="Default value"
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={column.foreignKey || ""}
                      onChange={(e) => updateColumn(tableIndex, columnIndex, "foreignKey", e.target.value || null)}
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No Foreign Key</option>
                      {tables.flatMap((t) =>
                        t.columns.map((c) => (
                          <option key={`${t.name}.${c.name}`} value={`${t.name}.${c.name}`}>
                            {t.name}.{c.name}
                          </option>
                        ))
                      )}
                    </select>
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
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                >
                  + Add Column {table.columns.length >= MAX_COLUMNS && `(Max ${MAX_COLUMNS})`}
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addTable}
            disabled={tables.length >= MAX_TABLES}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
          >
            + Add Table {tables.length >= MAX_TABLES && `(Max ${MAX_TABLES})`}
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-6">
          <button
            onClick={generateSchema}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
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
                Download (.sql)
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

        {/* Features Info */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Create tables with custom columns and data types</li>
            <li>Support for Primary Keys, Unique, Not Null, and Auto Increment</li>
            <li>Add Foreign Key constraints with CASCADE options</li>
            <li>Custom table comments and schema options (engine, charset, collation)</li>
            <li>Copy or download generated SQL</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MySQLSchemaGenerator;