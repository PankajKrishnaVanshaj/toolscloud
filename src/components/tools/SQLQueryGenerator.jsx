"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaHistory, FaUndo } from "react-icons/fa";

const SQLQueryGenerator = () => {
  const [queryType, setQueryType] = useState("SELECT");
  const [tableName, setTableName] = useState("users");
  const [columns, setColumns] = useState(["*"]);
  const [conditions, setConditions] = useState([{ column: "", operator: "=", value: "" }]);
  const [joins, setJoins] = useState([{ type: "INNER", table: "", on: "" }]);
  const [orderBy, setOrderBy] = useState({ column: "", direction: "ASC" });
  const [groupBy, setGroupBy] = useState("");
  const [generatedQuery, setGeneratedQuery] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const operators = ["=", "!=", ">", "<", ">=", "<=", "LIKE", "IN", "BETWEEN"];
  const joinTypes = ["INNER", "LEFT", "RIGHT", "FULL"];

  const generateQuery = useCallback(() => {
    let query = "";

    switch (queryType) {
      case "SELECT":
        query = `SELECT ${columns.join(", ")} FROM ${tableName}`;
        if (joins[0].table) {
          const joinClause = joins
            .filter((j) => j.table && j.on)
            .map((j) => `${j.type} JOIN ${j.table} ON ${j.on}`)
            .join(" ");
          query += ` ${joinClause}`;
        }
        if (conditions[0].column) {
          const whereClause = conditions
            .filter((c) => c.column && c.value)
            .map((c) => `${c.column} ${c.operator} '${c.value}'`)
            .join(" AND ");
          if (whereClause) query += ` WHERE ${whereClause}`;
        }
        if (groupBy) query += ` GROUP BY ${groupBy}`;
        if (orderBy.column) query += ` ORDER BY ${orderBy.column} ${orderBy.direction}`;
        break;
      case "INSERT":
        query = `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`;
        break;
      case "UPDATE":
        query = `UPDATE ${tableName} SET ${columns.map((col) => `${col} = ?`).join(", ")}`;
        if (conditions[0].column) {
          const whereClause = conditions
            .filter((c) => c.column && c.value)
            .map((c) => `${c.column} ${c.operator} '${c.value}'`)
            .join(" AND ");
          if (whereClause) query += ` WHERE ${whereClause}`;
        }
        break;
      case "DELETE":
        query = `DELETE FROM ${tableName}`;
        if (conditions[0].column) {
          const whereClause = conditions
            .filter((c) => c.column && c.value)
            .map((c) => `${c.column} ${c.operator} '${c.value}'`)
            .join(" AND ");
          if (whereClause) query += ` WHERE ${whereClause}`;
        }
        break;
      default:
        query = "";
    }

    const finalQuery = `${query};`;
    setGeneratedQuery(finalQuery);
    setHistory((prev) => [
      ...prev,
      { query: finalQuery, type: queryType, table: tableName, columns, conditions, joins, orderBy, groupBy },
    ].slice(-5));
    setIsCopied(false);
  }, [queryType, tableName, columns, conditions, joins, orderBy, groupBy]);

  // Column Management
  const addColumn = () => setColumns([...columns, ""]);
  const updateColumn = (index, value) => {
    const newColumns = [...columns];
    newColumns[index] = value;
    setColumns(newColumns);
  };
  const removeColumn = (index) => {
    if (columns.length > 1 || (queryType === "SELECT" && columns[0] !== "*")) {
      setColumns(columns.filter((_, i) => i !== index));
    }
  };

  // Condition Management
  const addCondition = () => setConditions([...conditions, { column: "", operator: "=", value: "" }]);
  const updateCondition = (index, field, value) => {
    const newConditions = [...conditions];
    newConditions[index][field] = value;
    setConditions(newConditions);
  };
  const removeCondition = (index) => {
    if (conditions.length > 1) setConditions(conditions.filter((_, i) => i !== index));
  };

  // Join Management
  const addJoin = () => setJoins([...joins, { type: "INNER", table: "", on: "" }]);
  const updateJoin = (index, field, value) => {
    const newJoins = [...joins];
    newJoins[index][field] = value;
    setJoins(newJoins);
  };
  const removeJoin = (index) => {
    if (joins.length > 1) setJoins(joins.filter((_, i) => i !== index));
  };

  // Copy and Clear
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(generatedQuery)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const clearQuery = () => {
    setGeneratedQuery("");
    setColumns(queryType === "SELECT" ? ["*"] : ["id"]);
    setConditions([{ column: "", operator: "=", value: "" }]);
    setJoins([{ type: "INNER", table: "", on: "" }]);
    setOrderBy({ column: "", direction: "ASC" });
    setGroupBy("");
    setIsCopied(false);
  };

  // Restore from History
  const restoreFromHistory = (entry) => {
    setQueryType(entry.type);
    setTableName(entry.table);
    setColumns(entry.columns);
    setConditions(entry.conditions);
    setJoins(entry.joins);
    setOrderBy(entry.orderBy);
    setGroupBy(entry.groupBy);
    setGeneratedQuery(entry.query);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced SQL Query Generator
        </h1>

        <div className="space-y-6">
          {/* Query Type and Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Query Type</label>
              <select
                value={queryType}
                onChange={(e) => {
                  setQueryType(e.target.value);
                  if (e.target.value !== "SELECT") setColumns(["id"]);
                  else setColumns(["*"]);
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="SELECT">SELECT</option>
                <option value="INSERT">INSERT</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Table Name</label>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter table name"
              />
            </div>
          </div>

          {/* Columns */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Columns</label>
            {columns.map((col, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={col}
                  onChange={(e) => updateColumn(index, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Column name"
                  disabled={queryType === "SELECT" && index === 0 && col === "*"}
                />
                {(columns.length > 1 || (queryType === "SELECT" && col !== "*")) && (
                  <button
                    onClick={() => removeColumn(index)}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    X
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addColumn}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              + Add Column
            </button>
          </div>

          {/* Conditions */}
          {(queryType === "SELECT" || queryType === "UPDATE" || queryType === "DELETE") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Conditions</label>
              {conditions.map((cond, index) => (
                <div key={index} className="flex gap-2 mb-2 items-center flex-wrap">
                  <input
                    type="text"
                    value={cond.column}
                    onChange={(e) => updateCondition(index, "column", e.target.value)}
                    className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Column"
                  />
                  <select
                    value={cond.operator}
                    onChange={(e) => updateCondition(index, "operator", e.target.value)}
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {operators.map((op) => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={cond.value}
                    onChange={(e) => updateCondition(index, "value", e.target.value)}
                    className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Value"
                  />
                  {conditions.length > 1 && (
                    <button
                      onClick={() => removeCondition(index)}
                      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                      X
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addCondition}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                + Add Condition
              </button>
            </div>
          )}

          {/* Joins (SELECT only) */}
          {queryType === "SELECT" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Joins</label>
              {joins.map((join, index) => (
                <div key={index} className="flex gap-2 mb-2 items-center flex-wrap">
                  <select
                    value={join.type}
                    onChange={(e) => updateJoin(index, "type", e.target.value)}
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {joinTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={join.table}
                    onChange={(e) => updateJoin(index, "table", e.target.value)}
                    className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Table"
                  />
                  <input
                    type="text"
                    value={join.on}
                    onChange={(e) => updateJoin(index, "on", e.target.value)}
                    className="flex-1 min-w-[120px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ON condition (e.g., users.id = orders.user_id)"
                  />
                  {joins.length > 1 && (
                    <button
                      onClick={() => removeJoin(index)}
                      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                      X
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addJoin}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                + Add Join
              </button>
            </div>
          )}

          {/* Order By and Group By (SELECT only) */}
          {queryType === "SELECT" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order By</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={orderBy.column}
                    onChange={(e) => setOrderBy({ ...orderBy, column: e.target.value })}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Column"
                  />
                  <select
                    value={orderBy.direction}
                    onChange={(e) => setOrderBy({ ...orderBy, direction: e.target.value })}
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ASC">ASC</option>
                    <option value="DESC">DESC</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group By</label>
                <input
                  type="text"
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Column"
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateQuery}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Generate Query
            </button>
            {generatedQuery && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isCopied
                      ? "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                      : "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500"
                  } flex items-center justify-center`}
                >
                  <FaCopy className="mr-2" />
                  {isCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={clearQuery}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>

          {/* Generated Query */}
          {generatedQuery && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Generated SQL Query:</h2>
              <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap break-words">
                {generatedQuery}
              </pre>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold text-gray-700 flex items-center">
                <FaHistory className="mr-2" /> Recent Queries (Last 5)
              </h3>
              <ul className="mt-2 text-sm text-gray-600 space-y-2">
                {history.slice().reverse().map((entry, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>{entry.query.slice(0, 30)}... ({entry.type})</span>
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
              <li>Generate SELECT, INSERT, UPDATE, DELETE queries</li>
              <li>Support for JOINs, ORDER BY, and GROUP BY (SELECT only)</li>
              <li>Multiple conditions with various operators</li>
              <li>Copy and track recent queries</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SQLQueryGenerator;