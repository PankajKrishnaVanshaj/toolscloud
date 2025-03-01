"use client";

import React, { useState } from 'react';

const DatabaseSchemaVisualizer = () => {
  const [sqlInput, setSqlInput] = useState('');
  const [tables, setTables] = useState([]);
  const [error, setError] = useState(null);

  const parseSQLSchema = (sql) => {
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
            const foreignKeyMatch = constraints.match(/REFERENCES\s+(\w+)\s*\((\w+)\)/i);
            
            return {
              name,
              type,
              isPrimary,
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
    } catch (err) {
      setError(err.message);
      setTables([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    parseSQLSchema(sqlInput);
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Database Schema Visualizer</h2>

        {/* SQL Input Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={sqlInput}
            onChange={(e) => setSqlInput(e.target.value)}
            className="w-full h-40 p-3 border border-gray-300 rounded-md text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`Example:
CREATE TABLE users (
  id INT PRIMARY KEY,
  username VARCHAR(50),
  email VARCHAR(100)
);

CREATE TABLE orders (
  order_id INT PRIMARY KEY,
  user_id INT REFERENCES users(id),
  total DECIMAL(10,2)
);`}
            spellCheck="false"
          />
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Visualize Schema
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Visualization */}
        {tables.length > 0 && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-6">
              {tables.map((table) => (
                <div
                  key={table.name}
                  className="bg-gray-50 p-4 rounded-lg shadow-md min-w-[200px]"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-1">
                    {table.name}
                  </h3>
                  <ul className="space-y-1">
                    {table.columns.map((col) => (
                      <li
                        key={col.name}
                        className="text-sm flex items-center gap-2"
                      >
                        <span className={col.isPrimary ? 'font-bold' : ''}>
                          {col.name}
                        </span>
                        <span className="text-gray-600">{col.type}</span>
                        {col.foreignKey && (
                          <span className="text-blue-500 text-xs">
                            → {col.foreignKey.table}({col.foreignKey.column})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            {/* Simple Relationship Lines */}
            <div className="mt-4 text-sm text-gray-600">
              <h4 className="font-semibold mb-2">Relationships:</h4>
              {tables.flatMap(table => 
                table.columns
                  .filter(col => col.foreignKey)
                  .map(col => (
                    <div key={`${table.name}-${col.name}`}>
                      {table.name}.{col.name} → {col.foreignKey.table}.{col.foreignKey.column}
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {!tables.length && !error && (
          <p className="text-gray-500 italic">
            Enter SQL schema above and click "Visualize Schema" to see the diagram
          </p>
        )}
      </div>
    </div>
  );
};

export default DatabaseSchemaVisualizer;