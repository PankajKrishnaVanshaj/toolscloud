"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaPlus, FaHistory, FaUndo } from "react-icons/fa";

const SQLQueryBuilder = () => {
  const [query, setQuery] = useState({
    select: ["*"],
    from: "",
    joins: [],
    where: [],
    groupBy: [],
    having: [],
    orderBy: "",
    limit: "",
    conjunction: "AND",
  });
  const [columnInput, setColumnInput] = useState("");
  const [whereCondition, setWhereCondition] = useState({ field: "", operator: "", value: "" });
  const [joinCondition, setJoinCondition] = useState({ type: "INNER", table: "", on: "" });
  const [groupByInput, setGroupByInput] = useState("");
  const [havingCondition, setHavingCondition] = useState({ field: "", operator: "", value: "" });
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [error, setError] = useState("");
  const [generatedQuery, setGeneratedQuery] = useState("");
  const [history, setHistory] = useState([]);
  const [isCopied, setIsCopied] = useState(false);

  const OPERATORS = ["=", ">", "<", ">=", "<=", "!=", "LIKE", "IN", "IS NULL", "IS NOT NULL"];

  // Validate query
  const validateQuery = useCallback(() => {
    if (!query.from.trim()) return "Table name (FROM) is required";
    if (query.select.length === 0) return "At least one SELECT column is required";
    if (query.joins.some((j) => !j.table || !j.on)) return "All JOINs must have a table and ON condition";
    if (query.having.length > 0 && query.groupBy.length === 0) return "HAVING requires GROUP BY";
    return "";
  }, [query]);

  // Generate SQL query
  const generateSQL = useCallback(() => {
    const validationError = validateQuery();
    setError(validationError);
    if (validationError) return "Enter details to generate query";

    let sql = `SELECT ${query.select.join(", ")}\n`;
    sql += `FROM ${query.from}`;

    if (query.joins.length > 0) {
      sql += "\n" + query.joins.map((j) => `${j.type} JOIN ${j.table} ON ${j.on}`).join("\n");
    }

    if (query.where.length > 0) {
      sql += "\nWHERE " + query.where.map((cond) => {
        const value = ["IS NULL", "IS NOT NULL"].includes(cond.operator) ? "" : `'${cond.value}'`;
        return `${cond.field} ${cond.operator} ${value}`.trim();
      }).join(` ${query.conjunction} `);
    }

    if (query.groupBy.length > 0) {
      sql += `\nGROUP BY ${query.groupBy.join(", ")}`;
    }

    if (query.having.length > 0) {
      sql += "\nHAVING " + query.having.map((cond) => {
        const value = ["IS NULL", "IS NOT NULL"].includes(cond.operator) ? "" : `'${cond.value}'`;
        return `${cond.field} ${cond.operator} ${value}`.trim();
      }).join(` ${query.conjunction} `);
    }

    if (query.orderBy) {
      sql += `\nORDER BY ${query.orderBy}`;
    }

    if (query.limit) {
      sql += `\nLIMIT ${query.limit}`;
    }

    return sql + ";";
  }, [query]);

  // Update generated query when query state changes
  useEffect(() => {
    setGeneratedQuery(generateSQL());
  }, [query, generateSQL]);

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

  // Add JOIN
  const addJoin = () => {
    if (!joinCondition.table || !joinCondition.on) {
      setError("JOIN requires a table and ON condition");
      return;
    }
    setQuery((prev) => ({ ...prev, joins: [...prev.joins, { ...joinCondition }] }));
    setJoinCondition({ type: "INNER", table: "", on: "" });
    setError("");
  };

  // Add WHERE condition
  const addWhereCondition = () => {
    if (!whereCondition.field || !whereCondition.operator || (!whereCondition.value && !["IS NULL", "IS NOT NULL"].includes(whereCondition.operator))) {
      setError("All WHERE fields are required (except value for IS NULL/IS NOT NULL)");
      return;
    }
    setQuery((prev) => ({ ...prev, where: [...prev.where, { ...whereCondition }] }));
    setWhereCondition({ field: "", operator: "", value: "" });
    setError("");
  };

  // Add GROUP BY column
  const addGroupBy = () => {
    if (!groupByInput.trim()) return;
    if (!query.groupBy.includes(groupByInput)) {
      setQuery((prev) => ({ ...prev, groupBy: [...prev.groupBy, groupByInput] }));
      setGroupByInput("");
    }
  };

  // Add HAVING condition
  const addHavingCondition = () => {
    if (!havingCondition.field || !havingCondition.operator || (!havingCondition.value && !["IS NULL", "IS NOT NULL"].includes(havingCondition.operator))) {
      setError("All HAVING fields are required (except value for IS NULL/IS NOT NULL)");
      return;
    }
    setQuery((prev) => ({ ...prev, having: [...prev.having, { ...havingCondition }] }));
    setHavingCondition({ field: "", operator: "", value: "" });
    setError("");
  };

  // Handle copy
  const handleCopy = () => {
    if (!validateQuery()) {
      navigator.clipboard.writeText(generatedQuery);
      setIsCopied(true);
      setShowCopyAlert(true);
      setTimeout(() => {
        setShowCopyAlert(false);
        setIsCopied(false);
      }, 2000);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (!validateQuery()) {
      const blob = new Blob([generatedQuery], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `query-${Date.now()}.sql`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Clear form
  const clearForm = () => {
    setQuery({
      select: ["*"],
      from: "",
      joins: [],
      where: [],
      groupBy: [],
      having: [],
      orderBy: "",
      limit: "",
      conjunction: "AND",
    });
    setColumnInput("");
    setJoinCondition({ type: "INNER", table: "", on: "" });
    setWhereCondition({ field: "", operator: "", value: "" });
    setGroupByInput("");
    setHavingCondition({ field: "", operator: "", value: "" });
    setError("");
  };

  // Save to history
  const saveToHistory = () => {
    if (!validateQuery()) {
      setHistory((prev) => [...prev, { query: { ...query }, generated: generatedQuery }].slice(-5));
    }
  };

  // Restore from history
  const restoreFromHistory = (entry) => {
    setQuery(entry.query);
    setGeneratedQuery(entry.generated);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="relative bg-white shadow-xl rounded-2xl p-6 sm:p-8 w-full">
        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            Query copied to clipboard!
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">SQL Query Builder</h1>
          <button onClick={clearForm} className="text-sm text-red-600 hover:text-red-800 flex items-center">
            <FaTrash className="mr-1" /> Clear All
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* SELECT Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">SELECT Columns</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={columnInput}
              onChange={(e) => setColumnInput(e.target.value)}
              placeholder="Enter column name (e.g., id, name)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <span key={index} className="bg-gray-200 px-2 py-1 rounded-full text-sm flex items-center">
                {col}
                <button
                  onClick={() => setQuery((prev) => ({ ...prev, select: prev.select.filter((c) => c !== col) || ["*"] }))}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* FROM Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">FROM Table</label>
          <input
            type="text"
            value={query.from}
            onChange={(e) => setQuery((prev) => ({ ...prev, from: e.target.value }))}
            placeholder="Enter table name (e.g., users)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* JOIN Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">JOIN Clauses</label>
          <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <select
              value={joinCondition.type}
              onChange={(e) => setJoinCondition((prev) => ({ ...prev, type: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="INNER">INNER JOIN</option>
              <option value="LEFT">LEFT JOIN</option>
              <option value="RIGHT">RIGHT JOIN</option>
              <option value="FULL">FULL JOIN</option>
            </select>
            <input
              type="text"
              value={joinCondition.table}
              onChange={(e) => setJoinCondition((prev) => ({ ...prev, table: e.target.value }))}
              placeholder="Table (e.g., orders)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={joinCondition.on}
              onChange={(e) => setJoinCondition((prev) => ({ ...prev, on: e.target.value }))}
              placeholder="ON condition (e.g., users.id = orders.user_id)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addJoin}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="mt-2">
            {query.joins.map((join, index) => (
              <div key={index} className="flex items-center justify-between gap-2 mb-1 bg-gray-50 p-2 rounded">
                <span className="text-sm">{`${join.type} JOIN ${join.table} ON ${join.on}`}</span>
                <button
                  onClick={() => setQuery((prev) => ({ ...prev, joins: prev.joins.filter((_, i) => i !== index) }))}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* WHERE Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">WHERE Conditions</label>
            <select
              value={query.conjunction}
              onChange={(e) => setQuery((prev) => ({ ...prev, conjunction: e.target.value }))}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="AND">AND</option>
              <option value="OR">OR</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <input
              type="text"
              value={whereCondition.field}
              onChange={(e) => setWhereCondition((prev) => ({ ...prev, field: e.target.value }))}
              placeholder="Field (e.g., age)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={whereCondition.operator}
              onChange={(e) => setWhereCondition((prev) => ({ ...prev, operator: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Operator</option>
              {OPERATORS.map((op) => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
            <input
              type="text"
              value={whereCondition.value}
              onChange={(e) => setWhereCondition((prev) => ({ ...prev, value: e.target.value }))}
              placeholder="Value (e.g., 18)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={["IS NULL", "IS NOT NULL"].includes(whereCondition.operator)}
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
              <div key={index} className="flex items-center justify-between gap-2 mb-1 bg-gray-50 p-2 rounded">
                <span className="text-sm">{`${cond.field} ${cond.operator} ${["IS NULL", "IS NOT NULL"].includes(cond.operator) ? "" : `'${cond.value}'`}`}</span>
                <button
                  onClick={() => setQuery((prev) => ({ ...prev, where: prev.where.filter((_, i) => i !== index) }))}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* GROUP BY Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">GROUP BY</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={groupByInput}
              onChange={(e) => setGroupByInput(e.target.value)}
              placeholder="Enter column (e.g., department)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addGroupBy}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              disabled={!groupByInput.trim()}
            >
              Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {query.groupBy.map((col, index) => (
              <span key={index} className="bg-gray-200 px-2 py-1 rounded-full text-sm flex items-center">
                {col}
                <button
                  onClick={() => setQuery((prev) => ({ ...prev, groupBy: prev.groupBy.filter((c) => c !== col) }))}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* HAVING Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">HAVING Conditions</label>
          <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <input
              type="text"
              value={havingCondition.field}
              onChange={(e) => setHavingCondition((prev) => ({ ...prev, field: e.target.value }))}
              placeholder="Field (e.g., COUNT(id))"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={havingCondition.operator}
              onChange={(e) => setHavingCondition((prev) => ({ ...prev, operator: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Operator</option>
              {OPERATORS.map((op) => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
            <input
              type="text"
              value={havingCondition.value}
              onChange={(e) => setHavingCondition((prev) => ({ ...prev, value: e.target.value }))}
              placeholder="Value (e.g., 5)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={["IS NULL", "IS NOT NULL"].includes(havingCondition.operator)}
            />
            <button
              onClick={addHavingCondition}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="mt-2">
            {query.having.map((cond, index) => (
              <div key={index} className="flex items-center justify-between gap-2 mb-1 bg-gray-50 p-2 rounded">
                <span className="text-sm">{`${cond.field} ${cond.operator} ${["IS NULL", "IS NOT NULL"].includes(cond.operator) ? "" : `'${cond.value}'`}`}</span>
                <button
                  onClick={() => setQuery((prev) => ({ ...prev, having: prev.having.filter((_, i) => i !== index) }))}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ORDER BY Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">ORDER BY</label>
          <input
            type="text"
            value={query.orderBy}
            onChange={(e) => setQuery((prev) => ({ ...prev, orderBy: e.target.value }))}
            placeholder="Enter column (e.g., id ASC, name DESC)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* LIMIT Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">LIMIT</label>
          <input
            type="number"
            value={query.limit}
            onChange={(e) => setQuery((prev) => ({ ...prev, limit: e.target.value }))}
            placeholder="Enter limit (e.g., 10)"
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Generated Query */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Generated Query</label>
          <pre className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-auto text-sm font-mono text-gray-800 whitespace-pre-wrap">
            {generatedQuery}
          </pre>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              onClick={() => { handleCopy(); saveToHistory(); }}
              className={`flex-1 py-2 px-4 rounded-md text-white transition-colors ${isCopied ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"} disabled:bg-gray-400 flex items-center justify-center`}
              disabled={!!validateQuery()}
            >
              <FaCopy className="mr-2" />
              {isCopied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center justify-center"
              disabled={!!validateQuery()}
            >
              <FaDownload className="mr-2" />
              Download (.sql)
            </button>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Queries (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>{entry.generated.slice(0, 50)}...</span>
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

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Build SELECT queries with multiple columns</li>
            <li>Support for INNER, LEFT, RIGHT, and FULL JOINs</li>
            <li>Flexible WHERE and HAVING conditions with AND/OR conjunctions</li>
            <li>Group results with GROUP BY and filter with HAVING</li>
            <li>Order results and limit rows</li>
            <li>Copy, download, and track query history</li>
          </ul>
        </div>
      </div>

      {/* Tailwind Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }
      `}</style>
    </div>
  );
};

export default SQLQueryBuilder;