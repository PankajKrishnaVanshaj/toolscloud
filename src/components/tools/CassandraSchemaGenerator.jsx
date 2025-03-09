// components/CassandraSchemaGenerator.jsx
"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo } from "react-icons/fa";

const CassandraSchemaGenerator = () => {
  const [keyspace, setKeyspace] = useState("myapp");
  const [tables, setTables] = useState([
    {
      name: "users",
      columns: [
        { name: "user_id", type: "uuid", isPartitionKey: true, isClusteringKey: false, order: "ASC" },
        { name: "email", type: "text", isPartitionKey: false, isClusteringKey: false, order: "ASC" },
        { name: "created_at", type: "timestamp", isPartitionKey: false, isClusteringKey: true, order: "DESC" },
        { name: "name", type: "text", isPartitionKey: false, isClusteringKey: false, order: "ASC" },
      ],
    },
  ]);
  const [schema, setSchema] = useState("");
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    replicationStrategy: "SimpleStrategy",
    replicationFactor: 1,
    durableWrites: true,
  });

  const CASSANDRA_TYPES = [
    "ascii", "bigint", "blob", "boolean", "date",
    "decimal", "double", "float", "inet", "int",
    "smallint", "text", "time", "timestamp", "timeuuid",
    "tinyint", "uuid", "varchar", "list", "set", "map",
  ];

  const MAX_TABLES = 20;
  const MAX_COLUMNS = 30;

  const validateInput = useCallback(() => {
    if (!keyspace.trim()) return "Keyspace name is required";
    if (!/^[a-z][a-z0-9_]*$/.test(keyspace)) return "Keyspace name must be lowercase with letters, numbers, or underscores";
    if (!tables.length) return "Add at least one table";
    if (tables.some((t) => !t.name.trim())) return "All tables need names";
    if (new Set(tables.map((t) => t.name)).size !== tables.length) return "Table names must be unique";
    if (tables.some((t) => !/^[a-z][a-z0-9_]*$/.test(t.name))) return "Table names must be lowercase with letters, numbers, or underscores";

    for (const table of tables) {
      if (!table.columns.length) return `Table "${table.name}" needs at least one column`;
      if (table.columns.some((c) => !c.name.trim())) return `All columns in "${table.name}" need names`;
      if (new Set(table.columns.map((c) => c.name)).size !== table.columns.length) return `Column names in "${table.name}" must be unique`;
      if (!table.columns.some((c) => c.isPartitionKey)) return `Table "${table.name}" needs at least one partition key`;
    }
    return "";
  }, [keyspace, tables]);

  const generateSchema = useCallback(() => {
    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      setSchema("");
      return;
    }

    setError("");
    try {
      let schemaString = `-- Cassandra CQL Schema\n-- Generated: ${new Date().toISOString()}\n\n`;

      // Keyspace definition
      schemaString += `CREATE KEYSPACE IF NOT EXISTS ${keyspace}\n`;
      schemaString += `  WITH replication = {\n`;
      schemaString += `    'class': '${options.replicationStrategy}',\n`;
      if (options.replicationStrategy === "SimpleStrategy") {
        schemaString += `    'replication_factor': ${options.replicationFactor}\n`;
      } else {
        schemaString += `    'datacenter1': ${options.replicationFactor}\n`; // Simplified for NetworkTopologyStrategy
      }
      schemaString += `  } AND durable_writes = ${options.durableWrites};\n\n`;

      tables.forEach((table) => {
        schemaString += `CREATE TABLE ${keyspace}.${table.name} (\n`;
        const columnDefs = table.columns.map((col) => `  ${col.name} ${col.type}`);
        const partitionKeys = table.columns.filter((col) => col.isPartitionKey).map((col) => col.name);
        const clusteringKeys = table.columns.filter((col) => col.isClusteringKey).map((col) => col.name);

        let primaryKeyDef = "  PRIMARY KEY (";
        if (partitionKeys.length > 1) {
          primaryKeyDef += `(${partitionKeys.join(", ")})`;
        } else {
          primaryKeyDef += partitionKeys[0];
        }
        if (clusteringKeys.length) {
          primaryKeyDef += `, ${clusteringKeys.join(", ")}`;
        }
        primaryKeyDef += ")";

        schemaString += columnDefs.join(",\n");
        schemaString += ",\n";
        schemaString += primaryKeyDef;
        schemaString += "\n) WITH CLUSTERING ORDER BY (";
        schemaString += clusteringKeys.length
          ? clusteringKeys.map((key) => {
              const col = table.columns.find((c) => c.name === key);
              return `${key} ${col.order}`;
            }).join(", ")
          : "created_at DESC";
        schemaString += ");\n\n";
      });

      setSchema(schemaString);
      setHistory((prev) => [...prev, { keyspace, tables, options, schema: schemaString }].slice(-5));
      setIsCopied(false);
    } catch (e) {
      setError(`Schema generation failed: ${e.message}`);
    }
  }, [keyspace, tables, options]);

  const addTable = () => {
    if (tables.length < MAX_TABLES) {
      setTables([...tables, {
        name: `table${tables.length + 1}`,
        columns: [{ name: "id", type: "uuid", isPartitionKey: true, isClusteringKey: false, order: "ASC" }],
      }]);
    }
  };

  const updateTable = (index, name) => {
    setTables(tables.map((t, i) => (i === index ? { ...t, name } : t)));
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
        type: "text",
        isPartitionKey: false,
        isClusteringKey: false,
        order: "ASC",
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
    link.download = `schema-${Date.now()}.cql`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const restoreFromHistory = (entry) => {
    setKeyspace(entry.keyspace);
    setTables(entry.tables);
    setOptions(entry.options);
    setSchema(entry.schema);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Cassandra Schema Generator
        </h1>

        {/* Keyspace and Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Keyspace Name</label>
            <input
              type="text"
              value={keyspace}
              onChange={(e) => setKeyspace(e.target.value)}
              placeholder="Keyspace name"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Keyspace Options:</p>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Replication Strategy:</label>
              <select
                value={options.replicationStrategy}
                onChange={(e) => setOptions({ ...options, replicationStrategy: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="SimpleStrategy">SimpleStrategy</option>
                <option value="NetworkTopologyStrategy">NetworkTopologyStrategy</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Replication Factor:</label>
              <input
                type="number"
                min="1"
                max="10"
                value={options.replicationFactor}
                onChange={(e) => setOptions({ ...options, replicationFactor: Math.max(1, Math.min(10, Number(e.target.value))) })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.durableWrites}
                onChange={() => setOptions({ ...options, durableWrites: !options.durableWrites })}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-600">Durable Writes</label>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Tables */}
        <div className="space-y-6">
          {tables.map((table, tableIndex) => (
            <div key={tableIndex} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                <input
                  type="text"
                  value={table.name}
                  onChange={(e) => updateTable(tableIndex, e.target.value)}
                  placeholder="Table name"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => removeTable(tableIndex)}
                  disabled={tables.length <= 1}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  <FaTrash />
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
                      className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <select
                      value={column.type}
                      onChange={(e) => updateColumn(tableIndex, columnIndex, "type", e.target.value)}
                      className="flex-1 min-w-[150px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {CASSANDRA_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={column.isPartitionKey}
                          onChange={(e) => updateColumn(tableIndex, columnIndex, "isPartitionKey", e.target.checked)}
                          className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm">PK</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={column.isClusteringKey}
                          onChange={(e) => updateColumn(tableIndex, columnIndex, "isClusteringKey", e.target.checked)}
                          className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm">CK</span>
                      </label>
                      {column.isClusteringKey && (
                        <select
                          value={column.order}
                          onChange={(e) => updateColumn(tableIndex, columnIndex, "order", e.target.value)}
                          className="p-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="ASC">ASC</option>
                          <option value="DESC">DESC</option>
                        </select>
                      )}
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
                  className="text-sm text-purple-600 hover:text-purple-800 disabled:text-gray-400"
                >
                  + Add Column {table.columns.length >= MAX_COLUMNS && `(Max ${MAX_COLUMNS})`}
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addTable}
            disabled={tables.length >= MAX_TABLES}
            className="text-sm text-purple-600 hover:text-purple-800 disabled:text-gray-400"
          >
            + Add Table {tables.length >= MAX_TABLES && `(Max ${MAX_TABLES})`}
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-6">
          <button
            onClick={generateSchema}
            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors font-medium flex items-center justify-center"
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
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors font-medium flex items-center justify-center"
              >
                <FaDownload className="mr-2" />
                Download (.cql)
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
                  <span>{entry.keyspace} ({entry.tables.length} tables)</span>
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
            <li>Define keyspace with replication strategy and durable writes</li>
            <li>Create tables with partition and clustering keys</li>
            <li>Customize clustering order (ASC/DESC)</li>
            <li>Copy, download, and track schema history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CassandraSchemaGenerator;