"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaCopy, FaSync } from "react-icons/fa";

const JsonToSql = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [tableName, setTableName] = useState("my_table");
  const [sqlOutput, setSqlOutput] = useState("");
  const [error, setError] = useState("");
  const [options, setOptions] = useState({
    includeCreateTable: true,
    inferTypes: true,
    wrapValues: true,
    batchSize: 100,
    includePrimaryKey: false,
    primaryKeyName: "id",
    useTransactions: false,
    customTypes: {},
  });

  // Enhanced type inference
  const inferSqlType = useCallback((value) => {
    if (value === null || value === undefined) return "VARCHAR(255) NULL";
    if (typeof value === "number") {
      return Number.isInteger(value) ? "INTEGER" : "FLOAT";
    } else if (typeof value === "boolean") {
      return "BOOLEAN";
    } else if (typeof value === "string") {
      if (value.match(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/)) return "DATETIME";
      if (value.length > 255) return `TEXT`;
      return `VARCHAR(${Math.min(255, Math.ceil(value.length / 50) * 50)})`;
    }
    return "TEXT";
  }, []);

  // Flatten nested objects
  const flattenObject = (obj, parent = "", result = {}) => {
    for (const [key, value] of Object.entries(obj)) {
      const newKey = parent ? `${parent}_${key}` : key;
      if (value && typeof value === "object" && !Array.isArray(value)) {
        flattenObject(value, newKey, result);
      } else {
        result[newKey] = value;
      }
    }
    return result;
  };

  // Generate SQL
  const generateSql = useCallback(() => {
    setError("");
    setSqlOutput("");

    let parsedData;
    try {
      parsedData = JSON.parse(jsonInput);
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
      return;
    }

    if (!Array.isArray(parsedData) && typeof parsedData === "object") {
      parsedData = [parsedData];
    }

    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      setError("JSON must be an array of objects or a single object");
      return;
    }

    const flattenedData = parsedData.map((item) => flattenObject(item));
    const schema = Object.keys(flattenedData[0]).reduce((acc, key) => {
      acc[key] =
        options.customTypes[key] ||
        (options.inferTypes ? inferSqlType(flattenedData[0][key]) : "VARCHAR(255)");
      return acc;
    }, {});

    let sql = "";

    // CREATE TABLE
    if (options.includeCreateTable) {
      sql += `CREATE TABLE ${tableName} (\n`;
      if (options.includePrimaryKey) {
        sql += `  ${options.primaryKeyName} SERIAL PRIMARY KEY,\n`;
      }
      sql += Object.entries(schema)
        .map(([key, type]) => `  ${key} ${type}`)
        .join(",\n");
      sql += "\n);\n\n";
    }

    // INSERT statements
    const columns = [
      ...(options.includePrimaryKey ? [options.primaryKeyName] : []),
      ...Object.keys(schema),
    ];
    const insertHeader = `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES\n`;
    const batches = [];
    for (let i = 0; i < flattenedData.length; i += options.batchSize) {
      batches.push(flattenedData.slice(i, i + options.batchSize));
    }

    if (options.useTransactions) sql += "BEGIN TRANSACTION;\n\n";

    batches.forEach((batch, batchIndex) => {
      if (batchIndex > 0) sql += "\n";
      sql += insertHeader;
      sql += batch
        .map((row, idx) => {
          const values = [
            ...(options.includePrimaryKey ? [idx + 1 + batchIndex * options.batchSize] : []),
            ...Object.values(row),
          ].map((value) => {
            if (value === null || value === undefined) return "NULL";
            if (options.wrapValues && typeof value === "string") {
              return `'${value.replace(/'/g, "''")}'`;
            }
            return value;
          });
          return `  (${values.join(", ")})`;
        })
        .join(",\n");
      sql += ";";
    });

    if (options.useTransactions) sql += "\n\nCOMMIT;";

    setSqlOutput(sql);
  }, [jsonInput, tableName, options]);

  // Option handlers
  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlOutput);
  };

  const downloadSql = () => {
    const blob = new Blob([sqlOutput], { type: "text/sql" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${tableName}.sql`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setJsonInput("");
    setTableName("my_table");
    setSqlOutput("");
    setError("");
    setOptions({
      includeCreateTable: true,
      inferTypes: true,
      wrapValues: true,
      batchSize: 100,
      includePrimaryKey: false,
      primaryKeyName: "id",
      useTransactions: false,
      customTypes: {},
    });
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          JSON to SQL Converter
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                JSON Input
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='[{"id": 1, "name": "John"}, {"id": 2, "name": "Jane"}]'
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 font-mono text-sm resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Table Name
              </label>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Options */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">Options</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.includeCreateTable}
                    onChange={(e) => handleOptionChange("includeCreateTable", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Include CREATE TABLE
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.inferTypes}
                    onChange={(e) => handleOptionChange("inferTypes", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Infer Data Types
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.wrapValues}
                    onChange={(e) => handleOptionChange("wrapValues", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Wrap String Values
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.includePrimaryKey}
                    onChange={(e) => handleOptionChange("includePrimaryKey", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Include Primary Key
                </label>
                {options.includePrimaryKey && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">PK Name:</label>
                    <input
                      type="text"
                      value={options.primaryKeyName}
                      onChange={(e) => handleOptionChange("primaryKeyName", e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.useTransactions}
                    onChange={(e) => handleOptionChange("useTransactions", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Use Transactions
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Batch Size:</label>
                  <input
                    type="number"
                    value={options.batchSize}
                    onChange={(e) =>
                      handleOptionChange("batchSize", Math.max(1, parseInt(e.target.value) || 100))
                    }
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={generateSql}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Convert to SQL
              </button>
              <button
                onClick={reset}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            {sqlOutput && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-2">
                  <h2 className="text-lg font-semibold text-gray-800">SQL Output:</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-1 bg-gray-200 rounded-md hover:bg-gray-300 flex items-center text-sm"
                    >
                      <FaCopy className="mr-2" /> Copy
                    </button>
                    <button
                      onClick={downloadSql}
                      className="px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-sm"
                    >
                      <FaDownload className="mr-2" /> Download
                    </button>
                  </div>
                </div>
                <pre className="text-sm font-mono overflow-auto max-h-96 bg-white p-3 rounded-md border">
                  {sqlOutput}
                </pre>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 rounded-lg text-red-700">
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Converts JSON to SQL with CREATE TABLE and INSERT statements</li>
            <li>Flattens nested objects</li>
            <li>Optional primary key with custom name</li>
            <li>Advanced type inference with dynamic VARCHAR lengths</li>
            <li>Supports transactions for batch inserts</li>
            <li>Download SQL file or copy to clipboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JsonToSql;