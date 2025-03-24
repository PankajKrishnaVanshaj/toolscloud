// components/DynamoDBSchemaGenerator.jsx
"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo } from "react-icons/fa";

const DynamoDBSchemaGenerator = () => {
  const [tables, setTables] = useState([
    {
      name: "Users",
      partitionKey: { name: "userId", type: "S" },
      sortKey: { name: "", type: "S" },
      attributes: [
        { name: "userId", type: "S", isPartitionKey: true, isSortKey: false },
        { name: "email", type: "S", isPartitionKey: false, isSortKey: false },
        { name: "createdAt", type: "N", isPartitionKey: false, isSortKey: false },
      ],
      globalSecondaryIndexes: [],
      localSecondaryIndexes: [],
      billingMode: "PROVISIONED",
      throughput: { read: 5, write: 5 },
    },
  ]);
  const [schema, setSchema] = useState("");
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const DYNAMO_TYPES = ["S", "N", "B"]; // String, Number, Binary
  const MAX_TABLES = 20;
  const MAX_ATTRIBUTES = 30;
  const MAX_INDEXES = 20; // Applies to both GSI and LSI

  const validateInput = useCallback(() => {
    if (!tables.length) return "Add at least one table";
    if (tables.some((t) => !t.name.trim())) return "All tables need names";
    if (new Set(tables.map((t) => t.name)).size !== tables.length) return "Table names must be unique";
    if (tables.some((t) => !/^[A-Za-z0-9\-_]+$/.test(t.name)))
      return "Table names must contain only letters, numbers, hyphens, or underscores";

    for (const table of tables) {
      if (!table.partitionKey.name) return `Table "${table.name}" needs a partition key`;
      if (!table.attributes.some((a) => a.name === table.partitionKey.name))
        return `Partition key "${table.partitionKey.name}" not found in "${table.name}" attributes`;
      if (table.sortKey.name && !table.attributes.some((a) => a.name === table.sortKey.name))
        return `Sort key "${table.sortKey.name}" not found in "${table.name}" attributes`;
      if (table.attributes.some((a) => !a.name.trim())) return `All attributes in "${table.name}" need names`;
      if (new Set(table.attributes.map((a) => a.name)).size !== table.attributes.length)
        return `Attribute names in "${table.name}" must be unique`;
      if (table.billingMode === "PROVISIONED" && (!table.throughput.read || !table.throughput.write))
        return `Table "${table.name}" needs valid read/write capacity for PROVISIONED billing`;

      table.globalSecondaryIndexes.forEach((gsi, idx) => {
        if (!gsi.partitionKey.name) return `GSI #${idx + 1} in "${table.name}" needs a partition key`;
        if (!table.attributes.some((a) => a.name === gsi.partitionKey.name))
          return `GSI partition key "${gsi.partitionKey.name}" not found in "${table.name}" attributes`;
      });

      table.localSecondaryIndexes.forEach((lsi, idx) => {
        if (!table.sortKey.name) return `LSI in "${table.name}" requires a table sort key`;
        if (!lsi.sortKey.name) return `LSI #${idx + 1} in "${table.name}" needs a sort key`;
        if (!table.attributes.some((a) => a.name === lsi.sortKey.name))
          return `LSI sort key "${lsi.sortKey.name}" not found in "${table.name}" attributes`;
      });
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
      const schemaObject = tables.map((table) => ({
        TableName: table.name,
        KeySchema: [
          { AttributeName: table.partitionKey.name, KeyType: "HASH" },
          ...(table.sortKey.name ? [{ AttributeName: table.sortKey.name, KeyType: "RANGE" }] : []),
        ],
        AttributeDefinitions: table.attributes.map((attr) => ({
          AttributeName: attr.name,
          AttributeType: attr.type,
        })),
        BillingMode: table.billingMode,
        ...(table.billingMode === "PROVISIONED" && {
          ProvisionedThroughput: {
            ReadCapacityUnits: table.throughput.read,
            WriteCapacityUnits: table.throughput.write,
          },
        }),
        ...(table.globalSecondaryIndexes.length > 0 && {
          GlobalSecondaryIndexes: table.globalSecondaryIndexes.map((gsi) => ({
            IndexName: `${table.name}-${gsi.partitionKey.name}-gsi`,
            KeySchema: [
              { AttributeName: gsi.partitionKey.name, KeyType: "HASH" },
              ...(gsi.sortKey.name ? [{ AttributeName: gsi.sortKey.name, KeyType: "RANGE" }] : []),
            ],
            Projection: { ProjectionType: "ALL" },
            ...(table.billingMode === "PROVISIONED" && {
              ProvisionedThroughput: {
                ReadCapacityUnits: table.throughput.read,
                WriteCapacityUnits: table.throughput.write,
              },
            }),
          })),
        }),
        ...(table.localSecondaryIndexes.length > 0 && {
          LocalSecondaryIndexes: table.localSecondaryIndexes.map((lsi) => ({
            IndexName: `${table.name}-${lsi.sortKey.name}-lsi`,
            KeySchema: [
              { AttributeName: table.partitionKey.name, KeyType: "HASH" },
              { AttributeName: lsi.sortKey.name, KeyType: "RANGE" },
            ],
            Projection: { ProjectionType: "ALL" },
          })),
        }),
      }));

      const schemaString = JSON.stringify(schemaObject, null, 2);
      setSchema(schemaString);
      setHistory((prev) => [...prev, { tables: structuredClone(tables), schema: schemaString }].slice(-5));
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
          name: `Table${tables.length + 1}`,
          partitionKey: { name: "id", type: "S" },
          sortKey: { name: "", type: "S" },
          attributes: [{ name: "id", type: "S", isPartitionKey: true, isSortKey: false }],
          globalSecondaryIndexes: [],
          localSecondaryIndexes: [],
          billingMode: "PROVISIONED",
          throughput: { read: 5, write: 5 },
        },
      ]);
    }
  };

  const updateTable = (index, key, value) => {
    setTables(tables.map((t, i) => (i === index ? { ...t, [key]: value } : t)));
  };

  const removeTable = (index) => {
    if (tables.length > 1) setTables(tables.filter((_, i) => i !== index));
  };

  const addAttribute = (tableIndex) => {
    if (tables[tableIndex].attributes.length < MAX_ATTRIBUTES) {
      const newTables = [...tables];
      newTables[tableIndex].attributes.push({
        name: `attr${newTables[tableIndex].attributes.length + 1}`,
        type: "S",
        isPartitionKey: false,
        isSortKey: false,
      });
      setTables(newTables);
    }
  };

  const updateAttribute = (tableIndex, attrIndex, key, value) => {
    const newTables = [...tables];
    newTables[tableIndex].attributes[attrIndex][key] = value;
    if (key === "name" && newTables[tableIndex].attributes[attrIndex].isPartitionKey) {
      newTables[tableIndex].partitionKey.name = value;
    }
    if (key === "name" && newTables[tableIndex].attributes[attrIndex].isSortKey) {
      newTables[tableIndex].sortKey.name = value;
    }
    setTables(newTables);
  };

  const removeAttribute = (tableIndex, attrIndex) => {
    if (tables[tableIndex].attributes.length > 1) {
      const newTables = [...tables];
      newTables[tableIndex].attributes = newTables[tableIndex].attributes.filter((_, i) => i !== attrIndex);
      setTables(newTables);
    }
  };

  const addGSI = (tableIndex) => {
    if (tables[tableIndex].globalSecondaryIndexes.length < MAX_INDEXES) {
      const newTables = [...tables];
      newTables[tableIndex].globalSecondaryIndexes.push({
        partitionKey: { name: "", type: "S" },
        sortKey: { name: "", type: "S" },
      });
      setTables(newTables);
    }
  };

  const updateGSI = (tableIndex, gsiIndex, key, value) => {
    const newTables = [...tables];
    newTables[tableIndex].globalSecondaryIndexes[gsiIndex][key] = value;
    setTables(newTables);
  };

  const removeGSI = (tableIndex, gsiIndex) => {
    const newTables = [...tables];
    newTables[tableIndex].globalSecondaryIndexes = newTables[tableIndex].globalSecondaryIndexes.filter(
      (_, i) => i !== gsiIndex
    );
    setTables(newTables);
  };

  const addLSI = (tableIndex) => {
    if (tables[tableIndex].localSecondaryIndexes.length < MAX_INDEXES) {
      const newTables = [...tables];
      newTables[tableIndex].localSecondaryIndexes.push({
        sortKey: { name: "", type: "S" },
      });
      setTables(newTables);
    }
  };

  const updateLSI = (tableIndex, lsiIndex, key, value) => {
    const newTables = [...tables];
    newTables[tableIndex].localSecondaryIndexes[lsiIndex][key] = value;
    setTables(newTables);
  };

  const removeLSI = (tableIndex, lsiIndex) => {
    const newTables = [...tables];
    newTables[tableIndex].localSecondaryIndexes = newTables[tableIndex].localSecondaryIndexes.filter(
      (_, i) => i !== lsiIndex
    );
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
    const blob = new Blob([schema], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dynamodb-schema-${Date.now()}.json`;
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
          Advanced DynamoDB Schema Generator
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {tables.map((table, tableIndex) => (
            <div key={tableIndex} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                <input
                  type="text"
                  value={table.name}
                  onChange={(e) => updateTable(tableIndex, "name", e.target.value)}
                  placeholder="Table name"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => removeTable(tableIndex)}
                  disabled={tables.length <= 1}
                  className="w-full sm:w-auto px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
                >
                  <FaTrash className="mr-2" /> Delete Table
                </button>
              </div>

              {/* Billing Mode & Throughput */}
              <div className="mb-4 p-3 bg-white rounded-md border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Billing & Throughput</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    value={table.billingMode}
                    onChange={(e) => updateTable(tableIndex, "billingMode", e.target.value)}
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PROVISIONED">Provisioned</option>
                    <option value="PAY_PER_REQUEST">Pay Per Request</option>
                  </select>
                  {table.billingMode === "PROVISIONED" && (
                    <>
                      <input
                        type="number"
                        value={table.throughput.read}
                        onChange={(e) =>
                          updateTable(tableIndex, "throughput", {
                            ...table.throughput,
                            read: Math.max(1, Number(e.target.value)),
                          })
                        }
                        placeholder="Read Capacity"
                        className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        value={table.throughput.write}
                        onChange={(e) =>
                          updateTable(tableIndex, "throughput", {
                            ...table.throughput,
                            write: Math.max(1, Number(e.target.value)),
                          })
                        }
                        placeholder="Write Capacity"
                        className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Key Schema */}
              <div className="mb-4 p-3 bg-white rounded-md border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Key Schema</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={table.partitionKey.name}
                    onChange={(e) =>
                      updateTable(tableIndex, "partitionKey", { ...table.partitionKey, name: e.target.value })
                    }
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Partition Key</option>
                    {table.attributes.map((attr) => (
                      <option key={attr.name} value={attr.name}>
                        {attr.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={table.sortKey.name}
                    onChange={(e) =>
                      updateTable(tableIndex, "sortKey", { ...table.sortKey, name: e.target.value })
                    }
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Sort Key (optional)</option>
                    {table.attributes.map((attr) => (
                      <option key={attr.name} value={attr.name}>
                        {attr.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Attributes */}
              <div className="space-y-3 mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Attributes</h3>
                {table.attributes.map((attr, attrIndex) => (
                  <div
                    key={attrIndex}
                    className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-white rounded-md border border-gray-200"
                  >
                    <input
                      type="text"
                      value={attr.name}
                      onChange={(e) => updateAttribute(tableIndex, attrIndex, "name", e.target.value)}
                      placeholder="Attribute name"
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={attr.type}
                      onChange={(e) => updateAttribute(tableIndex, attrIndex, "type", e.target.value)}
                      className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      {DYNAMO_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeAttribute(tableIndex, attrIndex)}
                      disabled={table.attributes.length <= 1}
                      className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addAttribute(tableIndex)}
                  disabled={table.attributes.length >= MAX_ATTRIBUTES}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                >
                  + Add Attribute {table.attributes.length >= MAX_ATTRIBUTES && `(Max ${MAX_ATTRIBUTES})`}
                </button>
              </div>

              {/* Global Secondary Indexes */}
              <div className="space-y-3 mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Global Secondary Indexes</h3>
                {table.globalSecondaryIndexes.map((gsi, gsiIndex) => (
                  <div
                    key={gsiIndex}
                    className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-white rounded-md border border-gray-200"
                  >
                    <select
                      value={gsi.partitionKey.name}
                      onChange={(e) =>
                        updateGSI(tableIndex, gsiIndex, "partitionKey", {
                          ...gsi.partitionKey,
                          name: e.target.value,
                        })
                      }
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Partition Key</option>
                      {table.attributes.map((attr) => (
                        <option key={attr.name} value={attr.name}>
                          {attr.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={gsi.sortKey.name}
                      onChange={(e) =>
                        updateGSI(tableIndex, gsiIndex, "sortKey", { ...gsi.sortKey, name: e.target.value })
                      }
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sort Key (optional)</option>
                      {table.attributes.map((attr) => (
                        <option key={attr.name} value={attr.name}>
                          {attr.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeGSI(tableIndex, gsiIndex)}
                      className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addGSI(tableIndex)}
                  disabled={table.globalSecondaryIndexes.length >= MAX_INDEXES}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                >
                  + Add GSI {table.globalSecondaryIndexes.length >= MAX_INDEXES && `(Max ${MAX_INDEXES})`}
                </button>
              </div>

              {/* Local Secondary Indexes */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Local Secondary Indexes</h3>
                {table.localSecondaryIndexes.map((lsi, lsiIndex) => (
                  <div
                    key={lsiIndex}
                    className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-white rounded-md border border-gray-200"
                  >
                    <input
                      type="text"
                      value={table.partitionKey.name}
                      disabled
                      className="flex-1 p-2 border border-gray-300 rounded-md bg-gray-100"
                      title="LSI uses table's partition key"
                    />
                    <select
                      value={lsi.sortKey.name}
                      onChange={(e) =>
                        updateLSI(tableIndex, lsiIndex, "sortKey", { ...lsi.sortKey, name: e.target.value })
                      }
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sort Key</option>
                      {table.attributes.map((attr) => (
                        <option key={attr.name} value={attr.name}>
                          {attr.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeLSI(tableIndex, lsiIndex)}
                      className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addLSI(tableIndex)}
                  disabled={table.localSecondaryIndexes.length >= MAX_INDEXES || !table.sortKey.name}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                >
                  + Add LSI{" "}
                  {table.localSecondaryIndexes.length >= MAX_INDEXES
                    ? `(Max ${MAX_INDEXES})`
                    : !table.sortKey.name
                    ? "(Requires Sort Key)"
                    : ""}
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
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-6">
          <button
            onClick={generateSchema}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
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
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" />
                Download (.json)
              </button>
              <button
                onClick={() => setSchema("")}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaTrash className="mr-2" />
                Clear Schema
              </button>
            </>
          )}
        </div>

        {/* Generated Schema */}
        {schema && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Generated Schema (JSON):</h2>
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
                  <span>{entry.tables.length} table(s) - {entry.schema.slice(0, 20)}...</span>
                  <button
                    onClick={() => restoreFromHistory(entry)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Create tables with custom attributes (S, N, B types)</li>
            <li>Define partition and sort keys</li>
            <li>Add Global and Local Secondary Indexes</li>
            <li>Configure billing mode and throughput</li>
            <li>Copy, download, and restore schema history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DynamoDBSchemaGenerator;