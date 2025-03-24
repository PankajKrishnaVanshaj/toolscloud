"use client";

import React, { useState, useCallback, useRef } from "react";
import { FaDownload, FaEye, FaSync } from "react-icons/fa";
import ReactFlow, { MiniMap, Controls, Background } from "reactflow";
import "reactflow/dist/style.css";

const DatabaseSchemaVisualizer = () => {
  const [sqlInput, setSqlInput] = useState("");
  const [tables, setTables] = useState([]);
  const [error, setError] = useState(null);
  const [showDiagram, setShowDiagram] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const reactFlowWrapper = useRef(null);

  const parseSQLSchema = useCallback((sql) => {
    try {
      setError(null);
      const tableRegex = /CREATE TABLE\s+(\w+)\s*\(([\s\S]*?)\);/gi;
      const tablesArray = [];
      let match;

      while ((match = tableRegex.exec(sql)) !== null) {
        const tableName = match[1];
        const columnsDef = match[2];

        const columns = columnsDef.split(',')
          .map(col => {
            const parts = col.trim().split(/\s+/);
            const name = parts[0];
            const type = parts[1];
            const constraints = parts.slice(2).join(' ');
            
            const isPrimary = constraints.includes('PRIMARY');
            const isUnique = constraints.includes('UNIQUE');
            const foreignKeyMatch = constraints.match(/REFERENCES\s+(\w+)\s*\((\w+)\)/i);
            const isNullable = !constraints.includes('NOT NULL');

            return {
              name,
              type,
              isPrimary,
              isUnique,
              isNullable,
              foreignKey: foreignKeyMatch ? {
                table: foreignKeyMatch[1],
                column: foreignKeyMatch[2]
              } : null
            };
          });

        tablesArray.push({ name: tableName, columns });
      }

      if (tablesArray.length === 0) {
        throw new Error('No valid CREATE TABLE statements found');
      }

      setTables(tablesArray);
      generateDiagram(tablesArray);
    } catch (err) {
      setError(err.message);
      setTables([]);
      setNodes([]);
      setEdges([]);
    }
  }, []);

  const generateDiagram = (tablesArray) => {
    const newNodes = tablesArray.map((table, index) => ({
      id: table.name,
      type: 'default',
      data: {
        label: (
          <div className="p-2">
            <h3 className="font-bold text-lg mb-2">{table.name}</h3>
            <ul className="text-sm">
              {table.columns.map(col => (
                <li key={col.name} className="flex items-center gap-1">
                  <span className={col.isPrimary ? "font-bold" : ""}>{col.name}</span>
                  <span className="text-gray-500">{col.type}</span>
                  {col.isPrimary && <span className="text-yellow-500">🔑</span>}
                  {col.isUnique && <span className="text-green-500">U</span>}
                  {col.isNullable && <span className="text-gray-400">?</span>}
                </li>
              ))}
            </ul>
          </div>
        )
      },
      position: { x: index * 250, y: 0 },
    }));

    const newEdges = tablesArray.flatMap(table => 
      table.columns
        .filter(col => col.foreignKey)
        .map(col => ({
          id: `${table.name}-${col.name}-${col.foreignKey.table}`,
          source: table.name,
          target: col.foreignKey.table,
          type: 'smoothstep',
          animated: true,
          label: `${col.name} → ${col.foreignKey.column}`,
          style: { stroke: '#3b82f6' }
        }))
    );

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    parseSQLSchema(sqlInput);
  };

  const handleReset = () => {
    setSqlInput("");
    setTables([]);
    setNodes([]);
    setEdges([]);
    setError(null);
    setShowDiagram(false);
  };

  const handleDownload = () => {
    const blob = new Blob([sqlInput], { type: "text/sql" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `schema-${Date.now()}.sql`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Database Schema Visualizer</h2>

        {/* SQL Input */}
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={sqlInput}
            onChange={(e) => setSqlInput(e.target.value)}
            className="w-full h-48 sm:h-64 p-4 border border-gray-300 rounded-lg resize-y font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Example:
CREATE TABLE users (
  id INT PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  email VARCHAR(100) NOT NULL
);

CREATE TABLE orders (
  order_id INT PRIMARY KEY,
  user_id INT REFERENCES users(id),
  total DECIMAL(10,2)
);`}
            spellCheck="false"
            aria-label="SQL Schema Input"
          />
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaEye className="mr-2" /> Visualize Schema
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!sqlInput.trim()}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download SQL
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Visualization */}
        {tables.length > 0 && (
          <div className="space-y-6">
            {/* Toggle View */}
            <button
              onClick={() => setShowDiagram(!showDiagram)}
              className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {showDiagram ? "Show Table List" : "Show Diagram"}
            </button>

            {/* Table List View */}
            {!showDiagram && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tables.map((table) => (
                  <div
                    key={table.name}
                    className="bg-gray-50 p-4 rounded-lg shadow-md"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-1">
                      {table.name}
                    </h3>
                    <ul className="space-y-2 text-sm">
                      {table.columns.map((col) => (
                        <li key={col.name} className="flex items-center gap-2 flex-wrap">
                          <span className={col.isPrimary ? 'font-bold' : ''}>
                            {col.name}
                          </span>
                          <span className="text-gray-600">{col.type}</span>
                          {col.isPrimary && <span className="text-yellow-500">🔑</span>}
                          {col.isUnique && <span className="text-green-500">U</span>}
                          {col.isNullable && <span className="text-gray-400">?</span>}
                          {col.foreignKey && (
                            <span className="text-blue-500">
                              → {col.foreignKey.table}({col.foreignKey.column})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Diagram View */}
            {showDiagram && (
              <div ref={reactFlowWrapper} className="h-[500px] bg-white border border-gray-200 rounded-lg overflow-hidden">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  fitView
                  nodesDraggable={true}
                  className="bg-gray-50"
                >
                  <MiniMap />
                  <Controls />
                  <Background />
                </ReactFlow>
              </div>
            )}

            {/* Relationships */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Relationships</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {tables.flatMap(table => 
                  table.columns
                    .filter(col => col.foreignKey)
                    .map(col => (
                      <li key={`${table.name}-${col.name}`}>
                        {table.name}.{col.name} → {col.foreignKey.table}.{col.foreignKey.column}
                      </li>
                    ))
                )}
              </ul>
            </div>
          </div>
        )}

        {!tables.length && !error && (
          <p className="text-gray-500 italic text-center">
            Enter SQL schema above and click "Visualize Schema" to see the diagram
          </p>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Parse and visualize SQL CREATE TABLE statements</li>
            <li>Support for PRIMARY KEY, UNIQUE, NOT NULL, and REFERENCES</li>
            <li>Interactive diagram view with React Flow</li>
            <li>Table list view with column details</li>
            <li>Download SQL schema</li>
            <li>Toggle between list and diagram views</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSchemaVisualizer;