"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo } from "react-icons/fa";

const MariaDBSchemaGenerator = () => {
  const [tables, setTables] = useState([
    {
      name: "users",
      columns: [
        { name: "id", type: "INT", isPrimary: true, isNullable: false, isUnique: true, autoIncrement: true, defaultValue: "" },
        { name: "email", type: "VARCHAR(255)", isPrimary: false, isNullable: false, isUnique: true, autoIncrement: false, defaultValue: "" },
        { name: "created_at", type: "DATETIME", isPrimary: false, isNullable: false, isUnique: false, autoIncrement: false, defaultValue: "CURRENT_TIMESTAMP" },
      ],
      foreignKeys: [],
      indexes: [],
      options: { engine: "InnoDB", charset: "utf8mb4" },
    },
  ]);
  const [schema, setSchema] = useState("");
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const MARIA_TYPES = [
    "TINYINT", "SMALLINT", "MEDIUMINT", "INT", "BIGINT",
    "DECIMAL", "FLOAT", "DOUBLE",
    "CHAR", "VARCHAR(255)", "TEXT", "MEDIUMTEXT", "LONGTEXT",
    "DATE", "DATETIME", "TIMESTAMP", "TIME",
    "BOOLEAN", "BINARY", "VARBINARY(255)",
    "JSON",
  ];
  const ENGINES = ["InnoDB", "MyISAM", "MEMORY"];
  const CHARSETS = ["utf8mb4", "utf8", "latin1"];
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
      for (const fk of table.foreignKeys) {
        if (!tables.some((t) => t.name === fk.referencesTable)) return `Referenced table "${fk.referencesTable}" in foreign key for "${table.name}" does not exist`;
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
      let schemaString = `-- MariaDB Schema\n-- Generated: ${new Date().toISOString()}\n\n`;

      tables.forEach((table) => {
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
        if (primaryKeys.length) columnDefs.push(`  PRIMARY KEY (${primaryKeys.join(", ")})`);

        table.indexes.forEach((idx) => {
          columnDefs.push(`  ${idx.type} INDEX ${idx.name} (${idx.columns.join(", ")})`);
        });

        table.foreignKeys.forEach((fk) => {
          columnDefs.push(
            `  FOREIGN KEY (${fk.column}) REFERENCES ${fk.referencesTable} (${fk.referencesColumn}) ON DELETE ${fk.onDelete} ON UPDATE ${fk.onUpdate}`
          );
        });

        schemaString += columnDefs.join(",\n");
        schemaString += `\n) ENGINE=${table.options.engine} DEFAULT CHARSET=${table.options.charset};\n\n`;
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
      setTables([...tables, {
        name: `table${tables.length + 1}`,
        columns: [{ name: "id", type: "INT", isPrimary: true, isNullable: false, isUnique: true, autoIncrement: true, defaultValue: "" }],
        foreignKeys: [],
        indexes: [],
        options: { engine: "InnoDB", charset: "utf8mb4" },
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
        type: "VARCHAR(255)",
        isPrimary: false,
        isNullable: true,
        isUnique: false,
        autoIncrement: false,
        defaultValue: "",
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
    newTables[tableIndex].foreignKeys.push({
      column: newTables[tableIndex].columns[0].name,
      referencesTable: tables[0].name,
      referencesColumn: "id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
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
    newTables[tableIndex].indexes.push({
      name: `idx_${newTables[tableIndex].name}_${newTables[tableIndex].indexes.length + 1}`,
      type: "INDEX",
      columns: [newTables[tableIndex].columns[0].name],
    });
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
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced MariaDB Schema Generator
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
                <div className="flex gap-2">
                  <select
                    value={table.options.engine}
                    onChange={(e) => updateTable(tableIndex, "options", { ...table.options, engine: e.target.value })}
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {ENGINES.map((engine) => (
                      <option key={engine} value={engine}>{engine}</option>
                    ))}
                  </select>
                  <select
                    value={table.options.charset}
                    onChange={(e) => updateTable(tableIndex, "options", { ...table.options, charset: e.target.value })}
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {CHARSETS.map((charset) => (
                      <option key={charset} value={charset}>{charset}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeTable(tableIndex)}
                    disabled={tables.length <= 1}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
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
                      className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={column.type}
                      onChange={(e) => updateColumn(tableIndex, columnIndex, "type", e.target.value)}
                      className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      {MARIA_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={column.isPrimary}
                          onChange={(e) => updateColumn(tableIndex, columnIndex, "isPrimary", e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-sm">PK</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={!column.isNullable}
                          onChange={(e) => updateColumn(tableIndex, columnIndex, "isNullable", !e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-sm">NN</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={column.isUnique}
                          onChange={(e) => updateColumn(tableIndex, columnIndex, "isUnique", e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-sm">UN</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={column.autoIncrement}
                          onChange={(e) => updateColumn(tableIndex, columnIndex, "autoIncrement", e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-sm">AI</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={column.defaultValue}
                      onChange={(e) => updateColumn(tableIndex, columnIndex, "defaultValue", e.target.value)}
                      placeholder="Default value"
                      className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                >
                  + Add Column {table.columns.length >= MAX_COLUMNS && `(Max ${MAX_COLUMNS})`}
                </button>
              </div>

              {/* Foreign Keys */}
              <div className="space-y-3 mb-4">
                {table.foreignKeys.map((fk, fkIndex) => (
                  <div key={fkIndex} className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-md border border-gray-200">
                    <select
                      value={fk.column}
                      onChange={(e) => updateForeignKey(tableIndex, fkIndex, "column", e.target.value)}
                      className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      {table.columns.map((col) => (
                        <option key={col.name} value={col.name}>{col.name}</option>
                      ))}
                    </select>
                    <select
                      value={fk.referencesTable}
                      onChange={(e) => updateForeignKey(tableIndex, fkIndex, "referencesTable", e.target.value)}
                      className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      {tables.map((t) => (
                        <option key={t.name} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                    <select
                      value={fk.referencesColumn}
                      onChange={(e) => updateForeignKey(tableIndex, fkIndex, "referencesColumn", e.target.value)}
                      className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      {tables.find((t) => t.name === fk.referencesTable)?.columns.map((col) => (
                        <option key={col.name} value={col.name}>{col.name}</option>
                      ))}
                    </select>
                    <select
                      value={fk.onDelete}
                      onChange={(e) => updateForeignKey(tableIndex, fkIndex, "onDelete", e.target.value)}
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="CASCADE">CASCADE</option>
                      <option value="RESTRICT">RESTRICT</option>
                      <option value="SET NULL">SET NULL</option>
                    </select>
                    <select
                      value={fk.onUpdate}
                      onChange={(e) => updateForeignKey(tableIndex, fkIndex, "onUpdate", e.target.value)}
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="CASCADE">CASCADE</option>
                      <option value="RESTRICT">RESTRICT</option>
                      <option value="SET NULL">SET NULL</option>
                    </select>
                    <button
                      onClick={() => removeForeignKey(tableIndex, fkIndex)}
                      className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addForeignKey(tableIndex)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Foreign Key
                </button>
              </div>

              {/* Indexes */}
              <div className="space-y-3">
                {table.indexes.map((idx, idxIndex) => (
                  <div key={idxIndex} className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-md border border-gray-200">
                    <input
                      type="text"
                      value={idx.name}
                      onChange={(e) => updateIndex(tableIndex, idxIndex, "name", e.target.value)}
                      placeholder="Index name"
                      className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={idx.type}
                      onChange={(e) => updateIndex(tableIndex, idxIndex, "type", e.target.value)}
                      className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="INDEX">INDEX</option>
                      <option value="UNIQUE">UNIQUE</option>
                    </select>
                    <select
                      multiple
                      value={idx.columns}
                      onChange={(e) => updateIndex(tableIndex, idxIndex, "columns", Array.from(e.target.selectedOptions, (option) => option.value))}
                      className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 h-20"
                    >
                      {table.columns.map((col) => (
                        <option key={col.name} value={col.name}>{col.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeIndex(tableIndex, idxIndex)}
                      className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addIndex(tableIndex)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Index
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

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
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
                  <span>{entry.tables.length} tables - {entry.schema.split("\n")[2].slice(0, 30)}...</span>
                  <button
                    onClick={() => {
                      setTables(entry.tables);
                      setSchema(entry.schema);
                    }}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Define tables with columns, primary keys, and constraints</li>
            <li>Add foreign keys with ON DELETE/UPDATE actions</li>
            <li>Create custom indexes (INDEX, UNIQUE)</li>
            <li>Customize engine and charset per table</li>
            <li>Copy, download, and track schema history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MariaDBSchemaGenerator;