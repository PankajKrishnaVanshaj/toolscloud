"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaCopy, FaSync, FaPlus, FaTrash } from "react-icons/fa";

const SQLDataGenerator = () => {
  const [sqlData, setSqlData] = useState("");
  const [count, setCount] = useState(5);
  const [tableName, setTableName] = useState("users");
  const [fields, setFields] = useState([
    { name: "id", type: "serial", nullable: false, options: {} },
    { name: "username", type: "varchar", nullable: false, options: { length: 50, prefix: "user" } },
    { name: "email", type: "varchar", nullable: true, options: { length: 100, domain: "example.com" } },
  ]);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [includeCreateTable, setIncludeCreateTable] = useState(false);

  const MAX_ITEMS = 1000;
  const SQL_TYPES = [
    "serial", "integer", "bigint", "decimal", "varchar", "text",
    "boolean", "date", "timestamp", "uuid", "json"
  ];

  // Enhanced random data generation
  const generateRandomData = useCallback((type, options) => {
    const timestamp = Date.now();
    switch (type) {
      case "serial":
      case "integer":
      case "bigint":
        const min = options.min || 1;
        const max = options.max || 10000;
        return Math.floor(Math.random() * (max - min + 1)) + min;
      case "decimal":
        const decimals = options.decimals || 2;
        return (Math.random() * (options.max || 1000)).toFixed(decimals);
      case "varchar":
        if (options.prefix) {
          return `'${options.prefix}${Math.floor(Math.random() * 1000)}'`;
        }
        if (options.domain) {
          const names = ["john", "emma", "mike", "sophie", "alex"];
          const name = names[Math.floor(Math.random() * names.length)];
          return `'${name}@${options.domain}'`;
        }
        const words = ["apple", "banana", "cherry", "date", "elder"];
        return `'${words[Math.floor(Math.random() * words.length)]}'`;
      case "text":
        return `'Lorem ipsum ${Math.random().toString(36).substring(2, 10)}'`;
      case "boolean":
        return Math.random() > 0.5 ? "TRUE" : "FALSE";
      case "date":
        const date = new Date(timestamp - Math.random() * 31536000000);
        return `'${date.toISOString().split("T")[0]}'`;
      case "timestamp":
        return `'${new Date(timestamp - Math.random() * 31536000000).toISOString()}'`;
      case "uuid":
        return `'${crypto.randomUUID()}'`;
      case "json":
        return `'{"key": "value${Math.floor(Math.random() * 100)}"}'`;
      default:
        return "NULL";
    }
  }, []);

  const validateFields = useCallback(() => {
    if (fields.length === 0) return "Please add at least one field";
    if (!tableName.trim()) return "Table name cannot be empty";
    if (fields.some((field) => !field.name.trim())) return "All field names must be filled";
    if (new Set(fields.map((f) => f.name)).size !== fields.length) return "Field names must be unique";
    return "";
  }, [fields, tableName]);

  const generateSQL = useCallback(() => {
    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      setSqlData("");
      return;
    }

    setError("");
    const items = Array.from({ length: Math.min(count, MAX_ITEMS) }, () => {
      return fields.map((field) =>
        field.nullable && Math.random() < 0.1 ? "NULL" : generateRandomData(field.type, field.options)
      );
    });

    const columnNames = fields.map((f) => f.name).join(", ");
    let sql = "";

    if (includeCreateTable) {
      const createTable = `CREATE TABLE ${tableName} (\n  ${fields
        .map((f) => {
          let def = `${f.name} ${f.type.toUpperCase()}`;
          if (f.type === "varchar") def += `(${f.options.length || 50})`;
          if (!f.nullable) def += " NOT NULL";
          return def;
        })
        .join(",\n  ")}\n);\n\n`;
      sql += createTable;
    }

    const inserts = items
      .map((row) => `INSERT INTO ${tableName} (${columnNames}) VALUES (${row.join(", ")});`)
      .join("\n");
    sql += inserts;

    setSqlData(sql);
    setIsCopied(false);
  }, [count, fields, tableName, includeCreateTable, generateRandomData, validateFields]);

  const addField = () => {
    if (fields.length < 15) {
      setFields([
        ...fields,
        { name: `field${fields.length + 1}`, type: "varchar", nullable: true, options: { length: 50 } },
      ]);
    }
  };

  const updateField = (index, key, value) => {
    setFields(fields.map((field, i) => (i === index ? { ...field, [key]: value } : field)));
  };

  const updateFieldOptions = (index, optionKey, value) => {
    setFields(
      fields.map((field, i) =>
        i === index ? { ...field, options: { ...field.options, [optionKey]: value } } : field
      )
    );
  };

  const removeField = (index) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlData);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard: " + err.message);
    }
  };

  const downloadAsSQL = () => {
    try {
      const blob = new Blob([sqlData], { type: "text/sql;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${tableName}-${Date.now()}.sql`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download: " + err.message);
    }
  };

  const clearData = () => {
    setSqlData("");
    setIsCopied(false);
    setError("");
    setCount(5);
    setTableName("users");
    setFields([
      { name: "id", type: "serial", nullable: false, options: {} },
      { name: "username", type: "varchar", nullable: false, options: { length: 50, prefix: "user" } },
      { name: "email", type: "varchar", nullable: true, options: { length: 100, domain: "example.com" } },
    ]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">SQL Data Generator</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Rows (1-{MAX_ITEMS})
              </label>
              <input
                type="number"
                min="1"
                max={MAX_ITEMS}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(MAX_ITEMS, Number(e.target.value) || 1)))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Table Name</label>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value.trim() || "users")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., users"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Columns ({fields.length}/15)
            </label>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {fields.map((field, index) => (
                <div key={index} className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(index, "name", e.target.value)}
                    placeholder="Column Name"
                    className="flex-1 min-w-[120px] p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, "type", e.target.value)}
                    className="flex-1 min-w-[120px] p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {SQL_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={field.nullable}
                      onChange={(e) => updateField(index, "nullable", e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">NULL</span>
                  </label>
                  {["integer", "bigint"].includes(field.type) && (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={field.options.min || ""}
                        onChange={(e) => updateFieldOptions(index, "min", Number(e.target.value))}
                        className="w-20 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={field.options.max || ""}
                        onChange={(e) => updateFieldOptions(index, "max", Number(e.target.value))}
                        className="w-20 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                  {field.type === "decimal" && (
                    <input
                      type="number"
                      placeholder="Decimals"
                      value={field.options.decimals || ""}
                      onChange={(e) => updateFieldOptions(index, "decimals", Number(e.target.value))}
                      className="w-20 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                  {field.type === "varchar" && (
                    <>
                      <input
                        type="number"
                        placeholder="Length"
                        value={field.options.length || 50}
                        onChange={(e) => updateFieldOptions(index, "length", Number(e.target.value))}
                        className="w-20 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Prefix or Domain"
                        value={field.options.prefix || field.options.domain || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateFieldOptions(index, value.includes("@") ? "domain" : "prefix", value);
                          if (value.includes("@")) updateFieldOptions(index, "prefix", undefined);
                          else updateFieldOptions(index, "domain", undefined);
                        }}
                        className="w-32 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </>
                  )}
                  <button
                    onClick={() => removeField(index)}
                    disabled={fields.length <= 1}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addField}
              disabled={fields.length >= 15}
              className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              <FaPlus /> Add Column {fields.length >= 15 && "(Max 15)"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeCreateTable}
              onChange={(e) => setIncludeCreateTable(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <label className="text-sm text-gray-700">Include CREATE TABLE statement</label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={generateSQL}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Generate SQL
          </button>
          {sqlData && (
            <>
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                  isCopied
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-600 text-white hover:bg-gray-700"
                }`}
              >
                <FaCopy className="mr-2" /> {isCopied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={downloadAsSQL}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
              <button
                onClick={clearData}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </>
          )}
        </div>

        {/* Generated SQL */}
        {sqlData && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated SQL ({count} rows):
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{sqlData}</pre>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports multiple SQL data types including JSON</li>
            <li>Customizable field options (min/max, length, prefix/domain)</li>
            <li>Generate up to {MAX_ITEMS} rows</li>
            <li>Optional CREATE TABLE statement</li>
            <li>Copy to clipboard and download as .sql file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SQLDataGenerator;