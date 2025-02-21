"use client";
import React, { useState, useEffect } from "react";

const SQLQueryBuilder = () => {
  const [query, setQuery] = useState({
    select: ["*"],
    from: "",
    where: [],
    orderBy: "",
    conjunction: "AND",
  });
  const [columnInput, setColumnInput] = useState("");
  const [whereCondition, setWhereCondition] = useState({
    field: "",
    operator: "",
    value: "",
  });
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [error, setError] = useState("");
  const [generatedQuery, setGeneratedQuery] = useState("");

  // Validate query
  const validateQuery = () => {
    if (!query.from.trim()) return "Table name (FROM) is required";
    if (query.select.length === 0)
      return "At least one SELECT column is required";
    return "";
  };

  // Generate SQL query
  const generateSQL = () => {
    const validationError = validateQuery();
    setError(validationError);
    if (validationError) return "Enter details to generate query";

    let sql = `SELECT ${query.select.join(", ")}\n`;
    sql += `FROM ${query.from}`;

    if (query.where.length > 0) {
      sql +=
        "\nWHERE " +
        query.where
          .map((cond) => `${cond.field} ${cond.operator} '${cond.value}'`)
          .join(` ${query.conjunction} `);
    }

    if (query.orderBy) {
      sql += `\nORDER BY ${query.orderBy}`;
    }

    return sql + ";";
  };

  // Update generated query when query state changes
  useEffect(() => {
    setGeneratedQuery(generateSQL());
  }, [query]);

  // Add column to SELECT
  const addColumn = () => {
    if (!columnInput.trim()) return;
    if (!query.select.includes(columnInput)) {
      setQuery((prev) => ({
        ...prev,
        select: [...prev.select.filter((col) => col !== "*"), columnInput],
      }));
      setColumnInput("");
    }
  };

  // Add WHERE condition
  const addWhereCondition = () => {
    if (
      !whereCondition.field ||
      !whereCondition.operator ||
      !whereCondition.value
    ) {
      setError("All WHERE fields are required");
      return;
    }
    setQuery((prev) => ({
      ...prev,
      where: [...prev.where, { ...whereCondition }],
    }));
    setWhereCondition({ field: "", operator: "", value: "" });
    setError("");
  };

  // Handle copy
  const handleCopy = () => {
    if (!validateQuery()) {
      navigator.clipboard.writeText(generatedQuery);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    }
  };

  // Clear form
  const clearForm = () => {
    setQuery({
      select: ["*"],
      from: "",
      where: [],
      orderBy: "",
      conjunction: "AND",
    });
    setColumnInput("");
    setWhereCondition({ field: "", operator: "", value: "" });
    setError("");
  };

  return (
    <div className="mx-auto p-4 bg-white shadow-lg rounded-2xl flex items-center justify-center">
      <div className="relative  p-6 rounded-lg w-full">
        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            Query copied to clipboard!
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            SQL Query Builder
          </h1>
          <button
            onClick={clearForm}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Clear All
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* SELECT Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SELECT Columns
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={columnInput}
              onChange={(e) => setColumnInput(e.target.value)}
              placeholder="Enter column name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Column name input"
            />
            <button
              onClick={addColumn}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              disabled={!columnInput.trim()}
            >
              Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {query.select.map((col, index) => (
              <span
                key={index}
                className="bg-gray-200 px-2 py-1 rounded-full text-sm flex items-center"
              >
                {col}
                <button
                  onClick={() =>
                    setQuery((prev) => ({
                      ...prev,
                      select: prev.select.filter((c) => c !== col) || ["*"],
                    }))
                  }
                  className="ml-2 text-red-500 hover:text-red-700"
                  aria-label={`Remove ${col}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* FROM Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            FROM Table
          </label>
          <input
            type="text"
            value={query.from}
            onChange={(e) =>
              setQuery((prev) => ({ ...prev, from: e.target.value }))
            }
            placeholder="Enter table name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Table name input"
          />
        </div>

        {/* WHERE Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              WHERE Conditions
            </label>
            <select
              value={query.conjunction}
              onChange={(e) =>
                setQuery((prev) => ({ ...prev, conjunction: e.target.value }))
              }
              className="px-2 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="AND">AND</option>
              <option value="OR">OR</option>
            </select>
          </div>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={whereCondition.field}
              onChange={(e) =>
                setWhereCondition((prev) => ({
                  ...prev,
                  field: e.target.value,
                }))
              }
              placeholder="Field"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Where field"
            />
            <select
              value={whereCondition.operator}
              onChange={(e) =>
                setWhereCondition((prev) => ({
                  ...prev,
                  operator: e.target.value,
                }))
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Where operator"
            >
              <option value="">Operator</option>
              <option value="=">=</option>
              <option value=">">&gt;</option>
              <option value="<">&lt;</option>
              <option value=">=">&gt;=</option>
              <option value="<=">&lt;=</option>
              <option value="!=">!=</option>
            </select>
            <input
              type="text"
              value={whereCondition.value}
              onChange={(e) =>
                setWhereCondition((prev) => ({
                  ...prev,
                  value: e.target.value,
                }))
              }
              placeholder="Value"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Where value"
            />
            <button
              onClick={addWhereCondition}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="mt-2">
            {query.where.map((cond, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-2 mb-1 bg-gray-50 p-2 rounded"
              >
                <span className="text-sm">{`${cond.field} ${cond.operator} '${cond.value}'`}</span>
                <button
                  onClick={() =>
                    setQuery((prev) => ({
                      ...prev,
                      where: prev.where.filter((_, i) => i !== index),
                    }))
                  }
                  className="text-red-500 hover:text-red-700"
                  aria-label={`Remove condition ${index + 1}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ORDER BY Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ORDER BY
          </label>
          <input
            type="text"
            value={query.orderBy}
            onChange={(e) =>
              setQuery((prev) => ({ ...prev, orderBy: e.target.value }))
            }
            placeholder="Enter column name (e.g., id ASC)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Order by input"
          />
        </div>

        {/* Generated Query */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Generated Query
          </label>
          <pre className="bg-gray-50 p-4 rounded-md border border-gray-300 text-sm whitespace-pre-wrap font-mono">
            {generatedQuery}
          </pre>
          <button
            onClick={handleCopy}
            className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            disabled={!!validateQuery()}
          >
            Copy Query
          </button>
        </div>
      </div>
    </div>
  );
};

export default SQLQueryBuilder;
